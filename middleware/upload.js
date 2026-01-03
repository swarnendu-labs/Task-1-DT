const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    
    const filename = `event-${timestamp}-${randomNum}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|webp/;
  const allowedMimes = /image\/(jpeg|jpg|png|gif|webp)/;
  
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidExt = allowedExtensions.test(ext.substring(1));
  const isValidMime = allowedMimes.test(file.mimetype);

  if (isValidMime && isValidExt) {
    return cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) allowed');
    error.code = 'INVALID_FILE_TYPE';
    cb(error);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: fileFilter
});

upload.handleError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large', 
        message: 'Maximum file size is 5MB' 
      });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

module.exports = upload;
