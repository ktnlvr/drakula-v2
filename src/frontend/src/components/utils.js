import { Vector3 } from 'three';

export function randomPointOnSphere() {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 2;
    return new Vector3(Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta));
}

// https://easings.net/#easeInQuart
export function easeInQuart(x) {
    return x * x * x * x;
}
