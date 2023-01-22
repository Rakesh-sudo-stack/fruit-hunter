var socket = io();

let bgMusic = new Audio("../img/background-music.mp3");

// Generates random five digit number
let code;
const numgenerator = () => {
    let minm = 10000;
    let maxm = 99999;
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

let host = false;
let yourScore = 0;
let rivalScore = 0;
let points = {
    Apple:150,
    Orange:100,
    Banana:50
}
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

let boxRect;

const checkCollision = (item1,item2) => {
    item1Rect = item1.getBoundingClientRect();
    item2Rect = item2.getBoundingClientRect();
    return !((item1Rect.bottom < item2Rect.top) || (item1Rect.top > item2Rect.bottom) || (item1Rect.right < item2Rect.left) || 
    (item1Rect.left > item2Rect.right));
}

const game = () => {
    if(keys.ArrowUp && players.you.y>0){
        players.you.y -= 5;
    }
    if(keys.ArrowDown && players.you.y<boxRect.height - players.you.height){
        players.you.y += 5;
    }
    if(keys.ArrowLeft && players.you.x>0){
        players.you.x -= 5;
    }
    if(keys.ArrowRight && players.you.x<boxRect.width - players.you.width){
        players.you.x += 5;
    }
    let you = document.querySelector('#you');
    let fruits = document.querySelectorAll('.fruit');
    try{
    Array.from(fruits.forEach((fruit)=>{
        if(checkCollision(you,fruit)){
            fruit.parentNode.removeChild(fruit);
            yourScore += points[fruit.classList[1]];
            score.innerHTML = yourScore;
            socket.emit('fruit-eaten',{id:fruit.id,score:yourScore})
        }
    }))
    }catch(e){}

    let bombs = document.querySelectorAll('.bomb');
    try{
    Array.from(bombs.forEach((bomb)=>{
        if(checkCollision(you,bomb)){
            bomb.parentNode.removeChild(bomb);
            yourScore -= Math.floor(Math.random() * (300 - 200 + 1)) + 200;
            score.innerHTML = yourScore;
            socket.emit('fruit-eaten',{id:bomb.id,score:yourScore})
        }
    }))
    }catch(e){}

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

    boxRect = document.querySelector('.game-area').getBoundingClientRect();
    if(host){
        socket.emit('spawn-fruit')
    }
    bgMusic.play();
    socket.on('add-fruit',(fruit)=>{
        console.log(fruit);
        let myfruit = document.createElement('div');
        myfruit.className = `fruit ${fruit.fruit}`;
        myfruit.id = fruit.id;
        myfruit.style.top = fruit.y+"px";
        myfruit.style.left = fruit.x+"px";
        gameArea.appendChild(myfruit);
        if(host){
            let time = Math.floor(Math.random() * (1500 - 500 + 1)) + 500;
            setTimeout(() => {
                socket.emit('spawn-fruit');                
            }, time);
        }
    })
    socket.on('update-score',(data)=>{
        let fruit = document.querySelector(`#${data.id}`);
        fruit.parentNode.removeChild(fruit);
        rivalScore = data.score;
        document.querySelector('#oppo-score').innerHTML = rivalScore;
    })
    
    if(host){
        let timeToSpawnBomb = Math.floor((Math.random() * (15000 - 5000 + 1)) + 5000);
        setTimeout(() => {
            socket.emit('spawn-bomb');
        }, timeToSpawnBomb);
    }

    socket.on('add-bomb',(bombInfo)=>{
        let bomb = document.createElement('div');
        bomb.className = 'bomb';
        bomb.id = bombInfo.id;
        bomb.style.top = bombInfo.y+"px";
        bomb.style.left = bombInfo.x+"px";
        gameArea.appendChild(bomb);
            if(host){
            let timeToSpawnBomb = Math.floor((Math.random() * (15000 - 5000 + 1)) + 5000);
            setTimeout(() => {
                socket.emit('spawn-bomb');
            }, timeToSpawnBomb);
        }
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

socket.on('be-host',()=>{
    host = true;
})