import './main.css'
import * as THREE from 'three'
//Scene
const scene = new THREE.Scene()
//Red Cube
const geometry = new THREE.BoxGeometry(1,1,1)
const material = new THREE.MeshBasicMaterial({color: 0xff0000})
const mesh = new THREE.Mesh(geometry, material)
mesh.position.set(0,0,0)
scene.add(mesh)

//Viewport sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
//camera yay :)
/*Numbers are: fov (vertical), viewport width / viewport height, near cutoff, far distance cutoff --
-- (wont be rendered if that far away) (dont use extreme values to prevent z fighting) */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
//position
camera.position.x = 0
camera.position.y = 0
camera.position.z = 3
scene.add(camera)


//renderer
const canvas = document.querySelector('.webgl')

const renderer = new THREE.WebGLRenderer({
    canvas
})
renderer.setSize(sizes.width, sizes.height)


//time
let time = Date.now()

//animation
const tick = () => {

    //current time
    const currentTime = Date.now()
    const deltaTime = currentTime - time
    time = currentTime



   //Update objects
   mesh.rotation.y += 0.001 * deltaTime

   console.log(deltaTime)

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