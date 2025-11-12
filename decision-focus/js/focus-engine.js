// =====================
// focus-engine.js (no-module)
// 物理/状態：ターゲットと視野（フォーカス円）
// =====================

const CFG = {
  width: 720,
  height: 480,
  targetCount: 32,
  baseSpeed: 1.0,
  focusRadius: 110,
  followMouse: false
};

class RNG {
  static rand(min, max) { return Math.random() * (max - min) + min; }
  static pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
}

class Target {
  constructor(id, w, h, spd) {
    this.id = id;
    this.x = RNG.rand(20, w - 20);
    this.y = RNG.rand(20, h - 20);
    const a = RNG.rand(0, Math.PI * 2);
    const v = RNG.rand(0.5, 1.5) * spd;
    this.vx = Math.cos(a) * v;
    this.vy = Math.sin(a) * v;
    this.r = 4;
    this.visible = false;
    this.lastSeenTs = 0;
  }
  step(w, h, spd) {
    this.x += this.vx * spd;
    this.y += this.vy * spd;
    if (this.x < this.r || this.x > w - this.r) { this.vx *= -1; this.x = Math.max(this.r, Math.min(w - this.r, this.x)); }
    if (this.y < this.r || this.y > h - this.r) { this.vy *= -1; this.y = Math.max(this.r, Math.min(h - this.r, this.y)); }
  }
}

class FocusAgent {
  constructor(w, h) {
    this.x = w / 2;
    this.y = h / 2;
    this.r = CFG.focusRadius;
    this.t = 0; // 自動ゆらぎ用
  }
  setRadius(r) { this.r = r; }
  autoWander(w, h) {
    this.t += 0.01;
    this.x += Math.cos(this.t * 0.9) * 0.3;
    this.y += Math.sin(this.t * 1.1) * 0.3;
    this.x = Math.max(this.r, Math.min(w - this.r, this.x));
    this.y = Math.max(this.r, Math.min(h - this.r, this.y));
  }
}

class World {
  constructor(canvas) {
    this.cv = canvas;
    this.cx = canvas.getContext('2d');
    this.w = canvas.width;
    this.h = canvas.height;
    this.agent = new FocusAgent(this.w, this.h);
    this.targets = [];
    this._mouse = { x: this.w / 2, y: this.h / 2, inside: false };
    this._ts = 0;
    this.running = false;
    this._raf = 0;

    this._bindEvents();
    this.reset(CFG.targetCount, CFG.baseSpeed);
  }

  _bindEvents() {
    this.cv.addEventListener('mousemove', e => {
      const rect = this.cv.getBoundingClientRect();
      this._mouse.x = e.clientX - rect.left;
      this._mouse.y = e.clientY - rect.top;
      this._mouse.inside = true;
    });
    this.cv.addEventListener('mouseleave', () => { this._mouse.inside = false; });
  }

  reset(n, spd) {
    this.targets.length = 0;
    for (let i = 0; i < n; i++) this.targets.push(new Target(i, this.w, this.h, spd));
    this._ts = 0;
  }

  setCount(n) {
    const cur = this.targets.length;
    if (n > cur) {
      for (let i = cur; i < n; i++) this.targets.push(new Target(i, this.w, this.h, CFG.baseSpeed));
    } else if (n < cur) {
      this.targets.length = n;
    }
  }

  setSpeed(spd) { CFG.baseSpeed = spd; }
  setRadius(r) { this.agent.setRadius(r); }
  setFollowMouse(on) { CFG.followMouse = on; }

  start(loop) {
    if (this.running) return; this.running = true;
    const tick = () => { this._raf = requestAnimationFrame(tick); loop(); }; tick();
  }
  pause() { this.running = false; cancelAnimationFrame(this._raf); }

  step() {
    this._ts++;
    if (CFG.followMouse && this._mouse.inside) {
      this.agent.x += (this._mouse.x - this.agent.x) * 0.15;
      this.agent.y += (this._mouse.y - this.agent.y) * 0.15;
    } else {
      this.agent.autoWander(this.w, this.h);
    }
    for (const t of this.targets) t.step(this.w, this.h, CFG.baseSpeed);
    const ax = this.agent.x, ay = this.agent.y, rr = this.agent.r * this.agent.r;
    const now = performance.now();
    for (const t of this.targets) {
      const dx = t.x - ax, dy = t.y - ay;
      const vis = (dx * dx + dy * dy) <= rr;
      t.visible = vis;
      if (vis) t.lastSeenTs = now;
    }
  }

  draw() {
    const ctx = this.cx, { w, h } = this;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#13203f'; ctx.lineWidth = 1; ctx.setLineDash([2, 10]);
    for (let x = 40; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 40; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.setLineDash([]);

    ctx.strokeStyle = 'rgba(59,130,246,.85)'; // focus
    ctx.fillStyle = 'rgba(59,130,246,.08)';
    ctx.lineWidth = 2.0;
    ctx.beginPath(); ctx.arc(this.agent.x, this.agent.y, this.agent.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    for (const t of this.targets) {
      ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.fillStyle = t.visible ? 'rgba(34,197,94,0.95)' : 'rgba(154,163,178,0.75)';
      ctx.fill();
    }
    ctx.beginPath(); ctx.arc(this.agent.x, this.agent.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#e7eaf6'; ctx.fill(); ctx.strokeStyle = '#151a2c'; ctx.stroke();
  }
}

// グローバル公開
window.CFG = CFG;
window.RNG = RNG;
window.Target = Target;
window.FocusAgent = FocusAgent;
window.World = World;