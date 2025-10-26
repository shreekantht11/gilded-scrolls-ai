# AI Dungeon Master 🎮

An immersive, AI-powered text-based adventure game with dynamic story generation, turn-based combat, and character progression. Built with React, TypeScript, and powered by Google Gemini AI.

## 🌟 Features

### ✅ Implemented (Frontend)
- 🎭 **Character Creation** - Choose from Warrior, Mage, or Rogue classes
- 🌍 **Genre Selection** - Fantasy, Sci-Fi, Mystery, and Mythical adventures
- ⚔️ **Combat System** - Turn-based battles with visual effects
- 📊 **Character Progression** - Level up, gain XP, and improve stats
- 🎒 **Inventory Management** - Collect and use items
- 📜 **Quest System** - Track main and side quests with objectives
- 🗺️ **World Map** - Explore multiple locations with fast travel
- 🎯 **Achievement System** - Unlock achievements and track progress
- 🌐 **Multilingual Support** - English, Kannada, Telugu (i18n integrated)
- 💾 **Save/Load System** - Multiple save slots with auto-save
- 🎨 **Visual Effects** - Particle effects, screen shake, animations
- ♿ **Accessibility** - Keyboard navigation, screen reader support
- 📱 **Responsive Design** - Mobile, tablet, and desktop optimized
- 📊 **Statistics Dashboard** - Track your adventure progress
- 🎓 **Tutorial System** - Interactive onboarding for new players
- 🔔 **Achievement Notifications** - Real-time unlock celebrations
- 📤 **Social Sharing** - Share your adventure on social media

### 🚧 Backend Required
- 🤖 **AI Story Generation** - Dynamic narratives with Google Gemini
- 💾 **Cloud Save System** - MongoDB integration for persistent storage
- 🎲 **Dynamic Enemy Generation** - AI-powered encounters
- 🖼️ **Image Generation** - Character/scene illustrations (DALL-E/SD)
- 🎵 **Audio System** - Background music and sound effects (hooks ready)

## 🚀 Quick Start

### Frontend Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173`

## 🔧 Backend Development Guide

### Prerequisites
- Python 3.10+
- MongoDB Atlas account (free tier)
- Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))
- Optional: DALL-E API key for image generation

### Backend Setup

1. **Create `.env` file** in the root directory:

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-dungeon-master

# Optional: Image Generation
OPENAI_API_KEY=your_openai_api_key_here

# Server Config
PORT=8000
CORS_ORIGIN=http://localhost:5173
```

2. **Install Python dependencies**:

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/requirements.txt`:
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
pymongo==4.6.1
python-dotenv==1.0.0
google-generativeai==0.3.2
pydantic==2.5.3
openai==1.10.0
motor==3.3.2
python-multipart==0.0.6
```

3. **MongoDB Schema Design**:

```javascript
// Collection: players
{
  _id: ObjectId,
  name: String,
  class: String,
  gender: String,
  level: Number,
  health: Number,
  maxHealth: Number,
  xp: Number,
  maxXp: Number,
  stats: {
    strength: Number,
    intelligence: Number,
    agility: Number
  },
  inventory: Array,
  position: { x: Number, y: Number },
  createdAt: Date,
  updatedAt: Date
}

// Collection: saves
{
  _id: ObjectId,
  playerId: String,
  saveSlot: Number,
  saveName: String,
  gameState: Object, // Complete game state snapshot
  timestamp: Date
}

// Collection: quests
{
  _id: ObjectId,
  playerId: String,
  questId: String,
  type: String, // 'main' | 'side'
  status: String, // 'active' | 'completed'
  progress: Number,
  objectives: Array,
  rewards: Object
}
```

4. **Run Backend Server**:

```bash
cd backend
python app.py
```

Server runs at `http://localhost:8000`

### API Endpoints

#### Story Generation
```http
POST /api/story
Content-Type: application/json

{
  "player": { /* player object */ },
  "genre": "Fantasy",
  "previousEvents": [],
  "choice": "Explore the cave"
}

Response:
{
  "story": "You enter the dark cave...",
  "choices": ["Light a torch", "Cast a spell", "Turn back"],
  "enemy": { /* optional enemy object */ },
  "items": [ /* optional items found */ ]
}
```

#### Combat Processing
```http
POST /api/combat
Content-Type: application/json

{
  "player": { /* player object */ },
  "enemy": { /* enemy object */ },
  "action": "attack"
}

Response:
{
  "playerDamage": 15,
  "enemyDamage": 23,
  "playerHealth": 77,
  "enemyHealth": 42,
  "combatLog": ["You dealt 23 damage!", "Enemy hit you for 15 damage!"],
  "victory": false,
  "rewards": null
}
```

#### Save Game
```http
POST /api/save
Content-Type: application/json

{
  "playerId": "player_123",
  "saveSlot": 1,
  "saveName": "After defeating the dragon",
  "gameState": { /* complete game state */ }
}
```

#### Load Game
```http
GET /api/save/{saveId}

Response: { gameState object }
```

### Google Gemini Integration Example

```python
import google.generativeai as genai
import os

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

def generate_story(player, genre, previous_events, choice):
    """Generate dynamic story based on player choices"""
    
    # Build context from previous events
    context = ""
    if previous_events:
        context = "\n".join([e['text'] for e in previous_events[-3:]])
    
    prompt = f"""
    You are a {genre} Dungeon Master for a text-based RPG game.
    
    Player Character:
    - Name: {player['name']}
    - Class: {player['class']}
    - Level: {player['level']}
    - Stats: STR {player['stats']['strength']}, INT {player['stats']['intelligence']}, AGI {player['stats']['agility']}
    
    Previous Story Context:
    {context}
    
    Player's Choice: {choice}
    
    Generate the next part of the story:
    1. Write an engaging 2-3 paragraph continuation
    2. Provide exactly 3 meaningful choices for the player
    3. Optionally introduce a combat encounter (if appropriate)
    4. Optionally mention items found (if appropriate)
    
    Format your response as JSON:
    {{
      "story": "Your narrative here...",
      "choices": ["Choice 1", "Choice 2", "Choice 3"],
      "enemy": {{ "name": "Enemy Name", "health": 50, "attack": 10, "defense": 5 }} // optional
      "items": [{{ "name": "Item", "type": "potion", "quantity": 1 }}] // optional
    }}
    
    Important: Maintain narrative consistency and difficulty appropriate for level {player['level']}.
    """
    
    response = model.generate_content(prompt)
    return parse_json_response(response.text)

def process_combat(player, enemy, action):
    """AI-powered combat processing"""
    
    prompt = f"""
    Process a combat turn in an RPG battle.
    
    Player: {player['name']} (Level {player['level']} {player['class']})
    - Health: {player['health']}/{player['maxHealth']}
    - STR: {player['stats']['strength']}, INT: {player['stats']['intelligence']}, AGI: {player['stats']['agility']}
    
    Enemy: {enemy['name']}
    - Health: {enemy['health']}/{enemy['maxHealth']}
    - Attack: {enemy['attack']}, Defense: {enemy['defense']}
    
    Player Action: {action}
    
    Calculate:
    1. Damage dealt by player (consider stats and action)
    2. Damage dealt by enemy (consider defense and agility)
    3. Combat log narration
    4. Check for victory/defeat
    5. Award rewards if victory (XP, gold, items based on enemy difficulty)
    
    Return JSON:
    {{
      "playerDamage": number,
      "enemyDamage": number,
      "playerHealth": number,
      "enemyHealth": number,
      "combatLog": ["action 1", "action 2"],
      "victory": boolean,
      "defeat": boolean,
      "rewards": {{ "xp": number, "gold": number, "items": [] }}
    }}
    """
    
    response = model.generate_content(prompt)
    return parse_json_response(response.text)
```

### FastAPI Backend Example

Create `backend/app.py`:

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
import google.generativeai as genai
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

app = FastAPI(title="AI Dungeon Master API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
mongo_client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
db = mongo_client.ai_dungeon_master

# Gemini setup
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

# Models
class StoryRequest(BaseModel):
    player: dict
    genre: str
    previousEvents: List[dict]
    choice: Optional[str] = None

class CombatRequest(BaseModel):
    player: dict
    enemy: dict
    action: str
    itemId: Optional[str] = None

# Endpoints
@app.post("/api/story")
async def generate_story(request: StoryRequest):
    try:
        result = await generate_story_with_ai(
            request.player,
            request.genre,
            request.previousEvents,
            request.choice
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/combat")
async def process_combat(request: CombatRequest):
    try:
        result = await process_combat_with_ai(
            request.player,
            request.enemy,
            request.action,
            request.itemId
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/save")
async def save_game(save_data: dict):
    try:
        result = await db.saves.insert_one(save_data)
        return {"success": True, "saveId": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/save/{save_id}")
async def load_game(save_id: str):
    try:
        save = await db.saves.find_one({"_id": save_id})
        if not save:
            raise HTTPException(status_code=404, detail="Save not found")
        return save
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
```

## 🏗️ Project Structure

```
ai-dungeon-master/
├── src/
│   ├── components/
│   │   ├── CombatPanel.tsx          # Turn-based combat UI
│   │   ├── QuestTracker.tsx         # Quest management
│   │   ├── CharacterSheet.tsx       # Character stats & equipment
│   │   ├── WorldMap.tsx             # World exploration
│   │   ├── WorldMapModal.tsx        # Full-screen map modal
│   │   ├── VisualEffects.tsx        # Particle effects
│   │   ├── LoadingScreen.tsx        # Loading with tips
│   │   ├── ErrorBoundary.tsx        # Error handling
│   │   ├── Tutorial.tsx             # Interactive tutorial
│   │   ├── Statistics.tsx           # Player statistics
│   │   ├── ShareModal.tsx           # Social sharing
│   │   ├── AchievementNotification.tsx # Achievements
│   │   └── ui/                      # shadcn components
│   ├── services/
│   │   └── api.ts                   # Backend API integration
│   ├── utils/
│   │   └── storage.ts               # LocalStorage management
│   ├── hooks/
│   │   └── useAudio.ts              # Audio system
│   ├── i18n/
│   │   ├── config.ts                # i18n setup
│   │   └── locales/                 # Translation files
│   └── store/
│       └── gameStore.ts             # Zustand state management
├── backend/
│   ├── app.py                       # FastAPI backend
│   └── requirements.txt             # Python dependencies
└── public/
    ├── sounds/                       # Sound effects (add your files)
    └── music/                        # Background music (add your files)
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **TanStack Query** - Data fetching
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **react-i18next** - Internationalization
- **Lucide React** - Icons

### Backend (To Implement)
- **FastAPI** - Python web framework
- **Google Gemini AI** - Story generation
- **MongoDB** - Database
- **Pydantic** - Data validation
- **OpenAI API** - Image generation (optional)
- **Motor** - Async MongoDB driver

## 📚 Documentation

### Adding New Languages
1. Create new translation file in `src/i18n/locales/{language_code}.json`
2. Import in `src/i18n/config.ts`
3. Add language option in Settings component

### Creating Custom Quests
```typescript
const newQuest = {
  id: 'quest_dragon_slayer',
  title: 'The Dragon Slayer',
  description: 'Defeat the ancient dragon',
  type: 'main',
  objectives: [
    { text: 'Find the dragon\'s lair', completed: false },
    { text: 'Collect dragon-slaying sword', completed: false },
    { text: 'Defeat the dragon', completed: false }
  ],
  rewards: {
    xp: 1000,
    gold: 500,
    items: ['Dragon Scale Armor']
  }
};
```

### Adding Sound Effects
Place audio files in `public/sounds/` and `public/music/`:
- `sword-slash.mp3` - Attack sound
- `shield-block.mp3` - Defense sound
- `potion-drink.mp3` - Healing sound
- `level-up.mp3` - Level up fanfare
- `fantasy-adventure.mp3` - Background music

## 🎮 Game Design Philosophy

- **Player Agency** - Every choice matters and affects the story
- **Dynamic Difficulty** - AI adapts to player level and choices
- **Rich Storytelling** - Context-aware narratives with callbacks
- **Balanced Combat** - Strategic decisions over button mashing
- **Exploration Rewards** - Hidden secrets and optional content
- **Accessibility First** - Playable by everyone

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Powered by [Google Gemini AI](https://ai.google.dev/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Inspired by classic text-based adventures

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API examples above

---

**Ready to embark on your adventure? Start the development server and begin your journey!** 🗡️✨
