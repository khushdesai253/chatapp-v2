const express = require('express');
const router = express.Router();
const User = require('../models/User');
const upload = require('../middleware/upload');

// GET /api/users - Search users
router.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    let filter = {};
    if (query) {
      filter = {
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } }
        ]
      };
    }
    const users = await User.find(filter).select('-password').limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/profile - Update profile details
router.put('/profile', async (req, res) => {
  try {
    const { userId, name, username, bio, location, website } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) return res.status(400).json({ error: 'Username already taken' });
      user.username = username;
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    
    if (!user.personalDetails) {
      user.personalDetails = {};
    }
    if (location !== undefined) user.personalDetails.location = location;
    if (website !== undefined) user.personalDetails.website = website;

    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      personalDetails: user.personalDetails,
      preferences: user.preferences
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/preferences - Update sound and theme settings
router.put('/preferences', async (req, res) => {
  try {
    const { userId, soundEnabled, theme } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (soundEnabled !== undefined) user.preferences.soundEnabled = soundEnabled;
    if (theme !== undefined) user.preferences.theme = theme;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/dp - Upload avatar
router.put('/dp', (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ error: 'File upload error', details: err.message || err });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    user.avatarUrl = `${baseUrl}/uploads/${req.file.filename}`;
    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      personalDetails: user.personalDetails,
      preferences: user.preferences
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/sound - Upload custom notification sound
router.put('/sound', (req, res, next) => {
  upload.single('sound')(req, res, (err) => {
    if (err) {
      console.error('Multer sound upload error:', err);
      return res.status(400).json({ error: 'Sound upload error', details: err.message || err });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    if (!user.preferences) user.preferences = {};
    user.preferences.customSoundUrl = `${baseUrl}/uploads/${req.file.filename}`;
    await user.save();
    
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      personalDetails: user.personalDetails,
      preferences: user.preferences
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:id/mute - Toggle mute status for a conversation
router.post('/:id/mute', async (req, res) => {
  try {
    const { conversationId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const index = user.mutedChats.indexOf(conversationId);
    if (index === -1) {
      user.mutedChats.push(conversationId);
    } else {
      user.mutedChats.splice(index, 1);
    }
    
    await user.save();
    res.json({ mutedChats: user.mutedChats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/block/:id - Toggle block status for a user
router.post('/block/:id', async (req, res) => {
  try {
    const { blockUserId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const index = user.blockedUsers.indexOf(blockUserId);
    if (index === -1) {
      user.blockedUsers.push(blockUserId);
    } else {
      user.blockedUsers.splice(index, 1);
    }
    
    await user.save();
    res.json({ blockedUsers: user.blockedUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
