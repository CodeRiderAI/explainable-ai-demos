// =====================
// focus-logic.js (no-module)
// 判定と統計・ログ（VISIBLE / IGNORED）
// =====================

class FocusLogic {
  constructor(world) {
    this.world = world;
    this.events = 0;
    this.visible = 0;
    this.hidden = 0;
    this.logs = []; // JSONL
  }

  snapshot() {
    const vis = this.world.targets.filter(t => t.visible).map(t => ({
      id: t.id,
      x: +t.x.toFixed(1), y: +t.y.toFixed(1),
      dist: +Math.hypot(t.x - this.world.agent.x, t.y - this.world.agent.y).toFixed(1),
      why: "VISIBLE (inside focus radius)"
    }));
    const hid = this.world.targets.length - vis.length;
    this.events++;
    this.visible = vis.length;
    this.hidden = hid;

    this.logs.push({
      ts: new Date().toISOString(),
      kind: "TICK",
      focus: { x: +this.world.agent.x.toFixed(1), y: +this.world.agent.y.toFixed(1), r: window.CFG.focusRadius },
      visible_ids: vis.slice(0, 24).map(v => v.id),
      counts: { visible: this.visible, hidden: this.hidden }
    });

    return vis;
  }

  download() {
    const jsonl = this.logs.map(o => JSON.stringify(o)).join('\n');
    const blob = new Blob([jsonl], { type: "application/json" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `decision_focus_log_${Date.now()}.jsonl`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}

function createWorld(canvas) {
  return new window.World(canvas);
}

// グローバル公開
window.FocusLogic = FocusLogic;
window.createWorld = createWorld;