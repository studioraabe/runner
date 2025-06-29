/* ====================================
   GAMESTATE.JS - Zustandsverwaltung
   ==================================== */

// GameState Namespace
Game.State = Game.State || {};

/**
 * State Manager - Zentrale Zustandsverwaltung
 */
Game.State.Manager = {
    // Current game state
    currentState: Game.STATE.THEME_SELECTION,
    previousState: null,
    
    // State change listeners
    listeners: new Map(),
    
    // State data
    stateData: {
        score: 0,
        lives: 4,
        maxLives: 4,
        bullets: 5,
        level: 1,
        levelProgress: 0,
        gameSpeed: 2,
        highScore: 0,
        
        // Statistics
        enemiesDefeated: 0,
        obstaclesAvoided: 0,
        bulletsHit: 0,
        levelsCompleted: 0,
        bulletBoxesFound: 0,
        
        // Invulnerability
        postBuffInvulnerability: 0,
        postDamageInvulnerability: 0,
        
        // Active buffs
        activeBuffs: {},
        availableBuffs: []
    },
    
    // Game running state
    gameRunning: false,
    needsRedraw: true,
    
    /**
     * Change game state
     * @param {string} newState - New state
     * @param {object} data - Optional state data
     */
    setState(newState, data = {}) {
const validStates = Object.values(Game.STATE);
if (!validStates.includes(newState)) {            console.warn(`⚠️ Invalid state: ${newState}`);
            return false;
        }
        
        const oldState = this.currentState;
        this.previousState = oldState;
        this.currentState = newState;
        
        console.log(`🎮 State change: ${oldState} → ${newState}`);
        
        // Merge any provided data
        Object.assign(this.stateData, data);
        
        // Trigger state change listeners
        this._notifyListeners(newState, oldState, data);
        
        // Handle specific state changes
        this._handleStateChange(newState, oldState);
        
        this.needsRedraw = true;
        return true;
    },
    
    /**
     * Get current state
     * @returns {string} Current state
     */
    getState() {
        return this.currentState;
    },
    
    /**
     * Check if in specific state
     * @param {string} state - State to check
     * @returns {boolean}
     */
    isState(state) {
        return this.currentState === state;
    },
    
    /**
     * Go back to previous state
     */
    goToPreviousState() {
        if (this.previousState) {
            this.setState(this.previousState);
        }
    },
    
    /**
     * Add state change listener
     * @param {string} id - Listener ID
     * @param {function} callback - Callback function
     */
    addListener(id, callback) {
        this.listeners.set(id, callback);
    },
    
    /**
     * Remove state change listener
     * @param {string} id - Listener ID
     */
    removeListener(id) {
        this.listeners.delete(id);
    },
    
    /**
     * Update state data
     * @param {object} data - Data to update
     */
    updateData(data) {
        Object.assign(this.stateData, data);
        this.needsRedraw = true;
    },
    
    /**
     * Get state data
     * @param {string} key - Specific key or null for all data
     * @returns {any} State data
     */
    getData(key = null) {
        return key ? this.stateData[key] : { ...this.stateData };
    },
    
    /**
     * Reset game state to initial values
     */
    resetGameState() {
        const theme = Game.Cache.ThemeCache.getTheme();
        
        this.stateData = {
            score: 0,
            lives: Game.CONSTANTS.INITIAL_LIVES,
            maxLives: Game.CONSTANTS.INITIAL_LIVES,
            bullets: Game.CONSTANTS.INITIAL_BULLETS,
            level: 1,
            levelProgress: 0,
            gameSpeed: Game.CONSTANTS.INITIAL_GAME_SPEED,
            highScore: this.stateData.highScore, // Preserve high score
            
            // Reset statistics
            enemiesDefeated: 0,
            obstaclesAvoided: 0,
            bulletsHit: 0,
            levelsCompleted: 0,
            bulletBoxesFound: 0,
            
            // Reset invulnerability
            postBuffInvulnerability: 0,
            postDamageInvulnerability: 0,
            
            // Reset buffs
            activeBuffs: {},
            availableBuffs: theme ? [...theme.buffs] : []
        };
        
        this.gameRunning = false;
        this.needsRedraw = true;
        
        console.log('🔄 Game state reset');
    },
    
    /**
     * Load high score for current theme
     */
    loadHighScore() {
        const key = Game.Themes.Manager.getHighScoreKey();
        const highScore = parseInt(localStorage.getItem(key) || '0');
        this.updateData({ highScore });
        console.log(`📊 Loaded high score: ${highScore}`);
    },
    
    /**
     * Save high score for current theme
     */
    saveHighScore() {
        if (this.stateData.score > this.stateData.highScore) {
            this.stateData.highScore = this.stateData.score;
            const key = Game.Themes.Manager.getHighScoreKey();
            localStorage.setItem(key, this.stateData.highScore.toString());
            console.log(`🏆 New high score: ${this.stateData.highScore}`);
            return true;
        }
        return false;
    },
    
    /**
     * Private method to notify listeners
     * @private
     */
    _notifyListeners(newState, oldState, data) {
        this.listeners.forEach(callback => {
            try {
                callback(newState, oldState, data);
            } catch (error) {
                console.error('Error in state change listener:', error);
            }
        });
    },
    
    /**
     * Private method to handle specific state changes
     * @private
     */
    _handleStateChange(newState, oldState) {
        switch (newState) {
            case Game.STATE.THEME_SELECTION:
                this.gameRunning = false;
                break;
                
            case Game.STATE.START:
                this.gameRunning = false;
                this.loadHighScore();
                break;
                
            case Game.STATE.PLAYING:
                this.gameRunning = true;
                break;
                
            case Game.STATE.PAUSED:
                this.gameRunning = false;
                break;
                
            case Game.STATE.LEVEL_COMPLETE:
                this.gameRunning = false;
                break;
                
            case Game.STATE.GAME_OVER:
                this.gameRunning = false;
                this.saveHighScore();
                break;
        }
    }
};

/**
 * Player State Manager - Speziell für Player-Zustand
 */
Game.State.Player = {
    // Player position and physics
    position: { x: 120, y: 73 },
    velocity: { x: 0, y: 0 },
    
    // Player state flags
    flags: {
        jumping: false,
        grounded: true,
        isHoldingJump: false,
        doubleJumpUsed: false
    },
    
    // Player properties
    properties: {
        width: 40,
        height: 40,
        jumpHoldTime: 0,
        damageResistance: 0,
        facingDirection: 1
    },
    
/**
     * Reset player to initial state
     */
    reset() {
        // FIXED: Korrekte Y-Position basierend auf GROUND_Y
        const groundY = Game.CONSTANTS.GROUND_Y || 364;
        const playerHeight = 64; // Standard player height
        
        this.position = { x: 120, y: groundY - playerHeight };
        this.velocity = { x: 0, y: 0 };
        this.flags = {
            jumping: false,
            grounded: true,
            isHoldingJump: false,
            doubleJumpUsed: false
        };
        this.properties.jumpHoldTime = 0;
        this.properties.damageResistance = 0;
        this.properties.facingDirection = 1;
    },
    
    /**
     * Update player position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    },
    
    /**
     * Update player velocity
     * @param {number} vx - X velocity
     * @param {number} vy - Y velocity
     */
    setVelocity(vx, vy) {
        this.velocity.x = vx;
        this.velocity.y = vy;
    },
    
    /**
     * Check if player is invulnerable
     * @returns {boolean}
     */
    isInvulnerable() {
        const gameState = Game.State.Manager.getData();
        return this.properties.damageResistance > 0 || 
               gameState.postBuffInvulnerability > 0 || 
               gameState.postDamageInvulnerability > 0;
    },
    
    /**
     * Get player bounding box for collision
     * @returns {object} Bounding box
     */
    getBoundingBox() {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.properties.width,
            height: this.properties.height
        };
    }
};

/**
 * Input State Manager - Verwaltet Eingabestatus
 */
Game.State.Input = {
    // Key states
    keys: {
        left: false,
        right: false,
        space: false,
        s: false
    },
    
    // Input flags
    flags: {
        keyRepeatEnabled: false,
        lastKeyTime: 0
    },
    
    /**
     * Set key state
     * @param {string} key - Key name
     * @param {boolean} pressed - Key pressed state
     */
    setKey(key, pressed) {
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = pressed;
        }
    },
    
    /**
     * Get key state
     * @param {string} key - Key name
     * @returns {boolean} Key pressed state
     */
    getKey(key) {
        return this.keys[key] || false;
    },
    
    /**
     * Check if any key is pressed
     * @returns {boolean}
     */
    anyKeyPressed() {
        return Object.values(this.keys).some(pressed => pressed);
    },
    
    /**
     * Reset all keys
     */
    resetKeys() {
        Object.keys(this.keys).forEach(key => {
            this.keys[key] = false;
        });
    }
};

/**
 * Game Objects State Manager - Verwaltet Spielobjekte
 */
Game.State.Objects = {
    // Game object arrays
    obstacles: [],
    bullets: [],
    explosions: [],
    environmentElements: [],
    bloodParticles: [],
    lightningEffects: [],
    scorePopups: [],
    doubleJumpParticles: [],
    
    // Object timers
    obstacleTimer: 0,
    
    /**
     * Clear all game objects
     */
    clearAll() {
        this.obstacles.length = 0;
        this.bullets.length = 0;
        this.explosions.length = 0;
        this.environmentElements.length = 0;
        this.bloodParticles.length = 0;
        this.lightningEffects.length = 0;
        this.scorePopups.length = 0;
        this.doubleJumpParticles.length = 0;
        this.obstacleTimer = 0;
    },
    
    /**
     * Get all objects of specific type
     * @param {string} type - Object type
     * @returns {Array} Array of objects
     */
    getObjects(type) {
        return this[type] || [];
    },
    
    /**
     * Add object to specific array
     * @param {string} type - Object type
     * @param {object} object - Object to add
     */
    addObject(type, object) {
        if (this[type] && Array.isArray(this[type])) {
            this[type].push(object);
        }
    },
    
    /**
     * Remove object from specific array
     * @param {string} type - Object type
     * @param {number} index - Object index
     */
    removeObject(type, index) {
        if (this[type] && Array.isArray(this[type])) {
            this[type].splice(index, 1);
        }
    },
    
    /**
     * Get object count for specific type
     * @param {string} type - Object type
     * @returns {number} Object count
     */
    getObjectCount(type) {
        return this[type] ? this[type].length : 0;
    },
    
    /**
     * Clean up objects based on performance limits
     */
    performanceCleanup() {
        const limits = Game.PERFORMANCE;
        
        // Limit obstacles
        if (this.obstacles.length > limits.MAX_OBSTACLES) {
            this.obstacles.splice(0, this.obstacles.length - limits.MAX_OBSTACLES);
        }
        
        // Limit bullets
        if (this.bullets.length > limits.MAX_BULLETS) {
            this.bullets.splice(0, this.bullets.length - limits.MAX_BULLETS);
        }
        
        // Limit particles
        const totalParticles = this.bloodParticles.length + 
                              this.lightningEffects.length + 
                              this.doubleJumpParticles.length;
        
        if (totalParticles > limits.MAX_PARTICLES) {
            // Remove oldest particles first
            const excess = totalParticles - limits.MAX_PARTICLES;
            let removed = 0;
            
            while (removed < excess && this.bloodParticles.length > 0) {
                this.bloodParticles.shift();
                removed++;
            }
            
            while (removed < excess && this.lightningEffects.length > 0) {
                this.lightningEffects.shift();
                removed++;
            }
            
            while (removed < excess && this.doubleJumpParticles.length > 0) {
                this.doubleJumpParticles.shift();
                removed++;
            }
        }
    }
};

/**
 * URL Parameter Handler - Verwaltet URL-Parameter
 */
Game.State.URLHandler = {
    /**
     * Check and handle URL parameters
     */
    checkURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const theme = urlParams.get('theme');
        
        if (theme === 'cowboy' || theme === 'dungeon') {
            // Auto-select theme
            const themeId = theme === 'dungeon' ? 'Dungeon' : 'cowboy';
            Game.Themes.Manager.setCurrent(themeId);
            Game.Cache.ThemeCache.invalidate();
            
            // Go to start screen
            Game.State.Manager.setState(Game.STATE.START);
            
            // Auto-start if parameter is set
            const autostart = urlParams.get('autostart');
            if (autostart === 'true') {
                setTimeout(() => {
                    Game.State.Manager.setState(Game.STATE.PLAYING);
                }, 500);
            }
            
            console.log(`🔗 URL theme parameter: ${themeId}`);
        }
    }
};

/**
 * Initialize State System
 */
Game.State.init = function() {
    console.log('🎯 State system initialized');
    console.log(`📍 Initial state: ${Game.State.Manager.currentState}`);
    
    // Check URL parameters
    Game.State.URLHandler.checkURLParameters();
    
    // Set up periodic performance cleanup
    setInterval(() => {
console.log('Performance cleanup cycle');
    }, Game.PERFORMANCE.CLEANUP_INTERVAL * (1000 / Game.CONSTANTS.FPS));
    
    // Set up global references for backward compatibility
    window.gameState = Game.State.Manager.currentState;
    window.gameRunning = Game.State.Manager.gameRunning;
    window.player = Game.State.Player;
    
    // Add state change listener to update global variables
    Game.State.Manager.addListener('globalSync', (newState) => {
        window.gameState = newState;
        window.gameRunning = Game.State.Manager.gameRunning;
    });
    
    return true;
};

// Auto-initialize
Game.State.init();