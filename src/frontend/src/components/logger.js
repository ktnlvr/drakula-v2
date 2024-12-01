/**
	move (with character)
	character death
	game end
	getting items(dracula and player both can get one)
	exchanging items
**/

export const LogEventTypes = {
  MOVE: "move",
  CHARACTER_DEATH: "characterDeath",
  GAME_END: "gameEnd",
  ITEM_ACQUISITION: "itemAcquisition",
  ITEM_EXCHANGE: "itemExchange",
};

export function logInfo({
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
  const timestamp = new Date().toLocaleTimeString();
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
    logEntry.innerHTML =  `<span class="timestamp">[${timestamp}]</span> <span class="spooky-text">${logMessage}</span>`;
    logEntry.classList.add("spooky-text");
    parent.appendChild(logEntry);
  }
}
