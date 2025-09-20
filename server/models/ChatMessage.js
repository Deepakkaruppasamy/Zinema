import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  sender: {
    userId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: false
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: false
  },
  movieTitle: {
    type: String,
    required: false
  },
  messageType: {
    type: String,
    enum: ['text', 'movie_mention', 'spoiler', 'question'],
    default: 'text'
  },
  isSpoiler: {
    type: Boolean,
    default: false
  },
  likes: [{
    userId: String,
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    content: String,
    sender: {
      userId: String,
      name: String,
      avatar: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatMessageSchema.index({ createdAt: -1 });
chatMessageSchema.index({ 'sender.userId': 1 });
chatMessageSchema.index({ movieId: 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
