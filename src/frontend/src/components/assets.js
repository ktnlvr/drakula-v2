import * as THREE from "three";
import { fetchAirports } from "./api";

export function createGlobe(interactionManager, outlinePass) {
  const dayTexture = new THREE.TextureLoader().load("/EarthColor.png");
  const normalTexture = new THREE.TextureLoader().load("/EarthNormal.png");

  const globeGroup = new THREE.Group();
  const geometry = new THREE.SphereGeometry(30, 128, 64);
  const material = new THREE.MeshStandardMaterial({
    map: dayTexture,
    normalMap: normalTexture,
  });
  const globe = new THREE.Mesh(geometry, material);

  let mousedown = false;
  let hovering = false;
  let previousMousePos = null;
  let velocity = { y: 0 };
  const damping = 0.995;
  const swiping = 0.08;
  const stopping = 0.92;
  globe.addEventListener('mousedown', (event) => {
    event.stopPropagation();
    mousedown = true;
  });

  window.addEventListener('mouseup', (event) => {
    event.stopPropagation();
    mousedown = false;
    previousMousePos = null;
  });

  globe.addEventListener('mouseenter', () => {
    hovering = true;
    document.body.style.cursor = "grab";
  });

  globe.addEventListener('mousemove', (event) => {
    event.stopPropagation();
    if (hovering && mousedown) {
      if (!previousMousePos) {
        previousMousePos = { x: event.coords.x };
        return;
      }

      velocity.y += (event.coords.x - previousMousePos.x) * swiping;
      previousMousePos.x = event.coords.x;
    }
  });

  globe.addEventListener('mouseleave', (event) => {
    event.stopPropagation();
    hovering = false;
    document.body.style.cursor = "default";
  });

  function updateRotation() {
    if (hovering && mousedown) {
      document.body.style.cursor = "grabbing";
      velocity.y *= stopping;
    } else {
      document.body.style.cursor = "grab";
      velocity.y *= damping;
    }
    globeGroup.rotation.y += velocity.y;
    
    requestAnimationFrame(updateRotation);
  }

  updateRotation();

  interactionManager.add(globe);

  globe.castShadow = true;
  globe.receiveShadow = true;
  globeGroup.add(globe);

  function PosFromLatLon(phi, theta) {
    let lat = (90 - phi) * (Math.PI / 180);
    let lon = (theta + 180) * (Math.PI / 180);
    let coords = {};
    coords.x = 30 * -(Math.sin(lat) * Math.cos(lon)) + globe.position.x;
    coords.z = 30 * Math.sin(lat) * Math.sin(lon) + globe.position.z;
    coords.y = 30 * Math.cos(lat) + globe.position.y;
    return coords;
  }

  function createConnection(start, end) {
    const midPoint = new THREE.Vector3(
      (start.x + end.x) / 2,
      (start.y + end.y) / 2,
      (start.z + end.z) / 2
    );

    const distance = start.distanceTo(end);
    const height = distance * 0.5;

    midPoint
      .sub(globe.position)
      .normalize()
      .multiplyScalar(30 + height)
      .add(globe.position);

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(start.x, start.y, start.z),
      midPoint,
      new THREE.Vector3(end.x, end.y, end.z)
    );

    const points = curve.getPoints(25);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0xe5e5e5,
      transparent: false,
      opacity: 0.7,
    });

    return new THREE.Line(geometry, material);
  }

  fetchAirports(30)
    .then((data) => {
      const airportPoints = [];
      for (const airport of data.airports) {
        console.log(airport);
        const coords = PosFromLatLon(
          airport.latitude_deg,
          airport.longitude_deg
        );
        const geometry = new THREE.SphereGeometry(0.4, 64, 32);
        const material = new THREE.MeshStandardMaterial({
          color: "#646464",
        });
        const airportPoint = new THREE.Mesh(geometry, material);
        interactionManager.add(airportPoint);
        airportPoint.addEventListener("mousedown", (event) => {
          console.log("Selected airport: ", airport.name);
          event.stopPropagation();
          outlinePass.selectedObjects = [airportPoint];
        });
        airportPoint.addEventListener("mouseover", (event) => {
          airportPoint.material.color.set("#d8d8d8");
          document.body.style.cursor = "pointer";
        });

        airportPoint.addEventListener("mouseout", (event) => {
          airportPoint.material.color.set("#646464");
          document.body.style.cursor = "default";
        });
        airportPoint.position.set(coords.x, coords.y, coords.z);
        globeGroup.add(airportPoint);
        airportPoints.push(airportPoint);
      }
      for (const connection of data.connections) {
        console.log(connection);
        const [fromIdx, toIdx] = connection;
        const connectionLine = createConnection(
          airportPoints[fromIdx].position,
          airportPoints[toIdx].position
        );
        globeGroup.add(connectionLine);
      }
    })
    .catch(console.error);

  return globeGroup;
}

export function createTable() {
  const geometry = new THREE.BoxGeometry(220, 2, 220);
  const material = new THREE.MeshStandardMaterial({ color: "#38322c" });
  const table = new THREE.Mesh(geometry, material);
  table.position.y = -60;
  table.castShadow = true;
  table.receiveShadow = true;
  return table;
}
