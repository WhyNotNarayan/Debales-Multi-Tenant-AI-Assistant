import mongoose, { Schema, model, models } from 'mongoose';

const ConversationSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  productInstanceId: { type: Schema.Types.ObjectId, ref: 'ProductInstance', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Conversation' },
}, { timestamps: true });

export const Conversation = models.Conversation || model('Conversation', ConversationSchema);
