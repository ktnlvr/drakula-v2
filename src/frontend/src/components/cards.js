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
  console.log("Decrement here and add changes according to yourself.");
  p.textContent = `x${cardCounts[characterId][tokenId]}`;
}

function tooltip(tokenType) {
  if (tokenType === "square") {
    return `This is a trap.`;
  } else {
    return `This is nothing.`;
  }
}

function getCharacterPortraitPath(name) {
  return `/portraits/${name.toLowerCase().replaceAll(' ', '-')}.png`;
}

function createCard(parent, charId, name, tokenTypes = []) {
  /// XXX: refactor me
  initializeCardCounts(charId, tokenTypes);
  const characterBlock = document.createElement("div");
  characterBlock.id = "character-block";
  characterBlock.setAttribute("char-id", charId);
  const characterImgContainer = document.createElement("div");
  characterImgContainer.className = "character-img-container";
  const characterImg = document.createElement("img");
  characterImg.className = "character-img";

  characterImg.src = getCharacterPortraitPath(name);
  characterImgContainer.appendChild(characterImg);
  const cardInfo = document.createElement("div");
  cardInfo.className = "card-info";
  const cardInfoP = document.createElement("p");
  cardInfoP.className = "card-info-p";
  cardInfoP.textContent = name;
  const cardInfoToken = document.createElement("div");
  cardInfoToken.className = "card-info-plaque";
  tokenTypes.forEach((tokenType, index) => {
    const group = document.createElement('div');
    group.classList.add("token-group")

    const token = document.createElement("div");
    token.classList.add("token-square", tokenType);
    token.setAttribute("data-tooltip", `${tooltip(tokenType)}`);
    token.setAttribute("token-no", index + 1);
    token.addEventListener("click", () => {
      console.log(
        `Clicked ${tokenType} card for Character ${charId}, Token No: ${index + 1
        }`
      );
      updateTokenCount(token);
    });

    const tokenCount = document.createElement("p");
    tokenCount.classList.add("card-count");
    tokenCount.textContent = "x0";

    group.appendChild(token);
    group.appendChild(tokenCount);

    cardInfoToken.appendChild(group);
  });
  cardInfo.appendChild(cardInfoP);
  cardInfo.appendChild(cardInfoToken);
  characterBlock.appendChild(characterImgContainer);
  characterBlock.appendChild(cardInfo);
  parent.appendChild(characterBlock);
}
export {
  cardCounts,
  initializeCardCounts,
  updateTokenCount,
  tooltip,
  createCard,
};
