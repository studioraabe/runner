// Game Constants
const GAME_CONSTANTS = {
    MAX_LEVEL_PROGRESS: 100,
    GRAVITY: 1.5,
    LIGHT_GRAVITY: 0.4,
    JUMP_STRENGTH: -8,
    DOUBLE_JUMP_STRENGTH: -6,
    BULLET_SPEED: 10,
    FPS: 60,
    PLAYER_MOVE_SPEED: 4,
    DAMAGE_RESISTANCE_TIME: 60,
    MAX_JUMP_HOLD_TIME: 90
};

// Game States
const GameState = {
    THEME_SELECTION: 'themeSelection',
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LEVEL_COMPLETE: 'levelComplete',
    GAME_OVER: 'gameOver'
};

// Theme configuration
const themes = {
    cowboy: {
        name: 'Desert Cowboy',
        title: '🤠 Desert Cowboy Runner',
        labels: {
            score: 'Score',
            level: 'Level', 
            bullets: 'Bullets',
            lives: 'Lives',
            highScore: 'High Score',
            enemies: 'Enemies',
            gameOver: '💀 Game Over! 💀',
            finalScore: 'Final Score'
        },
        buffs: [
            { id: 'multiShot', title: '🔥 Multi-Shot', desc: 'Fire 3 bullets at once and deal extra damage per shot' },
            { id: 'toughHide', title: '❤️ Tough Hide', desc: 'Gain extra life every 10 (15) bullet hits' },
            { id: 'doubleJump', title: '🦅 Sky Walker', desc: 'Unlock double jump ability and increased mobility' }
        ],
        enemies: ['cactus', 'rock', 'vulture', 'bull', 'boss', 'prisoner', 'bulletBox'],
        groundColor: '#A17F53',
        floorDetailColor: '#D2B48C',
        startButton: 'Start Adventure'
    },
    Dungeon: {
        name: 'Dungeon\'s Escape',
        title: '⚡ Dungeon\'s Escape',
        labels: {
            score: 'Souls',
            level: 'Floor',
            bullets: 'Bolts',
            lives: 'Lives',
            highScore: 'High Score',
            enemies: 'Monsters',
            gameOver: '💀 Final Death! 💀',
            finalScore: 'Final Souls'
        },
        buffs: [
            { id: 'chainLightning', title: '⚡ Chain Lightning', desc: 'Unleash 3 bolts at once that arc between enemies' },
            { id: 'undeadResilience', title: '🧟 Undead Vigor', desc: 'Gain extra life every 10 (15) bullet hits' },
            { id: 'shadowLeap', title: '🌙 Shadow Leap', desc: 'Unlock double jump with ethereal shadow form' }
        ],
        enemies: ['bat', 'vampire', 'spider', 'alphaWolf', 'skeleton', 'boltBox'],
        groundColor: '#2F2F2F',
        floorDetailColor: '#1A1A1A',
        startButton: 'Begin Nightmare'
    }
};

// Cache System
class GameCache {
    constructor() {
        this.themeCache = null;
        this.currentThemeName = null;
    }

    getTheme() {
        if (this.currentThemeName !== currentTheme) {
            this.currentThemeName = currentTheme;
            this.themeCache = themes[currentTheme];
        }
        return this.themeCache;
    }

    invalidate() {
        this.themeCache = null;
        this.currentThemeName = null;
    }
}

const gameCache = new GameCache();

// Sound System
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.isMuted = false;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    play(frequency, duration, type = 'sine') {
        if (!this.audioContext || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    jump() { this.play(200, 0.2, 'square'); }
    shoot() { 
        if (currentTheme === 'Dungeon') {
            this.play(800, 0.05, 'sawtooth');
            setTimeout(() => this.play(400, 0.05, 'sawtooth'), 50);
        } else {
            this.play(600, 0.05, 'triangle');
        }
    }
    hit() { this.play(150, 0.2, 'triangle'); }
    death() { 
        this.play(100, 0.5, 'sawtooth');
        setTimeout(() => this.play(80, 0.6, 'sawtooth'), 200);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const muteIcon = document.getElementById('muteIcon');
        const muteButton = document.getElementById('muteButton');
        
        if (this.isMuted) {
            muteIcon.textContent = '🔇';
            muteButton.classList.add('muted');
        } else {
            muteIcon.textContent = '🔊';
            muteButton.classList.remove('muted');
        }
    }
}

const soundManager = new SoundManager();

// Global variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let currentTheme = 'cowboy';
let gameState = GameState.THEME_SELECTION;
let gameRunning = false;
let gameLoop = null;
let needsRedraw = true;

// Game state variables
let score = 0;
let lives = 4;
let maxLives = 4;
let gameSpeed = 1;
let bullets = 5;
let level = 1;
let levelProgress = 0;
let bulletBoxesFound = 0;
let highScore = 0;
let postBuffInvulnerability = 0;
let postDamageInvulnerability = 0;

// Game statistics
let enemiesDefeated = 0;
let obstaclesAvoided = 0;
let bulletsHit = 0;
let levelsCompleted = 0;

// Active buffs
let activeBuffs = {};
let availableBuffs = [];

// Game objects
const player = {
    x: 120,
    y: -80,
    width: 40,
    height: 40,
    velocityY: 0,
    velocityX: 0,
    jumping: false,
    grounded: true,
    jumpHoldTime: 0,
    isHoldingJump: false,
    doubleJumpUsed: false,
    damageResistance: 0,
    facingDirection: 1
};

// Input handling
const keys = {
    left: false,
    right: false,
    space: false,
    s: false
};

// Game arrays
let obstacles = [];
let bulletsFired = [];
let explosions = [];
let environmentElements = [];
let bloodParticles = [];
let lightningEffects = [];
let scorePopups = [];
let doubleJumpParticles = [];
let obstacleTimer = 0;

const groundY = 364;

// Utility Functions
function clearArrays() {
    obstacles.length = 0;
    bulletsFired.length = 0;
    explosions.length = 0;
    bloodParticles.length = 0;
    lightningEffects.length = 0;
    scorePopups.length = 0;
    doubleJumpParticles.length = 0;
}

function isPlayerInvulnerable() {
    return player.damageResistance > 0 || postBuffInvulnerability > 0 || postDamageInvulnerability > 0;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Global Functions
window.toggleMute = () => soundManager.toggleMute();

window.toggleInfoOverlay = function() {
    const infoOverlay = document.getElementById('infoOverlay');
    if (infoOverlay.style.display === 'block') {
        infoOverlay.style.display = 'none';
        if (gameState === GameState.PAUSED && gameRunning === false) {
            resumeGame();
        }
    } else {
        if (gameState === GameState.PLAYING && gameRunning === true) {
            gameState = GameState.PAUSED;
            gameRunning = false;
        }
        infoOverlay.style.display = 'block';
    }
};

window.selectTheme = function(themeName) {
    soundManager.init();
    currentTheme = themeName;
    gameCache.invalidate();
    applyTheme();
    gameState = GameState.START;
    loadHighScore();
    hideAllScreens();
    showScreen('startScreen');
};

window.backToThemeSelection = function() {
    gameState = GameState.THEME_SELECTION;
    gameRunning = false;
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    hideAllScreens();
    showScreen('themeSelection');
};

window.startGame = function() {
    soundManager.init();
    if (soundManager.audioContext) {
        soundManager.audioContext.resume();
    }
    gameState = GameState.PLAYING;
    gameRunning = true;
    resetGame();
    hideAllScreens();
    updateUI();
    if (!gameLoop) {
        gameLoop = setInterval(update, 1000 / GAME_CONSTANTS.FPS);
    }
};

window.restartGame = function() {
    gameState = GameState.PLAYING;
    gameRunning = true;
    resetGame();
    hideAllScreens();
    updateUI();
};

window.pauseGame = function() {
    if (gameState === GameState.PLAYING) {
        gameState = GameState.PAUSED;
        gameRunning = false;
        updatePauseScreen();
        showScreen('pauseScreen');
    }
};

window.resumeGame = function() {
    if (gameState === GameState.PAUSED) {
        gameState = GameState.PLAYING;
        gameRunning = true;
        hideAllScreens();
    }
};

window.chooseBuff = function(buffType) {
    const isLifeBuff = (currentTheme === 'cowboy' && buffType === 'toughHide') || 
                      (currentTheme === 'Dungeon' && buffType === 'undeadResilience');
    const isJumpBuff = (currentTheme === 'cowboy' && buffType === 'doubleJump') || 
                      (currentTheme === 'Dungeon' && buffType === 'shadowLeap');
    const isMultiShotBuff = (currentTheme === 'cowboy' && buffType === 'multiShot') || 
                           (currentTheme === 'Dungeon' && buffType === 'chainLightning');
    
    if (isLifeBuff) {
        activeBuffs.extraLife = 1;
    } else if (isJumpBuff) {
        activeBuffs.doubleJump = 1;
    } else if (isMultiShotBuff) {
        activeBuffs.multiShot = 1;
    }
    
    availableBuffs = availableBuffs.filter(buff => buff.id !== buffType);
    
    level++;
    levelProgress = 1;
    bulletBoxesFound = 0;
    gameSpeed += 0.6;
    bullets += 12;
    
    postBuffInvulnerability = 120;
    
    gameState = GameState.PLAYING;
    gameRunning = true;
    hideAllScreens();
    updateUI();
};

// Theme Functions
function applyTheme() {
    const theme = gameCache.getTheme();
    const container = document.getElementById('gameContainer');
    
    container.className = currentTheme + '-theme';
    
    const updates = [
        ['gameTitle', theme.title],
        ['startButton', theme.startButton],
        ['scoreLabel', theme.labels.score],
        ['levelLabel', theme.labels.level],
        ['bulletsLabel', theme.labels.bullets],
        ['livesLabel', theme.labels.lives],
        ['highscoreLabel', theme.labels.highScore],
        ['scoreStatLabel', theme.labels.score],
        ['enemiesStatLabel', theme.labels.enemies],
        ['gameOverTitle', theme.labels.gameOver],
        ['finalScoreLabel', theme.labels.finalScore],
        ['pauseScoreLabel', theme.labels.score],
        ['pauseLevelLabel', theme.labels.level],
        ['pauseLivesLabel', theme.labels.lives],
        ['buffChoiceTitle', currentTheme === 'Dungeon' ? '🔮 Choose Your Dark Power:' : 'Choose Your Buff:']
    ];

    updates.forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    });

    initEnvironmentElements();
    activeBuffs = {};
    availableBuffs = [...theme.buffs];
    updateUI();
}

function loadHighScore() {
    const key = currentTheme === 'cowboy' ? 'cowboyHighScore' : 'DungeonHighScore';
    highScore = parseInt(localStorage.getItem(key) || '0');
}

function saveHighScore() {
    const key = currentTheme === 'cowboy' ? 'cowboyHighScore' : 'DungeonHighScore';
    localStorage.setItem(key, highScore.toString());
}

// Screen Management
function hideAllScreens() {
    const screens = ['themeSelection', 'startScreen', 'levelComplete', 'gameOver', 'pauseScreen', 'newHighScore', 'infoOverlay'];
    screens.forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
}

function showScreen(screenId) {
    hideAllScreens();
    document.getElementById(screenId).style.display = 'block';
}

// Environment and Effects
function initEnvironmentElements() {
    environmentElements.length = 0;
    if (currentTheme === 'cowboy') {
        for (let i = 0; i < 4; i++) {
            environmentElements.push({
                type: 'cloud',
                x: Math.random() * 1000,
                y: Math.random() * 100 + 25,
                width: 60 + Math.random() * 40,
                speed: 0.5 + Math.random() * 0.5
            });
        }
    } else {
        for (let i = 0; i < 8; i++) {
            environmentElements.push({
                type: 'torch',
                x: i * 125 + 70,
                y: 50 + Math.random() * 35,
                flicker: Math.random() * 20
            });
        }
    }
}

function createLightningEffect(x, y) {
    if (currentTheme === 'Dungeon') {
        lightningEffects.push({
            x: x,
            y: y,
            life: 15,
            maxLife: 15,
            branches: Math.floor(Math.random() * 3) + 2
        });
    }
}

function createBloodParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        bloodParticles.push({
            x: x + Math.random() * 20 - 10,
            y: y + Math.random() * 20 - 10,
            velocityX: (Math.random() - 0.5) * 6,
            velocityY: (Math.random() - 0.5) * 6 - 2,
            life: 30,
            maxLife: 30
        });
    }
}

function createScorePopup(x, y, points) {
    scorePopups.push({
        x: x,
        y: y,
        points: points,
        life: 60,
        maxLife: 60
    });
}

function createDoubleJumpParticles(x, y) {
    const particleCount = currentTheme === 'cowboy' ? 12 : 8;
    
    for (let i = 0; i < particleCount; i++) {
        if (currentTheme === 'cowboy') {
            doubleJumpParticles.push({
                x: x + Math.random() * 40 - 20,
                y: y + 30 + Math.random() * 10,
                velocityX: (Math.random() - 0.5) * 4,
                velocityY: Math.random() * 2 + 1,
                life: 25,
                maxLife: 25,
                size: 2 + Math.random() * 3
            });
        } else {
            doubleJumpParticles.push({
                x: x + 20 + Math.random() * 20 - 10,
                y: y + 20 + Math.random() * 20 - 10,
                velocityX: (Math.random() - 0.5) * 6,
                velocityY: (Math.random() - 0.5) * 6,
                life: 30,
                maxLife: 30,
                size: 1 + Math.random() * 2
            });
        }
    }
}

// Game Logic
function resetGame() {
    score = 0;
    lives = 4;
    maxLives = 4;
    bullets = 5;
    level = 1;
    levelProgress = 0;
    gameSpeed = 2;
    enemiesDefeated = 0;
    obstaclesAvoided = 0;
    bulletsHit = 0;
    bulletBoxesFound = 0;
    levelsCompleted = 0;
    postBuffInvulnerability = 0;
    postDamageInvulnerability = 0;

    player.x = 120;
    player.y = 73;
    player.velocityY = 0;
    player.velocityX = 0;
    player.jumping = false;
    player.grounded = true;
    player.jumpHoldTime = 0;
    player.isHoldingJump = false;
    player.doubleJumpUsed = false;
    player.damageResistance = 0;
    player.facingDirection = 1;

    clearArrays();
    obstacleTimer = 0;
    activeBuffs = {};
    
    const theme = gameCache.getTheme();
    availableBuffs = [...theme.buffs];
    
    initEnvironmentElements();
    needsRedraw = true;
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        saveHighScore();
        document.getElementById('newHighScore').style.display = 'block';
    }
    document.getElementById('highscoreValue').textContent = highScore;
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('bullets').textContent = bullets;
    document.getElementById('highscoreValue').textContent = highScore;
    
    updateHeartsDisplay();
    updateActiveBuffsDisplay();
    
    if (gameState === GameState.LEVEL_COMPLETE) {
        updateBuffButtons();
    }
}

function updateHeartsDisplay() {
    const heartsContainer = document.getElementById('heartsContainer');
    heartsContainer.innerHTML = '';
    for (let i = 0; i < maxLives; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart' + (i >= lives ? ' empty' : '');
        heart.textContent = '♥';
        heartsContainer.appendChild(heart);
    }
}

function updateActiveBuffsDisplay() {
    const buffDisplay = document.getElementById('activeBuffs');
    let buffText = '';
    
    if (activeBuffs.multiShot > 0) {
        buffText += currentTheme === 'cowboy' ? '🔥 Multi-Shot ' : '⚡ Chain Lightning ';
    }
    if (activeBuffs.extraLife > 0) {
        buffText += currentTheme === 'cowboy' ? '❤️ Tough Hide ' : '🧟 Undead Vigor ';
    }
    if (activeBuffs.doubleJump > 0) {
        buffText += currentTheme === 'cowboy' ? '🦅 Sky Walker ' : '🌙 Shadow Leap ';
    }
    
    if (buffText) {
        buffDisplay.textContent = '' + buffText;
        buffDisplay.style.display = 'block';
    } else {
        buffDisplay.style.display = 'none';
    }
}

function updatePauseScreen() {
    document.getElementById('pauseScore').textContent = score;
    document.getElementById('pauseLevel').textContent = level;
    document.getElementById('pauseLives').textContent = lives;
}

function updateBuffButtons() {
    const buffButtonsContainer = document.getElementById('buffButtons');
    if (!buffButtonsContainer) return;
    
    buffButtonsContainer.innerHTML = '';
    
    availableBuffs.forEach(buff => {
        const button = document.createElement('div');
        button.className = 'buff-card';
        button.onclick = () => chooseBuff(buff.id);
        
        const title = document.createElement('div');
        title.className = 'buff-title';
        title.textContent = buff.title;
        
        const desc = document.createElement('div');
        desc.className = 'buff-desc';
        desc.textContent = buff.desc;
        
        button.appendChild(title);
        button.appendChild(desc);
        buffButtonsContainer.appendChild(button);
    });
}

// Player Movement and Actions
function startJump() {
    if (gameState === GameState.START) {
        startGame();
        return;
    }
    if (gameState === GameState.GAME_OVER) {
        restartGame();
        return;
    }
    if (!gameRunning) return;
    
    if (player.grounded) {
        player.velocityY = GAME_CONSTANTS.JUMP_STRENGTH;
        player.jumping = true;
        player.grounded = false;
        player.isHoldingJump = true;
        player.jumpHoldTime = 0;
        player.doubleJumpUsed = false;
        soundManager.jump();
    } else if (activeBuffs.doubleJump > 0 && !player.doubleJumpUsed) {
        player.velocityY = GAME_CONSTANTS.DOUBLE_JUMP_STRENGTH;
        player.doubleJumpUsed = true;
        player.isHoldingJump = true;
        player.jumpHoldTime = 0;
        createDoubleJumpParticles(player.x, player.y);
        soundManager.jump();
    }
}

function stopJump() {
    player.isHoldingJump = false;
}

function shoot() {
    if (!gameRunning || bullets <= 0) return;
    
    const canUseMultiShot = activeBuffs.multiShot > 0 && bullets >= 3;
    const bulletCount = canUseMultiShot ? 3 : 1;
    const enhanced = canUseMultiShot;
    
    for (let i = 0; i < bulletCount; i++) {
        const offsetY = bulletCount > 1 ? (i - 1) * 8 : 0;
        const startX = player.facingDirection === 1 ? player.x + player.width : player.x;
        const bulletSpeed = GAME_CONSTANTS.BULLET_SPEED * player.facingDirection;
        
        bulletsFired.push({
            x: startX,
            y: player.y + player.height / 1.5 + offsetY,
            speed: bulletSpeed,
            enhanced: enhanced,
            direction: player.facingDirection
        });
    }
    
    bullets -= bulletCount;
    soundManager.shoot();
}

// Update Functions
function updatePlayer() {
    if (keys.left && player.x > 0) {
        player.velocityX = -GAME_CONSTANTS.PLAYER_MOVE_SPEED;
        player.facingDirection = -1;
    } else if (keys.right && player.x < canvas.width - player.width) {
        player.velocityX = GAME_CONSTANTS.PLAYER_MOVE_SPEED;
        player.facingDirection = 1;
    } else {
        player.velocityX = 0;
    }
    
    player.x += player.velocityX;
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    
    if (player.isHoldingJump && player.jumpHoldTime < GAME_CONSTANTS.MAX_JUMP_HOLD_TIME && player.velocityY < 0) {
        const holdStrength = 1 - (player.jumpHoldTime / GAME_CONSTANTS.MAX_JUMP_HOLD_TIME);
        player.velocityY -= 0.3 * holdStrength;
        player.jumpHoldTime++;
    }
    
    const gravity = player.velocityY < 0 ? GAME_CONSTANTS.LIGHT_GRAVITY : GAME_CONSTANTS.GRAVITY;
    player.velocityY += gravity;
    player.y += player.velocityY;
    
    if (player.y >= groundY - player.height) {
        player.y = groundY - player.height;
        player.velocityY = 0;
        player.jumping = false;
        player.grounded = true;
        player.isHoldingJump = false;
        player.jumpHoldTime = 0;
        player.doubleJumpUsed = false;
    }
    
    if (player.damageResistance > 0) {
        player.damageResistance--;
    }
    if (postBuffInvulnerability > 0) {
        postBuffInvulnerability--;
    }
    if (postDamageInvulnerability > 0) {
        postDamageInvulnerability--;
    }
}

function calculateSpawnTimer(baseTimer, minTimer, level) {
    const maxReductionPercent = 0.65;
    const maxReduction = baseTimer * maxReductionPercent;
    
    const reductionProgress = 1 - Math.exp(-level * 0.25);
    const totalReduction = maxReduction * reductionProgress;
    
    const finalTimer = Math.floor(baseTimer - totalReduction);
    
    const effectiveMinTimer = Math.max(minTimer, Math.floor(baseTimer * 0.25));
    return Math.max(finalTimer, effectiveMinTimer);
}

function spawnObstacle() {
    if (obstacleTimer <= 0) {
        const obstacleType = Math.random();
        
        const bossChance = Math.min(0.05 + (level * 0.020), 0.3);
        const flyingChance = bossChance + Math.min(0.35, 0.08 + (level * 0.01));
        const mediumChance = flyingChance + Math.min(0.30, 0.07 + (level * 0.008));
        const humanChance = mediumChance + Math.min(0.10, 0.06 + (level * 0.006));
        const staticChance = humanChance + 0.5;
        
        if (obstacleType < 0.08 && bulletBoxesFound < 2) {
            const boxType = currentTheme === 'cowboy' ? 'bulletBox' : 'boltBox';
            obstacles.push(createObstacle(boxType, canvas.width, groundY - 16, 24, 16));
            obstacleTimer = calculateSpawnTimer(100, 40, level);
            bulletBoxesFound++;
        } else if (obstacleType < bossChance) {
            const bossType = currentTheme === 'cowboy' ? 'boss' : 'alphaWolf';
            const jumpFrequency = Math.max(60 - (level * 8), 20);
            const boss = createObstacle(bossType, canvas.width, groundY - 50, 63, 55);
            boss.health = 6;
            boss.maxHealth = 6;
            boss.verticalMovement = 0;
            boss.jumpTimer = Math.random() * jumpFrequency + jumpFrequency/2;
            obstacles.push(boss);
            obstacleTimer = calculateSpawnTimer(180, 50, level);
        } else if (obstacleType < flyingChance) {
            const flyingType = currentTheme === 'cowboy' ? 'vulture' : 'bat';
            obstacles.push(createObstacle(flyingType, canvas.width, 140 + Math.random() * 140, 42, 20));
            obstacleTimer = calculateSpawnTimer(100, 20, level);
        } else if (obstacleType < mediumChance) {
            const mediumType = currentTheme === 'cowboy' ? 'bull' : 'spider';
            const medium = createObstacle(mediumType, canvas.width, groundY - 20, 42, 40);
            medium.health = 2;
            medium.maxHealth = 2;
            obstacles.push(medium);
            obstacleTimer = calculateSpawnTimer(120, 30, level);
        } else if (obstacleType < humanChance) {
            const humanType = currentTheme === 'cowboy' ? 'prisoner' : 'vampire';
            const human = createObstacle(humanType, canvas.width, groundY - 46, 40, 42);
            human.health = 2;
            human.maxHealth = human.health;
            obstacles.push(human);
            obstacleTimer = calculateSpawnTimer(100, 20, level);
        } else if (obstacleType < staticChance) {
            const staticType = currentTheme === 'cowboy' ? 'cactus' : 'skeleton';
            const height = currentTheme === 'cowboy' ? 50 : 40;
            obstacles.push(createObstacle(staticType, canvas.width, groundY - height, 28, height));
            obstacleTimer = calculateSpawnTimer(80, 20, level);
        } else {
            obstacles.push(createObstacle('rock', canvas.width, groundY - 28, 30, 35));
            obstacleTimer = calculateSpawnTimer(70, 15, level);
        }
    }
    obstacleTimer--;
}

function createObstacle(type, x, y, width, height) {
    return {
        x: x,
        y: y,
        width: width,
        height: height,
        type: type,
        passed: false,
        health: 1,
        maxHealth: 1,
        animationTime: Math.random() * 1000
    };
}

function updateObstacles() {
    const speed = gameSpeed;
    
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= speed;
        
        obstacle.animationTime += 16;
        
        if (obstacle.type === 'vulture' || obstacle.type === 'bat') {
            obstacle.y += Math.sin(Date.now() * 0.01 + i) * 1.5;
        } else if (obstacle.type === 'boss' || obstacle.type === 'alphaWolf') {
            if (obstacle.jumpTimer !== undefined) {
                obstacle.jumpTimer--;
                if (obstacle.jumpTimer <= 0) {
                    obstacle.verticalMovement = -15;
                    obstacle.jumpTimer = Math.random() * 240 + 180;
                }
                
                obstacle.y += obstacle.verticalMovement;
                obstacle.verticalMovement += 0.8;
                
                if (obstacle.y >= groundY - obstacle.height) {
                    obstacle.y = groundY - obstacle.height;
                    obstacle.verticalMovement = 0;
                }
            }
        }
        
        if (!obstacle.passed && obstacle.x + obstacle.width < player.x) {
            obstacle.passed = true;
            score += 10;
            obstaclesAvoided++;
            levelProgress += 2;
            
            if (obstaclesAvoided % 10 === 0) {
                bullets += 5;
            }
        }
        
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function updateBullets() {
    for (let i = bulletsFired.length - 1; i >= 0; i--) {
        const bullet = bulletsFired[i];
        bullet.x += bullet.speed;
        
        for (let j = obstacles.length - 1; j >= 0; j--) {
            const obstacle = obstacles[j];
            
            if (bullet.x < obstacle.x + obstacle.width &&
                bullet.x + 8 > obstacle.x &&
                bullet.y < obstacle.y + obstacle.height &&
                bullet.y + 4 > obstacle.y) {
                
                const damage = bullet.enhanced ? 2 : 1;
                obstacle.health -= damage;
                
                if (currentTheme === 'Dungeon') {
                    createLightningEffect(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
                } else {
                    explosions.push({
                        x: obstacle.x + obstacle.width / 2,
                        y: obstacle.y + obstacle.height / 2,
                        frame: 0
                    });
                }
                
                bulletsFired.splice(i, 1);
                
                if (obstacle.health <= 0) {
                    handleObstacleDestroyed(obstacle, j);
                }
                break;
            }
        }
        
        if (bullet && (bullet.x > canvas.width || bullet.x < -8)) {
            bulletsFired.splice(i, 1);
        }
    }
}

function handleObstacleDestroyed(obstacle, index) {
    const basePoints = getBasePoints(obstacle.type);
    const levelBonus = (level - 1) * 5;
    const points = basePoints + levelBonus;
    
    score += points;
    createScorePopup(obstacle.x + obstacle.width/2, obstacle.y, points);
    
    obstacles.splice(index, 1);
    enemiesDefeated++;
    bulletsHit++;
    levelProgress += 3;
    soundManager.hit();
    
    const bulletsNeeded = activeBuffs.extraLife > 0 ? 10 : 15;
    if (bulletsHit >= bulletsNeeded) {
        lives++;
        if (lives > maxLives) maxLives = lives;
        bulletsHit = 0;
    }
}

function getBasePoints(obstacleType) {
    const pointsMap = {
        'boss': 100, 'alphaWolf': 100,
        'bull': 50, 'spider': 50,
        'vampire': 25, 'prisoner': 25,
        'vulture': 40, 'bat': 40,
        'skeleton': 20, 'cactus': 15,
        'rock': 10
    };
    return pointsMap[obstacleType] || 10;
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].frame++;
        if (explosions[i].frame > 15) {
            explosions.splice(i, 1);
        }
    }
}

function updateEnvironmentElements() {
    const speed = gameSpeed;
    for (const element of environmentElements) {
        if (element.type === 'cloud') {
            element.x -= element.speed;
            if (element.x + element.width < 0) {
                element.x = canvas.width;
                element.y = Math.random() * 100 + 25;
            }
        } else if (element.type === 'torch') {
            element.flicker += 0.1;
            element.x -= speed * 0.75;
            if (element.x < -20) {
                element.x = canvas.width + 20;
                element.y = 50 + Math.random() * 35;
            }
        }
    }
}

function updateEffects() {
    for (let i = bloodParticles.length - 1; i >= 0; i--) {
        const particle = bloodParticles[i];
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.velocityY += 0.2;
        particle.life--;
        
        if (particle.life <= 0) {
            bloodParticles.splice(i, 1);
        }
    }

    for (let i = lightningEffects.length - 1; i >= 0; i--) {
        const effect = lightningEffects[i];
        effect.life--;
        
        if (effect.life <= 0) {
            lightningEffects.splice(i, 1);
        }
    }

    for (let i = scorePopups.length - 1; i >= 0; i--) {
        const popup = scorePopups[i];
        popup.y -= 1;
        popup.life--;
        
        if (popup.life <= 0) {
            scorePopups.splice(i, 1);
        }
    }

    for (let i = doubleJumpParticles.length - 1; i >= 0; i--) {
        const particle = doubleJumpParticles[i];
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.velocityY += 0.1;
        particle.life--;
        
        if (particle.life <= 0) {
            doubleJumpParticles.splice(i, 1);
        }
    }
}

function checkCollisions() {
    if (isPlayerInvulnerable()) return;

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            
            if (obstacle.type === 'bulletBox' || obstacle.type === 'boltBox') {
                bullets += 6;
                const label = currentTheme === 'cowboy' ? '+6 Bullets' : '+6 Bolts';
                createScorePopup(obstacle.x + obstacle.width/2, obstacle.y, label);
                obstacles.splice(i, 1);
                continue;
            }
            
            lives--;
            createBloodParticles(player.x + player.width/2, player.y + player.height/2);
            
            postDamageInvulnerability = 60;
            player.damageResistance = GAME_CONSTANTS.DAMAGE_RESISTANCE_TIME;
            
            bulletsHit = 0;
            obstacles.splice(i, 1);
            soundManager.hit();
            
            if (lives <= 0) {
                gameOver();
            }
            break;
        }
    }
}

function checkLevelComplete() {
    if (levelProgress >= GAME_CONSTANTS.MAX_LEVEL_PROGRESS) {
        levelsCompleted++;
        
        const isBuffLevel = level % 2 === 0;
        const hasAvailableBuffs = availableBuffs.length > 0;
        
        if (isBuffLevel && hasAvailableBuffs) {
            gameState = GameState.LEVEL_COMPLETE;
            gameRunning = false;
            
            const levelScoreEl = document.getElementById('levelScore');
            const enemiesDefeatedEl = document.getElementById('enemiesDefeated');
            
            if (levelScoreEl) levelScoreEl.textContent = score;
            if (enemiesDefeatedEl) enemiesDefeatedEl.textContent = enemiesDefeated;
            
            showScreen('levelComplete');
        } else {
            level++;
            levelProgress = 1;
            bulletBoxesFound = 0;
            gameSpeed += 0.4;
            bullets += 12;
        }
    }
}

function gameOver() {
    gameState = GameState.GAME_OVER;
    gameRunning = false;
    
    updateHighScore();
    soundManager.death();
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('levelsCompleted').textContent = levelsCompleted;
    
    showScreen('gameOver');
}

// Main Update Function
function update() {
    if (!gameRunning) return;
    
    updatePlayer();
    spawnObstacle();
    updateObstacles();
    updateBullets();
    updateExplosions();
    updateEnvironmentElements();
    updateEffects();
    checkCollisions();
    checkLevelComplete();
    
    render();
    updateUI();
    needsRedraw = true;
}

// Event Handlers
document.addEventListener('keydown', function(e) {
    if (e.code === 'Escape') {
        e.preventDefault();
        if (gameState === GameState.PLAYING) {
            pauseGame();
        } else if (gameState === GameState.PAUSED) {
            resumeGame();
        }
        return;
    }
    
    if (e.code === 'Space') {
        e.preventDefault();
        keys.space = true;
        startJump();
    }
    if (e.code === 'KeyS') {
        e.preventDefault();
        if (!keys.s) {
            keys.s = true;
            shoot();
        }
    }
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        e.preventDefault();
        keys.left = true;
    }
    if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        e.preventDefault();
        keys.right = true;
    }
});

document.addEventListener('keyup', function(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        keys.space = false;
        stopJump();
    }
    if (e.code === 'KeyS') {
        e.preventDefault();
        keys.s = false;
    }
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        e.preventDefault();
        keys.left = false;
    }
    if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        e.preventDefault();
        keys.right = false;
    }
});

// URL Parameter handling for direct theme selection
function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme');
    
    if (theme === 'cowboy' || theme === 'dungeon') {
        currentTheme = theme === 'dungeon' ? 'Dungeon' : 'cowboy';
        gameCache.invalidate();
        applyTheme();
        gameState = GameState.START;
        loadHighScore();
        hideAllScreens();
        showScreen('startScreen');
        
        const autostart = urlParams.get('autostart');
        if (autostart === 'true') {
            setTimeout(() => {
                startGame();
            }, 500);
        }
    }
}

checkURLParameters();

// Initialize menu rendering
function menuRender() {
    if (gameState !== GameState.PLAYING) {
        if (currentTheme && gameState !== GameState.THEME_SELECTION) {
            render();
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    requestAnimationFrame(menuRender);
}

menuRender();

// Cleanup function for memory management
window.addEventListener('beforeunload', function() {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    clearArrays();
    gameCache.invalidate();
});

// Initialize with optimized settings
console.log('Runner V.073 - Optimized Edition loaded successfully!');
