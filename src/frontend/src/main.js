import * as THREE from "three";
import { createCamera, setControls } from "./components/camera";
import { createRenderer, render } from "./components/renderer";
import { createGlobe, createTable } from "./components/assets";
import { setupLights } from "./components/lights";
import { setupGui } from "./components/gui";
import CameraControls from "camera-controls";
import { createCharacters, GameState } from "./components/gameState";
import { createCard } from "./components/cards";
import { createDie, startDiceRound } from "./components/dice";
import { randomPointOnSphere } from "./components/utils";

const scene = new THREE.Scene();
const camera = createCamera();
const { renderer, selectionPass, hoverPass, composer, interactionManager } =
  createRenderer(scene, camera);

let TESTING_DICE = true

function createCharacterCards() {
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
}

async function setupGame(scene) {
  const { ambientLight, spotlight } = setupLights(scene);
  const spotlightHelper = new THREE.SpotLightHelper(spotlight);
  setupGui(ambientLight, spotlight, spotlightHelper, renderer, scene);
  scene.add(spotlightHelper);

  createTable(scene);

  CameraControls.install({ THREE });
  camera.position.set(0, 100, 100);
  const cameraControls = new CameraControls(camera, renderer.domElement);
  setControls(cameraControls);
  const scheduledCallables = [];

  window.GameState = GameState;

  createCharacterCards();

  if (TESTING_DICE) {
    console.log(cameraControls.getPosition())

    const diceModels = new THREE.Group();
    let dice = [];
    let n = 6;
    for (let i = 0; i < n; i++) {
      const theta = 2 * Math.PI * i / n;
      const die = await createDie(scene);

      const r = 40;
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      die.model.position.set(x, 0, z);

      let randomSpin = randomPointOnSphere().multiplyScalar(10);
      die.setSpin(randomSpin, 6);
      scheduledCallables.push((dt) => die.update(dt));

      dice.push(die);
      diceModels.add(die.model);
    }

    for (let i = 0; i < n; i++) {
      setInterval(() => dice[i].stop(), 1000 + i * 200);
    }

    diceModels.position.set(0, 20, 0);
    scene.add(diceModels);
    await cameraControls.setLookAt(
      camera.position.x, camera.position.y, camera.position.z,
      diceModels.position.x, diceModels.position.y, diceModels.position.z);

    await startDiceRound(6, dice);
  } else {
    const { globeGroup } = await createGlobe(
      interactionManager,
      selectionPass,
      hoverPass
    );
    createCharacters(globeGroup);
    scene.add(globeGroup);
  }

  render(cameraControls, spotlightHelper, scheduledCallables);
}

setupGame(scene);

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
