import {
  addCharEventListeners,
  removeAllCharEventListeners,
  removeCharEventListeners,
} from "./cards";
import { GameState } from "./gameState";

export function characterDeath(charElement) {
  charElement.classList.add("explode");
  setTimeout(() => {
    //removeCharEventListeners(charElement);
    //GameState.diedCharacters++;
  }, 2000);
}