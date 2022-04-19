import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';


import gsap from 'gsap'
import { LayerMaterial, Depth, Displace } from 'lamina/vanilla'

import { ndLaminaStarter } from './shaders/nd-lamina-starter.js'

const deg2rad = (degrees) => degrees * Math.PI / 180

/**
 * Base
 */
const textureLoader = new THREE.TextureLoader()
const gltfloader = new GLTFLoader()
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

/**
 * Sizes
 */
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const logoScale = 8

let uniforms = {
    'u_time': {
        value: 3.5
    }
};

/**
 * Logo
 */
const laminaStarterLayer = new ndLaminaStarter({
    color: '#ff0000',
    alpha: 1.0,
    time: uniforms['u_time'].value,
})

const displaceLayer =  new Displace({
    strength: .0,
    scale: .0,
    opactiy: .15,
    // "perlin' | "simplex" | "cell" | "curl"
    type: "simplex",
    mode: "normal"
 })

const material2 = new LayerMaterial({
  color: '#fff',
  lighting: 'standard',
  side: THREE.DoubleSide,
  transparent: true,
  alpha: 0,
  layers: [
    //   laminaStarterLayer,
      displaceLayer,
  ],

})

const logoGltf = await gltfloader.loadAsync('models/20220311_stonecreekcrew_logo_vertices_lava.glb')
const logo = logoGltf.scene.children[0]
logo.scale.set(logoScale, logoScale, logoScale)
logo.position.set(0, 0, -10)
logo.material = material2
scene.add(logo)


window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/*
 * Light
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
scene.add(ambientLight)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 3000 );
camera.position.z = 2.5;
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Effects
 */
const renderModel = new RenderPass(scene, camera);
const glitchPass = new GlitchPass(10.0,);
glitchPass.enabled = false;
const composer = new EffectComposer( renderer );
composer.addPass(renderModel);
composer.addPass(glitchPass)


glitchPass.uniforms.col_s = { value: 0.0 };

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0


var tl = gsap.timeline();
tl.timeScale(1)

tl.to(logo.rotation, {x: deg2rad(-90), z: deg2rad(-360), duration: 0}, -1);

tl.to(logo.position, {y: 0, z: 0, duration: 1.75}, 0);
tl.to(logo.material, {alpha: 1, duration: 1.75, ease: "power4.in"}, 0);
tl.to(logo.rotation, {x: deg2rad(90), z: deg2rad(360), duration: 1.75}, 0);

tl.to(glitchPass, { enabled: true, duration: 0}, 1.445);
tl.to(glitchPass, { enabled: false, duration: 0}, 1.75);

tl.to(glitchPass, { enabled: true, duration: 1}, 3.5);
tl.to(glitchPass.uniforms.col_s, { value: .5, duration: 0}, 2.5)
// tl.to(displaceLayer, { strength: .2, duration: 1, ease: "elastic"}, 3.35)
tl.to(logo.position, { z: 5, duration: 2}, 3.5);
tl.to(logo.rotation, { z: deg2rad(0), x: deg2rad(360), duration: 2}, 3.5);

tl.to(glitchPass, { enabled: false, duration: 1}, 4);

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls 
    controls.update()

    // logo.rotation.z = Math.PI * elapsedTime * .25

    uniforms['u_time'].value += deltaTime * 0.005
    laminaStarterLayer.time = uniforms['u_time'].value

    // displaceLayer.strength = Math.sin(elapsedTime * .25)

    // Render
    // renderer.render(scene, camera)
    renderer.clear()
    composer.render(0.01)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()