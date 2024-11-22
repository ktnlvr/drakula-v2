import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { InteractionManager } from "three.interactive";
import Stats from "stats-gl";

let stats;
let interactionManager;
let composer;
const clock = new THREE.Clock();
export function createRenderer(scene, camera) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  composer = new EffectComposer(renderer);
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

  stats = new Stats({ trackGPU: true });
  stats.init(renderer);
  interactionManager = new InteractionManager(
    renderer,
    camera,
    renderer.domElement
  );
  document.body.appendChild(renderer.domElement);
  document.body.appendChild(stats.dom);

  return {
    renderer: renderer,
    outlinePass: outlinePass,
    composer: composer,
    interactionManager: interactionManager,
  };
}
export function render(cameraControls, spotlightHelper) {
  cameraControls.update(clock.getDelta());
  interactionManager.update();
  spotlightHelper.update();

  composer.render();
  stats.update();
  requestAnimationFrame(() => render(cameraControls, spotlightHelper));
}
