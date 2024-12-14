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

document.querySelector(".end-turn-button").addEventListener("click", async () => {
  const game_data = {
    chosenValue,
    chosenNumber,
    draculaDice,
    playerDice,
    scene: GameState.scene,
    character: {
      name: character.name,
      position: character.position
      // ... other character data
    },
    airports: GameState.airports,
    connections: GameState.connections,
    dracula: GameState.dracula,
    timer: GameState.timer,
    selectedCharacter: GameState.selectedCharacter,
    battleCharacter: GameState.battleCharacter,
    ticketCharacter: GameState.ticketCharacter,
    draculaDiceCount: GameState.draculaDiceCount,
    //and more
  };

  const game_id = getGameIdFromCookie();

  if (!game_id) {
    setGameIdCookie(crypto.randomUUID());
  }

  const response = await fetch(`http://127.0.0.1:8000/game?game_id=${game_id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(game_data)
  });

  if (response.ok) {
    const result = await response.json();
    console.log("Game state saved", result);
  } else {
    console.log("Failed to save game state");
  }

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

function getGameIdFromCookie() {
  const match = document.cookie.match(/(^| )game_id=([^;]+)/);
  return match ? match[2] : null;
}

function setGameIdCookie(game_id) {
  document.cookie = `game_id=${game_id}; path=/; max-age=31536000`; // 1 year
}

function removeGameIdCookie() {
  document.cookie = `game_id=; path=/; max-age=0`;
}

// On initial page load:
let game_id = getGameIdFromCookie();
if (!game_id) {
  // Generate a new ID - can use crypto API or a simple random:
  game_id = crypto.randomUUID();
  setGameIdCookie(game_id);
}

async function loadGameState() {
  const game_id = getGameIdFromCookie();
  if (game_id) {
    const response = await fetch(`http://127.0.0.1:8000/game?game_id=${game_id}`);
    if (response.ok) {
      const savedData = await response.json();
      const gameData = savedData[0].json; // assuming structure returned
      // Restore game state from gameData
      chosenValue = gameData.chosenValue;
      chosenNumber = gameData.chosenNumber;
      draculaDice = gameData.draculaDice;
      playerDice = gameData.playerDice;
      scene: GameState.scene;
      character = gameData.character;
      airports = gameData.airports;
      connections = gameData.connections;
      dracula = gameData.dracula;
      timer = gameData.timer;
      selectedCharacter = gameData.selectedCharacter;
      battleCharacter = gameData.battleCharacter;
      ticketCharacter = gameData.ticketCharacter;
      draculaDiceCount = gameData.draculaDiceCount;
      //and more
    } else {
      console.log("No saved game found for this game_id");
    }
  }
}

loadGameState();
