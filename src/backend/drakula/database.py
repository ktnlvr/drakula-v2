
import uuid
from os import getenv
from typing import Optional
from hashlib import md5

from mysql.connector import connect

from .models import Airport

DEFAULT_AIRPORT_AMOUT = 15


class Database:
    def __init__(self, user, password, host, port):
        self.connection = connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database="flight_game",
            autocommit=True,
        )

    def get_airports(self, seed: Optional[str] = None, amount: int = DEFAULT_AIRPORT_AMOUT) -> list[Airport]:
        cursor = self.connection.cursor(dictionary=True)
        seed = (seed or '') and (int.from_bytes(md5(seed.encode()).digest()) % 2**16)
        cursor.execute(
            f"""SELECT
                name, latitude_deg, longitude_deg, iso_country
                FROM airport ORDER BY RAND({seed}) LIMIT {amount or DEFAULT_AIRPORT_AMOUT}"""
        )
        return list(map(lambda args: Airport(**args), cursor.fetchall()))
    
    def set_save(self, id, json):
        if not self.connection:
            print("Database connection error!")
            return None
        cursor = self.connection.cursor()
        
        cursor.execute(
            f"""INSERT INTO games (id) VALUE (%s, ?, %s)""",
            (id, json)
        )
        print(f"Insert new player complete!")

    
    def get_save(self,game_id: str, amount: int = DEFAULT_AIRPORT_AMOUT) -> list[dict]:
        if not self.connection:
            print("Database connection error!")
            return None
        cursor = self.connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM games WHERE id = %s",
            (game_id,)
        )

        return cursor.fetchall()        

def make_db() -> Database:
    host = getenv("DRAKULA_V2_MARIADB_HOST") or "127.0.0.1"
    port = int(getenv("DRAKULA_V2_MARIADB_PORT") or "3306")
    password = getenv("DRAKULA_V2_MARIADB_PASSWORD")
    user = getenv("DRAKULA_V2_MARIADB_USER")
    db = Database(user=user, password=password, host=host, port=port)

    if not db.connection:
        print("Database connection error!")
    else:
        init_query = read_sql_query('query.sql')
        cursor = db.connection.cursor()
        cursor.execute(init_query)
    
    return db
    

def read_sql_query(filename: str)-> str:
    with open(filename, 'r') as file:
        return file.read()


if __name__ == "__main__":
    db = make_db()
    if db:
        airports = db.get_airports(seed="example_seed", amount=10)
        for airport in airports:
            print(airport)
