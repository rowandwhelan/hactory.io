import './main.css'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import { PointerLockControlsCannon } from './PointerLockControlsCannon.js'
import { VoxelLandscape } from './VoxelLandscape.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Stats from 'three/addons/libs/stats.module.js'

import nebula from '../public/assets/nebula.jpg'
import stars from '../public/assets/stars.jpg'
import stone from '../public/assets/HactoryStone.png'

import negx from '../public/assets/skybox/negx.jpg'
import negy from '../public/assets/skybox/negy.jpg'
import negz from '../public/assets/skybox/negz.jpg'
import posx from '../public/assets/skybox/posx.jpg'
import posy from '../public/assets/skybox/posy.jpg'
import posz from '../public/assets/skybox/posz.jpg'
import { normalize } from 'three/src/math/MathUtils.js'

/**
 * Base
 */
//Canvas
const canvas = document.querySelector('.webgl')

//Scene
const scene = new THREE.Scene()

//Camera
let camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 5000)
//position of camera above ground
camera.position.set(0, 6, 0)

//Objects
const objects = []

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

//Asset loader
const assetLoader = new GLTFLoader()

/*
//Import Blender Stuff
const monkeyUrl = new URL('../public/assets/monkey.glb', import.meta.url)
assetLoader.load(monkeyUrl.href, function (gltf) {
    const model = gltf.scene
    scene.add(model)
    model.position.set(0, 0, 0)
}, undefined, function (error) {
    console.error(error)
})
*/

//Multimaterial Box
const box2MultiMaterial = [
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) })
]

//Physics 
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
})

const solver = new CANNON.GSSolver()
solver.iterations = 5
solver.tolerance = 1e-5
world.solver = new CANNON.SplitSolver(solver)

const mainMaterial = new CANNON.Material()
const mainContactMat = new CANNON.ContactMaterial(mainMaterial, mainMaterial, {
  friction: 0.0003,
  restitution: 0,
})
world.addContactMaterial(mainContactMat)

//Fog or FogExp2 [fog grows exponetially] (color, near limit, far limit)
scene.fog = new THREE.Fog(0xFFFFFF, 400, 600)

/**
 * Lights
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

/*
//Directional Light Helpers
const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5)
scene.add(dLightHelper)
dLightHelper.update()
const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
scene.add(dLightShadowHelper)
dLightShadowHelper.update()
*/

//FPS Indicator
const container = document.getElementById('container')
const stats = new Stats()
stats.domElement.style.position = 'absolute'
stats.domElement.style.top = '0px'
container.appendChild(stats.domElement)

const map = new THREE.TextureLoader().load(stone)
const cubeGeo = new THREE.BoxGeometry(5, 5, 5)
const cubeMat = new THREE.MeshLambertMaterial({ color: 0xfeb74c, map: map })

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let isShiftDown = false

document.addEventListener('mousemove', (event) => {
  //camera.rotation.y -= event.movementX * 0.004 
  camera.rotation.x -= event.movementY * 0.00225
  camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x))

})

document.addEventListener('mousemove', onMouseMove)
document.addEventListener('mousedown', onMouseDown)
document.addEventListener('keydown', onkeydown)
document.addEventListener('keyup', onkeyup)

//Placeholder Block
const placeholderGeo = new THREE.BoxGeometry(5, 5, 5)
let placeholderMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })
let placeholderMesh = new THREE.Mesh(placeholderGeo, placeholderMaterial)
scene.add(placeholderMesh)

//move this outside a function, should continuously running
function onMouseMove(event) {

  mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1)

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(objects, false)

  if (intersects.length > 0) {

    const intersect = intersects[0]
    if ((intersect.distance <= maxReach) && (Math.floor(intersect.point.y) != Math.floor(playerBody.position.y))) {
      if (intersect.distance >= maxReach) {
        placeholderMesh.visible = false
      } if (intersect.distance <= maxReach) {
        placeholderMesh.visible = true
      }

      placeholderMaterial.opacity = (maxReach * 1.5 - intersect.distance) / (maxReach * 1.5 - 0)

      //moves placeholder mesh
      placeholderMesh.position.copy(intersect.point).add(intersect.face.normal)
      placeholderMesh.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5)

      renderer.render(scene, camera)

    }
  }
}

function onMouseDown(event) {

  mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1)

  //camera.position.copy(playerBody.position)
  /*
  //Translates mouse position into 3d co-ords
  var vec = new THREE.Vector3()
  var pos = new THREE.Vector3()

  vec.set(( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 )
  
  vec.unproject( camera )
 
  vec.sub( camera.position ).normalize()
  
  var distance = - camera.position.z / vec.z;
  
  pos.copy( camera.position ).add( vec.multiplyScalar( distance ) )

  console.log(camera.position)
  console.log(pos)
  console.log(playerBody.position)
  
  const raycast = new CANNON.Ray(pos, camera.position)

  console.log(raycast)
  const rayOptions = { from: pos, mode: 1, result: raycastResult, to: camera.position }
  var raycastResult = new CANNON.RaycastResult()
  const cannonIntersects = raycast.intersectWorld(world, rayOptions)
  */

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(objects, false)

  if (intersects.length > 0) {

    const intersect = intersects[0]
    //const cannonIntersect = raycastResult[0]
    // delete cube
    if ((intersect.distance <= maxReach) && (Math.floor(intersect.point.y) != Math.floor(playerBody.position.y))) {

      if (event.button == 2) {

        scene.remove(intersect.object)

        objects.splice(objects.indexOf(intersect.object), 1)

        //world.removeBody(cannonIntersect)

        // create cube

      } else {

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
      * Example construction of a voxel world and player.
      

     // three.js variables
     let material
     let floor

     // cannon.js variables

     let lastCallTime = performance.now() / 1000
     let sphereShape
     let sphereBody
     let physicsMaterial
     let voxels

     const balls = []
     const ballMeshes = []
     const boxes = []
     const objects = []

     // Number of voxels
     const nx = 50
     const ny = 8
     const nz = 50

     // Scale of voxels
     const sx = 0.5
     const sy = 0.5
     const sz = 0.5

       // Generic material
       material = new THREE.MeshLambertMaterial({ color: 0xdddddd })

       // Floor
       const floorGeometry = new THREE.PlaneBufferGeometry(300, 300, 50, 50)
       floorGeometry.rotateX(-Math.PI / 2)
       floor = new THREE.Mesh(floorGeometry, material)
       floor.receiveShadow = true
       scene.add(floor)



     function onWindowResize() {
       camera.aspect = window.innerWidth / window.innerHeight
       camera.updateProjectionMatrix()
       renderer.setSize(window.innerWidth, window.innerHeight)
     }

     function initCannon() {
       // Setup world
       world = new CANNON.World()

       // Tweak contact properties.
       // Contact stiffness - use to make softer/harder contacts
       world.defaultContactMaterial.contactEquationStiffness = 1e9

       // Stabilization time in number of timesteps
       world.defaultContactMaterial.contactEquationRelaxation = 4

       const solver = new CANNON.GSSolver()
       solver.iterations = 7
       solver.tolerance = 0.1
       world.solver = new CANNON.SplitSolver(solver)
       // use this to test non-split solver
       // world.solver = solver

       world.gravity.set(0, -20, 0)

       world.broadphase.useBoundingBoxes = true

       // Create a slippery material (friction coefficient = 0.0)
       physicsMaterial = new CANNON.Material('physics')
       const physics_physics = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
         friction: 0.0,
         restitution: 0.3,
       })

       // We must add the contact materials to the world
       world.addContactMaterial(physics_physics)

       // Create the user collision sphere
       const radius = 1.3
       sphereShape = new CANNON.Sphere(radius)
       sphereBody = new CANNON.Body({ mass: 5, material: physicsMaterial })
       sphereBody.addShape(sphereShape)
       sphereBody.position.set(nx * sx * 0.5, ny * sy + radius * 2, nz * sz * 0.5)
       sphereBody.linearDamping = 0.9
       world.addBody(sphereBody)

       // Create the ground plane
       const groundShape = new CANNON.Plane()
       const groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial })
       groundBody.addShape(groundShape)
       groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
       world.addBody(groundBody)

       // Voxels
       voxels = new VoxelLandscape(world, nx, ny, nz, sx, sy, sz)

       for (let i = 0; i < nx; i++) {
         for (let j = 0; j < ny; j++) {
           for (let k = 0; k < nz; k++) {
             let filled = true

             // Insert map constructing logic here
             if (Math.sin(i * 0.1) * Math.sin(k * 0.1) < (j / ny) * 2 - 1) {
               filled = false
             }

             voxels.setFilled(i, j, k, filled)
           }
         }
       }

       voxels.update()

       console.log(`${voxels.boxes.length} voxel physics bodies`)

       // Voxel meshes
       for (let i = 0; i < voxels.boxes.length; i++) {
         const box = voxels.boxes[i]
         const voxelGeometry = new THREE.BoxBufferGeometry(voxels.sx * box.nx, voxels.sy * box.ny, voxels.sz * box.nz)
         const voxelMesh = new THREE.Mesh(voxelGeometry, material)
         voxelMesh.castShadow = true
         voxelMesh.receiveShadow = true
         objects.push(voxelMesh)
         scene.add(voxelMesh)
       }

       // The shooting balls
       const shootVelocity = 15
       const ballShape = new CANNON.Sphere(0.2)
       const ballGeometry = new THREE.SphereBufferGeometry(ballShape.radius, 32, 32)

       // Returns a vector pointing the the diretion the camera is at
       function getShootDirection() {
         const vector = new THREE.Vector3(0, 0, 1)
         vector.unproject(camera)
         const ray = new THREE.Ray(sphereBody.position, vector.sub(sphereBody.position).normalize())
         return ray.direction
       }

       window.addEventListener('click', (event) => {
         if (!controls.enabled) {
           return
         }

         const ballBody = new CANNON.Body({ mass: 1 })
         ballBody.addShape(ballShape)
         const ballMesh = new THREE.Mesh(ballGeometry, material)

         ballMesh.castShadow = true
         ballMesh.receiveShadow = true

         world.addBody(ballBody)
         scene.add(ballMesh)
         balls.push(ballBody)
         ballMeshes.push(ballMesh)

         const shootDirection = getShootDirection()
         ballBody.velocity.set(
           shootDirection.x * shootVelocity,
           shootDirection.y * shootVelocity,
           shootDirection.z * shootVelocity
         )

         // Move the ball outside the player sphere
         const x = sphereBody.position.x + shootDirection.x * (sphereShape.radius * 1.02 + ballShape.radius)
         const y = sphereBody.position.y + shootDirection.y * (sphereShape.radius * 1.02 + ballShape.radius)
         const z = sphereBody.position.z + shootDirection.z * (sphereShape.radius * 1.02 + ballShape.radius)
         ballBody.position.set(x, y, z)
         ballMesh.position.copy(ballBody.position)
       })
     }

     function initPointerLock() {
       controls = new PointerLockControlsCannon(camera, sphereBody)
       scene.add(controls.getObject())

       instructions.addEventListener('click', () => {
         controls.lock()
       })

       controls.addEventListener('lock', () => {
         controls.enabled = true
         instructions.style.display = 'none'
       })

       controls.addEventListener('unlock', () => {
         controls.enabled = false
         instructions.style.display = null
       })
     }

     function animate() {
       requestAnimationFrame(animate)

       const time = performance.now() / 1000
       const dt = time - lastCallTime
       lastCallTime = time

       if (controls.enabled) {
         world.step(timeStep, dt)

         // Update ball positions
         for (let i = 0; i < balls.length; i++) {
           ballMeshes[i].position.copy(balls[i].position)
           ballMeshes[i].quaternion.copy(balls[i].quaternion)
         }

         // Update box positions
         for (let i = 0; i < voxels.boxes.length; i++) {
           objects[i].position.copy(voxels.boxes[i].position)
           objects[i].quaternion.copy(voxels.boxes[i].quaternion)
         }
       }

       controls.update(dt)
       renderer.render(scene, camera)
       stats.update()
     }
     */

function addVoxel(x, y, z, filled) {

  const voxel = new THREE.Mesh(cubeGeo, cubeMat)

  const voxelBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Box(new CANNON.Vec3(5, 5, 5)),
    material: mainMaterial
  })

  voxel.position.set(x, y, z)
  voxel.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5)
  scene.add(voxel)
  objects.push(voxel)

  voxelBody.position.copy(voxel.position)
  voxelBody.quaternion.copy(voxel.quaternion)

  world.addBody(voxelBody)
  physObjs.push(voxelBody)
  return voxelBody
}

function removeVoxel(x, y, z, type) {

  scene.remove(intersect.object)

  objects.splice(objects.indexOf(intersect.object), 1)

  world.removeBody(intersect.object.position)
}


/**
 * World Generation
 */
function generateWorld(x, y, z) {
  if (filled) {

    const voxel = new THREE.Mesh(cubeGeo, cubeMat)

    const voxelBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(5, 5, 5)),
      material: mainMaterial
    })

    voxel.position.set(x, y, z)
    voxel.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5)
    scene.add(voxel)

    objects.push(voxel)

    //Voxel Mesh Merge
    voxelBody.position.copy(voxel.position)
    voxelBody.quaternion.copy(voxel.quaternion)

    world.addBody(voxelBody)
  }
}

//Generation Parameters
noise.seed(Math.random());


// Number of voxels
const nx = 100
const ny = 10
const nz = 100

// Scale of voxels
const sx = 5
const sy = 5
const sz = 5

// Generic material
let material = new THREE.MeshLambertMaterial({ color: 0xdddddd })
const boxes = []

// Voxels
let voxels = new VoxelLandscape(world, nx, ny, nz, sx, sy, sz)

for (let i = 0; i < nx; i++) {
  for (let j = 0; j < ny; j++) {
    for (let k = 0; k < nz; k++) {
      let filled = true

      // Insert map constructing logic here
      if (Math.sin(i * 0.1) * Math.sin(k * 0.1) < (j / ny) * 2 - 1) {
        filled = false
      }
      //other generation function
      /*
      if (noise.simplex3(i / 100, k / 100, j / 100) <= 0) {
        filled = false
      }
      */

      voxels.setFilled(i, j, k, filled)
    }
  }
}

voxels.update()

console.log(voxels)

// Voxel meshes
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
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.shadowMap.enabled = true
//higher quality shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Create the user collision
const playerShape = new CANNON.Box(new CANNON.Vec3(1, 2, 1))
const playerBody = new CANNON.Body({ mass: 70, shape: playerShape, linearDamping: 0.25, material: mainMaterial })
playerBody.position.set(10, 100, 10)
world.addBody(playerBody)

const controls = new PointerLockControlsCannon(camera, playerBody)
//How far the player can reach
let maxReach = 30
scene.add(controls.getObject())
controls.enabled = true

window.addEventListener('click', (event) => {
  if (!controls.enabled) {
    return
  }
  document.body.requestPointerLock();
})

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

window.addEventListener('resize', () => {

  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.render(scene, camera)
})

