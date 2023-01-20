const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.static(__dirname+'/assets'));

app.get('/', (req, res) => {
  res.sendFile(__dirname+'/index.html');
});

app.get('/game', (req, res) => {
  res.sendFile(__dirname+'/views/game.html');
});

app.get('/party', (req, res) => {
  res.sendFile(__dirname+'/views/party.html');
});

let rooms = {};

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('create-room',(code)=>{
    rooms[socket.id] = code;
    socket.join(code);
    console.log(rooms);
  })
  socket.on('join-room',(code)=>{
    let roomFound = false;
    for (const item of Object.entries(rooms)) {
      if(item[1] == code){
        roomFound = true;
      }
    };
    
    if(roomFound){
      rooms[socket.id] = code;
      socket.join(code);
      console.log(rooms);
      io.to(code).emit('join-game',code);
    }else{
      socket.emit('room-not-found')
    }
  })
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
    console.log()
    delete rooms[socket.id];
    console.log(rooms);
  });
});
server.listen(3000, () => {
  console.log('listening on *:3000');
});