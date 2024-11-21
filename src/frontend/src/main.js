import * as THREE from "three";
import Stats from "stats-gl";
import { createCamera, setControls } from "./components/camera";
import { createGlobe, createTable } from "./components/assets";
import { setupLights } from "./components/lights";
import { createRenderer } from "./components/renderer";
import { InteractionManager } from "three.interactive";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import CameraControls from "camera-controls";
//import { setupGui } from "./components/gui";

let stats;
const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = createCamera();
const renderer = createRenderer();

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
);
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 2;
outlinePass.edgeThickness = 1;
outlinePass.pulsePeriod = 1.2;
outlinePass.visibleEdgeColor.set("#ffffff");

composer.addPass(outlinePass);
const outputPass = new OutputPass();
composer.addPass(outputPass);

document.body.appendChild(renderer.domElement);
const interactionManager = new InteractionManager(
  renderer,
  camera,
  renderer.domElement
);

scene.add(createGlobe(interactionManager, outlinePass));
scene.add(createTable());
setupLights(scene);
//Code for visualizing and editing the spotlight, needs the helper to be updated in the render loop
//const spotlight = setupLights(scene);
//const spotlightHelper = new THREE.SpotLightHelper(spotlight);
//scene.add(spotlightHelper);
//setupGui(spotlight, renderer, scene);
const cameraControls = new CameraControls(camera, renderer.domElement);
setControls(cameraControls);

stats = new Stats({ trackGPU: true });
stats.init(renderer);
document.body.appendChild(stats.dom);

function render() {
  const delta = clock.getDelta();
  cameraControls.update(delta);
  interactionManager.update();
  //spotlightHelper.update();

  composer.render();
  stats.update();
  requestAnimationFrame(render);
}

render();

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
