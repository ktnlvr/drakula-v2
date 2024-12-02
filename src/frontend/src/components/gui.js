import GUI from "lil-gui";

export function setupGui(
  ambientLight,
  spotlight,
  spotlightHelper,
  renderer,
  scene
) {
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
    helper: spotlightHelper.visible,
    ambientLight: ambientLight.intensity,
    ambientLightColor: ambientLight.color.getHex(),
  };
  const spotlightFolder = gui.addFolder("Spotlight");
  const ambientFolder = gui.addFolder("Ambient Light");

  spotlightFolder.addColor(params, "color").onChange(function (val) {
    spotlight.color.setHex(val);
  });

  spotlightFolder.add(params, "intensity", 0, 1000).onChange(function (val) {
    spotlight.intensity = val;
  });

  spotlightFolder.add(params, "distance", 0, 500).onChange(function (val) {
    spotlight.distance = val;
  });

  spotlightFolder.add(params, "angle", 0, Math.PI / 3).onChange(function (val) {
    spotlight.angle = val;
  });

  spotlightFolder.add(params, "penumbra", 0, 1).onChange(function (val) {
    spotlight.penumbra = val;
  });

  spotlightFolder.add(params, "decay", 1, 2).onChange(function (val) {
    spotlight.decay = val;
  });

  spotlightFolder.add(params, "focus", 0, 1).onChange(function (val) {
    spotlight.shadow.focus = val;
  });
  spotlightFolder.add(params, "helper").onChange(function (val) {
    spotlightHelper.visible = val;
  });
  spotlightFolder.add(params, "shadows").onChange(function (val) {
    renderer.shadowMap.enabled = val;

    scene.traverse(function (child) {
      if (child.material) {
        child.material.needsUpdate = true;
      }
    });
  });
  ambientFolder.add(params, "intensity", 0, 5).onChange(function (val) {
    ambientLight.intensity = val;
  });
  ambientFolder.addColor(params, "color").onChange(function (val) {
    ambientLight.color.setHex(val);
  });

  gui.open();
}
