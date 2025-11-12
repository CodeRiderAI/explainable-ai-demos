# Explainable AI Demos
[English README 🇬🇧](./README_EN.md)

*The beginning of the era where AI creates AI*

## ― 見える思考、理解できるAI ―

このリポジトリは、AdaCore（ADAM）の**思想**を体験できる小さなデモ集です。
各デモは学習モデル非依存・完全スタンドアロン（`standalone.html`）で動作します。

---

## 📦 収録デモ（随時追加）
- **Decision Focus** — 視野と焦点化（関連性の絞り込み）をインタラクティブに体験
  `./decision-focus/standalone.html` ／ [README](./decision-focus/README.md)
- **Reversi (WHY Demo)** — ゲーム文脈で DROP／HOLD／REVIVE の直感を掴む
  `./reversi/standalone.html` ／ [README](./reversi/README.md)

> 今後新しいデモを追加する場合は `./<name>/` 配下に追加します。

---

## 🚀 クイックスタート
1. 任意のデモの `standalone.html` を **ブラウザで開くだけ** で動作します。
2. うまく開けない場合は簡易サーバをご利用ください：
   ```bash
   cd decision-focus
   python3 -m http.server 8080
   # → http://localhost:8080/
   ```

---

## 🧭 このリポジトリの内容

- フレーム問題の「実装的回避」を理解する **最小限の体験**
- DROP / HOLD / REVIVE /（軽）ADAPT / LINEAGE といった **概念の直感**
- 研究・教育・議論に使える **中立的な可視化素材**
- 他に思いついたら適当に追加します(予定は未定)

> 本リポジトリは **思想のデモンストレーション** です。実システムの設計・実装に必要な詳細は別領域で取り扱います。

---

## 💡 背景（思想のスケッチ）
- **すべてを見ない設計**：関連性が高いものだけを見ることで、思考を軽く・透明に。
- **WHY の重要性**：結果だけでなく「なぜ」をデータとして残すことで、再現性と合意形成を支える。
- **学習モデル非依存**：モデルに依らず、**判断構造そのもの**を提示。

---

## 🔐 セキュリティ / プライバシー
- すべてのデモは **ローカルのみで完結**し、外部へ通信しません。
- 実データではなく **合成データ／抽象化データ** を用います。
- ブラウザ互換：最新の Chrome / Edge / Safari / Firefox を想定（モバイルは一部簡略）。

---

## 関連情報 / 引用

本デモは、以下の公開成果物を基盤としています。

- **Proof Pack v0.1.1** — フレーム問題の最小実装解
  DOI: [10.5281/zenodo.17218954](https://doi.org/10.5281/zenodo.17218954)
- **Final Pack v1.0.2** — 実世界（PiCar）での回避デモ・再現性検証
  DOI: [10.5281/zenodo.17218964](https://doi.org/10.5281/zenodo.17218964)

---

## 🧾 ライセンス
MIT License
