var socket = io();

let bgMusic = new Audio("../img/background-music.mp3");

// Generates random five digit number
let code;
const numgenerator = () => {
    let minm = 100;
    let maxm = 999;
    let code = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
    return code;
}

let partyPage = document.querySelector('.party-page');
let partyCodes = document.querySelector('.party-codes');
let joinPartyCode = document.querySelector('.join-party-code');
let createPartyCode = document.querySelector('.create-party-code');

const createPartyPage = () => {
    partyPage.style.display = "none";
    partyCodes.style.display = "flex";
    joinPartyCode.style.display = "none";
    let createPartyCode = numgenerator();
    document.querySelector('#code').innerHTML = createPartyCode;
    code = createPartyCode;
    socket.emit('create-room',code);
}

const joinPartyPage = () => {
    partyCodes.style.display = "flex";
    partyPage.style.display = "none";
    createPartyCode.style.display = "none";
}

const joinRoom = () => {
    let code = document.querySelector('#roomcode').value;
    console.log(code);
    socket.emit('join-room',parseInt(code));
}

socket.on('room-not-found',()=>{
    document.querySelector('#party-not-found-text').innerHTML = "Party does not exist.";
    setTimeout(()=>{document.querySelector('#party-not-found-text').innerHTML = '';},2000)
});

let players = {
    you:{},
    opponent:{}
}

let keys = {
    ArrowUp : false,
    ArrowDown : false,
    ArrowLeft : false,
    ArrowRight : false
}

const game = () => {
    if(keys.ArrowUp){
        players.you.y -= 5;
    }
    if(keys.ArrowDown){
        players.you.y += 5;
    }
    if(keys.ArrowLeft){
        players.you.x -= 5;
    }
    if(keys.ArrowRight){
        players.you.x += 5;
    }
    document.querySelector('#you').style.top = players.you.y+"px";
    document.querySelector('#you').style.left = players.you.x+"px";
    socket.emit('player-move',{x:players.you.x,y:players.you.y});
    window.requestAnimationFrame(game);
}

const startGame = () => {
    window.requestAnimationFrame(game);

    let gameArea = document.querySelector('.game-area');

    let el1 = document.createElement('div');
    el1.id = 'you';
    gameArea.appendChild(el1);

    let el2 = document.createElement('div');
    el2.id = 'opponent';
    gameArea.appendChild(el2);

    let yourpos = document.querySelector('#you').getBoundingClientRect();
    let oppopos = document.querySelector('#opponent').getBoundingClientRect();

    players.you = {
        height:yourpos.height,
        width:yourpos.width,
        speed:5,
        x:yourpos.x,
        y:yourpos.y
    }

    players.opponent = {
        height:oppopos.height,
        width:oppopos.width,
        speed:5,
        x:oppopos.x,
        y:oppopos.y
    }

    document.addEventListener('keydown',(e)=>{
        keys[e.key] = true;
    })

    document.addEventListener('keyup',(e)=>{
        keys[e.key] = false;
    })
}

function prepareToStart(){
    document.querySelector('.main-div').style.display = "none";
    document.querySelector('.container').style.display = "flex";
    setTimeout(() => {
        document.querySelector('.count-down').style.display='none';
        startGame();
    }, 4000);
}

socket.on('join-game',(code)=>{
    console.log(`Joined game ${code}`);
    prepareToStart();
})

socket.on('update-move',(pos)=>{
    document.querySelector('#opponent').style.top = pos.y+'px';
    document.querySelector('#opponent').style.left = pos.x+'px';
})