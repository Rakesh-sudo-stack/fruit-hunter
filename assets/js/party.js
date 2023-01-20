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
})

socket.on('join-game',(code)=>{
    console.log(`Joined game ${code}`);
})