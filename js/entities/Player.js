/* ====================================
   PLAYER.JS - Player-Logik und Physik
   ==================================== */

// Player Namespace
Game.Player = Game.Player || {};

/**
 * Player Controller - Hauptsteuerung des Spielers
 */
Game.Player.Controller = {
    /**
     * Update player logic and physics
     */
    update() {
        if (!Game.State.Manager.gameRunning) return;
        
        this.updateMovement();
        this.updatePhysics();
        this.updateInvulnerability();
    },
    
    /**
     * Update horizontal movement
     */
    updateMovement() {
        const player = Game.State.Player;
        const input = Game.Input.Handler.getMovementInput();
        const constants = Game.CONSTANTS;
        
        // Handle horizontal movement
        if (input.left && player.position.x > 0) {
            player.velocity.x = -constants.PLAYER_MOVE_SPEED;
            player.properties.facingDirection = -1;
        } else if (input.right && player.position.x < constants.CANVAS_WIDTH - player.properties.width) {
            player.velocity.x = constants.PLAYER_MOVE_SPEED;
            player.properties.facingDirection = 1;
        } else {
            player.velocity.x = 0;
        }
        
        // Apply horizontal movement
        player.position.x += player.velocity.x;
        player.position.x = Math.max(0, Math.min(
            constants.CANVAS_WIDTH - player.properties.width, 
            player.position.x
        ));
    },
    
    /**
     * Update physics (gravity, jumping)
     */
    updatePhysics() {
        const player = Game.State.Player;
        const constants = Game.CONSTANTS;
        
        // Handle jump hold mechanic
        if (player.flags.isHoldingJump && 
            player.properties.jumpHoldTime < constants.MAX_JUMP_HOLD_TIME && 
            player.velocity.y < 0) {
            
            const holdStrength = 1 - (player.properties.jumpHoldTime / constants.MAX_JUMP_HOLD_TIME);
            player.velocity.y -= 0.3 * holdStrength;
            player.properties.jumpHoldTime++;
        }
        
        // Apply gravity
        const gravity = player.velocity.y < 0 ? constants.LIGHT_GRAVITY : constants.GRAVITY;
        player.velocity.y += gravity;
        
        // Apply vertical movement
        player.position.y += player.velocity.y;
        
        // Ground collision
        if (player.position.y >= constants.GROUND_Y - player.properties.height) {
            player.position.y = constants.GROUND_Y - player.properties.height;
            player.velocity.y = 0;
            player.flags.jumping = false;
            player.flags.grounded = true;
            player.flags.isHoldingJump = false;
            player.properties.jumpHoldTime = 0;
            player.flags.doubleJumpUsed = false;
        }
    },
    
    /**
     * Update invulnerability timers
     */
    updateInvulnerability() {
        const player = Game.State.Player;
        const gameData = Game.State.Manager.getData();
        
        // Update damage resistance
        if (player.properties.damageResistance > 0) {
            player.properties.damageResistance--;
        }
        
        // Update post-damage invulnerability
        if (gameData.postDamageInvulnerability > 0) {
            Game.State.Manager.updateData({
                postDamageInvulnerability: gameData.postDamageInvulnerability - 1
            });
        }
        
        // Update post-buff invulnerability
        if (gameData.postBuffInvulnerability > 0) {
            Game.State.Manager.updateData({
                postBuffInvulnerability: gameData.postBuffInvulnerability - 1
            });
        }
    },
    
    /**
     * Handle player taking damage
     * @param {object} source - Damage source object
     */
    takeDamage(source) {
        if (Game.State.Player.isInvulnerable()) return false;
        
        const gameData = Game.State.Manager.getData();
        const newLives = gameData.lives - 1;
        
        // Create blood particles
        Game.Effects.createBloodParticles(
            Game.State.Player.position.x + Game.State.Player.properties.width / 2,
            Game.State.Player.position.y + Game.State.Player.properties.height / 2
        );
        
        // Set invulnerability
        Game.State.Manager.updateData({
            lives: newLives,
            postDamageInvulnerability: Game.CONSTANTS.POST_DAMAGE_INVULNERABILITY,
            bulletsHit: 0 // Reset bullets hit counter
        });
        
        Game.State.Player.properties.damageResistance = Game.CONSTANTS.DAMAGE_RESISTANCE_TIME;
        
        // Play damage sound
        Game.Sound.Effects.hit();
        
        // Check for game over
        if (newLives <= 0) {
            Game.State.Manager.setState(Game.STATE.GAME_OVER);
        }
        
        return true;
    },
    
    /**
     * Reset player to initial state
     */
    reset() {
        Game.State.Player.reset();
        Game.State.Manager.updateData({
            postBuffInvulnerability: 0,
            postDamageInvulnerability: 0
        });
    }
};

/**
 * Player Animation Controller
 */
Game.Player.Animation = {
    // Animation state
    animationTime: 0,
    lastFrameTime: 0,
    
    /**
     * Update animation timers
     */
    update() {
        const now = Date.now();
        const deltaTime = now - this.lastFrameTime;
        this.animationTime += deltaTime;
        this.lastFrameTime = now;
    },
    
    /**
     * Get animation frame for walking
     * @returns {number} Animation frame
     */
    getWalkFrame() {
        return Math.floor(this.animationTime / 200) % 4; // 200ms per frame, 4 frames
    },
    
    /**
     * Get breathing animation offset
     * @returns {number} Breathing offset
     */
    getBreathingOffset() {
        return Math.sin(this.animationTime * 0.003) * 0.5;
    },
    
    /**
     * Get idle animation offset
     * @returns {number} Idle animation offset
     */
    getIdleOffset() {
        return Math.sin(this.animationTime * 0.002) * 1;
    },
    
    /**
     * Reset animation timers
     */
    reset() {
        this.animationTime = 0;
        this.lastFrameTime = Date.now();
    }
};

/**
 * Player Stats and Progression
 */
Game.Player.Stats = {
    /**
     * Add points to score
     * @param {number} points - Points to add
     * @param {number} x - X position for popup (optional)
     * @param {number} y - Y position for popup (optional)
     */
    addScore(points, x = null, y = null) {
        const gameData = Game.State.Manager.getData();
        const newScore = gameData.score + points;
        
        Game.State.Manager.updateData({ score: newScore });
        
        // Create score popup if position provided
        if (x !== null && y !== null) {
            Game.UI.Manager.createScorePopup(x, y, points);
        }
    },
    
    /**
     * Add bullets
     * @param {number} count - Number of bullets to add
     */
    addBullets(count) {
        const gameData = Game.State.Manager.getData();
        const newBullets = gameData.bullets + count;
        
        Game.State.Manager.updateData({ bullets: newBullets });
        
        // Show notification for significant bullet additions
        if (count >= 5) {
            const theme = Game.Cache.ThemeCache.getTheme();
            const bulletName = theme.labels.bullets.toLowerCase();
            Game.UI.Manager.showNotification(`+${count} ${bulletName}!`, 'success', 2000);
        }
    },
    
    /**
     * Add life
     */
    addLife() {
        const gameData = Game.State.Manager.getData();
        const newLives = gameData.lives + 1;
        const newMaxLives = Math.max(gameData.maxLives, newLives);
        
        Game.State.Manager.updateData({ 
            lives: newLives,
            maxLives: newMaxLives
        });
        
        // Show notification
        Game.UI.Manager.showNotification('Extra Life!', 'success', 2500);
        Game.Sound.Effects.powerUp();
    },
    
    /**
     * Handle successful bullet hit
     */
    onBulletHit() {
        const gameData = Game.State.Manager.getData();
        const newBulletsHit = gameData.bulletsHit + 1;
        
        // Check for life bonus
        const bulletsNeeded = gameData.activeBuffs.extraLife ? 
            Game.CONSTANTS.BUFFED_BULLETS_FOR_LIFE : 
            Game.CONSTANTS.DEFAULT_BULLETS_FOR_LIFE;
        
        if (newBulletsHit >= bulletsNeeded) {
            this.addLife();
            Game.State.Manager.updateData({ bulletsHit: 0 });
        } else {
            Game.State.Manager.updateData({ bulletsHit: newBulletsHit });
        }
    },
    
    /**
     * Handle obstacle avoided
     */
    onObstacleAvoided() {
        const gameData = Game.State.Manager.getData();
        const newObstaclesAvoided = gameData.obstaclesAvoided + 1;
        
        // Add score
        this.addScore(Game.CONSTANTS.POINTS_PER_OBSTACLE_AVOIDED);
        
        // Add bullets every 10 obstacles
        if (newObstaclesAvoided % Game.CONSTANTS.OBSTACLES_FOR_BULLET_BONUS === 0) {
            this.addBullets(Game.CONSTANTS.BULLETS_PER_OBSTACLES_AVOIDED);
        }
        
        // Update level progress
        const newLevelProgress = gameData.levelProgress + 2;
        
        Game.State.Manager.updateData({
            obstaclesAvoided: newObstaclesAvoided,
            levelProgress: newLevelProgress
        });
    }
};

/**
 * Player Abilities System
 */
Game.Player.Abilities = {
    /**
     * Check if player has specific ability
     * @param {string} abilityType - Ability type to check
     * @returns {boolean} Whether player has ability
     */
    hasAbility(abilityType) {
        const gameData = Game.State.Manager.getData();
        return gameData.activeBuffs[abilityType] > 0;
    },
    
    /**
     * Activate ability
     * @param {string} abilityType - Ability type
     * @param {number} level - Ability level (default 1)
     */
    activateAbility(abilityType, level = 1) {
        const gameData = Game.State.Manager.getData();
        const newActiveBuffs = { ...gameData.activeBuffs };
        newActiveBuffs[abilityType] = level;
        
        Game.State.Manager.updateData({ 
            activeBuffs: newActiveBuffs,
            postBuffInvulnerability: Game.CONSTANTS.POST_BUFF_INVULNERABILITY
        });
        
        // Play power-up sound
        Game.Sound.Effects.powerUp();
        
        console.log(`🔥 Activated ability: ${abilityType} (level ${level})`);
    },
    
    /**
     * Get ability description
     * @param {string} abilityType - Ability type
     * @returns {string} Ability description
     */
    getAbilityDescription(abilityType) {
        const descriptions = {
            multiShot: 'Fire 3 projectiles at once',
            extraLife: 'Gain extra life every 10 bullet hits',
            doubleJump: 'Unlock double jump ability'
        };
        return descriptions[abilityType] || 'Unknown ability';
    },
    
    /**
     * Get all active abilities
     * @returns {Array} Array of active ability names
     */
    getActiveAbilities() {
        const gameData = Game.State.Manager.getData();
        return Object.keys(gameData.activeBuffs).filter(buff => 
            gameData.activeBuffs[buff] > 0
        );
    }
};

/**
 * Player Collision System
 */
Game.Player.Collision = {
    /**
     * Check collision with object
     * @param {object} object - Object to check collision with
     * @returns {boolean} Whether collision occurred
     */
    checkCollision(object) {
        const player = Game.State.Player;
        const playerBox = player.getBoundingBox();
        
        return playerBox.x < object.x + object.width &&
               playerBox.x + playerBox.width > object.x &&
               playerBox.y < object.y + object.height &&
               playerBox.y + playerBox.height > object.y;
    },
    
    /**
     * Handle collision with obstacle
     * @param {object} obstacle - Obstacle object
     * @returns {boolean} Whether collision was processed
     */
    handleObstacleCollision(obstacle) {
        if (Game.State.Player.isInvulnerable()) return false;
        
        // Handle collectible obstacles
        if (obstacle.type === 'bulletBox' || obstacle.type === 'boltBox') {
            return this.handleCollectibleCollision(obstacle);
        }
        
        // Handle damage obstacles
        return Game.Player.Controller.takeDamage(obstacle);
    },
    
    /**
     * Handle collision with collectible
     * @param {object} collectible - Collectible object
     * @returns {boolean} Whether collision was processed
     */
    handleCollectibleCollision(collectible) {
        const bulletReward = Game.CONSTANTS.BULLETS_PER_BOX;
        
        // Add bullets
        Game.Player.Stats.addBullets(bulletReward);
        
        // Create pickup popup
        const theme = Game.Cache.ThemeCache.getTheme();
        const label = `+${bulletReward} ${theme.labels.bullets}`;
        Game.UI.Manager.createScorePopup(
            collectible.x + collectible.width / 2,
            collectible.y,
            label
        );
        
        // Play collect sound
        Game.Sound.Effects.collect();
        
        return true;
    }
};

/**
 * Player Debug System
 */
Game.Player.Debug = {
    /**
     * Draw debug information
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawDebugInfo(ctx) {
        if (!Game.DEBUG.ENABLED) return;
        
        const player = Game.State.Player;
        const gameData = Game.State.Manager.getData();
        
        // Draw bounding box
        if (Game.DEBUG.SHOW_COLLISION_BOXES) {
            ctx.strokeStyle = player.isInvulnerable() ? '#ff0000' : '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                player.position.x,
                player.position.y,
                player.properties.width,
                player.properties.height
            );
        }
        
        // Draw debug text
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.fillText(`Pos: ${Math.round(player.position.x)}, ${Math.round(player.position.y)}`, 10, 20);
        ctx.fillText(`Vel: ${Math.round(player.velocity.x)}, ${Math.round(player.velocity.y)}`, 10, 35);
        ctx.fillText(`Grounded: ${player.flags.grounded}`, 10, 50);
        ctx.fillText(`Invuln: ${player.isInvulnerable()}`, 10, 65);
        ctx.fillText(`Buffs: ${Object.keys(gameData.activeBuffs).length}`, 10, 80);
    },
    
    /**
     * Log player state
     */
    logState() {
        if (!Game.DEBUG.ENABLED) return;
        
        const player = Game.State.Player;
        const gameData = Game.State.Manager.getData();
        
        console.log('Player State:', {
            position: player.position,
            velocity: player.velocity,
            flags: player.flags,
            lives: gameData.lives,
            score: gameData.score,
            activeBuffs: gameData.activeBuffs
        });
    }
};

/**
 * Initialize Player System
 */
Game.Player.init = function() {
    console.log('🏃 Player system initializing...');
    
    // Reset animation timer
    Game.Player.Animation.reset();
    
    // Set up global references for backward compatibility
    window.player = Game.State.Player;
    
    console.log('✅ Player system initialized');
    return true;
};

// Auto-initialize
Game.Player.init();