/* ====================================
   RENDERER.JS - Haupt-Rendering-System
   ==================================== */

// Rendering Namespace
Game.Rendering = Game.Rendering || {};

/**
 * Main Renderer - Zentrale Rendering-Koordination
 */
Game.Rendering.Renderer = {
    // Canvas and context
    canvas: null,
    ctx: null,
    
    // Rendering state
    isInitialized: false,
    needsRedraw: true,
    lastRenderTime: 0,
    frameCount: 0,
    fps: 0,
    
    // Performance settings
    renderThrottle: 16, // ~60fps
    skipFrames: 0,
    maxSkipFrames: 2,
    
    // Camera system (for future scrolling)
    camera: {
        x: 0,
        y: 0,
        shake: { x: 0, y: 0, intensity: 0, duration: 0 }
    },
    
    /**
     * Initialize renderer
     */
    init() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('❌ Game canvas not found');
            return false;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('❌ Canvas context not available');
            return false;
        }
        
        // Set canvas properties
        this.canvas.width = Game.CONSTANTS.CANVAS_WIDTH;
        this.canvas.height = Game.CONSTANTS.CANVAS_HEIGHT;
        
        // Enable image smoothing for better quality
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        this.isInitialized = true;
        console.log('🎨 Main renderer initialized');
        return true;
    },
    
    /**
     * Main render function
     */
    render() {
        if (!this.isInitialized) return;
        
        const now = Date.now();
        
        // Throttle rendering for performance
        if (now - this.lastRenderTime < this.renderThrottle) {
            if (this.skipFrames < this.maxSkipFrames) {
                this.skipFrames++;
                return;
            }
        }
        
        // Update FPS counter
        this.updateFPS(now);
        
        // Only render if needed or if we're playing
        if (!this.needsRedraw && Game.State.Manager.getState() !== Game.STATE.PLAYING) {
            return;
        }
        
        // Clear canvas
        this.clearCanvas();
        
        // Apply camera transformations
        this.applyCamera();
        
        // Render game elements in order
        this.renderBackground();
        this.renderEnvironment();
        this.renderGameObjects();
        this.renderEffects();
        this.renderUI();
        
        // Reset camera transformations
        this.resetCamera();
        
        // Debug rendering
        if (Game.DEBUG.ENABLED) {
            this.renderDebugInfo();
        }
        
        this.lastRenderTime = now;
        this.skipFrames = 0;
        this.needsRedraw = false;
        this.frameCount++;
    },
    
    /**
     * Clear the entire canvas
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    
    /**
     * Apply camera transformations
     */
    applyCamera() {
        this.ctx.save();
        
        // Apply camera shake
        if (this.camera.shake.duration > 0) {
            this.updateCameraShake();
            this.ctx.translate(this.camera.shake.x, this.camera.shake.y);
        }
        
        // Apply camera position (for future scrolling)
        this.ctx.translate(-this.camera.x, -this.camera.y);
    },
    
    /**
     * Reset camera transformations
     */
    resetCamera() {
        this.ctx.restore();
    },
    
    /**
     * Update camera shake effect
     */
    updateCameraShake() {
        if (this.camera.shake.duration <= 0) return;
        
        const intensity = this.camera.shake.intensity * (this.camera.shake.duration / 10);
        this.camera.shake.x = (Math.random() - 0.5) * intensity;
        this.camera.shake.y = (Math.random() - 0.5) * intensity;
        this.camera.shake.duration--;
    },
    
    /**
  /**
     * Render background elements
     */
    renderBackground() {
        const theme = Game.Cache.ThemeCache.getTheme();
        
        // FIXED: Die Farben sind direkt im theme Objekt, nicht unter colors
        const groundColor = theme.groundColor || '#A17F53';
        const floorDetailColor = theme.floorDetailColor || '#D2B48C';
        
        // Draw ground
        this.ctx.fillStyle = groundColor;
        this.ctx.fillRect(0, Game.CONSTANTS.GROUND_Y, this.canvas.width, this.canvas.height - Game.CONSTANTS.GROUND_Y);
        
        // Draw floor details
        this.ctx.fillStyle = floorDetailColor;
        for (let x = 0; x < this.canvas.width; x += 25) {
            if (theme.id === 'cowboy') {
                this.ctx.fillRect(x, Game.CONSTANTS.GROUND_Y + 12, 12, 3);
                this.ctx.fillRect(x + 6, Game.CONSTANTS.GROUND_Y + 25, 10, 2);
            } else {
                this.ctx.fillRect(x, Game.CONSTANTS.GROUND_Y + 10, 30, 3);
                this.ctx.fillRect(x + 6, Game.CONSTANTS.GROUND_Y + 25, 25, 2);
            }
        }
    },
    /**
     * Render environment elements
     */
    renderEnvironment() {
        const elements = Game.State.Objects.getObjects('environmentElements');
        elements.forEach(element => {
            Game.Rendering.EffectRenderer.drawEnvironmentElement(element);
        });
    },
    
    /**
     * Render all game objects
     */
    renderGameObjects() {
        // Render player
        const player = Game.State.Player;
        const gameData = Game.State.Manager.getData();
        const isDead = gameData.lives <= 0;
        
        Game.Rendering.PlayerRenderer.draw(
            player.position.x,
            player.position.y,
            player.properties.facingDirection === -1,
            isDead
        );
        
        // Render obstacles
        const obstacles = Game.State.Objects.getObjects('obstacles');
        obstacles.forEach(obstacle => {
            Game.Rendering.ObstacleRenderer.draw(obstacle);
            
            // Render health bars for multi-hit enemies
            if (Game.Obstacles.Health.shouldShowHealthBar(obstacle)) {
                this.renderHealthBar(obstacle);
            }
        });
        
        // Render bullets
        const bullets = Game.State.Objects.getObjects('bullets');
        bullets.forEach(bullet => {
            Game.Rendering.EffectRenderer.drawBullet(bullet);
        });
    },
    
    /**
     * Render all effects
     */
    renderEffects() {
        // Render explosions
        const explosions = Game.State.Objects.getObjects('explosions');
        explosions.forEach(explosion => {
            Game.Rendering.EffectRenderer.drawExplosion(explosion);
        });
        
        // Render blood particles
        const bloodParticles = Game.State.Objects.getObjects('bloodParticles');
        bloodParticles.forEach(particle => {
            Game.Rendering.EffectRenderer.drawBloodParticle(particle);
        });
        
        // Render lightning effects
        const lightningEffects = Game.State.Objects.getObjects('lightningEffects');
        lightningEffects.forEach(effect => {
            Game.Rendering.EffectRenderer.drawLightningEffect(effect);
        });
        
        // Render score popups
        const scorePopups = Game.State.Objects.getObjects('scorePopups');
        scorePopups.forEach(popup => {
            Game.Rendering.EffectRenderer.drawScorePopup(popup);
        });
        
        // Render double jump particles
        const doubleJumpParticles = Game.State.Objects.getObjects('doubleJumpParticles');
        doubleJumpParticles.forEach(particle => {
            Game.Rendering.EffectRenderer.drawDoubleJumpParticle(particle);
        });
    },
    
    /**
     * Render UI elements (currently minimal, most UI is HTML)
     */
    renderUI() {
        // Render any canvas-based UI elements here
        // Most UI is handled by HTML/CSS for better performance
    },
    
    /**
     * Render health bar for obstacle
     * @param {object} obstacle - Obstacle with health
     */
    renderHealthBar(obstacle) {
        const barWidth = obstacle.width;
        const barHeight = 4;
        const healthPercent = Game.Obstacles.Health.getHealthPercentage(obstacle);
        
        // Background
        this.ctx.fillStyle = '#8B0000';
        this.ctx.fillRect(obstacle.x, obstacle.y - 8, barWidth, barHeight);
        
        // Health bar
        const healthColor = obstacle.isBoss ? '#FFFF00' : '#00FF00';
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(obstacle.x, obstacle.y - 8, barWidth * healthPercent, barHeight);
        
        // Border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(obstacle.x, obstacle.y - 8, barWidth, barHeight);
    },
    
    /**
     * Update FPS counter
     * @param {number} now - Current timestamp
     */
    updateFPS(now) {
        if (now - this.lastRenderTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
        }
    },
    
    /**
     * Render debug information
     */
    renderDebugInfo() {
        if (!Game.DEBUG.ENABLED) return;
        
        const ctx = this.ctx;
        
        // Debug text background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 120);
        
        // Debug text
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        
        const gameData = Game.State.Manager.getData();
        const debugInfo = [
            `FPS: ${this.fps}`,
            `State: ${Game.State.Manager.getState()}`,
            `Obstacles: ${Game.State.Objects.getObjectCount('obstacles')}`,
            `Bullets: ${Game.State.Objects.getObjectCount('bullets')}`,
            `Effects: ${Game.State.Objects.getObjectCount('explosions')}`,
            `Score: ${gameData.score}`,
            `Level: ${gameData.level}`,
            `Speed: ${gameData.gameSpeed?.toFixed(1) || 'N/A'}`
        ];
        
        debugInfo.forEach((info, index) => {
            ctx.fillText(info, 15, 25 + index * 12);
        });
        
        // Render collision boxes if enabled
        if (Game.DEBUG.SHOW_COLLISION_BOXES) {
            this.renderCollisionBoxes();
        }
    },
    
    /**
     * Render collision boxes for debugging
     */
    renderCollisionBoxes() {
        const ctx = this.ctx;
        
        // Player collision box
        const player = Game.State.Player;
        ctx.strokeStyle = player.isInvulnerable() ? '#ff0000' : '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            player.position.x,
            player.position.y,
            player.properties.width,
            player.properties.height
        );
        
        // Obstacle collision boxes
        const obstacles = Game.State.Objects.getObjects('obstacles');
        obstacles.forEach(obstacle => {
            ctx.strokeStyle = obstacle.isCollectible ? '#0000ff' : '#ffff00';
            ctx.lineWidth = 1;
            ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // Bullet collision boxes
        const bullets = Game.State.Objects.getObjects('bullets');
        bullets.forEach(bullet => {
            ctx.strokeStyle = bullet.enhanced ? '#ff00ff' : '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(bullet.x, bullet.y, 8, 4);
        });
    },
    
    /**
     * Start camera shake effect
     * @param {number} intensity - Shake intensity
     * @param {number} duration - Shake duration in frames
     */
    startCameraShake(intensity = 5, duration = 10) {
        this.camera.shake.intensity = intensity;
        this.camera.shake.duration = duration;
        this.needsRedraw = true;
    },
    
    /**
     * Set camera position (for future scrolling)
     * @param {number} x - Camera X position
     * @param {number} y - Camera Y position
     */
    setCameraPosition(x, y) {
        this.camera.x = x;
        this.camera.y = y;
        this.needsRedraw = true;
    },
    
    /**
     * Mark renderer for redraw
     */
    markForRedraw() {
        this.needsRedraw = true;
    },
    
    /**
     * Get rendering statistics
     * @returns {object} Rendering stats
     */
    getStats() {
        return {
            fps: this.fps,
            frameCount: this.frameCount,
            isInitialized: this.isInitialized,
            needsRedraw: this.needsRedraw,
            canvasSize: {
                width: this.canvas?.width || 0,
                height: this.canvas?.height || 0
            }
        };
    },
    
    /**
     * Cleanup renderer
     */
    cleanup() {
        this.isInitialized = false;
        this.canvas = null;
        this.ctx = null;
    }
};

/**
 * Utility functions for rendering
 */
Game.Rendering.Utils = {
    /**
     * Draw text with outline
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Text to draw
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} fillColor - Fill color
     * @param {string} strokeColor - Stroke color
     * @param {number} strokeWidth - Stroke width
     */
    drawTextWithOutline(ctx, text, x, y, fillColor = '#ffffff', strokeColor = '#000000', strokeWidth = 2) {
        ctx.save();
        
        // Draw outline
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.strokeText(text, x, y);
        
        // Draw fill
        ctx.fillStyle = fillColor;
        ctx.fillText(text, x, y);
        
        ctx.restore();
    },
    
    /**
     * Draw rounded rectangle
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {number} radius - Corner radius
     */
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    },
    
    /**
     * Draw gradient rectangle
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {string} startColor - Start color
     * @param {string} endColor - End color
     * @param {boolean} vertical - Vertical gradient
     */
    drawGradientRect(ctx, x, y, width, height, startColor, endColor, vertical = false) {
        const gradient = vertical ? 
            ctx.createLinearGradient(x, y, x, y + height) :
            ctx.createLinearGradient(x, y, x + width, y);
        
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, endColor);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
    },
    
    /**
     * Apply glow effect to drawing function
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} color - Glow color
     * @param {number} blur - Blur amount
     * @param {function} drawFunction - Function to draw with glow
     */
    withGlow(ctx, color, blur, drawFunction) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = blur;
        drawFunction(ctx);
        ctx.restore();
    }
};

/**
 * Initialize Rendering System
 */
Game.Rendering.init = function() {
    console.log('🎨 Rendering system initializing...');
    
    // Initialize main renderer
    const success = Game.Rendering.Renderer.init();
    
    if (success) {
        console.log('✅ Rendering system initialized');
        
        // Set up global references for backward compatibility
        window.render = () => Game.Rendering.Renderer.render();
        window.needsRedraw = true;
        
        return true;
    } else {
        console.error('❌ Failed to initialize rendering system');
        return false;
    }
};

// Auto-initialize
Game.Rendering.init();