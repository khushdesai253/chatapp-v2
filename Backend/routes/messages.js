const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// DELETE /api/messages/:messageId - Soft-delete a specific message
router.delete('/:messageId', async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    message.isDeleted = true;
    message.content = '';
    message.mediaUrl = '';
    await message.save();

    res.json({ success: true, message: 'Message deleted successfully', data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
