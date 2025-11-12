// =====================
// focus-ui.js (no-module)
// 描画ループ／UI制御
// =====================

const cv = document.getElementById('stage');
const world = window.createWorld(cv);
const logic = new window.FocusLogic(world);

// UI参照
const lblStatus = document.getElementById('lblStatus');
const lblRadius = document.getElementById('lblRadius');
const lblCount = document.getElementById('lblCount');
const lblSpeed = document.getElementById('lblSpeed');
const rngRadius = document.getElementById('rngRadius');
const rngCount = document.getElementById('rngCount');
const rngSpeed = document.getElementById('rngSpeed');
const chkFollow = document.getElementById('chkFollowMouse');
const btnStart = document.getElementById('btnStart');
const btnPause = document.getElementById('btnPause');
const btnReset = document.getElementById('btnReset');
const btnDownload = document.getElementById('btnDownload');
const focusList = document.getElementById('focusList');
const statVisible = document.getElementById('statVisible');
const statHidden = document.getElementById('statHidden');
const statEvents = document.getElementById('statEvents');

function applyControls() {
  CFG.focusRadius = +rngRadius.value; lblRadius.textContent = CFG.focusRadius;
  CFG.targetCount = +rngCount.value; lblCount.textContent = CFG.targetCount;
  CFG.baseSpeed = +rngSpeed.value; lblSpeed.textContent = CFG.baseSpeed.toFixed(1);
  world.setRadius(CFG.focusRadius);
  world.setSpeed(CFG.baseSpeed);
  world.setFollowMouse(chkFollow.checked);
  world.setCount(CFG.targetCount);
}

rngRadius.addEventListener('input', applyControls);
rngCount.addEventListener('input', applyControls);
rngSpeed.addEventListener('input', applyControls);
chkFollow.addEventListener('change', applyControls);

btnStart.addEventListener('click', () => {
  if (world.running) return;
  lblStatus.textContent = 'running';
  world.start(step);
});

btnPause.addEventListener('click', () => {
  world.pause();
  lblStatus.textContent = 'paused';
});

btnReset.addEventListener('click', () => {
  world.pause();
  world.reset(CFG.targetCount, CFG.baseSpeed);
  logic.events = logic.visible = logic.hidden = 0;
  logic.logs.length = 0;
  lblStatus.textContent = 'stopped';
  focusList.innerHTML = '';
  updateStats();
  world.draw();
});

btnDownload.addEventListener('click', () => logic.download());

function step() {
  world.step();
  world.draw();
  const vis = logic.snapshot();
  renderFocusList(vis);
  updateStats();
}

function renderFocusList(list) {
  focusList.innerHTML = '';
  list.sort((a, b) => a.dist - b.dist);
  for (const v of list.slice(0, 32)) {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <span class="k">#${v.id} <span class="badge vis">VISIBLE</span></span>
      <span class="v">dist: ${v.dist.toFixed(1)}</span>
    `;
    focusList.appendChild(div);
  }
}

function updateStats() {
  statVisible.textContent = logic.visible;
  statHidden.textContent = logic.hidden;
  statEvents.textContent = logic.events;
}

// 初期描画＆コントロール反映
applyControls();
world.draw();