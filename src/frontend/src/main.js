import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material); scene.add(cube);
camera.position.z = 5;

function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

const cardCounts = {
    1: { 1: 0, 2: 0 },
    2: { 1: 0, 2: 0 },
    3: { 1: 0, 2: 0 }
  };

function updateCardCount(token)
{
    const character = token.closest("#character-block")
    const characterId = character.getAttribute("char-id")
    const p = token.nextElementSibling;
    const tokenId = token.getAttribute("token-no")
    cardCounts[characterId][tokenId] += 1;
    console.log("Decreament here and add changes according to yourself.")
    p.textContent = `x${cardCounts[characterId][tokenId]}`
}

document.querySelectorAll(".token").forEach((token) => {
    token.addEventListener("click",function(){
        updateCardCount(token)
    })
})