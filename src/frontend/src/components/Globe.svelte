<script>
  import { T, useTask } from "@threlte/core";
  import { useTexture } from "@threlte/extras";

  let globeGroupRef;
  let pointCoords;
  const dayTexture = useTexture("/EarthColor.png");
  const normalTexture = useTexture("/EarthNormal.png");
  const GLOBE_SPEED = 0.0005;

  function PosFromLatLon(phi, theta) {
    let lat = (90 - phi) * (Math.PI / 180);
    let lon = (theta + 180) * (Math.PI / 180);
    let coords = {};
    coords.x = 30 * -(Math.sin(lat) * Math.cos(lon));
    coords.z = 30 * Math.sin(lat) * Math.sin(lon);
    coords.y = 30 * Math.cos(lat);
    return coords;
  }
  pointCoords = PosFromLatLon(40.41615654093708, -3.6961276006060904);
  useTask(() => {
    if (globeGroupRef) {
      globeGroupRef.rotation.y += GLOBE_SPEED;
    }
  });
</script>

<T.Group bind:ref={globeGroupRef}>
  {#await dayTexture then day}
    {#await normalTexture then normal}
      <T.Mesh position={[0, 0, 0]}>
        <T.SphereGeometry args={[30, 128, 64]} />
        <T.MeshStandardMaterial
          map={day}
          normalMap={normal}
          normalScale={0.5}
          roughness={0.8}
          metalness={0.1}
          envMapIntensity={1}
          aoMapIntensity={1}
        />
      </T.Mesh>
    {/await}{/await}
  <T.Mesh position={[pointCoords.x, pointCoords.y, pointCoords.z]}>
    <T.SphereGeometry args={[0.3, 128, 64]} />
    <T.MeshStandardMaterial color={"#ff0000"} />
  </T.Mesh>
</T.Group>
