import * as THREE from "three";
import { createCamera, setControls } from "./components/camera";
import { createRenderer, render } from "./components/renderer";
import { createGlobe, createTable } from "./components/assets";
import { setupLights } from "./components/lights";
import { setupGui } from "./components/gui";
import { matchEndScene } from "./components/winandloss";
import CameraControls from "camera-controls";
import { createCharacters, GameState } from "./components/gameState";
import { characterDeath } from "./components/chardeath";
import { logInfo } from "./components/logger";
import { createCard, cardCounts } from "./components/cards";

const scene = new THREE.Scene();
const camera = createCamera();
const { renderer, selectionPass, hoverPass, composer, interactionManager } =
  createRenderer(scene, camera);

async function setupGame() {
  const { globeGroup } = await createGlobe(
    interactionManager,
    selectionPass,
    hoverPass
  );
  scene.add(globeGroup);
  createTable(scene);

  createCharacters(globeGroup);
  window.GameState = GameState;

  const { ambientLight, spotlight } = setupLights(scene);
  const spotlightHelper = new THREE.SpotLightHelper(spotlight);
  setupGui(ambientLight, spotlight, spotlightHelper, renderer, scene);
  scene.add(spotlightHelper);

  CameraControls.install({ THREE });
  const cameraControls = new CameraControls(camera, renderer.domElement);
  setControls(cameraControls);
  const characters = document.querySelector("#characters");
  createCard(characters, 0, "https://placecats.com/100/100", "Cat", [
    "square",
    "square",
  ]);
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
    "square",
  ]);
  createCard(characters, 4, "https://placecats.com/100/100", "Cat", [
    "square",
    "square",
  ]);
  characterDeath(document.querySelector('[char-id="2"]'));
  render(cameraControls, spotlightHelper);
  const logger = document.querySelector(".logs");
  logInfo("Hello this is a fucking cat.");
  matchEndScene("loss");
}

setupGame().catch(console.error);

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
