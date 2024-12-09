from math import atan, tan, sin, cos

from pydantic import BaseModel, AliasGenerator, ConfigDict, field_validator, Field
import numpy as np


class Airport(BaseModel):
    name: str
    latitude_deg: float
    longitude_deg: float
    iso_country: str

    @property
    def lat_lon(self) -> np.ndarray:
        return np.array([self.latitude_deg, self.longitude_deg])

    @property
    def pos_3d(self) -> np.ndarray:
        FLATTENING = 1 / 298.25
        EARTH_RADIUS = 2.093e7

        lat = self.latitude_deg / 180
        lon = self.longitude_deg / 180

        l = atan((1 - FLATTENING) ** 2 + tan(lat))
        r = EARTH_RADIUS

        x = r * cos(l) * cos(lon) + cos(lat) * cos(lon)
        y = r * cos(l) * sin(lon) + cos(lat) * sin(lon)
        z = r * sin(l) + sin(lat)

        return np.array([x, y, z])


class Connection(BaseModel):
    model_config = ConfigDict(
        alias_generator=AliasGenerator(
            serialization_alias=lambda name: (name == "a" and "0")
            or (name == "b" and "1")
            or None
        )
    )

    a: int
    b: int
    distance_km: float
    midpoint: list[float]

    @field_validator("distance_km")
    @staticmethod
    def _validate_distance_km(v):
        return round(v, 2)

    @staticmethod
    def find_midpoint(a: np.ndarray, b: np.ndarray) -> np.ndarray:
        norm = np.linalg.norm
        cos = np.cos
        x = np.cross
        asin = np.arcsin
        o = np.dot

        n = (p := x(a, b)) / norm(p)
        angle = asin(norm(p) / (norm(a) * norm(b)))

        # rotate a halfway to b
        # https://en.wikipedia.org/wiki/Rodrigues%27_rotation_formula
        v = a
        k = n
        theta = angle / 2
        v_rot = v * cos(theta) + x(k, v) * sin(theta) + k * o(k, v) * (1 - cos(theta))

        return v_rot


class AirportsResponse(BaseModel):
    airports: list[Airport]
    connections: list[Connection]

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
                    "connections": [
                        {
                            "0": 0,
                            "1": 1,
                            "distance_km": 400.43,
                            "midpoint": [12345.6, 6789.0, 345.6],
                        }
                    ],
                }
            ]
        }
    }
