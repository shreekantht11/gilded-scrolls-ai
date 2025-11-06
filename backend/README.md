# Gilded Scrolls Backend - Express API

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas cloud)
- OpenAI API key

### Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```bash
cp .env.example .env
```

4. **Configure environment variables:**
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/gilded-scrolls
OPENAI_API_KEY=sk-your-openai-api-key-here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

5. **Start the server:**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:8000`

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Endpoints

#### 1. **Health Check**
```http
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "message": "Gilded Scrolls API is running"
}
```

---

#### 2. **Generate Story**
```http
POST /api/story/generate
```

**Request Body:**
```json
{
  "player": {
    "name": "Aragorn",
    "class": "Warrior",
    "gender": "male",
    "level": 1,
    "health": 100,
    "maxHealth": 100,
    "gold": 0,
    "stats": {
      "strength": 15,
      "intelligence": 10,
      "wisdom": 12,
      "dexterity": 14,
      "constitution": 13,
      "charisma": 11
    }
  },
  "genre": "fantasy",
  "previousEvents": [
    {
      "id": "event1",
      "text": "You enter a dark forest...",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "choice": "Explore the mysterious cave"
}
```

**Response:**
```json
{
  "story": "You cautiously enter the cave, your torch casting dancing shadows...",
  "choices": [
    "Investigate the strange sounds deeper in",
    "Search for treasure along the walls",
    "Return to the entrance"
  ],
  "enemy": {
    "id": "enemy_1234567890",
    "name": "Cave Troll",
    "health": 45,
    "maxHealth": 45,
    "attack": 12,
    "defense": 6,
    "position": { "x": 0, "y": 0 }
  },
  "items": [
    {
      "id": "potion_health",
      "name": "Health Potion",
      "type": "potion",
      "effect": "Restores 30 HP"
    }
  ]
}
```

---

#### 3. **Process Combat**
```http
POST /api/story/combat
```

**Request Body:**
```json
{
  "player": {
    "name": "Aragorn",
    "health": 100,
    "stats": {
      "strength": 15,
      "constitution": 13
    }
  },
  "enemy": {
    "name": "Cave Troll",
    "health": 45,
    "maxHealth": 45,
    "attack": 12,
    "defense": 6
  },
  "action": "attack"
}
```

**Response (Victory):**
```json
{
  "playerDamage": 8,
  "enemyDamage": 17,
  "playerHealth": 92,
  "enemyHealth": 0,
  "combatLog": [
    "You attack Cave Troll for 17 damage!",
    "Cave Troll strikes back for 8 damage!",
    "🎉 Victory! You earned 90 XP and 15 gold!"
  ],
  "victory": true,
  "rewards": {
    "xp": 90,
    "gold": 15,
    "items": []
  }
}
```

---

#### 4. **Save Game**
```http
POST /api/save
```

**Request Body:**
```json
{
  "playerId": "player_12345",
  "saveId": "save_slot_1",
  "character": {
    "name": "Aragorn",
    "class": "Warrior",
    "gender": "male",
    "level": 3,
    "health": 85,
    "maxHealth": 120,
    "experience": 450,
    "gold": 125,
    "stats": {
      "strength": 17,
      "intelligence": 10,
      "wisdom": 12,
      "dexterity": 14,
      "constitution": 15,
      "charisma": 11
    }
  },
  "genre": "fantasy",
  "events": [...],
  "inventory": [...],
  "activeQuests": [...],
  "completedQuests": ["quest_1"],
  "currentLocation": "dark_forest",
  "discoveredLocations": ["starting_village", "dark_forest"]
}
```

**Response:**
```json
{
  "success": true,
  "saveId": "save_slot_1",
  "message": "Game saved successfully"
}
```

---

#### 5. **Load Game**
```http
GET /api/save/:saveId
```

**Response:**
```json
{
  "_id": "...",
  "playerId": "player_12345",
  "saveId": "save_slot_1",
  "character": {...},
  "genre": "fantasy",
  "events": [...],
  "inventory": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T12:30:00.000Z"
}
```

---

#### 6. **Get All Saves for Player**
```http
GET /api/save/player/:playerId
```

**Response:**
```json
[
  {
    "saveId": "save_slot_1",
    "character": {
      "name": "Aragorn",
      "level": 3
    },
    "genre": "fantasy",
    "updatedAt": "2024-01-02T12:30:00.000Z"
  }
]
```

---

#### 7. **Delete Save**
```http
DELETE /api/save/:saveId
```

**Response:**
```json
{
  "success": true,
  "message": "Save deleted successfully"
}
```

---

## 🗄️ MongoDB Schema

### User Collection
```javascript
{
  playerId: String (unique, indexed),
  username: String,
  createdAt: Date,
  lastPlayed: Date,
  totalGamesPlayed: Number,
  achievements: [String]
}
```

### Story Collection
```javascript
{
  playerId: String (indexed),
  saveId: String (unique, indexed),
  character: {
    name: String,
    class: String,
    gender: String,
    level: Number,
    health: Number,
    maxHealth: Number,
    experience: Number,
    gold: Number,
    stats: {
      strength: Number,
      intelligence: Number,
      wisdom: Number,
      dexterity: Number,
      constitution: Number,
      charisma: Number
    }
  },
  genre: String (enum),
  events: [EventObject],
  inventory: [ItemObject],
  activeQuests: [QuestObject],
  completedQuests: [String],
  currentLocation: String,
  discoveredLocations: [String],
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean
}
```

---

## 🔐 Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Input Validation** - All inputs validated with express-validator
- **CORS** - Configured for frontend origin only
- **Data Sanitization** - Prevents XSS and injection attacks

---

## 🚀 Deployment

### Option 1: Railway
1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically from main branch

### Option 2: Render
1. Create account at [render.com](https://render.com)
2. New Web Service → Connect GitHub
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables

### Option 3: Heroku
```bash
heroku create gilded-scrolls-api
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set OPENAI_API_KEY=your_openai_key
git push heroku main
```

---

## 🧪 Testing

### Test Story Generation
```bash
curl -X POST http://localhost:8000/api/story/generate \
  -H "Content-Type: application/json" \
  -d '{
    "player": {"name": "Test", "class": "Warrior", "gender": "male", "level": 1, "health": 100, "maxHealth": 100, "gold": 0, "stats": {"strength": 10}},
    "genre": "fantasy",
    "previousEvents": [],
    "choice": "begin"
  }'
```

### Test Health Endpoint
```bash
curl http://localhost:8000/health
```

---

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **openai** - OpenAI API client
- **cors** - CORS middleware
- **helmet** - Security headers
- **dotenv** - Environment variables
- **express-validator** - Input validation
- **express-rate-limit** - Rate limiting

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# If using Atlas, verify connection string format:
mongodb+srv://<username>:<password>@cluster.mongodb.net/gilded-scrolls?retryWrites=true&w=majority
```

### OpenAI API Errors
- Verify API key is valid
- Check quota/billing at platform.openai.com
- Ensure you're using a supported model (gpt-4o-mini, gpt-4, etc.)

### CORS Errors
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- For production, set to your deployed frontend domain

---

## 📄 License
MIT License - See LICENSE file for details
