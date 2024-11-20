<script>
  import { T } from "@threlte/core";
  import { Grid } from "@threlte/extras";
  import CameraControls from "./components/CameraControls.svelte";
  import Lights from "./components/Lights.svelte";
  import Globe from "./components/Globe.svelte";
  import { fetchAirports } from "./api";
  import { writable } from "svelte/store";

  const airports = writable({ airports: [], connections: [] });

  fetchAirports().then((data) => {
    console.log(data)
    airports.set(data);
  });
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
<Globe airports={airports}/>
<Grid sectionThickness={0} infiniteGrid cellColor="#dddddd" cellSize={2} />
