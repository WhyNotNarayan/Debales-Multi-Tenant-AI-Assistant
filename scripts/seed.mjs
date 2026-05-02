import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { Project } from '../src/models/Project.js';
import { ProductInstance } from '../src/models/ProductInstance.js';
import { Integration } from '../src/models/Integration.js';
import { DashboardConfig } from '../src/models/DashboardConfig.js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
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

    console.log('Created Projects');

    // 2. Create Users
    const adminUser = await User.create({
      name: 'Debales Admin',
      email: 'admin@debales.com',
      password: 'admin123', // In real app, hash this
      role: 'ADMIN',
      projectId: acmeProject._id,
    });

    const memberUser = await User.create({
      name: 'Sales Member',
      email: 'member@debales.com',
      password: 'member123',
      role: 'MEMBER',
      projectId: acmeProject._id,
    });

    console.log('Created Users');

    // 3. Create Product Instances
    await ProductInstance.create([
      {
        projectId: acmeProject._id,
        name: 'AI Sales Assistant',
        namespace: 'sales',
        productType: 'AI_CHAT',
      },
      {
        projectId: acmeProject._id,
        name: 'Customer Support Assistant',
        namespace: 'support',
        productType: 'AI_CHAT',
      }
    ]);

    console.log('Created Product Instances');

    // 4. Create Integrations
    await Integration.create({
      projectId: acmeProject._id,
      shopifyEnabled: true,
      crmEnabled: false,
    });

    console.log('Created Integrations');

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

    console.log('Created Dashboard Config');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
