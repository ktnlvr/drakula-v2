/**
	move (with character)
	character death
	game end
	getting items(dracula and player both can get one)
	exchanging items
**/

export const LogEventTypes = {
  MOVE: "move",
  CHARACTER_DEATH: "character_death",
  GAME_END: "game_end",
  ITEM_ACQUISITION: "item_acquisition",
  ITEM_EXCHANGE: "item_exchange",
};

export function LogInfo({
  parent,
  event,
  initiator,
  receiver = null,
  itemName = null,
  initiatorItems = [],
  receiverItems = [],
  moveDestination = null,
  airportsTravelled = null,
  initiatorLocation = null,
}) {
  let logMessage = "";

  if (
    event === LogEventTypes.MOVE &&
    initiator &&
    moveDestination &&
    airportsTravelled
  )
    logMessage = `${initiator} moved to ${moveDestination} after travelling ${airportsTravelled} number of airports.`;
  else if (
    event === LogEventTypes.CHARACTER_DEATH &&
    initiator &&
    initiatorLocation
  )
    logMessage = `${initiator} has died on airport ${initiatorLocation}.`;
  else if (event === LogEventTypes.GAME_END && initiator)
    logMessage = `Game has ended. ${initiator} has won.`;
  else if (
    event === LogEventTypes.ITEM_ACQUISITION &&
    initiator &&
    itemName &&
    initiatorLocation
  )
    logMessage = `${initiator} has aquired ${itemName}} on ${initiatorLocation} airport.`;
  else if (
    event === LogEventTypes.ITEM_EXCHANGE &&
    initiator &&
    initiatorItems &&
    receiverItems
  ) {
    if (receiverItems.length === 0)
      logMessage = `${initiator} has given ${initiatorItems} to ${receiver}.`;
    else
      logMessage = `${initiator} has exchanged ${initiatorItems} with ${receiver} for ${receiverItems}`;
  } else logMessage = `Unknown event.z`;

  console.log(parent);
  if (parent || logMessage) {
    const logEntry = document.createElement("p");
    logEntry.textContent = logMessage;
    logEntry.style.marginBottom = "8px";
    logEntry.style.fontFamily = "Roboto Mono, monospace";
    logEntry.style.color = "#fff";
    parent.appendChild(logEntry);
  }
}
