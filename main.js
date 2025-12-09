import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

// Add stars background
const starsDiv = document.createElement('div');
starsDiv.className = 'stars';
document.body.insertBefore(starsDiv, document.body.firstChild);

// Update existing heading
const headingElement = document.querySelector('#heading h1');
if (headingElement) {
  headingElement.textContent = 'TATOOINE';
}

// Add stars CSS
const style = document.createElement('style');
style.textContent = `
  @font-face {
    font-family: 'Jedi';
    src: url('./STJEDISE.TTF') format('truetype');
  }
  
  body {
    margin: 0;
    padding: 0;
    background: #000 !important;
  }
  
  #heading h1 {
    font-family: 'Jedi', sans-serif;
    font-size: 3rem;
    font-weight: 400;
    letter-spacing: 8px;
    color: #fff;
    text-shadow: 
      0 0 10px rgba(255, 255, 255, 0.8),
      0 0 20px rgba(139, 212, 255, 0.6),
      0 0 30px rgba(139, 212, 255, 0.4);
    text-align: center;
    margin-top: 40px;
  }
  
  .stars {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
    background: #000;
    box-shadow: -45vw -20vh 0px 0px #fff,
      34vw 48vh 1px 1px #fff,
      23vw -35vh 1px 0px #fff,
      -10vw 40vh 1px 1px #fff,
      -25vw -30vh 1px 0px #fff,
      15vw 10vh 0px 0px #fff,
      -40vw 45vh 1px 1px #fff,
      50vw -10vh 1px 0px #fff,
      -5vw -25vh 0px 0px #fff,
      30vw 20vh 1px 1px #fff,
      -15vw 35vh 1px 0px #fff,
      40vw -40vh 0px 0px #fff,
      -50vw 15vh 1px 1px #fff,
      10vw -5vh 1px 0px #fff,
      -30vw -15vh 0px 0px #fff,
      5vw 30vh 1px 1px #fff,
      -20vw -45vh 1px 0px #fff,
      45vw 5vh 0px 0px #fff,
      -35vw 25vh 1px 1px #fff,
      25vw -50vh 1px 0px #fff,
      -12vw -8vh 0px 0px #fff,
      38vw 38vh 1px 1px #fff,
      -48vw -28vh 1px 0px #fff,
      18vw 12vh 0px 0px #fff,
      -22vw 42vh 1px 1px #fff,
      42vw -18vh 1px 0px #fff,
      -8vw -12vh 0px 0px #fff,
      28vw -32vh 0px 1px #fff,
      -38vw 18vh 1px 0px #fff,
      -2vw -42vh 0px 1px #fff,
      32vw 8vh 1px 0px #fff,
      -18vw -22vh 0px 1px #fff,
      48vw 32vh 1px 0px #fff,
      -28vw 2vh 0px 1px #fff,
      8vw -18vh 1px 0px #fff,
      -42vw 38vh 0px 1px #fff,
      12vw 28vh 1px 0px #fff,
      -32vw -8vh 0px 1px #fff,
      22vw 48vh 1px 0px #fff,
      -6vw -38vh 0px 1px #fff,
      36vw -2vh 1px 0px #fff,
      -26vw 22vh 0px 1px #fff,
      46vw -28vh 1px 0px #fff,
      -16vw 8vh 0px 1px #fff,
      26vw -48vh 1px 0px #fff,
      -46vw -6vh 0px 1px #fff,
      6vw 36vh 1px 0px #fff,
      -36vw -16vh 0px 1px #fff,
      16vw 26vh 1px 0px #fff,
      -4vw -46vh 0px 1px #fff;
  }
  
  canvas {
    position: relative;
    z-index: 1;
  }
`;
document.head.appendChild(style);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(4, 5, 11);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();
controls.enabled = false;
camera.lookAt(0, 1, 0);

const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  side: THREE.DoubleSide
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.receiveShadow = false;
groundMesh.visible = false;
scene.add(groundMesh);

const spotLight = new THREE.SpotLight(0xffffff, 3000, 100, 0.22, 1);
spotLight.position.set(0, 25, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);
spotLight.visible = false;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

let model = null;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const loader = new GLTFLoader().setPath('public/tatooine/');
loader.load('scene.gltf', (gltf) => {
  console.log('loading model');
  model = gltf.scene;

  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  model.position.set(0, 1.05, 0);
  model.scale.set(1.8, 1.8, 1.8);
  scene.add(model);

  document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
  console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
}, (error) => {
  console.error(error);
});

window.addEventListener('click', (event) => {
  if (!model) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(model, true);

  if (intersects.length > 0) {
    window.location.href = 'lightspeed.html';
  }
});

window.addEventListener('mousemove', (event) => {
  if (!model) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(model, true);

  document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  if (model) {
    model.rotation.y += 0.01;
  }
  renderer.render(scene, camera);
}

animate();