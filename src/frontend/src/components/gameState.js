import * as THREE from "three";

export const GameState = {
  airports: null,
  connections: null,
  characters: [],
  dracula: null,
  scene: null,
  timer: null,

  isConnected(from, to) {
    return this.connections.some(
      ([a, b]) => (a === from && b === to) || (a === to && b === from)
    );
  },
  markAirport(airport, isMarked = false) {
    if (isMarked) {
      this.airports[airport].material.color.set("#fffe32");
    } else {
      this.airports[airport].material.color.set("#414141");
    }
  },
};

export class Character {
  constructor(type, airport) {
    this.type = type;
    this.airport = airport;
    this.mesh = this.createMesh();
    this.updatePosition();
    this.totalMoves = 0;
  }

  createMesh() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: this.type === "player" ? 0x06ff00 : 0xff0000,
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 60, 0);
    return mesh;
  }

  setAirport(target, ignoreConnections = false) {
    const currentIndex = GameState.airports.indexOf(this.airport);
    if (ignoreConnections) {
      this.airport = GameState.airports[target];
      this.updatePosition();
      return;
    } else if (GameState.isConnected(currentIndex, target)) {
      this.airport = GameState.airports[target];
      this.updatePosition();
    } else {
      console.error("Unconnected airport:", target);
    }
  }

  updatePosition() {
    const airportPos = this.airport.position;
    this.mesh.position.copy(airportPos.clone());
    this.mesh.lookAt(new THREE.Vector3(0, 60, 0));
  }
}

export function createCharacters(
  globeGroup,
  spawns = [0, 1, 2, 3],
  draculaSpawn = 4
) {
  spawns.forEach((spawn) => {
    const character = new Character("player", GameState.airports[spawn]);
    globeGroup.add(character.mesh);
    GameState.characters.push(character);
  });
  const dracula = new Character("dracula", GameState.airports[draculaSpawn]);
  globeGroup.add(dracula.mesh);
  GameState.dracula = dracula;
}
