import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as THREE from 'three';

export async function createDie() {
    const gltf = await (new GLTFLoader).loadAsync('/dice.glb');
    const model = gltf.scene;

    function rotor(rotation) {
        let notify = { should_rotate: true };
        return [(dt) => {
            this.rotateOnAxis((new THREE.Vector3()).copy(rotation).normalize(), rotation.length() * dt);
            return notify.should_rotate;
        }, () => notify.should_rotate = false];
    }

    const diceProto = {
        rotor,
        __proto__: model.__proto__,
    }

    model.__proto__ = diceProto;
    model.scale.set(6, 6, 6);

    return model;
}
