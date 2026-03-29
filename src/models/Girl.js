import * as THREE from 'three';

export class Girl {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    
    // minecraft style materials (no smoothing, hard blocks)
    const dressMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.9, flatShading: true });
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffdcb6, roughness: 0.9, flatShading: true });
    const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3b32, roughness: 0.9, flatShading: true });
    
    // Proportions roughly matching Minecraft Steve/Alex
    // 1 Unit = 10 Minecraft Pixels (Approx)
    // Head: 8x8x8 => 0.8 x 0.8 x 0.8
    const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    this.head = new THREE.Mesh(headGeo, skinMaterial);
    this.head.position.y = 2.0;

    // Hair layers (only covering top, back, and sides to expose the face)
    const hairTopGeo = new THREE.BoxGeometry(0.85, 0.25, 0.85);
    const hairTop = new THREE.Mesh(hairTopGeo, hairMaterial);
    hairTop.position.y = 0.4; // sit on top
    this.head.add(hairTop);

    const hairBackGeo = new THREE.BoxGeometry(0.85, 0.8, 0.2);
    const hairBack = new THREE.Mesh(hairBackGeo, hairMaterial);
    hairBack.position.set(0, -0.1, -0.425); // hang on back
    this.head.add(hairBack);

    const hairSideGeo = new THREE.BoxGeometry(0.1, 0.8, 0.65);
    const hairRight = new THREE.Mesh(hairSideGeo, hairMaterial);
    hairRight.position.set(0.425, -0.1, -0.05);
    const hairLeft = new THREE.Mesh(hairSideGeo, hairMaterial);
    hairLeft.position.set(-0.425, -0.1, -0.05);
    this.head.add(hairRight, hairLeft);

    // Add Minecraft-style Eyes and Mouth on the Front face (+Z)
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000, flatShading: true }); // Black eyes
    const eyeGeo = new THREE.BoxGeometry(0.15, 0.15, 0.05);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.2, 0.05, 0.41); 
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.2, 0.05, 0.41);
    this.head.add(rightEye, leftEye);

    const mouthMat = new THREE.MeshStandardMaterial({ color: 0xcc6666, flatShading: true }); // Dark Pink/Redish mouth
    const mouthGeo = new THREE.BoxGeometry(0.2, 0.08, 0.05);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.15, 0.41);
    this.head.add(mouth);

    // Torso: 8x12x4 => 0.8 x 1.2 x 0.4 
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    this.torso = new THREE.Mesh(torsoGeo, dressMaterial);
    this.torso.position.y = 1.0;

    // Arms: 3x12x4 => 0.3 x 1.2 x 0.4 (Alex arms are slightly thinner: 3px)
    const armGeo = new THREE.BoxGeometry(0.3, 1.2, 0.4);
    
    // Right Arm Pivot (Shoulder is at top)
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.55, 1.6, 0); // Offset from center of torso to right shoulder
    const rightArm = new THREE.Mesh(armGeo, skinMaterial);
    rightArm.position.y = -0.6; // shift down by half height so pivot is at top
    this.rightArmPivot.add(rightArm);

    // Left Arm Pivot
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.55, 1.6, 0);
    const leftArm = new THREE.Mesh(armGeo, skinMaterial);
    leftArm.position.y = -0.6;
    this.leftArmPivot.add(leftArm);

    // Legs: 4x12x4 => 0.4 x 1.2 x 0.4
    const legGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);

    // Right Leg Pivot (Hip)
    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.2, 0.4, 0);
    const rightLeg = new THREE.Mesh(legGeo, skinMaterial);
    rightLeg.position.y = -0.6;
    
    // Add simple purple shoes at the bottom of the leg
    const shoeGeo = new THREE.BoxGeometry(0.4, 0.2, 0.4);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x800080 }); // Purple shoe
    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.y = -0.5; // Offset within the leg mesh
    rightLeg.add(rightShoe);
    
    this.rightLegPivot.add(rightLeg);

    // Left Leg Pivot
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.2, 0.4, 0);
    const leftLeg = new THREE.Mesh(legGeo, skinMaterial);
    leftLeg.position.y = -0.6;
    
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.y = -0.5;
    leftLeg.add(leftShoe);

    this.leftLegPivot.add(leftLeg);

    // Add everything to main group
    this.group.add(this.torso, this.head, this.rightArmPivot, this.leftArmPivot, this.rightLegPivot, this.leftLegPivot);

    // Give hard blocky shadows
    this.group.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Slight shift so feet touch ground (Y=0)
    // Legs stretch from Y=0.4 down to -0.8 relative to pivots. 
    this.group.position.y = 0.8;

    this.scene.add(this.group);
    
    // Animation state
    this.isWalking = false;
    this.walkCycle = 0;
  }

  update(time) {
    if (this.isWalking) {
      this.walkCycle += 0.15;
      
      const swing = Math.sin(this.walkCycle) * 0.8; // sharp swing
      
      this.rightArmPivot.rotation.x = -swing;
      this.leftArmPivot.rotation.x = swing;
      
      this.rightLegPivot.rotation.x = swing;
      this.leftLegPivot.rotation.x = -swing;
      
    } else {
      // Ease back to idle
      this.rightArmPivot.rotation.x *= 0.8;
      this.leftArmPivot.rotation.x *= 0.8;
      this.rightLegPivot.rotation.x *= 0.8;
      this.leftLegPivot.rotation.x *= 0.8;
    }
  }

  startWalking() {
    this.isWalking = true;
  }

  stopWalking() {
    this.isWalking = false;
  }

  cutCakeAnimation(gsap) {
    // Fast swing of right arm for a Minecraft style hit
    gsap.to(this.rightArmPivot.rotation, {
      x: -Math.PI / 1.5,
      duration: 0.2,
      yoyo: true,
      repeat: 3, 
      ease: "power1.inOut"
    });
  }
}
