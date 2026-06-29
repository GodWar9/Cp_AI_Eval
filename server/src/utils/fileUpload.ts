import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10);

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename to avoid collisions
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});

const allowedMimeTypes = [
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'application/javascript',
  'text/javascript',
  'text/html',
  'text/css',
  'text/x-python',
  'application/x-python-code',
  'text/x-c',
  'text/x-c++',
  'text/x-java-source',
];

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow text-based code files
  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(txt|md|csv|json|js|ts|jsx|tsx|py|c|cpp|h|hpp|java|go|rs|rb|php)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only code, text, and data files are allowed.'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, // MB to Bytes
  },
  fileFilter,
});
