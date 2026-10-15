# 🎮 Modern Tic Tac Toe Web Game

A sleek, modern, accessible, and interactive **Tic Tac Toe** web application built with pure **HTML5, CSS3, and Vanilla JavaScript**. Featuring a mobile-first responsive layout, dark gaming aesthetics, sound synthesis via the Web Audio API, and an unbeatable AI powered by the **Minimax Algorithm**.

---

## ✨ Features

- **🎮 Two Playable Modes**:
  - **Player vs Player (PvP)**: Two players can compete locally on the same device with real-time turn tracking.
  - **Player vs Computer (PvC)**: Challenge an AI with 3 distinct difficulty settings:
    - 🟢 **Easy**: Random available moves for casual fun.
    - 🟡 **Medium**: Tactical play (blocks opponent wins, takes immediate wins, prioritizes the center and corners).
    - 🔴 **Hard**: Optimal play powered by the **Minimax Algorithm** (unbeatable).
- **🎨 Modern Dark Gaming Theme**:
  - Deep obsidian and charcoal background with subtle ambient glows.
  - Electric Cyan (`#00f2fe`) for **Player X** and Neon Fuchsia (`#f43f5e`) for **Player O**.
  - Glassmorphic panels with smooth backdrop blur.
  - Interactive hover ghosts and tactile mobile tap feedback.
- **🏆 Winning Animations & FX**:
  - Radiant glowing pulse on winning combinations.
  - Dynamic SVG strike-through line drawing across winning cells.
  - Lightweight 2D canvas confetti celebration.
- **📊 Persistent Scoreboard**:
  - Tracks Player X wins, Player O/Computer wins, and Ties.
  - Automatically saved in browser `localStorage`.
  - Accessible modal dialog for safe score resets.
- **🔊 Web Audio API Sound Effects**:
  - Real-time synthesized audio feedback for moves, wins, ties, and clicks.
  - No external audio files needed; 100% offline and reliable.
  - Sound on/off toggle with state persisted in `localStorage`.
- **♿ Accessibility (A11y)**:
  - Full keyboard grid navigation using Arrow keys, Enter, and Space.
  - Semantic HTML with `aria-live="polite"` status announcements and dynamic cell descriptions.
  - Supports `prefers-reduced-motion` for motion-sensitive users.

---

## 📁 Project Structure

```
├── index.html     # Semantic structure, accessible markup, and layout
├── style.css      # Custom styling, dark neon design system, and responsive grid
├── script.js      # Game state engine, Minimax AI, Audio synthesizer, and particle FX
├── .gitignore     # Git ignore rules
└── README.md      # Project documentation
```

---

## 🚀 Getting Started

### Option 1: Run with VS Code Live Server
1. Clone the repository:
   ```bash
   git clone https://github.com/shreyaa-in/tic-tac-toe.git
   cd tic-tac-toe
   ```
2. Open the project in **Visual Studio Code**:
   ```bash
   code .
   ```
3. Install the **Live Server** extension by Ritwick Dey if you haven't already.
4. Right-click `index.html` and select **"Open with Live Server"**.

### Option 2: Run Directly in Any Browser
Simply double-click `index.html` or open it with any modern web browser (Chrome, Edge, Firefox, Safari).

---

## 🧠 The Minimax Algorithm

In **Hard Mode**, the computer opponent evaluates every potential game state recursively using the Minimax theorem. Depth-based scoring ensures that the AI:
1. Favors quick, direct wins over prolonged games.
2. Defends against and delays opponent victories.
3. Guarantees that the human player cannot win against the computer (a tie is the optimal outcome for the player).

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
