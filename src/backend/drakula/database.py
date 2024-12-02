
import uuid
from dotenv import load_dotenv
from os import getenv
import os
from typing import Optional
from hashlib import md5

from mysql.connector import connect, Error

from .models import Airport

DEFAULT_AIRPORT_AMOUT = 15

load_dotenv()

class Database:
    def __init__(self, user, password, host, port):
        try:
            self.connection = connect(
                host=host,
                port=port,
                user=user,
                password=password,
                database="flight_game",
                autocommit=True,
                auth_plugin="mysql_native_password"  
            )
        except Error as e:
            print(f"Error: {e}")
            self.connection = None

    def get_airports(self, seed: Optional[str] = None, amount: int = DEFAULT_AIRPORT_AMOUT) -> list[Airport]:
        cursor = self.connection.cursor(dictionary=True)
        seed = (seed or '') and (int.from_bytes(md5(seed.encode()).digest()) % 2**16)
        cursor.execute(
             """SELECT
                name, latitude_deg, longitude_deg, iso_country
                FROM airports ORDER BY RAND(%s) LIMIT %s""",
            (seed, amount)
        )
        return list(map(lambda args: Airport(**args), cursor.fetchall()))
    
    def set_save(self, id, json):
        if not self.connection:
            print("Database connection error!")
            return None
        cursor = self.connection.cursor()
        
        try:
            cursor.execute(
                """INSERT INTO games (id, json_data) VALUES (%s, %s)""",
                (id, json)
            )
            print(f"Insert new player complete!")
        except Error as e:
            print(f"Error: {e}")

    
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

def make_db() -> Optional[Database]:
    try:
        db = Database (
            host = getenv("DRAKULA_V2_MARIADB_HOST") or "127.0.0.1",
            port = int(getenv("DRAKULA_V2_MARIADB_PORT") or "3306"),
            password = getenv("DRAKULA_V2_MARIADB_PASSWORD"),
            user = getenv("DRAKULA_V2_MARIADB_USER")
        )

        if not db.connection:
            print("Database connection error!")
            return None
        full_path = 'query.sql'
        init_query = read_sql_query(full_path)
        cursor = db.connection.cursor()
        cursor.execute(init_query)
        return db
    
    except Error as e:
        print(f"Error: {e}") 
        return None           

def read_sql_query(filename: str)-> str:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    full_path = os.path.abspath(os.path.join(base_dir, 'query.sql'))
    with open(full_path, 'r') as file:
        return file.read()


if __name__ == "__main__":
    db = make_db()
    if db:
        airports = db.get_airports(seed="example_seed", amount=10)
        for airport in airports:
            print(airport)
