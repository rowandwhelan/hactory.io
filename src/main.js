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
camera.layers.enable(1)
camera.position.set(0, 0, 0)

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

window.addEventListener('resize', () => {

  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.render(scene, camera)
})


/**
 * Objects and Voxels
 */

//Dirt block
const map = new THREE.TextureLoader().load(stone)

// Generic voxel material
let material = new THREE.MeshLambertMaterial({ color: 0xfeb74c, map: map })


//Chunk data (example)
const chunkData = [
  [[[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]], [[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]]],
  [[[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]], [[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]]],
  [[[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]], [[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]]],
  [[[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]], [[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]]],
  [[[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]], [[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]]],
  [[[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]], [[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]]],
  [[[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]], [[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]]],
  [[[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]], [[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]]],
  [[[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]], [[1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1]]],
];



/**
 * Physics
 */
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.8, 0)
})

const solver = new CANNON.GSSolver()
solver.iterations = 7
solver.tolerance = 0.1
world.solver = new CANNON.SplitSolver(solver)
// Contact stiffness - use to make softer/harder contacts
world.defaultContactMaterial.contactEquationStiffness = 1e9
// Stabilization time in number of timesteps
world.defaultContactMaterial.contactEquationRelaxation = 1
world.broadphase = new CANNON.NaiveBroadphase();
//world.broadphase.useBoundingBoxes = true;


const mainMaterial = new CANNON.Material()
const mainContactMat = new CANNON.ContactMaterial(mainMaterial, mainMaterial, {
  friction: 0.005,
  restitution: 0.025,
})
world.addContactMaterial(mainContactMat)

// Create the user collision
const playerShape = new CANNON.Box(new CANNON.Vec3(1, 5, 1))
const playerBody = new CANNON.Body({ mass: 70, shape: playerShape, linearDamping: 0.25, material: mainMaterial, type: CANNON.Body.DYNAMIC, collisionFilterGroup:2, collisionFilterMask:1 })
playerBody.position.set(10, 100, 10)
world.addBody(playerBody)


/**
 * Controls
 */
const controls = new PointerLockControlsCannon(camera, playerBody)
controls.enabled = true
//How far the player can reach
let maxReach = 50

scene.add(controls.getObject())

window.addEventListener('click', (event) => {
  if (!controls.enabled) {
    //return
  }
  document.body.requestPointerLock();
})





// Voxel landscape meshes

/**
 *chunk loop
 layer loop
 row loop
 block loop


 *
 * 
 */

const voxelGeometry = new THREE.BoxGeometry(5,5,5)

for (let i = 0; i < chunkData.length; i++) { //which chunk
  for (let j = 0; j < chunkData[i].length; j++){ //which layer
    for (let k = 0; k < chunkData[i][j].length; k++){ //which row
      for (let l = 0; l < chunkData[i][j][k].length; l++){ //which block
        const voxelMesh = new THREE.Mesh(voxelGeometry, material)
        voxelMesh.castShadow = true
        voxelMesh.receiveShadow = true
        //x y z
        //chunk(x z)  layer-y    rows -----
        /** Y/Layer 1
         * 
         *      
         *    
         *    topdown
         *        |
         *    x---------
         *        |
         *        |
         *        z
       * 
       * y is vertical 
       * 
       * 
       * ect
       * row 2
       * row 1: 1 2 3 4 5 6 7 8
       * 
       * same chunk layer:
       * 
       * chunk previous 0,0 + 8 x
       * new chunk layer: 0,0 + 8 z
       * 
       * within chunk:
       * new layer: chunk (0,0) + 1 y
       * 
       * within layer:
       * chunk(0,0) + y (however many layers) + 1 z (for every row)
       * 
       * within row: 
       * all above + (itteration) x
       * 
       * (x,y,z)
       */                     
        voxelMesh.position.set((i % 3)*8+k, j, (Math.floor(i/3)*8)+l)

        //console.log(i, j, k, l)
        //console.log(chunkData[i][j][k][l])
        voxelMesh.position.floor().multiplyScalar(5).addScalar(2.5)
        scene.add(voxelMesh)
        const voxelBody = new CANNON.Body({
          type: CANNON.Body.STATIC,
          shape: new CANNON.Box(new CANNON.Vec3(5, 5, 5)),
          material: mainMaterial
        })
        voxelBody.position.copy(voxelMesh.position)
        voxelBody.quaternion.copy(voxelMesh.quaternion)
        world.addBody(voxelBody)
        
      }
    }
  }
}

function remBlock(x,y,z,id) {
  
  scene.remove(scene.getObjectById(id))
  //world.removeBody()
}

function addBlock (x,y,z) {

}

/**
 * Break block:
 * Find coords
 * Intersect and remove body and mesh
 * 
 * 
 * Place block:
 * Find coords
 * Intersect and add body and mesh
 * Intersect and remove body and mesh
 * 
 * 
 * 
 */

/**
 * Voxel Interaction
*/

document.addEventListener('mousemove', onMouseMove)
document.addEventListener('mousedown', onMouseDown)

//Placeholder block
const placeholderGeo = new THREE.BoxGeometry(5, 5, 5)
let placeholderMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0, transparent: true })
let placeholderMesh = new THREE.Mesh(placeholderGeo, placeholderMaterial)
scene.add(placeholderMesh)
placeholderMesh.layers.enable(1)
placeholderMesh.layers.disable(0)

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

function onMouseMove(event) {

  mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1)
  raycaster.setFromCamera(mouse, camera)
  
  raycaster.layers.set( 0 );
  //object.layers.enable( 1 );
  const intersects = raycaster.intersectObjects(scene.children, false)


  if (intersects.length > 0) {

    const intersect = intersects[0]

    if (intersect.distance <= maxReach) {
      
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
  const intersects = raycaster.intersectObjects(scene.children, false)

  if (intersects.length > 0) {

    const intersect = intersects[0]

    let physicsRaycaster = new CANNON.Ray()
    let physicsRaycasterResult = new CANNON.RaycastResult()
    console.log(playerBody)
    world.raycastClosest(playerBody.position, intersect.object.position, {collisionFilterMask:1, collisionFilterGroup:3, skipBackfaces:false, checkCollisionResponse:true}, physicsRaycasterResult)
    console.log(physicsRaycasterResult)
    console.log(world)

    // delete cube

      if (event.button == 2) {
        //console.log(intersect.object)
        remBlock(Math.floor(intersect.object.position.x/5), Math.floor(intersect.object.position.y/5), Math.floor(intersect.object.position.z/5), intersect.object.id)
        //scene.remove(intersect.object)

        //objects.splice(objects.indexOf(intersect.object), 1)

      //create cube

      } else {

        if ((intersect.distance <= maxReach) && !(((Math.floor(intersect.point.y / 15) == Math.floor(intersect.point.y / 15)) && intersect.distance <= 10))) {
          //const voxelGeometry = new THREE.BoxGeometry(voxels.sx, voxels.sy, voxels.sz)
        
          const voxel = new THREE.Mesh(voxelGeometry, material)
      

        const voxelBody = new CANNON.Body({
          type: CANNON.Body.STATIC,
          shape: new CANNON.Box(new CANNON.Vec3(5, 5, 5)),
          material: mainMaterial
        })

        voxel.position.copy(intersect.point).add(intersect.face.normal)

        voxel.position.divideScalar(5).floor()
        console.log(voxel.position.x, voxel.position.y, voxel.position.z, true)
        //voxels.setFilled(voxel.position.x, voxel.position.y, voxel.position.z, true)
        //voxels.update()
        voxel.position.multiplyScalar(5).addScalar(2.5)
        scene.add(voxel)
        //objects.push(voxel)

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
 // for (let i = 0; i < voxels.boxes.length; i++) {
  //  objects[i].position.copy(voxels.boxes[i].position)
  //  objects[i].quaternion.copy(voxels.boxes[i].quaternion)
  //}

  //Physics (1 for the 3rd parameter makes it faster but lower quality)
  world.step(timeStep, deltaTime, 1)

  //Controls
  controls.update(deltaTime)
  renderer.render(scene, camera)
  stats.update()
}
tick()