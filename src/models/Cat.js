import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import catUrl from '../assets/low_polymodel/cat_model/standingcat.glb?url';

export class Cat {
  constructor(scene, colorHex, position, listener) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.copy(position);
    // Face the cake at (0, 0, 0) but lock the Y axis so they never tilt upside down
    this.group.lookAt(0, position.y, 0); 

    const loader = new GLTFLoader();
    
    loader.load(catUrl, (gltf) => {
      this.model = gltf.scene; // Inner model wrapper to safely animate without affecting initial lookAt

      // Apply the color to all meshes inside the imported cat
      this.model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ 
            color: colorHex, 
            roughness: 0.8 
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Auto-normalize scale
      const box = new THREE.Box3().setFromObject(this.model);
      const size = new THREE.Vector3();
      box.getSize(size);
      
      // We want the cats to be roughly 1 unit tall
      let scaleFactor = 1;
      if (size.y > 0) {
        scaleFactor = 1.0 / size.y;
      } else {
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) scaleFactor = 1.0 / maxDim;
      }
      
      this.model.scale.set(scaleFactor, scaleFactor, scaleFactor);
      
      box.setFromObject(this.model);
      const center = new THREE.Vector3();
      box.getCenter(center);
      
      // Center the model locally, and put its feet at 0
      this.model.position.x = -center.x;
      this.model.position.z = -center.z;
      
      box.setFromObject(this.model);
      // Wait, let's keep model.position.y clean for animations. We will put the offset in a mesh wrapper.
      // Actually, updating model.position.y in animation OVERWRITES the base offset!
      // So we should wrap it one more time.
      this.animWrapper = new THREE.Group();
      this.model.position.y -= box.min.y;
      this.animWrapper.add(this.model);
      
      this.group.add(this.animWrapper);
    }, undefined, (error) => {
      console.error('An error happened loading standingcat.glb:', error);
    });

    this.scene.add(this.group);
    
    if (listener) {
      this.meowSound = new THREE.PositionalAudio(listener);
      const audioLoader = new THREE.AudioLoader();
      audioLoader.load('meow.mp3', (buffer) => {
        this.meowSound.setBuffer(buffer);
        this.meowSound.setRefDistance(5); 
        this.meowSound.setLoop(true); 
      }, undefined, (err) => {});
      this.group.add(this.meowSound);
    }

    this.isCelebrating = false;
    this.animTimeOffset = Math.random() * 10;
    
    // Only two animations allowed
    const styles = ['jumpTilt', 'jumpSpin']; 
    this.danceStyle = styles[Math.floor(Math.random() * styles.length)];
  }

  update(time) {
    if (!this.animWrapper) return; // Wait until model loads

    if (this.isCelebrating) {
      const t = (time * 8 + this.animTimeOffset) * 0.75;
      
      switch(this.danceStyle) {
        case 'jumpTilt':
          // Jump lightly while tilting left and right
          this.animWrapper.position.y = Math.abs(Math.sin(t)) * 0.6; // Light jump
          this.animWrapper.rotation.z = Math.sin(t) * 0.3; // Light tilt left/right
          break;
        case 'jumpSpin':
          // Jump lightly while rotating not too fast
          this.animWrapper.position.y = Math.abs(Math.sin(t)) * 0.6; // Light jump
          this.animWrapper.rotation.y += 0.04; // Smooth, slower rotation
          break;
      }
    } else {
      // Ease back to standing still
      this.animWrapper.position.y *= 0.8;
      this.animWrapper.rotation.z *= 0.8;
      // We purposefully don't ease rotation.y for jumpSpin so they don't wildly spin backwards.
    }
  }

  celebrate() {
    this.isCelebrating = true;
    if (this.meowSound && !this.meowSound.isPlaying) {
      try {
        setTimeout(() => this.meowSound.play(), Math.random() * 500);
      } catch(e) {}
    }
  }
}
