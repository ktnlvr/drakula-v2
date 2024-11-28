import * as THREE from "three";

export const GameState = {
  airports: null,
  connections: null,
  characters: [],
  dracula: null,
  scene: null,
  
  isConnected(from, to) {
    return this.connections.some(([a, b]) => 
      (a === from && b === to) || (a === to && b === from)
    );
  }
};

export class Character {
  constructor(type, airport) {
    this.type = type;
    this.airport = airport;
    this.mesh = this.createMesh();
    this.updatePosition();
  }

  createMesh() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: this.type === "player" ? 0x06ff00 : 0xff0000,
      transparent: true,
      opacity: 0.9,
    });
    return new THREE.Mesh(geometry, material);
  }

  setAirport(target) {
    const currentIndex = GameState.airports.indexOf(this.airport);
    
    if (GameState.isConnected(currentIndex, target)) {
      this.airport = GameState.airports(target);
      this.updatePosition();
    } else {
      console.error('Unconnected airport:', target);
   } 
  }

  updatePosition() {
    const airportPos = this.airport.position;
    const distance = airportPos.length() + 2.5;
    this.mesh.position.copy(
      airportPos.clone().normalize().multiplyScalar(distance)
    );
    this.mesh.lookAt(new THREE.Vector3(0, 0, 0));
  }
}

export function createCharacters(
  globeGroup,
  spawns = [0, 1, 2],
  draculaSpawn = 3
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
