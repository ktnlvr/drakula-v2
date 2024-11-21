import { GUI } from "three/addons/libs/lil-gui.module.min.js";

export function setupGui(spotlight, renderer, scene) {
  const gui = new GUI();
  const params = {
    color: spotlight.color.getHex(),
    intensity: spotlight.intensity,
    distance: spotlight.distance,
    angle: spotlight.angle,
    penumbra: spotlight.penumbra,
    decay: spotlight.decay,
    focus: spotlight.shadow.focus,
    shadows: true,
  };

  gui.addColor(params, "color").onChange(function (val) {
    spotlight.color.setHex(val);
  });

  gui.add(params, "intensity", 0, 500).onChange(function (val) {
    spotlight.intensity = val;
  });

  gui.add(params, "distance", 0, 500).onChange(function (val) {
    spotlight.distance = val;
  });

  gui.add(params, "angle", 0, Math.PI / 3).onChange(function (val) {
    spotlight.angle = val;
  });

  gui.add(params, "penumbra", 0, 1).onChange(function (val) {
    spotlight.penumbra = val;
  });

  gui.add(params, "decay", 1, 2).onChange(function (val) {
    spotlight.decay = val;
  });

  gui.add(params, "focus", 0, 1).onChange(function (val) {
    spotlight.shadow.focus = val;
  });

  gui.add(params, "shadows").onChange(function (val) {
    renderer.shadowMap.enabled = val;

    scene.traverse(function (child) {
      if (child.material) {
        child.material.needsUpdate = true;
      }
    });
  });

  gui.open();
}
