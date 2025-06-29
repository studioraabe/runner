/* ====================================
   THEMES.JS - Theme-Definitionen
   ==================================== */

// Themes Namespace
Game.Themes = Game.Themes || {};

// Theme Definitions
Game.Themes.definitions = {
    cowboy: {
        // Basic Info
        id: 'cowboy',
        name: 'Desert Cowboy',
        title: '🤠 Desert Cowboy Runner',
        
        // UI Labels
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
        
        // Theme-specific Buffs
        buffs: [
            { 
                id: 'multiShot', 
                title: '🔥 Multi-Shot', 
                desc: 'Fire 3 bullets at once and deal extra damage per shot' 
            },
            { 
                id: 'toughHide', 
                title: '❤️ Tough Hide', 
                desc: 'Gain extra life every 10 (15) bullet hits' 
            },
            { 
                id: 'doubleJump', 
                title: '🦅 Sky Walker', 
                desc: 'Unlock double jump ability and increased mobility' 
            }
        ],
        
        // Enemy Types
        enemies: ['cactus', 'rock', 'vulture', 'bull', 'boss', 'prisoner', 'bulletBox'],
        
        // Visual Settings
        colors: {
            groundColor: '#A17F53',
            floorDetailColor: '#D2B48C',
            skyGradient: ['#87CEEB', '#F4A460', '#A17F53'],
            dustColor: '#D2B48C',
            bulletColor: '#FFD700',
            enhancedBulletColor: '#FF4500'
        },
        
        // Audio Settings
        sounds: {
            jump: { frequency: 200, duration: 0.2, type: 'square' },
            shoot: { frequency: 600, duration: 0.05, type: 'triangle' },
            hit: { frequency: 150, duration: 0.2, type: 'triangle' },
            death: { frequency: 100, duration: 0.5, type: 'sawtooth' }
        },
        
        // Environment Settings
        environment: {
            type: 'desert',
            elements: [
                { type: 'cloud', count: 4, speedRange: [0.5, 1.0] },
                { type: 'tumbleweed', count: 2, speedRange: [1.0, 2.0] },
                { type: 'cactusBackground', count: 3, speedRange: [0.3, 0.7] }
            ]
        },
        
        // Gameplay Settings
        startButton: 'Start Adventure',
        description: 'Ride through the wild west, avoiding cacti and outlaws while collecting bullets!',
        difficulty: {
            baseSpawnRate: 1.0,
            spawnRateIncrease: 0.15,
            maxSpawnRate: 3.0
        }
    },
    
    Dungeon: {
        // Basic Info
        id: 'Dungeon',
        name: 'Dungeon\'s Escape',
        title: '⚡ Dungeon\'s Escape',
        
        // UI Labels
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
        
        // Theme-specific Buffs
        buffs: [
            { 
                id: 'chainLightning', 
                title: '⚡ Chain Lightning', 
                desc: 'Unleash 3 bolts at once that arc between enemies' 
            },
            { 
                id: 'undeadResilience', 
                title: '🧟 Undead Vigor', 
                desc: 'Gain extra life every 10 (15) bullet hits' 
            },
            { 
                id: 'shadowLeap', 
                title: '🌙 Shadow Leap', 
                desc: 'Unlock double jump with ethereal shadow form' 
            }
        ],
        
        // Enemy Types
        enemies: ['bat', 'vampire', 'spider', 'alphaWolf', 'skeleton', 'boltBox'],
        
        // Visual Settings
        colors: {
            groundColor: '#2F2F2F',
            floorDetailColor: '#1A1A1A',
            skyGradient: ['#0a0a0f', '#1b1b1d', '#000000'],
            shadowColor: '#8A2BE2',
            bulletColor: '#00FFFF',
            enhancedBulletColor: '#FF4500'
        },
        
        // Audio Settings
        sounds: {
            jump: { frequency: 150, duration: 0.25, type: 'sawtooth' },
            shoot: [
                { frequency: 800, duration: 0.05, type: 'sawtooth' },
                { frequency: 400, duration: 0.05, type: 'sawtooth', delay: 50 }
            ],
            hit: { frequency: 120, duration: 0.3, type: 'triangle' },
            death: [
                { frequency: 80, duration: 0.6, type: 'sawtooth' },
                { frequency: 60, duration: 0.8, type: 'sawtooth', delay: 200 }
            ]
        },
        
        // Environment Settings
        environment: {
            type: 'dungeon',
            elements: [
                { type: 'torch', count: 8, speedRange: [0.5, 1.0] },
                { type: 'shadowWisp', count: 5, speedRange: [0.8, 1.5] },
                { type: 'cobweb', count: 3, speedRange: [0.2, 0.5] }
            ]
        },
        
        // Gameplay Settings
        startButton: 'Begin Nightmare',
        description: 'Escape the cursed dungeon, battling undead creatures and collecting mystical bolts!',
        difficulty: {
            baseSpawnRate: 1.2,
            spawnRateIncrease: 0.20,
            maxSpawnRate: 3.5
        }
    }
};

// Theme Utility Functions
Game.Themes.get = function(themeId) {
    return Game.Themes.definitions[themeId] || Game.Themes.definitions.cowboy;
};

Game.Themes.getAll = function() {
    return Object.keys(Game.Themes.definitions);
};

Game.Themes.getBuffs = function(themeId) {
    const theme = Game.Themes.get(themeId);
    return theme.buffs || [];
};

Game.Themes.getEnemies = function(themeId) {
    const theme = Game.Themes.get(themeId);
    return theme.enemies || [];
};

Game.Themes.getColors = function(themeId) {
    const theme = Game.Themes.get(themeId);
    return theme.colors || {};
};

Game.Themes.getSounds = function(themeId) {
    const theme = Game.Themes.get(themeId);
    return theme.sounds || {};
};

Game.Themes.getEnvironment = function(themeId) {
    const theme = Game.Themes.get(themeId);
    return theme.environment || {};
};

Game.Themes.getDifficulty = function(themeId) {
    const theme = Game.Themes.get(themeId);
    return theme.difficulty || { baseSpawnRate: 1.0, spawnRateIncrease: 0.15, maxSpawnRate: 3.0 };
};

// Theme Mapping for Legacy Compatibility
Game.Themes.mapLegacyTheme = function(legacyTheme) {
    const mapping = {
        'cowboy': Game.Themes.definitions.cowboy,
        'Dungeon': Game.Themes.definitions.Dungeon,
        'dungeon': Game.Themes.definitions.Dungeon
    };
    return mapping[legacyTheme] || Game.Themes.definitions.cowboy;
};

// Theme Validation
Game.Themes.isValid = function(themeId) {
    return themeId && Game.Themes.definitions.hasOwnProperty(themeId);
};

// Default Theme
Game.Themes.default = 'cowboy';