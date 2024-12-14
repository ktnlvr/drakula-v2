import { removeGameIdCookie } from './main.js';

export const MatchResult = {
  WIN: "win",
  LOSS: "loss",
};

export function matchEndScene(result) {
  const gameOver = document.getElementById("game-over");
  const gameMsg = document.getElementById("game-result");
  const button = document.getElementById("try-button");
  gameOver.classList.remove("hidden");

  if (result === MatchResult.WIN) {
    gameMsg.innerHTML = "You Win!";
    button.innerHTML = "Play again";
  } else {
    gameMsg.innerHTML = "You lose!";
  }
  button.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Reloading the page");
    removeGameIdCookie();
    location.reload();
  });
}
