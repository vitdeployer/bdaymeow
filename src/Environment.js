import * as THREE from 'three';

export class Environment {
  constructor(scene) {
    this.scene = scene;
    
    // Arrays for things we want to animate (like clouds)
    this.clouds = [];
    this.confettiToAnimate = null; // set by main.js later

    this.initLighting();
    this.initFog();
    this.initLandscape();
  }

  initLighting() {
    // Soft ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Warm directional light mimicking sunset/dreamy sky
    const dirLight = new THREE.DirectionalLight(0xffd1dc, 1);
    dirLight.position.set(20, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -40;
    dirLight.shadow.camera.right = 40;
    dirLight.shadow.camera.top = 40;
    dirLight.shadow.camera.bottom = -40;
    this.scene.add(dirLight);

    // Blueish soft rim light
    const blueLight = new THREE.DirectionalLight(0x87ceeb, 0.5);
    blueLight.position.set(-20, 10, -20);
    this.scene.add(blueLight);
  }

  initFog() {
    // Beautiful pastel sky blue fading into pink/purple fog
    const skyColor = new THREE.Color(0xaee2ff); // Soft pastel blue
    this.scene.background = skyColor;
    this.scene.fog = new THREE.FogExp2(0xaee2ff, 0.015);
  }

  initLandscape() {
    // 1. Ground Plane (Blocky slab)
    const groundGeo = new THREE.BoxGeometry(150, 4, 150);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x90ee90, // light green
      roughness: 0.9,
      flatShading: true
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -2; // top face is at Y=0
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Procedural Blocky Trees scattered around
    const treeCount = 40;
    for (let i = 0; i < treeCount; i++) {
      this.createTree();
    }

    // 3. Floating Blocky Clouds
    const cloudCount = 45; // Tripled the regular amount
    for (let i = 0; i < cloudCount; i++) {
      this.createCloud();
    }
    
    // 4. Little decorative stones
    for (let i = 0; i < 30; i++) {
      this.createStone();
    }
  }

  createTree() {
    const group = new THREE.Group();
    
    // Trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, flatShading: true });
    const trunkHeight = 2 + Math.random() * 2;
    const trunkGeo = new THREE.BoxGeometry(0.8, trunkHeight, 0.8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    // Leaves
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, flatShading: true }); // Sea green
    // Create a cluster of 3-4 random intersecting boxes for leaves
    const leavesCenterY = trunkHeight + 0.5;
    
    for (let j=0; j<3; j++) {
      const size = 2 + Math.random() * 2;
      const leafGeo = new THREE.BoxGeometry(size, size, size);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      
      leaf.position.set(
        (Math.random() - 0.5) * 1.5,
        leavesCenterY + (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5
      );
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      group.add(leaf);
    }

    // Random position avoiding the center where the cake and spawn are (-10 to 15)
    let rx, rz;
    do {
      rx = (Math.random() - 0.5) * 100;
      rz = (Math.random() - 0.5) * 100;
    } while (Math.abs(rx) < 15 && Math.abs(rz) < 15); // Clear space in middle

    group.position.set(rx, 0, rz);
    
    group.rotation.y = Math.random() * Math.PI;
    this.scene.add(group);
  }

  createCloud() {
    const group = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      flatShading: true,
      transparent: true,
      opacity: 0.8 
    });

    const numBlocks = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numBlocks; i++) {
      const w = 4 + Math.random() * 6;
      const h = 2 + Math.random() * 2;
      const d = 4 + Math.random() * 6;
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cloudMat);
      box.position.set(
        (Math.random() - 0.5) * w,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * d
      );
      box.castShadow = true;
      group.add(box);
    }

    // Position high up
    group.position.set(
      (Math.random() - 0.5) * 140,
      15 + Math.random() * 15,
      (Math.random() - 0.5) * 140
    );
    
    // Save random drift speed
    group.userData.speed = 0.02 + Math.random() * 0.03;

    this.clouds.push(group);
    this.scene.add(group);
  }

  createStone() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x888888, flatShading: true });
    const size = 0.2 + Math.random() * 0.6;
    const stoneGeo = new THREE.BoxGeometry(size, size, size);
    const stone = new THREE.Mesh(stoneGeo, mat);
    
    stone.position.set(
      (Math.random() - 0.5) * 80,
      size / 2,
      (Math.random() - 0.5) * 80
    );
    stone.rotation.y = Math.random() * Math.PI;
    stone.castShadow = true;
    stone.receiveShadow = true;
    this.scene.add(stone);
  }

  update(time) {
    // Animate clouds slowly drifting across the sky
    this.clouds.forEach(cloud => {
      cloud.position.x += cloud.userData.speed;
      // Loop back if they drift too far
      if (cloud.position.x > 80) {
        cloud.position.x = -80;
      }
    });

    // Handle Confetti falling if active
    if (this.confettiToAnimate) {
      const positions = this.confettiToAnimate.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.12; // 3x faster sprinkle speed
        if (positions[i + 1] < 0) {
          positions[i + 1] = 0; // stop at floor
        }
      }
      this.confettiToAnimate.geometry.attributes.position.needsUpdate = true;
    }
  }
}
