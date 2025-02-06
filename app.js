const lockscreen = document.getElementById('lockscreen');
const rotatePrompt = document.getElementById('rotatePrompt');

function instructionsDisplay() {
  if(lockscreen.style.display == 'flex') {;
    lockscreen.style.display = 'none';
  } else {
    lockscreen.style.display = 'flex';
  }
}

const cellTypes = {
  'Coronavirus': ['home', 'humans', 'droplets', 'mask', 'wash hands', 'free', 'fatigue', 'fever', 'rest', 'virus', 'home'],
  'Rabies': ['home', 'animals', 'bite', 'education', 'avoid animals', 'free', 'fever', 'pain', 'wound cleaning', 'virus', 'home'],
  'Borreliosis': ['home', 'arthropod', 'bite', 'clothing', 'repellent', 'free', 'rash', 'fever', 'medication', 'microorganism', 'home'],
  'Malaria': ['home', 'arthropod', 'bite', 'net', 'repellent', 'free', 'vomitting', 'fever', 'medication', 'microorganism', 'home'],
  'Influenza': ['home', 'humans', 'droplets', 'mask', 'wash hands', 'free', 'fever', 'cough', 'rest', 'virus', 'home']
  // 'Yellow Fever': ['home', 'arthropod', 'bite', 'net', 'repellent', 'free', 'vomitting', 'fever', 'rehydration', 'virus', 'home'],
  // 'American Tryps': ['home', 'arthropod', 'bite', 'tidy house', 'repellent', 'free', 'vomitting', 'fever', 'drugs', 'microorganism', 'home'],
  // 'Ebola': ['home', 'humans', 'fluids', 'cook food', 'wash hands', 'free', 'vomitting', 'fever', 'rehydration', 'virus', 'home'],
  // 'Cholera': ['home', 'humans', 'water', 'cook food', 'wash hands', 'free', 'diarrhoea', 'vomitting', 'rehydration', 'microorganism', 'home'],
  // 'Dengue Fever': ['home', 'arthropod', 'bite', 'net', 'repellent', 'free', 'pain', 'vomitting', 'rest', 'virus', 'home'],
  // 'African Tryps': ['home', 'arthropod', 'bite', 'net', 'repellent', 'free', 'fatigue', 'fever', 'drugs', 'microorganism', 'home']
};

//define board size (i.e. number of cells in grid), cell types (i.e. diseases, symptoms, etc.) and other game parameters
let currentClientWidth;
const grid = document.getElementById('grid');
const rows = 5;
const cols = 11;
const cells = rows * cols;
const headers = ['Home', 'Vector', 'Transmission', 'Prevention', 'Free', 'Symptoms', 'Treatment', 'Agent', 'Home'];
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
//get a single array with unique cell types
const allCellTypes = [];
for (i = 0; i < rows; i++) {
  cellTypes[bugs[i]].map(e => allCellTypes.push(e));
}
const uniqueCellTypes = [...new Set(allCellTypes)];
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

//game stats
const statsMovesLeft = document.getElementsByClassName('movesLeft');
const statsPlayer1 = document.getElementById('statsPlayerOne');
const statsPlayer2 = document.getElementById('statsPlayerTwo');
const player1 = document.getElementById('playerOne');
const player2 = document.getElementById('playerTwo');

let screenOrientation = screen.orientation.type.substring(0,9);
if (screenOrientation !== 'landscape') {
  rotatePrompt.style.display = 'flex';
} else {
  //create game board and markers only if device is in landscape mode
  rotatePrompt.style.display = 'none';
  buildGame();
}

screen.orientation.addEventListener('change', function() {
  screenOrientation = screen.orientation.type.substring(0,9);
  if (screenOrientation !== 'landscape') {
    document.getElementById('gameArea').style.display = 'none';
    rotatePrompt.style.display = 'flex';
  } else {
    document.getElementById('gameArea').style.display = 'flex';
    rotatePrompt.style.display = 'none';
    }
    if (currentClientWidth === undefined) {
      //create game board and markers only if device is in landscape mode
      location.reload(); //reload page to get correct grid size
      buildGame();
  }
});

function buildGame() {
  //create grid cells and add event listener for mouse click... clickCell() function
  let j = 0;
  let k = 0;
  currentClientWidth = grid.clientWidth;
  let cellWidth = Math.round((currentClientWidth - 110) / cols);
  let cellWidthPx = cellWidth + 'px';
  for (i = 0; i < cells; i++) {
    let cell = document.createElement('div');
    cell.id = i;
    cell.className = 'cell';
    cell.style.width = cellWidthPx;
    cell.style.height = cellWidthPx;
    let cellText = document.createElement('div');
    cellText.className = 'cellText';
    if (firstCol.indexOf(i) > 0) {
      j++;
      k = 0;
    }
    cell.setAttribute('data-rownumber', j);
    cell.setAttribute('data-celltype', uniqueCellTypes.indexOf(cellTypes[bugs[j]][k]));
    if (homeCells.indexOf(i) > -1) {
      cell.textContent = '?';
      cell.className += ' cellHome';
    }
    else {
      cell.className += ' cellOther';
      cell.style.backgroundImage = 'url("assets/icons/' + cellTypes[bugs[j]][k] + '.svg")';
      cellText.textContent = cellTypes[bugs[j]][k];
      cell.addEventListener('touchstart', showCellText);
    }
    grid.appendChild(cell);
    cell.appendChild(cellText);
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
    if (ht === 'Prevention' || ht === 'Symptoms') {
      header.style.width = cellWidth * 2 + 8 + 'px';
    } else {
      header.style.width = cellWidth + 'px';
    }
    header.textContent = ht;
    columnHeaders.appendChild(header);
  }

  //create markers
  let markerWidth = Math.round(((currentClientWidth - 110) / cols) / 2) + 'px';
  for (i = 0; i < totalMarkers; i++) {
    let token = document.createElement('div');
    token.id = 'm' + i;
    token.className = 'token';
    token.style.width = markerWidth;
    token.style.height = markerWidth;
    let colour = i < halfOfMarkers ? 'rgba(255, 118, 0, 0.8)' : 'rgba(0, 108, 255, 0.8)';
    let border = i < halfOfMarkers ? '2px solid rgba(255, 118, 0, 1)' : '2px solid rgba(0, 108, 255, 1)';
    let start = i < halfOfMarkers ? homeCells.slice(0, rows) : homeCells.slice(rows, rows*2);
    let end = i < halfOfMarkers ? homeCells.slice(rows, rows*2) : homeCells.slice(0, rows);
    token.style.backgroundColor = colour;
    token.style.border = border;
    //initial (home) position of each marker
    let homeCell = homeCells[i];
    let cell = document.getElementById(homeCell);
    let x = cell.offsetLeft + Math.round(cell.offsetWidth / 4);
    let y = cell.offsetTop + Math.round(cell.offsetHeight / 4);
    token.style.left = x + 'px';
    token.style.top = y + 'px';
    //make marker clickable and add to grid
    token.style.cursor = 'pointer';
    token.addEventListener('click', clickMarker);
    grid.appendChild(token);
    let markerObject = {marker:token, currentCell:homeCell, prevCell:homeCell, tokenColour:colour, startCells:start, endCells:end};
    markers.push(markerObject);
  }
}

//touch screens only: show cell text when touching cell
function showCellText(e) {
  let cellText = e.target.children[0];
  cellText.style.display = 'flex';
  setTimeout(function() {
    cellText.style.display = 'none';
  }, 1000)
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
  activeMarker = e.target;
  //determine which marker and which player was clicked
  if (activePlayer != undefined) {
    let prevActiveMarker = markers[z].marker;
    if (prevActiveMarker.id != activeMarker.id) {
      removeCellClickEvent();
      prevActiveMarker.style.backgroundColor = markers[z].tokenColour;
    }
    z = Number(activeMarker.id.charAt(1));
  } else {
    z = Number(activeMarker.id.charAt(1));
    if (z < halfOfMarkers) {
      activePlayer = 1;
      removeMarkerClickEvent(halfOfMarkers, totalMarkers);
      player1.style.textDecoration = 'underline';
      statsPlayer1.style.visibility = 'visible';
    } else {
      activePlayer = 2;
      removeMarkerClickEvent(0, halfOfMarkers);
      player2.style.textDecoration = 'underline';
      statsPlayer2.style.visibility = 'visible';
    }
  }
  //determine which moves are possible for the given player and marker
  activeMarker.style.backgroundColor = z < halfOfMarkers ? 'rgba(255, 118, 0, 1)' : 'rgba(0, 108, 255, 1)';
  let m = (maxMoves - moveCount);
  let moves = allowedMoves['p' + activePlayer];
  let currentCellType = document.getElementById(markers[z].currentCell).getAttribute('data-celltype');
  for (i = 0; i < 3; i++) {
    //if on 'free' or 'start (i.e. home)'cell can move to any other unoccupied cell in same column
    if (currentCellType === '5' && i != 0) { //type '5' is a 'free' (i.e. switch) cell (depends on number of columns!)
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
          if (cellType === '0') { //break "nextCell" loop if cellType is a 'home' cell (type '0')
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
  let clickedCell = e.target;
  let cellA = markers[z].currentCell;
  markers[z].prevCell = cellA;
  let cellB = Number(clickedCell.id);
  markers[z].currentCell = cellB;
  let targetX = clickedCell.offsetLeft + Math.round(clickedCell.offsetWidth / 4);
  let targetY = clickedCell.offsetTop + Math.round(clickedCell.offsetHeight / 4);
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
      activeMarker.style.backgroundColor = markers[z].tokenColour;
      occupiedCells.splice(occupiedCells.indexOf(cellA), 1, cellB);
      //calculate number of moves it takes to get to clicked cell
      let newMoves = null;
      let cellDiff = Math.abs(cellB - cellA);
      //if moving within 'free' column count as 1 move only
      if (document.getElementById(cellA).getAttribute('data-celltype') === '5' && clickedCell.getAttribute('data-celltype') === '5') {
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
      for (b = 0; b < 2; b++) {
        statsMovesLeft[b].textContent = maxMoves - moveCount;
      }
      //check if clicked cell is an end cell and marker is not moving within start cells and...
      if (markers[z].endCells.indexOf(markers[z].currentCell) >= 0 && markers[z].endCells.indexOf(markers[z].prevCell) === -1) {
        //reveal bug name
        activeRow = Number(clickedCell.getAttribute('data-rownumber'));
        for (i = 0; i < cols; i++) {
          let cell = document.getElementById(i + (activeRow * cols));
          cell.style.backgroundColor = 'rgb(220, 243, 239)';
          cell.className += ' cellFlash';
          if (i === 0 || i === cols - 1) {
            cell.style.fontSize = '100%';
            cell.textContent = bugs[activeRow];
          }
        }
        //add marker to list of unmoveable markers in subsequent turns
        markersAtEnd.push(z);
        //add points
        updatedPoints = ++points['p' + activePlayer];
        document.getElementById('p' + activePlayer + 'Points').textContent = updatedPoints;
        //check if points = maxPoints and end game
        if (updatedPoints === maxPoints) {
          removeMarkerClickEvent(0, totalMarkers);
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
}

function swapPlayers() {
  if (activePlayer === 1) {
    removeMarkerClickEvent(0, halfOfMarkers);
    addMarkerClickEvent(halfOfMarkers, totalMarkers);
    player1.style.textDecoration = 'none';
    player2.style.textDecoration = 'underline';
    statsPlayer1.style.visibility = 'hidden';
    statsPlayer2.style.visibility = 'visible';
    activePlayer = 2;
  } else {
    removeMarkerClickEvent(halfOfMarkers, totalMarkers);
    addMarkerClickEvent(0, halfOfMarkers);
    player1.style.textDecoration = 'underline';
    player2.style.textDecoration = 'none';
    statsPlayer1.style.visibility = 'visible';
    statsPlayer2.style.visibility = 'hidden';
    activePlayer = 1;
  }
  moveCount = 0;
  for (i = 0; i < 2; i++) {
    statsMovesLeft[i].textContent = maxMoves;
  }
}
