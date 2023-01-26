let bgMusic = new Audio('../assets/sound/background-music.mp3');

let players = {
    you:{}
}

let score = document.querySelector('#score');
let yourScore = 0;
let points = {
    Apple:150,
    Orange:100,
    Banana:50
}

let keys = {
    ArrowUp : false,
    ArrowDown : false,
    ArrowLeft : false,
    ArrowRight : false
}

const fruits = ['Apple','Banana','Orange'];
let powerups = ['speed','jumbo'];
let gameArea = document.querySelector('.game-area');

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

const spawnFruit  = async () =>{
    let x = Math.floor((Math.random() * 650) - 50);
    let y = Math.floor((Math.random() * 550) - 50);
    let fruit = fruits[Math.floor(Math.random() * 3)];
    let id = generateRandomID(10);
    let myfruit = document.createElement('div');
    myfruit.className = `fruit ${fruit}`;
    myfruit.id = id;
    myfruit.style.top = y+"px";
    myfruit.style.left = x+"px";
    gameArea.appendChild(myfruit);
    let time = Math.floor(Math.random() * (1500 - 500 + 1)) + 500;
    setTimeout(() => {
        spawnFruit();               
    }, time);
}

const spawnBomb = async () => {
    let x = Math.floor((Math.random() * 650) - 50);
    let y = Math.floor((Math.random() * 550) - 50);
    let id = generateRandomID(10);
    let bomb = document.createElement('div');
    bomb.className = 'bomb';
    bomb.id = id;
    bomb.style.top = y+"px";
    bomb.style.left = x+"px";
    gameArea.appendChild(bomb);
    let timeToSpawnBomb = Math.floor((Math.random() * (15000 - 5000 + 1)) + 5000);
    setTimeout(() => {
        spawnBomb();
    }, timeToSpawnBomb);
}

const spawnPowerUp = async () => {
    let x = Math.floor((Math.random() * 650) - 50);
    let y = Math.floor((Math.random() * 550) - 50);
    let powerup = powerups[Math.floor(Math.random() * 2)];
    let id = generateRandomID(10);
    let mypowerup = document.createElement('div');
    mypowerup.className = `power-up ${powerup}`;
    mypowerup.id = id;
    mypowerup.style.top = y+"px";
    mypowerup.style.left = x+"px";
    gameArea.appendChild(mypowerup);
    let timeToSpawnPowerup = Math.floor((Math.random() * (25000 - 15000 + 1)) + 15000);
    setTimeout(() => {
        spawnPowerUp();
    }, timeToSpawnPowerup);
}

const giveSpeed = () => {
    players.you.speed *= 2;
    setTimeout(() => {
        players.you.speed /= 2;
    }, 7000);
}

const giveJumbo = () => {
    players.you.height += 20;
    players.you.width += 20;
    document.querySelector('#you').style.height = players.you.height+'px';
    document.querySelector('#you').style.width = players.you.width+'px';
    setTimeout(() => {
        players.you.height -= 20;
        players.you.width -= 20;
        document.querySelector('#you').style.height = players.you.height+'px';
        document.querySelector('#you').style.width = players.you.width+'px';
    }, 7000);
}

const checkCollision = (item1,item2) => {
    item1Rect = item1.getBoundingClientRect();
    item2Rect = item2.getBoundingClientRect();
    return !((item1Rect.bottom < item2Rect.top) || (item1Rect.top > item2Rect.bottom) || (item1Rect.right < item2Rect.left) || 
    (item1Rect.left > item2Rect.right));
}

const gameOverPage = () => {
    bgMusic.pause();
    document.querySelector('.container').style.display = 'none';
    document.querySelector('.game-over-page').style.display = 'flex';
    document.querySelector('#score-difference').innerHTML = `Your final score is ${yourScore}`;
}

const gameOver = () => {
    swal("Game Over!", "Check your score. ");
    players.you.speed  = 0;
    gameOverPage();
}

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
        }
    }))
    }catch(e){}

    let powerups = document.querySelectorAll('.power-up');
    try{
    Array.from(powerups.forEach((powerup)=>{
        if(checkCollision(you,powerup)){
            powerup.parentNode.removeChild(powerup);
            if(powerup.classList[1] == 'speed'){
                giveSpeed();
            }if(powerup.classList[1] == 'jumbo'){
                giveJumbo();
            }
        }
    }))
    }catch(e){}

    document.querySelector('#you').style.top = players.you.y+"px";
    document.querySelector('#you').style.left = players.you.x+"px";
    window.requestAnimationFrame(game);
}

const startGame = () => {
    window.requestAnimationFrame(game);

    let gameArea = document.querySelector('.game-area');

    let el1 = document.createElement('div');
    el1.id = 'you';
    gameArea.appendChild(el1);

    let yourpos = document.querySelector('#you').getBoundingClientRect();

    players.you = {
        height:yourpos.height,
        width:yourpos.width,
        speed:5,
        x:yourpos.x,
        y:yourpos.y
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
    spawnFruit();
    
    let timeToSpawnBomb = Math.floor((Math.random() * (15000 - 5000 + 1)) + 5000);
    setTimeout(() => {
        spawnBomb();
    }, timeToSpawnBomb);

    let timeToSpawnPowerUp = Math.floor((Math.random() * (25000 - 15000 + 1)) + 15000);
    setTimeout(() => {
        spawnPowerUp();
    }, timeToSpawnPowerUp);
}

function prepareToStart(){
    document.querySelector('.container').style.display = "flex";
    setTimeout(() => {
        document.querySelector('.count-down').style.display='none';
        startGame();
    }, 4000);
}

prepareToStart();