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
import { createCard } from "./components/cards";
import { myloop } from "./components/turnutils";
import { matchEndScene } from "./components/winandloss";
import { logInfo } from "./components/logger";
import { characterDeath } from "./components/chardeath";

const scene = new THREE.Scene();
const camera = createCamera();
const {
  renderer,
  selectionPass,
  hoverPass,
  charPass,
  composer,
  interactionManager,
} = createRenderer(scene, camera);

function createCharacterCards() {
  const characters = document.querySelector("#characters");
  for (let i = 0; i < GameState.characters.length; i++) {
    const character = GameState.characters[i];
    createCard(
      characters,
      i,
      character,
      ["ticket", "stake", "garlic"],
      charPass
    );
  }
}

async function setupGame(scene) {
  const { ambientLight, spotlight } = setupLights(scene);
  const spotlightHelper = new THREE.SpotLightHelper(spotlight);
  //setupGui(ambientLight, spotlight, spotlightHelper, renderer, scene);
  scene.add(spotlightHelper);
  spotlightHelper.visible = false;

  createTable(scene);

  CameraControls.install({ THREE });
  camera.position.set(0, 100, 100);
  const cameraControls = new CameraControls(camera, renderer.domElement);
  setControls(cameraControls);
  const scheduledCallables = [];

  window.GameState = GameState;

  const { globeGroup } = await createGlobe(
    interactionManager,
    selectionPass,
    hoverPass
  );
  createCharacters(globeGroup);
  scene.add(globeGroup);
  createCharacterCards();
  GameState.markAirport(8, true);
  GameState.markAirport(7, true);
  GameState.markAirport(3, true);

  render(cameraControls, spotlightHelper, scheduledCallables);

  return { globeGroup, cameraControls, scheduledCallables };
}

const { globeGroup, cameraControls, scheduledCallables } = await setupGame(
  scene
);

async function changeScene(globeGroup, cameraControls) {
  const diceModels = new THREE.Group();
  if (GameState.scene === "Battle") {
    globeGroup.visible = false;
    diceModels.visible = true;
    document.querySelector(".end-turn-container").classList.add("hidden");
    document.querySelector(".logger-box").classList.add("hidden");
    document.getElementById("characters").classList.add("hidden");
    document.querySelector(".betting-overlay").classList.remove("hidden");

    let dice = [];
    let n = 6;
    for (let i = 0; i < n; i++) {
      const die = await createDie(scene);

      const radius = 20;
      const theta = (2 * Math.PI * i) / n;
      die.model.position.set(
        radius * Math.sin(theta),
        -1,
        radius * Math.cos(theta) + radius * 0.75
      );

      let randomSpin = randomPointOnSphere().multiplyScalar(10);
      die.setSpin(randomSpin);
      scheduledCallables.push((dt) => die.update(dt));

      dice.push(die);
      diceModels.add(die.model);
    }

    await rollDice(dice);

    diceModels.position.set(0, 20, 0);

    scene.add(diceModels);
    cameraControls.setLookAt(0, 80, 70, 0, 0, 0, true);

    await startDiceRound(GameState.draculaDiceCount, dice, (reason) => {
      GameState.scene = "Overworld";
      changeScene(globeGroup, cameraControls);
      if (reason == "playerDead") {
        logInfo("Your character has fallen to the Dracula");
        const char = GameState.battleCharacter;
        characterDeath(document.querySelector(`[char-id="${char}"]`));
        scene.remove(GameState.characters[char].mesh);
        GameState.characters.splice(char, 1);

        if (GameState.characters.length == 0) {
          matchEndScene("loss");
        }
      } else if (reason == "draculaDead") {
        matchEndScene("win");
      }
    });
  } else if (GameState.scene === "Overworld") {
    globeGroup.visible = true;
    diceModels.visible = false;
    cameraControls.setLookAt(0, 80, 99, 0, 60, 0, true);
    document.querySelector(".end-turn-container").classList.remove("hidden");
    document.querySelector(".betting-overlay").classList.add("hidden");
    document.getElementById("characters").classList.remove("hidden");
    document.querySelector(".logger-box").classList.remove("hidden");
  }
}

document.querySelector(".end-turn-button").addEventListener("click", () => {
  if (GameState.scene === "Overworld") {
    if (myloop(GameState)) {
      GameState.scene = "Battle";
      changeScene(globeGroup, cameraControls);
    } else {
      GameState.scene = "Overworld";
      changeScene(globeGroup, cameraControls);
    }
  }
});

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
