import multer from 'multer';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new Error('Format non autorisé. Utilise JPG, PNG, WEBP ou AVIF.'));
    }
    callback(null, true);
  }
});
