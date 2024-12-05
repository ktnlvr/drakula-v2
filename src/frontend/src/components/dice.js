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

const DICE_TURN_DRACULA = 'dracula';
const DICE_TURN_YOU = 'you';
const DICE_INDEX_PLAYER = 0;
const DICE_INDEX_DRACULA = 1;

const diceState = {
    bet: [4, 2],
    dice: [[], []],
    turn: DICE_TURN_DRACULA,
};

// https://www.compart.com/en/unicode/U+2680
function diceToString(n, m) {
    // Create the dice unicode glyph from the code point
    let ch = String.fromCodePoint([0x2680 + m - 1]);
    return ch.repeat(n)
}

function updateCurrentBet() {
    let currentBet = document.getElementById("current-bet");
    currentBet.textContent = "Current bet: " + diceToString(...diceState.bet);
}

function hideBettingOptions() {
    document.getElementById("betting-options").classList.add(["hidden"]);
}

function showBettingOptions() {
    document.getElementById("betting-options").classList.remove(["hidden"]);
    const betBumpValue = document.getElementById("bet-bump-value");
    const betBumpNumber = document.getElementById("bet-bump-number");
    const betBumpBoth = document.getElementById("bet-bump-both");
    const [n, m] = diceState.bet;

    if (diceState.bet[1] == 6) {
        if (betBumpValue && betBumpBoth) {
            betBumpValue.remove()
            betBumpBoth.remove()
        }
    } else {
        betBumpValue.innerText = diceToString(n, m + 1);
        betBumpBoth.innerText = diceToString(n + 1, m + 1);
    }

    betBumpNumber.innerText = diceToString(n + 1, m);
}

async function draculaThink() {
    const DRACULA_THINKING_TIME = 1700 + Math.random(300);
    await new Promise(resolve => setTimeout(resolve, DRACULA_THINKING_TIME));
    let choices = [betBumpNumber, callOut];
    if (diceState.bet[1] != 6) {
        choices.push(betBumpValue);
        choices.push(betBumpBoth);
    }

    // TODO: make dracula be able to select calling out
    await choices[Math.floor(choices.length * Math.random())]()
    showBettingOptions();
}

async function betBumpValue() {
    console.log(diceState.turn + " chose to bump the value");
    diceState.bet[1]++;
    updateCurrentBet();
}

async function betBumpNumber() {
    console.log(diceState.turn + " chose to bump the number");
    diceState.bet[0]++;
    updateCurrentBet();
}

async function betBumpBoth() {
    console.log(diceState.turn + " chose to bump both");
    diceState.bet[0]++;
    diceState.bet[1]++;
    updateCurrentBet();
}

function removeDice(idx) {
    console.log(idx);
    console.log(diceState);
    diceState.dice[idx].pop();
    if (idx == DICE_INDEX_PLAYER) {
        // TODO: animate dice removal
        const meshes = diceState.playerDiceMeshes;
        const i = Math.floor(Math.random() * meshes.length);
        console.log(meshes[i])
        meshes[i].removeFromParent();
        meshes.splice(i, 1);
        if (meshes.length === 0) {
            alert("Game over, the player is out of dice!")
            return
        }
    }
}

async function callOut() {
    console.log("The bet is ", diceState.bet);
    const [n, m] = diceState.bet;
    let x = diceState.dice[DICE_INDEX_DRACULA].concat(diceState.dice[DICE_INDEX_DRACULA]).filter(x => x == m);
    console.log("Player: ", diceState.dice[DICE_INDEX_PLAYER]);
    console.log("Dracula: ", diceState.dice[DICE_INDEX_DRACULA]);
    console.log("Bet was " + diceToString(n, m) + ", found " + diceToString(x, m));

    // Is Dracula's Turn? | Is The Bet Safe? | Who loses the dice?
    //        No          |       No         |        Player
    //        No          |       Yes        |        Dracula
    //        Yes         |       No         |        Dracula
    //        Yes         |       Yes        |        Player
    let is_bet_safe = x >= n;
    let idx =
        (diceState.turn == DICE_TURN_DRACULA) ^ is_bet_safe ?
            DICE_INDEX_PLAYER : DICE_INDEX_DRACULA;
    removeDice(idx);
    if (idx == DICE_INDEX_DRACULA) {
        console.log("Dracula loses a dice");
    } else {
        console.log("The player loses a dice");
    }
}

export async function startDiceRound(draculaDiceCount = 6, playerDiceMeshes = []) {
    // one two, literally
    diceState.bet = [1, 2];
    const draculaDice = [];
    for (let i = 0; i < draculaDiceCount; i++)
        draculaDice.push(Math.floor(Math.random() * 6) + 1)
    diceState.dice = [[], draculaDice];
    diceState.playerDiceMeshes = playerDiceMeshes;
    console.log(diceState)

    diceState.turn = DICE_TURN_YOU;
    showBettingOptions();
    updateCurrentBet();

    function betActionFactory(action) {
        async function wrapped() {
            if (diceState.turn !== DICE_TURN_YOU)
                return;
            await action();
            hideBettingOptions();
            diceState.turn = DICE_TURN_DRACULA;
            await draculaThink();
            diceState.turn = DICE_TURN_YOU;
        }

        return wrapped
    }

    document.getElementById("bet-bump-value").onclick = betActionFactory(betBumpValue);
    document.getElementById("bet-bump-number").onclick = betActionFactory(betBumpNumber);
    document.getElementById("bet-bump-both").onclick = betActionFactory(betBumpBoth);
    document.getElementById("bet-call").onclick = callOut;
}
