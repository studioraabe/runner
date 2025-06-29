/* ====================================
   SCREENMANAGER.JS - Screen-Management
   ==================================== */

// Screen Namespace
Game.Screens = Game.Screens || {};

/**
 * Screen Manager - Verwaltet alle Spielbildschirme
 */
Game.Screens.Manager = {
    // Screen registry
    screens: new Map(),
    currentScreen: null,
    previousScreen: null,
    
    // Screen transition settings
    transitionDuration: 300,
    isTransitioning: false,
    
    /**
     * Initialize screen manager
     */
    init() {
        console.log('📺 Screen Manager initializing...');
        
        // Register all screens
        this.registerScreens();
        
        // Set up state change listener
        Game.State.Manager.addListener('screen_manager', (newState, oldState) => {
            this.handleStateChange(newState, oldState);
        });
        
        // Set up info overlay handler
        this.setupInfoOverlay();
        
        console.log('✅ Screen Manager initialized');
    },
    
    /**
     * Register all available screens
     */
    registerScreens() {
        const screenConfigs = [
            {
                id: 'themeSelection',
                state: Game.STATE.THEME_SELECTION,
                element: 'themeSelection',
                canTransitionTo: [Game.STATE.START]
            },
            {
                id: 'startScreen',
                state: Game.STATE.START,
                element: 'startScreen',
                canTransitionTo: [Game.STATE.PLAYING, Game.STATE.THEME_SELECTION]
            },
            {
                id: 'gameScreen',
                state: Game.STATE.PLAYING,
                element: null, // No overlay element for playing state
                canTransitionTo: [Game.STATE.PAUSED, Game.STATE.LEVEL_COMPLETE, Game.STATE.GAME_OVER]
            },
            {
                id: 'pauseScreen',
                state: Game.STATE.PAUSED,
                element: 'pauseScreen',
                canTransitionTo: [Game.STATE.PLAYING, Game.STATE.THEME_SELECTION]
            },
            {
                id: 'levelCompleteScreen',
                state: Game.STATE.LEVEL_COMPLETE,
                element: 'levelComplete',
                canTransitionTo: [Game.STATE.PLAYING]
            },
            {
                id: 'gameOverScreen',
                state: Game.STATE.GAME_OVER,
                element: 'gameOver',
                canTransitionTo: [Game.STATE.PLAYING, Game.STATE.THEME_SELECTION]
            },
            {
                id: 'infoOverlay',
                state: null, // Special overlay, not tied to game state
                element: 'infoOverlay',
                isOverlay: true
            }
        ];
        
        screenConfigs.forEach(config => {
            this.screens.set(config.id, config);
        });
        
        console.log(`📋 Registered ${this.screens.size} screens`);
    },
    
    /**
     * Handle game state changes
     * @param {string} newState - New game state
     * @param {string} oldState - Previous game state
     */
    handleStateChange(newState, oldState) {
        // Find screen for new state
        const newScreen = this.findScreenByState(newState);
        
        if (newScreen) {
            this.showScreen(newScreen.id, oldState !== newState);
        }
    },
    
    /**
     * Find screen by game state
     * @param {string} state - Game state
     * @returns {object|null} Screen configuration
     */
    findScreenByState(state) {
        for (const [id, screen] of this.screens) {
            if (screen.state === state) {
                return screen;
            }
        }
        return null;
    },
    
    /**
     * Show specific screen
     * @param {string} screenId - Screen ID
     * @param {boolean} animated - Whether to animate transition
     */
    async showScreen(screenId, animated = true) {
        if (this.isTransitioning) return;
        
        const screen = this.screens.get(screenId);
        if (!screen) {
            console.warn(`⚠️ Screen not found: ${screenId}`);
            return;
        }
        
        console.log(`📺 Showing screen: ${screenId}`);
        
        if (animated && this.currentScreen && this.currentScreen !== screenId) {
            this.isTransitioning = true;
            
            // Hide current screen with animation
            await this.hideCurrentScreen();
            
            // Show new screen with animation
            await this.showScreenAnimated(screen);
            
            this.isTransitioning = false;
        } else {
            // Immediate show without animation
            this.hideAllScreens();
            if (screen.element) {
                this.showElement(screen.element);
            }
        }
        
        this.previousScreen = this.currentScreen;
        this.currentScreen = screenId;
        
        // Update screen-specific content
        this.updateScreenContent(screen);
    },
    
    /**
     * Hide current screen with animation
     */
    async hideCurrentScreen() {
        if (!this.currentScreen) return;
        
        const currentScreenConfig = this.screens.get(this.currentScreen);
        if (currentScreenConfig && currentScreenConfig.element) {
            await Game.UI.Animations.fadeOut(currentScreenConfig.element, this.transitionDuration);
        }
    },
    
    /**
     * Show screen with animation
     * @param {object} screen - Screen configuration
     */
    async showScreenAnimated(screen) {
        if (screen.element) {
            await Game.UI.Animations.fadeIn(screen.element, this.transitionDuration);
        }
    },
    
    /**
     * Hide all screens
     */
    hideAllScreens() {
        this.screens.forEach(screen => {
            if (screen.element && !screen.isOverlay) {
                this.hideElement(screen.element);
            }
        });
    },
    
    /**
     * Show DOM element
     * @param {string} elementId - Element ID
     */
    showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
        }
    },
    
    /**
     * Hide DOM element
     * @param {string} elementId - Element ID
     */
    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    },
    
    /**
     * Update screen-specific content
     * @param {object} screen - Screen configuration
     */
    updateScreenContent(screen) {
        switch (screen.id) {
            case 'startScreen':
                this.updateStartScreen();
                break;
            case 'levelCompleteScreen':
                this.updateLevelCompleteScreen();
                break;
            case 'pauseScreen':
                this.updatePauseScreen();
                break;
            case 'gameOverScreen':
                this.updateGameOverScreen();
                break;
        }
    },
    
 
/**
     * Update start screen content
     */
    updateStartScreen() {
        const theme = Game.Cache.ThemeCache.getTheme();
        if (!theme) return;
        
        // Apply theme-specific content
        // FIXED: Die Properties sind direkt im theme, nicht unter ui
        Game.UI.Manager.updateText('gameTitle', theme.title);
        Game.UI.Manager.updateText('startButton', theme.startButton || 'Start Adventure');
        Game.UI.Manager.updateText('gameInstructions', theme.description || '');
        
        // Update any other theme-specific elements
        const gameSubtitle = document.getElementById('gameSubtitle');
        if (gameSubtitle) {
            gameSubtitle.textContent = theme.name || '';
        }
    },
    
    /**
     * Update level complete screen content
     */
    updateLevelCompleteScreen() {
        const gameData = Game.State.Manager.getData();
        const theme = Game.Cache.ThemeCache.getTheme();
        
        // Update buff choice title
        Game.UI.Manager.updateText('buffChoiceTitle', theme.ui.buffChoiceTitle);
        
        // Update available buffs
        Game.UI.Manager.updateBuffButtons();
    },
    
    /**
     * Update pause screen content
     */
    updatePauseScreen() {
        Game.UI.Manager.updatePauseScreen();
    },
    
    /**
     * Update game over screen content
     */
    updateGameOverScreen() {
        Game.UI.Manager.updateGameOverScreen();
    },
    
    /**
     * Setup info overlay functionality
     */
    setupInfoOverlay() {
        // Info overlay is special - it can be shown over any other screen
        this.infoOverlayVisible = false;
    },
    
    /**
     * Toggle info overlay
     */
    toggleInfoOverlay() {
        const overlay = document.getElementById('infoOverlay');
        if (!overlay) return;
        
        if (this.infoOverlayVisible) {
            // Hide info overlay
            Game.UI.Animations.fadeOut('infoOverlay', 200);
            this.infoOverlayVisible = false;
            
            // Resume game if it was playing
            if (Game.State.Manager.getState() === Game.STATE.PAUSED && 
                Game.State.Manager.previousState === Game.STATE.PLAYING) {
                setTimeout(() => {
                    Game.Actions.resumeGame();
                }, 200);
            }
        } else {
            // Show info overlay
            // Pause game if currently playing
            if (Game.State.Manager.getState() === Game.STATE.PLAYING) {
                Game.State.Manager.setState(Game.STATE.PAUSED);
            }
            
            Game.UI.Animations.fadeIn('infoOverlay', 200);
            this.infoOverlayVisible = true;
        }
    },
    
    /**
     * Check if screen transition is valid
     * @param {string} fromState - Current state
     * @param {string} toState - Target state
     * @returns {boolean} Whether transition is valid
     */
    canTransition(fromState, toState) {
        const fromScreen = this.findScreenByState(fromState);
        if (!fromScreen || !fromScreen.canTransitionTo) return true;
        
        return fromScreen.canTransitionTo.includes(toState);
    },
    
    /**
     * Get current screen info
     * @returns {object|null} Current screen configuration
     */
    getCurrentScreen() {
        return this.currentScreen ? this.screens.get(this.currentScreen) : null;
    },
    
    /**
     * Get previous screen info
     * @returns {object|null} Previous screen configuration
     */
    getPreviousScreen() {
        return this.previousScreen ? this.screens.get(this.previousScreen) : null;
    },
    
    /**
     * Force show screen without state change
     * @param {string} screenId - Screen ID
     */
    forceShowScreen(screenId) {
        this.hideAllScreens();
        const screen = this.screens.get(screenId);
        if (screen && screen.element) {
            this.showElement(screen.element);
            this.currentScreen = screenId;
        }
    },
    
    /**
     * Add custom screen
     * @param {object} screenConfig - Screen configuration
     */
    addScreen(screenConfig) {
        this.screens.set(screenConfig.id, screenConfig);
        console.log(`📺 Added custom screen: ${screenConfig.id}`);
    },
    
    /**
     * Remove screen
     * @param {string} screenId - Screen ID
     */
    removeScreen(screenId) {
        if (this.screens.delete(screenId)) {
            console.log(`📺 Removed screen: ${screenId}`);
        }
    },
    
    /**
     * Get all registered screens
     * @returns {Array} Array of screen configurations
     */
    getAllScreens() {
        return Array.from(this.screens.values());
    }
};

/**
 * Screen Transition Effects
 */
Game.Screens.Transitions = {
    /**
     * Slide transition between screens
     * @param {string} fromElement - From element ID
     * @param {string} toElement - To element ID
     * @param {string} direction - Slide direction
     */
    async slide(fromElement, toElement, direction = 'left') {
        const slideOut = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
        const slideIn = direction === 'left' ? 'translateX(100%)' : 'translateX(-100%)';
        
        // Prepare incoming screen
        const toEl = document.getElementById(toElement);
        if (toEl) {
            toEl.style.transform = slideIn;
            toEl.style.display = 'block';
        }
        
        // Slide out current screen and slide in new screen
        await Promise.all([
            Game.UI.Animations.animate(fromElement, { transform: slideOut }, 300),
            Game.UI.Animations.animate(toElement, { transform: 'translateX(0)' }, 300)
        ]);
        
        // Hide outgoing screen
        const fromEl = document.getElementById(fromElement);
        if (fromEl) {
            fromEl.style.display = 'none';
            fromEl.style.transform = 'translateX(0)';
        }
    },
    
    /**
     * Scale transition between screens
     * @param {string} fromElement - From element ID
     * @param {string} toElement - To element ID
     */
    async scale(fromElement, toElement) {
        // Scale down current screen
        await Game.UI.Animations.animate(fromElement, { 
            transform: 'scale(0.8)', 
            opacity: '0' 
        }, 200);
        
        // Hide current screen
        const fromEl = document.getElementById(fromElement);
        if (fromEl) {
            fromEl.style.display = 'none';
            fromEl.style.transform = 'scale(1)';
            fromEl.style.opacity = '1';
        }
        
        // Scale up new screen
        const toEl = document.getElementById(toElement);
        if (toEl) {
            toEl.style.transform = 'scale(0.8)';
            toEl.style.opacity = '0';
            toEl.style.display = 'block';
            
            await Game.UI.Animations.animate(toElement, { 
                transform: 'scale(1)', 
                opacity: '1' 
            }, 200);
        }
    }
};

/**
 * Initialize Screen System
 */
Game.Screens.init = function() {
    console.log('🎬 Screen system initializing...');
    
    // Initialize screen manager
    Game.Screens.Manager.init();
    
    // Set up global functions for backward compatibility
    Game.toggleInfoOverlay = () => Game.Screens.Manager.toggleInfoOverlay();
    window.hideAllScreens = () => Game.Screens.Manager.hideAllScreens();
    window.showScreen = (screenId) => Game.Screens.Manager.forceShowScreen(screenId);
    
    console.log('✅ Screen system initialized');
    return true;
};

// Auto-initialize
Game.Screens.init();