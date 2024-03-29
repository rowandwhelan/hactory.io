import './main.css'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
//import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

import nebula from './nebula.jpg'
import stars from './stars.jpg'

const monkeyUrl = new URL('./monkey.glb', import.meta.url)

//Scene
const scene = new THREE.Scene()

//Textures
const textureLoader = new THREE.TextureLoader()
//scene.background = textureLoader.load(stars)
const cubeTextureLoader = new THREE.CubeTextureLoader()
scene.background = cubeTextureLoader.load([
    nebula,
    stars,
    nebula,
    nebula,
    stars,
    stars
])

//Asset loader
const assetLoader = new GLTFLoader()
assetLoader.load(monkeyUrl.href, function(gltf) {
    const model = gltf.scene
    scene.add(model)
    model.position.set(-12, 4, 10)
}, undefined, function(error) {
    console.error(error)
})

//Cube 1#
const cube1geometry = new THREE.BoxGeometry(1,1,1)
const cube1material = new THREE.MeshBasicMaterial({
    color: 0xff0000
})
const cube1 = new THREE.Mesh(cube1geometry, cube1material)
cube1.position.set(0,0,0)
scene.add(cube1)

//Multimaterial box
const cube2MultiMaterial = [
    new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)})
]

//Cube 2#
const cube2Geometry = new THREE.BoxGeometry(3,3,3)
const cube2Material = new THREE.MeshBasicMaterial({
    map: textureLoader.load(nebula)
})
const cube2 = new THREE.Mesh(cube2Geometry, cube2MultiMaterial)
scene.add(cube2)
cube2.position.set(0,15,10)
cube2.name = 'cube2'


//Sphere
const sphereGeometry = new THREE.SphereGeometry(4, 50, 50)
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000FF,
    wireframe: false
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
scene.add(sphere)
sphere.position.set(-10,0,-10)
sphere.castShadow = true
const sphereId = sphere.id

//Sphere 2 
const sphere2Geometry = new THREE.SphereGeometry(4)
const sphere2Material = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
})
const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material)
scene.add(sphere2)
sphere2.position.set(-5,10,10)

//Plane
const planeGeometry = new THREE.PlaneGeometry(30,30)
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(plane)
plane.rotation.x = -0.5 * Math.PI
plane.receiveShadow = true

//Grid
const gridHelper = new THREE.GridHelper(30, 60)
scene.add(gridHelper)

//Plane 2
const plane2Geometry = new THREE.PlaneGeometry(10, 10, 100, 100)
const plane2Material = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    wireframe: true
})
const plane2 = new THREE.Mesh(plane2Geometry, plane2Material)
scene.add(plane2)
plane2.position.set(10,10,15)

//Ambient Light
const ambientLight = new THREE.AmbientLight(0x333333)
scene.add(ambientLight)

//Directional Light
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8)
scene.add(directionalLight)
directionalLight.position.set(-30, 50, 0)
directionalLight.castShadow = true
//the shadows only appear if they are inside the shadow area defined below
directionalLight.shadow.camera.bottom = -12
directionalLight.shadow.camera.left = -20

//Directional Light Helper
const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5)
scene.add(dLightHelper)

//Directional Light Shadow Helper
const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
scene.add(dLightShadowHelper)

//Spotlight
const spotlight = new THREE.SpotLight(0xFFFFFF)
scene.add(spotlight)
spotlight.position.set(-100, 100, 0)
spotlight.castShadow = true
//higher angle produces pixelated shadows
spotlight.angle = 0.2
//blurred edges
spotlight.penumbra = 0
//brightness/opacity
spotlight.intensity = 1

//Spotlight Helper
const sLightHelper = new THREE.SpotLightHelper(spotlight)
scene.add(sLightHelper)

//Fog or FogExp2 [fog grows exponetially] (color, near limit, far limit)
scene.fog = new THREE.Fog(0xFFFFFF, 0, 200)

//Viewport sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
//camera yay :)
/*Numbers are: fov (vertical), viewport width / viewport height, near cutoff, far distance cutoff --
-- (wont be rendered if that far away) (dont use extreme values to prevent z fighting) */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
//position
camera.position.set(0,0,3)
scene.add(camera)

//Clicking and normalized mouse position
const mousePosition = new THREE.Vector2()
window.addEventListener('mousemove', function(e){
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1
})

const rayCaster = new THREE.Raycaster()

//renderer
const canvas = document.querySelector('.webgl')

const renderer = new THREE.WebGLRenderer({
    canvas
})
renderer.setSize(sizes.width, sizes.height)
//renderer.setClearColor('skyblue')
renderer.shadowMap.enabled = true

//Controls
//const controls = new THREE.PointerLockControls( camera, renderer.domElement)
//controls.update()

//every time the spotlight changes the helper must too
sLightHelper.update()

const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()

//time
let time = Date.now()

//Sphere Bounce 
let step = 0
let speed = 0.01

//Box 3#
const box3Geo = new THREE.BoxGeometry(2,2,2)
const box3Mat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
    position: new CANNON.Vec3(1,20,0)
})
const box3Mesh = new THREE.Mesh(box3Geo, box3Mat)
scene.add(box3Mesh)

//Sphere 3
const sphere3Geo = new THREE.SphereGeometry(2)
const sphere3Mat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true
})
const sphere3Mesh = new THREE.Mesh(sphere3Geo, sphere3Mat)
scene.add(sphere3Mesh)

//Ground
const groundGeo = new THREE.PlaneGeometry(30,30)
const groundMat = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide,
    wireframe: true
})
const groundMesh = new THREE.Mesh(groundGeo, groundMat)
scene.add(groundMesh)

//Physics 
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0)
})

const timeStep = 1/60

//Ground Cannon.js Material 
const groundPhysMat = new CANNON.Material()

//Ground Hitbox
const groundBody = new CANNON.Body({
    //shape: new CANNON.Plane(),
    shape: new CANNON.Box(new CANNON.Vec3(15,15,0.1)),
    //mass: 10
    type: CANNON.Body.STATIC,
    material: groundPhysMat

})
world.addBody(groundBody)
groundBody.position.set(5,0,-10)
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

//Box 3 Cannon.js Material
const boxPhysMat = new CANNON.Material()

//box 3 hitbox
const boxBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Box(new CANNON.Vec3(1,1,1)),
    position: new CANNON.Vec3(5, 20, 0),
    material: boxPhysMat
})
world.addBody(boxBody)

boxBody.angularVelocity.set(0,10,0)
boxBody.angularDamping = 0.5

//Ground-Box 3 Collision Cannon.js Materials
const groundBoxContactMat = new CANNON.ContactMaterial(
    groundPhysMat,
    boxPhysMat,
    {friction: 0}
)

world.addContactMaterial(groundBoxContactMat)

//Sphere 3 Cannon Material
const spherePhysMat = new CANNON.Material()

//sphere 3 hitbox
const sphere3Body = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(2),
    position: new CANNON.Vec3(0,15,0),
    material: spherePhysMat
})
world.addBody(sphere3Body)

//Sphere 3  bouncyness
const groundSphereContactMat = new CANNON.ContactMaterial(
    groundPhysMat,
    spherePhysMat,
    {restitution: 0.9}
)

world.addContactMaterial(groundSphereContactMat)

//sphere 3 damping
sphere3Body.linearDamping = 0.31

//animation
const tick = () => {

    //current time
    const currentTime = Date.now()
    const deltaTime = currentTime - time
    time = currentTime
    //delta time is basiclly miliseconds per frame

    //Update objects
    cube1.rotation.y += 0.001 * deltaTime

    step += speed
    sphere.position.y = 10 * Math.abs(Math.sin(step))

    //Mouse
    rayCaster.setFromCamera(mousePosition, camera)
    const intersects = rayCaster.intersectObjects(scene.children)

    for(let i = 0; i < intersects.length; i++) {
        if(intersects[i].object.id === sphereId) 
            intersects[i].object.material.color.set(0xFF0000)
        if(intersects[i].object.name === 'cube2') {
            intersects[i].object.rotation.x += 0.001 * deltaTime
        }
    }

    //Grid vertex changes
    plane2.geometry.attributes.position.array[(Math.floor(((plane2.geometry.attributes.position.array.length - 1) * Math.random())))] -= Math.sin(Math.random()/10)
    plane2.geometry.attributes.position.needsUpdate = true

    //Physics
    world.step(timeStep)

    //Render
    renderer.render(scene, camera)

    //Ground Mesh Merge
    groundMesh.position.copy(groundBody.position)
    groundMesh.quaternion.copy(groundBody.quaternion)

    //Cube 3 Mesh Merge
    box3Mesh.position.copy(boxBody.position)
    box3Mesh.quaternion.copy(boxBody.quaternion)

    //Sphere 3 Mesh Merge
    sphere3Mesh.position.copy(sphere3Body.position)
    sphere3Mesh.quaternion.copy(sphere3Body.quaternion)
    
    window.requestAnimationFrame(tick)
}
tick()

//Resizable window
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

/*
const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const port = 3000;


//const srcPath = path.join(__dirname, '/../src');
//app.use(express.static(srcPath));

app.get('/', (req, res) => {
    //const filePath = path.join(__dirname, '../client/html/index.html');
    res.sendFile(filePath);
});

server.listen(port, () => {
    console.log(`Socket.io server running on port ${port}`);
});
*/
/*
//ping every second and timeout after 10 seconds
const io = socketIO(server, { pingInterval: 1000, pingTimeout: 10000 });


const srcPath = path.join(__dirname, '/../src');
app.use(express.static(srcPath));

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, '../client/html/index.html');
    res.sendFile(filePath);
});


const players = {}

// Handle client connections
io.on('connection', (socket) => {
    console.log(`A user connected}`);
    //adds a player to the list using bracket syntax
    players[socket.id] = {
        color: "red"
    }

    io.emit('updatePlayers', players);

    console.log(players);
    // Handle disconnect event
    socket.on('disconnect', (reason) => {
        console.log(`User disconnected: ${socket.id} because ${reason}`);
        delete players[socket.id]
        io.emit('updatePlayers', players);
    });

    // Add custom event handlers

});


*/