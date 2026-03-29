import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export class Text3D {
  constructor(scene, text) {
    this.scene = scene;
    this.text = text;
    this.group = new THREE.Group();
    // Position the whole group in the center
    this.group.position.set(0, 5, 0);
    this.scene.add(this.group);
    
    // Creating a mock 'sprite.material' interface to ensure we don't break main.js gsap animation 
    // when it tries to fade out textModel.sprite.material.opacity
    this.materials = [];
    this.sprite = {
      material: {
        get opacity() {
          return this._op || 1;
        },
        set opacity(v) {
          this._op = v;
          if (this.onUpdate) this.onUpdate(v);
        }
      }
    };
    
    this.sprite.material.onUpdate = (val) => {
      this.materials.forEach(mat => {
        mat.transparent = true;
        mat.opacity = val;
        mat.needsUpdate = true;
      });
    };

    this.initText();
  }

  initText() {
    const loader = new FontLoader();
    
    // We fetch a standard font provided in ThreeJS examples via unpkg
    loader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json', (font) => {
      const geometry = new TextGeometry(this.text, {
        font: font,
        size: 2,
        height: 0.4,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelOffset: 0,
        bevelSegments: 5
      });
      
      geometry.computeBoundingBox();
      const xOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      
      // Create beautifully glowing pink materials
      const materialFront = new THREE.MeshStandardMaterial({ 
        color: 0xff69b4, 
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0xff1493,
        emissiveIntensity: 0.4
      });
      
      const materialSide = new THREE.MeshStandardMaterial({ 
        color: 0xffd1dc, 
        roughness: 0.6 
      });

      this.materials.push(materialFront, materialSide);

      const textMesh = new THREE.Mesh(geometry, [materialFront, materialSide]);
      textMesh.position.set(xOffset, 0, 0); 
      
      textMesh.castShadow = true;
      
      this.group.add(textMesh);
    });
  }
}
