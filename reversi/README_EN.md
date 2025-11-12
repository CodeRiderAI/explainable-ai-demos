# WHY Reversi — Visualized Thinking Demo

Experience how an AI can explain *why* it chose a particular move.
This demo embodies the concept of **Explainable AI (XAI)** through the classic game of Reversi.

---

## 🎮 Controls

| Action | Description |
|--------|-------------|
| Click on a square | The AI responds automatically and analyzes the next move. |
| WHY Log View | Classifies candidate moves into DROP / HOLD / REVIVE categories. |
| Score Visualization | Displays evaluation values and confidence in real time. |

> - **DROP**: Judged irrelevant in the current context
> - **HOLD**: Deferred due to insufficient certainty
> - **REVIVE**: Reconsidered and adopted as important after re-evaluation

---

## Design Philosophy

### Evaluation Formula
| Element | Weight | Purpose |
|----------|---------|----------|
| `myCorners` | **+2.2** | Corner control is decisively advantageous in the endgame. Assigned the highest weight due to its absolute strategic value. |
| `stEdges` | **+1.2** | Stable edges influence mid-game battles, thus moderately rewarded. |
| `myMob` | **+0.4** | Mobility (number of playable moves) represents short-term flexibility, lightly valued. |
| `oppMob` | **-0.5** | Reducing opponent mobility is favorable; assigned a negative sign to suppress it. |
| `xRisk` | **-1.6** | The X-square (adjacent to corners) is dangerous. Strongly penalized for the risk of conceding corners. |

> These weights are based on **design principles, not training**,
> translating human strategic insight into transparent code.

### Search Depth and Performance
This demo operates in **Balanced mode** (depth 3–4, about 250 ms per move).
This configuration not only limits computational load in JavaScript environments but also serves as an **intentional constraint**
to demonstrate the *frame problem avoidance philosophy*:
**“Focus limited resources on the most relevant parts.”**

> To experience *intelligent omission through focus* rather than exhaustive search,
> this demo is deliberately designed to remain lightweight.

---

## ⚙️ How to Run

```bash
# Run a local server
cd reversi
python3 -m http.server 8080
# http://localhost:8080/standalone.html

Or simply open `standalone.html` directly in your browser.

---

## 📝 Related

- [Decision Focus Demo](../decision-focus/README_EN.md)

---

## 📜 License

MIT License
