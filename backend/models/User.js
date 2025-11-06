import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastPlayed: {
    type: Date,
    default: Date.now,
  },
  totalGamesPlayed: {
    type: Number,
    default: 0,
  },
  achievements: [{
    type: String,
  }],
});

userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);
