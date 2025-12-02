import mongoose from 'mongoose'

const connectionLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
    handshake_type: { type: String, default: 'X25519' },
    details: { type: String },
    metadata: { type: Object },
  },
  { timestamps: true }
)

export default mongoose.model('ConnectionLog', connectionLogSchema)
