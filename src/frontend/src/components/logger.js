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

export function logInfo(logMessage) {
  const parent = document.querySelector(".logs");
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement("p");
  logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> <span class="spooky-text">${logMessage}</span>`;
  logEntry.classList.add("spooky-text");
  parent.appendChild(logEntry);
}
