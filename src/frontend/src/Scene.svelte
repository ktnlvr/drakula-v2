<script>
  import { T } from "@threlte/core";
  import { Grid } from "@threlte/extras";
  import CameraControls from "./components/CameraControls.svelte";
  import Lights from "./components/Lights.svelte";
</script>

<T.PerspectiveCamera
  makeDefault
  position={[100, 1, 1]}
  fov={90}
  oncreate={(ref) => {
    ref.lookAt(0, 0, 0);
  }}
>
  <CameraControls
    oncreate={(ref) => {
      globalThis.$cameraControls = ref;
    }}
  />
</T.PerspectiveCamera>
<Lights />
<Grid sectionThickness={0} infiniteGrid cellColor="#dddddd" cellSize={2} />
