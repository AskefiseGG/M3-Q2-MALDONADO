import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Scene and Camera Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 50);

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Post-processing Setup (Bloom Effect)
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, // Bloom strength
  0.4, // Bloom radius
  0.85 // Bloom threshold
);
composer.addPass(bloomPass);

// Text Setup
let textMesh;
function createText() {
  const loader = new FontLoader();
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const textGeometry = new TextGeometry('Alvaro', {
      font: font,
      size: 10,
      height: 2,
    });

    // Create neon-like material
    const textMaterial = new THREE.MeshStandardMaterial({
      color: 0xff00ff, 
      emissive: 0xff00ff,
      emissiveIntensity: 1, 
      roughness: 0.2, 
      metalness: 0.8 
    });

    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-20, 0, -5);
    scene.add(textMesh);
  });
}
createText();

// Particles Setup
let starGeo, stars;
function createParticles() {
  const points = [];
  for (let i = 0; i < 50000; i++) {
    let star = new THREE.Vector3(
      Math.random() * 600 - 300,
      Math.random() * 600 - 300,
      Math.random() * 600 - 300
    );
    points.push(star);
  }

  starGeo = new THREE.BufferGeometry().setFromPoints(points);
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
  stars = new THREE.Points(starGeo, starMaterial);
  scene.add(stars);
}
createParticles();

// Lighting Setup
function setupLighting() {
  // Ambient light to soften the scene
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  // Point light to enhance the neon look
  const pointLight = new THREE.PointLight(0xff00ff, 2, 200);
  pointLight.position.set(0, 20, 20);
  scene.add(pointLight);
}
setupLighting();

// Animate Particles
function animateParticles() {
  const positions = starGeo.attributes.position.array;

  for (let i = 1; i < positions.length; i += 3) {
    positions[i] -= 1;
    if (positions[i] < -300) {
      positions[i] = 300;
    }
  }
  starGeo.attributes.position.needsUpdate = true;
}

// Change Particle Colors Every 3 Seconds
setInterval(() => {
  const randomColor = Math.floor(Math.random() * 0xffffff);
  stars.material.color.setHex(randomColor);
}, 3000);

// Render Loop
function animate() {
  requestAnimationFrame(animate);

  if (textMesh) {
    textMesh.rotation.x += 0.05;
    textMesh.rotation.y += 0.05;
  }

  // Animate particles falling
  animateParticles();

  // Use composer for rendering with bloom effect
  composer.render();
}
animate();

// Handle Window Resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
