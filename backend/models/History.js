const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true },
  viewed_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', HistorySchema);
