<script>
  import { T, useTask } from "@threlte/core";
  import { useTexture } from "@threlte/extras";

  let globeGroupRef;
  let airportsGroupRef;
  const dayTexture = useTexture("/EarthColor.png");
  const normalTexture = useTexture("/EarthNormal.png");
  const GLOBE_SPEED = 0;

  function PosFromLatLon(phi, theta) {
    let lat = (90 - phi) * (Math.PI / 180);
    let lon = (theta + 180) * (Math.PI / 180);
    let coords = {};
    coords.x = 30 * -(Math.sin(lat) * Math.cos(lon));
    coords.z = 30 * Math.sin(lat) * Math.sin(lon);
    coords.y = 30 * Math.cos(lat);
    return coords;
  }
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
  <T.Group bind:ref={airportsGroupRef}>
    {#await fetch("http://localhost:8000/airports?seed=sussysus&amount=15").then( (response) => response.json() ) then data}
      {#each data.airports as airport}
        {@const coords = PosFromLatLon(
          airport.latitude_deg,
          airport.longitude_deg
        )}
        {@const message = `Airport: ${airport.name} Lat=${airport.latitude_deg}, Lon=${airport.longitude_deg} X=${coords.x}, Y=${coords.y}, Z=${coords.z}`}
        {@const ignored = console.log(message)}
        <T.Mesh position={[coords.x, coords.y, coords.z]}>
          <T.SphereGeometry args={[0.3, 128, 64]} />
          <T.MeshStandardMaterial color={"#ff0000"} />
        </T.Mesh>
      {/each}
    {/await}
  </T.Group>
</T.Group>
