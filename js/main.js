/* ====================================
   MAIN.JS - Hauptinitialisierung (Korrigiert)
   ==================================== */

// Globale Game-Instanz
let gameInstance = null;

/**
 * Hauptspiel-Controller
 */
class GameController {
    constructor() {
        console.log('🎮 Initializing Game Controller...');
        
        // Canvas Setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game loop control
        this.gameLoop = null;
        this.isRunning = false;
        
        // Initialize all systems
        this.initializeSystems();
    }
    
    initializeSystems() {
        try {
            // 1. Initialize Cache System first (with dummy gameState)
            console.log('📦 Initializing cache...');
            if (!Game.Cache) {
                Game.Cache = {};
            }
            Game.Cache.ThemeCache = new GameCache();
            
            // 2. Initialize State System
            console.log('🎯 Initializing state...');
            if (Game.State && Game.State.init) {
                Game.State.init();
            }
            
            // 3. Connect GameCache to State
            if (Game.Cache.ThemeCache.setGameState) {
                Game.Cache.ThemeCache.setGameState({
                    getCurrentTheme: () => Game.Themes.Manager.currentTheme || 'cowboy'
                });
            }
            
            // 4. Initialize Theme System
            console.log('🎨 Initializing themes...');
            if (!Game.Themes.Manager) {
                Game.Themes.Manager = {
                    currentTheme: 'cowboy',
                    setCurrent(theme) {
                        this.currentTheme = theme;
                        window.currentTheme = theme;
                    },
                    getEnemyConfig(type) {
                        const configs = {
                            // Cowboy enemies
                            cactus: { width: 32, height: 60, health: 1, spawnsOnGround: true },
                            rock: { width: 40, height: 40, health: 1, spawnsOnGround: true },
                            vulture: { width: 42, height: 24, health: 1, yRange: [140, 280] },
                            bull: { width: 42, height: 38, health: 2, spawnsOnGround: true },
                            boss: { width: 63, height: 57, health: 6, spawnsOnGround: true, hasBossAI: true },
                            prisoner: { width: 40, height: 60, health: 2, spawnsOnGround: true },
                            bulletBox: { width: 24, height: 16, health: 1, isCollectible: true, reward: 6, spawnsOnGround: true },
                            
                            // Dungeon enemies
                            bat: { width: 38, height: 20, health: 1, yRange: [140, 280] },
                            vampire: { width: 40, height: 60, health: 2, spawnsOnGround: true },
                            spider: { width: 42, height: 28, health: 2, spawnsOnGround: true },
                            alphaWolf: { width: 63, height: 51, health: 6, spawnsOnGround: true, hasBossAI: true },
                            skeleton: { width: 40, height: 60, health: 1, spawnsOnGround: true },
                            boltBox: { width: 24, height: 16, health: 1, isCollectible: true, reward: 6, spawnsOnGround: true }
                        };
                        
                        return configs[type] || configs.rock;
                    },
                    getHighScoreKey() {
                        return this.currentTheme === 'cowboy' ? 
                            Game.STORAGE_KEYS.COWBOY_HIGH_SCORE : 
                            Game.STORAGE_KEYS.DUNGEON_HIGH_SCORE;
                    },
                    mapBuffToInternal(buffId) {
                        const mapping = {
                            'multiShot': 'multiShot',
                            'chainLightning': 'multiShot',
                            'toughHide': 'extraLife',
                            'undeadResilience': 'extraLife',
                            'doubleJump': 'doubleJump',
                            'skyWalker': 'doubleJump',
                            'shadowLeap': 'doubleJump'
                        };
                        return mapping[buffId] || buffId;
                    }
                };
            }
            
            // 5. Initialize Sound System
            console.log('🔊 Initializing sound...');
            if (Game.Sound && Game.Sound.init) {
                Game.Sound.init();
            }
            
            // 6. Initialize Input System
            console.log('⌨️ Initializing input...');
            if (Game.Input && Game.Input.init) {
                Game.Input.init();
            }
            
            // 7. Initialize Rendering System
            console.log('🎨 Initializing renderer...');
            if (Game.Rendering && Game.Rendering.init) {
                Game.Rendering.init();
            }
            // Set canvas reference
            if (Game.Rendering.Renderer) {
                Game.Rendering.Renderer.canvas = this.canvas;
                Game.Rendering.Renderer.ctx = this.ctx;
            }
            
            // 8. Initialize UI System
            console.log('🖥️ Initializing UI...');
            if (Game.UI && Game.UI.init) {
                Game.UI.init();
            }
            
            // 9. Initialize Effects System
            console.log('✨ Initializing effects...');
            if (Game.Effects && Game.Effects.init) {
                Game.Effects.init();
            }
            
            // 10. Initialize Game Logic
            console.log('🧠 Initializing game logic...');
            if (Game.Logic && Game.Logic.init) {
                Game.Logic.init();
            }
            
            // 11. Initialize Level System
            console.log('📈 Initializing level system...');
            if (Game.Logic.LevelSystem) {
                Game.Logic.LevelSystem.init();
            }
            
            // 12. Initialize Collision System
            console.log('💥 Initializing collision system...');
            if (Game.Logic.CollisionSystem) {
                Game.Logic.CollisionSystem.init();
            }
            
            // 13. Initialize Player System
            console.log('🏃 Initializing player...');
            if (Game.Player && Game.Player.init) {
                Game.Player.init();
            }
            
            // 14. Initialize Obstacle System
            console.log('🚧 Initializing obstacles...');
            if (Game.Obstacles && Game.Obstacles.init) {
                Game.Obstacles.init();
            }
            
            // 15. Initialize Bullet System
            console.log('💫 Initializing bullets...');
            if (Game.Bullets && Game.Bullets.init) {
                Game.Bullets.init();
            }
            
            // 16. Initialize Screen Manager
            console.log('📺 Initializing screens...');
            if (Game.Screens && Game.Screens.init) {
                Game.Screens.init();
            }
            
            // Set initial state
            Game.State.Manager.setState(Game.STATE.THEME_SELECTION);
            
            console.log('✅ All systems initialized successfully!');
            
        } catch (error) {
            console.error('❌ Error during initialization:', error);
            console.error('Stack trace:', error.stack);
        }
    }
    
    start() {
        console.log('🚀 Starting game...');
        this.isRunning = true;
        
        // Start the game loop
        if (Game.Logic && Game.Logic.GameLoop) {
            Game.Logic.GameLoop.start();
        }
    }
    
    stop() {
        console.log('⏹️ Stopping game...');
        this.isRunning = false;
        
        if (Game.Logic && Game.Logic.GameLoop) {
            Game.Logic.GameLoop.stop();
        }
    }
}

/**
 * Initialize game when DOM is ready
 */
function initializeGame() {
    console.log('🎮 DOM ready, initializing game...');
    
    // Create game instance
    gameInstance = new GameController();
    
    // Set up global references
    window.game = gameInstance;
    
    // Show theme selection screen
    const themeSelectionElement = document.getElementById('themeSelection');
    if (themeSelectionElement) {
        themeSelectionElement.style.display = 'block';
    }
    
    // Bind global functions AFTER initialization
    bindGlobalFunctions();
    
    // Extra safety: Re-bind selectTheme after a short delay
    setTimeout(() => {
        window.selectTheme = function(themeId) {
            console.log('🎨 Theme selected (delayed bind):', themeId);
            Game.Actions.selectTheme(themeId);
        };
        console.log('✅ Theme selection re-bound');
    }, 100);
    
    console.log('🎮 Game initialization complete!');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    // DOM is already ready
    initializeGame();
}

// Global error handler for debugging
window.addEventListener('error', (event) => {
    console.error('❌ Global error:', event.error);
    console.error('File:', event.filename);
    console.error('Line:', event.lineno, 'Column:', event.colno);
});

// Prevent unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
});

// ====================================
// GLOBAL FUNCTION BINDINGS
// ====================================

function bindGlobalFunctions() {
    console.log('🔗 Binding global functions...');
    
    // Theme selection
    window.selectTheme = function(themeId) {
        console.log('🎨 Theme selected:', themeId);
        
        if (Game && Game.Actions && Game.Actions.selectTheme) {
            Game.Actions.selectTheme(themeId);
        } else {
            console.error('❌ Game.Actions.selectTheme not found');
            // Fallback: Direct approach
            selectThemeDirectly(themeId);
        }
    };
    
    // Direct theme selection fallback
    window.selectThemeDirectly = function(themeId) {
        console.log('🚀 Using direct theme selection approach');
        
        // Set theme
        if (Game.Themes && Game.Themes.Manager) {
            Game.Themes.Manager.setCurrent(themeId);
        }
        if (Game.Cache && Game.Cache.ThemeCache) {
            Game.Cache.ThemeCache.invalidate();
        }
        
        // Update UI
        if (Game.UI && Game.UI.Manager && Game.UI.Manager.applyCurrentTheme) {
            Game.UI.Manager.applyCurrentTheme();
        }
        
        // Change state
        if (Game.State && Game.State.Manager) {
            Game.State.Manager.setState('start');
        }
        
        // Hide theme selection, show start screen
        document.getElementById('themeSelection').style.display = 'none';
        document.getElementById('startScreen').style.display = 'block';
        
        // Update start screen content
        if (Game.Cache && Game.Cache.ThemeCache) {
            const theme = Game.Cache.ThemeCache.getTheme();
            const titleEl = document.getElementById('gameTitle');
            const buttonEl = document.getElementById('startButton');
            
            if (titleEl) titleEl.textContent = theme.title || '🎮 Game';
            if (buttonEl) buttonEl.textContent = theme.startButton || 'Start';
        }
        
        console.log('✅ Theme selected directly');
    };

    // Info overlay
    window.toggleInfoOverlay = function() {
        console.log('ℹ️ Toggling info overlay');
        
        if (Game && Game.Screens && Game.Screens.Manager && Game.Screens.Manager.toggleInfoOverlay) {
            Game.Screens.Manager.toggleInfoOverlay();
        } else if (Game && Game.toggleInfoOverlay) {
            Game.toggleInfoOverlay();
        }
    };

    // Start game
    window.startGame = function() {
        console.log('🚀 Starting game');
        
        if (Game && Game.Actions && Game.Actions.startGame) {
            Game.Actions.startGame();
        }
    };

    // Other game functions
    window.pauseGame = function() {
        if (Game && Game.Actions && Game.Actions.pauseGame) {
            Game.Actions.pauseGame();
        }
    };

    window.resumeGame = function() {
        if (Game && Game.Actions && Game.Actions.resumeGame) {
            Game.Actions.resumeGame();
        }
    };

    window.restartGame = function() {
        if (Game && Game.Actions && Game.Actions.restartGame) {
            Game.Actions.restartGame();
        }
    };

    window.backToThemeSelection = function() {
        if (Game && Game.Actions && Game.Actions.backToThemeSelection) {
            Game.Actions.backToThemeSelection();
        }
    };

    window.chooseBuff = function(buffId) {
        if (Game && Game.Actions && Game.Actions.chooseBuff) {
            Game.Actions.chooseBuff(buffId);
        }
    };

    window.toggleMute = function() {
        if (Game && Game.toggleMute) {
            return Game.toggleMute();
        } else if (Game && Game.Sound && Game.Sound.Manager && Game.Sound.Manager.toggleMute) {
            return Game.Sound.Manager.toggleMute();
        }
    };

    console.log('✅ Global function bindings created');
}