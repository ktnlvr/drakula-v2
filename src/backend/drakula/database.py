from os import getenv
from typing import Optional
from hashlib import md5

from mysql.connector import connect

from .models import Airport


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

    def get_airports(self, seed: Optional[str] = None) -> list[Airport]:
        cursor = self.connection.cursor(dictionary=True)
        seed = (seed or '') and (int.from_bytes(md5(seed.encode()).digest()) % 2**16)
        cursor.execute(
            f"""SELECT
                name, latitude_deg, longitude_deg, iso_country
                FROM airport ORDER BY RAND({seed}) LIMIT 15"""
        )
        return list(map(lambda args: Airport(**args), cursor.fetchall()))


def make_db() -> Database:
    host = getenv("DRAKULA_V2_MARIADB_HOST") or "127.0.0.1"
    port = int(getenv("DRAKULA_V2_MARIADB_PORT") or "3306")
    password = getenv("DRAKULA_V2_MARIADB_PASSWORD")
    user = getenv("DRAKULA_V2_MARIADB_USER")
    return Database(user=user, password=password, host=host, port=port)
