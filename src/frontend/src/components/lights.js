import * as THREE from "three";

export function setupLights(scene) {
  const ambientLight = new THREE.AmbientLight("#fdd1a5", 0.9);
  scene.add(ambientLight);

  const spotlight = new THREE.SpotLight("#ff9329", 700, 300, 0.45, 1, 0.75);
  spotlight.position.set(70, 250, 0);
  spotlight.lookAt(new THREE.Vector3(0, 60, 0));
  spotlight.castShadow = true;
  spotlight.shadow.mapSize.width = 2048;
  spotlight.shadow.mapSize.height = 2048;
  spotlight.shadow.camera.near = 1;
  spotlight.shadow.camera.far = 100;
  spotlight.shadow.focus = 1;
  scene.add(spotlight);
  return {
    ambientLight: ambientLight,
    spotlight: spotlight,
  };
}
