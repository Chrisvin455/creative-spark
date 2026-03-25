const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  color_key: { type: String, default: 'fiction' },
  icon: { type: String, default: 'book' }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
