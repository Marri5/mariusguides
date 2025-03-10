const mongoose = require('mongoose');

const ContentBlockSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'code', 'markdown', 'embeddedContent'],
    required: true
  },
  content: {
    type: String,
    required: function() {
      return ['text', 'code', 'markdown', 'embeddedContent'].includes(this.type);
    }
  },
  mediaUrl: {
    type: String,
    required: function() {
      return ['image', 'video'].includes(this.type);
    }
  },
  position: {
    type: Number,
    default: 0
  },
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp if content is modified
ContentBlockSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('content') || 
      this.isModified('mediaUrl') || this.isModified('type') || 
      this.isModified('position')) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('ContentBlock', ContentBlockSchema); 