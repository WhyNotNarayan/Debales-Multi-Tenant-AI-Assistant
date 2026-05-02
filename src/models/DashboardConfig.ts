import mongoose, { Schema, model, models } from 'mongoose';

const DashboardConfigSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  sections: [{
    title: { type: String, required: true },
    widgets: [{ type: String }] // widget IDs like 'usersCount', 'revenueWidget'
  }],
}, { timestamps: true });

export const DashboardConfig = models.DashboardConfig || model('DashboardConfig', DashboardConfigSchema);
