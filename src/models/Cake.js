import * as THREE from 'three';

export class Cake {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    
    // Table
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.2, 32), tableMat);
    tableBase.position.y = 0.5;
    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8), tableMat);
    tableLeg.position.y = 0.25;

    // Cake materials
    const icingMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.4 }); // Pink base
    const topIcingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }); // White top
    
    // Tier 1
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.8, 32), icingMat);
    tier1.position.y = 1;
    
    // Tier 2
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 32), icingMat);
    tier2.position.y = 1.7;

    // Candles
    this.candles = [];
    const candleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White candle
    
    // 5 candles for 5-year-old
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const radius = 0.5;
      
      const candle = new THREE.Group();
      candle.position.set(Math.cos(angle) * radius, 2.2, Math.sin(angle) * radius);
      
      const wax = new THREE.Mesh(candleGeo, candleMat);
      
      // Flame (small glowing sphere)
      const flameGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa500 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.y = 0.25;
      
      // Point light for the flame
      const flameLight = new THREE.PointLight(0xffa500, 1, 3);
      flameLight.position.y = 0.25;
      
      candle.add(wax, flame, flameLight);
      this.candles.push(candle);
      this.group.add(candle);
    }

    this.group.add(tableBase, tableLeg, tier1, tier2);

    // Position
    this.group.position.set(8, 0, 0); // Offset to the right for Scene 2

    // Shadows
    this.group.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.scene.add(this.group);
  }

  update(time) {
    // Flicker candles slightly
    this.candles.forEach(candle => {
      const light = candle.children[2];
      light.intensity = 1 + Math.sin(time * 10 + candle.position.x) * 0.2;
    });
  }
}
