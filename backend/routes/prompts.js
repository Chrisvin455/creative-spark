const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');

// @route   GET api/prompts
// @desc    Get all prompts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const prompts = await Prompt.find().populate('category_id', 'name slug color_key icon').sort({ createdAt: -1 });
    
    // Map populated category_id back to 'categories' to match the frontend expectations
    const formattedPrompts = prompts.map(p => ({
      id: p._id,
      text: p.text,
      category_id: p.category_id?._id,
      categories: p.category_id ? {
        name: p.category_id.name,
        slug: p.category_id.slug,
        color_key: p.category_id.color_key,
        icon: p.category_id.icon
      } : null,
      created_at: p.createdAt
    }));

    res.json(formattedPrompts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/prompts
// @desc    Add a new prompt
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { text, category_id } = req.body;
    const newPrompt = new Prompt({ text, category_id });
    const prompt = await newPrompt.save();
    res.json(prompt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
