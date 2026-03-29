import * as THREE from 'three';
import miauUrl from '../assets/stage_gif/miau.mp4?url';

export class Stage {
  constructor(scene, position) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.copy(position);

    // 1. Stage Platform
    const platformGeo = new THREE.BoxGeometry(24, 1.5, 12);
    const platformMat = new THREE.MeshStandardMaterial({ 
      color: 0x222222, 
      roughness: 0.6, 
      flatShading: true 
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 0.75;
    
    // Load the GIF as a high-performance VideoTexture (via our FFmpeg conversion)
    const video = document.createElement('video');
    video.src = miauUrl;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true; // Auto-play policies require muted videos
    video.playsInline = true;
    video.play();
    
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. Huge LED/Backdrop screen displaying the GIF/Video
    const backGeo = new THREE.BoxGeometry(24, 10, 1);
    const backMat = new THREE.MeshStandardMaterial({ 
      map: videoTexture,
      emissive: 0xffffff, // full white emissive base
      emissiveMap: videoTexture, // the video acts as the glowing emission
      emissiveIntensity: 0.8, // glow brightly in the dark
      roughness: 0.9, 
      flatShading: true 
    });
    const backWall = new THREE.Mesh(backGeo, backMat);
    backWall.position.set(0, 6.5, -5.5);

    // 3. Huge Speaker Towers L & R
    const speakerGeo = new THREE.BoxGeometry(3, 8, 3);
    const speakerMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1.0 });
    
    const speakerL = new THREE.Mesh(speakerGeo, speakerMat);
    speakerL.position.set(-10, 5.5, -3);
    const speakerR = new THREE.Mesh(speakerGeo, speakerMat);
    speakerR.position.set(10, 5.5, -3);

    // Add speaker cones
    const coneGeo = new THREE.CylinderGeometry(1, 1, 0.2, 16);
    const coneMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    // Left cones
    for(let i=0; i<3; i++) {
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.rotation.x = Math.PI / 2;
        cone.position.set(-10, 3 + i*2.5, -1.4);
        this.group.add(cone);
    }
    // Right cones
    for(let i=0; i<3; i++) {
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.rotation.x = Math.PI / 2;
        cone.position.set(10, 3 + i*2.5, -1.4);
        this.group.add(cone);
    }

    // 4. Overhanging Light Rig (Trusses)
    const trussGeo = new THREE.BoxGeometry(24, 0.5, 0.5);
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8 });
    const truss = new THREE.Mesh(trussGeo, trussMat);
    truss.position.set(0, 11.5, -2);
    
    // 5. Functional SpotLights aimed at the stage
    // Red Light
    const spot1 = new THREE.SpotLight(0xff0055, 300);
    spot1.position.set(-8, 11, -2);
    spot1.target.position.set(-4, 1.5, 0); 
    spot1.angle = Math.PI / 5;
    spot1.penumbra = 0.5;
    spot1.castShadow = true;
    
    const spot1Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshBasicMaterial({color: 0xff0055}));
    spot1Mesh.position.set(-8, 11, -2);
    
    // Blue Light
    const spot2 = new THREE.SpotLight(0x0055ff, 300);
    spot2.position.set(8, 11, -2);
    spot2.target.position.set(4, 1.5, 0);
    spot2.angle = Math.PI / 5;
    spot2.penumbra = 0.5;
    spot2.castShadow = true;

    const spot2Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshBasicMaterial({color: 0x0055ff}));
    spot2Mesh.position.set(8, 11, -2);
    
    // Green Light
    const spot3 = new THREE.SpotLight(0x00ff55, 300);
    spot3.position.set(0, 11, -2);
    spot3.target.position.set(0, 1.5, 2);
    spot3.angle = Math.PI / 5;
    spot3.penumbra = 0.5;
    spot3.castShadow = true;

    const spot3Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshBasicMaterial({color: 0x00ff55}));
    spot3Mesh.position.set(0, 11, -2);

    this.group.add(platform, backWall, speakerL, speakerR, truss, spot1, spot1.target, spot1Mesh, spot2, spot2.target, spot2Mesh, spot3, spot3.target, spot3Mesh);

    this.group.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Make it face the center of the world (0,0,0) so it's pointing to the cake
    this.group.lookAt(0, position.y, 0);

    this.scene.add(this.group);
  }
}
