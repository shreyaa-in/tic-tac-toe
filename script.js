/**
 * ============================================================================
 * MODERN TIC TAC TOE — GAME ENGINE & CONTROLLER
 * Full vanilla JavaScript implementation featuring Minimax AI, accessible controls,
 * Web Audio API sound synthesis, responsive grid navigation, and particle confetti.
 * ============================================================================
 */

'use strict';

// ----------------------------------------------------------------------------
// 1. Game Constants & Winning Combinations
// ----------------------------------------------------------------------------
const WINNING_COMBINATIONS = [
  // Rows
  { combo: [0, 1, 2], type: 'row', index: 0, line: { x1: 20, y1: 50, x2: 280, y2: 50 } },
  { combo: [3, 4, 5], type: 'row', index: 1, line: { x1: 20, y1: 150, x2: 280, y2: 150 } },
  { combo: [6, 7, 8], type: 'row', index: 2, line: { x1: 20, y1: 250, x2: 280, y2: 250 } },
  // Columns
  { combo: [0, 3, 6], type: 'col', index: 0, line: { x1: 50, y1: 20, x2: 50, y2: 280 } },
  { combo: [1, 4, 7], type: 'col', index: 1, line: { x1: 150, y1: 20, x2: 150, y2: 280 } },
  { combo: [2, 5, 8], type: 'col', index: 2, line: { x1: 250, y1: 20, x2: 250, y2: 280 } },
  // Diagonals
  { combo: [0, 4, 8], type: 'diag', index: 0, line: { x1: 30, y1: 30, x2: 270, y2: 270 } },
  { combo: [2, 4, 6], type: 'diag', index: 1, line: { x1: 270, y1: 30, x2: 30, y2: 270 } }
];

const STORAGE_KEY_SCORES = 'tictactoe_scores_v2';
const STORAGE_KEY_SOUND = 'tictactoe_sound_enabled';

// ----------------------------------------------------------------------------
// 2. Sound Effects Engine (Web Audio API - 100% Offline & Reliable)
// ----------------------------------------------------------------------------
class SoundController {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = localStorage.getItem(STORAGE_KEY_SOUND) !== 'false';
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem(STORAGE_KEY_SOUND, this.soundEnabled.toString());
    return this.soundEnabled;
  }

  playMoveSound(symbol) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      // Distinct pitches: higher frequency for X, slightly lower warm tone for O
      const freq = symbol === 'X' ? 440 : 330;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playWinSound() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      // Celebratory major arpeggio [C5, E5, G5, C6]
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playDrawSound() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      // Gentle descending two-note chime
      const notes = [440, 370];
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const startTime = now + idx * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playClickSound() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio policy
    }
  }
}

// ----------------------------------------------------------------------------
// 3. Lightweight Confetti Particle FX Engine
// ----------------------------------------------------------------------------
class ConfettiEffect {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animationFrame = null;
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(winnerSymbol) {
    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (!this.canvas || !this.ctx) return;

    this.particles = [];
    const colors = winnerSymbol === 'X'
      ? ['#00f2fe', '#4facfe', '#ffffff', '#38bdf8', '#0284c7']
      : ['#f43f5e', '#d946ef', '#ffffff', '#fb7185', '#ec4899'];

    const count = 55;
    const originX = this.canvas.width / 2;
    const originY = this.canvas.height * 0.42;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        life: 1
      });
    }

    if (!this.animationFrame) {
      this.render();
    }
  }

  render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.98; // drag
      p.rotation += p.rotationSpeed;
      p.life -= 0.016;
      p.opacity = Math.max(0, p.life);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationFrame = requestAnimationFrame(() => this.render());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.animationFrame = null;
    }
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.particles = [];
  }
}

// ----------------------------------------------------------------------------
// 4. Main Game Application
// ----------------------------------------------------------------------------
class TicTacToeGame {
  constructor() {
    // Game State
    this.board = Array(9).fill('');
    this.currentPlayer = 'X'; // 'X' always starts
    this.gameActive = true;
    this.matchCompleted = false; // Prevents duplicate score increments
    this.gameMode = 'pvp'; // 'pvp' | 'pvc'
    this.difficulty = 'hard'; // 'easy' | 'medium' | 'hard'
    this.isComputerThinking = false;
    this.computerTimeoutId = null;
    this.focusedCellIndex = 0;

    // Scores
    this.scores = this.loadScores();

    // Sound & FX
    this.sound = new SoundController();
    this.confetti = new ConfettiEffect('fxCanvas');

    // Cache DOM Elements
    this.dom = {
      boardGrid: document.getElementById('gameBoard'),
      cells: Array.from(document.querySelectorAll('.cell')),
      winningLineSvg: document.getElementById('winningLineSvg'),
      winningLine: document.getElementById('winningLine'),
      statusCard: document.getElementById('statusCard'),
      statusMessage: document.getElementById('statusMessage'),
      turnSubtitle: document.getElementById('turnSubtitle'),
      turnSymbolBadge: document.getElementById('turnSymbolBadge'),
      thinkingSpinner: document.getElementById('thinkingSpinner'),
      modePvpBtn: document.getElementById('modePvpBtn'),
      modePvcBtn: document.getElementById('modePvcBtn'),
      difficultyContainer: document.getElementById('difficultyContainer'),
      diffButtons: Array.from(document.querySelectorAll('.diff-btn')),
      scoreX: document.getElementById('scoreX'),
      scoreDraw: document.getElementById('scoreDraw'),
      scoreO: document.getElementById('scoreO'),
      playerXName: document.getElementById('playerXName'),
      playerOName: document.getElementById('playerOName'),
      scoreCardX: document.getElementById('scoreCardX'),
      scoreCardDraw: document.getElementById('scoreCardDraw'),
      scoreCardO: document.getElementById('scoreCardO'),
      restartRoundBtn: document.getElementById('restartRoundBtn'),
      newGameBtn: document.getElementById('newGameBtn'),
      resetScoreBtn: document.getElementById('resetScoreBtn'),
      soundToggleBtn: document.getElementById('soundToggleBtn'),
      soundIconOn: document.getElementById('soundIconOn'),
      soundIconOff: document.getElementById('soundIconOff'),
      soundLabel: document.getElementById('soundLabel'),
      confirmModal: document.getElementById('confirmModal'),
      cancelResetBtn: document.getElementById('cancelResetBtn'),
      confirmResetBtn: document.getElementById('confirmResetBtn')
    };

    this.bindEvents();
    this.updateSoundButtonUI();
    this.updateScoreboardUI();
    this.updateHoverClasses();
    this.updateStatusDisplay();
  }

  // --------------------------------------------------------------------------
  // Score Persistence
  // --------------------------------------------------------------------------
  loadScores() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SCORES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          typeof parsed.x === 'number' &&
          typeof parsed.o === 'number' &&
          typeof parsed.draws === 'number'
        ) {
          return parsed;
        }
      }
    } catch {
      // LocalStorage access failure fallback
    }
    return { x: 0, o: 0, draws: 0 };
  }

  saveScores() {
    try {
      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(this.scores));
    } catch {
      // LocalStorage access failure fallback
    }
  }

  // --------------------------------------------------------------------------
  // Event Binding
  // --------------------------------------------------------------------------
  bindEvents() {
    // Board Cell Clicks
    this.dom.cells.forEach(cell => {
      cell.addEventListener('click', () => {
        const index = parseInt(cell.dataset.index, 10);
        this.handleCellSelection(index);
      });

      // Keyboard navigation within the board grid
      cell.addEventListener('keydown', (e) => this.handleCellKeydown(e, cell));
    });

    // Board container key navigation fallback
    this.dom.boardGrid.addEventListener('keydown', (e) => {
      if (document.activeElement === this.dom.boardGrid) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.dom.cells[this.focusedCellIndex].focus();
        }
      }
    });

    // Game Mode Toggles
    this.dom.modePvpBtn.addEventListener('click', () => this.setGameMode('pvp'));
    this.dom.modePvcBtn.addEventListener('click', () => this.setGameMode('pvc'));

    // Difficulty Buttons
    this.dom.diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const diff = btn.dataset.difficulty;
        this.setDifficulty(diff);
      });
    });

    // Control Buttons
    this.dom.restartRoundBtn.addEventListener('click', () => {
      this.sound.playClickSound();
      this.restartRound();
    });

    this.dom.newGameBtn.addEventListener('click', () => {
      this.sound.playClickSound();
      this.newGame();
    });

    this.dom.resetScoreBtn.addEventListener('click', () => {
      this.sound.playClickSound();
      this.openResetModal();
    });

    // Sound Toggle
    this.dom.soundToggleBtn.addEventListener('click', () => {
      const enabled = this.sound.toggleSound();
      this.updateSoundButtonUI();
      if (enabled) {
        this.sound.playClickSound();
      }
    });

    // Modal Confirmation Dialog
    this.dom.cancelResetBtn.addEventListener('click', () => {
      this.sound.playClickSound();
      this.closeResetModal();
    });

    this.dom.confirmResetBtn.addEventListener('click', () => {
      this.confirmResetScores();
    });

    // Close modal on Escape or backdrop click
    this.dom.confirmModal.addEventListener('click', (e) => {
      if (e.target === this.dom.confirmModal) {
        this.closeResetModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.dom.confirmModal.classList.contains('hidden')) {
        this.closeResetModal();
      }
    });
  }

  // --------------------------------------------------------------------------
  // Keyboard Accessibility
  // --------------------------------------------------------------------------
  handleCellKeydown(e, cell) {
    const currentIndex = parseInt(cell.dataset.index, 10);
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex - 3 >= 0 ? currentIndex - 3 : currentIndex + 6;
        break;
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = currentIndex + 3 < 9 ? currentIndex + 3 : currentIndex - 6;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentIndex % 3 > 0 ? currentIndex - 1 : currentIndex + 2;
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = currentIndex % 3 < 2 ? currentIndex + 1 : currentIndex - 2;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.handleCellSelection(currentIndex);
        return;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = 8;
        break;
      default:
        return;
    }

    if (nextIndex !== currentIndex && this.dom.cells[nextIndex]) {
      this.focusedCellIndex = nextIndex;
      this.dom.cells[nextIndex].focus();
    }
  }

  // --------------------------------------------------------------------------
  // Core Gameplay Logic
  // --------------------------------------------------------------------------
  handleCellSelection(index) {
    // Reject moves if game is inactive, cell is occupied, or computer is playing
    if (!this.gameActive || this.board[index] !== '' || this.isComputerThinking) {
      return;
    }

    // In PvC mode, human only plays 'X'
    if (this.gameMode === 'pvc' && this.currentPlayer !== 'X') {
      return;
    }

    this.makeMove(index, this.currentPlayer);

    // If game is still active in PvC mode, trigger computer move with natural delay
    if (this.gameActive && this.gameMode === 'pvc' && this.currentPlayer === 'O') {
      this.triggerComputerTurn();
    }
  }

  makeMove(index, player) {
    this.board[index] = player;
    this.sound.playMoveSound(player);

    // Render symbol in cell with accessible label
    const cell = this.dom.cells[index];
    cell.classList.add('taken', `symbol-${player.toLowerCase()}`);
    cell.innerHTML = `<span class="cell-symbol" aria-hidden="true">${player === 'X' ? '✕' : '○'}</span>`;
    
    const row = Math.floor(index / 3) + 1;
    const col = (index % 3) + 1;
    cell.setAttribute('aria-label', `Row ${row}, Column ${col}, occupied by ${player}`);

    // Check game outcome
    const winResult = this.checkWin(this.board);

    if (winResult) {
      this.handleGameWin(winResult);
    } else if (this.isBoardFull(this.board)) {
      this.handleGameDraw();
    } else {
      // Switch player turn
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      this.updateHoverClasses();
      this.updateStatusDisplay();
    }
  }

  triggerComputerTurn() {
    this.isComputerThinking = true;
    this.dom.thinkingSpinner.classList.remove('hidden');
    this.updateStatusDisplay();

    // Natural human-like pause before making computer move
    this.cancelPendingComputerMove();
    this.computerTimeoutId = setTimeout(() => {
      this.isComputerThinking = false;
      this.dom.thinkingSpinner.classList.add('hidden');

      if (!this.gameActive) return;

      const bestMove = this.calculateComputerMove();
      if (bestMove !== null && bestMove >= 0 && this.board[bestMove] === '') {
        this.makeMove(bestMove, 'O');
      }
    }, 450);
  }

  cancelPendingComputerMove() {
    if (this.computerTimeoutId) {
      clearTimeout(this.computerTimeoutId);
      this.computerTimeoutId = null;
    }
    this.isComputerThinking = false;
    this.dom.thinkingSpinner.classList.add('hidden');
  }

  // --------------------------------------------------------------------------
  // AI Difficulty Algorithms
  // --------------------------------------------------------------------------
  calculateComputerMove() {
    switch (this.difficulty) {
      case 'easy':
        return this.getEasyMove();
      case 'medium':
        return this.getMediumMove();
      case 'hard':
      default:
        return this.getHardMinimaxMove();
    }
  }

  getEmptyIndices(board) {
    const empties = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') empties.push(i);
    }
    return empties;
  }

  // 1. Easy: Pure random selection among available empty cells
  getEasyMove() {
    const empties = this.getEmptyIndices(this.board);
    if (empties.length === 0) return null;
    return empties[Math.floor(Math.random() * empties.length)];
  }

  // 2. Medium: Smart tactical rules (Win > Block > Center > Corners > Random)
  getMediumMove() {
    const empties = this.getEmptyIndices(this.board);
    if (empties.length === 0) return null;

    // Check if AI ('O') can win immediately in 1 move
    for (const idx of empties) {
      this.board[idx] = 'O';
      const win = this.checkWin(this.board);
      this.board[idx] = '';
      if (win && win.winner === 'O') return idx;
    }

    // Check if Human ('X') can win on next move; block immediately!
    for (const idx of empties) {
      this.board[idx] = 'X';
      const win = this.checkWin(this.board);
      this.board[idx] = '';
      if (win && win.winner === 'X') return idx;
    }

    // Center preference (70% probability if center is open)
    if (this.board[4] === '' && Math.random() < 0.7) {
      return 4;
    }

    // Corner preference
    const openCorners = [0, 2, 6, 8].filter(i => this.board[i] === '');
    if (openCorners.length > 0 && Math.random() < 0.6) {
      return openCorners[Math.floor(Math.random() * openCorners.length)];
    }

    // Otherwise random available cell
    return empties[Math.floor(Math.random() * empties.length)];
  }

  // 3. Hard: Unbeatable Minimax Algorithm
  getHardMinimaxMove() {
    let bestScore = -Infinity;
    let bestMove = null;
    const empties = this.getEmptyIndices(this.board);

    // If full board or no empties
    if (empties.length === 0) return null;

    // Fast-path opening: if board is empty or human took corner/edge, picking center is optimal
    if (empties.length === 8 && this.board[4] === '') {
      return 4;
    }

    for (const idx of empties) {
      this.board[idx] = 'O'; // Computer is 'O' (Maximizer)
      const score = this.minimax(this.board, 0, false);
      this.board[idx] = '';

      if (score > bestScore) {
        bestScore = score;
        bestMove = idx;
      }
    }

    return bestMove !== null ? bestMove : empties[0];
  }

  minimax(board, depth, isMaximizing) {
    const winResult = this.checkWin(board);

    if (winResult) {
      // Score penalized by depth: favors fast wins and delayed losses
      if (winResult.winner === 'O') return 10 - depth;
      if (winResult.winner === 'X') return depth - 10;
    }

    if (this.isBoardFull(board)) {
      return 0; // Draw
    }

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = 'O';
          const score = this.minimax(board, depth + 1, false);
          board[i] = '';
          maxScore = Math.max(score, maxScore);
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = 'X';
          const score = this.minimax(board, depth + 1, true);
          board[i] = '';
          minScore = Math.min(score, minScore);
        }
      }
      return minScore;
    }
  }

  // --------------------------------------------------------------------------
  // Win & Draw Detection
  // --------------------------------------------------------------------------
  checkWin(board) {
    for (const winCombo of WINNING_COMBINATIONS) {
      const [a, b, c] = winCombo.combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return {
          winner: board[a],
          combo: winCombo.combo,
          line: winCombo.line
        };
      }
    }
    return null;
  }

  isBoardFull(board) {
    return board.every(cell => cell !== '');
  }

  // --------------------------------------------------------------------------
  // Game Termination Handlers
  // --------------------------------------------------------------------------
  handleGameWin(winResult) {
    this.gameActive = false;
    const winner = winResult.winner;

    // Highlight winning cells
    winResult.combo.forEach(idx => {
      this.dom.cells[idx].classList.add('winning-cell');
    });

    // Draw dynamic winning strike line
    this.drawWinningStrikeLine(winResult);

    // Audio & Particle FX
    this.sound.playWinSound();
    this.confetti.burst(winner);

    // Update Scores (strictly once per match)
    if (!this.matchCompleted) {
      this.matchCompleted = true;
      if (winner === 'X') {
        this.scores.x++;
        this.bumpScoreCard(this.dom.scoreCardX);
      } else {
        this.scores.o++;
        this.bumpScoreCard(this.dom.scoreCardO);
      }
      this.saveScores();
      this.updateScoreboardUI();
    }

    // Status Banner Updates
    this.dom.statusCard.className = `status-card winner-${winner.toLowerCase()}`;
    this.dom.turnSubtitle.textContent = 'Match Result';

    if (this.gameMode === 'pvc') {
      if (winner === 'X') {
        this.dom.statusMessage.textContent = 'You Win! 🎉';
      } else {
        this.dom.statusMessage.textContent = 'Computer Wins! 🤖';
      }
    } else {
      const winnerName = winner === 'X' ? 'Player 1' : 'Player 2';
      this.dom.statusMessage.textContent = `${winnerName} Wins! 🎉`;
    }

    this.dom.turnSymbolBadge.innerHTML = `<span class="badge-symbol">${winner === 'X' ? '✕' : '○'}</span>`;
  }

  handleGameDraw() {
    this.gameActive = false;

    // Audio FX
    this.sound.playDrawSound();

    // Update Scores (strictly once per match)
    if (!this.matchCompleted) {
      this.matchCompleted = true;
      this.scores.draws++;
      this.bumpScoreCard(this.dom.scoreCardDraw);
      this.saveScores();
      this.updateScoreboardUI();
    }

    // Status Banner Updates
    this.dom.statusCard.className = 'status-card draw-game';
    this.dom.turnSubtitle.textContent = 'Match Result';
    this.dom.statusMessage.textContent = "It's a Draw! 🤝";
    this.dom.turnSymbolBadge.innerHTML = `<span class="badge-symbol">═</span>`;
  }

  drawWinningStrikeLine(winResult) {
    const { line, winner } = winResult;
    this.dom.winningLine.setAttribute('x1', line.x1);
    this.dom.winningLine.setAttribute('y1', line.y1);
    this.dom.winningLine.setAttribute('x2', line.x2);
    this.dom.winningLine.setAttribute('y2', line.y2);

    const winnerColor = winner === 'X' ? 'var(--color-x)' : 'var(--color-o)';
    this.dom.winningLine.style.stroke = winnerColor;
    this.dom.winningLineSvg.classList.remove('hidden');
  }

  hideWinningStrikeLine() {
    this.dom.winningLineSvg.classList.add('hidden');
  }

  bumpScoreCard(card) {
    card.classList.remove('score-bump');
    // Force reflow
    void card.offsetWidth;
    card.classList.add('score-bump');
    setTimeout(() => card.classList.remove('score-bump'), 400);
  }

  // --------------------------------------------------------------------------
  // UI & Status Display Updates
  // --------------------------------------------------------------------------
  updateStatusDisplay() {
    if (!this.gameActive) return;

    const isX = this.currentPlayer === 'X';
    this.dom.statusCard.className = `status-card turn-${isX ? 'x' : 'o'}`;
    this.dom.turnSubtitle.textContent = 'Current Move';

    if (this.gameMode === 'pvc') {
      if (this.isComputerThinking) {
        this.dom.statusMessage.textContent = 'Computer is thinking...';
      } else {
        this.dom.statusMessage.textContent = isX ? 'Your Turn (X)' : "Computer's Turn (O)";
      }
    } else {
      this.dom.statusMessage.textContent = isX ? "Player 1's Turn (X)" : "Player 2's Turn (O)";
    }

    this.dom.turnSymbolBadge.innerHTML = `<span class="badge-symbol">${isX ? '✕' : '○'}</span>`;
  }

  updateHoverClasses() {
    const board = this.dom.boardGrid;
    board.classList.remove('turn-x-hover', 'turn-o-hover');

    if (this.gameActive && (!this.isComputerThinking || this.gameMode === 'pvp')) {
      if (this.gameMode === 'pvc' && this.currentPlayer === 'O') {
        // No hover preview during computer's turn
        return;
      }
      board.classList.add(this.currentPlayer === 'X' ? 'turn-x-hover' : 'turn-o-hover');
    }
  }

  updateScoreboardUI() {
    this.dom.scoreX.textContent = this.scores.x;
    this.dom.scoreDraw.textContent = this.scores.draws;
    this.dom.scoreO.textContent = this.scores.o;

    if (this.gameMode === 'pvc') {
      this.dom.playerXName.textContent = 'You (X)';
      this.dom.playerOName.textContent = 'Computer (O)';
    } else {
      this.dom.playerXName.textContent = 'Player 1 (X)';
      this.dom.playerOName.textContent = 'Player 2 (O)';
    }
  }

  updateSoundButtonUI() {
    const enabled = this.sound.soundEnabled;
    this.dom.soundToggleBtn.setAttribute('aria-pressed', enabled.toString());
    if (enabled) {
      this.dom.soundIconOn.classList.remove('hidden');
      this.dom.soundIconOff.classList.add('hidden');
      this.dom.soundLabel.textContent = 'Sound: On';
    } else {
      this.dom.soundIconOn.classList.add('hidden');
      this.dom.soundIconOff.classList.remove('hidden');
      this.dom.soundLabel.textContent = 'Sound: Muted';
    }
  }

  // --------------------------------------------------------------------------
  // Controls & Round Resets
  // --------------------------------------------------------------------------
  restartRound() {
    this.cancelPendingComputerMove();
    this.confetti.stop();
    this.board = Array(9).fill('');
    this.currentPlayer = 'X';
    this.gameActive = true;
    this.matchCompleted = false;

    // Reset Cells DOM
    this.dom.cells.forEach((cell, idx) => {
      cell.className = 'cell';
      cell.innerHTML = '';
      const row = Math.floor(idx / 3) + 1;
      const col = (idx % 3) + 1;
      cell.setAttribute('aria-label', `Row ${row}, Column ${col}, Empty`);
    });

    this.hideWinningStrikeLine();
    this.updateHoverClasses();
    this.updateStatusDisplay();
  }

  newGame() {
    // Fresh board and turn reset
    this.restartRound();
  }

  // --------------------------------------------------------------------------
  // Mode & Difficulty Switches
  // --------------------------------------------------------------------------
  setGameMode(mode) {
    if (this.gameMode === mode) return;

    this.sound.playClickSound();
    this.gameMode = mode;

    if (mode === 'pvp') {
      this.dom.modePvpBtn.classList.add('active');
      this.dom.modePvpBtn.setAttribute('aria-selected', 'true');
      this.dom.modePvcBtn.classList.remove('active');
      this.dom.modePvcBtn.setAttribute('aria-selected', 'false');
      this.dom.difficultyContainer.classList.add('hidden');
      this.dom.difficultyContainer.setAttribute('aria-hidden', 'true');
    } else {
      this.dom.modePvcBtn.classList.add('active');
      this.dom.modePvcBtn.setAttribute('aria-selected', 'true');
      this.dom.modePvpBtn.classList.remove('active');
      this.dom.modePvpBtn.setAttribute('aria-selected', 'false');
      this.dom.difficultyContainer.classList.remove('hidden');
      this.dom.difficultyContainer.setAttribute('aria-hidden', 'false');
    }

    this.updateScoreboardUI();
    this.restartRound();
  }

  setDifficulty(level) {
    if (this.difficulty === level) return;

    this.sound.playClickSound();
    this.difficulty = level;

    this.dom.diffButtons.forEach(btn => {
      const isCurrent = btn.dataset.difficulty === level;
      btn.classList.toggle('active', isCurrent);
      btn.setAttribute('aria-checked', isCurrent.toString());
    });

    // Reset round seamlessly on difficulty change
    this.restartRound();
  }

  // --------------------------------------------------------------------------
  // Reset Scores Modal Dialog
  // --------------------------------------------------------------------------
  openResetModal() {
    this.dom.confirmModal.classList.remove('hidden');
    this.dom.cancelResetBtn.focus();
  }

  closeResetModal() {
    this.dom.confirmModal.classList.add('hidden');
    this.dom.resetScoreBtn.focus();
  }

  confirmResetScores() {
    this.sound.playClickSound();
    this.scores = { x: 0, o: 0, draws: 0 };
    this.saveScores();
    this.updateScoreboardUI();
    this.closeResetModal();

    // Visual bump feedback on all three score cards
    this.bumpScoreCard(this.dom.scoreCardX);
    this.bumpScoreCard(this.dom.scoreCardDraw);
    this.bumpScoreCard(this.dom.scoreCardO);
  }
}

// ----------------------------------------------------------------------------
// 5. Initialize Game on DOMContentLoaded
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  window.ticTacToe = new TicTacToeGame();
});
