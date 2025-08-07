const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  story: {
    type: String,
    required: true,
    maxlength: 6000
  },
  thumbnail: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  videos: [{
    type: String
  }],
  techStack: [{
    type: String,
    trim: true
  }],
  githubUrl: {
    type: String,
    default: ''
  },
  liveUrl: {
    type: String,
    default: ''
  },
  figmaUrl: {
    type: String,
    default: ''
  },
  youtubeUrl: {
    type: String,
    default: ''
  },
  otherLinks: [{
    title: String,
    url: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
projectSchema.index({ author: 1, createdAt: -1 });
projectSchema.index({ likes: 1 });
projectSchema.index({ isPublic: 1, createdAt: -1 });

// Virtual for like count
projectSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
projectSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Ensure virtuals are serialized
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema); 