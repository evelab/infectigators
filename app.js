//define board size (i.e. number of cells in grid), cell types (i.e. diseases, symptoms, etc.) and other game parameters
const grid = document.getElementById('grid');
const rows = 5;
const cols = 11;
const cells = rows * cols;
const headers = ['Home', 'Source', 'Transmission', 'Prevention', 'Free', 'Symptoms', 'Treatment', 'Type', 'Home'];
const homeCells = []; //index of 'home' cells (i.e. start and target cells)
for (i = 0; i < rows; i++) {
  homeCells.splice(i, 0, cols * i); //player 1 home cells
  homeCells.push(cols * i + (cols - 1)); //player 2 home cells
}
const firstCol = homeCells.slice(0, 5);
//cellTypes from diseases.js
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
// const cellsWithBackground = [5, 16, 27, 38, 49]; //THIS IS TEMPORARY - ALL CELLS WILL HAVE BACKGROUNDS
let occupiedCells = [...homeCells];
let activeCells = [];
const markers = [];
const markersAtTarget = []; //markers that have reached home cells and can no longer move
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
statsActivePlayer = document.getElementById('activePlayer');
statsMoves = document.getElementById('moves');

//create grid cells and add event listener for mouse click... clickCell() function
let j = 0;
let k = 0;
let cellWidth = Math.round((grid.clientWidth - 110) / cols);
let cellWidthPx = cellWidth + 'px';
for (i = 0; i < cells; i++) {
  let cell = document.createElement('div');
  cell.id = i;
  cell.className = 'cell';
  cell.style.width = cellWidthPx;
  cell.style.height = cellWidthPx;
  // cell.style.lineHeight = cellWidthPx;
  cell.setAttribute('data-celltype', uniqueCellTypes.indexOf(cellTypes[bugs[j]][k]));
  let cellText = document.createElement('div');
  cellText.className = 'cellText';
  if (firstCol.indexOf(i) > 0) {
    j++;
    k = 0;
  }
  if (homeCells.indexOf(i) > -1) { //THIS IS TEMPORARY - ALL CELLS WILL HAVE BACKGROUNDS
    // cell.className = 'cell';
    cell.textContent = bugs[j];
  // } else if (cellsWithBackground.indexOf(i) > -1) {
  //   cell.className = 'cell ' + cellTypes[bugs[j]][k];
  }
  else {
    // cell.className = 'cell';
    cell.style.backgroundImage = 'url("assets/icons/' + cellTypes[bugs[j]][k] + '.svg")';
    cellText.textContent = cellTypes[bugs[j]][k];
    // cell.className = 'cell ' + cellTypes[bugs[j]][k];
    // cell.className = 'cell';
    // cell.textContent = cellTypes[bugs[j]][k];
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
let markerWidth = Math.round(((grid.clientWidth - 110) / cols) / 2) + 'px';
for (i = 0; i < totalMarkers; i++) {
  let token = document.createElement('div');
  token.id = 'm' + i;
  token.className = 'token';
  token.style.width = markerWidth;
  token.style.height = markerWidth;
  let colour = i < halfOfMarkers ? 'rgba(255, 118, 0, 0.8)' : 'rgba(0, 108, 255, 0.8)';
  let border = i < halfOfMarkers ? '2px solid rgba(255, 118, 1)' : '2px solid rgba(0, 108, 255, 1)';
  let targets = i < halfOfMarkers ?  homeCells.slice(rows, rows*2) : homeCells.slice(0, rows);
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
  let markerObject = {marker:token, currentCell:homeCell, prevCell:homeCell, tokenColour:colour, targetCells:targets};
  markers.push(markerObject);
}

//resize cells and tokens when window is resized
// function resizeGameBoard() {
//   cellWidth = Math.round((grid.clientWidth - 110) / cols);
//   cellWidthPx = cellWidth + 'px';
//   for (i = 0; i < cells; i++) {
//     let cell = document.getElementById(i);
//     cell.style.width = cellWidthPx;
//     cell.style.height = cellWidthPx;
//   }
//   markerWidth = Math.round(((grid.clientWidth - 110) / cols) / 2) + 'px';
//   for (i = 0; i < totalMarkers; i++) {
//     let token = document.getElementById('m' + i);
//     token.style.width = markerWidth;
//     token.style.height = markerWidth;
//     // token.style.left = 10 + 'px';
//   }
// }
// window.onresize = resizeGameBoard;

//remove click events from all cells (when clicking on marker and after moving marker)
function removeCellClickEvent() {
  for (i = 0; i < activeCells.length; i++) {
    let cell = document.getElementById(activeCells[i]);
    cell.removeEventListener('click', clickCell);
    cell.style.cursor = 'default';
    // cell.style.backgroundColor = 'rgb(230, 230, 230)';
  }
  activeCells = [];
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
      for (i = halfOfMarkers; i < totalMarkers; i++) {
        let token = document.getElementById('m' + i);
        token.removeEventListener('click', clickMarker);
        token.style.cursor = 'default';
      }
    } else {
      activePlayer = 2;
      for (i = 0; i < halfOfMarkers; i++) {
        let token = document.getElementById('m' + i);
        token.removeEventListener('click', clickMarker);
        token.style.cursor = 'default';
      }
    }
    //update game stats
    statsActivePlayer.textContent = activePlayer;
    statsMoves.textContent = maxMoves;
  }
  //determine which moves are possible for the given player and marker
  activeMarker.style.backgroundColor = z < halfOfMarkers ? 'rgba(255, 118, 0, 1)' : 'rgba(0, 108, 255, 1)';
  let m = (maxMoves - moveCount);
  let moves = allowedMoves['p' + activePlayer];
  let currentCellType = document.getElementById(markers[z].currentCell).getAttribute('data-celltype');
  for (i = 0; i < 3; i++) {
    //if on 'free' cell can move to any other unoccupied 'free' cell
    if (currentCellType === '5' && i != 0) { //type '5' is a 'free' (i.e. switch) cell (depends on number of columns!)
      for (k = 0; k < rows; k++) {
        let cellID = (k * 11) + 5;
        if (occupiedCells.indexOf(cellID) >= 0) {
          continue;
        }
        let cell = document.getElementById(cellID);
        // cell.style.backgroundColor = 'rgb(244, 244, 244)';
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
          // cell.style.backgroundColor = 'rgb(244, 244, 244)';
          cell.style.cursor = 'pointer';
          cell.addEventListener('click', clickCell);
          activeCells.push(cellID);
          if (cellType === '0') { //break "nextCell" loop if cellType is a 'home' cell (type '0')
            break nextCell;
          }
        } else if (currentCellType != cellType) {
          break;
        } else {
          // cell.style.backgroundColor = 'rgb(244, 244, 244)';
          cell.style.cursor = 'pointer';
          cell.addEventListener('click', clickCell);
          activeCells.push(cellID);
        }
      }
    }
    if (homeCells.indexOf(markers[z].currentCell) >= 0) { //markers at a home cell can only go forward
      break;
    }
  }
}

//move marker by clicking an empty cell (after clicking a marker)
function clickCell(e) {
  removeCellClickEvent();
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
  let xDiff = (targetX - x) / 30;
  let yDiff = (targetY - y) / 30;
  clearInterval(mm);
  mm = setInterval(frame, 10);
  let i = 0;
  function frame() {
    if (i == 30) {
      clearInterval(mm);
    } else {
      i++;
      x = x + xDiff;
      y = y + yDiff;
      activeMarker.style.left = x + 'px';
      activeMarker.style.top = y + 'px';
    }
  }
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
  statsMoves.textContent = maxMoves - moveCount;
  //check if clicked cell is a home cell...
  //make marker unmoveable in subsequent turns and
  //add points (check if points = maxPoints and end game)
  if (clickedCell.getAttribute('data-celltype') === '0') {
    activeMarker.removeEventListener('click', clickMarker);
    activeMarker.style.cursor = 'default';
    markersAtTarget.push(z);
    updatedPoints = ++points['p' + activePlayer];
    document.getElementById('p' + activePlayer + 'Points').textContent = updatedPoints;
    if (updatedPoints === maxPoints) {
      document.getElementById('winner').textContent = 'PLAYER ' + activePlayer + ' WINS!'
      for (j = 0; j < totalMarkers; j++) {
        let token = document.getElementById('m' + j);
        token.removeEventListener('click', clickMarker);
        token.style.cursor = 'default';
      }
    }
  }
  if (moveCount === 3 && updatedPoints < maxPoints) {
    swapPlayers();
  }
}

function swapPlayers() {
  if (activePlayer === 1) {
    for (i = 0; i < totalMarkers; i++) {
      let token = document.getElementById('m' + i);
      if (i < halfOfMarkers) {
        token.removeEventListener('click', clickMarker);
        token.style.cursor = 'default';
      } else if (markersAtTarget.indexOf(i) < 0) {
        token.addEventListener('click', clickMarker);
        token.style.cursor = 'pointer';
      }
    }
    activePlayer = 2;
  } else {
    for (i = 0; i < totalMarkers; i++) {
      let token = document.getElementById('m' + i);
      if (i < halfOfMarkers && markersAtTarget.indexOf(i) < 0) {
        token.addEventListener('click', clickMarker);
        token.style.cursor = 'pointer';
      } else {
        token.removeEventListener('click', clickMarker);
        token.style.cursor = 'default';
      }
    }
    activePlayer = 1;
  }
  statsActivePlayer.textContent = activePlayer;
  moveCount = 0;
  statsMoves.textContent = maxMoves;
}

//reset game
// function resetGame() {
//   for (i = 0; i < cells; i++) {
//     let cell = document.getElementById(i);
//     cell.style.backgroundColor = 'rgb(230, 230, 230)';
//     cell.onmouseover = function() {cell.style.boxShadow = '1px 1px 5px rgb(160, 160, 160)'};
//     cell.onmouseout = function() {cell.style.boxShadow = 'initial'};
//     cell.addEventListener('click', clickCell);
//     cell.style.cursor = 'pointer';
//   }
// }
