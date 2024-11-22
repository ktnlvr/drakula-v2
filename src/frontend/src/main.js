import * as THREE from "three";
import { createCamera, setControls } from "./components/camera";
import { createGlobe, createTable } from "./components/assets";
import { setupLights } from "./components/lights";
import { createRenderer, render } from "./components/renderer";
import { setupGui } from "./components/gui";
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
