const mongoose = require('mongoose');
const slugify = require('slugify');

const GuideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: '/images/default-thumbnail.jpg'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  published: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  contentBlocks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContentBlock'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create slug from title before saving
GuideSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  
  if (this.isModified('title') || this.isModified('description') || 
      this.isModified('contentBlocks') || this.isModified('published') || 
      this.isModified('tags')) {
    this.updatedAt = Date.now();
  }
  
  next();
});

module.exports = mongoose.model('Guide', GuideSchema); 