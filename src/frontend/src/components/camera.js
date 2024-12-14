import * as THREE from "three";
import CameraControls from "camera-controls";

export function createCamera(renderer) {
  const camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.01,
    200
  );
  return camera;
}

export function setControls(cameraControls) {
  cameraControls.maxDistance = 100;
  cameraControls.minDistance = 45;
  cameraControls.setLookAt(0, 80, 99, 0, 60, 0);
  cameraControls.mouseButtons.left = CameraControls.ACTION.NONE;
  cameraControls.mouseButtons.right = CameraControls.ACTION.ROTATE;
  cameraControls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
  cameraControls.touches.one = CameraControls.ACTION.TOUCH_ROTATE;
  cameraControls.azimuthRotateSpeed = 0;
  cameraControls.polarRotateSpeed = 1;
  cameraControls.minPolarAngle = Math.PI / 5;
  cameraControls.maxPolarAngle = Math.PI / 1.55;
}
