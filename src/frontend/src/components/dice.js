import { easeInQuart, randomPointOnSphere } from "./utils";
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
            let rot = (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.randomYRot).multiply((new THREE.Quaternion()).setFromEuler(target));
            let q = start.slerp(rot, 1 - this.slerpTime / SLERP_DURATION);
            this.model.rotation.setFromQuaternion(q);
            this.slerpTime -= dt;
            if (this.slerpTime <= 0)
                this.model.rotation.setFromQuaternion(rot);
        } else {
            this.model.rotateOnAxis((new THREE.Vector3()).copy(this.spin).normalize(), this.spin.length() * dt);
        }

        return this.shouldRotate;
    }

    stop() {
        this.startRotation = new THREE.Euler().copy(this.model.rotation);
        this.shouldRotate = false;
        this.slerpTime = SLERP_DURATION;
        this.randomYRot = 2 * Math.PI * Math.random();
    }

    setSpin(spin, value = undefined) {
        this.face = value ? value - 1 : Math.floor(Math.random() * 6);
        this.spin = spin;
        this.shouldRotate = true;
        this.slerpTime = SLERP_DURATION;
    }
}

export async function createDie() {
    const gltf = await (new GLTFLoader).loadAsync('/dice.glb');
    const model = gltf.scene;
    model.scale.set(6, 6, 6);
    return new DiceProxy(model);
}

const DICE_TURN_DRACULA = 'dracula';
const DICE_TURN_PLAYER = 'you';
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

function updateCurrentBetDisplay() {
    let currentBet = document.getElementById("current-bet");
    currentBet.textContent = "Current bet: " + diceToString(...diceState.bet);
}

function hideBettingOptions() {
    document.getElementById("betting-options").classList.add(["hidden"]);
}

// Shows and refreshes the betting options
function showBettingOptions() {
    document.getElementById("betting-options").classList.remove("hidden");
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

const thinkingPlaceholder = document.getElementById('bet-status');

// Used to report Dracula thinking as well as good and bad bet calls
function setBetStatus(status) {
    thinkingPlaceholder.classList.remove('hidden');
    thinkingPlaceholder.innerText = status;
}

async function draculaThink() {
    // The formula is kinda hand-tweaked
    // If you plot in for x \in [0; 1] you can see
    // that the fast times are really fast, possibly giving
    // a feeling of a very confident bet
    const DRACULA_THINKING_TIME = 100 + 990 * Math.log(17 * Math.random(300) + 1);
    // how often the dots are updated
    const UPDATE_INTERVAL = 300;

    // Display 3 dots while the dracula is thinking, blinking
    // them periodically
    setBetStatus(".")
    const payload = { i: 1 };
    const thinker = setInterval(() => {
        setBetStatus(".".repeat(payload.i % 3 + 1));
        payload.i++;
    }, UPDATE_INTERVAL);

    // Wait for a given amount of time
    await new Promise(resolve => setTimeout(() => {
        clearInterval(thinker);
        thinkingPlaceholder.classList.add('hidden');
        resolve()
    }, DRACULA_THINKING_TIME));

    let choices = [betBumpNumber, callOut];
    // Can bump value
    if (diceState.bet[1] != 6) {
        choices.push(betBumpValue);
        choices.push(betBumpBoth);
    }

    // TODO: make dracula be able to select calling out
    await choices[Math.floor(choices.length * Math.random())]()
}

function draculaSetStartingBet() {
    // TODO: Possibly make up a better starting bet?
    return [1, 1]
}

async function betBumpValue() {
    console.log(diceState.turn + " chose to bump the value");
    diceState.bet[1]++;
    updateCurrentBetDisplay();
}

async function betBumpNumber() {
    console.log(diceState.turn + " chose to bump the number");
    diceState.bet[0]++;
    updateCurrentBetDisplay();
}

async function betBumpBoth() {
    console.log(diceState.turn + " chose to bump both");
    diceState.bet[0]++;
    diceState.bet[1]++;
    updateCurrentBetDisplay();
}

async function removeDice(loser_idx) {
    console.log(loser_idx);
    console.log(diceState);
    diceState.dice[loser_idx].pop();
    if (loser_idx == DICE_INDEX_PLAYER) {
        const proxies = diceState.playerDiceProxies;
        const i = Math.floor(Math.random() * proxies.length);

        const DICE_REMOVE_ANIMATION_DURATION_S = 0.75;
        const TIMESLICES = 100;
        // XXX: assuming scale is uniform
        const START_SCALE = proxies[i].model.scale[0];
        const dt = 1000 * DICE_REMOVE_ANIMATION_DURATION_S / TIMESLICES;
        const integrator = { t: 0 }
        let interval = setInterval(() => {
            const SCALE = START_SCALE * (1 - easeInQuart(integrator.t));
            proxies[i].model.scale.set(SCALE, SCALE, SCALE);
            integrator.t += dt;
        }, dt);
        await new Promise(resolve => setTimeout(() => {
            clearInterval(interval);
            diceState.playerDiceProxies[i].model.removeFromParent();
            resolve()
        }, 1000 * DICE_REMOVE_ANIMATION_DURATION_S));

        proxies.splice(i, 1);
        if (proxies.length === 0) {
            alert("Game over, the player is out of dice!")
            return
        }
    }
    // TODO: when Dracula's dice gets removed there is no timeout
    // or animation, so it looks kinda choppy.
}

async function callOut() {
    const isPlayerTurn = diceState.turn == DICE_TURN_PLAYER;
    if (isPlayerTurn)
        hideBettingOptions();

    console.log(diceState.turn + ' calls!');
    const [n, m] = diceState.bet;
    console.log("The bet is", diceToString(n, m));

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
    let loser_idx =
        (diceState.turn == DICE_TURN_DRACULA) ^ is_bet_safe ?
            DICE_INDEX_PLAYER : DICE_INDEX_DRACULA;

    let betStatus = 'undefined';
    if (isPlayerTurn)
        if (loser_idx == DICE_INDEX_DRACULA)
            betStatus = `Good call. Dracula has ${diceState.dice[DICE_INDEX_DRACULA].length - 1} left.`;
        else
            betStatus = "Poor call";
    else
        if (loser_idx == DICE_INDEX_PLAYER)
            betStatus = "Dracula calls you out. Lose a dice";
        else
            // Just wanted to sneak in a Harry Potter reference
            betStatus = `Dracula called and lost, he has ${diceState.dice[DICE_INDEX_DRACULA].length - 1} left.`;

    setBetStatus(betStatus)

    // Remove the dice from the respective player
    await removeDice(loser_idx);

    // Reroll player's dice
    await rollDice(diceState.playerDiceProxies);
    // Reroll Dracula's dice
    let newDice = []
    for (let i = 0; i < diceState.dice[DICE_INDEX_DRACULA].length; i++)
        newDice.push(Math.floor(Math.random() * 6) + 1);
    diceState.dice[DICE_INDEX_DRACULA] = newDice;

    
    diceState.bet = draculaSetStartingBet();
    updateCurrentBetDisplay();
    if (isPlayerTurn)
        showBettingOptions();
}

export async function rollDice(dice = [], mode = 'nowait') {
    for (const die of dice) {
        let randomSpin = randomPointOnSphere().multiplyScalar(10);
        die.setSpin(randomSpin);
    }

    for (let i = 0; i < dice.length; i++) {
        const duration = 1000 + i * 200;
        if (mode == 'wait') {
            await new Promise(resolve => setTimeout(() => {
                dice[i].stop(); resolve();
            }, duration));
        } else {
            setTimeout(() => dice[i].stop(), duration);
        }
    }
}

export async function startDiceRound(draculaDiceCount = 6, playerDiceProxies = []) {
    diceState.bet = draculaSetStartingBet();
    const draculaDice = [];
    for (let i = 0; i < draculaDiceCount; i++)
        draculaDice.push(Math.floor(Math.random() * 6) + 1)
    const playerDice = playerDiceProxies.map((dice) => dice.face + 1);
    diceState.playerDiceProxies = playerDiceProxies;
    diceState.dice = [playerDice, draculaDice];
    console.log(diceState)

    diceState.turn = DICE_TURN_PLAYER;
    showBettingOptions();
    updateCurrentBetDisplay();

    // Returns a function that handles all the setup and teardown
    // for making a bet for a given `action`
    function betActionFactory(action) {
        async function wrapped() {
            // If it's not the player's turn, don't react to buttons
            if (diceState.turn !== DICE_TURN_PLAYER)
                return;
            // Do the action
            await action();
            // Hide the buttons after one is clicked
            hideBettingOptions();
            // Move the turn over to Dracula
            diceState.turn = DICE_TURN_DRACULA;
            await draculaThink();
            // Return turn back to the player
            diceState.turn = DICE_TURN_PLAYER;
            showBettingOptions();
        }

        return wrapped
    }

    document.getElementById("bet-bump-value").onclick = betActionFactory(betBumpValue);
    document.getElementById("bet-bump-number").onclick = betActionFactory(betBumpNumber);
    document.getElementById("bet-bump-both").onclick = betActionFactory(betBumpBoth);
    document.getElementById("bet-call").onclick = async () => {
        if (diceState.turn !== DICE_TURN_PLAYER)
            return;

        await callOut()
    };
}
