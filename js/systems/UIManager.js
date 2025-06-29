/* ====================================
   UIMANAGER.JS - UI-Updates und HUD
   ==================================== */


// UI Namespace
Game.UI = Game.UI || {};

// Theme Helper Function
Game.UI.getTheme = function() {
    if (window.game && window.game.getGameCache) {
        return window.game.getGameCache().getTheme();
    } else {
        return {
            id: 'cowboy',
            title: '🤠 Desert Cowboy Runner',
            labels: { score: 'Score', level: 'Level', bullets: 'Bullets', lives: 'Lives', highScore: 'High Score', gameOver: '💀 Game Over! 💀', finalScore: 'Final Score' },
            ui: { startButton: 'Start Adventure', buffChoiceTitle: 'Choose Your Buff:', gameDescription: 'Avoid obstacles and shoot enemies!' }
        };
    }
};




/**
 * UI Manager - Zentrale UI-Verwaltung
 */
Game.UI.Manager = {
    // UI elements cache
    elements: new Map(),
    
    // Update flags
    needsUpdate: true,
    lastUpdateTime: 0,
    updateThrottle: 16, // ~60fps
    
    // Animation frame ID
    animationFrameId: null,
    
    /**
     * Initialize UI system
     */
    init() {
        console.log('🖥️ UI Manager initializing...');
        
        // Cache UI elements
        this.cacheElements();
        
        // Set up theme application
        this.applyCurrentTheme();
        
        // Set up state change listener
        Game.State.Manager.addListener('ui_update', (newState, oldState) => {
            this.onStateChange(newState, oldState);
        });
        
        // Start update loop
        this.startUpdateLoop();
        
        console.log('✅ UI Manager initialized');
    },
    
    /**
     * Cache frequently used UI elements
     */
    cacheElements() {
        const elementIds = [
            'score', 'level', 'bullets', 'livesLabel', 'highscoreValue',
            'heartsContainer', 'activeBuffs', 'scoreLabel', 'levelLabel',
            'bulletsLabel', 'highscoreLabel', 'gameTitle', 'startButton',
            'gameSubtitle', 'gameDescription', 'gameInstructions',
            'buffChoiceTitle', 'buffButtons', 'pauseScore', 'pauseLevel',
            'pauseLives', 'finalScore', 'levelsCompleted', 'newHighScore',
            'gameOverTitle', 'finalScoreLabel'
        ];
        
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.elements.set(id, element);
            }
        });
        
        console.log(`📦 Cached ${this.elements.size} UI elements`);
    },
    
    /**
     * Get cached element
     * @param {string} id - Element ID
     * @returns {Element|null} DOM element
     */
    getElement(id) {
        return this.elements.get(id) || document.getElementById(id);
    },
    
    /**
     * Update element text content
     * @param {string} id - Element ID
     * @param {string} text - Text content
     */
    updateText(id, text) {
        const element = this.getElement(id);
        if (element && element.textContent !== text) {
            element.textContent = text;
        }
    },
    
    /**
     * Update element HTML content
     * @param {string} id - Element ID
     * @param {string} html - HTML content
     */
    updateHTML(id, html) {
        const element = this.getElement(id);
        if (element) {
            element.innerHTML = html;
        }
    },
    
    /**
     * Start UI update loop
     */
    startUpdateLoop() {
        const update = () => {
            const now = Date.now();
            
            if (this.needsUpdate && now - this.lastUpdateTime >= this.updateThrottle) {
                this.updateGameUI();
                this.lastUpdateTime = now;
                this.needsUpdate = false;
            }
            
            this.animationFrameId = requestAnimationFrame(update);
        };
        
        update();
    },
    
    /**
     * Stop UI update loop
     */
    stopUpdateLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    },
    
    /**
     * Mark UI for update
     */
    markForUpdate() {
        this.needsUpdate = true;
    },
    
    /**
     * Update main game UI
     */
    updateGameUI() {
        const gameData = Game.State.Manager.getData();
        
        // Update score and level
        this.updateText('score', gameData.score.toString());
        this.updateText('level', gameData.level.toString());
        this.updateText('bullets', gameData.bullets.toString());
        this.updateText('highscoreValue', gameData.highScore.toString());
        
        // Update hearts display
        this.updateHeartsDisplay(gameData.lives, gameData.maxLives);
        
        // Update active buffs
        this.updateActiveBuffsDisplay(gameData.activeBuffs);
    },
    
    /**
     * Update hearts display
     * @param {number} lives - Current lives
     * @param {number} maxLives - Maximum lives
     */
    updateHeartsDisplay(lives, maxLives) {
        const container = this.getElement('heartsContainer');
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Add heart elements
        for (let i = 0; i < maxLives; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart' + (i >= lives ? ' empty' : '');
            heart.textContent = '♥';
            container.appendChild(heart);
        }
    },
    
    /**
     * Update active buffs display
     * @param {object} activeBuffs - Active buffs object
     */
    updateActiveBuffsDisplay(activeBuffs) {
        const buffDisplay = this.getElement('activeBuffs');
        if (!buffDisplay) return;
        
const theme = Game.UI.getTheme();
        let buffText = '';
        
        if (activeBuffs.multiShot > 0) {
            buffText += theme.id === 'cowboy' ? '🔥 Multi-Shot ' : '⚡ Chain Lightning ';
        }
        if (activeBuffs.extraLife > 0) {
            buffText += theme.id === 'cowboy' ? '❤️ Tough Hide ' : '🧟 Undead Vigor ';
        }
        if (activeBuffs.doubleJump > 0) {
            buffText += theme.id === 'cowboy' ? '🦅 Sky Walker ' : '🌙 Shadow Leap ';
        }
        
        if (buffText) {
            buffDisplay.textContent = buffText.trim();
            buffDisplay.style.display = 'block';
        } else {
            buffDisplay.style.display = 'none';
        }
    },
    
    /**
     * Apply current theme to UI
     */
    applyCurrentTheme() {
const theme = Game.UI.getTheme();
        if (!theme) return;
        
        // Update theme-specific labels
        this.updateText('scoreLabel', theme.labels.score);
        this.updateText('levelLabel', theme.labels.level);
        this.updateText('bulletsLabel', theme.labels.bullets);
        this.updateText('livesLabel', theme.labels.lives);
        this.updateText('highscoreLabel', theme.labels.highScore);
        
        // Update theme-specific UI text
        this.updateText('gameTitle', theme.title);
        this.updateText('startButton', theme.ui.startButton);
        this.updateText('buffChoiceTitle', theme.ui.buffChoiceTitle);
        this.updateText('gameInstructions', theme.ui.gameDescription);
        this.updateText('gameOverTitle', theme.labels.gameOver);
        this.updateText('finalScoreLabel', theme.labels.finalScore);
        
        // Update container theme class
        const container = document.getElementById('gameContainer');
        if (container) {
            container.className = theme.id + '-theme';
        }
        
        console.log(`🎨 Applied theme: ${theme.name}`);
    },
    
    /**
     * Handle state changes
     * @param {string} newState - New state
     * @param {string} oldState - Previous state
     */
    onStateChange(newState, oldState) {
        console.log(`🔄 UI state change: ${oldState} → ${newState}`);
        
        switch (newState) {
            case Game.STATE.START:
                this.applyCurrentTheme();
                break;
                
            case Game.STATE.LEVEL_COMPLETE:
                this.updateLevelCompleteScreen();
                break;
                
            case Game.STATE.PAUSED:
                this.updatePauseScreen();
                break;
                
            case Game.STATE.GAME_OVER:
                this.updateGameOverScreen();
                break;
        }
        
        this.markForUpdate();
    },
    
    /**
     * Update level complete screen
     */
    updateLevelCompleteScreen() {
        this.updateBuffButtons();
    },
    
    /**
     * Update buff selection buttons
     */
    updateBuffButtons() {
        const container = this.getElement('buffButtons');
        if (!container) return;
        
        const gameData = Game.State.Manager.getData();
        const availableBuffs = gameData.availableBuffs;
        
        container.innerHTML = '';
        
        availableBuffs.forEach(buff => {
            const button = document.createElement('div');
            button.className = 'buff-card';
            button.onclick = () => Game.Actions.chooseBuff(buff.id);
            
            const title = document.createElement('div');
            title.className = 'buff-title';
            title.textContent = buff.title;
            
            const desc = document.createElement('div');
            desc.className = 'buff-desc';
            desc.textContent = buff.desc;
            
            button.appendChild(title);
            button.appendChild(desc);
            container.appendChild(button);
        });
    },
    
    /**
     * Update pause screen
     */
    updatePauseScreen() {
        const gameData = Game.State.Manager.getData();
        
        this.updateText('pauseScore', gameData.score.toString());
        this.updateText('pauseLevel', gameData.level.toString());
        this.updateText('pauseLives', gameData.lives.toString());
        
        // Update pause screen labels
        const theme = Game.UI.getTheme();
        this.updateText('pauseScoreLabel', theme.labels.score);
        this.updateText('pauseLevelLabel', theme.labels.level);
        this.updateText('pauseLivesLabel', theme.labels.lives);
    },
    
    /**
     * Update game over screen
     */
    updateGameOverScreen() {
        const gameData = Game.State.Manager.getData();
        
        this.updateText('finalScore', gameData.score.toString());
        this.updateText('levelsCompleted', gameData.levelsCompleted.toString());
        
        // Check for new high score
        const newHighScoreElement = this.getElement('newHighScore');
        if (newHighScoreElement) {
            if (gameData.score > gameData.highScore) {
                newHighScoreElement.style.display = 'block';
            } else {
                newHighScoreElement.style.display = 'none';
            }
        }
    },
    
    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, warning, error)
     * @param {number} duration - Duration in milliseconds
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            backgroundColor: this.getNotificationColor(type),
            color: 'white',
            borderRadius: '8px',
            zIndex: '1000',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        // Add to document
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    },
    
    /**
     * Get notification color based on type
     * @param {string} type - Notification type
     * @returns {string} Color value
     */
    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            warning: '#ffa726',
            error: '#ff1744',
            info: '#00d4ff'
        };
        return colors[type] || colors.info;
    },
    
    /**
     * Create score popup effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number|string} points - Points value
     */
    createScorePopup(x, y, points) {
        const popup = {
            x: x,
            y: y,
            points: points,
            life: Game.ANIMATION_CONFIG.SCORE_POPUP_LIFE,
            maxLife: Game.ANIMATION_CONFIG.SCORE_POPUP_LIFE
        };
        
        Game.State.Objects.addObject('scorePopups', popup);
    },
    
    /**
     * Toggle element visibility
     * @param {string} id - Element ID
     * @param {boolean} visible - Visibility state
     */
    toggleElement(id, visible) {
        const element = this.getElement(id);
        if (element) {
            element.style.display = visible ? 'block' : 'none';
        }
    },
    
    /**
     * Get element visibility
     * @param {string} id - Element ID
     * @returns {boolean} Visibility state
     */
    isElementVisible(id) {
        const element = this.getElement(id);
        return element ? element.style.display !== 'none' : false;
    }
};

/**
 * Screen Manager Integration
 */
Game.UI.Screens = {
    /**
     * Hide all screens
     */
    hideAll() {
        const screens = [
            'themeSelection', 'startScreen', 'levelComplete', 
            'gameOver', 'pauseScreen', 'infoOverlay'
        ];
        
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) {
                screen.style.display = 'none';
            }
        });
    },
    
    /**
     * Show specific screen
     * @param {string} screenId - Screen ID to show
     */
    show(screenId) {
        this.hideAll();
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.display = 'block';
        }
    },
    
    /**
     * Toggle screen visibility
     * @param {string} screenId - Screen ID
     */
    toggle(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            const isVisible = screen.style.display !== 'none';
            screen.style.display = isVisible ? 'none' : 'block';
        }
    }
};

/**
 * UI Animation System
 */
Game.UI.Animations = {
    activeAnimations: new Map(),
    
    /**
     * Animate element with CSS transitions
     * @param {string} elementId - Element ID
     * @param {object} properties - CSS properties to animate
     * @param {number} duration - Animation duration in ms
     * @param {string} easing - CSS easing function
     * @returns {Promise} Animation promise
     */
    animate(elementId, properties, duration = 300, easing = 'ease') {
        return new Promise((resolve) => {
            const element = Game.UI.Manager.getElement(elementId);
            if (!element) {
                resolve();
                return;
            }
            
            // Cancel existing animation
            if (this.activeAnimations.has(elementId)) {
                this.activeAnimations.get(elementId).cancel();
            }
            
            // Set transition
            element.style.transition = `all ${duration}ms ${easing}`;
            
            // Apply properties
            Object.assign(element.style, properties);
            
            // Handle animation completion
            const animationData = {
                element,
                timeout: setTimeout(() => {
                    element.style.transition = '';
                    this.activeAnimations.delete(elementId);
                    resolve();
                }, duration),
                cancel: () => {
                    clearTimeout(animationData.timeout);
                    element.style.transition = '';
                    this.activeAnimations.delete(elementId);
                }
            };
            
            this.activeAnimations.set(elementId, animationData);
        });
    },
    
    /**
     * Fade in element
     * @param {string} elementId - Element ID
     * @param {number} duration - Duration in ms
     */
    fadeIn(elementId, duration = 300) {
        const element = Game.UI.Manager.getElement(elementId);
        if (element) {
            element.style.opacity = '0';
            element.style.display = 'block';
            return this.animate(elementId, { opacity: '1' }, duration);
        }
        return Promise.resolve();
    },
    
    /**
     * Fade out element
     * @param {string} elementId - Element ID
     * @param {number} duration - Duration in ms
     */
    fadeOut(elementId, duration = 300) {
        return this.animate(elementId, { opacity: '0' }, duration).then(() => {
            const element = Game.UI.Manager.getElement(elementId);
            if (element) {
                element.style.display = 'none';
            }
        });
    },
    
    /**
     * Slide in from direction
     * @param {string} elementId - Element ID
     * @param {string} direction - Direction (up, down, left, right)
     * @param {number} duration - Duration in ms
     */
    slideIn(elementId, direction = 'up', duration = 300) {
        const element = Game.UI.Manager.getElement(elementId);
        if (!element) return Promise.resolve();
        
        const transforms = {
            up: 'translateY(20px)',
            down: 'translateY(-20px)',
            left: 'translateX(20px)',
            right: 'translateX(-20px)'
        };
        
        element.style.transform = transforms[direction];
        element.style.opacity = '0';
        element.style.display = 'block';
        
        return this.animate(elementId, {
            transform: 'translateY(0) translateX(0)',
            opacity: '1'
        }, duration);
    },
    
    /**
     * Pulse animation
     * @param {string} elementId - Element ID
     * @param {number} scale - Scale factor
     * @param {number} duration - Duration in ms
     */
    pulse(elementId, scale = 1.1, duration = 200) {
        return this.animate(elementId, { transform: `scale(${scale})` }, duration / 2)
            .then(() => this.animate(elementId, { transform: 'scale(1)' }, duration / 2));
    },
    
    /**
     * Shake animation
     * @param {string} elementId - Element ID
     * @param {number} intensity - Shake intensity in pixels
     * @param {number} duration - Total duration in ms
     */
    shake(elementId, intensity = 5, duration = 300) {
        const element = Game.UI.Manager.getElement(elementId);
        if (!element) return Promise.resolve();
        
        return new Promise((resolve) => {
            const originalTransform = element.style.transform;
            const startTime = Date.now();
            
            const shakeFrame = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / duration;
                
                if (progress >= 1) {
                    element.style.transform = originalTransform;
                    resolve();
                    return;
                }
                
                const x = Math.sin(progress * Math.PI * 8) * intensity * (1 - progress);
                element.style.transform = `${originalTransform} translateX(${x}px)`;
                
                requestAnimationFrame(shakeFrame);
            };
            
            shakeFrame();
        });
    }
};

/**
 * UI Helper Functions
 */
Game.UI.Utils = {
    /**
     * Format number with separators
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        return num.toLocaleString();
    },
    
    /**
     * Format time duration
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    /**
     * Get element bounds relative to game container
     * @param {string} elementId - Element ID
     * @returns {object} Bounds object
     */
    getElementBounds(elementId) {
        const element = Game.UI.Manager.getElement(elementId);
        if (!element) return null;
        
        const rect = element.getBoundingClientRect();
        const container = document.getElementById('gameContainer');
        const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
        
        return {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top,
            width: rect.width,
            height: rect.height
        };
    },
    
    /**
     * Create dynamic CSS rule
     * @param {string} selector - CSS selector
     * @param {object} styles - Style properties
     */
    addCSSRule(selector, styles) {
        const style = document.createElement('style');
        document.head.appendChild(style);
        
        const styleSheet = style.sheet;
        const styleString = Object.entries(styles)
            .map(([prop, value]) => `${prop}: ${value}`)
            .join('; ');
        
        styleSheet.insertRule(`${selector} { ${styleString} }`, 0);
    }
};

/**
 * Initialize UI System
 */
Game.UI.init = function() {
    console.log('🎨 UI system initializing...');
    
    // Initialize main UI manager
    Game.UI.Manager.init();
    
    // Set up global references for backward compatibility
    window.updateUI = () => Game.UI.Manager.markForUpdate();
    window.hideAllScreens = () => Game.UI.Screens.hideAll();
    window.showScreen = (screenId) => Game.UI.Screens.show(screenId);
    
    console.log('✅ UI system initialized');
    return true;
};

// Auto-initialize
Game.UI.init();