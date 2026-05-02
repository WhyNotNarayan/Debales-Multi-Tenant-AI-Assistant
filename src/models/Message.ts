import mongoose, { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

export const Message = models.Message || model('Message', MessageSchema);
