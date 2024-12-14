import { GameState } from "./gameState";
import { globeGroup, cameraControls, changeScene } from "../main";

export const MatchResult = {
  WIN: "win",
  LOSS: "loss",
};

export function matchEndScene(result) {
  GameState.scene = "Overworld";
  changeScene(globeGroup, cameraControls);
  const gameOver = document.getElementById("game-over");
  const gameMsg = document.getElementById("game-result");
  const button = document.getElementById("try-button");
  const endButton = document.querySelector(".end-turn-button");
  const logger = document.querySelector(".logger-box");

  logger.style.zIndex = "-1";
  endButton.classList.add("hidden");
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
    location.reload();
  });
}
