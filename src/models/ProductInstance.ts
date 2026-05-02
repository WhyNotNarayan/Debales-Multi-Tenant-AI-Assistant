import mongoose, { Schema, model, models } from 'mongoose';

const ProductInstanceSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  namespace: { type: String, required: true }, // e.g., 'sales', 'support'
  productType: { type: String, required: true },
}, { timestamps: true });

export const ProductInstance = models.ProductInstance || model('ProductInstance', ProductInstanceSchema);
