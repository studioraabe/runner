/* ====================================
   INPUTHANDLER.JS - Eingabe-Verarbeitung
   ==================================== */

// Input Namespace
Game.Input = Game.Input || {};

/**
 * Input Handler - Zentrale Eingabeverarbeitung
 */
Game.Input.Handler = {
    // Input state
    isInitialized: false,
    
    // Key mapping configuration
    keyMap: {
        'Space': 'space',
        'KeyS': 's',
        'KeyA': 'left',
        'KeyD': 'right',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'Escape': 'escape'
    },
    
    // Input debouncing
    debounceTimers: new Map(),
    debounceDelay: 50, // 50ms debounce for certain actions
    
    // Action handlers
    actionHandlers: new Map(),
    
    /**
     * Initialize input system
     */
    init() {
        if (this.isInitialized) return;
        
        // Set up event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Set up action handlers
        this.setupActionHandlers();
        
        this.isInitialized = true;
        console.log('⌨️ Input system initialized');
    },
    
    /**
     * Handle key down events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        const action = this.keyMap[event.code];
        if (!action) return;
        
        // Prevent default browser behavior for game keys
        event.preventDefault();
        
        // Update input state
        const wasPressed = Game.State.Input.getKey(action);
        Game.State.Input.setKey(action, true);
        
        // Handle action if it wasn't already pressed (prevent key repeat)
        if (!wasPressed || action === 'space') { // Space allows repeat for jump holding
            this.handleAction(action, 'down', event);
        }
    },
    
    /**
     * Handle key up events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyUp(event) {
        const action = this.keyMap[event.code];
        if (!action) return;
        
        event.preventDefault();
        
        // Update input state
        Game.State.Input.setKey(action, false);
        
        // Handle action
        this.handleAction(action, 'up', event);
    },
    
    /**
     * Handle specific actions
     * @param {string} action - Action name
     * @param {string} type - Action type (down/up)
     * @param {KeyboardEvent} event - Original event
     */
    handleAction(action, type, event) {
        const handler = this.actionHandlers.get(`${action}_${type}`);
        if (handler) {
            // Debounce certain actions
            if (this.shouldDebounce(action, type)) {
                this.debounceAction(action, type, handler);
            } else {
                handler(event);
            }
        }
    },
    
    /**
     * Check if action should be debounced
     * @param {string} action - Action name
     * @param {string} type - Action type
     * @returns {boolean}
     */
    shouldDebounce(action, type) {
        return (action === 's' && type === 'down') || 
               (action === 'escape' && type === 'down');
    },
    
    /**
     * Debounce action execution
     * @param {string} action - Action name
     * @param {string} type - Action type
     * @param {function} handler - Action handler
     */
    debounceAction(action, type, handler) {
        const key = `${action}_${type}`;
        
        // Clear existing timer
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }
        
        // Set new timer
        const timer = setTimeout(() => {
            handler();
            this.debounceTimers.delete(key);
        }, this.debounceDelay);
        
        this.debounceTimers.set(key, timer);
    },
    
    /**
     * Setup action handlers
     */
    setupActionHandlers() {
        // Space key actions (Jump)
        this.actionHandlers.set('space_down', () => {
            this.handleJumpStart();
        });
        
        this.actionHandlers.set('space_up', () => {
            this.handleJumpStop();
        });
        
        // Shoot action
        this.actionHandlers.set('s_down', () => {
            this.handleShoot();
        });
        
        // Movement actions (no specific handlers needed, handled in game loop)
        this.actionHandlers.set('left_down', () => {
            Game.State.Player.properties.facingDirection = -1;
        });
        
        this.actionHandlers.set('right_down', () => {
            Game.State.Player.properties.facingDirection = 1;
        });
        
        // Escape key (Pause)
        this.actionHandlers.set('escape_down', () => {
            this.handleEscape();
        });
    },
    
    /**
     * Handle jump start
     */
    handleJumpStart() {
        const currentState = Game.State.Manager.getState();
        
        // Handle different states
        switch (currentState) {
            case Game.STATE.START:
                Game.Actions.startGame();
                break;
                
            case Game.STATE.GAME_OVER:
                Game.Actions.restartGame();
                break;
                
            case Game.STATE.PLAYING:
                this.performJump();
                break;
        }
    },
    
    /**
     * Handle jump stop
     */
    handleJumpStop() {
        const player = Game.State.Player;
        player.flags.isHoldingJump = false;
    },
    
    /**
     * Perform jump action
     */
    performJump() {
        const player = Game.State.Player;
        const gameData = Game.State.Manager.getData();
        
        if (!Game.State.Manager.gameRunning) return;
        
        if (player.flags.grounded) {
            // Regular jump
            player.velocity.y = Game.CONSTANTS.JUMP_STRENGTH;
            player.flags.jumping = true;
            player.flags.grounded = false;
            player.flags.isHoldingJump = true;
            player.properties.jumpHoldTime = 0;
            player.flags.doubleJumpUsed = false;
            
            Game.Sound.Effects.jump();
            
        } else if (gameData.activeBuffs.doubleJump && !player.flags.doubleJumpUsed) {
            // Double jump
            player.velocity.y = Game.CONSTANTS.DOUBLE_JUMP_STRENGTH;
            player.flags.doubleJumpUsed = true;
            player.flags.isHoldingJump = true;
            player.properties.jumpHoldTime = 0;
            
            // Create double jump particles
            Game.Effects.createDoubleJumpParticles(player.position.x, player.position.y);
            Game.Sound.Effects.jump();
        }
    },
    
    /**
     * Handle shoot action
     */
    handleShoot() {
        if (!Game.State.Manager.gameRunning) return;
        
        const gameData = Game.State.Manager.getData();
        if (gameData.bullets <= 0) return;
        
        const player = Game.State.Player;
        const activeBuffs = gameData.activeBuffs;
        
        // Determine bullet count and type
        const canUseMultiShot = activeBuffs.multiShot && gameData.bullets >= 3;
        const bulletCount = canUseMultiShot ? 3 : 1;
        const enhanced = canUseMultiShot;
        
        // Create bullets
        for (let i = 0; i < bulletCount; i++) {
            const offsetY = bulletCount > 1 ? (i - 1) * 8 : 0;
            const startX = player.properties.facingDirection === 1 ? 
                         player.position.x + player.properties.width : 
                         player.position.x;
            const bulletSpeed = Game.CONSTANTS.BULLET_SPEED * player.properties.facingDirection;
            
            const bullet = {
                x: startX,
                y: player.position.y + player.properties.height / 1.5 + offsetY,
                speed: bulletSpeed,
                enhanced: enhanced,
                direction: player.properties.facingDirection
            };
            
            Game.State.Objects.addObject('bullets', bullet);
        }
        
        // Update bullets count
        Game.State.Manager.updateData({ 
            bullets: gameData.bullets - bulletCount 
        });
        
        Game.Sound.Effects.shoot();
    },
    
    /**
     * Handle escape key
     */
    handleEscape() {
        const currentState = Game.State.Manager.getState();
        
        if (currentState === Game.STATE.PLAYING) {
            Game.Actions.pauseGame();
        } else if (currentState === Game.STATE.PAUSED) {
            Game.Actions.resumeGame();
        }
    },
    
    /**
     * Get current input state for movement
     * @returns {object} Movement input state
     */
    getMovementInput() {
        return {
            left: Game.State.Input.getKey('left'),
            right: Game.State.Input.getKey('right'),
            space: Game.State.Input.getKey('space')
        };
    },
    
    /**
     * Add custom key binding
     * @param {string} keyCode - Key code
     * @param {string} action - Action name
     */
    addKeyBinding(keyCode, action) {
        this.keyMap[keyCode] = action;
    },
    
    /**
     * Remove key binding
     * @param {string} keyCode - Key code
     */
    removeKeyBinding(keyCode) {
        delete this.keyMap[keyCode];
    },
    
    /**
     * Add action handler
     * @param {string} action - Action name
     * @param {string} type - Action type (down/up)
     * @param {function} handler - Handler function
     */
    addActionHandler(action, type, handler) {
        this.actionHandlers.set(`${action}_${type}`, handler);
    },
    
    /**
     * Remove action handler
     * @param {string} action - Action name
     * @param {string} type - Action type
     */
    removeActionHandler(action, type) {
        this.actionHandlers.delete(`${action}_${type}`);
    },
    
    /**
     * Clear all debounce timers
     */
    clearDebounceTimers() {
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
    },
    
    /**
     * Reset input system
     */
    reset() {
        Game.State.Input.resetKeys();
        this.clearDebounceTimers();
    },
    
    /**
     * Cleanup input system
     */
    cleanup() {
        if (this.isInitialized) {
            document.removeEventListener('keydown', this.handleKeyDown);
            document.removeEventListener('keyup', this.handleKeyUp);
            this.clearDebounceTimers();
            this.isInitialized = false;
        }
    }
};

/**
 * Touch Input Handler - For mobile support (future)
 */
Game.Input.TouchHandler = {
    isInitialized: false,
    touchAreas: new Map(),
    
    /**
     * Initialize touch input (placeholder for mobile support)
     */
    init() {
        if (this.isInitialized) return;
        
        // Set up touch areas
        this.setupTouchAreas();
        
        // Add touch event listeners
        document.addEventListener('touchstart', this.handleTouchStart.bind(this));
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
        document.addEventListener('touchmove', this.handleTouchMove.bind(this));
        
        this.isInitialized = true;
        console.log('📱 Touch input initialized');
    },
    
    /**
     * Setup touch areas for mobile controls
     */
    setupTouchAreas() {
        // Define touch areas for different actions
        this.touchAreas.set('jump', {
            x: 0, y: 0, width: 200, height: 500, // Left side for jump
            action: 'space'
        });
        
        this.touchAreas.set('shoot', {
            x: 600, y: 0, width: 200, height: 500, // Right side for shoot
            action: 's'
        });
        
        this.touchAreas.set('move_left', {
            x: 50, y: 400, width: 100, height: 100,
            action: 'left'
        });
        
        this.touchAreas.set('move_right', {
            x: 150, y: 400, width: 100, height: 100,
            action: 'right'
        });
    },
    
    /**
     * Handle touch start
     * @param {TouchEvent} event - Touch event
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        for (const touch of event.changedTouches) {
            const area = this.getTouchArea(touch.clientX, touch.clientY);
            if (area) {
                Game.State.Input.setKey(area.action, true);
                Game.Input.Handler.handleAction(area.action, 'down');
            }
        }
    },
    
    /**
     * Handle touch end
     * @param {TouchEvent} event - Touch event
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        for (const touch of event.changedTouches) {
            const area = this.getTouchArea(touch.clientX, touch.clientY);
            if (area) {
                Game.State.Input.setKey(area.action, false);
                Game.Input.Handler.handleAction(area.action, 'up');
            }
        }
    },
    
    /**
     * Handle touch move
     * @param {TouchEvent} event - Touch event
     */
    handleTouchMove(event) {
        event.preventDefault();
        // Handle touch move if needed for gestures
    },
    
    /**
     * Get touch area for coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {object|null} Touch area or null
     */
    getTouchArea(x, y) {
        for (const [name, area] of this.touchAreas) {
            if (x >= area.x && x <= area.x + area.width &&
                y >= area.y && y <= area.y + area.height) {
                return area;
            }
        }
        return null;
    }
};

/**
 * Initialize Input System
 */
Game.Input.init = function() {
    console.log('🎮 Input system initializing...');
    
    // Initialize keyboard input
    Game.Input.Handler.init();
    
    // Initialize touch input for mobile devices
    if ('ontouchstart' in window) {
        Game.Input.TouchHandler.init();
    }
    
    // Set up global references for backward compatibility
    window.keys = Game.State.Input.keys;
    
    return true;
};

// Auto-initialize
Game.Input.init();