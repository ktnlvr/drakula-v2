import { matchEndScene } from "./winandloss";

export function Myloop(GameState)
{
	if (isEndGame(GameState)){
		//Add the scene switch here.
		return true;
	}
	MoveDracula(GameState);//This is stupid path decider add wangs funcion here.
	if (hasWorldReachedDestructionLimit(GameState))
		matchEndScene("loss");
	if (isEndGame(GameState)){
		//switch scene here again.
		return true;
	}
}

// Checks if the game has reached its end condition.
// Returns true if any player shares the same airport as Dracula.
export function isEndGame(GameState) {
  for (const element of GameState.characters) {
    if (element.airport.name === GameState.dracula.airport.name) return true;
  }
  return false;
}

// Retrieves a list of airport indices connected to the given airport.
// Returns an array of connected airport indices.
export function getConnectedAirports(GameState, airportIndex) {
  const connectedAirports = [];
  for (let i = 0; i < GameState.connections.length; i++) {
    if (GameState.connections[i]["0"] === airportIndex)
      connectedAirports.push(GameState.connections[i]["1"]);
    else if (GameState.connections[i]["1"] === airportIndex)
      connectedAirports.push(GameState.connections[i]["0"]);
  }
  return connectedAirports;
}

// Moves Dracula to a random connected airport.
// Selects a random airport from the list of connected airports and updates Dracula's location.
export function MoveDracula(GameState) {
  const currentAirportIndex = GameState.dracula.airport.name;
  const connectedAirports = getConnectedAirports(
    GameState,
    currentAirportIndex
  );
  if (connectedAirports.length > 0) {
    const randomIndex = Math.floor(Math.random() * connectedAirports.length);
    const newAirportIndex = connectedAirports[randomIndex];
    GameState.dracula.setAirport(newAirportIndex, true);
  }
}

// Checks if the destruction level of the world has reached or exceeded 60%.
// Returns true if destruction level is 60% or higher, otherwise false.
export function hasWorldReachedDestructionLimit(GameState) {
  let currentDestruction;

  GameState.dracula.totalMoves++;
  currentDestruction =
    (GameState.dracula.totalMoves / GameState.airports.length) * 100;
  console.log(currentDestruction);
  if (currentDestruction >= 60) return true;
  return false;
}