# Explainable AI Demos — Visualization of the Frame Problem Solved
[日本語版はこちら 🇯🇵](./README.md)

**Purpose**
This demo lets you experience an AI that can explain
*why* it discarded, *why* it held, and *why* it adopted a move.
It runs entirely offline without any trained models, visualizing the AI’s reasoning process transparently.

---

## How to Run
- Open `index.html` in your browser (works offline).
- Or use `standalone.html` for a single-file version.

---

## Directory
```
explainable-ai-demos/
├── LICENSE
├── README.md
├── README_EN.md
└── reversi/
    ├── index.html
    ├── style.css
    ├── js/
    │   ├── reversi-engine.js
    │   ├── ai-logic.js
    │   └── ui-renderer.js
    └── standalone.html
```

---

## Features
- No learning, no server connection — completely local
- Classifies candidate moves into **DROP / HOLD / REVIVE** and explains them in natural language
- Saves WHY logs in `.jsonl` format
- Generates a **WHY × Win/Loss correlation report** after each match
- Balanced search (depth 3–4 / 250 ms) — lightweight yet reasonably strong
- Ideal for education, lectures, and research demonstrations

---

## Background
This demo demonstrates a *practical avoidance* of the **Frame Problem** —
the challenge of “seeing only what is relevant.”
Reversi is used here as a simple environment to illustrate this idea.

> - **DROP**: Irrelevant in the current context
> - **HOLD**: Uncertain, kept for possible future relevance
> - **REVIVE**: Re-evaluated and found important again

---

## Design Notes
### Evaluation Coefficients
| Feature | Coefficient | Purpose |
|----------|-------------|----------|
| `myCorners` | **+2.2** | Corners are decisive in endgame; highest priority. |
| `stEdges` | **+1.2** | Stable edges affect local fights; medium weight. |
| `myMob` | **+0.4** | Mobility gives short-term flexibility; small bonus. |
| `oppMob` | **-0.5** | Reducing opponent mobility is advantageous; slight penalty. |
| `xRisk` | **-1.6** | X-squares (next to corners) are dangerous; strong penalty. |

> These weights are *rule-based design parameters*,
> not learned values — they encode human strategic insight transparently.

### Search Depth and Performance
The demo runs in **Balanced mode** (depth 3–4, ≈250 ms per move).
This is not a limitation of JavaScript, but an intentional design choice
to illustrate the **efficiency of relevance focusing under limited resources** —
the practical essence of the frame problem.

> You can increase the depth, but the goal is not exhaustive search.
> It is to experience *intelligent omission* — focusing only on the most relevant parts.

---

## Use Cases
- Educational material for **Explainable AI (XAI)**
- Conceptual understanding of the **Frame Problem**
- Demonstrations in research or lectures
- Example of “AI explaining AI”

---

## License
MIT License — free to use and modify (please keep this notice).

---

## Related Work / Citation

This demo builds upon the following published works:

- **Proof Pack v0.1.1** — Minimal reproducible core for the Frame Problem
  DOI: [10.5281/zenodo.17218954](https://doi.org/10.5281/zenodo.17218954)
- **Final Pack v1.0.2** — Real-world PiCar demonstration and reproducibility notes
  DOI: [10.5281/zenodo.17218964](https://doi.org/10.5281/zenodo.17218964)

> WHY Reversi Demo is an educational derivative designed to
> visualize the *practical avoidance* of the Frame Problem.