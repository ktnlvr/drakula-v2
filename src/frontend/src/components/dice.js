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

const SLERP_DURATION = 0.33;

class DiceProxy {
    constructor(model) {
        this.spin = new THREE.Vector3();
        this.shouldRotate = true;
        this.model = model;
    }

    update(dt) {
        if (this.slerpTime <= 0)
            return false;

        if (!this.shouldRotate) {
            const target = DICE_FACE_ROTATIONS_EULER[this.face];
            let start = (new THREE.Quaternion()).setFromEuler(this.startRotation);
            let rot = (new THREE.Quaternion()).setFromEuler(target)
            let q = start.slerp(rot, 1 - this.slerpTime / SLERP_DURATION);
            this.model.rotation.setFromQuaternion(q);
            this.slerpTime -= dt;
        } else {
            this.model.rotateOnAxis((new THREE.Vector3()).copy(this.spin).normalize(), this.spin.length() * dt);
        }

        return this.shouldRotate;
    }

    stop(value) {
        this.face = value ? value - 1 : (Math.random() * 6);
        this.startRotation = new THREE.Euler().copy(this.model.rotation);
        this.shouldRotate = false
        this.slerpTime = SLERP_DURATION
    }

    setSpin(spin) {
        this.spin = spin;
        this.shouldRotate = true;
    }
}

export async function createDie() {
    const gltf = await (new GLTFLoader).loadAsync('/dice.glb');
    const model = gltf.scene;
    model.scale.set(6, 6, 6);
    return new DiceProxy(model);
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
    const [n, m] = diceState.bet;
    console.log("The bet is ", diceToString(n, m));

    console.log("Player: ", diceState.dice[DICE_INDEX_PLAYER]);
    console.log("Dracula: ", diceState.dice[DICE_INDEX_DRACULA]);

    const allDice = diceState.dice[DICE_INDEX_DRACULA].concat(diceState.dice[DICE_INDEX_DRACULA]);

    // the amount of dice with the face value `m`
    const N = allDice.filter(M => M == m).length;
    console.log("Bet was " + diceToString(n, m) + ", found " + diceToString(N, m));

    // The bet is safe if there is not less dice with the face value `m`    
    let is_bet_safe = N >= n;

    // Is Dracula's Turn? | Is The Bet Safe? | Who loses the dice?
    //        No          |       No         |        Player
    //        No          |       Yes        |        Dracula
    //        Yes         |       No         |        Dracula
    //        Yes         |       Yes        |        Player
    let idx =
        (diceState.turn == DICE_TURN_DRACULA) ^ is_bet_safe ?
            DICE_INDEX_PLAYER : DICE_INDEX_DRACULA;

    // Remove the dice from the respective player
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

    // Returns a function that handles all the setup and teardown
    // for making a bet for a given `action`
    function betActionFactory(action) {
        async function wrapped() {
            // If it's not the player's turn, don't react to buttons
            if (diceState.turn !== DICE_TURN_YOU)
                return;
            // Do the action
            await action();
            // Hide the buttons after one is clicked
            hideBettingOptions();
            // Move the turn over to Dracula
            diceState.turn = DICE_TURN_DRACULA;
            await draculaThink();
            // Return turn back to the player
            diceState.turn = DICE_TURN_YOU;
        }

        return wrapped
    }

    document.getElementById("bet-bump-value").onclick = betActionFactory(betBumpValue);
    document.getElementById("bet-bump-number").onclick = betActionFactory(betBumpNumber);
    document.getElementById("bet-bump-both").onclick = betActionFactory(betBumpBoth);
    document.getElementById("bet-call").onclick = callOut;
}
