/**
 * Upload Middleware
 * 
 * Provides safe file upload processing and destination path routing to /uploads.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function handleFileUpload(req, res, next) {
  // Pass-through or multipart header parser
  req.uploadDir = UPLOAD_DIR;
  next();
}

export default handleFileUpload;
