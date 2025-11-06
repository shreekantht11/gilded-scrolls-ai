import express from 'express';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validation middleware
const validateStoryRequest = [
  body('player.name').trim().isLength({ min: 1, max: 50 }).escape(),
  body('player.class').trim().isLength({ min: 1, max: 30 }).escape(),
  body('genre').isIn(['fantasy', 'sci-fi', 'mystery', 'horror', 'western', 'cyberpunk']),
  body('choice').optional().trim().isLength({ max: 500 }).escape(),
];

// Generate AI story
router.post('/generate', validateStoryRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { player, genre, previousEvents, choice } = req.body;

    // Build context from previous events
    const context = previousEvents?.map(e => e.text).join('\n') || '';
    const lastChoice = choice || 'begin the adventure';

    // Create system prompt based on genre
    const genrePrompts = {
      fantasy: 'You are a fantasy dungeon master. Create epic adventures with magic, dragons, and medieval settings.',
      'sci-fi': 'You are a sci-fi game master. Create futuristic adventures with technology, space exploration, and aliens.',
      mystery: 'You are a mystery game master. Create intriguing detective stories with puzzles and plot twists.',
      horror: 'You are a horror game master. Create suspenseful and terrifying adventures with supernatural elements.',
      western: 'You are a western game master. Create wild west adventures with outlaws, sheriffs, and frontier life.',
      cyberpunk: 'You are a cyberpunk game master. Create dystopian futures with hackers, megacorporations, and high-tech low-life.',
    };

    const systemPrompt = `${genrePrompts[genre] || genrePrompts.fantasy}
    
Character: ${player.name}, a Level ${player.level} ${player.class} (${player.gender})
Health: ${player.health}/${player.maxHealth} | Gold: ${player.gold}

Create an engaging story segment (150-250 words) that:
1. Responds to the player's action: "${lastChoice}"
2. Advances the narrative with vivid descriptions
3. Presents 3 meaningful choices for the player
4. Includes potential for combat, discovery, or character interaction
5. Maintains consistency with previous events

Format your response as JSON:
{
  "story": "narrative text here",
  "choices": ["choice 1", "choice 2", "choice 3"],
  "enemy": { "name": "enemy name", "health": 30, "maxHealth": 30, "attack": 8, "defense": 4 } (only if combat encounter),
  "items": [{ "id": "item_id", "name": "item name", "type": "potion/weapon/armor", "effect": "description" }] (only if items found)
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Previous story:\n${context}\n\nPlayer action: ${lastChoice}` },
      ],
      temperature: 0.8,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    // Ensure proper structure
    const response = {
      story: aiResponse.story || 'The adventure continues...',
      choices: aiResponse.choices || ['Continue forward', 'Look around', 'Rest'],
      ...(aiResponse.enemy && { enemy: { id: `enemy_${Date.now()}`, position: { x: 0, y: 0 }, ...aiResponse.enemy } }),
      ...(aiResponse.items && { items: aiResponse.items }),
    };

    res.json(response);

  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate story', 
      message: error.message,
    });
  }
});

// Process combat action
router.post('/combat', [
  body('action').isIn(['attack', 'defend', 'use-item', 'run']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { player, enemy, action, itemId } = req.body;

    let playerDamage = 0;
    let enemyDamage = 0;
    const combatLog = [];

    if (action === 'attack') {
      playerDamage = Math.max(1, Math.floor(Math.random() * player.stats.strength) + 5 - (enemy.defense || 0));
      enemyDamage = Math.max(1, Math.floor(Math.random() * (enemy.attack || 5)) - Math.floor(player.stats.constitution / 5));
      
      combatLog.push(`You attack ${enemy.name} for ${playerDamage} damage!`);
      combatLog.push(`${enemy.name} strikes back for ${enemyDamage} damage!`);
    } else if (action === 'defend') {
      enemyDamage = Math.max(0, Math.floor(Math.random() * (enemy.attack || 5) / 2));
      combatLog.push(`You brace for defense!`);
      combatLog.push(`${enemy.name} attacks but you block most damage! (${enemyDamage} damage)`);
    } else if (action === 'run') {
      const escapeChance = Math.random();
      if (escapeChance > 0.5) {
        return res.json({
          playerDamage: 0,
          enemyDamage: 0,
          playerHealth: player.health,
          enemyHealth: enemy.health,
          combatLog: ['You successfully escaped!'],
          escaped: true,
        });
      } else {
        enemyDamage = Math.floor(enemy.attack / 2);
        combatLog.push(`Escape failed! ${enemy.name} strikes as you flee! (${enemyDamage} damage)`);
      }
    }

    const newPlayerHealth = Math.max(0, player.health - enemyDamage);
    const newEnemyHealth = Math.max(0, enemy.health - playerDamage);

    const response = {
      playerDamage: enemyDamage,
      enemyDamage: playerDamage,
      playerHealth: newPlayerHealth,
      enemyHealth: newEnemyHealth,
      combatLog,
    };

    // Check for victory or defeat
    if (newEnemyHealth <= 0) {
      const xpReward = Math.floor(enemy.maxHealth * 2);
      const goldReward = Math.floor(Math.random() * 20) + 10;
      
      response.victory = true;
      response.rewards = {
        xp: xpReward,
        gold: goldReward,
        items: [],
      };
      combatLog.push(`🎉 Victory! You earned ${xpReward} XP and ${goldReward} gold!`);
    } else if (newPlayerHealth <= 0) {
      response.defeat = true;
      combatLog.push(`💀 You have been defeated...`);
    }

    res.json(response);

  } catch (error) {
    console.error('Combat error:', error);
    res.status(500).json({ error: 'Combat processing failed', message: error.message });
  }
});

export default router;
