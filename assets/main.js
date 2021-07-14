
// import { io } from '../node_modules/socket.io-client/wrapper.mjs'
// import { uniqueNamesGenerator, names } from '../node_modules/unique-names-generator/dist/index.m.js';

// user name
// const userName = uniqueNamesGenerator({dictionaries: [names]});



const searchParams = new URLSearchParams(window.location.search)


const socket = io();
const userName = prompt("What's your name", `User-${socket[0]}`)

console.log(userName);

let userPos = 1;
let userScores = [0,0];
let gameMap = [];

// socket connection
const room = searchParams.has('room') ? searchParams.get('room') : Math.floor(Math.random() * 10000);
const roomElement = document.getElementById('roomid');

roomElement.innerHTML = `ROOM ${room}`;

if (!searchParams.has('room')) {
  searchParams.set('room', room)
  const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
  history.pushState(null, '', newRelativePathQuery);
}

// const socket = io('http://localhost:9999');

socket.emit('join-room', room, userName);

// when friend join room
socket.on('room-full', ()=>{
  alert('room full');
  window.location = window.location.pathname;
})
socket.on('friend-joined', (user, pos, users)=> {
  console.log(user,'joined');

  if (users.length > 2 && user === userName) {
    alert('room full');
    window.location(location.toString())
    return;
  }

  const player1 = document.getElementById('player-1-name');
  const player2 = document.getElementById('player-2-name');

  if (user === userName) {
    userPos = pos;
  }

  if (pos === 1) {
    player1.innerHTML = user;
  } else {
    player1.innerHTML = users[0];
    player2.innerHTML = users[1];
  }
});

socket.on('game-started', (gmap) => {
  console.log('game started');
  onGameStart();

  gameMap = gmap;
  tiles.forEach((el, idx) => {
    el.innerHTML = gameMap[idx]
  })
})

socket.on("number-circled-x", (pos, aimedVal) => {
  increaseNextVal();

  const target = tiles[gameMap.findIndex(el => el === aimedVal)]

  target.classList.add('solved')
  target.classList.add(`player-${pos}`)

  userScores[pos-1]+= parseInt(aimedVal);

  setScores();
})

const setScores = () => {
  const player1Score = document.getElementById("player-1-score");
  const player2Score = document.getElementById("player-2-score");

  player1Score.innerHTML = userScores[0];
  player2Score.innerHTML = userScores[1];
}

const btnStart = document.querySelector(".start-btn");
const boxNext = document.querySelector("#next-number-container");
const timerM = document.querySelector("#timer-m");
const timerS = document.querySelector("#timer-s");
const timerSSS = document.querySelector("#timer-sss");
const panelElement = document.querySelector(".panel");
const tiles = document.querySelectorAll(".tile");
const nextValElement = document.querySelector("#next-number");
const gridSize = [10, 10];
const array100 = Array.from({ length: 100 }, (_, index) => index + 1);
let nextVal = 1;
console.log(array100);
let coordinateMap = [];
let timerVal = 0;
let timer;
let gameStarted = false;

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("tile")) {
    const aimedVal = e.target.innerHTML.valueOf();
    if (aimedVal == nextVal) {
      socket.emit("number-circled", room, userPos, aimedVal)
    }
  }

  if(e.target.classList.contains("invite")) {
    window.navigator.clipboard.writeText(window.location.toString()).then(()=>{
      e.target.innerHTML = 'Link Room Copied!'
    })
  }
});

const increaseNextVal = () => {
  nextVal++;
  nextValElement.innerHTML = nextVal;
}

const addPlayerScore = (pos, score) => {
  userScores[pos-1]+= score;
}

btnStart.addEventListener("click", () => {
  onGameStart();
  gameMap = shuffe();
  socket.emit("game-start", room, gameMap);
})

const onGameStart = () => {
  gameStarted = true;
  nextValElement.innerHTML = nextVal;
  // start timer
  timer = setInterval(() => {
    timerVal++;
    const seconds = Math.floor(timerVal / 100);
    const displaySeconds = seconds > 59 ? seconds % 60 : seconds;
    timerS.innerHTML = displaySeconds.toString().padStart(2, "0");
    const mins = Math.floor(seconds / 60);
    timerM.innerHTML = mins.toString().padStart(2, "0");
    timerSSS.innerHTML = (timerVal % 100).toString().padStart(2, "0");
  }, 10);
  // call next number (first)
  // hide btnStart
  btnStart.classList.add("started");
  boxNext.classList.add("started");
}

function shuffe() {
  for (let i = 99; i >= 0; i--) {
    const rand = Math.floor(Math.random() * i) | 0;
    const picked = array100.splice(rand, 1);
    tiles[i].innerHTML = picked;
  }

  const randtile = tiles[Math.floor(Math.random() * 100)];
  const firstTile = tiles[0];
  const temp = randtile.innerHTML;
  randtile.innerHTML = firstTile.innerHTML;
  firstTile.innerHTML = temp;

  const gmap = []
  tiles.forEach(element => {
    gmap.push(element.innerHTML)
  });
  return gmap
}

function setCoordinateMap() {
  coordinateMap = [];
  for (let i = 0; i < gridSize[0]; i++) {
    for (let j = 0; j < gridSize[1]; j++) {
      coordinateMap.push({
        x: i,
        y: j,
        translate: `translate(calc(3rem*${i}),calc(3rem*${j}))`,
      });
    }
  }
  coordinateMap.pop();
}

function addPieces() {
  const percentageX = 100 / (gridSize[0] - 1);
  const percentageY = 100 / (gridSize[1] - 1);
  for (let index = 0; index < gridSize[0] * gridSize[1]; index++) {
    const div = document.createElement("div");
    const { y, x } = fromTileIndexToPosition(index);
    const pos = coordinateMap.find((c) => (c.x === x) & (c.y === y));
    console.log(y, x);

    div.id = index;
    if (gridSize[0] * gridSize[1] - 1 !== index) {
      const xPos = percentageX * (index % gridSize[0]);
      const yPos = percentageY * Math.floor(index / gridSize[0]);
      div.setAttribute("data-xIndex", x);
      div.setAttribute("data-yIndex", y);
      div.style.transform = pos.translate;
      // div.className = `tile x${x} y${y}`;
      div.className = `tile`;
      panelElement.appendChild(div);
    }
  }
}

function fromTileIndexToPosition(tileIndex) {
  const rowIdx = Math.ceil((tileIndex + 1) / gridSize[0]) - 1;
  const colIdx = tileIndex % gridSize[0];
  return {
    y: rowIdx,
    x: colIdx,
  };
}

function shuffleTiles() {
  let mapCor = [...coordinateMap];

  for (let i = panelElement.children.length - 1; i >= 0; i--) {
    const rand = Math.floor(Math.random() * i - 1) | 0;
    const pos = mapCor.splice(rand, 1)[0];
    moveTileToXY(panelElement.children[i], pos);
  }
}
