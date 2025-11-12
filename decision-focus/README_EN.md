# Decision Focus — Focus and Selective Perception Demo

This demo allows you to experience how an AI can "choose not to see everything".
By adjusting view radius, target count, and speed, you can intuitively understand the idea of **focus**.

---

## 🎮 Controls

| Action | Description |
|--------|--------------|
| ▶️ **Start / Pause / Reset** | Start, pause, or reset the simulation. |
| 🖱️ **Follow Mouse** | When checked, the focus follows your mouse position. |
| 🎚️ **View Radius / Target Count / Speed** | Adjust perception radius, number of targets, and motion speed in real time. |
| 💾 **Save Log** | Download current focus data as a JSON file. |

---

## 🧠 Concept

- **Frame Problem Visualization**
  → Instead of considering everything, optimize within the visible range.
- **Focus**
  → Dynamically update the area of attention according to surrounding information density.
- **Separation of Perception and Attention**
  → Clarify the boundary between what is *visible* and what is *considered*.

---

## ⚙️ How to Run

```bash
# Run locally
python3 -m http.server 8080
# Then open http://localhost:8080/standalone.html in your browser
```

You can also open the file directly in your browser (fully standalone).

---

## 📝 Related

- [Reversi Demo](../reversi/README_EN.md)

---

## 📜 License

MIT License
