import * as THREE from "three";
import { createCamera, setControls } from "./components/camera";
import { createGlobe, createTable } from "./components/assets";
import { setupLights } from "./components/lights";
import { createRenderer, render } from "./components/renderer";
import { setupGui } from "./components/gui";
import { winorloss } from "./components/winandloss"
import CameraControls from "camera-controls";

const scene = new THREE.Scene();
const camera = createCamera();
const { renderer, outlinePass, composer, interactionManager } = createRenderer(
  scene,
  camera
);

scene.add(createGlobe(interactionManager, outlinePass));
scene.add(createTable());

const { ambientLight, spotlight } = setupLights(scene);
const spotlightHelper = new THREE.SpotLightHelper(spotlight);
setupGui(ambientLight, spotlight, spotlightHelper, renderer, scene);
scene.add(spotlightHelper);

CameraControls.install({ THREE });
const cameraControls = new CameraControls(camera, renderer.domElement);
setControls(cameraControls);

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
  //This is the token clicking hook here you can change and get info of the selected token ,inc or dec the count corresponding count to it.
  //Remember to update the cardCounts data structure accordingly for smoother data storing.
  const character = token.closest("#character-block");
  const characterId = character.getAttribute("char-id");
  const p = token.nextElementSibling;
  const tokenId = token.getAttribute("token-no");
  cardCounts[characterId][tokenId] += 1;
  console.log(`The new value is ${cardCounts[characterId][tokenId]}`);
  console.log("Decreament here and add changes according to yourself.");
  p.textContent = `x${cardCounts[characterId][tokenId]}`;
}

function tooltip(tokenType) {
  if (tokenType === "square") return `This is a trap.`;
  else return `This is nothing.`;
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
  cardInfoP.textContent = `My name is ${characterName}`;
  const cardInfoToken = document.createElement("div");
  cardInfoToken.className = "card-info-token";
  tokenTypes.forEach((tokenType, index) => {
    const token = document.createElement("div");
    token.classList.add("token", tokenType);
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
createCard(characters, 1, "https://placecats.com/100/100", "Cat", [
  "square",
  "square",
]);
createCard(characters, 2, "https://placecats.com/100/100", "Cat", [
  "square",
  "square",
]);
createCard(characters, 3, "https://placecats.com/100/100", "Cat", [
  "square",
  "square",
]);
createCard(characters, 4, "https://placecats.com/100/100", "Cat", [
  "square",
  "square",
  "square",
]);
createCard(characters, 5, "https://placecats.com/100/100", "Cat", [
  "square",
  "square",
]);

render(cameraControls, spotlightHelper);

window.addEventListener(
  "resize",
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);
winorloss(true)