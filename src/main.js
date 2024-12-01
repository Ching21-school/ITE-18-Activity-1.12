// Import Three.js and lil-gui
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

// Scene Setup
const scene = new THREE.Scene();

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Texture Loader with onLoad callback
const textureLoader = new THREE.TextureLoader();

// Earth Texture
const earthTexture = textureLoader.load(
    '/earth_texture.jpg',  // Path to earth texture
    () => {
        console.log('Earth texture loaded!');
        earth.material.needsUpdate = true; // Update the material once the texture is loaded
    },
    undefined,
    (error) => {
        console.error('Error loading earth texture:', error); // Log if there is an error
    }
);

// Moon Texture
const moonTexture = textureLoader.load(
    '/moon_texture.jpg',  // Path to moon texture
    () => {
        console.log('Moon texture loaded!');
        moon.material.needsUpdate = true; // Update the material once the texture is loaded
    },
    undefined,
    (error) => {
        console.error('Error loading moon texture:', error); // Log if there is an error
    }
);

// Earth Geometry and Material
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Moon Geometry and Material
const moonGeometry = new THREE.SphereGeometry(0.3, 64, 64);
const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(2, 0, 0); // Moon's position relative to Earth
scene.add(moon);

// Lights
const ambientLight = new THREE.AmbientLight(0x404040, 0.7); // Soft ambient light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100); // Add a point light to illuminate Earth and Moon
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Add a directional light for more depth
directionalLight.position.set(-5, 5, 5).normalize();
scene.add(directionalLight);

// Starfield (Background Stars)
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1
});

// Create an array for star positions
const starCount = 1000;
const positions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 50; // Random X position
    const y = (Math.random() - 0.5) * 50; // Random Y position
    const z = (Math.random() - 0.5) * 50; // Random Z position
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Create the star points
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Debug Panel (lil-gui)
const gui = new dat.GUI();
const parameters = {
    earthRotationSpeed: 0.01,
    moonRotationSpeed: 0.02,
};
gui.add(parameters, 'earthRotationSpeed').min(0).max(0.1).step(0.01).name('Earth Speed');
gui.add(parameters, 'moonRotationSpeed').min(0).max(0.1).step(0.01).name('Moon Speed');

// Handle Resizing
window.addEventListener('resize', () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Fullscreen Toggle
window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        renderer.domElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

// Animation Loop
const clock = new THREE.Clock();
function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Earth Rotation
    earth.rotation.y += parameters.earthRotationSpeed;

    // Moon Rotation (around its axis)
    moon.rotation.y += parameters.moonRotationSpeed;

    // Moon Orbit (around Earth)
    moon.position.x = Math.cos(elapsedTime) * 2;
    moon.position.z = Math.sin(elapsedTime) * 2;

    // Make the stars rotate for a dynamic effect
    stars.rotation.y += 0.0001;

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();
