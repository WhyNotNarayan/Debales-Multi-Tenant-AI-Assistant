import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { Project } from '../src/models/Project';
import { ProductInstance } from '../src/models/ProductInstance';
import { Integration } from '../src/models/Integration';
import { DashboardConfig } from '../src/models/DashboardConfig';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: Please define the MONGODB_URI environment variable in .env.local');
  process.exit(1);
}

async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected');

    // Clear existing data
    console.log('🧹 Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      ProductInstance.deleteMany({}),
      Integration.deleteMany({}),
      DashboardConfig.deleteMany({}),
    ]);

    // 1. Create Projects
    const acmeProject = await Project.create({
      name: 'Acme Sales',
      slug: 'acme-sales',
    });

    const novaProject = await Project.create({
      name: 'Nova CRM',
      slug: 'nova-crm',
    });

    // 2. Create Users
    const adminUser = await User.create({
      name: 'Debales Admin',
      email: 'admin@debales.com',
      password: 'admin123',
      role: 'ADMIN',
      projectId: acmeProject._id,
    });

    await User.create({
      name: 'Sales Member',
      email: 'member@debales.com',
      password: 'member123',
      role: 'MEMBER',
      projectId: acmeProject._id,
    });

    // 3. Create Product Instances
    const salesAssistant = await ProductInstance.create({
      projectId: acmeProject._id,
      name: 'Sales AI',
      namespace: 'sales',
      productType: 'AI_CHAT',
    });

    await ProductInstance.create({
      projectId: acmeProject._id,
      name: 'CRM AI',
      namespace: 'crm',
      productType: 'AI_CHAT',
    });

    // 4. Create Integrations
    await Integration.create({
      projectId: acmeProject._id,
      shopifyEnabled: true,
      crmEnabled: false,
    });

    // 5. Create Dashboard Config
    await DashboardConfig.create({
      projectId: acmeProject._id,
      sections: [
        {
          title: 'Growth Overview',
          widgets: ['usersCount', 'conversationCount'],
        },
        {
          title: 'System Health & Connectors',
          widgets: ['shopifyStatus', 'crmStatus'],
        },
      ],
    });

    console.log('✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
