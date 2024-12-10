export const MatchResult = {
  WIN: "win",
  LOSS: "loss",
};

export function matchEndScene(result) {
  const gameOver = document.getElementsByClassName("game-over")[0];
  const gameMsg = document.getElementById("game-result");
  const button = document.getElementById("try-button");
  gameOver.style.zIndex = "1000";
  gameOver.style.display = "flex";
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
