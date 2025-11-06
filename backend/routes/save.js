import express from 'express';
import { body, param, validationResult } from 'express-validator';
import Story from '../models/Story.js';
import User from '../models/User.js';

const router = express.Router();

// Save game
router.post('/', [
  body('playerId').trim().isLength({ min: 1, max: 100 }),
  body('saveId').trim().isLength({ min: 1, max: 100 }),
  body('character.name').trim().isLength({ min: 1, max: 50 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const saveData = req.body;

    // Update or create story
    const story = await Story.findOneAndUpdate(
      { saveId: saveData.saveId },
      saveData,
      { upsert: true, new: true, runValidators: true }
    );

    // Update user
    await User.findOneAndUpdate(
      { playerId: saveData.playerId },
      { 
        $set: { lastPlayed: Date.now() },
        $inc: { totalGamesPlayed: 0 },
      },
      { upsert: true }
    );

    res.json({ 
      success: true, 
      saveId: story.saveId,
      message: 'Game saved successfully',
    });

  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save game', message: error.message });
  }
});

// Load game by saveId
router.get('/:saveId', [
  param('saveId').trim().isLength({ min: 1, max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const story = await Story.findOne({ saveId: req.params.saveId, isActive: true });

    if (!story) {
      return res.status(404).json({ error: 'Save not found' });
    }

    res.json(story);

  } catch (error) {
    console.error('Load error:', error);
    res.status(500).json({ error: 'Failed to load game', message: error.message });
  }
});

// Get all saves for a player
router.get('/player/:playerId', [
  param('playerId').trim().isLength({ min: 1, max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const saves = await Story.find({ 
      playerId: req.params.playerId, 
      isActive: true 
    })
    .sort({ updatedAt: -1 })
    .limit(10)
    .select('saveId character.name character.level genre updatedAt');

    res.json(saves);

  } catch (error) {
    console.error('Get saves error:', error);
    res.status(500).json({ error: 'Failed to fetch saves', message: error.message });
  }
});

// Delete save
router.delete('/:saveId', [
  param('saveId').trim().isLength({ min: 1, max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await Story.findOneAndUpdate(
      { saveId: req.params.saveId },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Save not found' });
    }

    res.json({ success: true, message: 'Save deleted successfully' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete save', message: error.message });
  }
});

export default router;
