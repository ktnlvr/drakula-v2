from os import getenv
from typing import Annotated, Optional
from functools import lru_cache

from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .models import AirportsResponse
from .database import Database, make_db, DEFAULT_AIRPORT_AMOUT



load_dotenv()

if not (VITE_DIR := getenv("VITE_BUILD_PATH")):
    from os.path import abspath, curdir as cwd

    print(
        f"Environmental variable VITE_BUILD_PATH not defined, assuming `{abspath(cwd)}`"
    )

app = FastAPI()


origins = [
    "http://localhost",
    "http://localhost:*",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    amount=DEFAULT_AIRPORT_AMOUT,
) -> AirportsResponse:
    airports = db.get_airports(seed=seed, amount=amount)
    return AirportsResponse.from_airports(airports)


app.mount("/", StaticFiles(directory=VITE_DIR, html=True), name="static")
