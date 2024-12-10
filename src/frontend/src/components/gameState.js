import * as THREE from "three";
import characterVertex from "./shaders/characterBeaconVert";
import characterFragment from "./shaders/characterBeaconFrag";
import draculaVertex from "./shaders/draculaBeaconVert";
import draculaFragment from "./shaders/draculaBeaconFrag";

const center = new THREE.Vector3(0, 60, 0);
export const GameState = {
  airports: null,
  connections: null,
  characters: [],
  dracula: null,
  scene: "Overworld",
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
    if (this.type === "dracula") {
      const geometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 64, 64, true);
      const material = new THREE.ShaderMaterial({
        vertexShader: draculaVertex,
        fragmentShader: draculaFragment,
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
    } else {
      const geometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 64, 64, true);
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
    this.mesh.lookAt(center);
    this.mesh.lookAt(center);
    this.mesh.rotateX(-Math.PI / 2);
    const currentDirection = this.mesh.position.clone().sub(center);
    const currentDistance = currentDirection.length();
    const newDistance = currentDistance + 2.75;
    this.mesh.position
      .copy(center)
      .add(currentDirection.normalize().multiplyScalar(newDistance));
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
