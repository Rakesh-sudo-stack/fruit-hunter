var socket = io();

let bgMusic = new Audio("../assets/sound/background-music.mp3");

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
let host = false;
let yrscore;
let opposcore;

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

socket.on('room-not-found',(data)=>{
    if(data.playercount == 0){
        document.querySelector('#party-not-found-text').innerHTML = "Party does not exist.";
        setTimeout(()=>{document.querySelector('#party-not-found-text').innerHTML = '';},2000)
    }else if(data.playercount == 2){
        document.querySelector('#party-not-found-text').innerHTML = "Party is full.";
        setTimeout(()=>{document.querySelector('#party-not-found-text').innerHTML = '';},2000)
    }
});

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

const giveSpeed = () => {
    players.you.speed *= 2;
    setTimeout(() => {
        players.you.speed /= 2;
    }, 7000);
}

const giveSnowflake = () => {
    document.querySelector('#opponent').className = 'frozen';
    setTimeout(() => {
        document.querySelector('#opponent').className = '';
    }, 3000);
    socket.emit('snow-flake-used');
}

socket.on('freeze-opponent',()=>{
    console.log('freeze');
    let curSpeed = players.you.speed;
    players.you.speed = 0;
    document.querySelector('#you').className = 'frozen';
    document.querySelector('#you')
    setTimeout(() => {
        players.you.speed = curSpeed;
        document.querySelector('#you').className = '';
    }, 3000);
})

const giveJumbo = () => {
    players.you.height += 20;
    players.you.width += 20;
    document.querySelector('#you').style.height = players.you.height+'px';
    document.querySelector('#you').style.width = players.you.width+'px';
    socket.emit('jumbo-used');
    setTimeout(() => {
        players.you.height -= 20;
        players.you.width -= 20;
        document.querySelector('#you').style.height = players.you.height+'px';
        document.querySelector('#you').style.width = players.you.width+'px';
    }, 7000);
}

socket.on('jumbo-opponent',()=>{
    players.opponent.height += 20;
    players.opponent.width += 20;
    document.querySelector('#opponent').style.height = players.opponent.height+'px';
    document.querySelector('#opponent').style.width = players.opponent.width+'px';
    setTimeout(() => {
        players.opponent.height -= 20;
        players.opponent.width -= 20;
        document.querySelector('#opponent').style.height = players.opponent.height+'px';
        document.querySelector('#opponent').style.width = players.opponent.width+'px';
    }, 7000);
})

const checkCollision = (item1,item2) => {
    item1Rect = item1.getBoundingClientRect();
    item2Rect = item2.getBoundingClientRect();
    return !((item1Rect.bottom < item2Rect.top) || (item1Rect.top > item2Rect.bottom) || (item1Rect.right < item2Rect.left) || 
    (item1Rect.left > item2Rect.right));
}

const gameOverPage = () => {
    bgMusic.pause();
    document.querySelector('.main-div').style.display = 'none';
    document.querySelector('.container').style.display = 'none';
    document.querySelector('.game-over-page').style.display = 'flex';
    if(host){
        socket.emit('game-over',{score:yourScore,opposcore:rivalScore});
        document.querySelector('#game-over-score').innerHTML = yourScore;
        document.querySelector('#game-over-oppo-score').innerHTML = rivalScore;
        if(yourScore > rivalScore){
            document.querySelector('#score-difference').innerHTML = `You won by ${yourScore - rivalScore} points!`;
        }else if(rivalScore > yourScore){
            document.querySelector('#score-difference').innerHTML = `You lost by ${rivalScore - yourScore} points!`;
        }
    }
}
socket.on('show-score',(scores)=>{
    document.querySelector('#game-over-score').innerHTML = scores.opposcore;
    document.querySelector('#game-over-oppo-score').innerHTML = scores.score;
    console.log(scores)
    if(scores.score > scores.opposcore){
        document.querySelector('#score-difference').innerHTML = `You lost by ${scores.score - scores.opposcore} points!`;
    }else if(scores.opposcore > scores.score){
        document.querySelector('#score-difference').innerHTML = `You won by ${scores.opposcore - scores.score} points!`;
    }
})

const game = () => {
    if(keys.ArrowUp && players.you.y>0){
        players.you.y -= players.you.speed;
    }
    if(keys.ArrowDown && players.you.y<boxRect.height - players.you.height){
        players.you.y += players.you.speed;
    }
    if(keys.ArrowLeft && players.you.x>0){
        players.you.x -= players.you.speed;
    }
    if(keys.ArrowRight && players.you.x<boxRect.width - players.you.width){
        players.you.x += players.you.speed;
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

    let powerups = document.querySelectorAll('.power-up');
    try{
    Array.from(powerups.forEach((powerup)=>{
        if(checkCollision(you,powerup)){
            powerup.parentNode.removeChild(powerup);
            socket.emit('fruit-eaten',{id:powerup.id,score:yourScore})
            if(powerup.classList[1] == 'speed'){
                giveSpeed();
            }else if(powerup.classList[1] == 'snowflake'){
                giveSnowflake();
            }if(powerup.classList[1] == 'jumbo'){
                giveJumbo();
            }
        }
    }))
    }catch(e){}

    document.querySelector('#you').style.top = players.you.y+"px";
    document.querySelector('#you').style.left = players.you.x+"px";
    socket.emit('player-move',{x:players.you.x,y:players.you.y});
    window.requestAnimationFrame(game);
}

const gameOver = () => {
    swal("Game Over!", "Check your score. ");
    players.you.speed  = 0;
    gameOverPage();
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

    let curmin = "2";
    let cursec = "30";
    document.querySelector('#time').innerHTML = `${curmin}:${cursec}`;

    let updateTime = setInterval(() => {
        cursec--;
        if(cursec < 0){
            curmin--;
            cursec = "59";
        }
        if(cursec < 10){
            cursec = `0${cursec}`
        }
        if(curmin == 0 && cursec == 0){
            gameOver();
            clearInterval(updateTime);
        }
        document.querySelector('#time').innerHTML = `${curmin}:${cursec}`;
    }, 1000);

    boxRect = document.querySelector('.game-area').getBoundingClientRect();
    if(host){
        socket.emit('spawn-fruit')
    }
    bgMusic.play();
    socket.on('add-fruit',(fruit)=>{
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
    if(host){
        let timeToSpawnPowerUp = Math.floor((Math.random() * (25000 - 15000 + 1)) + 15000);
        setTimeout(() => {
            socket.emit('spawn-powerup');
        }, timeToSpawnPowerUp);
    }
    socket.on('add-powerup',(powerupInfo)=>{
        let powerup = document.createElement('div');
        powerup.className = `power-up ${powerupInfo.powerup}`;
        powerup.id = powerupInfo.id;
        powerup.style.top = powerupInfo.y+"px";
        powerup.style.left = powerupInfo.x+"px";
        gameArea.appendChild(powerup);
            if(host){
            let timeToSpawnPowerup = Math.floor((Math.random() * (25000 - 15000 + 1)) + 15000);
            setTimeout(() => {
                socket.emit('spawn-powerup');
            }, timeToSpawnPowerup);
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