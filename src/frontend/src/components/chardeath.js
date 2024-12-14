import {
  addCharEventListeners,
  removeAllCharEventListeners,
  removeCharEventListeners,
} from "./cards";

export function characterDeath(charElement) {
  charElement.classList.add("explode");
  setTimeout(() => {
    //removeCharEventListeners(charElement);
    charElement.remove();
  }, 2000);
}
