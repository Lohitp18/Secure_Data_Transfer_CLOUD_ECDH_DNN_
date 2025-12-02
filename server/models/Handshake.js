import mongoose from 'mongoose'

const handshakeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    clientPublicKeyB64: { type: String, required: true },
    serverPublicKeyB64: { type: String, required: true },
    serverSecretKeyB64: { type: String, required: true },
    sharedSecretB64: { type: String },
    sessionKeyB64: { type: String },
    verified: { type: Boolean, default: false },
    status: { 
      type: String, 
      enum: ['initiated', 'completed', 'suspicious', 'failed'], 
      default: 'initiated' 
    },
    idsResult: { type: Object },
    completedAt: { type: Date },
    metadata: { type: Object },
  },
  { timestamps: true }
)

export default mongoose.model('Handshake', handshakeSchema)
