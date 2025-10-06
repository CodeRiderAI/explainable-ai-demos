// ==========================
// UI / Renderer / Controller
// ==========================

// MIT License
// (c) 2025 WHY Reversi Demo

// DOM refs
const boardEl     = document.getElementById('board');
const candListEl  = document.getElementById('candList');
const turnInfoEl  = document.getElementById('turnInfo');
const resetBtn    = document.getElementById('resetBtn');
const saveBtn     = document.getElementById('saveBtn');
const toggleFirstBtn = document.getElementById('toggleFirstBtn');

// Bind handlers
resetBtn.onclick = () => { initBoard(); draw(); if (player===WHITE) setTimeout(aiTurn, 200); };
saveBtn.onclick  = () => downloadLogs();
toggleFirstBtn.onclick = () => {
  firstPlayer = (firstPlayer===BLACK)? WHITE : BLACK;
  toggleFirstBtn.textContent = `先手: ${firstPlayer===BLACK?"黒":"白"}`;
  initBoard(); draw();
  if (player===WHITE) setTimeout(aiTurn, 200);
};

// Initial setup
initBoard(); draw();
if (player===WHITE) setTimeout(aiTurn, 200);

// --- Rendering ---
function draw(){
  boardEl.innerHTML='';
  // pre-compute current player's WHY for hints (when human turn)
  let hintMap = new Map();
  if (player===BLACK){
    const moves = legalMoves(board, BLACK);
    const { list } = classifyWHY(BLACK, board, moves);
    for(const e of list){
      const key = `${e.r},${e.c}`;
      const kind = e.why_kind.toLowerCase().replace('why_',''); // drop/hold/revive
      hintMap.set(key, kind);
    }
  }

  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const d = document.createElement('div');
      d.className='sq';
      if(board[r][c]===BLACK){ const disc=document.createElement('div'); disc.className='disc black'; d.appendChild(disc); }
      if(board[r][c]===WHITE){ const disc=document.createElement('div'); disc.className='disc white'; d.appendChild(disc); }

      if (player===BLACK){
        const kind = hintMap.get(`${r},${c}`);
        if (kind){
          const h = document.createElement('div');
          h.className = 'hint-' + kind; // red/yellow/green
          d.appendChild(h);
        }
        d.onclick = () => onHumanMove(r,c);
      } else {
        d.onclick = ()=>{};
      }
      boardEl.appendChild(d);
    }
  }
  turnInfoEl.textContent = `ターン: ${player===BLACK ? "黒（あなた）":"白（AI）"}`;
  showCandidates();
  // auto-pass for human if no legal move
  if (player===BLACK){
    const moves = legalMoves(board, BLACK);
    if (moves.length===0){
      logWHY({move:"-", side:"BLACK", why_kind:"PASS", reason:"no_legal_moves", evidence:{}});
      player = WHITE;
      setTimeout(aiTurn, 400);
    }
  }
}

function showCandidates(){
  candListEl.innerHTML='';
  const moves = legalMoves(board, player);
  if (moves.length===0){
    candListEl.innerHTML = `<div class="cand sub">合法手なし（パス）</div>`;
    return;
  }
  const {list, best} = classifyWHY(player, board, moves);
  list.sort((a,b)=> b.score - a.score);
  for(const e of list){
    const row = document.createElement('div'); row.className='cand';
    const tags = document.createElement('div'); tags.className='tags';
    const kind = document.createElement('span'); kind.className='tag ' + (e.why_kind==="WHY_DROP"?"drop":e.why_kind==="WHY_HOLD"?"hold":"revive");
    kind.textContent = e.why_kind.replace("WHY_","");
    const sc = document.createElement('span'); sc.className='tag'; sc.textContent = `score: ${e.score.toFixed(2)}`;
    const mv = document.createElement('span'); mv.className='tag'; mv.textContent = `move: ${coord(e.r,e.c)}`;
    tags.append(kind, sc, mv);
    const why = document.createElement('div'); why.className='why';
    why.textContent = formatWhyNatural(e);
    row.appendChild(tags); row.appendChild(why);
    candListEl.appendChild(row);
  }
}

// --- Human move ---
function onHumanMove(r,c){
  if(player!==BLACK) return;
  const ms = legalMoves(board, BLACK);
  const mv = ms.find(m=>m.r===r&&m.c===c);
  if(!mv) return;

  // label chosen move WHY
  const { list } = classifyWHY(BLACK, board, ms);
  const lab = list.find(e=>e.r===r && e.c===c);
  if(lab) chosenWhy.push({side:"BLACK", move:coord(r,c), why_kind:lab.why_kind, score:+lab.score.toFixed(2)});

  board = applyMove(board, mv, BLACK);
  logWHY({move:coord(r,c), side:"BLACK", why_kind:"APPLY", reason:"human_move", evidence:{}});
  player = WHITE; draw();
  setTimeout(aiTurn, 200);
}

// --- AI move ---
function aiTurn(){
  const moves = legalMoves(board, WHITE);
  if(moves.length===0){
    logWHY({move:"-", side:"WHITE", why_kind:"PASS", reason:"no_legal_moves", evidence:{}});
    player = BLACK; draw(); maybeGameOver(); return;
  }

  // Display WHY for candidates (for panel)
  const whyView = classifyWHY(WHITE, board, moves);

  // Balanced: endgame +1 depth, otherwise base depth
  const empties = board.flat().filter(v=>v===EMPTY).length;
  const maxDepth = (empties <= 14 ? Math.min(SEARCH_MAX_DEPTH + 1, 4) : SEARCH_MAX_DEPTH);

  let chosen, searchInfo;
  if (SEARCH_ENABLED){
    const res = searchBestMove(WHITE, board, moves, maxDepth, SEARCH_TIME_MS);
    chosen = res.best;
    searchInfo = {depth: maxDepth, nodes: res.nodes, score: res.score, pv: res.pv};
  } else {
    chosen = {r:whyView.best.r, c:whyView.best.c, flips:whyView.best.flips};
    searchInfo = {depth:0, nodes:0, score:+whyView.best.score.toFixed(2), pv:[coord(chosen.r,chosen.c)]};
  }

  // Log WHY for non-DROP candidates (panel and file)
  for(const e of whyView.list){
    if(e.why_kind!=="WHY_DROP"){
      logWHY({ move:coord(e.r,e.c), side:"WHITE", why_kind:e.why_kind, reason:e.reason, evidence:e.evidence, score:+e.score.toFixed(2) });
    }
  }

  // Apply best
  board = applyMove(board, chosen, WHITE);
  chosenWhy.push({side:"WHITE", move:coord(chosen.r,chosen.c), why_kind:"APPLY", score:searchInfo.score});
  logWHY({move:coord(chosen.r,chosen.c), side:"WHITE", why_kind:"APPLY",
          reason: SEARCH_ENABLED ? "search_chosen" : "best_candidate",
          evidence: searchInfo });

  player = BLACK; draw(); maybeGameOver();
}

// --- End / Report ---
function maybeGameOver(){
  const noBlack = legalMoves(board, BLACK).length===0;
  const noWhite = legalMoves(board, WHITE).length===0;
  const full = board.flat().every(v=>v!==EMPTY);
  if ((noBlack && noWhite) || full) showReport();
}

function showReport(){
  const flat = board.flat();
  const b = flat.filter(v=>v===BLACK).length;
  const w = flat.filter(v=>v===WHITE).length;
  const winner = (b===w) ? "DRAW" : (b>w ? "BLACK(あなた)" : "WHITE(AI)");

  const stat = (side) => {
    const rows = chosenWhy.filter(x=>x.side===side);
    const c = (k)=> rows.filter(x=>x.why_kind===k).length;
    const n = rows.length || 1;
    return { n, DROP:c("WHY_DROP"), HOLD:c("WHY_HOLD"), REVIVE:c("WHY_REVIVE"),
      rate_REVIVE:(c("WHY_REVIVE")/n).toFixed(2),
      rate_HOLD:(c("WHY_HOLD")/n).toFixed(2)
    };
  };
  const hs = stat("BLACK"), as = stat("WHITE");

  const corrNote = `
勝者: ${winner}
[あなた] REVIVE率 ${hs.rate_REVIVE}, DROP ${hs.DROP}/${hs.n}
[AI]     REVIVE率 ${as.rate_REVIVE}, DROP ${as.DROP}/${as.n}
⇒ 一般に REVIVE率が高い側は勝ち筋、DROP多用は負け筋に寄りやすい傾向があります（本対局の概要）。
`.trim();

  const html = `
    <div class="cand" style="margin-top:6px">
      <div class="title">対局レポート（WHY × 勝敗）</div>
      <div class="why">${JSON.stringify({winner, counts:{BLACK:b,WHITE:w}, chosenWhy_summary:{human:hs, ai:as}}, null, 2)}</div>
      <div class="sub" style="margin-top:6px; white-space:pre-wrap">${corrNote}</div>
    </div>
  `;
  candListEl.innerHTML = html;
}

// --- Download logs ---
function downloadLogs(){
  const jsonl = whyLogs.map(o=>JSON.stringify(o)).join("\n");
  const blob = new Blob([jsonl], {type:"application/json"});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `reversi_why_${Date.now()}.jsonl`;
  a.click();
  URL.revokeObjectURL(a.href);
}