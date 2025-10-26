# Placeholder for FastAPI backend integrating Gemini AI & MongoDB
# 
# This file is ready for future backend implementation with:
# - FastAPI for REST API endpoints
# - Google Gemini AI for dynamic story generation
# - MongoDB for game state persistence
#
# Example endpoints to implement:
# - POST /api/story - Generate next story segment based on player action
# - POST /api/combat - Handle combat encounters
# - POST /api/character - Save/load character data
# - GET /api/adventure-log - Retrieve story history
import google.generativeai as genai
import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from bson import ObjectId
import logging
from contextlib import asynccontextmanager

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Environment Variables ---
load_dotenv()

# --- Application Lifespan (for MongoDB connection) ---
mongo_client: Optional[AsyncIOMotorClient] = None
db: Optional[Any] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    global mongo_client, db
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        logger.error("MONGODB_URI not found in environment variables.")
        raise RuntimeError("MONGODB_URI is required.")
    try:
        mongo_client = AsyncIOMotorClient(mongo_uri)
        db = mongo_client.ai_dungeon_master
        logger.info("Successfully connected to MongoDB.")
        # Optional: Test connection
        await db.command('ping')
        logger.info("MongoDB ping successful.")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise RuntimeError(f"Failed to connect to MongoDB: {e}")

    yield # Application runs here

    # Shutdown: Disconnect from MongoDB
    if mongo_client:
        mongo_client.close()
        logger.info("Closed MongoDB connection.")

# --- FastAPI App ---
app = FastAPI(title="AI Dungeon Master API", lifespan=lifespan)

# --- CORS ---
cors_origin = os.getenv("CORS_ORIGIN", "http://localhost:5173") # Default to frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Gemini Setup ---
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    logger.error("GEMINI_API_KEY not found in environment variables.")
    # Allow running without API key for basic structure check, but log error.
    model = None
else:
    try:
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-1.5-flash') # Using flash for potentially faster responses
        logger.info("Google Gemini AI model configured successfully.")
    except Exception as e:
        logger.error(f"Failed to configure Gemini AI: {e}")
        model = None # Set model to None if configuration fails

# --- Pydantic Models ---
# Simplified models based on frontend state and README examples
class PlayerStats(BaseModel):
    strength: int
    intelligence: int
    agility: int

class Item(BaseModel):
    id: str
    name: str
    type: str
    effect: Optional[str] = None
    quantity: int

class Player(BaseModel):
    name: str
    class_name: str = Field(..., alias='class') # Use alias for 'class' keyword
    gender: str
    level: int
    health: int
    maxHealth: int
    xp: int
    maxXp: int
    # position: Dict[str, int] # Assuming frontend handles position
    inventory: List[Item]
    stats: PlayerStats

class Enemy(BaseModel):
    id: str
    name: str
    health: int
    maxHealth: int
    attack: int
    defense: int
    # position: Dict[str, int] # Assuming frontend handles position

class StoryEvent(BaseModel):
    id: str
    text: str
    timestamp: str # Assuming ISO format string from frontend/JS Date
    type: str

class StoryRequest(BaseModel):
    player: Player
    genre: str
    previousEvents: List[StoryEvent]
    choice: Optional[str] = None

class CombatRequest(BaseModel):
    player: Player
    enemy: Enemy
    action: str
    itemId: Optional[str] = None

class SaveData(BaseModel):
    playerId: str = Field(..., description="Identifier for the player (e.g., user ID or player name)")
    saveSlot: int = Field(..., description="Slot number (e.g., 1, 2, 3)")
    saveName: str = Field(..., description="User-friendly name for the save")
    gameState: Dict[str, Any] = Field(..., description="Complete snapshot of the game state")

# --- Helper Function to Parse Gemini JSON Response ---
def parse_json_response(text: str) -> Dict[str, Any]:
    """Attempts to parse JSON from Gemini's response, handling potential markdown code blocks."""
    try:
        # Remove markdown code block fences if present
        cleaned_text = text.strip().removeprefix('```json').removesuffix('```').strip()
        return json.loads(cleaned_text)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON response: {e}\nResponse text:\n{text}")
        raise HTTPException(status_code=500, detail="AI response format error.")
    except Exception as e:
        logger.error(f"An unexpected error occurred during JSON parsing: {e}\nResponse text:\n{text}")
        raise HTTPException(status_code=500, detail="Internal server error during response parsing.")

# --- AI Interaction Functions (Async) ---
async def generate_story_with_ai(player: Player, genre: str, previous_events: List[StoryEvent], choice: Optional[str]) -> Dict[str, Any]:
    """Generate dynamic story based on player choices using Gemini AI."""
    if not model:
        raise HTTPException(status_code=503, detail="Gemini AI model not configured.")

    # Build context from previous events (take the last 3 for brevity)
    context = "\n".join([e.text for e in previous_events[-3:]]) if previous_events else "The adventure begins."
    player_choice_text = f"Player's Choice: {choice}" if choice else "This is the start of a new scene or the continuation after a combat."

    prompt = f"""
    You are a {genre} Dungeon Master for a text-based RPG game called Gilded Scrolls AI.

    Player Character:
    - Name: {player.name}
    - Class: {player.class_name}
    - Level: {player.level}
    - Health: {player.health}/{player.maxHealth}
    - Stats: STR {player.stats.strength}, INT {player.stats.intelligence}, AGI {player.stats.agility}
    - Inventory: {', '.join([f'{item.name} (x{item.quantity})' for item in player.inventory]) if player.inventory else 'Empty'}

    Previous Story Context (most recent first):
    {context}

    {player_choice_text}

    Generate the next part of the story:
    1.  Write an engaging 1-3 paragraph continuation of the story, describing the scene, events, or consequences of the player's choice (or the current situation if no choice was made).
    2.  Provide exactly 3 distinct and meaningful choices for the player relevant to the current situation. Choices should be concise actions or dialogue options.
    3.  Optionally, introduce a combat encounter if dramatically appropriate. If so, define the enemy clearly. Only include an enemy if combat should start *now*.
    4.  Optionally, mention items found if logical within the narrative. Only include items if the player finds them *now*.
    5.  Optionally, include non-combat events like skill checks (e.g., "Roll Agility to dodge") or NPC interactions.

    Format your response STRICTLY as JSON:
    {{
      "story": "Your narrative here...",
      "choices": ["Choice 1 text", "Choice 2 text", "Choice 3 text"],
      "enemy": {{ "id": "enemy_goblin_1", "name": "Goblin Scout", "health": 30, "maxHealth": 30, "attack": 8, "defense": 4 }} // Optional: Include ONLY if combat starts NOW
      "items": [{{ "id": "item_health_potion_1", "name": "Minor Health Potion", "type": "potion", "effect": "Restores 30 HP", "quantity": 1 }}] // Optional: Include ONLY if items are found NOW
      "events": [ {{ "type": "level-up", "text": "You feel stronger!" }} ] // Optional: Include special game events like level-ups, quest updates etc.
    }}

    Important Notes:
    -   Maintain narrative consistency.
    -   Keep the difficulty appropriate for a level {player.level} {player.class_name}.
    -   Ensure the JSON format is perfect, with keys and values in double quotes.
    -   Do NOT include explanations outside the JSON structure.
    """

    try:
        response = await model.generate_content_async(prompt)
        # Check for safety ratings if necessary (or rely on API's default blocking)
        # print(response.prompt_feedback) # For debugging safety feedback
        # print(response.candidates[0].finish_reason) # For debugging finish reason
        # print(response.candidates[0].safety_ratings) # For debugging safety ratings

        if not response.candidates:
             raise HTTPException(status_code=500, detail="AI failed to generate a response.")

        # Accessing the text content safely
        if hasattr(response.candidates[0].content, 'parts') and response.candidates[0].content.parts:
            ai_response_text = response.candidates[0].content.parts[0].text
        else:
            # Fallback or different structure handling if necessary
             ai_response_text = getattr(response, 'text', '') # Attempt to get text attribute directly

        if not ai_response_text:
             raise HTTPException(status_code=500, detail="AI response was empty or blocked.")

        return parse_json_response(ai_response_text)
    except Exception as e:
        logger.error(f"Error during Gemini API call or response processing: {e}")
        # Provide a fallback generic response to keep the game going
        return {
            "story": f"An unexpected twist of fate occurs! You find yourself momentarily disoriented, unsure of what happened after trying to '{choice}'. The path ahead seems unclear.",
            "choices": ["Look around carefully", "Wait for a moment", "Push forward blindly"],
            "enemy": None,
            "items": [],
            "events": [{"type": "story", "text": "An error occurred generating the story."}]
        }


async def process_combat_with_ai(player: Player, enemy: Enemy, action: str, item_id: Optional[str]) -> Dict[str, Any]:
    """Process a combat turn using Gemini AI."""
    if not model:
        raise HTTPException(status_code=503, detail="Gemini AI model not configured.")

    item_used_text = ""
    if action == "use-item" and item_id:
        item = next((i for i in player.inventory if i.id == item_id), None)
        item_used_text = f"using item '{item.name}' ({item.effect})" if item else "attempting to use an item."
    elif action == "attack":
        item_used_text = "attacking the enemy."
    elif action == "defend":
        item_used_text = "defending."
    # 'run' action is handled before calling this in the frontend/main logic usually

    prompt = f"""
    Process a single combat turn in a text-based RPG called Gilded Scrolls AI.

    Player: {player.name} (Level {player.level} {player.class_name})
    - Health: {player.health}/{player.maxHealth}
    - Stats: STR {player.stats.strength}, INT {player.stats.intelligence}, AGI {player.stats.agility}
    - Inventory: {', '.join([f'{item.name} (x{item.quantity})' for item in player.inventory]) if player.inventory else 'Empty'}

    Enemy: {enemy.name}
    - Health: {enemy.health}/{enemy.maxHealth}
    - Attack: {enemy.attack}, Defense: {enemy.defense}

    Player Action: {action} {item_used_text}

    Calculate the outcome of this turn:
    1.  Determine Player Damage: Based on player action, stats ({player.stats.strength} STR for physical, {player.stats.intelligence} INT for magic if applicable), and enemy defense ({enemy.defense}). Defense action reduces incoming damage. Use reasonable RPG logic.
    2.  Determine Enemy Damage: Based on enemy attack ({enemy.attack}) and player stats (AGI {player.stats.agility} might influence dodging/mitigation). If player defended, reduce damage significantly.
    3.  Update Health: Calculate new health for both player and enemy (cannot go below 0).
    4.  Combat Log: Provide 1-3 short, descriptive sentences narrating the actions and results (e.g., "You strike the {enemy.name} for X damage!", "{enemy.name} retaliates, hitting you for Y damage.").
    5.  Victory/Defeat Check: Determine if player's health is <= 0 (defeat) or enemy's health is <= 0 (victory).
    6.  Rewards (if victory): If the enemy is defeated, calculate appropriate rewards (XP, maybe some gold or a simple item drop) based on enemy difficulty. A {enemy.name} might grant around {enemy.maxHealth * 2} XP.

    Return the result STRICTLY as JSON:
    {{
      "playerDamage": <calculated_damage_enemy_takes>, // Damage dealt TO the player by the enemy
      "enemyDamage": <calculated_damage_player_deals>, // Damage dealt TO the enemy by the player
      "playerHealth": <player_new_health_after_enemy_attack>,
      "enemyHealth": <enemy_new_health_after_player_attack>,
      "combatLog": ["Narration sentence 1.", "Narration sentence 2."],
      "victory": <true_if_enemy_defeated_else_false>,
      "defeat": <true_if_player_defeated_else_false>,
      "rewards": {{ "xp": <xp_amount_if_victory_else_0>, "gold": <gold_amount_if_victory_else_0>, "items": [{{ "id": "item_goblin_ear_1", "name": "Goblin Ear", "type": "quest", "quantity": 1 }}] }} // Optional: Include ONLY if victory
    }}

    Important Notes:
    -   Ensure the JSON format is perfect.
    -   Calculate damage with some variability but keep it logical for the stats.
    -   Do NOT include explanations outside the JSON structure.
    """

    try:
        response = await model.generate_content_async(prompt)

        if not response.candidates:
             raise HTTPException(status_code=500, detail="AI failed to generate a combat response.")

        # Accessing the text content safely
        if hasattr(response.candidates[0].content, 'parts') and response.candidates[0].content.parts:
            ai_response_text = response.candidates[0].content.parts[0].text
        else:
             ai_response_text = getattr(response, 'text', '')

        if not ai_response_text:
             raise HTTPException(status_code=500, detail="AI combat response was empty or blocked.")

        return parse_json_response(ai_response_text)
    except Exception as e:
        logger.error(f"Error during Gemini API call for combat: {e}")
        # Provide a fallback basic combat exchange
        player_dmg = max(1, player.stats.strength // 2 - enemy.defense // 2 + (abs(hash(player.name + action)) % 5) - 2) # Basic calc with randomness
        enemy_dmg = max(1, enemy.attack // 2 - player.stats.agility // 3 + (abs(hash(enemy.name + action)) % 5) - 2) if action != 'defend' else max(0, enemy.attack // 4 - player.stats.agility // 3)
        new_enemy_health = max(0, enemy.health - player_dmg)
        new_player_health = max(0, player.health - enemy_dmg)
        victory = new_enemy_health <= 0
        defeat = new_player_health <= 0
        log = [f"You {action}!", f"You hit {enemy.name} for {player_dmg} damage."]
        if not defeat:
            log.append(f"{enemy.name} attacks you for {enemy_dmg} damage.")
        if victory:
            log.append(f"You defeated the {enemy.name}!")
        if defeat:
             log.append("You have been defeated!")

        return {
            "playerDamage": enemy_dmg,
            "enemyDamage": player_dmg,
            "playerHealth": new_player_health,
            "enemyHealth": new_enemy_health,
            "combatLog": log,
            "victory": victory,
            "defeat": defeat,
            "rewards": {"xp": enemy.maxHealth * 2, "gold": enemy.maxHealth // 2, "items": []} if victory else None,
        }

# --- API Endpoints ---
@app.post("/api/story")
async def api_generate_story(request: StoryRequest):
    """Endpoint to generate the next part of the story."""
    try:
        # Pydantic automatically validates the request body against StoryRequest
        result = await generate_story_with_ai(
            request.player,
            request.genre,
            request.previousEvents,
            request.choice
        )
        return result
    except Exception as e:
        logger.error(f"Error in /api/story endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/combat")
async def api_process_combat(request: CombatRequest):
    """Endpoint to process a combat turn."""
    try:
        # Pydantic validates request body against CombatRequest
        result = await process_combat_with_ai(
            request.player,
            request.enemy,
            request.action,
            request.itemId
        )
        return result
    except Exception as e:
        logger.error(f"Error in /api/combat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/save")
async def save_game(save_data: SaveData):
    """Endpoint to save game state."""
    if not db:
        raise HTTPException(status_code=503, detail="Database connection not available.")
    try:
        # Convert Pydantic model to dict for MongoDB
        save_dict = save_data.model_dump(by_alias=True)
        save_dict["timestamp"] = datetime.datetime.now(datetime.timezone.utc) # Add timestamp

        # Use playerId and saveSlot to uniquely identify the save, upserting it
        result = await db.saves.update_one(
            {"playerId": save_dict["playerId"], "saveSlot": save_dict["saveSlot"]},
            {"$set": save_dict},
            upsert=True
        )

        if result.upserted_id:
            save_id = str(result.upserted_id)
            logger.info(f"Game saved successfully with new ID: {save_id}")
            return {"success": True, "saveId": save_id}
        elif result.modified_count > 0:
             # Find the existing document to get its ID if needed, though not strictly necessary for confirmation
             existing_save = await db.saves.find_one({"playerId": save_dict["playerId"], "saveSlot": save_dict["saveSlot"]})
             save_id = str(existing_save["_id"]) if existing_save else "unknown (updated)"
             logger.info(f"Game save updated successfully for slot: {save_data.saveSlot}, Player: {save_data.playerId}")
             return {"success": True, "saveId": save_id} # Return existing ID or confirmation
        else:
             logger.warning("Save operation reported no changes.")
             # Might happen if data is identical, still consider it success
             existing_save = await db.saves.find_one({"playerId": save_dict["playerId"], "saveSlot": save_dict["saveSlot"]})
             save_id = str(existing_save["_id"]) if existing_save else "unknown (no change)"
             return {"success": True, "saveId": save_id}

    except Exception as e:
        logger.error(f"Error saving game: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save game: {str(e)}")


# Helper to convert ObjectId to string for JSON serialization
def serialize_save(save):
    if save and "_id" in save:
        save["_id"] = str(save["_id"])
    return save

@app.get("/api/saves/{player_id}")
async def get_saves(player_id: str):
    """Endpoint to retrieve all save slots for a given player ID."""
    if not db:
        raise HTTPException(status_code=503, detail="Database connection not available.")
    try:
        saves_cursor = db.saves.find({"playerId": player_id}).sort("timestamp", -1) # Sort by most recent
        saves = await saves_cursor.to_list(length=None) # Fetch all saves for the player
        # Return only essential info for the list, not the full gameState
        save_list = [
            {"saveId": str(s["_id"]), "name": s.get("saveName", f"Slot {s.get('saveSlot', '?')}"), "timestamp": s.get("timestamp")}
            for s in saves
        ]
        return save_list
    except Exception as e:
        logger.error(f"Error fetching saves for player {player_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch saves: {str(e)}")

@app.get("/api/load/{save_id}")
async def load_game(save_id: str):
    """Endpoint to load a specific game save state by its MongoDB ObjectId."""
    if not db:
        raise HTTPException(status_code=503, detail="Database connection not available.")
    try:
        obj_id = ObjectId(save_id) # Validate and convert string to ObjectId
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid save ID format.")

    try:
        save = await db.saves.find_one({"_id": obj_id})
        if not save:
            raise HTTPException(status_code=404, detail="Save not found.")

        # Return the gameState part of the save document
        loaded_state = save.get("gameState")
        if not loaded_state:
             raise HTTPException(status_code=404, detail="Save data is corrupt or missing gameState.")

        logger.info(f"Game loaded successfully for save ID: {save_id}")
        return loaded_state # Return only the game state
    except HTTPException as e:
        # Re-raise HTTPExceptions (like 404)
        raise e
    except Exception as e:
        logger.error(f"Error loading game for save ID {save_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load game: {str(e)}")


# --- Root Endpoint ---
@app.get("/")
async def read_root():
    return {"message": "AI Dungeon Master API is running!"}

# --- Run with Uvicorn (if run directly) ---
# Note: The README suggests running `python app.py`. This requires uvicorn to be installed.
# If you run `uvicorn backend.app:app --reload --port 8000`, this block is not needed.
if __name__ == "__main__":
    import uvicorn
    import datetime # Need this import here for save endpoint timestamp

    logger.info("Starting Uvicorn server directly...")
    # Add reload=True for development convenience if desired
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))