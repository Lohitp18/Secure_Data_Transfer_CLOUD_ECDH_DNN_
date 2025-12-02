import mongoose from 'mongoose'

const transferSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    status: { type: String, enum: ['queued', 'uploading', 'completed', 'failed', 'suspicious'], default: 'queued' },
    progress: { type: Number, default: 0 },
    encryption_method: { type: String, default: 'AES-GCM' },
    entropy_features: { type: Object },
    ids_result: { type: Object },
  },
  { timestamps: true }
)

export default mongoose.model('Transfer', transferSchema)
