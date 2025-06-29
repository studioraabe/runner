/* ====================================
   BULLET.JS - Projektil-System
   ==================================== */

// Bullet Namespace
Game.Bullets = Game.Bullets || {};

/**
 * Bullet Manager - Verwaltet alle Projektile
 */
Game.Bullets.Manager = {
    /**
     * Update all bullets
     */
    update() {
        if (!Game.State.Manager.gameRunning) return;
        
        this.updateBulletMovement();
        this.checkBulletCollisions();
        this.cleanupBullets();
    },
    
    /**
     * Update bullet movement and physics
     */
    updateBulletMovement() {
        const bullets = Game.State.Objects.getObjects('bullets');
        
        bullets.forEach(bullet => {
            bullet.x += bullet.speed;
            
            // Update bullet animation/effects
            this.updateBulletEffects(bullet);
        });
    },
    
    /**
     * Update bullet visual effects
     * @param {object} bullet - Bullet to update
     */
    updateBulletEffects(bullet) {
        const theme = Game.Cache.ThemeCache.getTheme();
        
        if (theme.id === 'Dungeon') {
            // Shadow energy bullets - add glow animation
            bullet.glowPhase = (bullet.glowPhase || 0) + 0.02;
            bullet.glowIntensity = 0.4 + Math.sin(bullet.glowPhase) * 0.2;
        }
        
        // Enhanced bullets get special effects
        if (bullet.enhanced) {
            bullet.trailPhase = (bullet.trailPhase || 0) + 0.03;
        }
    },
    
    /**
     * Check collisions between bullets and obstacles
     */
    checkBulletCollisions() {
        Game.Obstacles.Collision.checkBulletCollisions();
    },
    
    /**
     * Remove off-screen bullets
     */
    cleanupBullets() {
        const bullets = Game.State.Objects.getObjects('bullets');
        const canvasWidth = Game.CONSTANTS.CANVAS_WIDTH;
        
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            
            // Remove bullets that are off-screen
            if (bullet.x > canvasWidth + 50 || bullet.x < -50) {
                Game.State.Objects.removeObject('bullets', i);
            }
        }
    },
    
    /**
     * Fire bullet from player
     * @param {object} config - Bullet configuration
     */
    fireBullet(config = {}) {
        const player = Game.State.Player;
        const gameData = Game.State.Manager.getData();
        
        if (gameData.bullets <= 0) return false;
        
        const defaultConfig = {
            enhanced: gameData.activeBuffs.multiShot > 0 && gameData.bullets >= 3,
            count: 1,
            spread: 0
        };
        
        const bulletConfig = { ...defaultConfig, ...config };
        
        // Determine actual bullet count
        const actualCount = bulletConfig.enhanced ? 3 : bulletConfig.count;
        
        if (gameData.bullets < actualCount) return false;
        
        // Create bullets
        for (let i = 0; i < actualCount; i++) {
            const bullet = this.createBullet({
                x: player.properties.facingDirection === 1 ? 
                   player.position.x + player.properties.width : 
                   player.position.x,
                y: player.position.y + player.properties.height / 1.5 + (actualCount > 1 ? (i - 1) * 8 : 0),
                direction: player.properties.facingDirection,
                enhanced: bulletConfig.enhanced,
                spread: bulletConfig.spread
            });
            
            Game.State.Objects.addObject('bullets', bullet);
        }
        
        // Update bullet count
        Game.State.Manager.updateData({
            bullets: gameData.bullets - actualCount
        });
        
        // Play shoot sound
        Game.Sound.Effects.shoot();
        
        return true;
    },
    
    /**
     * Create bullet object
     * @param {object} config - Bullet configuration
     * @returns {object} Created bullet
     */
    createBullet(config) {
        const speed = Game.CONSTANTS.BULLET_SPEED * config.direction;
        const spreadAngle = config.spread || 0;
        
        return {
            x: config.x,
            y: config.y,
            speed: speed,
            direction: config.direction,
            enhanced: config.enhanced || false,
            spreadAngle: spreadAngle,
            creationTime: Date.now(),
            glowPhase: Math.random() * Math.PI * 2,
            trailPhase: Math.random() * Math.PI * 2
        };
    },
    
    /**
     * Get bullets within area
     * @param {number} x - Area X
     * @param {number} y - Area Y
     * @param {number} width - Area width
     * @param {number} height - Area height
     * @returns {Array} Bullets in area
     */
    getBulletsInArea(x, y, width, height) {
        const bullets = Game.State.Objects.getObjects('bullets');
        
        return bullets.filter(bullet => 
            bullet.x >= x && bullet.x <= x + width &&
            bullet.y >= y && bullet.y <= y + height
        );
    },
    
    /**
     * Clear all bullets
     */
    clearAll() {
        Game.State.Objects.bullets.length = 0;
    }
};

/**
 * Bullet Types System
 */
Game.Bullets.Types = {
    /**
     * Create normal bullet
     * @param {object} config - Configuration
     * @returns {object} Bullet object
     */
    createNormal(config) {
        return {
            ...Game.Bullets.Manager.createBullet(config),
            type: 'normal',
            damage: 1,
            piercing: false
        };
    },
    
    /**
     * Create enhanced bullet (multi-shot)
     * @param {object} config - Configuration
     * @returns {object} Bullet object
     */
    createEnhanced(config) {
        return {
            ...Game.Bullets.Manager.createBullet(config),
            type: 'enhanced',
            damage: 2,
            piercing: false,
            enhanced: true
        };
    },
    
    /**
     * Create special ability bullets
     * @param {string} abilityType - Type of ability
     * @param {object} config - Configuration
     * @returns {Array} Array of bullets
     */
    createAbilityBullets(abilityType, config) {
        const theme = Game.Cache.ThemeCache.getTheme();
        
        switch (abilityType) {
            case 'multiShot':
                return this.createMultiShot(config);
                
            case 'chainLightning':
                return this.createChainLightning(config);
                
            default:
                return [this.createNormal(config)];
        }
    },
    
    /**
     * Create multi-shot bullets (cowboy theme)
     * @param {object} config - Configuration
     * @returns {Array} Array of bullets
     */
    createMultiShot(config) {
        const bullets = [];
        
        for (let i = 0; i < 3; i++) {
            const bullet = this.createEnhanced({
                ...config,
                y: config.y + (i - 1) * 8
            });
            bullet.multiShotIndex = i;
            bullets.push(bullet);
        }
        
        return bullets;
    },
    
    /**
     * Create chain lightning (dungeon theme)
     * @param {object} config - Configuration
     * @returns {Array} Array of bullets
     */
    createChainLightning(config) {
        const bullets = [];
        
        for (let i = 0; i < 3; i++) {
            const bullet = this.createEnhanced({
                ...config,
                y: config.y + (i - 1) * 8
            });
            bullet.type = 'chainLightning';
            bullet.chainIndex = i;
            bullet.arcIntensity = 0.5 + Math.random() * 0.5;
            bullets.push(bullet);
        }
        
        return bullets;
    }
};

/**
 * Bullet Effects System
 */
Game.Bullets.Effects = {
    /**
     * Create bullet trail effect
     * @param {object} bullet - Bullet object
     */
    createTrail(bullet) {
        if (!bullet.enhanced) return;
        
        const theme = Game.Cache.ThemeCache.getTheme();
        
        if (theme.id === 'Dungeon') {
            // Lightning trail
            this.createLightningTrail(bullet);
        } else {
            // Fire trail
            this.createFireTrail(bullet);
        }
    },
    
    /**
     * Create lightning trail for dungeon bullets
     * @param {object} bullet - Bullet object
     */
    createLightningTrail(bullet) {
        const trailLength = 3;
        
        for (let i = 0; i < trailLength; i++) {
            const particle = {
                x: bullet.x - (i * 8),
                y: bullet.y + Math.sin(bullet.glowPhase + i * 0.5) * 2,
                life: 10 - i * 2,
                maxLife: 10,
                intensity: 1 - (i / trailLength)
            };
            
            Game.State.Objects.addObject('lightningEffects', particle);
        }
    },
    
    /**
     * Create fire trail for cowboy bullets
     * @param {object} bullet - Bullet object
     */
    createFireTrail(bullet) {
        const trailLength = 2;
        
        for (let i = 0; i < trailLength; i++) {
            const particle = {
                x: bullet.x - (i * 6) + Math.random() * 4 - 2,
                y: bullet.y + Math.random() * 4 - 2,
                velocityX: Math.random() * 2 - 1,
                velocityY: Math.random() * 2 - 1,
                life: 15 - i * 3,
                maxLife: 15,
                size: 2 + Math.random() * 2
            };
            
            Game.State.Objects.addObject('explosions', particle);
        }
    },
    
    /**
     * Create bullet impact effect
     * @param {object} bullet - Bullet that hit
     * @param {object} target - Target that was hit
     */
    createImpactEffect(bullet, target) {
        const theme = Game.Cache.ThemeCache.getTheme();
        
        if (theme.id === 'Dungeon') {
            // Lightning impact
            Game.Effects.createLightningEffect(
                target.x + target.width / 2,
                target.y + target.height / 2
            );
            
            if (bullet.type === 'chainLightning') {
                this.createChainLightningEffect(bullet, target);
            }
        } else {
            // Explosion impact
            Game.Effects.createExplosion(
                target.x + target.width / 2,
                target.y + target.height / 2
            );
        }
    },
    
    /**
     * Create chain lightning effect
     * @param {object} bullet - Chain lightning bullet
     * @param {object} target - Primary target
     */
    createChainLightningEffect(bullet, target) {
        const obstacles = Game.State.Objects.getObjects('obstacles');
        const chainRange = 100;
        const maxChains = 2;
        
        let chainTargets = obstacles.filter(obstacle => {
            if (obstacle === target || obstacle.isCollectible) return false;
            
            const distance = Math.sqrt(
                Math.pow(obstacle.x - target.x, 2) + 
                Math.pow(obstacle.y - target.y, 2)
            );
            
            return distance <= chainRange;
        }).slice(0, maxChains);
        
        // Create chain effects to nearby enemies
        chainTargets.forEach(chainTarget => {
            const chainEffect = {
                startX: target.x + target.width / 2,
                startY: target.y + target.height / 2,
                endX: chainTarget.x + chainTarget.width / 2,
                endY: chainTarget.y + chainTarget.height / 2,
                life: 20,
                maxLife: 20,
                intensity: bullet.arcIntensity
            };
            
            Game.State.Objects.addObject('lightningEffects', chainEffect);
            
            // Deal reduced damage to chained targets
            chainTarget.health -= Math.max(1, Math.floor(bullet.damage / 2));
        });
    }
};

/**
 * Bullet Pool System - For performance optimization
 */
Game.Bullets.Pool = {
    availableBullets: [],
    maxPoolSize: 50,
    
    /**
     * Get bullet from pool or create new one
     * @param {object} config - Bullet configuration
     * @returns {object} Bullet object
     */
    getBullet(config) {
        let bullet;
        
        if (this.availableBullets.length > 0) {
            bullet = this.availableBullets.pop();
            // Reset bullet properties
            Object.assign(bullet, Game.Bullets.Manager.createBullet(config));
        } else {
            bullet = Game.Bullets.Manager.createBullet(config);
        }
        
        return bullet;
    },
    
    /**
     * Return bullet to pool
     * @param {object} bullet - Bullet to return
     */
    returnBullet(bullet) {
        if (this.availableBullets.length < this.maxPoolSize) {
            // Clean bullet properties
            Object.keys(bullet).forEach(key => {
                if (typeof bullet[key] !== 'function') {
                    delete bullet[key];
                }
            });
            
            this.availableBullets.push(bullet);
        }
    },
    
    /**
     * Clear pool
     */
    clearPool() {
        this.availableBullets.length = 0;
    }
};

/**
 * Bullet Physics System
 */
Game.Bullets.Physics = {
    /**
     * Apply physics to bullet
     * @param {object} bullet - Bullet to update
     */
    applyPhysics(bullet) {
        // Apply spread angle if present
        if (bullet.spreadAngle !== 0) {
            const baseSpeed = Math.abs(bullet.speed);
            bullet.speed = Math.cos(bullet.spreadAngle) * baseSpeed * bullet.direction;
            bullet.verticalSpeed = Math.sin(bullet.spreadAngle) * baseSpeed;
            bullet.y += bullet.verticalSpeed || 0;
        }
        
        // Apply gravity for special bullet types
        if (bullet.type === 'arc') {
            bullet.verticalSpeed = (bullet.verticalSpeed || 0) + 0.3;
            bullet.y += bullet.verticalSpeed;
        }
    },
    
    /**
     * Check if bullet should be affected by gravity
     * @param {object} bullet - Bullet to check
     * @returns {boolean} Whether bullet is affected by gravity
     */
    hasGravity(bullet) {
        return bullet.type === 'arc' || bullet.hasGravity === true;
    }
};

/**
 * Initialize Bullet System
 */
Game.Bullets.init = function() {
    console.log('💫 Bullet system initializing...');
    
    // Set up global references for backward compatibility
    window.bulletsFired = Game.State.Objects.bullets;
    window.shoot = () => Game.Bullets.Manager.fireBullet();
    
    console.log('✅ Bullet system initialized');
    return true;
};

// Auto-initialize
Game.Bullets.init();