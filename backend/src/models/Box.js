import mongoose from 'mongoose';

const boxSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box',
    default: null
  },
  color: {
    type: String,
    default: '#388bfd'
  },
  order: {
    type: Number,
    default: 0
  },
  ownerId: {
    type: String,
    required: true,
    index: true
  }
}, { timestamps: true });

boxSchema.index({ parentId: 1, ownerId: 1 });
boxSchema.index({ order: 1 });

export default mongoose.model('Box', boxSchema);
