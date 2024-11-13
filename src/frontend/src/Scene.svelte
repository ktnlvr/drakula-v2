<script>
    import { T, useTask } from "@threlte/core";

    let rotation = 0;
    useTask((dt) => {
        const SPEED = 4;
        rotation += dt * SPEED;
    });
</script>

<T.Mesh rotation.y={rotation} rotation.x={rotation}>
    <T.BoxGeometry />
    <T.MeshBasicMaterial />
</T.Mesh>
