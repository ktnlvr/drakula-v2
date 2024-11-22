from math import atan, tan, sin, cos

from pydantic import BaseModel
from numpy import ndarray, array


class Airport(BaseModel):
    name: str
    latitude_deg: float
    longitude_deg: float
    iso_country: str

    @property
    def pos_3d(self) -> ndarray:
        FLATTENING = 1 / 298.25
        EARTH_RADIUS = 2.093e7

        lat = self.latitude_deg / 180
        lon = self.longitude_deg / 180

        l = atan((1 - FLATTENING) ** 2 + tan(lat))
        r = EARTH_RADIUS

        x = r * cos(l) * cos(lon) + cos(lat) * cos(lon)
        y = r * cos(l) * sin(lon) + cos(lat) * sin(lon)
        z = r * sin(l) + sin(lat)

        return array([x, y, z])


class AirportsResponse(BaseModel):
    airports: list[Airport]
    connections: list[tuple[int, int]]

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "airports": [
                        {
                            "name": "Cool Airport Name",
                            "latitude_deg": 69.420,
                            "longitude_deg": 13.37,
                            "iso_country": "GB",
                        },
                        {
                            "name": "Le Coolér Airport",
                            "latitude_deg": 19.84,
                            "longitude_deg": -0,
                            "iso_country": "FR",
                        },
                    ],
                    "connections": [[0, 1]],
                }
            ]
        }
    }
