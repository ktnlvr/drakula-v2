import { matchEndScene } from "./winandloss";

//This function needs to be integrated into a bigger game loop this is the part i had to do.
export function myloop(gamestate)
{
	if (isEndGame(gamestate)){
		//Add the scene switch here to gambling.
		return true;
	}
	moveDracula(gamestate);//This is stupid path decider add wangs funcion here.
	if (hasWorldReachedDestructionLimit(gamestate))
		matchEndScene("loss");
	if (isEndGame(gamestate)){
		//switch scene here again.
		return true;
	}
  return null;
}

// Checks if the game has reached its end condition.
// Returns true if any player shares the same airport as Dracula.
export function isEndGame(gamestate) {
  for (const element of gamestate.characters) {
    if (element.airport.name === gamestate.dracula.airport.name) return true;
  }
  return false;
}

// Retrieves a list of airport indices connected to the given airport.
// Returns an array of connected airport indices.
export function getConnectedAirports(gamestate, airportIndex) {
  const connectedAirports = [];
  for (let i = 0; i < gamestate.connections.length; i++) {
    if (gamestate.connections[i]["0"] === airportIndex)
      connectedAirports.push(gamestate.connections[i]["1"]);
    else if (gamestate.connections[i]["1"] === airportIndex)
      connectedAirports.push(gamestate.connections[i]["0"]);
  }
  return connectedAirports;
}

// Moves Dracula to a random connected airport.
// Selects a random airport from the list of connected airports and updates Dracula's location.
export function moveDracula(gamestate) {
  const currentAirportIndex = gamestate.dracula.airport.name;
  const connectedAirports = getConnectedAirports(
    gamestate,
    currentAirportIndex
  );
  if (connectedAirports.length > 0) {
    const randomIndex = Math.floor(Math.random() * connectedAirports.length);
    const newAirportIndex = connectedAirports[randomIndex];
    gamestate.dracula.setAirport(newAirportIndex, true);
  }
}

// Checks if the destruction level of the world has reached or exceeded 60%.
// Returns true if destruction level is 60% or higher, otherwise false.
export function hasWorldReachedDestructionLimit(gamestate) {
  let currentDestruction;

  gamestate.dracula.totalMoves++;
  currentDestruction =
    (gamestate.dracula.totalMoves / gamestate.airports.length) * 100;
  console.log(`World destruction : ${currentDestruction}`);
  if (currentDestruction >= 60) return true;
  return false;
}