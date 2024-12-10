import * as THREE from "three";
import { createCamera, setControls } from "./components/camera";
import { createRenderer, render } from "./components/renderer";
import { createGlobe, createTable } from "./components/assets";
import { setupLights } from "./components/lights";
import { setupGui } from "./components/gui";
import CameraControls from "camera-controls";
import { GameState, createCharacters } from "./components/gameState";
import { createDie, startDiceRound, rollDice } from "./components/dice";
import { randomPointOnSphere } from "./components/utils";
import { characterDeath } from "./components/chardeath";
import { logInfo } from "./components/logger";
import { matchEndScene } from "./components/winandloss";
import { createCard, cardCounts } from "./components/cards";
import { myloop } from "./components/turnutils";
import { log } from "three/webgpu";

const scene = new THREE.Scene();
const camera = createCamera();
const { renderer, selectionPass, hoverPass, composer, interactionManager } =
  createRenderer(scene, camera);

let TESTING_DICE = false;

function createCharacterCards() {
  const characters = document.querySelector("#characters");
  for (let i = 0; i < GameState.characters.length; i++) {
    const character = GameState.characters[i];
    createCard(characters, i, character, ["ticket", "stake", "garlic"]);
  }
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

  if (TESTING_DICE) {
    console.log(cameraControls.getPosition());

    const diceModels = new THREE.Group();
    let dice = [];
    let n = 6;
    for (let i = 0; i < n; i++) {
      const die = await createDie(scene);

      const width = 150;
      die.model.position.set((width * i) / n - width / 2, 0, 50);

      let randomSpin = randomPointOnSphere().multiplyScalar(10);
      die.setSpin(randomSpin);
      scheduledCallables.push((dt) => die.update(dt));

      dice.push(die);
      diceModels.add(die.model);
    }

    await rollDice(dice);

    diceModels.position.set(0, 20, 0);

    scene.add(diceModels);
    await cameraControls.setLookAt(
      camera.position.x,
      camera.position.y,
      camera.position.z,
      diceModels.position.x,
      diceModels.position.y,
      diceModels.position.z
    );

    await startDiceRound(6, dice);
  } else {
    const { globeGroup } = await createGlobe(
      interactionManager,
      selectionPass,
      hoverPass
    );
    createCharacters(globeGroup);
    scene.add(globeGroup);
    createCharacterCards();
  }

  render(cameraControls, spotlightHelper, scheduledCallables);
  /* Example actions
  logInfo("Hello this is a fucking cat.");
  matchEndScene("loss");
  characterDeath(document.querySelector('[char-id="2"]'));
  */
  document.querySelector(".end-turn-button").addEventListener("click", () => {
    if (GameState.scene === "Overworld") {
      if (myloop(GameState)) {
        cameraControls.setLookAt(0, 80, 70, 0, 0, 0, true);
      } else {
        cameraControls.setLookAt(0, 80, 99, 0, 60, 0, true);
      }
    }
  });
  logInfo("It displays the logs with current time attached to it.");
  logInfo("It also has a spooky-text effect when it appears.");
  logInfo(
    "The logger also handles overflows so you can scroll and see the logs from before and not loss them."
  );
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
