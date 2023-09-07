import './main.css'
import * as THREE from 'three'
//import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import nebula from './nebula.jpg'
import stars from './stars.jpg'

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
    console.log(intersects)

    for(let i = 0; i < intersects.length; i++) {
        if(intersects[i].object.id === sphereId) 
            intersects[i].object.material.color.set(0xFF0000)
        if(intersects[i].object.name === 'cube2') {
            intersects[i].object.rotation.x += 0.001 * deltaTime
        }
    }


    //Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}
tick()


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