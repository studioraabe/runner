/* ====================================
   GAMELOGIC.JS - Hauptspiellogik
   ==================================== */

// Game Logic Namespace
Game.Logic = Game.Logic || {};

/**
 * Game Loop Controller - Hauptsteuerung des Spielablaufs
 */
Game.Logic.GameLoop = {
    // Loop state
    isRunning: false,
    gameLoop: null,
    lastUpdateTime: 0,
    deltaTime: 0,
    accumulator: 0,
    
    // Performance tracking
    frameTime: 0,
    updateTime: 0,
    renderTime: 0,
    fps: 0,
    frameCount: 0,
    lastFpsUpdate: 0,
    
    // Fixed timestep for physics (60 FPS)
    FIXED_TIMESTEP: 1000 / 60,
    MAX_UPDATES: 5,
    
    /**
     * Start game loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastUpdateTime = performance.now();
        this.lastFpsUpdate = performance.now();
        this.accumulator = 0;
        
        // Use requestAnimationFrame for smooth rendering
        const gameLoopRAF = (currentTime) => {
            if (!this.isRunning) return;
            
            this.deltaTime = Math.min(currentTime - this.lastUpdateTime, 100);
            this.lastUpdateTime = currentTime;
            
            // Fixed timestep with interpolation
            this.accumulator += this.deltaTime;
            
            let updates = 0;
            while (this.accumulator >= this.FIXED_TIMESTEP && updates < this.MAX_UPDATES) {
                this.update();
                this.accumulator -= this.FIXED_TIMESTEP;
                updates++;
            }
            
            // Render with interpolation
            const interpolation = this.accumulator / this.FIXED_TIMESTEP;
            this.render(interpolation);
            
            // Update FPS counter
            this.frameCount++;
            if (currentTime - this.lastFpsUpdate >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastFpsUpdate = currentTime;
            }
            
            requestAnimationFrame(gameLoopRAF);
        };
        
        requestAnimationFrame(gameLoopRAF);
        
        console.log('🎮 Game loop started (RAF mode)');
    },
    
    /**
     * Stop game loop
     */
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        console.log('⏹️ Game loop stopped');
    },
    
    /**
     * Main update cycle (fixed timestep)
     */
    update() {
        // Only update if game is actually running
        if (!Game.State.Manager.gameRunning) return;
        
        const updateStartTime = performance.now();
        
        // Update all game systems
        this.updateGameSystems();
        
        this.updateTime = performance.now() - updateStartTime;
    },
    
    /**
     * Update all game systems in order
     */
    updateGameSystems() {
        // Update player
        Game.Player.Controller.update();
        
        // Update obstacles
        Game.Obstacles.Manager.update();
        
        // Update bullets
        Game.Bullets.Manager.update();
        
        // Update effects
        Game.Effects.Manager.update();
        
        // Update AI systems
        Game.Obstacles.AI.update();
        
        // Check collisions
        Game.Logic.CollisionSystem.update();
        
        // Check level progression
        Game.Logic.LevelSystem.update();
        
        // Update animations
        Game.Player.Animation.update();
    },
    
    /**
     * Render the game
     * @param {number} interpolation - Interpolation value for smooth rendering
     */
    render(interpolation = 0) {
        const renderStartTime = performance.now();
        
        Game.Rendering.Renderer.render(interpolation);
        Game.UI.Manager.markForUpdate();
        
        this.renderTime = performance.now() - renderStartTime;
        
        // Performance warning
        if (Game.DEBUG.ENABLED && this.frameTime > 20) {
            console.warn(`⚠️ Slow frame: ${this.frameTime}ms (Update: ${this.updateTime}ms, Render: ${this.renderTime}ms)`);
        }
    },
    
    /**
     * Get performance stats
     * @returns {object} Performance statistics
     */
    getPerformanceStats() {
        return {
            frameTime: this.frameTime,
            updateTime: this.updateTime,
            renderTime: this.renderTime,
            fps: this.fps,
            isRunning: this.isRunning
        };
    }
};

/**
 * Game Actions - Hochlevel-Spielaktionen
 */
Game.Actions = {
    /**
     * Start new game
     */
    startGame() {
        console.log('🎮 Starting new game');
        
        // Initialize game state
        Game.State.Manager.resetGameState();
        Game.State.Manager.setState(Game.STATE.PLAYING);
        
        // Reset player
        Game.Player.Controller.reset();
        
        // Clear all objects
        Game.State.Objects.clearAll();
        
        // Initialize environment
        if (Game.Effects && Game.Effects.Environment && Game.Effects.Environment.init) {
            Game.Effects.Environment.init();
        }
        
        // Start game loop ONLY if not already running
        if (!Game.Logic.GameLoop.isRunning) {
            console.log('🚀 Starting game loop');
            Game.Logic.GameLoop.start();
        }
        
        // Initialize sound system
        Game.Sound.Manager.init();
        Game.Sound.Manager.resume();
        
        // Hide all screens to show the game canvas
        Game.UI.Screens.hideAll();
    },
    
    /**
     * Restart current game
     */
    restartGame() {
        console.log('🔄 Restarting game');
        
        const currentTheme = Game.Themes.Manager.currentTheme;
        
        // Reset to start screen first
        Game.State.Manager.setState(Game.STATE.START);
        
        // Then start new game
        setTimeout(() => {
            this.startGame();
        }, 100);
    },
    
    /**
     * Pause game
     */
    pauseGame() {
        if (Game.State.Manager.getState() === Game.STATE.PLAYING) {
            console.log('⏸️ Pausing game');
            
            Game.State.Manager.setState(Game.STATE.PAUSED);
            Game.UI.Manager.updatePauseScreen();
            Game.UI.Screens.show('pauseScreen');
        }
    },
    
    /**
     * Resume game
     */
    resumeGame() {
        if (Game.State.Manager.getState() === Game.STATE.PAUSED) {
            console.log('▶️ Resuming game');
            
            Game.State.Manager.setState(Game.STATE.PLAYING);
            Game.UI.Screens.hideAll();
        }
    },
    
    /**
     * End game (game over)
     */
    endGame() {
        console.log('💀 Game over');
        
        Game.State.Manager.setState(Game.STATE.GAME_OVER);
        
        // Update high score
        const gameData = Game.State.Manager.getData();
        const newHighScore = Game.State.Manager.saveHighScore();
        
        // Update game over screen
        Game.UI.Manager.updateGameOverScreen();
        
        // Show game over screen
        Game.UI.Screens.show('gameOver');
        
        // Play game over sound
        Game.Sound.Effects.gameOver();
        
        // Stop game loop after a delay
        setTimeout(() => {
            Game.Logic.GameLoop.stop();
        }, 1000);
    },
    
    /**
     * Complete level
     */
    completeLevel() {
        const gameData = Game.State.Manager.getData();
        
        console.log(`🎉 Level ${gameData.level} completed`);
        
        // Check if this is a buff level
        const isBuffLevel = gameData.level % Game.CONSTANTS.BUFF_LEVEL_INTERVAL === 0;
        const hasAvailableBuffs = gameData.availableBuffs.length > 0;
        
        if (isBuffLevel && hasAvailableBuffs) {
            Game.State.Manager.setState(Game.STATE.LEVEL_COMPLETE);
            Game.UI.Manager.updateLevelCompleteScreen();
            Game.UI.Screens.show('levelComplete');
            
            // Play level complete sound
            Game.Sound.Effects.levelComplete();
        } else {
            // Auto-advance to next level
            this.advanceLevel();
        }
    },
    
    /**
     * Advance to next level
     */
    advanceLevel() {
        const gameData = Game.State.Manager.getData();
        
        Game.State.Manager.updateData({
            level: gameData.level + 1,
            levelProgress: 1,
            bulletBoxesFound: 0,
            gameSpeed: gameData.gameSpeed + Game.CONSTANTS.SPEED_INCREMENT_PER_LEVEL,
            levelsCompleted: gameData.levelsCompleted + 1
        });
        
        // Add bonus bullets
        Game.Player.Stats.addBullets(Game.CONSTANTS.BULLETS_PER_LEVEL);
        
        console.log(`📈 Advanced to level ${gameData.level + 1}`);
    },
    
    /**
     * Choose buff (from level complete screen)
     * @param {string} buffId - Buff ID to activate
     */
    chooseBuff(buffId) {
        console.log(`🔥 Choosing buff: ${buffId}`);
        
        const gameData = Game.State.Manager.getData();
        const mappedBuffType = Game.Themes.Manager.mapBuffToInternal(buffId);
        
        // Activate the buff
        Game.Player.Abilities.activateAbility(mappedBuffType, 1);
        
        // Remove buff from available list
        const newAvailableBuffs = gameData.availableBuffs.filter(buff => buff.id !== buffId);
        
        // Advance level
        this.advanceLevel();
        
        // Update state
        Game.State.Manager.updateData({
            availableBuffs: newAvailableBuffs,
            postBuffInvulnerability: Game.CONSTANTS.POST_BUFF_INVULNERABILITY
        });
        
        // Resume game
        Game.State.Manager.setState(Game.STATE.PLAYING);
        Game.UI.Screens.hideAll();
    },
    
    /**
     * Select theme
     * @param {string} themeId - Theme ID to select
     */
    selectTheme(themeId) {
        console.log(`🎨 Selecting theme: ${themeId}`);
        
        // Debug: Check if all systems are available
        console.log('Debug - Game.Themes.Manager:', Game.Themes.Manager);
        console.log('Debug - Game.Cache.ThemeCache:', Game.Cache.ThemeCache);
        console.log('Debug - Game.UI.Manager:', Game.UI.Manager);
        console.log('Debug - Game.State.Manager:', Game.State.Manager);
        console.log('Debug - Game.Effects:', Game.Effects);
        
        // Set theme
        if (Game.Themes.Manager) {
            Game.Themes.Manager.setCurrent(themeId);
            console.log('✅ Theme set in manager');
        } else {
            console.error('❌ Game.Themes.Manager not found');
            return;
        }
        
        // Invalidate cache
        if (Game.Cache && Game.Cache.ThemeCache) {
            Game.Cache.ThemeCache.invalidate();
            console.log('✅ Cache invalidated');
        }
        
        // Apply theme to UI
        if (Game.UI && Game.UI.Manager && Game.UI.Manager.applyCurrentTheme) {
            Game.UI.Manager.applyCurrentTheme();
            console.log('✅ Theme applied to UI');
        }
        
        // Load high score for this theme
        if (Game.State && Game.State.Manager && Game.State.Manager.loadHighScore) {
            Game.State.Manager.loadHighScore();
            console.log('✅ High score loaded');
        }
        
        // Initialize environment for theme
        if (Game.Effects && Game.Effects.Environment && Game.Effects.Environment.init) {
            Game.Effects.Environment.init();
            console.log('✅ Environment initialized');
        }
        
        // Go to start screen
        if (Game.State && Game.State.Manager) {
            const result = Game.State.Manager.setState(Game.STATE.START);
            console.log('✅ State change result:', result);
            console.log('Current state:', Game.State.Manager.getState());
        }
        
        // Show start screen
        if (Game.UI && Game.UI.Screens) {
            Game.UI.Screens.show('startScreen');
            console.log('✅ Start screen shown');
        } else {
            // Fallback: Direct DOM manipulation
            console.log('⚠️ Using fallback screen show');
            document.getElementById('themeSelection').style.display = 'none';
            document.getElementById('startScreen').style.display = 'block';
        }
    },
    
    /**
     * Go back to theme selection
     */
    backToThemeSelection() {
        console.log('🔙 Back to theme selection');
        
        // Stop game loop
        Game.Logic.GameLoop.stop();
        
        // Reset state
        Game.State.Manager.setState(Game.STATE.THEME_SELECTION);
        
        // Clear objects
        Game.State.Objects.clearAll();
        
        // Show theme selection
        Game.UI.Screens.show('themeSelection');
    }
};

/**
 * Game Rules Engine - Spielregeln und -mechaniken
 */
Game.Logic.Rules = {
    /**
     * Calculate points for destroying obstacle
     * @param {object} obstacle - Destroyed obstacle
     * @returns {number} Points awarded
     */
    calculateObstaclePoints(obstacle) {
        const gameData = Game.State.Manager.getData();
        const basePoints = Game.POINTS_CONFIG.BASE_POINTS[obstacle.type.toUpperCase()] || 10;
        const levelBonus = (gameData.level - 1) * Game.POINTS_CONFIG.LEVEL_BONUS_PER_LEVEL;
        
        return basePoints + levelBonus;
    },
    
    /**
     * Calculate bullet cost for shooting
     * @param {boolean} isMultiShot - Whether multi-shot is active
     * @returns {number} Bullet cost
     */
    calculateBulletCost(isMultiShot = false) {
        return isMultiShot ? 3 : 1;
    },
    
    /**
     * Check if player can shoot
     * @param {boolean} isMultiShot - Whether multi-shot is intended
     * @returns {boolean} Whether player can shoot
     */
    canPlayerShoot(isMultiShot = false) {
        const gameData = Game.State.Manager.getData();
        const cost = this.calculateBulletCost(isMultiShot);
        
        return gameData.bullets >= cost;
    },
    
    /**
     * Calculate level progress requirement
     * @param {number} level - Current level
     * @returns {number} Progress required for next level
     */
    calculateLevelProgressRequirement(level) {
        return Game.CONSTANTS.MAX_LEVEL_PROGRESS;
    },
    
    /**
     * Check if level should be completed
     * @returns {boolean} Whether level should be completed
     */
    shouldCompleteLevel() {
        const gameData = Game.State.Manager.getData();
        return gameData.levelProgress >= Game.CONSTANTS.MAX_LEVEL_PROGRESS;
    },
    
    /**
     * Calculate difficulty scaling
     * @param {number} level - Current level
     * @returns {object} Difficulty parameters
     */
    calculateDifficultyScaling(level) {
        return {
            spawnRate: Math.max(0.3, 1 - (level * 0.05)),
            enemySpeed: 1 + (level * 0.1),
            enemyHealth: Math.floor(1 + (level * 0.2)),
            bossChance: Math.min(0.3, 0.05 + (level * 0.02))
        };
    },
    
    /**
     * Validate buff activation
     * @param {string} buffType - Buff type to validate
     * @returns {boolean} Whether buff can be activated
     */
    canActivateBuff(buffType) {
        const gameData = Game.State.Manager.getData();
        
        // Check if buff is available
        const buffAvailable = gameData.availableBuffs.some(buff => 
            Game.Themes.Manager.mapBuffToInternal(buff.id) === buffType
        );
        
        // Check if buff is not already active
        const buffNotActive = !gameData.activeBuffs[buffType];
        
        return buffAvailable && buffNotActive;
    }
};

/**
 * Game Timer System - Zeit-basierte Mechaniken
 */
Game.Logic.Timer = {
    timers: new Map(),
    
    /**
     * Create a timer
     * @param {string} id - Timer ID
     * @param {number} duration - Duration in milliseconds
     * @param {function} callback - Callback function
     * @param {boolean} repeat - Whether to repeat timer
     */
    createTimer(id, duration, callback, repeat = false) {
        this.removeTimer(id); // Remove existing timer with same ID
        
        const timer = {
            id: id,
            duration: duration,
            callback: callback,
            repeat: repeat,
            startTime: Date.now(),
            lastTrigger: Date.now()
        };
        
        this.timers.set(id, timer);
    },
    
    /**
     * Remove timer
     * @param {string} id - Timer ID
     */
    removeTimer(id) {
        this.timers.delete(id);
    },
    
    /**
     * Update all timers
     */
    updateTimers() {
        const now = Date.now();
        
        for (const [id, timer] of this.timers) {
            if (now - timer.lastTrigger >= timer.duration) {
                timer.callback();
                timer.lastTrigger = now;
                
                if (!timer.repeat) {
                    this.timers.delete(id);
                }
            }
        }
    },
    
    /**
     * Check if timer exists
     * @param {string} id - Timer ID
     * @returns {boolean} Whether timer exists
     */
    hasTimer(id) {
        return this.timers.has(id);
    },
    
    /**
     * Get timer remaining time
     * @param {string} id - Timer ID
     * @returns {number} Remaining time in milliseconds
     */
    getRemainingTime(id) {
        const timer = this.timers.get(id);
        if (!timer) return 0;
        
        const elapsed = Date.now() - timer.lastTrigger;
        return Math.max(0, timer.duration - elapsed);
    }
};

/**
 * Game State Validation - Zustandsvalidierung
 */
Game.Logic.Validator = {
    /**
     * Validate game state consistency
     * @returns {Array} Array of validation errors
     */
    validateGameState() {
        const errors = [];
        const gameData = Game.State.Manager.getData();
        
        // Validate lives
        if (gameData.lives < 0) {
            errors.push('Lives cannot be negative');
        }
        if (gameData.lives > gameData.maxLives) {
            errors.push('Lives cannot exceed max lives');
        }
        
        // Validate bullets
        if (gameData.bullets < 0) {
            errors.push('Bullets cannot be negative');
        }
        
        // Validate level
        if (gameData.level < 1) {
            errors.push('Level cannot be less than 1');
        }
        
        // Validate level progress
        if (gameData.levelProgress < 0) {
            errors.push('Level progress cannot be negative');
        }
        if (gameData.levelProgress > Game.CONSTANTS.MAX_LEVEL_PROGRESS + 10) {
            errors.push('Level progress exceeds maximum');
        }
        
        // Validate score
        if (gameData.score < 0) {
            errors.push('Score cannot be negative');
        }
        
        return errors;
    },
    
    /**
     * Validate player state
     * @returns {Array} Array of validation errors
     */
    validatePlayerState() {
        const errors = [];
        const player = Game.State.Player;
        
        // Validate position
        if (player.position.x < 0 || player.position.x > Game.CONSTANTS.CANVAS_WIDTH) {
            errors.push('Player X position out of bounds');
        }
        
        // Validate properties
        if (player.properties.damageResistance < 0) {
            errors.push('Damage resistance cannot be negative');
        }
        
        return errors;
    },
    
    /**
     * Validate and fix game state
     */
    validateAndFix() {
        const gameErrors = this.validateGameState();
        const playerErrors = this.validatePlayerState();
        
        if (gameErrors.length > 0 || playerErrors.length > 0) {
            console.warn('🚨 Game state validation errors:', [...gameErrors, ...playerErrors]);
            
            // Attempt to fix common issues
            this.fixCommonIssues();
        }
    },
    
    /**
     * Fix common game state issues
     */
    fixCommonIssues() {
        const gameData = Game.State.Manager.getData();
        const player = Game.State.Player;
        
        // Fix game data issues
        const fixes = {
            lives: Math.max(0, Math.min(gameData.lives, gameData.maxLives)),
            bullets: Math.max(0, gameData.bullets),
            level: Math.max(1, gameData.level),
            levelProgress: Math.max(0, Math.min(gameData.levelProgress, Game.CONSTANTS.MAX_LEVEL_PROGRESS + 10)),
            score: Math.max(0, gameData.score)
        };
        
        Game.State.Manager.updateData(fixes);
        
        // Fix player position
        player.position.x = Math.max(0, Math.min(player.position.x, Game.CONSTANTS.CANVAS_WIDTH - player.properties.width));
        player.position.y = Math.min(player.position.y, Game.CONSTANTS.GROUND_Y - player.properties.height);
        
        // Fix player properties
        player.properties.damageResistance = Math.max(0, player.properties.damageResistance);
        
        console.log('🔧 Applied automatic fixes to game state');
    }
};

/**
 * Initialize Game Logic System
 */
Game.Logic.init = function() {
    console.log('🧠 Game logic system initializing...');
    
    // Set up validation timer
    Game.Logic.Timer.createTimer('validation', 5000, () => {
        if (Game.DEBUG.ENABLED) {
            Game.Logic.Validator.validateAndFix();
        }
    }, true);
    
    // Set up global action references for backward compatibility
    window.startGame = () => Game.Actions.startGame();
    window.pauseGame = () => Game.Actions.pauseGame();
    window.resumeGame = () => Game.Actions.resumeGame();
    window.restartGame = () => Game.Actions.restartGame();
    window.chooseBuff = (buffId) => Game.Actions.chooseBuff(buffId);
    window.selectTheme = (themeId) => {
        if (window.game && window.game.selectTheme) {
            window.game.selectTheme(themeId);
        } else {
            console.log('Theme selected:', themeId);
            window.currentTheme = themeId;
        }
    };
    window.backToThemeSelection = () => Game.Actions.backToThemeSelection();
    
    console.log('✅ Game logic system initialized');
    return true;
};

// Auto-initialize
Game.Logic.init();