const rotatePrompt = document.getElementById('rotatePrompt');
const startScreen = document.getElementById('startScreen');
const gameArea = document.getElementById('gameArea');
const lockScreen = document.getElementById('lockScreen');
const folder = document.getElementById('folder');
const folderImage = document.getElementById('folderImage');
const folderTitle = document.getElementById('folderTitle');
const folderText = document.getElementById('folderText');
let blockCellInfo = false;
const bugInfoBoard = document.getElementById('bugInfoBoard');
const endScreen = document.getElementById('endGame');
//read and load text for instructions and popup folders with icon information from json file
let data;
async function fetchFolderText() {
  const response = await fetch('./bugInfo.json');
  data = await response.json();
  return data;
}
fetchFolderText().then(data => {
  data;
});

const cellTypes = {
  'coronavirus': ['home', 'humans', 'droplets', 'mask', 'wash hands', 'free', 'fatigue', 'fever', 'rest', 'virus', 'home'],
  'rabies': ['home', 'animals', 'bite', 'education', 'avoid animals', 'free', 'fever', 'pain', 'wound cleaning', 'virus', 'home'],
  'borreliosis': ['home', 'arthropod', 'bite', 'clothing', 'repellent', 'free', 'rash', 'fever', 'medication', 'microorganism', 'home'],
  'malaria': ['home', 'arthropod', 'bite', 'net', 'repellent', 'free', 'vomiting', 'fever', 'medication', 'microorganism', 'home'],
  'influenza': ['home', 'humans', 'droplets', 'mask', 'wash hands', 'free', 'fever', 'cough', 'rest', 'virus', 'home']
  // 'Yellow Fever': ['home', 'arthropod', 'bite', 'net', 'repellent', 'free', 'vomiting', 'fever', 'rehydration', 'virus', 'home'],
  // 'American Tryps': ['home', 'arthropod', 'bite', 'tidy house', 'repellent', 'free', 'vomiting', 'fever', 'drugs', 'microorganism', 'home'],
  // 'Ebola': ['home', 'humans', 'fluids', 'cook food', 'wash hands', 'free', 'vomiting', 'fever', 'rehydration', 'virus', 'home'],
  // 'Cholera': ['home', 'humans', 'water', 'cook food', 'wash hands', 'free', 'diarrhoea', 'vomiting', 'rehydration', 'microorganism', 'home'],
  // 'Dengue Fever': ['home', 'arthropod', 'bite', 'net', 'repellent', 'free', 'pain', 'vomiting', 'rest', 'virus', 'home'],
  // 'African Tryps': ['home', 'arthropod', 'bite', 'net', 'repellent', 'free', 'fatigue', 'fever', 'drugs', 'microorganism', 'home']
};

//define board size (i.e. number of cells in grid), cell types (i.e. diseases, symptoms, etc.) and other game parameters
let currentClientWidth;
const grid = document.getElementById('grid');
const rows = 5;
const cols = 11;
const cells = rows * cols;
const headers = ['', 'Source', 'Spread', 'Prevent', '', 'Signs', 'Treat', 'Germ', ''];
const homeCells = []; //index of 'home' cells (i.e. start and end cells)
for (i = 0; i < rows; i++) {
  homeCells.splice(i, 0, cols * i); //player 1 home cells
  homeCells.push(cols * i + (cols - 1)); //player 2 home cells
}
const firstCol = homeCells.slice(0, 5);
let bugs = Object.keys(cellTypes);
//randomise order of rows/bugs (so layout of board is different for each game)
bugs = shuffle(bugs);
function shuffle(array) {
  let tmp, current;
  let top = bugs.length - 1;
  while (top > 0) {
    current = Math.floor(Math.random() * (top + 1));
    tmp = array[current];
    array[current] = array[top];
    array[top] = tmp;
    --top;
  }
  return array;
}

let occupiedCells = [...homeCells];
let activeCells = [];
const markers = [];
const markersAtEnd = []; //markers that have reached home cells and can no longer move
const totalMarkers = 10;
const halfOfMarkers = totalMarkers/2;
let activePlayer;
let activeMarker;
let z; //active marker index
const maxMoves = 3;
let moveCount = 0;
const allowedMoves = { //no diagonal moves
  p1: [
    [1, 2, 3], //forward
    [cols, cols*2, cols*3], //up
    [-cols, -cols*2, -cols*3] //down
  ],
  p2: []
};
for (i = 0; i < maxMoves; i++) {
  let _p2 = allowedMoves.p1[i].map(e => e * -1);
  allowedMoves.p2.push(_p2);
}
const maxPoints = 3;
let updatedPoints = 0;
const points = {
  p1: 0,
  p2: 0
};
const bugsFound = {
  p1: [],
  p2: []
}

//game stats
const playerOne = document.getElementById('playerOne');
const playerTwo = document.getElementById('playerTwo');
const p1Moves = document.getElementById('p1Moves');
const p2Moves = document.getElementById('p2Moves');
let movesLeft = 3;

//when first arriving at page, check screen orientation and show appropriate screen
let screenOrientation = screen.orientation.type.substring(0,9);
if (screenOrientation === 'landscape') {
  //create game board and markers only if device is in landscape mode
  rotatePrompt.style.display = 'none';
  startScreen.style.display = 'flex';
}

const screenWidth = window.screen.width;
//for adjusting start position of tokens
let tokenOffset = 0;
//for "let's play" button
function playGame() {
  if (screenWidth < 1280) {
    //use fullscreen for smaller devices (i.e. smartphones and tablets)
    document.body.requestFullscreen();
    tokenOffset = (a) => {
      return Math.round(a / 2.5);
    }
    document.addEventListener('fullscreenchange', function() {
      if (document.fullscreenElement) {
        document.getElementById('fullscreenButton').style.display = 'none';
      } else {
        document.getElementById('fullscreenButton').style.display = 'block';
      }
    });
  }
  startScreen.style.display = 'none';
  gameArea.style.display = 'flex';
  buildGame();
  instructionsDisplay();
}

function fullscreen() {
  document.body.requestFullscreen();
}

screen.orientation.addEventListener('change', function() {
  screenOrientation = screen.orientation.type.substring(0,9);
  if (screenOrientation !== 'landscape') {
    // startScreen.style.display = 'none';
    // lockScreen.style.display = 'none';
    // gameArea.style.display = 'none';
    rotatePrompt.style.display = 'flex';
  } else {
    if (currentClientWidth === undefined) {
      //create game board and markers only if device is in landscape mode
      startScreen.style.display = 'flex';
    } else {
      gameArea.style.display = 'flex';
    }
    rotatePrompt.style.display = 'none';
  }
});

//build the game after clicking "let's play!"
function buildGame() {
  //create grid cells and add event listener for mouse click... clickCell() function
  let j = 0;
  let k = 0;
  currentClientWidth = grid.clientWidth;
  let cellWidth = Math.round((currentClientWidth - 140) / cols);
  let cellWidthPx = cellWidth + 'px';
  for (i = 0; i < cells; i++) {
    let cell = document.createElement('div');
    cell.id = i;
    cell.className = 'cell';
    cell.style.width = cellWidthPx;
    cell.style.height = cellWidthPx;
    let cellMask = document.createElement('div');
    cellMask.className = 'cellMask';
    if (firstCol.indexOf(i) > 0) {
      j++;
      k = 0;
    }
    cell.setAttribute('data-rownumber', j);
    let cellType = cellTypes[bugs[j]][k];
    cell.setAttribute('data-celltype', cellType);
    if (homeCells.indexOf(i) > -1) {
      cell.style.backgroundColor = k === 0 ? 'rgb(204, 219, 228)' : 'rgb(243, 226, 214)';
    }
    else {
      let iconURL = 'assets/icons/' + bugs[j] + '/' + cellType + '.svg';
      cell.setAttribute('data-icon', iconURL);
      cell.style.backgroundImage = 'url("' + iconURL + '")';
      cell.addEventListener('click', showCellInfo);
    }
    grid.appendChild(cell);
    cell.appendChild(cellMask);
    k++;
  }

  //create headers for grid
  //adjust width of header based on number of columns in a given category
  const columnHeaders = document.getElementById('columnHeaders');
  const headersLength = headers.length;
  for (i = 0; i < headersLength; i++) {
    let header = document.createElement('div');
    header.id = 'h' + i;
    header.className = 'headerText';
    let ht = headers[i];
    if (ht === 'Prevent' || ht === 'Signs') {
      header.style.width = cellWidth * 2 + 17 + 'px';
    } else {
      header.style.width = cellWidth + 3 + 'px';
    }
    header.textContent = ht;
    columnHeaders.appendChild(header);
  }

  //create markers
  let markerWidth = Math.round((currentClientWidth - 140) / cols) + 'px';
  for (i = 0; i < totalMarkers; i++) {
    let token = document.createElement('div');
    token.id = 'm' + i;
    token.className = 'token';
    token.style.width = markerWidth;
    token.style.height = markerWidth;
    let border = i < halfOfMarkers ? 'rgb(0, 114, 178)' : 'rgb(213, 94, 0)';
    let start = i < halfOfMarkers ? homeCells.slice(0, rows) : homeCells.slice(rows, rows*2);
    let end = i < halfOfMarkers ? homeCells.slice(rows, rows*2) : homeCells.slice(0, rows);
    let useToken = i < halfOfMarkers ? 'token_01' : 'token_02';
    token.style.backgroundImage = 'url("assets/other/' + useToken + '.svg")';
    //initial (home) position of each marker
    let homeCell = homeCells[i];
    let cell = document.getElementById(homeCell);
    let x = cell.offsetLeft;
    if (tokenOffset !== 0) {
      x += tokenOffset(cell.offsetWidth);
    }
    let y = cell.offsetTop
    token.style.left = x + 'px';
    token.style.top = y + 'px';
    //make marker clickable and add to grid
    token.style.cursor = 'pointer';
    token.addEventListener('click', clickMarker);
    grid.appendChild(token);
    let markerObject = {marker:token, tokenBorder:border, currentCell:homeCell, prevCell:homeCell, startCells:start, endCells:end};
    markers.push(markerObject);
  }
}

function instructionsDisplay() {
  folderTitle.textContent = data['folderText'][0]['howto'][0]['title'];
  folderImage.src = 'assets/icons/influenza/virus.svg';
  folderText.innerHTML = data['folderText'][0]['howto'][0]['text'];
  lockScreen.style.display = 'flex';
}

//show cell information when clicking cell
//only if no active marker!
function showCellInfo(e) {
  if (blockCellInfo === false) {
    let clickedIcon = e.target;
    let cellName = clickedIcon.getAttribute('data-celltype');
    folderTitle.textContent = cellName;
    folderImage.src = clickedIcon.getAttribute('data-icon');
    folderText.innerHTML = data['folderText'][0][cellName][0]['text'];
    lockScreen.style.display = 'flex';
  }
}

function closeFolder() {
  lockScreen.style.display = 'none';
  folderTitle.textContent = '';
  folderImage.src = '';
}

function closeBugInfo() {
  lockScreen.style.display = 'none';
  bugInfoBoard.style.display = 'none';
  folder.style.display = 'block';
}

function endOfGame() {
  // removeMarkerClickEvent(0, totalMarkers);
  let winner = activePlayer === 1 ? 'one' : 'two';
  document.getElementById('winnerText').textContent = 'Player ' + winner + ' wins!';
  for (i = 0; i < maxPoints; i++) {
    let useBug = bugsFound['p' + activePlayer][i];
    let bugIcon = document.createElement('div');
    bugIcon.className = 'bugIcon';
    bugIcon.style.backgroundImage = 'url("assets/icons/' + useBug + '.svg")';
    bugIcon.addEventListener('click', function() { finalBugInfo(useBug) }, false);
    let bugName = document.createElement('div');
    bugName.className = 'bugName';
    bugName.textContent = useBug;
    document.getElementById('endGameIcons').appendChild(bugIcon);
    document.getElementById('endGameBugNames').appendChild(bugName);
  }
  bugInfoBoard.style.display = 'none';
  endScreen.style.display = 'flex';
}

function finalBugInfo(a) {
  bugInfoBoard.style.backgroundImage = 'url("assets/other/' + a + '.svg")';
  endScreen.style.display = 'none';
  document.getElementById('closeButton2').onclick = backToEndGame;
  bugInfoBoard.style.display = 'block';
}

function backToEndGame() {
  bugInfoBoard.style.display = 'none';
  endScreen.style.display = 'flex';
}

function restartGame() {
  location.reload(); //reload page
}

//remove click events from all cells (when clicking on marker and after moving marker)
function removeCellClickEvent() {
  for (i = 0; i < activeCells.length; i++) {
    let cell = document.getElementById(activeCells[i]);
    cell.removeEventListener('click', clickCell);
    cell.style.cursor = 'default';
  }
  activeCells = [];
}

//add click events to active player's markers (after completing a move)
function addMarkerClickEvent(firstMarker, lastMarker) {
  for (i = firstMarker; i < lastMarker; i++) {
    if (markersAtEnd.indexOf(i) === -1) {
      let token = document.getElementById('m' + i);
      token.addEventListener('click', clickMarker);
      token.style.cursor = 'pointer';
    }
  }
}

//remove click events from active player's markers (e.g. when clicking on cell to move marker)
function removeMarkerClickEvent(firstMarker, lastMarker) {
  for (i = firstMarker; i < lastMarker; i++) {
    if (markersAtEnd.indexOf(i) === -1) {
      let token = document.getElementById('m' + i);
      token.removeEventListener('click', clickMarker);
      token.style.cursor = 'default';
    }
  }
}

//add click event to required cells when clicking on marker
function clickMarker(e) {
  blockCellInfo = true; //blocks cell info popup from appearing when clicking cell to move token
  activeMarker = e.target;
  //determine which marker and which player was clicked
  if (activePlayer != undefined) {
    let prevActiveMarker = markers[z].marker;
    if (prevActiveMarker.id != activeMarker.id) {
      removeCellClickEvent();
      prevActiveMarker.style.borderColor = 'transparent';
    }
    z = Number(activeMarker.id.charAt(1));
  } else {
    z = Number(activeMarker.id.charAt(1));
    if (z < halfOfMarkers) {
      activePlayer = 1;
      removeMarkerClickEvent(halfOfMarkers, totalMarkers);
      playerOne.style.color = 'rgb(0, 0, 0)';
    } else {
      activePlayer = 2;
      removeMarkerClickEvent(0, halfOfMarkers);
      playerTwo.style.color = 'rgb(0, 0, 0)';
    }
  }
  //determine which moves are possible for the given player and marker
  let m = (maxMoves - moveCount);
  let moves = allowedMoves['p' + activePlayer];
  let currentCellType = document.getElementById(markers[z].currentCell).getAttribute('data-celltype');
  activeMarker.style.borderColor = markers[z].tokenBorder;
  for (i = 0; i < 3; i++) {
    //if on 'free' or 'start (i.e. home)'cell can move to any other unoccupied cell in same column
    if (currentCellType === 'free' && i != 0) {
      for (k = 0; k < rows; k++) {
        let cellID = (k * 11) + 5;
        if (occupiedCells.indexOf(cellID) >= 0) {
          continue;
        }
        let cell = document.getElementById(cellID);
        cell.style.cursor = 'pointer';
        cell.addEventListener('click', clickCell);
        activeCells.push(cellID);
      }
      return;
    }
    let subMoves = moves[i];
    nextCell:
    for (j = 0; j < m; j++) {
      let cellID = subMoves[j] + markers[z].currentCell;
      let cell;
      let cellType;
      if (cellID < 0 || cellID >= cells) {
        break;
      }
      if (occupiedCells.indexOf(cellID) >= 0) {
        break;
      } else {
        cell = document.getElementById(cellID);
        cellType = cell.getAttribute('data-celltype');
        if (i === 0) {
          cell.style.cursor = 'pointer';
          cell.addEventListener('click', clickCell);
          activeCells.push(cellID);
          if (cellType === 'home') { //break "nextCell" loop if cellType is a 'home' cell
            break nextCell;
          }
        } else if (currentCellType != cellType) {
          break;
        } else {
          cell.style.cursor = 'pointer';
          cell.addEventListener('click', clickCell);
          activeCells.push(cellID);
        }
      }
    }
  }
}

//move marker by clicking an empty cell (after clicking a marker)
function clickCell(e) {
  removeCellClickEvent();
  if (activePlayer === 1) {
    removeMarkerClickEvent(0, halfOfMarkers);
  } else {
    removeMarkerClickEvent(halfOfMarkers, totalMarkers);
  }
  activeMarker.style.borderColor = 'transparent'; //clear active marker border
  let cellA = markers[z].currentCell;
  document.getElementById(cellA).children[0].style.display = 'none'; //remove fade from current cell
  markers[z].prevCell = cellA;
  let clickedCell = e.target;
  let cellB = Number(clickedCell.id);
  markers[z].currentCell = cellB;
  if (markers[z].startCells.indexOf(cellB) === -1) {
    clickedCell.children[0].style.display = 'flex'; //fade clicked cell if not moving within home cells
  }
  let targetX = clickedCell.offsetLeft;
  let targetY = clickedCell.offsetTop;
  let mm = null;
  let x = activeMarker.offsetLeft;
  let y = activeMarker.offsetTop;
  //for constant speed
  let distanceX = targetX - x;
  let distanceY = targetY - y;
  let distance = Math.round(Math.sqrt(distanceX * distanceX + distanceY * distanceY) / 4);
  let xDiff = distanceX / distance;
  let yDiff = distanceY / distance;
  clearInterval(mm);
  mm = setInterval(frame, 5);
  let i = 0;
  function frame() {
    if (i != distance) {
      i++;
      x += xDiff;
      y += yDiff;
      activeMarker.style.left = x + 'px';
      activeMarker.style.top = y + 'px';
    } else {
      clearInterval(mm);
      occupiedCells.splice(occupiedCells.indexOf(cellA), 1, cellB);
      //calculate number of moves it takes to get to clicked cell
      let newMoves = null;
      let cellDiff = Math.abs(cellB - cellA);
      //if moving within 'free' column count as 1 move only
      if (document.getElementById(cellA).getAttribute('data-celltype') === 'free' && clickedCell.getAttribute('data-celltype') === 'free') {
        newMoves = 1;
      }
      else if (cellDiff % cols === 0) {
        newMoves = cellDiff / cols;
      } else {
        cellA = cellA % cols;
        cellB = cellB % cols;
        newMoves = Math.abs(cellB - cellA);
      }
      moveCount = moveCount + newMoves;
      movesLeft = maxMoves - moveCount;
      if (activePlayer === 1) {
        p1Moves.textContent = movesLeft;
      } else {
        p2Moves.textContent = movesLeft;
      }
      //check if clicked cell is an end cell
      if (markers[z].endCells.indexOf(cellB) >= 0) {
        folder.style.display = 'none';
        let activeRow = Number(clickedCell.getAttribute('data-rownumber'));
        bugInfoBoard.style.backgroundImage = 'url("assets/other/' + bugs[activeRow] + '.svg")';
        bugInfoBoard.style.display = 'block';
        lockScreen.style.display = 'flex';
        //add marker to list of unmoveable markers in subsequent turns
        markersAtEnd.push(z);
        //add points
        updatedPoints = ++points['p' + activePlayer];
        document.getElementById('p' + activePlayer + 'Points').textContent = updatedPoints;
        //add bug to list of bugs found by player
        bugsFound['p' + activePlayer].push(bugs[activeRow]);
        //check if points = maxPoints and end game
        if (updatedPoints === maxPoints) {
          document.getElementById('closeButton2').onclick = endOfGame;
          return;
        }
      }
      if (moveCount === 3 && updatedPoints < maxPoints) {
        swapPlayers();
      } else {
        if (activePlayer === 1) {
          addMarkerClickEvent(0, halfOfMarkers);
        } else {
          addMarkerClickEvent(halfOfMarkers, totalMarkers);
        }
      }
    }
  }
  blockCellInfo = false;
}

function swapPlayers() {
  if (activePlayer === 1) {
    removeMarkerClickEvent(0, halfOfMarkers);
    addMarkerClickEvent(halfOfMarkers, totalMarkers);
    playerOne.style.color = 'rgb(140, 140, 140)';
    playerTwo.style.color = 'rgb(0, 0, 0)';
    activePlayer = 2;
    p2Moves.textContent = maxMoves;
  } else {
    removeMarkerClickEvent(halfOfMarkers, totalMarkers);
    addMarkerClickEvent(0, halfOfMarkers);
    playerOne.style.color = 'rgb(0, 0, 0)';
    playerTwo.style.color = 'rgb(140, 140, 140)';
    activePlayer = 1;
    p1Moves.textContent = maxMoves;
  }
  moveCount = 0;
}
