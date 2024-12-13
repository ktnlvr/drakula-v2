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

// Non-blocking sleep for `t_s` seconds
export async function sleep(t_s = 0.) {
    return new Promise(resolve => setTimeout(resolve, 1000 * t_s))
}

// Calls the function `callable` every `interval_s` seconds over the period of time `t_s` (seconds)
export async function sleepActive(callable, interval_s = 0, t_s = 0) {
    const payload = { i: 0 };
    const intervalID = setInterval(() => {
        callable(payload.i);
        payload.i++;
    }, 1000 * interval_s);
    await new Promise(resolve => setTimeout(() => {
        clearInterval(intervalID);
        resolve();
    }, 1000 * t_s))
}

// Not actual jquery, just makes stuff shorter
export function $(selector) {
    if (!(selector.startsWith('.') || selector.startsWith('#')))
        console.log("Oh? Are you sure you are using the selector correctly? You are selecting " + selector);
    return document.querySelector(selector);
}