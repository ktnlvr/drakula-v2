import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.z = 5;

function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

const cardCounts = {
  1: { 1: 0, 2: 0 },
  2: { 1: 0, 2: 0 },
  3: { 1: 0, 2: 0 },
  4: { 1: 0, 2: 0 },
  5: { 1: 0, 2: 0 }
};

function updateTokenCount(token) {
  //This is the token clicking hook here you can change and get info of the selected token ,inc or dec the count corresponding count to it.
  //Remember to update the cardCounts data structure accordingly for smoother data storing.
  const character = token.closest("#character-block");
  const characterId = character.getAttribute("char-id");
  const p = token.nextElementSibling;
  const tokenId = token.getAttribute("token-no");
  cardCounts[characterId][tokenId] += 1;
  console.log(`The new value is ${cardCounts[characterId][tokenId]}`)
  console.log("Decreament here and add changes according to yourself.");
  p.textContent = `x${cardCounts[characterId][tokenId]}`;
}

function tooltip(tokenType){
    if (tokenType === "square")
        return `This is a trap.`
    else
        return `This is nothing.`
}

function createCard(parent, charId, imgSrc, imgAlt, tokenTypes = []) {
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
    cardInfoP.textContent = `My name is ${characterName}`;
    const cardInfoToken = document.createElement("div");
    cardInfoToken.className = "card-info-token";
    tokenTypes.forEach((tokenType, index) => {
        const token = document.createElement("div");
        token.classList.add("token", tokenType);
        token.setAttribute("data-tooltip", `${tooltip(tokenType)}`);
        token.setAttribute("token-no", index + 1);
        token.addEventListener("click", () => {
            console.log(`Clicked ${tokenType} card for Character ${charId}, Token No: ${index + 1}`);
            updateTokenCount(token);
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
const characters = document.querySelector("#characters");
createCard(characters, 1, "https://placecats.com/100/100", "Cat", ["square","square"]);
createCard(characters, 2, "https://placecats.com/100/100", "Cat", ["square","square"]);
createCard(characters, 3, "https://placecats.com/100/100", "Cat", ["square","square"]);
createCard(characters, 4, "https://placecats.com/100/100", "Cat", ["square","square"]);
createCard(characters, 5, "https://placecats.com/100/100", "Cat", ["square","square"]);