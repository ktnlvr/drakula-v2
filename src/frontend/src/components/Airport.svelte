<script>
  // @ts-nocheck

  import { T, useTask } from "@threlte/core";
  let { lat, lon } = $props();

  function posFromLatLon(phi, theta) {
    let lat = (90 - phi) * (Math.PI / 180);
    let lon = (theta + 180) * (Math.PI / 180);
    let x = 30 * -(Math.sin(lat) * Math.cos(lon));
    let z = 30 * Math.sin(lat) * Math.sin(lon);
    let y = 30 * Math.cos(lat);
    console.log(x, y, z);
    return [x, y, z];
  }

  const RADIUS = 1;
</script>

<T.Mesh position={posFromLatLon(lat, lon)}>
  <T.SphereGeometry args={[RADIUS, 128, 64]} />
  <T.MeshStandardMaterial color={"#ff0000"} />
</T.Mesh>
