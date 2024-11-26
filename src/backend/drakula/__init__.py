from os import getenv
from typing import Annotated, Optional
from collections import defaultdict
from random import Random

from scipy.spatial import Delaunay
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from numpy import array
import networkx as nx
from geopy.distance import distance as geo_distance

from .models import AirportsResponse, Connection
from .database import Database, make_db, DEFAULT_AIRPORT_AMOUT
from .utils import seed_to_short


load_dotenv()

if not (VITE_DIR := getenv("VITE_BUILD_PATH")):
    from os.path import abspath, curdir as cwd

    print(
        f"Environmental variable VITE_BUILD_PATH not defined, assuming `{abspath(cwd)}`"
    )

app = FastAPI()


origins = ["http://localhost", "http://localhost:*", "http://localhost:5173"]

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
    prune_percentage: Optional[float] = 0.0,
) -> AirportsResponse:
    def triangulate_points(points):
        return Delaunay(points).convex_hull
    seed = seed_to_short(seed)

    airports = db.get_airports(seed=seed, amount=amount)
    points = array([airport.pos_3d for airport in airports])
    graph = defaultdict(list)

    for x, y, z in triangulate_points(points):
        graph[x].extend([y, z])
        graph[y].extend([x, z])
        graph[z].extend([x, y])

    G: nx.Graph = nx.Graph(graph).to_undirected()
    spanning_tree = nx.random_spanning_tree(G, seed=seed)
    difference = nx.difference(G, spanning_tree)

    rng = Random(seed)
    PRUNE_P = prune_percentage * len(G.nodes) / len(spanning_tree.nodes)

    P = 1 - PRUNE_P
    G = spanning_tree
    for edge in difference.edges:
        if rng.random() < P:
            G.add_edge(*edge)

    connections = []
    for a, b in G.edges:
        lhs = airports[a]
        rhs = airports[b]
        con = Connection(distance_km=geo_distance(lhs.lat_lon, rhs.lat_lon).km, a=a, b=b)
        connections.append(con)

    return AirportsResponse(airports=airports, connections=connections)


app.mount("/", StaticFiles(directory=VITE_DIR, html=True), name="static")
