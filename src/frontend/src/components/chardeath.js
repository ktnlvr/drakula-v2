import {
  addCharEventListeners,
  removeAllCharEventListeners,
  removeCharEventListeners,
} from "./cards";

function reapplyListeners() {
  const charId = [0, 1, 2, 3];

  const characters = document.querySelectorAll(".character-img-container");
  characters.forEach((charImg) => {
    charImg.removeEventListener("click", () =>
      handleCharacterImgClick(charId, charPass)
    );
    char.addEventListener("click", handleCharacterClick);
  });
}

export function characterDeath(charElement) {
  charElement.classList.add("explode");
  setTimeout(() => {
    //removeCharEventListeners(charElement);
    charElement.remove();
  }, 2000);
  reapplyListeners();
}
