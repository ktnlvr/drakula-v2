from os import getenv
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

    def get_airports(self) -> list[Airport]:
        cursor = self.connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, latitude_deg, longitude_deg, iso_country FROM airports LIMIT 15"
        )
        return list(map(lambda args: Airport(**args), cursor.fetchall()))


def make_db() -> Database:
    host = getenv("DRAKULA_V2_MARIADB_HOST") or "127.0.0.1"
    port = int(getenv("DRAKULA_V2_MARIADB_PORT") or "3306")
    password = getenv("DRAKULA_V2_MARIADB_PASSWORD")
    user = getenv("DRAKULA_V2_MARIADB_USER")
    return Database(user=user, password=password, host=host, port=port)
