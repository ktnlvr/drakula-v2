import * as THREE from "three";
import CameraControls from "camera-controls";

export function createCamera(renderer) {
  //CameraControls.install({ THREE });
  const camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );
  camera.position.z = 99;
  camera.position.y = 20;
  return camera;
}

export function setControls(cameraControls) {
  cameraControls.maxDistance = 100;
  cameraControls.minDistance = 45;
  cameraControls.mouseButtons.left = CameraControls.ACTION.NONE;
  cameraControls.mouseButtons.right = CameraControls.ACTION.NONE;
  cameraControls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
  cameraControls.touches.one = CameraControls.ACTION.TOUCH_ROTATE;
}
