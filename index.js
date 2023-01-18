const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

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

server.listen(3000, () => {
  console.log('listening on *:3000');
});