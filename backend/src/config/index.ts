import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isTest: process.env.NODE_ENV === 'test',
  databasePath: process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'leads.db'),
  auth: {
    enabled: process.env.BASIC_AUTH_ENABLED === 'true',
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
};
