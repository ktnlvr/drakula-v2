import * as THREE from "three";
import { createCamera, setControls } from "./components/camera";
import { createRenderer, render } from "./components/renderer";
import { createGlobe, createTable } from "./components/assets";
import { setupLights } from "./components/lights";
import { setupGui } from "./components/gui";
import CameraControls from "camera-controls";
import { createCharacters, GameState } from "./components/gameState";
import { characterDeath } from "./components/chardeath";
import { logInfo } from "./components/logger";
import { matchEndScene } from "./components/winandloss";
import { createCard, cardCounts } from "./components/cards";
import { myloop} from './components/turnutils'
import { log } from "three/webgpu";

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
    "teleport",
    "stake",
    "garlic"
  ]);
  createCard(characters, 1, "https://placecats.com/100/100", "Cat", [
    "teleport",
    "stake",
    "garlic"
  ]);
  createCard(characters, 2, "https://placecats.com/100/100", "Cat", [
    "teleport",
    "stake",
    "garlic"
  ]);
  createCard(characters, 3, "https://placecats.com/100/100", "Cat", [
    "teleport",
    "stake",
    "garlic"
  ]);
  createCard(characters, 4, "https://placecats.com/100/100", "Cat", [
    "teleport",
    "stake",
    "garlic"
  ]);
  render(cameraControls, spotlightHelper);
  /* Example actions
  logInfo("Hello this is a fucking cat.");
  matchEndScene("loss");
  characterDeath(document.querySelector('[char-id="2"]'));
  */
  document.querySelector(".end-turn-button").addEventListener('click',() => {
    if (myloop(GameState))
    {
      console.log("have not added the scene yet. Please add it.");
    }
    else
    {
      console.log("have not added the scene yet. Please add it.");
    }
  })
  logInfo("It displays the logs with current time attached to it.")
  logInfo("It also has a spooky-text effect when it appears.");
  logInfo("The logger also handles overflows so you can scroll and see the logs from before and not loss them.")
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