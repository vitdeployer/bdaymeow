import * as THREE from 'three';
import gsap from 'gsap';

import { Environment } from './Environment.js';
import { Text3D } from './models/Text3D.js';
import { Girl } from './models/Girl.js';
import { Cat } from './models/Cat.js';
import { MaxwellCat } from './models/MaxwellCat.js';
import { Cake } from './models/Cake.js';
import { Gift } from './models/Gift.js';
import { Stage } from './models/Stage.js';
import songUrl from './assets/song.mp3';
import './style.css';

// Scene Setup
const canvas = document.querySelector('#app-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 20);

const listener = new THREE.AudioListener();
camera.add(listener);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const environment = new Environment(scene);
const textModel = new Text3D(scene, "Happy Birthday Akanksha!");
const girl = new Girl(scene);
const cake = new Cake(scene);
const cats = [];

girl.group.position.set(-8, 0, 0);

// Colors for the kitties
const catColors = [0xffffff, 0x808080, 0x000000, 0xffa500, 0xffcc99, 0xb87333];

// Add 10 cats scattered heavily around the cake in an inner circle
for(let i=0; i<10; i++) {
  const angle = (i / 10) * Math.PI * 2;
  const radius = 3 + Math.random() * 1.5; // close to cake (radius 3 to 4.5)
  const x = cake.group.position.x + Math.cos(angle) * radius;
  const z = cake.group.position.z + Math.sin(angle) * radius;
  
  const color = catColors[Math.floor(Math.random() * catColors.length)];
  cats.push(new Cat(scene, color, new THREE.Vector3(x, 0, z), listener));
}

// Add the special Maxwell Cat right near the cake
cats.push(new MaxwellCat(scene, new THREE.Vector3(cake.group.position.x - 3.5, 0, cake.group.position.z + 1), listener));

// Add 15 decorated Birthday Gifts scattered securely behind the cake (further away)
const giftColors = [0xff6b6b, 0x4ecdc4, 0xffd93d, 0x6a0572, 0xff9a9e, 0x1a535c, 0xf7fff7];
for(let i=0; i<15; i++) {
  // Girl approaches from x = -8. So "behind" cake is positive X.
  const angle = -Math.PI / 2 + Math.random() * Math.PI; 
  const radius = 6 + Math.random() * 6; // 6 to 12
  
  const x = cake.group.position.x + Math.cos(angle) * radius;
  const z = cake.group.position.z + Math.sin(angle) * radius;
  
  const boxColor = giftColors[Math.floor(Math.random() * giftColors.length)];
  let ribbonColor = giftColors[Math.floor(Math.random() * giftColors.length)];
  if(boxColor === ribbonColor) ribbonColor = 0xffffff; 
  
  new Gift(scene, boxColor, ribbonColor, new THREE.Vector3(x, 0, z));
}

// Add the 3D Music Concert Stage in the background (-z axis)
const stage = new Stage(scene, new THREE.Vector3(0, 0, -35));

const uiOverlay = document.getElementById('ui-overlay');
const loadingText = document.getElementById('loading');
const startScreen = document.getElementById('start-screen');
// Note we tell the user to press ESC to exit
startScreen.innerHTML = '<h1 class="text-glow animate-pulse">Click anywhere to Control with WASD keys & Mouse <br> Go and touch the cake.<span style="font-size: 0.5em">(Press ESC to release Mouse)</span></h1>';

setTimeout(() => {
  loadingText.style.display = 'none';
  startScreen.style.display = 'block';
  uiOverlay.style.pointerEvents = 'auto'; // allow clicks
}, 1500);

let sceneState = 'intro'; // 'intro', 'transitioning', 'playing'
let cakeCut = false; 

// Input state
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false;
});

// Pointer Lock system variables 
let spherical = new THREE.Spherical(7, Math.PI / 2.5, Math.PI / 2); // Radius 7, Angle Downwards, Theta Horizontal
const cameraTarget = new THREE.Vector3();

document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement === document.body && sceneState === 'playing') {
    const sensitivityX = 0.003;
    const sensitivityY = 0.003;
    
    spherical.theta -= e.movementX * sensitivityX;
    spherical.phi -= e.movementY * sensitivityY;
    
    // Clamp vertical angle to not go under the geometry or perfectly overhead
    spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi));
  }
});

uiOverlay.addEventListener('click', () => {
  if (sceneState === 'intro') {
    sceneState = 'transitioning';
    if (listener.context.state === 'suspended') {
      listener.context.resume();
    }
    
    uiOverlay.classList.add('hidden');

    gsap.to(textModel.sprite.material, {
      opacity: 0,
      duration: 1
    });

    gsap.to(camera.position, {
      x: girl.group.position.x - 7,
      y: girl.group.position.y + 3,
      z: girl.group.position.z,
      duration: 3,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(girl.group.position);
      },
      onComplete: () => {
        sceneState = 'playing';
        scene.remove(textModel.group);
        
        // Sync the spherical coords to where the camera mathematically ended up
        spherical.theta = -Math.PI / 2;
        
        // Lock the mouse pointer properly into 3rd person action mode
        document.body.requestPointerLock();
      }
    });
  } else if (sceneState === 'playing') {
    // Re-lock if the user clicked again after pressing ESC
    document.body.requestPointerLock();
  }
});

function triggerCelebration() {
  if (cakeCut) return;
  cakeCut = true;
  
  // Play the birthday song!
  const songAudio = new Audio(songUrl);
  songAudio.loop = true;
  songAudio.play().catch(e => console.error("Audio play failed", e));
  
  girl.stopWalking(); // Small pause
  
  girl.group.lookAt(cake.group.position);
  girl.cutCakeAnimation(gsap); // Swing arm
  
  cats.forEach(c => c.celebrate());
  createConfetti();
}

function createConfetti() {
  const confettiCount = 500;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(confettiCount * 3);
  const colors = new Float32Array(confettiCount * 3);

  for(let i = 0; i < confettiCount; i++) {
    // 3X wider spread area
    positions[i*3] = cake.group.position.x + (Math.random() - 0.5) * 24;
    positions[i*3+1] = cake.group.position.y + 10 + Math.random() * 10;
    positions[i*3+2] = cake.group.position.z + (Math.random() - 0.5) * 24;
    colors[i*3] = Math.random();
    colors[i*3+1] = Math.random();
    colors[i*3+2] = Math.random();
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    transparent: true
  });

  const confetti = new THREE.Points(geometry, material);
  scene.add(confetti);
  environment.confettiToAnimate = confetti;
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  environment.update(time); 
  cake.update(time);
  cats.forEach(c => c.update(time));
  girl.update(time);

  if (sceneState === 'intro') {
    camera.position.x = Math.sin(time * 0.2) * 5;
    camera.lookAt(0, 5, 0); 
  }

  if (sceneState === 'playing') {
    const speed = 7 * delta;
    let isMoving = false;
    
    const moveDir = new THREE.Vector3();
    
    // In THREE spherical coordinates, Theta evaluates horizontal angle.
    // To match WASD correctly relative to camera, deriving the direction vectors:
    const forwardX = Math.sin(spherical.theta + Math.PI);
    const forwardZ = Math.cos(spherical.theta + Math.PI);
    
    const rightX = Math.sin(spherical.theta + Math.PI / 2);
    const rightZ = Math.cos(spherical.theta + Math.PI / 2);

    if (keys.w) { moveDir.x += forwardX; moveDir.z += forwardZ; isMoving = true; }
    if (keys.s) { moveDir.x -= forwardX; moveDir.z -= forwardZ; isMoving = true; }
    if (keys.a) { moveDir.x -= rightX; moveDir.z -= rightZ; isMoving = true; }
    if (keys.d) { moveDir.x += rightX; moveDir.z += rightZ; isMoving = true; }

    if (isMoving) {
      moveDir.normalize().multiplyScalar(speed);
      girl.group.position.add(moveDir);
      
      const lookTarget = girl.group.position.clone().add(moveDir);
      girl.group.lookAt(lookTarget);
      girl.startWalking();
    } else {
      girl.stopWalking();
    }

    // Apply the mathematical spherical orbit offset continuously
    cameraTarget.copy(girl.group.position);
    cameraTarget.y += 1.2; // Look slightly above her head (towards neck/hair)

    camera.position.setFromSpherical(spherical);
    camera.position.add(cameraTarget);
    camera.lookAt(cameraTarget);

    if (!cakeCut) {
      const distToCake = girl.group.position.distanceTo(cake.group.position);
      if (distToCake < 3.0) {
         triggerCelebration();
      }
    }
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
