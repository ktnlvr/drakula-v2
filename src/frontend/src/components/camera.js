import * as THREE from "three";
import CameraControls from "camera-controls";

export function createCamera() {
  CameraControls.install({ THREE });
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    10,
    200
  );
  camera.position.x = 50;
  camera.position.y = 40;
  return camera;
}

export function setControls(cameraControls) {
  cameraControls.mouseButtons.left = CameraControls.ACTION.NONE;
  cameraControls.mouseButtons.right = CameraControls.ACTION.ROTATE;
  cameraControls.mouseButtons.wheel = CameraControls.ACTION.ROTATE;
  cameraControls.maxDistance = 100;
  cameraControls.minDistance = 45;
  cameraControls.touches.one = CameraControls.ACTION.TOUCH_ROTATE;
}
