import { GameState } from "./gameState";

const cardCounts = {};

function initializeCardCounts(charId, tokenTypes) {
  if (!cardCounts[charId]) {
    cardCounts[charId] = {};
  }
  tokenTypes.forEach((_, index) => {
    cardCounts[charId][index + 1] = 0;
  });
}

function updateTokenCount(token) {
  const character = token.closest("#character-block");
  const characterId = character.getAttribute("char-id");
  const p = token.nextElementSibling;
  const tokenId = token.getAttribute("token-no");
  cardCounts[characterId][tokenId] += 1;
  console.log(`The new value is ${cardCounts[characterId][tokenId]}`);
  p.textContent = `x${cardCounts[characterId][tokenId]}`;
}

function tooltip(tokenType) {
  if (tokenType === "ticket") {
    return "Use and select an airport to teleport to.";
  } else if (tokenType === "stake") {
    return "Removes the Dracula's dice.";
  } else if (tokenType === "garlic") {
    return "Avoids the battle";
  } else {
    return `This is nothing.`;
  }
}

function getCharacterPortraitPath(name) {
  return `/portraits/${name.toLowerCase().replaceAll(" ", "-")}.png`;
}

export default function updateMovesInUI() {
  const cards = document.querySelectorAll("#haste");
  const edges = document.querySelectorAll("#edge");
  console.log("Changing the moves of all the characters.");
  GameState.characters.forEach((char, index) => {
    if (GameState.deadCharacters.includes(index.toString())) return;
    if (cards[index]) {
      cards[index].innerHTML = `(${char.totalMoves}/${char.haste})`;
    }
  });
  GameState.characters.forEach((char, index) => {
    if (GameState.deadCharacters.includes(index.toString())) return;
    if (cards[index]) {
      edges[index].innerHTML = `${char.edge}`;
    }
  });
}

export function removeAllCharEventListeners() {
  const characters = document.querySelectorAll("#character-block");
  characters.forEach((character, index) => {
    removeCharEventListeners(character);
  });
}

export function addAllCharEventListeners() {
  const characters = document.querySelectorAll("#character-block");
  characters.forEach((character, index) => {
    addCharEventListeners(character);
  });
}

export function addCharEventListeners(char) {
  const charImg = char.querySelector(".character-img");
  const tokenImages = char.querySelectorAll(".token-img");

  if (charImg) charImg.addEventListener("click", handleCharacterImgClick);
  tokenImages.forEach((tokenImage) => {
    tokenImage.addEventListener("click", handleTokenClick);
    tokenImage.addEventListener("mouseenter", handleMouseEnterToken);
    tokenImage.addEventListener("mousemove", handleMouseMoveToken);
    tokenImage.addEventListener("mouseleave", handleMouseLeaveToken);
  });
}

export function removeCharEventListeners(char) {
  const charImg = char.querySelector(".character-img");
  const tokenImages = char.querySelectorAll(".token-img");
  console.log(charImg, tokenImages);

  if (charImg) charImg.removeEventListener("click", handleCharacterImgClick);
  tokenImages.forEach((tokenImage) => {
    tokenImage.removeEventListener("click", handleTokenClick);
    tokenImage.removeEventListener("mouseenter", handleMouseEnterToken);
    tokenImage.removeEventListener("mousemove", handleMouseMoveToken);
    tokenImage.removeEventListener("mouseleave", handleMouseLeaveToken);
  });
}

const handleCharacterImgClick = (charId, charPass) => {
  if (GameState.characters[charId]) {
    console.log(`Clicked ${charId}`);
    charPass.selectedObjects = [GameState.characters[charId].mesh];
    GameState.selectedCharacter = charId;
  }
};

const handleTokenClick = (tokenType, charId, token, index) => {
  console.log(
    `Clicked ${tokenType} card for Character ${charId}, Token No: ${index + 1}`
  );
  updateTokenCount(token);
};

const handleMouseEnterToken = (token, tooltipDiv, tokenType, e) => {
  token.classList.remove("visible");
  token.classList.add("hidden");
  setTimeout(() => {
    token.src = `./icon_images/${tokenType}_hover.svg`;
    token.classList.remove("hidden");
  }, 200);
  token.classList.remove("hidden");
  token.classList.add("visible");
  document.body.appendChild(tooltipDiv);
  tooltipDiv.style.visibility = "visible";
  tooltipDiv.style.top = `${e.clientY + 10}px`;
  tooltipDiv.style.left = `${e.clientX + 10}px`;
};

const handleMouseMoveToken = (tooltipDiv, e) => {
  tooltipDiv.style.top = `${e.clientY + 10}px`;
  tooltipDiv.style.left = `${e.clientX + 10}px`;
};

const handleMouseLeaveToken = (token, tooltip, tooltipDiv, tokenType) => {
  token.classList.remove("visible");
  token.classList.add("hidden");
  setTimeout(() => {
    token.src = `./icon_images/${tokenType}.svg`;
    setTimeout(() => {
      token.classList.remove("hidden");
      token.classList.add("visible");
    }, 50);
  }, 200);
  token.classList.remove("hidden");
  token.classList.add("visible");
  tooltipDiv.style.visibility = "hidden";
  document.body.removeChild(tooltipDiv);
};

function createCard(parent, charId, character, tokenTypes = [], charPass) {
  /// XXX: refactor me
  initializeCardCounts(charId, tokenTypes);
  const characterBlock = document.createElement("div");
  characterBlock.id = "character-block";
  characterBlock.setAttribute("char-id", charId);
  const characterImgContainer = document.createElement("div");
  characterImgContainer.className = "character-img-container";
  const characterImg = document.createElement("img");
  characterImg.className = "character-img";

  characterImg.src = getCharacterPortraitPath(character.name);
  characterImgContainer.appendChild(characterImg);
  characterImgContainer.addEventListener("click", () =>
    handleCharacterImgClick(charId, charPass)
  );
  const cardInfo = document.createElement("div");
  cardInfo.className = "card-info";
  const cardInfoP = document.createElement("p");
  cardInfoP.className = "card-info-p";
  cardInfoP.innerHTML = `
    <span class="card-info-hunter-name">${character.name}</span>
    <br>
    <span class="stats">
      <img class="stat-icon" src="/icons/capacity.svg"><p class="stat-value">${character.capacity}</p>
      <img class="stat-icon" src="/icons/edge.svg"><p class="stat-value" id="edge">${character.edge}</p>
      <img class="stat-icon" src="/icons/haste.svg"><p class="stat-value" id="haste">(${character.haste}/${character.haste})</p>
    </span>
  `;
  console.log(character.edge);

  const cardInfoToken = document.createElement("div");
  cardInfoToken.className = "card-info-plaque";
  tokenTypes.forEach((tokenType, index) => {
    const group = document.createElement("div");
    group.classList.add("token-group");
    const token = document.createElement("img");
    token.classList.add("token-image", tokenType);
    if (tokenType === "ticket") {
      token.addEventListener("click", () => {
        GameState.ticketCharacter = charId;
      });
    }
    token.src = `./icon_images/${tokenType}.svg`;

    token.setAttribute("data-tooltip", `${tooltip(tokenType)}`);
    token.setAttribute("token-no", index + 1);
    token.addEventListener("click", () =>
      handleTokenClick(tokenType, charId, token, index)
    );

    const tokenCount = document.createElement("p");
    tokenCount.classList.add("card-count");
    tokenCount.textContent = "x0";

    group.appendChild(token);
    group.appendChild(tokenCount);

    cardInfoToken.appendChild(group);

    const tooltipDiv = document.createElement("div");
    tooltipDiv.classList.add("tooltip");
    tooltipDiv.textContent = tooltip(tokenType);
    tooltipDiv.style.position = "absolute";
    tooltipDiv.style.visibility = "hidden";
    tooltipDiv.style.background =
      "linear-gradient(135deg, rgba(60, 0, 0, 0.8), rgba(128, 0, 128, 0.8))";
    tooltipDiv.style.color = "white";
    tooltipDiv.style.padding = "5px";
    tooltipDiv.style.borderRadius = "5px";
    tooltipDiv.style.fontSize = "12px";
    tooltipDiv.style.whiteSpace = "nowrap";
    tooltipDiv.style.pointerEvents = "none";
    token.addEventListener("mouseenter", (e) =>
      handleMouseEnterToken(token, tooltipDiv, tokenType, e)
    );
    token.addEventListener("mousemove", (e) =>
      handleMouseMoveToken(tooltipDiv, e)
    );
    token.addEventListener("mouseleave", () =>
      handleMouseLeaveToken(token, tooltip, tooltipDiv, tokenType)
    );
  });
  cardInfo.appendChild(cardInfoP);
  cardInfo.appendChild(cardInfoToken);
  characterBlock.appendChild(characterImgContainer);
  characterBlock.appendChild(cardInfo);
  parent.appendChild(characterBlock);
}
export { initializeCardCounts, updateTokenCount, tooltip, createCard };
