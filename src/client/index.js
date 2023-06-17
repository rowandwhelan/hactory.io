const canvas = document.querySelector('canvas')
const c = canvas.getContext('experimental-webgl')

const socket = io()

canvas.width = innerWidth
canvas.height = innerHeight

//fix this, only 2d rn
const x = canvas.width / 2
const y = canvas.width / 2

const player = new Player(100, 100, 100, 'orange')
const players = {}

socket.on('updatePlayers', (backendPlayers) =>{
    for (const id in backendPlayers){
        const backendPlayer = backendPlayers[id]

        if (!players[id]) {
            players[id] = new Player(backendPlayer.x, backendPlayer.y, z, 'red')
        }
        //removing players
        for (const id in players) {
            if (!backendPlayers[id]){
                delete players[id]
            }
        }
    }
    console.log(players)
});
//needs fixing
let animationId
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)

    for (const id in players){
        const player = players[id]
        player.draw
    }
}

animate()