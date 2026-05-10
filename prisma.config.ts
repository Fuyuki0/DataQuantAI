// ═══════════════════════════════════════════
// DataQuantAI — Prisma 7 Config
// ═══════════════════════════════════════════

import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load .env.local so the Prisma CLI can see DATABASE_URL
dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
