// ==========================
// Reversi Engine (Board / Rules)
// ==========================

// MIT License
// (c) 2025 WHY Reversi Demo

// Constants
const EMPTY = 0, BLACK = 1, WHITE = -1;
const SIZE = 8;
const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const cornerCoords = [[0,0],[0,7],[7,0],[7,7]];

// Globals (shared across modules)
let board;                 // 8x8
let player = BLACK;        // current side to move
let firstPlayer = BLACK;   // first player (toggle)
let whyLogs = [];          // JSONL logs (WHY and APPLY)
let chosenWhy = [];        // [{side,move,why_kind,score}]

// --- Basic helpers ---
function inb(r,c){ return r>=0 && r<SIZE && c>=0 && c<SIZE; }
function isCorner(r,c){ return (r===0&&c===0)||(r===0&&c===7)||(r===7&&c===0)||(r===7&&c===7); }
function isXSquare(r,c){ return (r===1&&c===1)||(r===1&&c===6)||(r===6&&c===1)||(r===6&&c===6); }
function isCornerAdjacent(r,c){ // orthogonal neighbors of corners
  return (r===0 && (c===1||c===6)) || (r===7 && (c===1||c===6)) ||
         (c===0 && (r===1||r===6)) || (c===7 && (r===1||r===6));
}

// --- Board I/O ---
function initBoard(){
  board = Array.from({length:SIZE},()=>Array(SIZE).fill(EMPTY));
  const m = SIZE/2;
  board[m-1][m-1]=WHITE; board[m][m]=WHITE;
  board[m-1][m]=BLACK;  board[m][m-1]=BLACK;
  player = firstPlayer;
  whyLogs = [];
  chosenWhy = [];
  // UI will call draw(); and if WHITE first, aiTurn() will be fired by UI layer.
}

// --- Rules ---
function flipsForMove(b, r, c, side){
  if(b[r][c]!==EMPTY) return [];
  const opp=-side; let flips=[];
  for(const [dr,dc] of DIRS){
    let rr=r+dr, cc=c+dc, buf=[];
    while(inb(rr,cc) && b[rr][cc]===opp){ buf.push([rr,cc]); rr+=dr; cc+=dc; }
    if(inb(rr,cc) && b[rr][cc]===side && buf.length) flips.push(...buf);
  }
  return flips;
}

function legalMoves(b, side){
  const ms=[];
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    const fl=flipsForMove(b,r,c,side);
    if(fl.length) ms.push({r,c,flips:fl});
  }
  return ms;
}

function applyMove(b, move, side){
  const nb = b.map(row=>row.slice());
  nb[move.r][move.c]=side;
  for(const [r,c] of move.flips) nb[r][c]=side;
  return nb;
}

// --- Heuristic features (used by AI) ---
function mobility(b, side){ return legalMoves(b, side).length; }

function cornerCount(b, side){
  return cornerCoords.reduce((s,[r,c])=> s + (b[r][c]===side ? 1:0), 0);
}

function stableEdges(b, side){
  // very light proxy: count discs on edges that form contiguous streaks touching corners
  let sc=0;
  // top/bottom rows
  for(const rr of [0,7]){
    let left = b[rr][0]===side, right = b[rr][7]===side;
    if(left){ let i=0; while(i<SIZE && b[rr][i]===side){ sc++; i++; } }
    if(right){ let i=SIZE-1; while(i>=0 && b[rr][i]===side){ sc++; i--; } }
  }
  // left/right cols
  for(const cc of [0,7]){
    let top = b[0][cc]===side, bottom = b[7][cc]===side;
    if(top){ let i=0; while(i<SIZE && b[i][cc]===side){ sc++; i++; } }
    if(bottom){ let i=SIZE-1; while(i>=0 && b[i][cc]===side){ sc++; i--; } }
  }
  return sc;
}

function xSquareRisk(r,c,b){
  if(!isXSquare(r,c)) return 0;
  const mapping = { "1,1":[0,0], "1,6":[0,7], "6,1":[7,0], "6,6":[7,7] };
  const key=`${r},${c}`; const [cr,cc]=mapping[key];
  return (b[cr][cc]===EMPTY) ? 1 : 0;
}

// --- UX helpers ---
function coord(r,c){ return String.fromCharCode(65+c) + (r+1); }
function logWHY(obj){ const rec = { ts:new Date().toISOString(), ...obj }; whyLogs.push(rec); }