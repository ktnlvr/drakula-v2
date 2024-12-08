import uuid
import json
from os import getenv
from typing import Optional
from mysql.connector import connect, Error
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
            auth_plugin="mysql_native_password",
        )

    def get_airports(
        self, seed: Optional[int] = None, amount: int = DEFAULT_AIRPORT_AMOUT
    ) -> list[Airport]:
        cursor = self.connection.cursor(dictionary=True)
        cursor.execute(
            """SELECT
                name, latitude_deg, longitude_deg, iso_country
                FROM airport ORDER BY RAND(%s) LIMIT %s""",
            (seed, amount),
        )
        return list(map(lambda args: Airport(**args), cursor.fetchall()))

    def set_save(self, id, json_data):
        if not self.connection:
            print("Database connection error!")
            return None
        cursor = self.connection.cursor()

        try:
            cursor.execute(
                """INSERT INTO games (id, `json`) VALUES (%s, %s)""",
                (id, json.dumps(json_data)),
            )
            print(f"Insert new player complete!")
        except Error as e:
            print(f"Error: {e}")

    def get_save(self, game_id: str) -> list[dict]:
        if not self.connection:
            print("Database connection error!")
            return None
        cursor = self.connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM games WHERE id = %s", (game_id,))

        return cursor.fetchall()


def make_db() -> Optional[Database]:
    try:
        db = Database(
            host=getenv("DRAKULA_V2_MARIADB_HOST") or "127.0.0.1",
            port=int(getenv("DRAKULA_V2_MARIADB_PORT") or "3306"),
            password=getenv("DRAKULA_V2_MARIADB_PASSWORD"),
            user=getenv("DRAKULA_V2_MARIADB_USER"),
        )

        if not db.connection:
            print("Database connection error!")
            return None

        init_query = """CREATE TABLE IF NOT EXISTS games (
            id VARCHAR(255) PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            'json' TEXT NOT NULL
        )"""
        cursor = db.connection.cursor()
        cursor.execute(init_query)
        return db

    except Error as e:
        print(f"Error: {e}")
        return None


if __name__ == "__main__":
    db = make_db()
    if db:
        airports = db.get_airports(seed="example_seed", amount=10)
        for airport in airports:
            print(airport)
