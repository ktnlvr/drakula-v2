import * as THREE from "three";
import { logInfo } from "./logger";
import characterVertex from "./shaders/characterBeaconVert";
import characterFragment from "./shaders/characterBeaconFrag";
import draculaVertex from "./shaders/draculaBeaconVert";
import draculaFragment from "./shaders/draculaBeaconFrag";
import updateMovesInUI from "../components/cards";

const center = new THREE.Vector3(0, 60, 0);
export const GameState = {
  airports: null,
  connections: null,
  characters: [],
  dracula: null,
  scene: "Overworld",
  timer: null,
  selectedCharacter: null,
  battleCharacter: null,
  ticketCharacter: null,
  draculaDiceCount: 5,
  deadCharacters: [],

  isConnected(from, to) {
    return this.connections.some(
      (connection) =>
        (connection[0] === from && connection[1] === to) ||
        (connection[0] === to && connection[1] === from)
    );
  },

  markAirport(airport, isMarked = false, color = undefined) {
    const colorData = this.airports[airport].material.color;

    // Required to keep compatibility with possible callsites.
    if (color !== undefined) {
      colorData.set(color);
    } else if (isMarked) {
      colorData.set("#fffe32");
    } else {
      colorData.set("#414141");
    }
  },

  getBattleCharacter() {
    console.log(this.characters);
    console.log(this.battleCharacter);
    return this.characters[this.battleCharacter];
  },
};

const CHARACTER_NAMES = [
  "Unico",
  "Alucard", // Protaganist from a manga about vampires
  "Abraham Van Helsing", // Famous Vampire Hunter
  "John Adams", // a Founding Father
  "Sherlock Holmes", // Famous detective
  "Tobias Forge", // The lead singer of "Ghost"
  "Saint Nicholas", // Santa Claus
  "Aleister Crowley", // Famous occultist
  "Christopher Lee", // Actor that played Dracula
  "Sam Winchester", // Supernatural
  "Dean Winchester", // Supernatural
];

function getRandomCharacterName() {
  if (!CHARACTER_NAMES) {
    return "Anonymous";
  }

  const idx = Math.floor(Math.random() * CHARACTER_NAMES.length);
  const name = CHARACTER_NAMES[idx];
  CHARACTER_NAMES.splice(idx, 1);
  return name;
}

export class Character {
  constructor(type, airport) {
    this.type = type;
    this.airport = airport;
    this.mesh = this.createMesh();
    this.updatePosition();
    this.name = getRandomCharacterName();

    if (this.type !== "dracula") {
      // characters a semi-balanced, since all stats often add up to
      // some fixed number, this is some real 3am mathemagic
      // Conjecturally, gives a uniform
      const TOTAL = 3;
      this.edge = 2 * Math.floor(Math.random() * TOTAL) + 1;
      this.capacity =
        Math.max(0, Math.floor(Math.random() * TOTAL - this.edge)) + 1;
      this.haste = Math.max(0, TOTAL - this.edge - this.capacity) + 1;
      this.totalMoves = this.haste;

      this.garlics = 0;
      this.stakes = 0;
      this.tickets = 0;
    } else {
      this.totalMoves = 0;
    }
  }

  resetMoves() {
    this.totalMoves = this.haste;
  }

  createMesh() {
    if (this.type === "dracula") {
      const geometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 64, 64, true);
      const material = new THREE.ShaderMaterial({
        transparent: true,
        opacity: 0,
        visible: false,
      });
      const mesh = new THREE.Mesh(geometry, material);

      return mesh;
    } else {
      const geometry = new THREE.CylinderGeometry(0.6, 0.6, 2, 64, 64, true);
      const material = new THREE.ShaderMaterial({
        vertexShader: characterVertex,
        fragmentShader: characterFragment,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms: {
          uTime: {
            get value() {
              return GameState.timer;
            },
          },
        },
      });
      const mesh = new THREE.Mesh(geometry, material);

      return mesh;
    }
  }

  setAirport(target, ignoreConnections = false) {
    const currentIndex = GameState.airports.indexOf(this.airport);
    if (ignoreConnections) {
      if (this.tickets > 0) {
        this.airport = GameState.airports[target];
        this.updatePosition();
        this.tickets--;
        const tokenElement = document.querySelector(
          `#character-block[char-id="${GameState.ticketCharacter}"] .ticket`
        );
        if (tokenElement) {
          const countElement = tokenElement.nextElementSibling;
          countElement.textContent = `x${this.tickets}`;
        }
        GameState.ticketCharacter = null;
      } else {
        logInfo("This character has no tickets");
      }
      return;
    } else if (this.totalMoves !== 0) {
      if (GameState.isConnected(currentIndex, target)) {
        this.airport = GameState.airports[target];
        this.updatePosition();
        if (this.type !== "dracula") this.gainItem(GameState.selectedCharacter);
        this.totalMoves--;
        updateMovesInUI();
        GameState.selectedCharacter = null;
      } else {
        logInfo("The selected airport is out of reach for this character");
      }
    } else {
      logInfo("This character is out of moves");
      GameState.selectedCharacter = null;
    }
  }

  updatePosition() {
    const airportPos = this.airport.position;
    this.mesh.position.copy(airportPos.clone());
    this.mesh.lookAt(center);
    this.mesh.lookAt(center);
    this.mesh.rotateX(-Math.PI / 2);
    const currentDirection = this.mesh.position.clone().sub(center);
    const currentDistance = currentDirection.length();
    const newDistance = currentDistance + 1.25;
    this.mesh.position
      .copy(center)
      .add(currentDirection.normalize().multiplyScalar(newDistance));
  }

  hasCapacity() {
    return this.garlics + this.stakes + this.tickets < this.capacity;
  }

  gainItem(characterIdx) {
    if (!GameState.characters[characterIdx].hasCapacity()) return;

    const ITEM_GAIN_CHANCE = 0.1;
    if (Math.random() < ITEM_GAIN_CHANCE) {
      const things = ["garlics", "tickets", "stakes"];
      let gains = things[Math.floor(Math.random() * things.length)];
      this[gains]++;
      logInfo(`The character gains ${gains}! +1`);
    }

    updateItemCountDisplay(characterIdx);
  }
}

function updateItemCountDisplay(characterIdx) {
  for (const [cssName, gainName] of [
    ["ticket", "tickets"],
    ["stake", "stakes"],
    ["garlic", "garlics"],
  ]) {
    const tokenElement = document.querySelector(
      `#character-block[char-id="${characterIdx}"] .${cssName}`
    );
    if (tokenElement) {
      const countElement = tokenElement.nextElementSibling;
      countElement.textContent = `x${GameState.characters[gainName]}`;
    }
  }
}

export function createCharacters(globeGroup, draculaSpawn = 4) {
  const characterL = new Character("light", GameState.airports[0]);
  globeGroup.add(characterL.mesh);
  GameState.characters.push(characterL);
  const characterM1 = new Character("medium", GameState.airports[1]);
  globeGroup.add(characterM1.mesh);
  GameState.characters.push(characterM1);
  const characterM2 = new Character("medium", GameState.airports[2]);
  globeGroup.add(characterM2.mesh);
  GameState.characters.push(characterM2);
  const characterH = new Character("heavy", GameState.airports[3]);
  globeGroup.add(characterH.mesh);
  GameState.characters.push(characterH);

  const dracula = new Character("dracula", GameState.airports[draculaSpawn]);
  globeGroup.add(dracula.mesh);
  GameState.dracula = dracula;
}
