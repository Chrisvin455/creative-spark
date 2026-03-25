const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true }
}, { timestamps: true });

// Ensure a user can only favorite a specific prompt once
FavoriteSchema.index({ user_id: 1, prompt_id: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
