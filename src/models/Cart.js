import { Schema, model, Types } from 'mongoose';

const CartSchema = new Schema({
  products: [{
    product: { type: Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 }
  }]
}, { timestamps: true });

export default model('Cart', CartSchema);
