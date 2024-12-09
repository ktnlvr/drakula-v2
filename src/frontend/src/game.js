export class TokenKind {
    constructor(name, kind_name, description, image = "", effect = () => { }) {
        this.kind_name = kind_name;
        this.name = name;
        this.description = description;
        this.image = image;
        this.effect = effect;
    }
}

export class Dracula {
    constructor() { }
}

const HUNTER_NAME_POOL = ["Abraham Van Helsing", "Rayna Cruz", "Don Quixote", "Arthas Menethil", "Madeline", "Sans Undertale", "Alucard"];

export function getRandomHunterNames(n) {
    const shuffled = [...HUNTER_NAME_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

export class Hunter {
    constructor(name) {
        this.alive = false;
        this.power = 4
        this.speedup = 2

        this.name = name;
        this.resources = {}
    }
}

const TOKEN_KINDS = {
    'trap': new TokenKind('Trap', 'trap', 'Trap an airport!'),
    'garlic': new TokenKind('Garlic', 'garlic', 'Scare dracula away!')
}

export function getTokenKind(kind_name) {
    for (const kind of TOKEN_KINDS)
        if (kind.kind_name == kind_name)
            return kind;
    return null;
}

export class Airport {
    constructor(name, latitude_deg, longitude_deg, iso_country) {
        this.name = name;
        this.latitude_deg = latitude_deg;
        this.longitude_deg = longitude_deg;
        this.iso_country = iso_country;
    }
}

export class GameState {
    constructor(airports, connections) {
        this.airports = airports;
        this.connections = connections;
    }

    getAirport(idx) {
        return this.airports[idx] || null
    }
}
