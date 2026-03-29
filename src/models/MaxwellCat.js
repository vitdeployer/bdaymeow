import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import maxwellUrl from '../assets/low_polymodel/maxwell_cat/maxwell_the_cat_dingus.glb?url';

export class MaxwellCat {
  constructor(scene, position, listener) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.copy(position);
    this.group.lookAt(0, position.y, 0); 

    const loader = new GLTFLoader();
    
    loader.load(maxwellUrl, (gltf) => {
      this.model = gltf.scene;

      this.model.traverse((child) => {
        if (child.isMesh) {
          // Deliberately NOT overriding materials here because Maxwell usually comes with a specific texture map!
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Auto-normalize scale
      const box = new THREE.Box3().setFromObject(this.model);
      const size = new THREE.Vector3();
      box.getSize(size);
      
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
      
      this.model.position.x = -center.x;
      this.model.position.z = -center.z;
      
      box.setFromObject(this.model);
      this.animWrapper = new THREE.Group();
      this.model.position.y -= box.min.y;
      this.animWrapper.add(this.model);
      
      this.group.add(this.animWrapper);
    }, undefined, (error) => {
      console.error('An error happened loading maxwell cat:', error);
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
  }

  update(time) {
    if (!this.animWrapper) return; // Wait until model loads

    if (this.isCelebrating) {
      const t = (time * 8 + this.animTimeOffset) * 0.75;
      
      // "Rotate slowly with respect to floor and slowly do up and down"
      // Slowly bob up and down
      this.animWrapper.position.y = Math.abs(Math.sin(t * 0.5)) * 0.8; 
      // Slowly spin on Y axis (floor)
      this.animWrapper.rotation.y -= 0.02; // Negative to spin clockwise
    } else {
      // Ease back
      this.animWrapper.position.y *= 0.8;
      // We do not zero out rotation.y, letting him stay pointing where he stopped
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
