from pydantic import BaseModel


class Airport(BaseModel):
    name: str
    latitude_deg: float
    longitude_deg: float
    iso_country: str


class AirportsResponse(BaseModel):
    airports: list[Airport]
    connections: list[Airport]
