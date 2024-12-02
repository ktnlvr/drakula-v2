from dotenv import load_dotenv
from os import getenv
import os
from typing import Annotated, Optional, Dict
#from functools import lru_cache
from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles

from .models import AirportsResponse
from .database import Database, make_db, DEFAULT_AIRPORT_AMOUT

dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/drakula/example.env'))

load_dotenv(dotenv_path=dotenv_path)

if not (VITE_DIR := getenv("VITE_BUILD_PATH")):

    from os.path import abspath, curdir as cwd
    print(
        f"Environmental variable VITE_BUILD_PATH not defined, assuming `{abspath(cwd)}`"
    )
    VITE_DIR = abspath(cwd)

app = FastAPI()
#print(f"VITE_DIR: {VITE_DIR}")
static = StaticFiles(directory=VITE_DIR)

DATABASE = None

def db() -> Database:
    global DATABASE
    if DATABASE is None:
        DATABASE = make_db()
    return DATABASE

@app.get("/airports")
def airports(
    db: Annotated[Database, Depends(db)],
    seed: Optional[str] = None,
    amount: int = DEFAULT_AIRPORT_AMOUT,
) -> AirportsResponse:
    airports = db.get_airports(seed=seed, amount=amount)
    return AirportsResponse.from_airports(airports)

games_db: Dict[str, dict] = {}

@app.post("/game")
async def create_game(game_id: str, game_data: dict):
    if game_id in games_db:
        raise HTTPException(status_code=409, detail="Game ID already exists.")
    games_db[game_id] = game_data
    return {"id": game_id, "data": game_data}

@app.get("/game")
async def get_game(game_id: str):
    if game_id not in games_db:
        raise HTTPException(status_code=404, detail="Game not found.")
    return games_db[game_id]


app.mount("/", StaticFiles(directory=VITE_DIR, html=True), name="static")
