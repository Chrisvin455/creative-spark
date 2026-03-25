const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// @route   GET api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/categories
// @desc    Add a category (Admin only conceptually, but public for demo)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, slug, color_key, icon } = req.body;
    const newCategory = new Category({ name, slug, color_key, icon });
    const category = await newCategory.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
