import './main.css'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
//import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import nebula from '../public/assets/nebula.jpg'
import stars from '../public/assets/stars.jpg'

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
    model.position.set(-12, 4, 10)
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

/**
 * Object Templates
 */
//Simple Box Maker
const boxGeo = new THREE.BoxGeometry(1, 1, 1)
const boxMat = new THREE.MeshBasicMaterial({
    color: 0xff0000
})
const box = new THREE.Mesh(boxGeo, boxMat)
box.position.set(0, 0, 0)
box.castShadow = true
//scene.add(box)

//Multimaterial Advanced Box
const box2Geo = new THREE.BoxGeometry(3, 3, 3)
const box2Mat = new THREE.MeshBasicMaterial({})
const box2 = new THREE.Mesh(box2Geo, box2MultiMaterial)
box2.position.set(0, 15, 10)
box2.castShadow = true
box2.receiveShadow = true
const box2Id = box2.id
//scene.add(box2)

//Sphere Maker
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000FF
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphere.position.set(0, 0, 0)
sphere.castShadow = true
sphere.receiveShadow = true
//scene.add(sphere)

//Advanced Sphere Maker (with shaders)
const sphere2Geometry = new THREE.SphereGeometry(1, 20, 20)
const sphere2Material = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
})
const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material)
sphere2.position.set(0, 0, 0)
sphere2.castShadow = true
sphere2.receiveShadow = true
const sphere2Id = sphere2.id
//scene.add(sphere2)

//Plane Maker
const planeGeo = new THREE.PlaneGeometry(10, 10, 30, 30)
const planeMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide
})
const plane = new THREE.Mesh(planeGeo, planeMat)
plane.rotation.x = -0.5 * Math.PI
plane.position.set(10, 10, 15)
plane.receiveShadow = true
//scene.add(plane)

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

const environmentMapTexture = cubeTextureLoader.load([
    './nebula.jpg',
    './stars.jpg',
    './nebula.jpg',
    './nebula.jpg',
    './stars.jpg',
    './stars.jpg'
])

//Sphere 3
const sphere3Geo = new THREE.SphereGeometry(2)
const sphere3Mat = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    wireframe: false,
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
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
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
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
scene.fog = new THREE.Fog(0xFFFFFF, 0, 200)

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
directionalLight.position.set(10, 10, 10)
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

//Viewport sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

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


//Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
//position
camera.position.set(0, 15, 0)
scene.add(camera)

//Clicking and normalized mouse position
const mousePosition = new THREE.Vector2()
window.addEventListener('mousemove', function (e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1
})

const rayCaster = new THREE.Raycaster()

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
//higher quality shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
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
    //delta time is basiclly miliseconds per frame

    //Update objects (empty currently)

    //Mouse
    rayCaster.setFromCamera(mousePosition, camera)
    const intersects = rayCaster.intersectObjects(scene.children)
    /*
        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.id === sphereId)
                intersects[i].object.material.color.set(0xFF0000)
            if (intersects[i].object.id === box2Id) {
                intersects[i].object.rotation.x += 0.001 * deltaTime
            }
        }
    */
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