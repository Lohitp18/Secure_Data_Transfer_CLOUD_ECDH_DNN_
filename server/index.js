import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import http from 'http'
import { WebSocketServer } from 'ws'

import authRouter from './routes/auth.js'
import apiRouter from './routes/api.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

const PORT = process.env.PORT || 5000
const MONGO_URL = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-transfer'

mongoose
  .connect(MONGO_URL)
  .then(() => console.log(`MongoDB connected to ${MONGO_URL.includes('localhost') ? 'local MongoDB' : 'remote MongoDB'}`))
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    console.log('Attempting to connect to local MongoDB...')
    mongoose
      .connect('mongodb://localhost:27017/secure-transfer')
      .then(() => console.log('MongoDB connected to local instance'))
      .catch((localErr) => {
        console.error('Local MongoDB connection also failed:', localErr)
        console.log('Please ensure MongoDB is running locally or update MONGO_URL in .env')
      })
  })

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRouter)
app.use('/api', apiRouter)

const server = http.createServer(app)

const wss = new WebSocketServer({ server, path: '/api/ws' })
app.set('wss', wss)

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'welcome', payload: 'connected' }))
})

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
