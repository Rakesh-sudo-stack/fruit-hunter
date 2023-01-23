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
const fruits = ['Apple','Banana','Orange'];
let powerups = ['speed','snowflake','jumbo'];

const generateRandomID = (myLength) => {
  const chars =
    "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";
  const randomArray = Array.from(
    { length: myLength },
    (v, k) => chars[Math.floor(Math.random() * chars.length)]
  );

  const randomString = randomArray.join("");
  return randomString;
};

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('create-room',(code)=>{
    rooms[socket.id] = code;
    socket.join(code);
    io.to(code).emit('be-host');
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

  socket.on('spawn-fruit',()=>{
    let x = Math.floor((Math.random() * 650) - 50);
    let y = Math.floor((Math.random() * 550) - 50);
    let fruit = fruits[Math.floor(Math.random() * 3)];
    let id = generateRandomID(10);
    io.to(rooms[socket.id]).emit('add-fruit',{x,y,fruit,id});
  })

  socket.on('spawn-powerup',()=>{
    let x = Math.floor((Math.random() * 650) - 50);
    let y = Math.floor((Math.random() * 550) - 50);
    let powerup = powerups[Math.floor(Math.random() * 3)];
    let id = generateRandomID(10);
    io.to(rooms[socket.id]).emit('add-powerup',{x,y,powerup,id});
  })

  socket.on('snow-flake-used',()=>{
    socket.to(rooms[socket.id]).emit('freeze-opponent');
  })

  socket.on('jumbo-used',()=>{
    socket.to(rooms[socket.id]).emit('jumbo-opponent');
  })

  socket.on('player-move',(pos)=>{
    socket.to(rooms[socket.id]).emit('update-move',pos);
  })

  socket.on('fruit-eaten',(data)=>{
    socket.to(rooms[socket.id]).emit('update-score',data);
  })
  socket.on('spawn-bomb',()=>{
    let x = Math.floor((Math.random() * 650) - 50);
    let y = Math.floor((Math.random() * 550) - 50);
    let id = generateRandomID(10);
    io.to(rooms[socket.id]).emit('add-bomb',{x,y,id});
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