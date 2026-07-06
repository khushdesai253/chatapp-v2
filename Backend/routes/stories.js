const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const upload = require('../middleware/upload');

// GET /api/stories - Fetch active stories from the last 24 hours
router.get('/', async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stories = await Story.find({ createdAt: { $gte: twentyFourHoursAgo } })
      .populate('userId', 'username avatarUrl')
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stories - Upload a new story
router.post('/', upload.single('media'), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No media file uploaded' });

    const newStory = new Story({
      userId,
      mediaUrl: req.file.path
    });

    await newStory.save();
    res.status(201).json(newStory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
