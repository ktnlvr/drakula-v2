import { easeInQuart, randomPointOnSphere, sleep, sleepActive, $ } from "./utils";
import { draculaDecide } from "../draculaAi";

import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
import { GameState } from "./gameState";

const DICE_FACE_ROTATIONS_EULER = [
  // I just tested it for different values until it worked
  // No deep maths behind it, though you could calculate it properly
  new THREE.Euler(0, 0, 0), // 1
  new THREE.Euler((2 * Math.PI) / 2, 0, (3 * Math.PI) / 2), // 2
  new THREE.Euler((3 * Math.PI) / 2, 0, 0), // 3
  new THREE.Euler(Math.PI / 2, 0, 0), // 4
  new THREE.Euler((3 * Math.PI) / 2, Math.PI / 2, 0), // 5
  new THREE.Euler(Math.PI, 0, 0), // 6
];

const SLERP_DURATION = 0.33;

// Q: Why define them as separate strings?
//    Surely you can just access as properties
//    like .dracula and .player in all cases?
// A: Well, yeah, but them we lose the opportunity
//    to manipulate over the values using code
//    because we don't allow our program to
//    operate on them. There is no reason to give
//    them special treatment, in a saner language
//    we would use an enum

const DRACULA = "dracula";
const PLAYER = "player";

class DiceProxy {
  constructor(model) {
    this.spin = new THREE.Vector3();
    this.shouldRotate = true;
    this.model = model;
  }

  update(dt) {
    if (this.slerpTime <= 0) return false;

    if (!this.shouldRotate) {
      const target = DICE_FACE_ROTATIONS_EULER[this.face];
      let start = new THREE.Quaternion().setFromEuler(this.startRotation);
      let rot = new THREE.Quaternion()
        .setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.randomYRot)
        .multiply(new THREE.Quaternion().setFromEuler(target));
      let q = start.slerp(rot, 1 - this.slerpTime / SLERP_DURATION);
      this.model.rotation.setFromQuaternion(q);
      this.slerpTime -= dt;
      if (this.slerpTime <= 0) this.model.rotation.setFromQuaternion(rot);
    } else {
      this.model.rotateOnAxis(
        new THREE.Vector3().copy(this.spin).normalize(),
        this.spin.length() * dt
      );
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

const gltf = await new GLTFLoader().loadAsync("/dice.glb");
gltf.scene.traverse(function (child) {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;
  }
});

export async function createDie() {
  const model = gltf.scene.clone(true);
  model.scale.set(3, 3, 3);
  model.castShadow = true;
  return new DiceProxy(model);
}

const diceState = {
  bet: [4, 2],
  dice: [[], []],
  turn: DRACULA,
};

// https://www.compart.com/en/unicode/U+2680
function diceToString(n, m) {
  // Create the dice unicode glyph from the code point
  let ch = String.fromCodePoint([0x2680 + m - 1]);
  return ch.repeat(n);
}

function updateCurrentBetDisplay() {
  let currentBet = $("#current-bet");
  currentBet.textContent = "Current bet: " + diceToString(...diceState.bet);
}

function hideBattleOptions() {
  $("#battle-options").classList.add("hidden");
}

// Shows and refreshes the betting options
function showBattleOptions() {
  $("#battle-options").classList.remove("hidden");
  const betBumpValue = $("#bet-bump-value");
  const betBumpNumber = $("#bet-bump-number");
  const betBumpBoth = $("#bet-bump-both");

  const useStake = $("#use-stake");
  const useGarlic = $("#use-garlic");

  const character = GameState.getBattleCharacter();

  if (character.garlics) {
    useGarlic.classList.remove("hidden");
    $("#stake-count").textContent = 'x' + character.garlics;
  } else {
    useGarlic.classList.add("hidden");
  }

  if (character.stakes) {
    useStake.classList.remove("hidden");
    $("#stake-count").textContent = 'x' + character.stakes;
  } else {
    useStake.classList.add("hidden");
  }

  const [n, m] = diceState.bet;

  if (diceState.bet[1] == 6) {
    if (betBumpValue && betBumpBoth) {
      betBumpValue.classList.add("hidden");
      betBumpBoth.classList.add("hidden");
    }
  } else {
    betBumpValue.classList.remove("hidden");
    betBumpBoth.classList.remove("hidden")
    betBumpValue.innerText = diceToString(n, m + 1);
    betBumpBoth.innerText = diceToString(n + 1, m + 1);
  }

  betBumpNumber.innerText = diceToString(n + 1, m);
}

const battleStatus = $("#bet-status");

// Used to report Dracula thinking as well as good and bad bet calls
function setBattleStatus(status) {
  battleStatus.classList.remove("hidden");
  if (diceState.stakeActive)
    battleStatus.innerText = "Stake is active.\n"
  else
    battleStatus.innerText = ""
  battleStatus.innerText += status;
}

async function draculaThink() {
  // The formula is kinda hand-tweaked
  // If you plot in for x \in [0; 1] you can see
  // that the fast times are really fast, possibly giving
  // a feeling of a very confident bet
  const DRACULA_THINKING_TIME = 0.1 + Math.log(17 * Math.random() + 1);
  // how often the dots are updated
  const UPDATE_INTERVAL = 0.3;

  // Display 3 dots while the dracula is thinking, blinking
  // them periodically
  setBattleStatus(".");
  await sleepActive(
    (i) => {
      setBattleStatus(".".repeat((i % 3) + 1));
    },
    UPDATE_INTERVAL,
    DRACULA_THINKING_TIME
  );
  battleStatus.classList.add("hidden");

  let choices = { 'bumpValue': betBumpValue, 'bumpNumber': betBumpNumber, 'bumpValueAndNumber': betBumpBoth, 'call': callOut };

  // Can not bump a value
  if (diceState.bet[1] == 6) {
    delete choices.bumpValue;
    delete choices.betBumpBoth;
  }

  let choice = draculaDecide(diceState.dice.dracula, diceState.dice.player, diceState.bet);
  console.info(choice);
  console.log(choice)
  if (!(choice in choices)) {
    console.warn("Whoops, Dracula wants to " + choice + ", but can't, falling back calling out");
    choice = 'call';
  }

  // TODO: make dracula be able to select calling out
  await choices[choice]();
}

function draculaSetStartingBet() {
  let n = 3 - Math.floor(Math.sqrt(Math.random() * 9));
  let m = Math.floor(Math.random() * 6) + 1;
  return [n, m];
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
  if (loser_idx == PLAYER) {
    const proxies = diceState.playerDiceProxies;
    const i = Math.floor(Math.random() * proxies.length);

    const DICE_REMOVE_ANIMATION_DURATION_S = 0.75;
    const TIMESLICES = 100;
    // XXX: assuming scale is uniform
    const START_SCALE = proxies[i].model.scale[0];
    const dt = DICE_REMOVE_ANIMATION_DURATION_S / TIMESLICES;
    const integrator = { t: 0 };

    await sleepActive(
      () => {
        const SCALE = START_SCALE * (1 - easeInQuart(integrator.t));
        proxies[i].model.scale.set(SCALE, SCALE, SCALE);
        integrator.t += dt;
      },
      dt,
      DICE_REMOVE_ANIMATION_DURATION_S
    );

    diceState.playerDiceProxies[i].model.removeFromParent();
    proxies.splice(i, 1);
  }
  // TODO: when Dracula's dice gets removed there is no timeout
  // or animation, so it looks kinda choppy.
}

async function callOut() {
  const isPlayerTurn = diceState.turn == PLAYER;
  if (isPlayerTurn) hideBattleOptions();

  console.log(diceState.turn + " calls!");
  const [n, m] = diceState.bet;
  console.log("The bet is", diceToString(n, m));

  console.log("Player: ", diceState.dice[PLAYER]);
  console.log("Dracula: ", diceState.dice[DRACULA]);
  console.log(diceState.dice);
  const allDice = diceState.dice[DRACULA].concat(diceState.dice[PLAYER]);

  // the amount of dice with the face value `m`
  const N = allDice.filter((M) => M == m).length;
  console.log(
    "Bet was " + diceToString(n, m) + ", found " + diceToString(N, m)
  );

  // The bet is safe if there is not less dice with the face value `m`
  let isBetSafe = N >= n;

  // Is Dracula's Turn? | Is The Bet Safe? | Who loses the dice?
  //        No          |       No         |        Player
  //        No          |       Yes        |        Dracula
  //        Yes         |       No         |        Dracula
  //        Yes         |       Yes        |        Player
  let loserIdx = (diceState.turn == DRACULA) ^ isBetSafe ? PLAYER : DRACULA;

  let diceLost = 1;
  if (diceState.stakeActive)
    diceLost++;

  // TODO: refactor me
  let betStatus = "undefined";
  if (isPlayerTurn)
    if (loserIdx == DRACULA)
      betStatus = `Good call. Dracula has ${diceState.dice[DRACULA].length - diceLost
        } left. `;
    else betStatus = "Poor call. ";
  else if (loserIdx == PLAYER)
    betStatus = "Dracula called your bluff. Lose a dice. ";
  else
    betStatus = `Dracula called and lost, he has ${diceState.dice[DRACULA].length - 1
      } left. `;

  console.log(diceState.stakeActive)
  if (isPlayerTurn && diceState.stakeActive)
    if (loserIdx === DRACULA)
      betStatus += "\nThe stake worked!";
    else if (loserIdx === PLAYER)
      betStatus += "\nThe stake was wasted.";

  setBattleStatus(betStatus);
  diceState.stakeActive = false;

  // Remove the dice from the respective player
  for (let i = 0; i < diceLost; i++)
    await removeDice(loserIdx);

  if (diceState.dice[DRACULA].length <= 0) {
    diceState.onGameEnd("draculaDead");
    return;
  } else if (diceState.dice[PLAYER].length <= 0) {
    diceState.onGameEnd("playerDead");
    return;
  }

  // Reroll Player's dice
  await rollDice(diceState.playerDiceProxies, "wait");
  // Reroll Dracula's dice
  let newDice = [];
  for (let i = 0; i < diceState.dice[DRACULA].length; i++)
    newDice.push(Math.floor(Math.random() * 6) + 1);
  diceState.dice[DRACULA] = newDice;

  diceState.bet = draculaSetStartingBet();
  updateCurrentBetDisplay();
  if (isPlayerTurn) showBattleOptions();
}

// Q: Why use a mode argument instead of just a boolean?
//    You're switching between 'nowait' and 'wait' either way
//    and those are only two values
// A: Yes, but rollDice(dice, true) doesn't make any sense
//    seing a boolean like this doesn't give you any info
//    as to what it's doing, while rollDice(dice, 'wait')
//    at least gives you a hint that it has to wait for smth
export async function rollDice(dice = [], mode = "nowait") {
  for (const die of dice) {
    let randomSpin = randomPointOnSphere().multiplyScalar(10);
    die.setSpin(randomSpin);
  }

  let promises = [];
  for (let i = 0; i < dice.length; i++) {
    const duration_s = 1 + 0.4 * i;
    if (mode == "wait") {
      promises.push(sleep(duration_s));
    } else {
      setTimeout(() => dice[i].stop(), 1000 * duration_s);
    }
  }

  for (let i = 0; i < promises.length; i++) {
    await promises[i];
    dice[i].stop();
  }

  diceState.dice.player = dice.map((dice) => dice.face + 1);
}

export async function startDiceRound(
  draculaDiceCount = 6,
  playerDiceProxies = [],
  onGameEnd
) {
  diceState.bet = draculaSetStartingBet();
  const draculaDice = [];
  for (let i = 0; i < draculaDiceCount; i++)
    draculaDice.push(Math.floor(Math.random() * 6) + 1);
  const playerDice = playerDiceProxies.map((dice) => dice.face + 1);
  diceState.playerDiceProxies = playerDiceProxies;

  // I wish you could say diceState.dice = { PLAYER: ..., DRACULA: ...},
  // but the PLAYER and DRACULA are treated as identifiers and the only way
  // to access them is using .PLAYER and .DRACULA, which is not what we want
  diceState.dice = {};
  diceState.dice[PLAYER] = playerDice;
  diceState.dice[DRACULA] = draculaDice;

  console.log(diceState);

  diceState.turn = PLAYER;
  showBattleOptions();
  updateCurrentBetDisplay();

  diceState.onGameEnd = onGameEnd;

  // Returns a function that handles all the setup and teardown
  // for making a bet for a given `action`
  function actionFactory(action) {
    async function wrapped() {
      // If it's not the player's turn, don't react to buttons
      if (diceState.turn !== PLAYER) return;
      // Do the action
      await action();
      // Hide the buttons after one is clicked
      hideBattleOptions();
      // Move the turn over to Dracula
      diceState.turn = DRACULA;
      await draculaThink();
      // Return turn back to the player
      diceState.turn = PLAYER;
      showBattleOptions();
    }

    return wrapped;
  }

  $("#bet-bump-value").onclick =
    actionFactory(betBumpValue);
  $("#bet-bump-number").onclick =
    actionFactory(betBumpNumber);
  $("#bet-bump-both").onclick =
    actionFactory(betBumpBoth);
  $("#use-garlic").onclick = async () => {
    /// XXX: hook garlic into here
  }
  $("#use-stake").onclick = async () => {
    if (diceState.turn !== PLAYER) return;
    let character = GameState.getBattleCharacter();
    if (!character.stakes) return;

    if (diceState.stakeActive) {
      setBattleStatus("Can't use more than 1 stake at a time");
      return;
    }

    diceState.stakeActive = true;
    character.stakes--;
    setBattleStatus("");
    showBattleOptions();
  }
  $("#bet-call").onclick = async () => {
    if (diceState.turn !== PLAYER) return;
    await callOut();
  };
}
