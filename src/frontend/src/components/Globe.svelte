<script>
  import { T, useTask } from "@threlte/core";
  import { interactivity, useTexture } from "@threlte/extras";

  import Airport from "./Airport.svelte";

  let { airports } = $props();

  let globeGroupRef = $state(undefined);
  let airportsGroupRef = $state(undefined);
  const dayTexture = useTexture("/EarthColor.png");
  const normalTexture = useTexture("/EarthNormal.png");
  const GLOBE_SPEED = 0;

  useTask(() => {
    if (globeGroupRef) {
      globeGroupRef.rotation.y += GLOBE_SPEED;
    }
  });

  interactivity();
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
    {#each $airports.airports as airport}
      {@const message = `Airport: ${airport.name} Lat=${airport.latitude_deg}, Lon=${airport.longitude_deg}`}
      {@const ignored = console.log(message)}
      <Airport lat={airport.latitude_deg} lon={airport.longitude_deg} />
    {/each}
  </T.Group>
</T.Group>
