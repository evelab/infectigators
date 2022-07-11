const grid = document.getElementById('grid');
const rows = 5;
const cols = 11;
const cells = rows * cols;
const headers = ['Home', 'Source', 'Transmission', 'Prevention', 'Free', 'Symptoms', 'Treatment', 'Type', 'Home'];
// const cellWidth = Math.round((60 / cols) * 10) / 10 + 'vw';
const homeCells = []; //index of start and target cells
for (i = 0; i < rows; i++) {
  homeCells.splice(i, 0, cols * i); //player 1
  homeCells.push(cols * i + (cols - 1)); //player 2
}
const firstCol = homeCells.slice(0, 5);
const cellTypes = {
  'Yellow Fever': ['*', 'arthropod', 'bite', 'net', 'repellent', '', 'vomit', 'fever', 'rehydrate', 'virus', '*'],
  'Coronavirus': ['*', 'human', 'cough', 'mask', 'wash hands', '', 'fatigue', 'fever', 'symptom relief', 'virus', '*'],
  'Rabies': ['*', 'animal', 'bite', 'education', 'avoid', '', 'fever', 'pain', 'wash wound', 'virus', '*'],
  'American Tryps': ['*', 'arthropod', 'bite', 'clean house', 'repellent', '', 'vomit', 'fever', 'drugs', 'microorganism', '*'],
  'Ebola': ['*', 'human', 'fluids', 'cook food', 'wash hands', '', 'vomit', 'fever', 'rehydrate', 'virus', '*'],
  'Borreliosis': ['*', 'arthropod', 'bite', 'clothing', 'repellent', '', 'lesions', 'fever', 'drugs', 'microorganism', '*'],
  'Cholera': ['*', 'human', 'water', 'cook food', 'wash hands', '', 'diarrhoea', 'vomit', 'rehydrate', 'microorganism', '*'],
  'Malaria': ['*', 'arthropod', 'bite', 'net', 'repellent', '', 'vomit', 'fever', 'drugs', 'microorganism', '*'],
  'Dengue Fever': ['*', 'arthropod', 'bite', 'net', 'repellent', '', 'pain', 'vomit', 'symptom relief', 'virus', '*'],
  'Influenza': ['*', 'human', 'cough', 'mask', 'wash hands', '', 'fever', 'cough', 'symptom relief', 'virus', '*'],
  'African Tryps': ['*', 'arthropod', 'bite', 'net', 'repellent', '', 'fatigue', 'fever', 'drugs', 'microorganism', '*'],
};
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
// const markerWidth = Math.round((30 / cols) * 10) / 10 + 'vw';
const markersAtTarget = []; //markers that have reached home cells and can no longer move
const totalMarkers = 10;
const halfOfMarkers = totalMarkers/2;
let activePlayer;
let activeMarker;
let z; //active marker index
const maxMoves = 3;
let moveCount = 0;
// const allowedMoves = { //includes diagonal moves
//   p1: [
//     [-cols, -cols+1, 1, cols, cols+1],
//     [-cols*2, -cols*2+1, -cols*2+2, -cols, -cols+1, -cols+2, 1, 2, cols, cols+1, cols+2, cols*2, cols*2+1, cols*2+2],
//     [-cols*3, -cols*3+1, -cols*3+2, -cols*3+3, -cols*2, -cols*2+1, -cols*2+2, -cols*2+3, -cols, -cols+1, -cols+2, -cols+3, 1, 2, 3, cols, cols+1, cols+2, cols+3, cols*2, cols*2+1, cols*2+2, cols*2+3, cols*3, cols*3+1, cols*3+2, cols*3+3]
//   ],
//   p2: []
// };
// const allowedMoves = { //no diagonal moves
//   p1: [
//     [-cols, 1, cols],
//     [-cols*2, -cols, 1, 2, cols, cols*2],
//     [-cols*3, -cols*2, -cols, 1, 2, 3, cols, cols*2, cols*3]
//   ],
//   p2: []
// };
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
const cellWidth = Math.round((grid.clientWidth - 110) / cols);
const cellWidthPx = cellWidth + 'px';
for (i = 0; i < cells; i++) {
  let cell = document.createElement('div');
  // cell.className = homeCells.indexOf(i) < 0 ? 'cell other' : 'cell home';
  cell.className = 'cell';
  cell.style.width = cellWidthPx;
  cell.style.height = cellWidthPx;
  cell.style.lineHeight = cellWidthPx;
  if (firstCol.indexOf(i) > 0) {
    j++;
    k = 0;
  }
  // cell.className = 'cell ' + cellTypes[bugs[j]][k];
  if (homeCells.indexOf(i) > -1) {
    cell.textContent = bugs[j];
  } else {
    cell.textContent = cellTypes[bugs[j]][k];
  }
  // cell.setAttribute('data-celltype', cellTypes[bugs[j]][k]);
  cell.setAttribute('data-celltype', uniqueCellTypes.indexOf(cellTypes[bugs[j]][k]));
  cell.id = i;
  grid.appendChild(cell);
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
const markerWidth = Math.round(((grid.clientWidth - 110) / cols) / 2) + 'px';
for (i = 0; i < totalMarkers; i++) {
  let token = document.createElement('div');
  token.style.width = markerWidth;
  token.style.height = markerWidth;
  token.className = 'token';
  let colour = i < halfOfMarkers ? 'rgba(255, 118, 0, 0.8)' : 'rgba(0, 108, 255, 0.8)';
  let border = i < halfOfMarkers ? '2px solid rgba(255, 118, 1)' : '2px solid rgba(0, 108, 255, 1)';
  let targets = i < halfOfMarkers ?  homeCells.slice(rows, rows*2) : homeCells.slice(0, rows);
  token.style.backgroundColor = colour;
  token.style.border = border;
  token.id = 'm' + i;
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

//remove click events from all cells (when clicking on marker and after moving marker)
function removeCellClickEvent() {
  for (i = 0; i < activeCells.length; i++) {
    let cell = document.getElementById(activeCells[i]);
    cell.removeEventListener('click', clickCell);
    cell.style.cursor = 'default';
    // cell.style.backgroundColor = homeCells.indexOf(i) < 0 ? 'rgb(230, 230, 230)' : 'rgb(200, 200, 200)';
    cell.style.backgroundColor = 'rgb(230, 230, 230)';
  }
  activeCells = [];
}

//add click event to required cells when clicking on marker
function clickMarker(e) {
  activeMarker = e.target;
  if (activePlayer != undefined) {
    let prevActiveMarker = markers[z].marker;
    // if (prevActiveMarker.style.backgroundColor == 'rgb(0, 0, 0)') {
    // if (prevActiveMarker.id != activeMarker.id && activeCells.length != 0) {
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
    statsActivePlayer.textContent = activePlayer;
    statsMoves.textContent = maxMoves;
  }
  // activeMarker.style.backgroundColor = 'rgb(0, 0, 0)';
  activeMarker.style.backgroundColor = z < halfOfMarkers ? 'rgba(255, 118, 0, 1)' : 'rgba(0, 108, 255, 1)';
  // let m = (maxMoves - moveCount) - 1;
  // let moves = allowedMoves['p' + activePlayer][m];
  // let movesLength = moves.length;
  let m = (maxMoves - moveCount);
  let moves = allowedMoves['p' + activePlayer];

  let currentCellType = document.getElementById(markers[z].currentCell).getAttribute('data-celltype');
  // for (i = 0; i < movesLength; i++) {
  //   let cellID = moves[i] + markers[z].currentCell;
  //   if (cellID >= 0 && cellID < cells && occupiedCells.indexOf(cellID) < 0) {
  //     let cell = document.getElementById(cellID);
  //     let nextCellType = cell.getAttribute('data-celltype');
  //     if ((moves[i] > -4 && moves[i] < 4) || currentCellType == nextCellType) {
  //       cell.style.backgroundColor = 'rgb(244, 244, 244)';
  //       cell.style.cursor = 'pointer';
  //       cell.addEventListener('click', clickCell);
  //       activeCells.push(cellID);
  //     }
  //   }
  // }
  for (i = 0; i < 3; i++) {
    let subMoves = moves[i];
    nextCell:
    for (j = 0; j < m; j++) {
      let cellID = subMoves[j] + markers[z].currentCell;
      let cell;
      let cellType;
      if (cellID < 0 || cellID >= cells || occupiedCells.indexOf(cellID) >= 0) {
        break;
      } else {
        cell = document.getElementById(cellID);
        cellType = cell.getAttribute('data-celltype');
        if (i === 0) {
          cell.style.backgroundColor = 'rgb(244, 244, 244)';
          cell.style.cursor = 'pointer';
          cell.addEventListener('click', clickCell);
          activeCells.push(cellID);
          if (cellType === '0') { //break "nextCell" loop if cellType is a home cell
            break nextCell;
          }
        } else if (currentCellType != cellType) {
          break;
        } else {
          cell.style.backgroundColor = 'rgb(244, 244, 244)';
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
      if (moveCount === 3) {
        swapPlayers();
      };
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
  //check if clicked cell is a home cell (and add points if so)
  // if (homeCells.indexOf(cellB) >= 0) {
  //check if clicked cell is a target cell and if so...
  //add points and
  //make marker unmoveable in subsequent turns
  if (markers[z].targetCells.indexOf(cellB) >= 0) {
    activeMarker.removeEventListener('click', clickMarker);
    activeMarker.style.cursor = 'default';
    markersAtTarget.push(z);
    let updatedPoints = ++points['p' + activePlayer];
    document.getElementById('p' + activePlayer + 'Points').textContent = updatedPoints;
  }
  //calculate number of moves it takes to get to clicked cell
  let cellDiff = Math.abs(cellB - cellA);
  let newMoves = null;
  if (cellDiff % cols === 0) {
    newMoves = cellDiff / cols;
  } else {
    cellA = cellA % cols;
    cellB = cellB % cols;
    newMoves = Math.abs(cellB - cellA);
  }
  moveCount = moveCount + newMoves;
  statsMoves.textContent = maxMoves - moveCount;
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
      if (i < halfOfMarkers & markersAtTarget.indexOf(i) < 0) {
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
