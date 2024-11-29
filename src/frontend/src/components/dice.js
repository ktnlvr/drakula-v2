import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as THREE from 'three';

const DICE_FACE_ROTATIONS_EULER = [
    // I just tested it for different values until it worked
    // No deep maths behind it, though you could calculate it properly
    new THREE.Euler(0, 0, 0), // 1
    new THREE.Euler(2 * Math.PI / 2, 0, 3 * Math.PI / 2), // 2
    new THREE.Euler(3 * Math.PI / 2, 0, 0), // 3
    new THREE.Euler(Math.PI / 2, 0, 0), // 4
    new THREE.Euler(3 * Math.PI / 2, Math.PI / 2, 0), // 5
    new THREE.Euler(Math.PI, 0, 0), // 6
];

export async function createDie() {
    const gltf = await (new GLTFLoader).loadAsync('/dice.glb');
    const model = gltf.scene;

    function rotor(rotation, slerpDuration = 0.33) {
        let notify = {
            shouldRotate: true,
            slerpTime: slerpDuration,
        };

        return [(dt) => {
            if (notify.slerpTime <= 0)
                return false;

            if (notify.shouldRotate) {
                this.rotateOnAxis((new THREE.Vector3()).copy(rotation).normalize(), rotation.length() * dt);
            } else {
                const target = DICE_FACE_ROTATIONS_EULER[notify.face];
                let start = (new THREE.Quaternion()).setFromEuler(notify.startRotation);
                let rot = (new THREE.Quaternion()).setFromEuler(target)
                let q = start.slerp(rot, 1 - notify.slerpTime / slerpDuration);
                this.rotation.setFromQuaternion(q);
                notify.slerpTime -= dt;
            }

            return notify.shouldRotate;
        }, (value) => {
            notify.face = value ? value - 1 : (Math.random() * 6);
            notify.startRotation = new THREE.Euler().copy(this.rotation);
            notify.shouldRotate = false
        }];
    }

    const diceProto = {
        rotor,
        __proto__: model.__proto__,
    }

    model.__proto__ = diceProto;
    model.scale.set(6, 6, 6);

    return model;
}
