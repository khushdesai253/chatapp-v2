const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// POST /api/media/upload - Accept any chat attachment
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // Cloudinary returns resource_type and secure_url
    // Multer-storage-cloudinary populates req.file with these details
    res.json({
      success: true,
      mediaUrl: req.file.path, // The secure URL
      fileType: req.file.mimetype,
      cloudinaryId: req.file.filename
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
