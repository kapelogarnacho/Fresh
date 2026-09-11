/* =====================================================
   FRESH ENTERTAINMENT – MAIN SCRIPT (script.js)
   ===================================================== */

// ---------- 1. FIREBASE INITIALIZATION ----------
const firebaseConfig = {
  apiKey: "AIzaSyA9Bb3ySLVKdlsrMmJD_iGFw2cbCplxFbI",
  authDomain: "fresh-entertainment.firebaseapp.com",
  projectId: "fresh-entertainment",
  storageBucket: "fresh-entertainment.firebasestorage.app",
  messagingSenderId: "394515293409",
  appId: "1:394515293409:web:9a8d47e04e515b660a83a0",
  measurementId: "G-5KSB33VJR6"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// ---------- 2. GLOBAL STATE ----------
let partyMode = false;
let partyInterval;
let mouseListener;
let marketInterval;

// ---------- 3. UI & NAVIGATION ----------
function scrollToRegister() {
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

function toggleProfile() {
  const modal = document.getElementById('user-profile-modal');
  modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function openSection(sectionId) {
  document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('active');
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

function handleEnter(event, callback) {
  if (event.key === 'Enter') {
    event.preventDefault();
    callback();
  }
}

function scrollEvents(direction) {
  const slider = document.getElementById('event-slider');
  if (slider) slider.scrollBy({ left: direction * 150, behavior: 'smooth' });
}

function toggleBio() {
  alert("Fresh Entertainment Studio - World Class Interactive Portal.");
}

function editProfile() { alert("Profile Editor Opened"); }
function addFriend() { alert("Friend Request Sent!"); }
function likeUser() { alert("Liked user profile ❤️"); }
function selectEvent(el) { alert("Event Selected: " + el.innerText); }
function viewStory(user) { alert("Opening story for " + user); }
function contacts() { alert("Contacts loaded"); }
function shoping() { alert("Shop feature coming soon!"); }

// ---------- 4. PARTY MODE ----------
function toggleParty() {
  partyMode = !partyMode;
  document.body.classList.toggle('party-mode', partyMode);

  const container = document.getElementById('party-emojis');

  if (partyMode) {
    mouseListener = (e) => {
      const dot = document.createElement('div');
      dot.className = 'trail-dot';
      dot.style.left = e.pageX + 'px';
      dot.style.top = e.pageY + 'px';
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 1000);
    };
    document.addEventListener('mousemove', mouseListener);

    partyInterval = setInterval(() => {
      if (!container) return;
      const emoji = document.createElement('div');
      emoji.innerText = ['🔥', '⚡', '🎵', '💿', '💃', '🕺'][Math.floor(Math.random() * 6)];
      emoji.className = 'float-emoji';
      emoji.style.left = Math.random() * 100 + '%';
      container.appendChild(emoji);
      setTimeout(() => emoji.remove(), 4000);
    }, 500);

    playSynthTone(600, 'sawtooth', 0.4);
    showToast('PARTY MODE ENGAGED!');
  } else {
    clearInterval(partyInterval);
    if (container) container.innerHTML = '';
    if (mouseListener) document.removeEventListener('mousemove', mouseListener);
    showToast('Party mode deactivated.');
  }
}

function playSynthTone(freq, type = 'sine', duration = 0.2) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function showToast(msg) {
  const container = document.getElementById('toast-container') || (() => {
    const div = document.createElement('div');
    div.id = 'toast-container';
    div.style.cssText = 'position:fixed; top:20px; right:20px; z-index:9999;';
    document.body.appendChild(div);
    return div;
  })();
  const toast = document.createElement('div');
  toast.style.cssText = 'background:#111; color:#00FFFF; padding:10px 20px; border:1px solid #00FFFF; margin-bottom:10px; border-radius:8px; font-family:Orbitron, monospace; font-size:0.8rem;';
  toast.innerText = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ---------- 5. VAULT ACCESS & REGISTRATION ----------
async function registerUser(event) {
  event.preventDefault();
  const username = document.getElementById('username-signup').value.trim();

  if (username) {
    try {
      await db.collection("users").doc(username).set({
        username: username,
        joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
        points: 0,
        rank: "ROOKIE"
      });
      localStorage.setItem('freshUser', username);
      alert(`WELCOME TO THE CLUB, ${username}. Your vault key is ready.`);

      document.getElementById('contact').style.display = 'none';
      document.getElementById('market-section').style.display = 'block';
      document.getElementById('market-user').innerText = username;
      startMarketSimulation();

      document.getElementById('joinForm').reset();
    } catch (e) {
      console.error("Error adding user: ", e);
      alert(`Welcome, ${username}! (Offline Mode)`);
      localStorage.setItem('freshUser', username);

      document.getElementById('contact').style.display = 'none';
      document.getElementById('market-section').style.display = 'block';
      document.getElementById('market-user').innerText = username;
      startMarketSimulation();
    }
  }
}

function enterVault(event) {
  event.preventDefault();
  const keyInput = document.getElementById('vault-key').value.trim();
  const panel = document.getElementById('vault-panel');
  const storedUser = localStorage.getItem('freshUser');

  if (storedUser && keyInput === storedUser) {
    panel.classList.add('unlocked');
    document.getElementById('vault-text').innerText = "🔓 ACCESS GRANTED";
    document.getElementById('vault-text').style.color = "#00ff00";
    panel.style.boxShadow = "0 0 100px #00ff00";

    setTimeout(() => {
      window.location.href = "the_vault.html";
    }, 1500);
  } else {
    panel.style.animation = "shake 0.5s";
    setTimeout(() => panel.style.animation = "", 500);
    alert("ACCESS DENIED. REGISTER FIRST IN 'JOIN THE CLUB'.");
  }
}

// ---------- 6. LIVE MARKET SIMULATION ----------
let marketData = [
  { symbol: 'FRESH', price: 100, change: 0, volume: 1000 },
  { symbol: 'NEON', price: 250, change: 0, volume: 500 },
  { symbol: 'CYBER', price: 75, change: 0, volume: 2000 },
  { symbol: 'VIBE', price: 180, change: 0, volume: 750 },
  { symbol: 'GLOW', price: 320, change: 0, volume: 300 },
  { symbol: 'PULSE', price: 45, change: 0, volume: 1500 }
];

function startMarketSimulation() {
  if (marketInterval) clearInterval(marketInterval);
  renderMarket();
  marketInterval = setInterval(() => {
    marketData.forEach(stock => {
      const delta = (Math.random() - 0.5) * 5;
      stock.price = Math.max(10, stock.price + delta);
      stock.change = (stock.price - 100) / 100;
      stock.volume += Math.floor(Math.random() * 100);
    });
    renderMarket();
  }, 3000);
}

function renderMarket() {
  const ticker = document.getElementById('ticker-track');
  const body = document.getElementById('market-body');
  if (!ticker || !body) return;

  ticker.innerHTML = marketData.map(stock =>
    `<span class="ticker-item">${stock.symbol}: $${stock.price.toFixed(2)} ${stock.change >= 0 ? '▲' : '▼'}</span>`
  ).join('');

  body.innerHTML = marketData.map(stock => {
    const changeClass = stock.change >= 0 ? 'green' : 'red';
    const arrow = stock.change >= 0 ? '▲' : '▼';
    const changePercent = (stock.change * 100).toFixed(2);
    return `
      <tr>
        <td>${stock.symbol}</td>
        <td>$${stock.price.toFixed(2)}</td>
        <td class="${changeClass}">${arrow} ${changePercent}%</td>
        <td>${stock.volume}</td>
      </tr>
    `;
  }).join('');
}

// ---------- 7. LOGOUT ----------
function logoutUser() {
  localStorage.removeItem('freshUser');
  document.getElementById('market-section').style.display = 'none';
  document.getElementById('contact').style.display = 'block';
  if (marketInterval) clearInterval(marketInterval);
  showToast('Logged out. Welcome back!');
}

// ---------- 8. CHAT & REVIEWS ----------
function sendMessage() {
  const input = document.getElementById('chat-input');
  const display = document.getElementById('chat-display');
  if (input && input.value.trim() !== "") {
    const msg = document.createElement('p');
    msg.innerHTML = `<strong>You:</strong> ${input.value}`;
    display.appendChild(msg);
    input.value = "";
    display.scrollTop = display.scrollHeight;
  }
}

function postReview() {
  const text = document.getElementById('rev-text');
  const display = document.getElementById('reviews-display');
  const username = localStorage.getItem('freshUser') || "Fresh_Guest";

  if (text && text.value.trim() !== "") {
    const review = document.createElement('div');
    review.className = 'review-card';
    review.innerHTML = `<strong style="color:#00FFFF;">${username}:</strong><p>${text.value}</p>`;
    display.prepend(review);
    text.value = "";
  }
}

// ---------- 9. MEDIA & UPLOADS ----------
function playMusic(input) {
  const playerArea = document.getElementById('music-player-area');
  if (input.files && input.files[0]) {
    const url = URL.createObjectURL(input.files[0]);
    playerArea.innerHTML = `<audio controls autoplay src="${url}" style="width:100%; margin-top:10px;"></audio>`;
  }
}

function uploadToFeed(input) {
  if (input.files && input.files[0]) {
    const feed = document.getElementById('main-feed');
    const url = URL.createObjectURL(input.files[0]);
    const newItem = document.createElement('div');
    newItem.className = 'feed-item';
    newItem.innerHTML = `
      <video src="${url}" loop autoplay onclick="this.paused ? this.play() : this.pause()"></video>
      <p class="vid-caption">@User_Upload #FreshEnt</p>
    `;
    feed.prepend(newItem);
  }
}

/* ============================================================
   MINI‑GAME LOGIC
   ============================================================ */

// -------------------- 10. NEON CLICKER --------------------
let score = 0;

function increaseScore() {
  score++;
  document.getElementById('score').innerText = score;
  // Optional shake effect
  const parent = document.getElementById('score').parentElement;
  parent.style.transform = 'scale(1.1)';
  setTimeout(() => parent.style.transform = 'scale(1)', 100);
}

function resetScore() {
  score = 0;
  document.getElementById('score').innerText = score;
}

// -------------------- 11. TIC‑TAC‑TOE --------------------
let tttBoard = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let tttScoreX = 0, tttScoreO = 0;
let tttGameOver = false;

const winCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function createTTT() {
  const boardEl = document.getElementById('ttt-board');
  if (!boardEl) return;
  boardEl.innerHTML = "";
  tttBoard.forEach((cell, i) => {
    const div = document.createElement('div');
    div.innerText = cell;
    div.onclick = () => handleTTT(i);
    boardEl.appendChild(div);
  });
  updateTTTScore();
}

function handleTTT(index) {
  if (tttBoard[index] !== "" || tttGameOver) return;
  tttBoard[index] = currentPlayer;
  createTTT();
  checkTTTWin();
  if (!tttGameOver) {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
  }
}

function checkTTTWin() {
  for (let combo of winCombos) {
    const [a,b,c] = combo;
    if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) {
      tttGameOver = true;
      if (tttBoard[a] === "X") tttScoreX++;
      else tttScoreO++;
      updateTTTScore();
      setTimeout(() => alert(`${tttBoard[a]} wins!`), 50);
      setTimeout(resetTTT, 500);
      return;
    }
  }
  if (!tttBoard.includes("")) {
    tttGameOver = true;
    setTimeout(() => alert("It's a draw!"), 50);
    setTimeout(resetTTT, 500);
  }
}

function updateTTTScore() {
  document.getElementById('ttt-score').innerText = `X: ${tttScoreX} | O: ${tttScoreO}`;
}

function resetTTT() {
  tttBoard = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  tttGameOver = false;
  createTTT();
}

// -------------------- 12. NEON JUMP --------------------
let jumpGameActive = false;
let jumpScore = 0;
let jumpTimer = null;
let collisionTimer = null;
let isJumping = false;

function startJumpGame() {
  const player = document.getElementById('player');
  const obstacle = document.getElementById('obstacle');
  if (jumpGameActive) return;

  player.style.bottom = "0";
  obstacle.style.left = "100%";
  obstacle.style.animation = "none";
  // force reflow to reset animation
  void obstacle.offsetWidth;
  obstacle.style.animation = "moveObstacle 1.5s linear infinite";
  jumpScore = 0;
  document.getElementById('jump-score').innerText = "Score: 0";
  jumpGameActive = true;

  jumpTimer = setInterval(() => {
    jumpScore++;
    document.getElementById('jump-score').innerText = "Score: " + Math.floor(jumpScore / 10);
  }, 10);

  collisionTimer = setInterval(() => {
    const playerBottom = parseInt(window.getComputedStyle(player).getPropertyValue("bottom"));
    const obstacleLeft = parseFloat(window.getComputedStyle(obstacle).getPropertyValue("left"));
    // Adjust these numbers based on actual sizes
    if (obstacleLeft < 80 && obstacleLeft > 50 && playerBottom < 40) {
      clearInterval(jumpTimer);
      clearInterval(collisionTimer);
      jumpGameActive = false;
      obstacle.style.animation = "none";
      alert("GAME OVER! Final Score: " + Math.floor(jumpScore / 10));
      jumpScore = 0;
      document.getElementById('jump-score').innerText = "Score: 0";
    }
  }, 20);
}

function jump() {
  if (!jumpGameActive || isJumping) return;
  const player = document.getElementById('player');
  isJumping = true;
  player.style.transition = "0.3s";
  player.style.bottom = "100px";
  setTimeout(() => {
    player.style.bottom = "0";
    setTimeout(() => { isJumping = false; }, 300);
  }, 300);
}

// Listen for Space key to jump
document.addEventListener('keydown', (e) => {
  if (e.code === "Space" && jumpGameActive) {
    e.preventDefault();
    jump();
  }
});

// -------------------- 13. BABY COMMANDO --------------------
/* HTML required:
   <canvas id="baby-commando-canvas" width="250" height="150"></canvas>
   <p id="baby-score">Score: 0</p>
*/
let babyCtx;
const babyCanvasWidth = 250;
const babyCanvasHeight = 150;
let babyPlayer = { x: 120, y: 130, width: 20, height: 20, speed: 5 };
let babyEnemies = [];
let babyBullets = [];
let babyScore = 0;
let babyGameRunning = false;
let babyAnimFrame = null;
let keys = {};

function startBabyCommando() {
  const canvas = document.getElementById('baby-commando-canvas');
  if (!canvas) return;
  canvas.width = babyCanvasWidth;
  canvas.height = babyCanvasHeight;
  babyCtx = canvas.getContext('2d');
  babyGameRunning = true;
  babyEnemies = [];
  babyBullets = [];
  babyScore = 0;
  babyPlayer.x = babyCanvasWidth / 2;
  babyPlayer.y = babyCanvasHeight - 30;

  spawnBabyEnemy();  // spawn first enemy
  babyAnimFrame = requestAnimationFrame(babyGameLoop);
}

function spawnBabyEnemy() {
  const enemy = {
    x: Math.random() * (babyCanvasWidth - 20),
    y: -20,
    width: 20,
    height: 20,
    speed: 1 + Math.random() * 2
  };
  babyEnemies.push(enemy);
}

function babyGameLoop() {
  if (!babyGameRunning) return;
  babyCtx.clearRect(0, 0, babyCanvasWidth, babyCanvasHeight);

  // Move player (keyboard)
  if (keys['ArrowLeft'] && babyPlayer.x > 0) babyPlayer.x -= babyPlayer.speed;
  if (keys['ArrowRight'] && babyPlayer.x < babyCanvasWidth - babyPlayer.width) babyPlayer.x += babyPlayer.speed;

  // Move bullets
  babyBullets.forEach(bullet => bullet.y -= 5);
  babyBullets = babyBullets.filter(b => b.y > 0);

  // Move enemies
  babyEnemies.forEach(enemy => enemy.y += enemy.speed);
  babyEnemies = babyEnemies.filter(e => e.y < babyCanvasHeight);

  // Bullet‑enemy collisions
  for (let i = babyBullets.length - 1; i >= 0; i--) {
    for (let j = babyEnemies.length - 1; j >= 0; j--) {
      if (rectCollide(babyBullets[i], babyEnemies[j])) {
        babyBullets.splice(i, 1);
        babyEnemies.splice(j, 1);
        babyScore += 10;
        document.getElementById('baby-score').innerText = "Score: " + babyScore;
        break;
      }
    }
  }

  // Enemy‑player collisions
  for (let enemy of babyEnemies) {
    if (rectCollide(enemy, babyPlayer)) {
      gameOverBaby();
      return;
    }
  }

  // Draw everything
  babyCtx.fillStyle = '#00FFFF';
  babyCtx.fillRect(babyPlayer.x, babyPlayer.y, babyPlayer.width, babyPlayer.height);
  babyCtx.fillStyle = '#FF00FF';
  babyEnemies.forEach(e => babyCtx.fillRect(e.x, e.y, e.width, e.height));
  babyCtx.fillStyle = '#FFFF00';
  babyBullets.forEach(b => babyCtx.fillRect(b.x, b.y, 5, 10));

  // Spawn more enemies randomly
  if (Math.random() < 0.02) spawnBabyEnemy();

  babyAnimFrame = requestAnimationFrame(babyGameLoop);
}

function rectCollide(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

function gameOverBaby() {
  babyGameRunning = false;
  cancelAnimationFrame(babyAnimFrame);
  alert("GAME OVER! Score: " + babyScore);
}

// Keyboard controls for Baby Commando
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.code === "Space" && babyGameRunning) {
    e.preventDefault();
    if (babyBullets.length < 5) {
      babyBullets.push({ x: babyPlayer.x + babyPlayer.width/2 - 2, y: babyPlayer.y - 10 });
    }
  }
});
document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// -------------------- 14. MEMORY MATCH --------------------
/* HTML required:
   <div id="memory-grid" class="memory-grid"></div>
   <p id="memory-score">Moves: 0 | Pairs: 0/8</p>
*/
const memoryEmojis = ['🍎','🍌','🍇','🍉','🍓','🍒','🥝','🍍'];
let memoryDeck = [];
let memoryFlipped = [];
let memoryMatched = 0;
let memoryLock = false;
let memoryMoves = 0;

function startMemoryGame() {
  const grid = document.getElementById('memory-grid');
  if (!grid) return;
  memoryDeck = [...memoryEmojis, ...memoryEmojis].sort(() => Math.random() - 0.5);
  memoryFlipped = [];
  memoryMatched = 0;
  memoryMoves = 0;
  memoryLock = false;
  grid.innerHTML = "";
  document.getElementById('memory-score').innerText = "Moves: 0 | Pairs: 0/" + memoryEmojis.length;

  memoryDeck.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.index = index;
    card.dataset.emoji = emoji;
    card.onclick = () => flipMemoryCard(card);
    grid.appendChild(card);
  });
}

function flipMemoryCard(card) {
  if (memoryLock || card.classList.contains('flipped')) return;
  card.classList.add('flipped');
  card.innerText = card.dataset.emoji;
  memoryFlipped.push(card);

  if (memoryFlipped.length === 2) {
    memoryMoves++;
    document.getElementById('memory-score').innerText = "Moves: " + memoryMoves + " | Pairs: " + memoryMatched + "/" + memoryEmojis.length;
    memoryLock = true;
    const [card1, card2] = memoryFlipped;
    if (card1.dataset.emoji === card2.dataset.emoji) {
      card1.classList.add('matched');
      card2.classList.add('matched');
      memoryMatched++;
      memoryFlipped = [];
      memoryLock = false;
      if (memoryMatched === memoryEmojis.length) {
        setTimeout(() => alert("🎉 You won in " + memoryMoves + " moves!"), 200);
      }
    } else {
      setTimeout(() => {
        card1.classList.remove('flipped');
        card1.innerText = '';
        card2.classList.remove('flipped');
        card2.innerText = '';
        memoryFlipped = [];
        memoryLock = false;
      }, 1000);
    }
  }
}

// -------------------- 15. AURA AI WIDGET TOGGLE --------------------
document.getElementById('aura-toggle').addEventListener('click', function() {
  const frame = document.getElementById('aura-frame');
  frame.style.display = frame.style.display === 'none' ? 'block' : 'none';
  if (frame.style.display === 'block') {
    setTimeout(() => {
      frame.querySelector('iframe').contentWindow.document.getElementById('messageInput').focus();
    }, 300);
  }
});

// -------------------- 16. SERVICE WORKER REGISTRATION --------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.warn('[SW] Registration failed:', err));
  });
}

// -------------------- 17. INITIALIZE TIC‑TAC‑TOE --------------------
document.addEventListener('DOMContentLoaded', () => {
  createTTT();
});