import * as THREE from "three";
import { createCamera, setControls } from "./components/camera";
import { createRenderer, render } from "./components/renderer";
import { createGlobe, createTable } from "./components/assets";
import { setupLights } from "./components/lights";
import { setupGui } from "./components/gui";
import CameraControls from "camera-controls";
import { createCharacters, GameState } from "./components/gameState";
import { createDie, startDiceRound } from "./components/dice";
import { randomPointOnSphere } from "./components/utils";

const scene = new THREE.Scene();
const camera = createCamera();
const { renderer, outlinePass, composer, interactionManager } = createRenderer(
  scene,
  camera
);

let TESTING_DICE = true

async function setupGame(scene) {
  const { ambientLight, spotlight } = setupLights(scene);
  const spotlightHelper = new THREE.SpotLightHelper(spotlight);
  setupGui(ambientLight, spotlight, spotlightHelper, renderer, scene);
  scene.add(spotlightHelper);

  const table = createTable();
  scene.add(table);

  CameraControls.install({ THREE });
  const cameraControls = new CameraControls(camera, renderer.domElement);
  setControls(cameraControls);
  const scheduledCallables = [];

  window.GameState = GameState;

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
      die.setSpin(randomSpin)
      scheduledCallables.push((dt) => die.update(dt));

      dice.push(die);
      diceModels.add(die.model);
    }

    for (let i = 0; i < n; i++) {
      setInterval(() => dice[i].stop(2), 1000 + i * 200);
    }

    diceModels.position.set(0, -40, 0);
    scene.add(diceModels);
    await cameraControls.setLookAt(
      camera.position.x, camera.position.y, camera.position.z,
      diceModels.position.x, diceModels.position.y, diceModels.position.z);

    await startDiceRound(6, diceModels);
  } else {
    const { globeGroup } = await createGlobe(interactionManager, outlinePass);
    scene.add(globeGroup);

    createCharacters(globeGroup);
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
