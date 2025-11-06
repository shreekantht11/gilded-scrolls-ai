import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    index: true,
  },
  saveId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  character: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    class: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },
    health: {
      type: Number,
      default: 100,
      min: 0,
    },
    maxHealth: {
      type: Number,
      default: 100,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    gold: {
      type: Number,
      default: 0,
      min: 0,
    },
    stats: {
      strength: { type: Number, default: 10 },
      intelligence: { type: Number, default: 10 },
      wisdom: { type: Number, default: 10 },
      dexterity: { type: Number, default: 10 },
      constitution: { type: Number, default: 10 },
      charisma: { type: Number, default: 10 },
    },
  },
  genre: {
    type: String,
    required: true,
    enum: ['fantasy', 'sci-fi', 'mystery', 'horror', 'western', 'cyberpunk'],
  },
  events: [{
    id: String,
    text: String,
    choices: [String],
    timestamp: { type: Date, default: Date.now },
    playerChoice: String,
  }],
  inventory: [{
    id: String,
    name: String,
    type: String,
    effect: String,
    quantity: { type: Number, default: 1 },
  }],
  activeQuests: [{
    id: String,
    title: String,
    description: String,
    objectives: [String],
    progress: Number,
    rewards: mongoose.Schema.Types.Mixed,
  }],
  completedQuests: [String],
  currentLocation: {
    type: String,
    default: 'starting_village',
  },
  discoveredLocations: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

storySchema.index({ playerId: 1, updatedAt: -1 });
storySchema.index({ saveId: 1 });

storySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Story', storySchema);
