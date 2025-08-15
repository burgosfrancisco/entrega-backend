import { Schema, model } from 'mongoose';

const ProductSchema = new Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  code: { type: String, required: true, unique: true },
  price: { type: Number, required: true, index: true },
  status: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  category: { type: String, index: true },
  thumbnails: { type: [String], default: [] }
}, { timestamps: true });

export default model('Product', ProductSchema);
