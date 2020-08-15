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
      nextVal++;
      nextValElement.innerHTML = nextVal;
      e.target.classList.add("solved");
    }
  }
});

btnStart.addEventListener("click", () => {
  gameStarted = true;
  shuffe();
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
});

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
