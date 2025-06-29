/* ====================================
   GAMECONFIG.JS - Spielkonstanten
   ==================================== */

// Globaler Namespace für das Spiel
window.Game = window.Game || {};

// Spielkonstanten
Game.CONSTANTS = {
    // Physics
    MAX_LEVEL_PROGRESS: 100,
    GRAVITY: 1.5,
    LIGHT_GRAVITY: 0.4,
    JUMP_STRENGTH: -8,
    DOUBLE_JUMP_STRENGTH: -6,
    PLAYER_MOVE_SPEED: 4,
    MAX_JUMP_HOLD_TIME: 90,
    
    // Combat
    BULLET_SPEED: 10,
    DAMAGE_RESISTANCE_TIME: 60,
    
    // Performance
    FPS: 60,
    
    // Game Mechanics
    INITIAL_LIVES: 4,
    INITIAL_BULLETS: 5,
    INITIAL_GAME_SPEED: 2,
    SPEED_INCREMENT_PER_LEVEL: 0.6,
    BULLETS_PER_LEVEL: 12,
    
    // Rewards
    POINTS_PER_OBSTACLE_AVOIDED: 10,
    BULLETS_PER_OBSTACLES_AVOIDED: 5, // Every 10 obstacles
    OBSTACLES_FOR_BULLET_BONUS: 10,
    BULLETS_PER_BOX: 6,
    
    // Life System
    DEFAULT_BULLETS_FOR_LIFE: 15,
    BUFFED_BULLETS_FOR_LIFE: 10, // With extra life buff
    
    // Level System
    BUFF_LEVEL_INTERVAL: 2, // Every 2nd level
    MAX_BULLET_BOXES_PER_LEVEL: 2,
    
    // Invulnerability
    POST_BUFF_INVULNERABILITY: 120, // 2 seconds at 60fps
    POST_DAMAGE_INVULNERABILITY: 60, // 1 second at 60fps
    
    // Canvas
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 500,
    GROUND_Y: 364
};

// Spawn Timer Configuration
Game.SPAWN_CONFIG = {
    // Base timers for different obstacle types
    BASE_TIMERS: {
        BULLET_BOX: 100,
        BOSS: 180,
        FLYING: 100,
        MEDIUM: 120,
        HUMAN: 100,
        STATIC: 80,
        ROCK: 70
    },
    
    // Minimum timers (won't go below these values)
    MIN_TIMERS: {
        BULLET_BOX: 40,
        BOSS: 50,
        FLYING: 20,
        MEDIUM: 30,
        HUMAN: 20,
        STATIC: 20,
        ROCK: 15
    },
    
    // Spawn chances (dynamic based on level)
    SPAWN_CHANCES: {
        BULLET_BOX: 0.08, // 8% base chance
        BOSS_BASE: 0.05,
        BOSS_INCREMENT: 0.020,
        BOSS_MAX: 0.3,
        FLYING_BASE: 0.08,
        FLYING_INCREMENT: 0.01,
        FLYING_MAX: 0.35,
        MEDIUM_BASE: 0.07,
        MEDIUM_INCREMENT: 0.008,
        MEDIUM_MAX: 0.30,
        HUMAN_BASE: 0.06,
        HUMAN_INCREMENT: 0.006,
        HUMAN_MAX: 0.10,
        STATIC_CHANCE: 0.5
    }
};

// Enemy Health Configuration
Game.ENEMY_HEALTH = {
    // Boss enemies
    BOSS: 6,
    ALPHA_WOLF: 6,
    
    // Medium enemies
    BULL: 2,
    SPIDER: 2,
    VAMPIRE: 2,
    PRISONER: 2,
    
    // Standard enemies
    SKELETON: 1,
    CACTUS: 1,
    VULTURE: 1,
    BAT: 1,
    ROCK: 1
};

// Points Configuration
Game.POINTS_CONFIG = {
    // Base points per enemy type
    BASE_POINTS: {
        BOSS: 100,
        ALPHA_WOLF: 100,
        BULL: 50,
        SPIDER: 50,
        VAMPIRE: 25,
        PRISONER: 25,
        VULTURE: 40,
        BAT: 40,
        SKELETON: 20,
        CACTUS: 15,
        ROCK: 10
    },
    
    // Level bonus multiplier
    LEVEL_BONUS_PER_LEVEL: 5
};

// Animation Configuration
Game.ANIMATION_CONFIG = {
    // Animation speeds
    WING_FLAP_SPEED: 0.02,
    BREATH_SPEED: 0.004,
    EYE_FLICKER_SPEED: 0.006,
    TAIL_WAG_SPEED: 0.008,
    
    // Effect durations
    EXPLOSION_FRAMES: 15,
    LIGHTNING_LIFE: 15,
    BLOOD_PARTICLE_LIFE: 30,
    SCORE_POPUP_LIFE: 60,
    DOUBLE_JUMP_PARTICLE_LIFE: 25,
    
    // Particle counts
    BLOOD_PARTICLES_PER_HIT: 8,
    COWBOY_DOUBLE_JUMP_PARTICLES: 12,
    DUNGEON_DOUBLE_JUMP_PARTICLES: 8
};

// Input Configuration
Game.INPUT_CONFIG = {
    // Key codes
    KEYS: {
        SPACE: 'Space',
        SHOOT: 'KeyS',
        LEFT: ['KeyA', 'ArrowLeft'],
        RIGHT: ['KeyD', 'ArrowRight'],
        PAUSE: 'Escape'
    },
    
    // Input settings
    ALLOW_KEY_REPEAT: false
};

// Local Storage Keys
Game.STORAGE_KEYS = {
    COWBOY_HIGH_SCORE: 'cowboyHighScore',
    DUNGEON_HIGH_SCORE: 'DungeonHighScore'
};

// Game States Enum - FIXED: Added all uppercase variants
Game.STATE = {
    // Lowercase variants (original)
    themeSelection: 'themeSelection',
    start: 'start',
    playing: 'playing',
    paused: 'paused',
    levelComplete: 'levelComplete',
    gameOver: 'gameOver',
    
    // Uppercase variants (for compatibility)
    THEME_SELECTION: 'themeSelection',
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LEVEL_COMPLETE: 'levelComplete',
    GAME_OVER: 'gameOver'
};

// Buff Types
Game.BUFF_TYPES = {
    MULTI_SHOT: 'multiShot',
    CHAIN_LIGHTNING: 'chainLightning',
    EXTRA_LIFE: 'extraLife',
    TOUGH_HIDE: 'toughHide',
    UNDEAD_RESILIENCE: 'undeadResilience',
    DOUBLE_JUMP: 'doubleJump',
    SKY_WALKER: 'doubleJump', // Alias for cowboy theme
    SHADOW_LEAP: 'doubleJump'  // Alias for dungeon theme
};

// Debug Configuration
Game.DEBUG = {
    ENABLED: false,
    SHOW_COLLISION_BOXES: false,
    SHOW_FPS: false,
    LOG_SPAWNS: false,
    GOD_MODE: false
};

// Performance Configuration
Game.PERFORMANCE = {
    // Rendering optimization
    MAX_PARTICLES: 100,
    PARTICLE_POOL_SIZE: 200,
    
    // Update optimization
    SKIP_RENDER_WHEN_PAUSED: true,
    USE_REQUEST_ANIMATION_FRAME: false, // Currently using setInterval
    
    // Memory management
    CLEANUP_INTERVAL: 300, // frames
    MAX_OBSTACLES: 50,
    MAX_BULLETS: 30
};

// Version Info
Game.VERSION = {
    MAJOR: 0,
    MINOR: 74,
    PATCH: 0,
    BUILD: 'modular',
    FULL: '0.74.0-modular'
};

// Initialize game configuration
Game.init = function() {
    console.log(`🎮 Game ${Game.VERSION.FULL} - Configuration loaded`);
    console.log('📊 Performance mode:', Game.PERFORMANCE.USE_REQUEST_ANIMATION_FRAME ? 'RAF' : 'setInterval');
    console.log('🐛 Debug mode:', Game.DEBUG.ENABLED ? 'ON' : 'OFF');
    
    // Set up global references for backward compatibility
    window.GAME_CONSTANTS = Game.CONSTANTS;
    window.GameState = Game.STATE;
    
    return true;
};

// Call initialization
Game.init();