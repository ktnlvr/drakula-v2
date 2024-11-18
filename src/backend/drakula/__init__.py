from os import getenv

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv


load_dotenv()

if not (VITE_DIR := getenv("RELATIVE_VITE_BUILD_PATH")):
    from os.path import abspath, curdir as cwd

    print(
        f"Environmental variable RELATIVE_VITE_BUILD_PATH not defined, assuming `{abspath(cwd)}`"
    )

app = FastAPI()

static = StaticFiles(directory=VITE_DIR)

app.mount("/", StaticFiles(directory=VITE_DIR, html=True), name="static")
