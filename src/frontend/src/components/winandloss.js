export function winorloss(iswin){
	const gameOver = document.getElementsByClassName("game-over")[0];
	const gameMsg = document.getElementById("game-result");
	const button = document.querySelector("#try-button");
	if (iswin)
	{
		gameOver.style.zIndex = "1000";
		gameMsg.innerHTML = `You Win!`;
		button.innerHTML = `Play again`;
	}
	else
	{
		gameOver.style.zIndex = "1000";
		gameMsg.innerHTML = `You lose!`;
	}
	button.addEventListener("click",(e) => {
		e.preventDefault()
		console.log("Reloading the page");
		location.reload();
	})
}

/*var old_element = document.getElementById("btn");
var new_element = old_element.cloneNode(true);
old_element.parentNode.replaceChild(new_element, old_element);*/