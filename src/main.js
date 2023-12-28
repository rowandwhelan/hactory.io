import './main.css'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import { PointerLockControlsCannon } from './PointerLockControlsCannon.js'
import { VoxelLandscape } from './VoxelLandscape.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Stats from 'three/addons/libs/stats.module.js'

import stone from '../public/assets/HactoryStone.png'

import negx from '../public/assets/skybox/negx.jpg'
import negy from '../public/assets/skybox/negy.jpg'
import negz from '../public/assets/skybox/negz.jpg'
import posx from '../public/assets/skybox/posx.jpg'
import posy from '../public/assets/skybox/posy.jpg'
import posz from '../public/assets/skybox/posz.jpg'

/**  _______  ________ ________ __     __ ______
 *  //======\ ||====== ===||=== ||     || ||=====\\
 *  ||______  ||______    ||    ||     || ||_____||  
 *  \\=====\\ ||======    ||    ||     || ||=====-'
 *   ______|| ||______    ||    ||_____|| ||
 *  \======// ||======    ||    \\=====// ||
*/

/**
 * Base
 */
//Canvas
const canvas = document.querySelector('.webgl')

//Scene
const scene = new THREE.Scene()

//Camera
let camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 5000)
//position of camera above ground relative to the player body
camera.position.set(0, 6, 0)

/**
 * Textures
 */
//Textures
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

scene.background = cubeTextureLoader.load([
  posx,
  negx,
  posy,
  negy,
  posz,
  negz
])

/**
 * GUI
 */
//FPS Indicator
const container = document.getElementById('container')
const stats = new Stats()
stats.domElement.style.position = 'absolute'
stats.domElement.style.top = '0px'
container.appendChild(stats.domElement)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Physics
 */
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -20, 0)
})

const solver = new CANNON.GSSolver()
solver.iterations = 7
solver.tolerance = 0.1
world.solver = new CANNON.SplitSolver(solver)
// Contact stiffness - use to make softer/harder contacts
world.defaultContactMaterial.contactEquationStiffness = 1e9
// Stabilization time in number of timesteps
world.defaultContactMaterial.contactEquationRelaxation = 4
world.broadphase = new CANNON.NaiveBroadphase();
world.broadphase.useBoundingBoxes = true;

const mainMaterial = new CANNON.Material()
const mainContactMat = new CANNON.ContactMaterial(mainMaterial, mainMaterial, {
  friction: 0.00,
  restitution: 0.3,
})
world.addContactMaterial(mainContactMat)

// Create the user collision
const playerShape = new CANNON.Box(new CANNON.Vec3(0.2, 2, 0.2))
const playerBody = new CANNON.Body({ mass: 70, shape: playerShape, linearDamping: 0.25, material: mainMaterial, type: CANNON.Body.DYNAMIC })
playerBody.position.set(10, 100, 10)
world.addBody(playerBody)

const controls = new PointerLockControlsCannon(camera, playerBody)
//How far the player can reach
let maxReach = 30
scene.add(controls.getObject())
controls.enabled = true

/**
 * Lighting
 */
//Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

//Directional Light
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 50
const dLightSize = 200
directionalLight.shadow.camera.left = - dLightSize
directionalLight.shadow.camera.top = dLightSize
directionalLight.shadow.camera.right = dLightSize
directionalLight.shadow.camera.bottom = - dLightSize
directionalLight.position.set(-5, 15, 10)
scene.add(directionalLight)

//Fog or FogExp2 [fog grows exponetially] (color, near limit, far limit)
scene.fog = new THREE.Fog(0xFFFFFF, 400, 600)

/**
 * Event Listeners
 */
document.addEventListener('mousemove', onMouseMove)
document.addEventListener('mousedown', onMouseDown)
document.addEventListener('keydown', onkeydown)
document.addEventListener('keyup', onkeyup)

window.addEventListener('resize', () => {

  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.render(scene, camera)
})

//Horizontal camera movment (verticle movment in seperate file)
document.addEventListener('mousemove', (event) => {
  camera.rotation.x -= event.movementY * 0.00225
  camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x))
})

window.addEventListener('click', (event) => {
  if (!controls.enabled) {
    return
  }
  document.body.requestPointerLock();
})

/**
 * Objects and Voxels
 */
//Objects
const objects = []

//Dirt block
const map = new THREE.TextureLoader().load(stone)

//Placeholder block
const placeholderGeo = new THREE.BoxGeometry(5, 5, 5)
let placeholderMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })
let placeholderMesh = new THREE.Mesh(placeholderGeo, placeholderMaterial)
scene.add(placeholderMesh)

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

/**
 * World Generation
 */
// Number of voxels
const nx = 80
const ny = 8
const nz = 80

// Scale of voxels
const sx = 5
const sy = 5
const sz = 5

// Generic voxel material
let material = new THREE.MeshLambertMaterial({ color: 0xfeb74c, map: map })

let voxels = new VoxelLandscape(world, nx, ny, nz, sx, sy, sz)

noise.seed(Math.random());

for (let i = 0; i < nx; i++) {
  for (let j = 0; j < ny; j++) {
    for (let k = 0; k < nz; k++) {
      let filled = true

      // Map generation logic
      if (noise.simplex3(i / 100, k / 100, j / 100) <= -0.2) {
        filled = false
      }
      /* //alternate map generation
      if (Math.sin(i * 0.1) * Math.sin(k * 0.1) < (j / ny) * 2 - 1) {
        filled = false
      }
      */
      voxels.setFilled(i, j, k, filled)
    }
  }
}

voxels.update()

// Voxel landscape meshes
for (let i = 0; i < voxels.boxes.length; i++) {
  const box = voxels.boxes[i]
  const voxelGeometry = new THREE.BoxGeometry(voxels.sx * box.nx, voxels.sy * box.ny, voxels.sz * box.nz)
  const voxelMesh = new THREE.Mesh(voxelGeometry, material)
  voxelMesh.castShadow = true
  voxelMesh.receiveShadow = true
  objects.push(voxelMesh)
  scene.add(voxelMesh)
}

/**
 * Voxel Interaction
 */
function onMouseMove(event) {

  mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1)
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(objects, false)

  if (intersects.length > 0) {

    const intersect = intersects[0]
    placeholderMesh.visible = false

    if (intersect.distance <= maxReach) {
      placeholderMesh.visible = true
      if (intersect.distance > 10){
      placeholderMaterial.opacity = (maxReach * 1.5 - intersect.distance) / (maxReach * 1.5 - 0)
      } else if (intersect.distance <= 10){
        placeholderMaterial.opacity = intersect.distance*1.5 / maxReach
      }

      //Moves placeholder mesh
      placeholderMesh.position.copy(intersect.point).add(intersect.face.normal)
      placeholderMesh.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5)

      renderer.render(scene, camera)
    }
  }
}

function onMouseDown(event) {

  mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1)

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(objects, false)

  if (intersects.length > 0) {

    const intersect = intersects[0]

    // delete cube

      if (event.button == 2) {

        //scene.remove(intersect.object)

        //objects.splice(objects.indexOf(intersect.object), 1)

        console.log(voxels.isFilled(Math.floor(intersect.point.x/5), Math.floor(intersect.point.y/5), Math.floor(intersect.point.z/5)))
        voxels.setFilled(Math.floor(intersect.point.x/5), Math.floor(intersect.point.y/5), Math.floor(intersect.point.z/5), false)

        // create cube

      } else {

        if ((intersect.distance <= maxReach) && !(((Math.floor(intersect.point.y / 15) == Math.floor(intersect.point.y / 15)) && intersect.distance <= 10))) {
        const voxel = new THREE.Mesh(cubeGeo, cubeMat)

        const voxelBody = new CANNON.Body({
          type: CANNON.Body.STATIC,
          shape: new CANNON.Box(new CANNON.Vec3(5, 5, 5)),
          material: mainMaterial
        })

        voxel.position.copy(intersect.point).add(intersect.face.normal)
        voxel.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5)
        scene.add(voxel)
        objects.push(voxel)

        //Voxel Mesh Merge
        voxelBody.position.copy(voxel.position)
        voxelBody.quaternion.copy(voxel.quaternion)

        world.addBody(voxelBody)
      }

      renderer.render(scene, camera)
    }
  }
}

/**
 * Animation Loop
 */
//Current Time
let time = Date.now()

//Physics Timestep
const timeStep = 1 / 60

//animation
const tick = () => {
  window.requestAnimationFrame(tick)
  //current time
  const currentTime = Date.now()
  const deltaTime = currentTime - time
  time = currentTime
  //delta time is miliseconds per frame

  //Voxel mesh merging
  for (let i = 0; i < voxels.boxes.length; i++) {
    objects[i].position.copy(voxels.boxes[i].position)
    objects[i].quaternion.copy(voxels.boxes[i].quaternion)
  }

  //Physics (1 for the 3rd parameter makes it faster but lower quality)
  world.step(timeStep, deltaTime, 1)

  //Controls
  controls.update(deltaTime)
  renderer.render(scene, camera)
  stats.update()
}
tick()