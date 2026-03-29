import * as THREE from 'three';

export class Gift {
  constructor(scene, colorBox, colorRibbon, position) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.copy(position);
    
    // Gift Box Base
    const boxSize = 0.8 + Math.random() * 0.5; // Randomize sizes slightly between ~0.8 to 1.3
    const boxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const boxMat = new THREE.MeshStandardMaterial({ color: colorBox, flatShading: true, roughness: 0.7 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.y = boxSize / 2;
    
    // Ribbon wrap (Horizontal + Vertical overlap)
    const ribbonOffset = 0.05; // slightly larger to sit outside the box
    const ribbonWidth = 0.15;
    
    const ribbonGeo1 = new THREE.BoxGeometry(boxSize + ribbonOffset, boxSize + ribbonOffset, ribbonWidth);
    const ribbonMat = new THREE.MeshStandardMaterial({ color: colorRibbon, flatShading: true, roughness: 0.5 });
    const ribbon1 = new THREE.Mesh(ribbonGeo1, ribbonMat);
    ribbon1.position.y = boxSize / 2;
    
    const ribbonGeo2 = new THREE.BoxGeometry(ribbonWidth, boxSize + ribbonOffset, boxSize + ribbonOffset);
    const ribbon2 = new THREE.Mesh(ribbonGeo2, ribbonMat);
    ribbon2.position.y = boxSize / 2;
    
    // Bow structure on top
    const bowGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const bow1 = new THREE.Mesh(bowGeo, ribbonMat);
    bow1.position.set(0.15, boxSize + 0.1, 0);
    bow1.rotation.z = Math.PI / 4;
    
    const bow2 = new THREE.Mesh(bowGeo, ribbonMat);
    bow2.position.set(-0.15, boxSize + 0.1, 0);
    bow2.rotation.z = -Math.PI / 4;

    this.group.add(box, ribbon1, ribbon2, bow1, bow2);

    this.group.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Randomize rotation so they don't look perfectly aligned
    this.group.rotation.y = Math.random() * Math.PI * 2;

    this.scene.add(this.group);
  }
}
