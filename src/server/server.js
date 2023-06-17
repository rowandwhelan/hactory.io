const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
//port #
const port = process.env.PORT || 3000;
//ping every second and timeout after 10 seconds
const io = socketIO(server, {pingInterval: 1000, pingTimeout: 10000});

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
    x: 500 * Math.random(),
    y: 500 * Math.random(),
    z: 0,
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

// Start the server
server.listen(port, () => {
  console.log(`Socket.io server running on port ${port}`);
});
