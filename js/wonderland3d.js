// TOYXIMA Toys - Interactive 3D Miniature Toy World Diorama
import { sounds } from './sound.js';

export class Wonderland3D {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animationFrameId = null;
    this.interactiveObjects = [];
    this.raycaster = null;
    this.mouse = null;
    this.carGroup = null;
    this.teddyGroup = null;
    this.blocksGroup = null;
    this.clouds = [];
    this.stars = [];
    this.smokeParticles = [];
    this.isAutoRotating = true;
    this.isCarBoosting = false;
    this.clock = null;

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded yet, falling back to animated diorama.');
      this.renderFallback();
      return;
    }

    try {
      this.clock = new THREE.Clock();
      const width = this.container.clientWidth || 600;
      const height = this.container.clientHeight || 520;

      // 1. Scene
      this.scene = new THREE.Scene();
      // Soft atmospheric fog matching the warm cream background
      this.scene.fog = new THREE.FogExp2(0xFFFBF2, 0.025);

      // 2. Camera
      this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
      this.camera.position.set(14, 13, 16);
      this.camera.lookAt(0, 1.8, 0);

      // 3. Renderer
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.outputEncoding = THREE.sRGBEncoding;

      this.container.innerHTML = '';
      this.container.appendChild(this.renderer.domElement);
      this.renderer.domElement.style.outline = 'none';
      this.renderer.domElement.style.cursor = 'grab';

      // 4. Lights
      this.setupLights();

      // 5. Build Toy World Elements
      this.buildIsland();
      this.buildCastleBlocks();
      this.buildToyCar();
      this.buildTeddyBear();
      this.buildToyTrainTrack();
      this.buildCloudsAndStars();

      // 6. Interaction Setup
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      this.setupEventListeners();

      // 7. Animation Loop
      this.animate();
    } catch (err) {
      console.error('Three.js initialization failed:', err);
      this.renderFallback();
    }
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 0.85);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.1);
    sunLight.position.set(18, 25, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Warm soft fill light from opposite corner
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.4);
    fillLight.position.set(-15, 10, -10);
    this.scene.add(fillLight);

    // Playful warm rim light from below/front
    const rimLight = new THREE.PointLight(0xff9800, 0.6, 25);
    rimLight.position.set(0, 4, 12);
    this.scene.add(rimLight);
  }

  // 1. Floating Island Base
  buildIsland() {
    const islandGroup = new THREE.Group();

    // Floating disc base (Warm minty meadow)
    const baseGeo = new THREE.CylinderGeometry(8.5, 7.5, 1.4, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x86efac, // soft pastel mint green meadow
      roughness: 0.6,
      metalness: 0.05
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.7;
    base.receiveShadow = true;
    islandGroup.add(base);

    // Wooden rim around the island
    const rimGeo = new THREE.CylinderGeometry(8.7, 8.7, 0.35, 48);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xdeb887, // natural birch / beechwood
      roughness: 0.4
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = -0.05;
    rim.receiveShadow = true;
    islandGroup.add(rim);

    // Playful checkered toy picnic mat
    const matGeo = new THREE.BoxGeometry(4.2, 0.06, 4.2);
    const matMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5, // warm peach
      roughness: 0.7
    });
    const mat = new THREE.Mesh(matGeo, matMat);
    mat.position.set(3, 0.03, 2.5);
    mat.rotation.y = 0.2;
    mat.receiveShadow = true;
    islandGroup.add(mat);

    // Mini decorative wooden fir trees
    const treeCoords = [
      { x: -5.5, z: -3.5, s: 1.2 },
      { x: -6.2, z: -1.2, s: 0.9 },
      { x: 5.5, z: -4.0, s: 1.1 },
      { x: -2.0, z: -6.2, s: 1.0 }
    ];

    treeCoords.forEach(t => {
      const treeGroup = new THREE.Group();
      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.8, 12);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0xb45309 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.4;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Conical foliage layers
      const colors = [0x34d399, 0x10b981, 0x059669];
      for (let i = 0; i < 3; i++) {
        const coneGeo = new THREE.ConeGeometry(0.95 - (i * 0.2), 0.9, 16);
        const coneMat = new THREE.MeshStandardMaterial({
          color: colors[i],
          roughness: 0.6
        });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.y = 0.9 + (i * 0.55);
        cone.castShadow = true;
        cone.receiveShadow = true;
        treeGroup.add(cone);
      }
      treeGroup.position.set(t.x, 0, t.z);
      treeGroup.scale.set(t.s, t.s, t.s);
      islandGroup.add(treeGroup);
    });

    this.scene.add(islandGroup);
  }

  // 2. Toy Building Blocks Castle
  buildCastleBlocks() {
    this.blocksGroup = new THREE.Group();
    this.blocksGroup.name = "CastleBlocks";

    const blockMats = {
      yellow: new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.35 }),
      orange: new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.35 }),
      blue: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.35 }),
      lavender: new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.35 }),
      rose: new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.35 }),
      wood: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 })
    };

    // Base pillar blocks
    const colGeo = new THREE.CylinderGeometry(0.45, 0.45, 2.0, 20);
    const colLeft = new THREE.Mesh(colGeo, blockMats.blue);
    colLeft.position.set(-2.2, 1.0, -1.8);
    colLeft.castShadow = true;
    this.blocksGroup.add(colLeft);

    const colRight = new THREE.Mesh(colGeo, blockMats.blue);
    colRight.position.set(-0.6, 1.0, -1.8);
    colRight.castShadow = true;
    this.blocksGroup.add(colRight);

    // Arch bridge across pillars
    const archGeo = new THREE.BoxGeometry(2.4, 0.5, 0.9);
    const arch = new THREE.Mesh(archGeo, blockMats.yellow);
    arch.position.set(-1.4, 2.25, -1.8);
    arch.castShadow = true;
    this.blocksGroup.add(arch);

    // Tower blocks on top
    const cubeGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const cube1 = new THREE.Mesh(cubeGeo, blockMats.orange);
    cube1.position.set(-1.8, 2.95, -1.8);
    cube1.castShadow = true;
    this.blocksGroup.add(cube1);

    const cube2 = new THREE.Mesh(cubeGeo, blockMats.lavender);
    cube2.position.set(-1.0, 2.95, -1.8);
    cube2.castShadow = true;
    this.blocksGroup.add(cube2);

    // Pointy roof cones
    const roofGeo = new THREE.ConeGeometry(0.65, 1.2, 16);
    const roofLeft = new THREE.Mesh(roofGeo, blockMats.rose);
    roofLeft.position.set(-1.8, 4.0, -1.8);
    roofLeft.castShadow = true;
    this.blocksGroup.add(roofLeft);

    const roofRight = new THREE.Mesh(roofGeo, blockMats.wood);
    roofRight.position.set(-1.0, 4.0, -1.8);
    roofRight.castShadow = true;
    this.blocksGroup.add(roofRight);

    // Spinning gold star on castle spire
    const starGeo = new THREE.OctahedronGeometry(0.35);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 0.35,
      metalness: 0.7,
      roughness: 0.2
    });
    this.castleStar = new THREE.Mesh(starGeo, starMat);
    this.castleStar.position.set(-1.4, 4.8, -1.8);
    this.blocksGroup.add(this.castleStar);

    // Additional side blocks
    const sideBlock1 = new THREE.Mesh(cubeGeo, blockMats.yellow);
    sideBlock1.position.set(-3.2, 0.45, -1.6);
    sideBlock1.rotation.y = 0.2;
    sideBlock1.castShadow = true;
    this.blocksGroup.add(sideBlock1);

    const sidePrismGeo = new THREE.ConeGeometry(0.6, 0.8, 4);
    const sidePrism = new THREE.Mesh(sidePrismGeo, blockMats.orange);
    sidePrism.position.set(-3.2, 1.3, -1.6);
    sidePrism.rotation.y = Math.PI / 4;
    sidePrism.castShadow = true;
    this.blocksGroup.add(sidePrism);

    this.scene.add(this.blocksGroup);
    this.interactiveObjects.push(this.blocksGroup);
  }

  // 3. Stylized Wooden Toy Car
  buildToyCar() {
    this.carGroup = new THREE.Group();
    this.carGroup.name = "ToyCar";

    // Car Body (Aerodynamic retro roadster)
    const bodyGeo = new THREE.BoxGeometry(2.2, 0.65, 1.1);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // energetic playful orange
      roughness: 0.3,
      metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.55;
    body.castShadow = true;
    this.carGroup.add(body);

    // Cockpit cabin
    const cabinGeo = new THREE.CylinderGeometry(0.42, 0.55, 0.7, 16);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // sky blue windscreen
      roughness: 0.2,
      metalness: 0.2
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(-0.2, 1.0, 0);
    cabin.castShadow = true;
    this.carGroup.add(cabin);

    // Driver's wooden peg doll head
    const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.4 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(-0.2, 1.45, 0);
    this.carGroup.add(head);

    // Racing number roundel
    const roundelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.02, 16);
    const roundelMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const roundel = new THREE.Mesh(roundelGeo, roundelMat);
    roundel.rotation.x = Math.PI / 2;
    roundel.position.set(0.4, 0.55, 0.56);
    this.carGroup.add(roundel);

    // 4 Wooden wheels with rubber tires
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 20);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 });
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });

    this.carWheels = [];
    const wheelPositions = [
      { x: 0.7, z: 0.65 },
      { x: 0.7, z: -0.65 },
      { x: -0.7, z: 0.65 },
      { x: -0.7, z: -0.65 }
    ];

    wheelPositions.forEach(pos => {
      const wGroup = new THREE.Group();
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.castShadow = true;
      wGroup.add(wheel);

      // Yellow hubcap
      const hubGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.24, 16);
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.rotation.x = Math.PI / 2;
      wGroup.add(hub);

      wGroup.position.set(pos.x, 0.34, pos.z);
      this.carGroup.add(wGroup);
      this.carWheels.push(wGroup);
    });

    // Headlights
    const lightGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfef08a,
      emissiveIntensity: 0.8
    });
    const leftLight = new THREE.Mesh(lightGeo, lightMat);
    leftLight.position.set(1.1, 0.55, 0.32);
    const rightLight = new THREE.Mesh(lightGeo, lightMat);
    rightLight.position.set(1.1, 0.55, -0.32);
    this.carGroup.add(leftLight);
    this.carGroup.add(rightLight);

    // Position car on circuit
    this.carGroup.position.set(0, 0, 4.2);
    this.scene.add(this.carGroup);
    this.interactiveObjects.push(this.carGroup);
  }

  // 4. Cute 3D Teddy Bear Companion
  buildTeddyBear() {
    this.teddyGroup = new THREE.Group();
    this.teddyGroup.name = "TeddyBear";

    const furMat = new THREE.MeshStandardMaterial({
      color: 0xca8a04, // warm honey golden teddy fur
      roughness: 0.85
    });
    const snoutMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a, // light cream muzzle
      roughness: 0.8
    });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917, // black embroidered button eyes
      roughness: 0.3
    });
    const bowMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e, // vibrant red bowtie
      roughness: 0.4
    });

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.75, 24, 24);
    const body = new THREE.Mesh(bodyGeo, furMat);
    body.scale.set(1, 1.15, 0.95);
    body.position.y = 0.9;
    body.castShadow = true;
    this.teddyGroup.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.6, 24, 24);
    const head = new THREE.Mesh(headGeo, furMat);
    head.position.y = 1.95;
    head.castShadow = true;
    this.teddyGroup.add(head);

    // Snout / Muzzle
    const snoutGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.scale.set(1.2, 0.8, 1);
    snout.position.set(0, 1.85, 0.45);
    this.teddyGroup.add(snout);

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const nose = new THREE.Mesh(noseGeo, eyeMat);
    nose.position.set(0, 1.92, 0.65);
    this.teddyGroup.add(nose);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.18, 2.05, 0.48);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(-0.18, 2.05, 0.48);
    this.teddyGroup.add(leftEye);
    this.teddyGroup.add(rightEye);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const leftEar = new THREE.Mesh(earGeo, furMat);
    leftEar.position.set(0.44, 2.4, 0.05);
    const rightEar = new THREE.Mesh(earGeo, furMat);
    rightEar.position.set(-0.44, 2.4, 0.05);
    this.teddyGroup.add(leftEar);
    this.teddyGroup.add(rightEar);

    // Inner ears
    const innerEarGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const leftInnerEar = new THREE.Mesh(innerEarGeo, snoutMat);
    leftInnerEar.position.set(0.44, 2.4, 0.12);
    const rightInnerEar = new THREE.Mesh(innerEarGeo, snoutMat);
    rightInnerEar.position.set(-0.44, 2.4, 0.12);
    this.teddyGroup.add(leftInnerEar);
    this.teddyGroup.add(rightInnerEar);

    // Cute red bow tie
    const bowLeft = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 8), bowMat);
    bowLeft.rotation.z = -Math.PI / 2;
    bowLeft.position.set(0.12, 1.5, 0.55);
    const bowRight = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 8), bowMat);
    bowRight.rotation.z = Math.PI / 2;
    bowRight.position.set(-0.12, 1.5, 0.55);
    const bowKnot = new THREE.Mesh(new THREE.SphereGeometry(0.07), eyeMat);
    bowKnot.position.set(0, 1.5, 0.56);
    this.teddyGroup.add(bowLeft);
    this.teddyGroup.add(bowRight);
    this.teddyGroup.add(bowKnot);

    // Sitting Legs
    const legGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.65, 16);
    const leftLeg = new THREE.Mesh(legGeo, furMat);
    leftLeg.rotation.x = Math.PI / 2.5;
    leftLeg.position.set(0.48, 0.35, 0.45);
    const rightLeg = new THREE.Mesh(legGeo, furMat);
    rightLeg.rotation.x = Math.PI / 2.5;
    rightLeg.position.set(-0.48, 0.35, 0.45);
    this.teddyGroup.add(leftLeg);
    this.teddyGroup.add(rightLeg);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.65, 16);
    const leftArm = new THREE.Mesh(armGeo, furMat);
    leftArm.position.set(0.65, 0.9, 0.2);
    leftArm.rotation.z = -0.3;
    this.teddyGroup.add(leftArm);

    // Right Waving Arm (animated)
    this.teddyWavingArm = new THREE.Mesh(armGeo, furMat);
    this.teddyWavingArm.position.set(-0.65, 1.1, 0.2);
    this.teddyWavingArm.rotation.z = 1.3;
    this.teddyGroup.add(this.teddyWavingArm);

    // Place teddy on picnic mat
    this.teddyGroup.position.set(3.0, 0, 2.5);
    this.teddyGroup.rotation.y = -0.6;
    this.scene.add(this.teddyGroup);
    this.interactiveObjects.push(this.teddyGroup);
  }

  // 5. Miniature Railway Track ring
  buildToyTrainTrack() {
    const trackGroup = new THREE.Group();
    const trackRadius = 5.2;

    // Track Ties (wooden sleepers)
    const tieCount = 36;
    const tieGeo = new THREE.BoxGeometry(0.9, 0.08, 0.22);
    const tieMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6 });

    for (let i = 0; i < tieCount; i++) {
      const angle = (i / tieCount) * Math.PI * 2;
      const x = Math.cos(angle) * trackRadius;
      const z = Math.sin(angle) * trackRadius;
      const tie = new THREE.Mesh(tieGeo, tieMat);
      tie.position.set(x, 0.04, z);
      tie.rotation.y = -angle;
      tie.receiveShadow = true;
      trackGroup.add(tie);
    }

    // Two steel/brass rails
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.7,
      roughness: 0.3
    });

    [-0.26, 0.26].forEach(offset => {
      const railGeo = new THREE.TorusGeometry(trackRadius + offset, 0.04, 8, 64);
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.rotation.x = Math.PI / 2;
      rail.position.y = 0.09;
      trackGroup.add(rail);
    });

    this.scene.add(trackGroup);
  }

  // 6. Floating Fluffy Clouds and Twinkling Stars
  buildCloudsAndStars() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      transparent: true,
      opacity: 0.92
    });

    const createCloud = (x, y, z, scale) => {
      const cloudGroup = new THREE.Group();
      const puffs = [
        { x: 0, y: 0, z: 0, r: 0.9 },
        { x: 0.7, y: -0.15, z: 0, r: 0.65 },
        { x: -0.7, y: -0.15, z: 0, r: 0.7 },
        { x: 0.3, y: 0.35, z: 0, r: 0.6 },
        { x: -0.25, y: -0.2, z: 0.4, r: 0.55 }
      ];

      puffs.forEach(p => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(p.r, 16, 16), cloudMat);
        puff.position.set(p.x, p.y, p.z);
        puff.castShadow = true;
        cloudGroup.add(puff);
      });

      cloudGroup.position.set(x, y, z);
      cloudGroup.scale.set(scale, scale, scale);
      this.scene.add(cloudGroup);
      this.clouds.push({ group: cloudGroup, baseSpeed: 0.003, initialY: y });
    };

    createCloud(-7.5, 7.5, -4, 1.2);
    createCloud(6.5, 8.2, -6, 1.1);
    createCloud(3.5, 6.8, 6.5, 0.85);

    // Floating Golden Magic Stars
    const starGeo = new THREE.OctahedronGeometry(0.28);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xeab308,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.2
    });

    const starCoords = [
      { x: -3.5, y: 5.2, z: 2.5 },
      { x: 4.8, y: 4.5, z: -1.5 },
      { x: -1.2, y: 6.8, z: -3.2 },
      { x: 0.8, y: 5.0, z: 5.2 },
      { x: -5.0, y: 4.0, z: -4.5 }
    ];

    starCoords.forEach((s, idx) => {
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.set(s.x, s.y, s.z);
      this.scene.add(star);
      this.stars.push({ mesh: star, speed: 0.02 + (idx * 0.005), baseY: s.y, phase: idx });
    });
  }

  setupEventListeners() {
    const canvas = this.renderer.domElement;
    let isDragging = false;
    let prevPointerX = 0;
    let dragDistance = 0;
    this.orbitAngle = 0.7;

    canvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevPointerX = e.clientX;
      dragDistance = 0;
      canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('pointerup', () => {
      if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'grab';
      }
    });

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevPointerX;
        dragDistance += Math.abs(deltaX);
        prevPointerX = e.clientX;
        this.orbitAngle -= deltaX * 0.008;
      }
    };

    canvas.addEventListener('pointermove', onPointerMove);

    // Pointer click for interactive 3D toys (only if not dragging)
    canvas.addEventListener('click', (e) => {
      if (dragDistance > 6) return;
      sounds.init();
      const rect = canvas.getBoundingClientRect();
      const clickMouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      this.raycaster.setFromCamera(clickMouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0) {
        let hit = intersects[0].object;
        let parent = hit;
        while (parent && parent.parent && parent.parent !== this.scene) {
          parent = parent.parent;
        }

        if (parent === this.carGroup) {
          this.triggerCarHonk();
        } else if (parent === this.teddyGroup) {
          this.triggerTeddyWave();
        } else if (parent === this.blocksGroup) {
          this.triggerBlocksBounce();
        } else {
          sounds.playPop();
          this.spawnSparkleParticles(intersects[0].point);
        }
      }
    });

    // Resize handling
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // Interactive Actions
  triggerCarHonk() {
    sounds.playHonk();
    this.isCarBoosting = true;
    if (this.carGroup) {
      // Pop car up slightly
      const startY = this.carGroup.position.y;
      this.carGroup.position.y = startY + 0.5;
      setTimeout(() => {
        if (this.carGroup) this.carGroup.position.y = startY;
        this.isCarBoosting = false;
      }, 400);
    }
  }

  triggerTeddyWave() {
    sounds.playSparkle();
    if (this.teddyGroup) {
      const origY = this.teddyGroup.position.y;
      this.teddyGroup.position.y = origY + 0.4;
      setTimeout(() => {
        if (this.teddyGroup) this.teddyGroup.position.y = origY;
      }, 350);
    }
  }

  triggerBlocksBounce() {
    sounds.playPop();
    if (this.blocksGroup) {
      const origScale = this.blocksGroup.scale.y;
      this.blocksGroup.scale.y = 1.18;
      setTimeout(() => {
        if (this.blocksGroup) this.blocksGroup.scale.y = origScale;
      }, 250);
    }
  }

  spawnSparkleParticles(pos) {
    if (typeof confetti === 'function') {
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }

  toggleAutoRotate() {
    this.isAutoRotating = !this.isAutoRotating;
    return this.isAutoRotating;
  }

  // Render Loop
  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const delta = this.clock ? this.clock.getDelta() : 0.016;
    const elapsed = this.clock ? this.clock.getElapsedTime() : Date.now() * 0.001;

    // 1. Car movement on circular track
    if (this.carGroup) {
      const carSpeed = this.isCarBoosting ? 1.6 : 0.6;
      const trackRadius = 5.2;
      const angle = elapsed * carSpeed;
      this.carGroup.position.x = Math.cos(angle) * trackRadius;
      this.carGroup.position.z = Math.sin(angle) * trackRadius;
      // Orient car tangentially along circle
      this.carGroup.rotation.y = -angle + Math.PI / 2;

      // Spin wheels
      if (this.carWheels) {
        this.carWheels.forEach(w => {
          w.rotation.x += carSpeed * 0.15;
        });
      }
    }

    // 2. Teddy bear playful wave animation
    if (this.teddyWavingArm) {
      this.teddyWavingArm.rotation.z = 1.3 + Math.sin(elapsed * 4) * 0.28;
    }

    // 3. Castle star spin
    if (this.castleStar) {
      this.castleStar.rotation.y += 0.025;
      this.castleStar.rotation.x = Math.sin(elapsed * 2) * 0.2;
    }

    // 4. Bobbing floating clouds
    this.clouds.forEach(c => {
      c.group.position.y = c.initialY + Math.sin(elapsed * 1.2 + c.group.position.x) * 0.25;
      c.group.rotation.y += c.baseSpeed;
    });

    // 5. Floating magic stars twinkling
    this.stars.forEach(s => {
      s.mesh.rotation.y += s.speed;
      s.mesh.rotation.z += s.speed * 0.6;
      s.mesh.position.y = s.baseY + Math.sin(elapsed * 2 + s.phase) * 0.35;
    });

    // 6. Camera 360 orbit + smooth parallax tracking with mouse
    if (this.camera && this.mouse) {
      if (this.isAutoRotating) {
        this.orbitAngle = (this.orbitAngle || 0) + 0.0018;
      }
      const radius = 22;
      const angle = (this.orbitAngle || 0) + (this.mouse.x * 0.2);
      const camY = 13 + (this.mouse.y * 1.6);
      const targetCamX = Math.sin(angle) * radius;
      const targetCamZ = Math.cos(angle) * radius;

      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.05;
      this.camera.position.y += (camY - this.camera.position.y) * 0.05;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.05;
      this.camera.lookAt(0, 1.8, 0);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // Fallback high-fidelity SVG/CSS animation if WebGL is disabled
  renderFallback() {
    this.container.innerHTML = `
      <div class="relative w-full h-[450px] flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 border-4 border-amber-200 shadow-xl overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(#fed7aa_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
        <div class="relative z-10 text-center max-w-md">
          <div class="text-7xl mb-4 animate-bounce">🏰🧸🚗</div>
          <h3 class="text-2xl font-black text-amber-950 font-display">Miniature Toy Wonderland</h3>
          <p class="text-amber-800 text-sm mt-2">Featuring handcrafted wooden racers, huggable honey bears, and architectural building blocks.</p>
          <div class="mt-4 flex justify-center gap-3">
            <span class="px-3 py-1 bg-amber-400 text-amber-950 rounded-full font-bold text-xs shadow">🚗 Wooden Speedster</span>
            <span class="px-3 py-1 bg-sky-400 text-sky-950 rounded-full font-bold text-xs shadow">🧸 Honey Bear</span>
            <span class="px-3 py-1 bg-rose-400 text-rose-950 rounded-full font-bold text-xs shadow">🧱 Castle Blocks</span>
          </div>
        </div>
      </div>
    `;
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
