import {
  addCharEventListeners,
  removeAllCharEventListeners,
  removeCharEventListeners,
} from "./cards";
import { handleCharacterImgClick } from "./cards";

function reapplyListeners() {
  const charId = [0, 1, 2, 3];

  const characters = document.querySelectorAll(".character-img-container");
  characters.forEach((charImg) => {
    charImg.removeEventListener("click",
      handleCharacterImgClick
    );
    charImg.addEventListener("click", handleCharacterImgClick);
    console.log("I am repplying shit.")
  }
);
}

export function characterDeath(charElement) {
  charElement.classList.add("explode");
  setTimeout(() => {
    //removeCharEventListeners(charElement);
    charElement.remove();
  }, 2000);
  reapplyListeners();
}