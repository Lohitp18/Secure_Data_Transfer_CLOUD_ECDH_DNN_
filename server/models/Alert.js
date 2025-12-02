import mongoose from 'mongoose'

const alertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    threat_type: { type: String, required: true },
    confidence: { type: Number, default: 0 },
    source_ip: { type: String },
    resolved: { type: Boolean, default: false },
    ml_score: { type: Number, default: 0 },
    details: { type: Object },
  },
  { timestamps: true }
)

export default mongoose.model('Alert', alertSchema)
