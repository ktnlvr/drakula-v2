from os import getenv
from typing import Annotated, Optional
from functools import lru_cache

from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from .models import AirportsResponse
from .database import Database, make_db


load_dotenv()

if not (VITE_DIR := getenv("VITE_BUILD_PATH")):
    from os.path import abspath, curdir as cwd

    print(
        f"Environmental variable VITE_BUILD_PATH not defined, assuming `{abspath(cwd)}`"
    )

app = FastAPI()

static = StaticFiles(directory=VITE_DIR)

DATABASE = None


def db() -> Database:
    global DATABASE
    if DATABASE is None:
        DATABASE = make_db()
    return DATABASE


@app.get("/airports")
def airports(db: Annotated[Database, Depends(db)], seed: Optional[str] = None) -> AirportsResponse:
    airports = db.get_airports(seed=seed)
    return AirportsResponse(airports=airports, connections=[])


app.mount("/", StaticFiles(directory=VITE_DIR, html=True), name="static")
