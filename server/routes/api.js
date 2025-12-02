import express from 'express'
import multer from 'multer'
import { requireAuth } from '../middleware/auth.js'
import { initHandshake } from '../Handshakes/initHandshake.js'
import { validateHandshake } from '../Handshakes/validateHandshake.js'
import { getEntropyFeatures } from '../utils/entropy.js'
import { callIDS } from '../utils/ids.js'
import Handshake from '../models/Handshake.js'
import Alert from '../models/Alert.js'
import Transfer from '../models/Transfer.js'
import ConnectionLog from '../models/ConnectionLog.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Alerts
router.get('/alerts', requireAuth, async (req, res) => {
  const alerts = await Alert.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(100)
  res.json(alerts.map(a => ({
    id: a._id.toString(),
    user_id: a.userId?.toString(),
    severity: a.severity,
    threat_type: a.threat_type,
    confidence: a.confidence,
    source_ip: a.source_ip,
    created_at: a.createdAt,
    resolved: a.resolved,
    ml_score: a.ml_score,
    details: a.details,
  })))
})

router.get('/alerts/:id', requireAuth, async (req, res) => {
  const a = await Alert.findOne({ _id: req.params.id, userId: req.user.id })
  if (!a) return res.status(404).json({ error: 'Not found' })
  res.json({
    id: a._id.toString(),
    user_id: a.userId?.toString(),
    severity: a.severity,
    threat_type: a.threat_type,
    confidence: a.confidence,
    source_ip: a.source_ip,
    created_at: a.createdAt,
    resolved: a.resolved,
    ml_score: a.ml_score,
    details: a.details,
  })
})

router.patch('/alerts/:id/resolve', requireAuth, async (req, res) => {
  await Alert.updateOne({ _id: req.params.id, userId: req.user.id }, { $set: { resolved: true } })
  res.json({ ok: true })
})

// Connection logs
router.get('/logs/connections', requireAuth, async (req, res) => {
  const logs = await ConnectionLog.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(100)
  res.json(logs.map(l => ({
    id: l._id.toString(),
    user_id: l.userId?.toString(),
    status: l.status,
    handshake_type: l.handshake_type,
    created_at: l.createdAt,
    details: l.details,
  })))
})

// Transfer logs
router.get('/logs/transfers', requireAuth, async (req, res) => {
  const transfers = await Transfer.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(100)
  res.json(transfers.map(t => ({
    id: t._id.toString(),
    user_id: t.userId?.toString(),
    filename: t.filename,
    size: t.size,
    status: t.status,
    progress: t.progress,
    encryption_method: t.encryption_method,
    created_at: t.createdAt,
  })))
})

// File upload with IDS analysis (persist)
const uploadHandler = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' })
  
  try {
    const entropyFeatures = getEntropyFeatures(req.file.buffer)
    const fileFeatures = {
      file_size: req.file.size,
      file_entropy: entropyFeatures.entropy,
      file_type_risk: 0.2,
      encryption_strength: 256,
      upload_duration: 1.0,
      compression_ratio: entropyFeatures.entropy_ratio,
      metadata_anomaly: entropyFeatures.entropy_variance,
      transfer_speed: req.file.size / 1000,
      packet_loss: 0.0,
      concurrent_uploads: 1
    }
    let idsResult = { anomaly_score: 0.1, verdict: 'normal' }
    try {
      idsResult = await callIDS('/predict/file', fileFeatures)
    } catch (idsError) {
      console.warn('IDS file analysis failed:', idsError.message)
    }

    const status = idsResult.verdict === 'suspicious' ? 'suspicious' : 'completed'
    const doc = await Transfer.create({
      userId: req.user.id,
      filename: req.file.originalname,
      size: req.file.size,
      status,
      progress: 100,
      encryption_method: 'AES-GCM',
      entropy_features: entropyFeatures,
      ids_result: idsResult,
    })

    if (idsResult.verdict === 'suspicious') {
      await Alert.create({
        userId: req.user.id,
        severity: 'high',
        threat_type: 'SuspiciousFile',
        confidence: idsResult.anomaly_score || 0,
        source_ip: req.ip,
        ml_score: idsResult.anomaly_score || 0,
        details: { ids: idsResult, filename: req.file.originalname }
      })
    }

    res.json({
      id: doc._id.toString(),
      user_id: doc.userId?.toString(),
      filename: doc.filename,
      size: doc.size,
      status: idsResult.verdict === 'suspicious' ? 'suspicious' : 'normal',
      details: idsResult,
      progress: 100,
      encryption_method: 'AES-GCM',
      created_at: doc.createdAt,
    })
  } catch (error) {
    console.error('File upload error:', error)
    res.status(500).json({ error: 'File upload failed' })
  }
}

router.post('/files/upload', requireAuth, upload.single('file'), uploadHandler)
router.post('/upload', requireAuth, upload.single('file'), uploadHandler)

// Handshake endpoints (also log connections)
router.post('/handshake/init', requireAuth, async (req, res, next) => {
  try {
    await ConnectionLog.create({ userId: req.user.id, status: 'pending', handshake_type: 'X25519', details: 'Handshake initialization' })
  } catch (err) {
    console.error('Failed to create connection log:', err)
  }
  return initHandshake(req, res, next)
})

router.post('/handshake/validate', requireAuth, async (req, res) => {
  try {
    await validateHandshake(req, res)
    // Log will be created inside validateHandshake after successful validation
  } catch (error) {
    // Create failed log on error
    try {
      await ConnectionLog.create({ 
        userId: req.user.id, 
        status: 'failed', 
        handshake_type: 'X25519', 
        details: 'Handshake validation error: ' + error.message 
      })
    } catch (logErr) {
      console.error('Failed to create connection log:', logErr)
    }
  }
})

// Legacy endpoints for backward compatibility
router.post('/handshake', requireAuth, initHandshake)
router.post('/handshake/verify', requireAuth, validateHandshake)

export default router
