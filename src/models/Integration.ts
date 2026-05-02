import mongoose, { Schema, model, models } from 'mongoose';

const IntegrationSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  shopifyEnabled: { type: Boolean, default: false },
  crmEnabled: { type: Boolean, default: false },
}, { timestamps: true });

export const Integration = models.Integration || model('Integration', IntegrationSchema);
