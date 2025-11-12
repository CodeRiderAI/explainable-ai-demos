# Explainable AI Demos
[日本語版はこちら 🇯🇵](./README.md)

*The beginning of the era where AI creates AI*

## ― Visible Thinking, Understandable Intelligence ―

This repository provides a set of small, self-contained demos
that embody the **philosophy behind AdaCore (ADAM)**.
Each demo runs completely **standalone** (`standalone.html`),
with no dependency on machine learning models or external servers.

---

## 📦 Included Demos (more coming soon)
- **Decision Focus** — Experience interactive *focus and attention* within a limited visual field.
  `./decision-focus/standalone.html` ／ [README](./decision-focus/README_EN.md)
- **Reversi (WHY Demo)** — Feel the intuition of *DROP / HOLD / REVIVE* in a game context.
  `./reversi/standalone.html` ／ [README](./reversi/README_EN.md)

> New demos will be added under their own directories: `./<name>/`

---

## 🚀 Quick Start
1. Simply open any `standalone.html` file in your browser.
2. If direct opening doesn’t work, run a local server:

```bash
cd decision-focus
python3 -m http.server 8080
# → http://localhost:8080/
```

---

## 🧭 What This Repository Offers

- A **minimal hands-on experience** to understand the implementation-level idea
  behind solving the *Frame Problem*.
- An **intuitive grasp** of concepts like *DROP / HOLD / REVIVE / (light) ADAPT / LINEAGE*.
- **Neutral, educational, and research-friendly visual materials** for exploration and discussion.
- Additional demos or ideas may be added later (plans subject to change).

> This repository serves as a **demonstration of ideas**,
> not a full implementation of any production system.

---

## 💡 Background (Conceptual Sketch)

- **Seeing selectively:** Focus only on the most relevant information to keep reasoning light and transparent.
- **The importance of WHY:** Preserve *why* a decision was made to ensure reproducibility and shared understanding.
- **Model-free architecture:** Highlight the **structure of reasoning itself**, independent of any trained model.

---

## 🔐 Security / Privacy

- All demos run **entirely locally** and do **not** communicate with external servers.
- Only **synthetic or abstract data** are used.
- Browser compatibility: Latest Chrome / Edge / Safari / Firefox recommended.
  (Mobile browsers are supported in simplified mode.)

---

## References / Citations

These demos are based on the following public research artifacts:

- **Proof Pack v0.1.1** — Minimal implementation solving the Frame Problem
  DOI: [10.5281/zenodo.17218954](https://doi.org/10.5281/zenodo.17218954)
- **Final Pack v1.0.2** — Real-world verification with PiCar
  DOI: [10.5281/zenodo.17218964](https://doi.org/10.5281/zenodo.17218964)

---

## 🧾 License
MIT License
