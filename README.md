# Debales Multi-Tenant AI Assistant

A production-style SaaS platform featuring multi-tenancy, AI-powered chat, and a config-driven admin dashboard.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, TanStack Query, Framer Motion
- **Backend**: Next.js Route Handlers, Zod, MongoDB, Mongoose
- **AI**: Google Gemini API

## Key Features
- **Multi-Tenancy**: Strict data isolation between projects/tenants.
- **AI Chat**: Integration-aware assistant that knows if Shopify/CRM data is accessible.
- **Dynamic Dashboard**: Layout and widgets controlled entirely via MongoDB.
- **Role-Based Access**: Separate interfaces for Admins and Members.

## Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB Atlas account

### 2. Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MONGODB_URI and GEMINI_API_KEY
```

### 3. Database Seeding
```bash
# Run the seed script to create demo users and projects
npm run seed
```

### 4. Running the App
```bash
npm run dev
```

## Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@debales.com` | `admin123` |
| **Member** | `member@debales.com` | `member123` |

## Project Structure
- `src/app`: Next.js 15 App Router pages and API routes.
- `src/components`: UI components (Button, Input, Card, etc.).
- `src/lib`: Core utilities (MongoDB, Auth, Gemini).
- `src/models`: Mongoose schemas for Users, Projects, Chats, etc.
- `scripts`: Seeding scripts for initial setup.

## Multi-Tenant Logic
Every request is scoped using the `projectId` and `userId` extracted from the session cookie. The `canAccessProject` helper ensures that users can only view or interact with data belonging to their assigned tenant.

## Dashboard Configuration
The Admin Dashboard layout is stored in MongoDB:
```json
{
  "projectId": "...",
  "sections": [
    {
      "title": "Growth",
      "widgets": ["usersCount", "conversationCount"]
    }
  ]
}
```
Adding or reordering widgets in the database will automatically reflect in the UI without any code changes.
