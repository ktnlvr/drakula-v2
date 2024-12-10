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
  if (tokenType === "teleport") {
    return "Allow the player to move Combat Items.";
  } 
  else if (tokenType === "stake") {
    return "Removes the Dracula's dice.";
  }
  else if (tokenType === "garlic") {
    return "Avoids the battle";
  }
  else {
    return `This is nothing.`;
  }
}

function getPath(tokenType)
{
  if (tokenType === "teleport") {
    return "./icon_images/ticket.svg";
  } 
  else if (tokenType === "stake") {
    return "./icon_images/stake-hammer.svg";
  }
  else if (tokenType === "garlic") {
    return "./icon_images/garlic.svg";
  }
  else {
    return ``;
  }
}

function getHoveredPath(tokenType) {
  if (tokenType === "teleport") {
    return "./icon_images/ticket (1).svg";
  } 
  else if (tokenType === "stake") {
    return "./icon_images/stake-hammer (1).svg";
  }
  else if (tokenType === "garlic") {
    return "./icon_images/garlic (1).svg";
  }
  else {
    return "";
  }
}

function createCard(parent, charId, imgSrc, imgAlt, tokenTypes = []) {
  initializeCardCounts(charId, tokenTypes);
  const characterName = imgAlt;
  const characterBlock = document.createElement("div");
  characterBlock.id = "character-block";
  characterBlock.setAttribute("char-id", charId);
  const characterImgContainer = document.createElement("div");
  characterImgContainer.className = "character-img-container";
  const characterImg = document.createElement("img");
  characterImg.className = "character-img";
  characterImg.src = imgSrc;
  characterImg.alt = imgAlt;
  characterImgContainer.appendChild(characterImg);
  const cardInfo = document.createElement("div");
  cardInfo.className = "card-info";
  const cardInfoP = document.createElement("p");
  cardInfoP.className = "card-info-p";
  cardInfoP.textContent = `${characterName}`;
  const cardInfoToken = document.createElement("div");
  cardInfoToken.className = "card-info-token";
  tokenTypes.forEach((tokenType, index) => {
    const token = document.createElement("img");
    token.classList.add("token-image", tokenType);
    token.src = `${getPath(tokenType)}`;
    token.setAttribute("data-tooltip", `${tooltip(tokenType)}`);
    token.setAttribute("token-no", index + 1);
    token.addEventListener("click", () => {
      console.log(
        `Clicked ${tokenType} card for Character ${charId}, Token No: ${
          index + 1
        }`
      );
      updateTokenCount(token);
    });
    const tooltipDiv = document.createElement("div");
    tooltipDiv.classList.add("tooltip");
    tooltipDiv.textContent = tooltip(tokenType);
    tooltipDiv.style.position = "absolute";
    tooltipDiv.style.visibility = "hidden";
    tooltipDiv.style.background = "linear-gradient(135deg, rgba(60, 0, 0, 0.8), rgba(128, 0, 128, 0.8))";
    tooltipDiv.style.color = "white";
    tooltipDiv.style.padding = "5px";
    tooltipDiv.style.borderRadius = "5px";
    tooltipDiv.style.fontSize = "12px";
    tooltipDiv.style.whiteSpace = "nowrap";
    tooltipDiv.style.pointerEvents = "none";
    token.addEventListener("mouseenter", (e) => {
      token.classList.remove("visible");
      token.classList.add("hidden");
      setTimeout(() => {
        token.src = `${getHoveredPath(tokenType)}`;
        token.classList.remove("hidden");
      }, 200);
      token.classList.remove("hidden");
      token.classList.add("visible");
      document.body.appendChild(tooltipDiv);
      tooltipDiv.style.visibility = "visible";
      tooltipDiv.style.top = `${e.clientY + 10}px`;
      tooltipDiv.style.left = `${e.clientX + 10}px`;
    });
    token.addEventListener("mousemove", (e) => {
      tooltipDiv.style.top = `${e.clientY + 10}px`;
      tooltipDiv.style.left = `${e.clientX + 10}px`;
    });
    token.addEventListener("mouseleave", () => {
      token.classList.remove("visible");
      token.classList.add("hidden");
      setTimeout(() => {
        token.src = `${getPath(tokenType)}`;
        setTimeout(() => {
          token.classList.remove("hidden");
          token.classList.add("visible");
        }, 50);
      }, 200);
      token.classList.remove("hidden");
      token.classList.add("visible");
      tooltipDiv.style.visibility = "hidden";
      document.body.removeChild(tooltipDiv);
    });
    const cardCount = document.createElement("p");
    cardCount.classList.add("card-count");
    cardCount.textContent = "x0";
    cardInfoToken.appendChild(token);
    cardInfoToken.appendChild(cardCount);
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
