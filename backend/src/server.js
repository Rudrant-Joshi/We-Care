/**
 * Server Entrypoint
 */

import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import db from './config/database.config.js';
import logger from './utils/logger.util.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await db.connect();
    
    app.listen(PORT, () => {
      logger.info(`[Server] WeCare Health API listening on port ${PORT}`);
      logger.info(`[Server] Health check endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('[Server] Failed to bootstrap application:', error);
    process.exit(1);
  }
}

bootstrap();
