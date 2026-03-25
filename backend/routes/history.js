const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const History = require('../models/History');

// @route   GET api/history
// @desc    Get user's history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const history = await History.find({ user_id: req.user.id })
      .populate('prompt_id')
      .sort({ viewed_at: -1 })
      .limit(50);
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/history
// @desc    Add to history
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { prompt_id } = req.body;
    
    const newHistory = new History({
      user_id: req.user.id,
      prompt_id
    });

    const history = await newHistory.save();
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
