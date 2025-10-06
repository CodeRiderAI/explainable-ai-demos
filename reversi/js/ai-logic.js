// ==========================
// AI Logic (Evaluation / WHY / Search)
// ==========================

// MIT License
// (c) 2025 WHY Reversi Demo

// ---- Search settings (Balanced preset) ----
let SEARCH_ENABLED   = true;
let SEARCH_MAX_DEPTH = 3;        // base depth
let SEARCH_TIME_MS   = 250;      // per-move time budget (ms)

// ---- Evaluation: single-move (unitless) ----
function evaluateMove(side, b, move){
  const opp = -side;
  const nb = applyMove(b, move, side);
  const myCorners = cornerCount(nb, side);
  const stEdges   = stableEdges(nb, side);
  const myMob     = mobility(nb, side);
  const oppMob    = mobility(nb, opp);
  const xRisk     = xSquareRisk(move.r, move.c, b);

  // base score (tuned for transparency)
  let score = 2.2*myCorners + 1.2*stEdges + 0.4*myMob - 0.5*oppMob - 1.6*xRisk;

  // absolute priority for capturing a corner
  if (isCorner(move.r, move.c)) score += 6.0;

  return { score, features:{ myCorners, stEdges, myMob, oppMob, xRisk } };
}

function boardScore(side, b){
  const myC  = cornerCount(b, side);
  const stE  = stableEdges(b, side);
  const myM  = mobility(b, side);
  const oppM = mobility(b, -side);
  return 2.2*myC + 1.2*stE + 0.4*myM - 0.5*oppM;
}

// ---- WHY in natural language (UI panel text) ----
function formatWhyNatural(e){
  if(!e || !e.why_kind) return "特別な理由はありません。";
  const r = e.reason || "";
  switch(e.why_kind){
    case "WHY_DROP":
      if(r.includes("corner")) return "この手を打つと角を相手に取られるリスクが高いため、避けました。";
      if(r.includes("inferior_score")) return "評価が他の候補より低いため、捨てました。";
      return "現在の状況では不利と判断して捨てました。";
    case "WHY_HOLD":
      return "評価が拮抗しており、どちらとも言えないため保留しました。";
    case "WHY_REVIVE":
      if(r.includes("corner")) return "角を確保できる好機と判断して採用しました。";
      if(r.includes("mobility")) return "この手で相手の可動性が下がるため、有利になる見込みで採用しました。";
      if(r.includes("best_score")) return "最善手のため採用しました。";
      return "他の手よりも有望と判断して採用しました。";
    default:
      return "特別な理由はありません。";
  }
}

// ---- Move ordering (corners first, risky last) ----
function orderMoves(side, b, moves){
  return [...moves].sort((a,bm)=>{
    const ac = isCorner(a.r,a.c)?1:0, bc = isCorner(bm.r,bm.c)?1:0;
    if (ac!==bc) return bc-ac;
    const anx = (isXSquare(a.r,a.c)||isCornerAdjacent(a.r,a.c))?1:0;
    const bnx = (isXSquare(bm.r,bm.c)||isCornerAdjacent(bm.r,bm.c))?1:0;
    if (anx!==bnx) return anx-bnx;
    // light single-move eval
    return evaluateMove(side,b,a).score - evaluateMove(side,b,bm).score;
  }).reverse();
}

// ---- WHY classification for candidates (DROP/HOLD/REVIVE) ----
function classifyWHY(side, b, candidates){
  if(!candidates.length) return {list:[], best:null};

  // 1) base eval
  let evals = candidates.map(m=>{
    const ev = evaluateMove(side, b, m);
    return {...m, ...ev};
  });

  // 2) best & HOLD band (relative)
  const bestScore = Math.max(...evals.map(e=>e.score));
  const DELTA = Math.max(1.0, Math.abs(bestScore)*0.25); // variable band

  const withWhy = evals.map(e=>{
    let why_kind="WHY_DROP", reason="", evidence={};
    const d = bestScore - e.score;

    if (d <= DELTA){ // HOLD band
      // base = HOLD
      why_kind="WHY_HOLD";
      reason=`close_to_best (|Δ| ≤ ${DELTA})`;
      evidence={delta:+d.toFixed(2), score:+e.score.toFixed(2), best:+bestScore.toFixed(2)};

      // 1) corner always priority
      if (isCorner(e.r, e.c)) {
        why_kind="WHY_REVIVE"; reason="corner_priority";
      } else {
        // 1-ply risk & mobility check
        const nb = applyMove(b, {r:e.r,c:e.c,flips:e.flips}, side);
        const oppMobBefore = mobility(b, -side), oppMobAfter = mobility(nb, -side);
        const oppMoves = legalMoves(nb, -side);

        // A) immediate corner capture
        const givesCorner = oppMoves.some(mv => isCorner(mv.r,mv.c));

        // B) 2-ply corner trap (opp X/adjacent -> our reply -> opp corner)
        const givesCornerSoon = !givesCorner && oppMoves.some(mv => {
          if (!(isXSquare(mv.r,mv.c) || isCornerAdjacent(mv.r,mv.c))) return false;
          const nb2 = applyMove(nb, mv, -side);
          const our2 = legalMoves(nb2, side);
          return our2.some(m2 => {
            const nb3 = applyMove(nb2, m2, side);
            const opp3 = legalMoves(nb3, -side);
            return opp3.some(z => isCorner(z.r,z.c));
          });
        });

        if (givesCorner || givesCornerSoon) {
          why_kind="WHY_DROP";
          reason = givesCorner ? "gives opponent corner (2-ply risk)"
                               : "leads to corner in 2 plies";
          evidence = {...evidence, risk:"corner_capture"};
        } else {
          // C) exact best (Δ=0) => REVIVE
          if (Math.abs(d) < 1e-9) {
            why_kind="WHY_REVIVE"; reason="best_score";
          }
          // D) mobility improved => REVIVE
          else if (oppMobAfter < oppMobBefore) {
            why_kind="WHY_REVIVE";
            reason="1-ply reduces opp mobility";
            evidence={...evidence, oppMobBefore, oppMobAfter};
          }
          // E) if corner already owned by opponent, adjacent is trap => DROP
          const cornerIsOpponent = cornerCoords.some(([cr,cc]) => b[cr][cc] === -side);
          if (cornerIsOpponent && isCornerAdjacent(e.r, e.c)) {
            why_kind="WHY_DROP";
            reason="corner already controlled by opponent (trap risk)";
            evidence={...evidence, risk:"corner_owned"};
          }
        }
      }
    } else {
      // drop reasons
      if(e.features.xRisk>0){ why_kind="WHY_DROP"; reason="x_square_risk"; evidence={xRisk:e.features.xRisk}; }
      else { why_kind="WHY_DROP"; reason="inferior_score"; evidence={delta:+d.toFixed(2)}; }
    }
    return {...e, why_kind, reason, evidence};
  });

  // 3) pick best for display order
  const best = withWhy.reduce((a,b)=> a.score>=b.score?a:b);
  return { list:withWhy.sort((a,b)=> b.score - a.score), best };
}

// ---- Search: iterative deepening Negamax + alpha-beta + time limit ----
function searchBestMove(side, b, moves, maxDepth=SEARCH_MAX_DEPTH, timeMs=SEARCH_TIME_MS){
  const deadline = performance.now() + timeMs;
  let last = {score:-Infinity, pv:[]}, nodes=0;

  function negamax(board, s, depth, alpha, beta){
    nodes++;
    if (performance.now() > deadline) return {score: boardScore(side, board), pv:[]};
    if (depth===0){
      return {score: boardScore(side, board), pv:[]};
    }
    const legal = legalMoves(board, s);
    if (legal.length===0){
      const oppLegal = legalMoves(board, -s);
      if (oppLegal.length===0){
        const flat = board.flat();
        const my = flat.filter(v=>v===side).length;
        const opp= flat.filter(v=>v===-side).length;
        return {score:(my-opp)*10, pv:[]};
      }
      return negamax(board, -s, depth, -beta, -alpha);
    }
    const ordered = orderMoves(s, board, legal);
    let bestLocal = -Infinity, bestLine = [];
    for(const mv of ordered){
      const nb = applyMove(board, mv, s);
      const nxt = negamax(nb, -s, depth-1, -beta, -alpha);
      const sc = -nxt.score;
      if (sc > bestLocal){ bestLocal = sc; bestLine = [mv, ...nxt.pv]; }
      if (sc > alpha) alpha = sc;
      if (alpha >= beta) break;
      if (performance.now() > deadline) break;
    }
    return {score: bestLocal, pv: bestLine};
  }

  for(let d=1; d<=maxDepth; d++){
    const res = negamax(b, side, d, -Infinity, Infinity);
    if (performance.now() > deadline) break;
    last = res;
  }
  let best;
  if (last.pv.length){
    const m = last.pv[0];
    best = {r:m.r, c:m.c};
  } else {
    const base = orderMoves(side, b, moves)[0];
    best = {r:base.r, c:base.c};
    last.score = evaluateMove(side, b, base).score;
  }
  const bestFlips = flipsForMove(b, best.r, best.c, side);
  return { best:{...best, flips:bestFlips}, score:+last.score.toFixed(2), nodes, depth:last.pv.length?maxDepth:1, pv:last.pv.map(m=>coord(m.r,m.c)) };
}