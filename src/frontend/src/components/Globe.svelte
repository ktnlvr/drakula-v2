<script>
  import { T, useTask } from "@threlte/core";
  import { useTexture } from "@threlte/extras";

  let earthRef;
  const dayTexture = useTexture("/EarthColor.png");
  const normalTexture = useTexture("/EarthNormal.png");
  const EARTH_SPEED = 0;

  useTask(() => {
    if (earthRef) {
      earthRef.rotation.y += EARTH_SPEED;
    }
  });
</script>

{#await dayTexture then day}
  {#await normalTexture then normal}
    <T.Mesh position={[0, 0, 0]} bind:ref={earthRef}>
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
