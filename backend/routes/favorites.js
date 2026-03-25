const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Favorite = require('../models/Favorite');

// @route   GET api/favorites
// @desc    Get all user's favorites
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user_id: req.user.id })
      .select('prompt_id')
      .sort({ createdAt: -1 });
    
    // Return array of prompt IDs for easy lookup on frontend
    const favoriteIds = favorites.map(f => f.prompt_id);
    res.json(favoriteIds);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/favorites
// @desc    Add a favorite
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { prompt_id } = req.body;
    
    // Check if already favorited
    let favorite = await Favorite.findOne({ user_id: req.user.id, prompt_id });
    if (favorite) {
      return res.status(400).json({ message: 'Already favorited' });
    }

    favorite = new Favorite({
      user_id: req.user.id,
      prompt_id
    });

    await favorite.save();
    res.json({ prompt_id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/favorites/:prompt_id
// @desc    Remove a favorite
// @access  Private
router.delete('/:prompt_id', auth, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({ user_id: req.user.id, prompt_id: req.params.prompt_id });
    res.json({ message: 'Favorite removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
