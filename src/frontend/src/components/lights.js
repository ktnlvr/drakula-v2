import * as THREE from "three";

export function setupLights(scene) {
  const ambientLight = new THREE.AmbientLight("#ffffff", 0.8);
  scene.add(ambientLight);

  const spotlight = new THREE.SpotLight("#ff9329", 300, 300, 0.45, 1, 1);
  spotlight.position.set(0, 190, 70);
  spotlight.lookAt(new THREE.Vector3(0, 0, 0));
  spotlight.castShadow = true;
  spotlight.shadow.mapSize.width = 2048;
  spotlight.shadow.mapSize.height = 2048;
  spotlight.shadow.camera.near = 1;
  spotlight.shadow.camera.far = 1000;
  spotlight.shadow.focus = 1;
  scene.add(spotlight);
  return spotlight;
}
