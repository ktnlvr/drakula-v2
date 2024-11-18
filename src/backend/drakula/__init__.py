from os import getenv

from fastapi import FastAPI
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


def db() -> Database:
    global DATABASE
    if DATABASE is None:
        DATABASE = make_db()
    return DATABASE


@app.get("/airports")
def airports() -> AirportsResponse:
    return AirportsResponse(airports=[], connections=[])


app.mount("/", StaticFiles(directory=VITE_DIR, html=True), name="static")
