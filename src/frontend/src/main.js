import * as THREE from "three";
import { createCamera, setControls } from "./components/camera";
import { createRenderer, render } from "./components/renderer";
import { createGlobe, createTable } from "./components/assets";
import { setupLights } from "./components/lights";
import { setupGui } from "./components/gui";
import CameraControls from "camera-controls";
import { createCharacters, GameState } from "./components/gameState";
import { createCard } from "./components/cards";

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
  for (let i = 0; i < GameState.characters.length; i++) {
    const character = GameState.characters[i];
    createCard(characters, i, character, [
      "square",
      "square",
    ]);
  }

  render(cameraControls, spotlightHelper);
  /* Example actions
  logInfo("Hello this is a fucking cat.");
  matchEndScene("loss");
  characterDeath(document.querySelector('[char-id="2"]'));
  */
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
