import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  code: { type: String, required: true, unique: true },
  price: { type: Number, required: true, index: true },
  status: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  category: { type: String, index: true },
  thumbnails: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
