const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 160,
    default: ''
  },
  personalDetails: {
    location: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  preferences: {
    soundEnabled: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      default: 'light'
    },
    customSoundUrl: {
      type: String,
      default: ''
    }
  },
  mutedChats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
