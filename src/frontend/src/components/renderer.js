import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { InteractionManager } from "three.interactive";
import { Timer } from "three/addons/misc/Timer.js";
import Stats from "stats-gl";

let stats;
let interactionManager;
let composer;
const clock = new THREE.Clock();
const timer = new Timer();
export function createRenderer(scene, camera) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
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

  const selectionPass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  selectionPass.edgeStrength = 3;
  selectionPass.edgeGlow = 2;
  selectionPass.edgeThickness = 1;
  selectionPass.pulsePeriod = 1.2;
  selectionPass.visibleEdgeColor.set("#ffffff");
  selectionPass.hiddenEdgeColor.set("#ffffff");

  composer.addPass(selectionPass);
  const hoverPass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  hoverPass.edgeStrength = 3;
  hoverPass.edgeGlow = 0;
  hoverPass.edgeThickness = 1;
  hoverPass.visibleEdgeColor.set("#d9d9d9");
  hoverPass.hiddenEdgeColor.set("#d9d9d9");
  composer.addPass(hoverPass);

  const charPass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  charPass.edgeStrength = 1;
  charPass.edgeGlow = 1;
  charPass.edgeThickness = 1;
  charPass.visibleEdgeColor.set("#ffffff");
  charPass.hiddenEdgeColor.set("#ffffff");

  composer.addPass(charPass);

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

  return {
    renderer: renderer,
    selectionPass: selectionPass,
    hoverPass: hoverPass,
    charPass: charPass,
    composer: composer,
    interactionManager: interactionManager,
  };
}

export function render(cameraControls, spotlightHelper, scheduled_callables) {
  const dt = clock.getDelta();
  timer.update();
  cameraControls.update(timer.getDelta());
  GameState.timer = timer.getElapsed();
  interactionManager.update();
  spotlightHelper.update();

  const schedule_systems = [];
  for (let callable of scheduled_callables)
    if (callable(dt)) schedule_systems.push(callable);

  composer.render();
  stats.update();
  requestAnimationFrame(() =>
    render(cameraControls, spotlightHelper, scheduled_callables)
  );
}
