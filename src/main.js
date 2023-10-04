import './main.css'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { PointerLockControlsCannon } from './PointerLockControlsCannon.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import nebula from '../public/assets/nebula.jpg'
import stars from '../public/assets/stars.jpg'
import stone from '../public/assets/HactoryStone.png'

import negx from '../public/assets/skybox/negx.jpg'
import negy from '../public/assets/skybox/negy.jpg'
import negz from '../public/assets/skybox/negz.jpg'
import posx from '../public/assets/skybox/posx.jpg'
import posy from '../public/assets/skybox/posy.jpg'
import posz from '../public/assets/skybox/posz.jpg'

/**
 * Base
 */
//Canvas
const canvas = document.querySelector('.webgl')

//Scene
const scene = new THREE.Scene()

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

//Box 3#
const box3Geo = new THREE.BoxGeometry(2, 2, 2)
const box3Mat = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  wireframe: false
})
const box3Mesh = new THREE.Mesh(box3Geo, box3Mat)
box3Mesh.castShadow = true
box3Mesh.position.set(new CANNON.Vec3(1, 20, 0))
scene.add(box3Mesh)

//Sphere 3
const sphere3Geo = new THREE.SphereGeometry(2)
const sphere3Mat = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  wireframe: false,
  metalness: 0.3,
  roughness: 0.4
})
const sphere3Mesh = new THREE.Mesh(sphere3Geo, sphere3Mat)
sphere3Mesh.castShadow = true
sphere3Mesh.receiveShadow = true
scene.add(sphere3Mesh)

//Ground
const groundGeo = new THREE.PlaneGeometry(30, 30)
const groundMat = new THREE.MeshStandardMaterial({
  color: 0xFFFFFF,
  side: THREE.DoubleSide,
  wireframe: false,
  metalness: 0.3,
  roughness: 0.4
})
const groundMesh = new THREE.Mesh(groundGeo, groundMat)
groundMesh.receiveShadow = true
scene.add(groundMesh)

//Physics 
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
})

//Ground Cannon.js Material 
const groundPhysMat = new CANNON.Material()

//Ground Hitbox
const groundBody = new CANNON.Body({
  //shape: new CANNON.Plane(),
  shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1)),
  //mass: 10
  type: CANNON.Body.STATIC,
  material: groundPhysMat

})
world.addBody(groundBody)
groundBody.position.set(5, 0, -10)
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

//Box 3 Cannon.js Material
const boxPhysMat = new CANNON.Material()

//box 3 hitbox
const boxBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
  position: new CANNON.Vec3(5, 20, 0),
  material: boxPhysMat
})
world.addBody(boxBody)

boxBody.angularVelocity.set(0, 10, 0)
boxBody.angularDamping = 0.5

//Ground-Box 3 Collision Cannon.js Materials
const groundBoxContactMat = new CANNON.ContactMaterial(
  groundPhysMat,
  boxPhysMat,
  { friction: 0 }
)

world.addContactMaterial(groundBoxContactMat)

//Sphere 3 Cannon Material
const spherePhysMat = new CANNON.Material()

//sphere 3 hitbox
const sphere3Body = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Sphere(2),
  position: new CANNON.Vec3(0, 15, 0),
  material: spherePhysMat
})
world.addBody(sphere3Body)

//Sphere 3  bouncyness
const groundSphereContactMat = new CANNON.ContactMaterial(
  groundPhysMat,
  spherePhysMat,
  { restitution: 0.9 }
)

world.addContactMaterial(groundSphereContactMat)

//sphere 3 damping
sphere3Body.linearDamping = 0.31

//Fog or FogExp2 [fog grows exponetially] (color, near limit, far limit)
scene.fog = new THREE.Fog(0xFFFFFF, 0, 300)

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

//Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
//position
camera.position.set(0, 15, 0)
scene.add(camera)

const objects = []

//Placeholder Block
const placeholderGeo = new THREE.BoxGeometry(5, 5, 5);
const placeholderMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
const placeholderMesh = new THREE.Mesh(placeholderGeo, placeholderMaterial);
scene.add(placeholderMesh);

const map = new THREE.TextureLoader().load(stone);
const cubeGeo = new THREE.BoxGeometry(5, 5, 5);
const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c, map: map });

const grid4Helper = new THREE.GridHelper(100, 20);
scene.add(grid4Helper);

const plane4Geometry = new THREE.PlaneGeometry(100, 100);
plane4Geometry.rotateX(- Math.PI / 2);

const plane4 = new THREE.Mesh(plane4Geometry, new THREE.MeshBasicMaterial({ visible: false }));
scene.add(plane4);

objects.push(plane4);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isShiftDown = false

document.addEventListener( 'mousemove', onMouseMove );
document.addEventListener( 'mousedown', onMouseDown );
document.addEventListener( 'keydown', onkeydown );
document.addEventListener( 'keyup', onkeyup );

//move this outside a function, should continuously running
function onMouseMove(event) {

  mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(objects, false);

  if (intersects.length > 0) {

    const intersect = intersects[0];

    placeholderMesh.position.copy(intersect.point).add(intersect.face.normal);
    placeholderMesh.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5);

    renderer.render(scene, camera)

  }

}

function onMouseDown(event) {

  mouse.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(objects, false);

  if (intersects.length > 0) {

    const intersect = intersects[0];

    // delete cube

    if (event.button == 2) {

      if (intersect.object !== plane4) {

        scene.remove(intersect.object);

        objects.splice(objects.indexOf(intersect.object), 1);

      }

      // create cube

    } else {

      const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
      voxel.position.copy(intersect.point).add(intersect.face.normal);
      voxel.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5);
      scene.add(voxel);

      objects.push(voxel);

    }

    renderer.render(scene, camera)

  }

}

// Create the user collision
const playerShapeHalfExtents = new CANNON.Vec3(2, 4, 2)
const playerShape = new CANNON.Box(playerShapeHalfExtents)
const playerBody = new CANNON.Body({ mass: 5, shape: playerShape, linearDamping: 0.9 })
playerBody.position.set(0, 10, 0)
world.addBody(playerBody)

const controls = new PointerLockControlsCannon(camera, playerBody)
scene.add(controls.getObject())

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.shadowMap.enabled = true
//higher quality shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()

//Current Time
let time = Date.now()

//Physics Timestep
const timeStep = 1 / 60

//animation
const tick = () => {

  //current time
  const currentTime = Date.now()
  const deltaTime = currentTime - time
  time = currentTime
  //delta time is miliseconds per frame

  //Grid vertex changes
  //plane.geometry.attributes.position.array[(Math.floor(((plane.geometry.attributes.position.array.length - 1) * Math.random())))] -= Math.sin(Math.random() / 10)
  //plane.geometry.attributes.position.needsUpdate = true

  //Physics
  world.step(timeStep)

  //Ground Mesh Merge
  groundMesh.position.copy(groundBody.position)
  groundMesh.quaternion.copy(groundBody.quaternion)

  //Cube 3 Mesh Merge
  box3Mesh.position.copy(boxBody.position)
  box3Mesh.quaternion.copy(boxBody.quaternion)

  //Sphere 3 Mesh Merge
  sphere3Mesh.position.copy(sphere3Body.position)
  sphere3Mesh.quaternion.copy(sphere3Body.quaternion)

  //Render
  renderer.render(scene, camera)

  window.requestAnimationFrame(tick)
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

