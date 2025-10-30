const mongoose = require('mongoose');

const goalSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    targetAmount: {
      type: Number,
      required: true,
    },
    savedAmount: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: ['savings', 'investment', 'purchase', 'education', 'travel', 'emergency', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field for progress percentage
goalSchema.virtual('progress').get(function() {
  return (this.savedAmount / this.targetAmount) * 100;
});

module.exports = mongoose.model('Goal', goalSchema);
