/* ====================================
   COLLISIONSYSTEM.JS - Kollisionserkennung
   ==================================== */

// Stelle sicher, dass Game.Logic existiert
window.Game = window.Game || {};
Game.Logic = Game.Logic || {};

// Collision System Namespace
Game.Logic.CollisionSystem = {
    // Collision statistics
    stats: {
        playerCollisions: 0,
        bulletCollisions: 0,
        totalChecks: 0,
        skippedChecks: 0
    },
    
    // Performance optimization
    spatialGrid: null,
    gridSize: 64,
    
    /**
     * Initialize collision system
     */
    init() {
        console.log('💥 Collision system initializing...');
        this.initSpatialGrid();
        console.log('✅ Collision system initialized');
    },
    
    /**
     * Initialize spatial partitioning grid for optimization
     */
    initSpatialGrid() {
        const gridWidth = Math.ceil(Game.CONSTANTS.CANVAS_WIDTH / this.gridSize);
        const gridHeight = Math.ceil(Game.CONSTANTS.CANVAS_HEIGHT / this.gridSize);
        
        this.spatialGrid = {
            width: gridWidth,
            height: gridHeight,
            cells: new Array(gridWidth * gridHeight).fill(null).map(() => [])
        };
    },
    
    /**
     * Main collision update
     */
    update() {
        if (!Game.State.Manager.gameRunning) return;
        
        // Clear spatial grid
        this.clearSpatialGrid();
        
        // Populate spatial grid with obstacles
        this.populateSpatialGrid();
        
        // Check all collision types
        this.checkPlayerCollisions();
        this.checkBulletCollisions();
        this.checkEnvironmentCollisions();
    },
    
    /**
     * Clear spatial grid
     */
    clearSpatialGrid() {
        for (const cell of this.spatialGrid.cells) {
            cell.length = 0;
        }
    },
    
    /**
     * Populate spatial grid with obstacles
     */
    populateSpatialGrid() {
        const obstacles = Game.State.Objects.getObjects('obstacles');
        
        obstacles.forEach((obstacle, index) => {
            const cells = this.getObjectCells(obstacle);
            cells.forEach(cellIndex => {
                if (cellIndex >= 0 && cellIndex < this.spatialGrid.cells.length) {
                    this.spatialGrid.cells[cellIndex].push({ obstacle, index });
                }
            });
        });
    },
    
    /**
     * Get spatial grid cells that an object occupies
     * @param {object} obj - Object with x, y, width, height
     * @returns {Array} Array of cell indices
     */
    getObjectCells(obj) {
        const cells = [];
        const minX = Math.floor(obj.x / this.gridSize);
        const maxX = Math.floor((obj.x + obj.width) / this.gridSize);
        const minY = Math.floor(obj.y / this.gridSize);
        const maxY = Math.floor((obj.y + obj.height) / this.gridSize);
        
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (x >= 0 && x < this.spatialGrid.width && 
                    y >= 0 && y < this.spatialGrid.height) {
                    cells.push(y * this.spatialGrid.width + x);
                }
            }
        }
        
        return cells;
    },
    
    /**
     * Check collisions between player and obstacles
     */
    checkPlayerCollisions() {
        if (Game.State.Player.isInvulnerable()) {
            this.stats.skippedChecks++;
            return;
        }
        
        const player = Game.State.Player;
        const playerCells = this.getObjectCells({
            x: player.position.x,
            y: player.position.y,
            width: player.properties.width,
            height: player.properties.height
        });
        
        // Get nearby obstacles from spatial grid
        const nearbyObstacles = new Set();
        playerCells.forEach(cellIndex => {
            if (cellIndex < this.spatialGrid.cells.length) {
                this.spatialGrid.cells[cellIndex].forEach(entry => {
                    nearbyObstacles.add(entry);
                });
            }
        });
        
        // Check collisions with nearby obstacles only
        for (const entry of nearbyObstacles) {
            this.stats.totalChecks++;
            
            if (this.checkAABBCollision(
                player.position.x, player.position.y, player.properties.width, player.properties.height,
                entry.obstacle.x, entry.obstacle.y, entry.obstacle.width, entry.obstacle.height
            )) {
                if (this.handlePlayerObstacleCollision(entry.obstacle, entry.index)) {
                    this.stats.playerCollisions++;
                    break; // Only handle one collision per frame
                }
            }
        }
    },
    
    /**
     * Check collisions between bullets and obstacles
     */
    checkBulletCollisions() {
        const bullets = Game.State.Objects.getObjects('bullets');
        
        bullets.forEach((bullet, bulletIndex) => {
            // Get cells that bullet occupies
            const bulletCells = this.getObjectCells({
                x: bullet.x,
                y: bullet.y,
                width: 8,
                height: 4
            });
            
            // Get nearby obstacles
            const nearbyObstacles = new Set();
            bulletCells.forEach(cellIndex => {
                if (cellIndex < this.spatialGrid.cells.length) {
                    this.spatialGrid.cells[cellIndex].forEach(entry => {
                        nearbyObstacles.add(entry);
                    });
                }
            });
            
            // Check collisions
            for (const entry of nearbyObstacles) {
                this.stats.totalChecks++;
                
                // Skip collectibles for bullet collisions
                if (entry.obstacle.isCollectible) continue;
                
                if (this.checkAABBCollision(
                    bullet.x, bullet.y, 8, 4,
                    entry.obstacle.x, entry.obstacle.y, entry.obstacle.width, entry.obstacle.height
                )) {
                    if (this.handleBulletObstacleCollision(bullet, bulletIndex, entry.obstacle, entry.index)) {
                        this.stats.bulletCollisions++;
                        return; // Bullet destroyed, stop checking
                    }
                }
            }
        });
    },
    
    /**
     * Check environment collisions (ground, boundaries)
     */
    checkEnvironmentCollisions() {
        const player = Game.State.Player;
        
        // Ground collision (handled in player physics)
        // Left/right boundary collision
        if (player.position.x < 0) {
            player.position.x = 0;
            player.velocity.x = 0;
        } else if (player.position.x + player.properties.width > Game.CONSTANTS.CANVAS_WIDTH) {
            player.position.x = Game.CONSTANTS.CANVAS_WIDTH - player.properties.width;
            player.velocity.x = 0;
        }
        
        // Top boundary collision
        if (player.position.y < 0) {
            player.position.y = 0;
            player.velocity.y = Math.max(0, player.velocity.y);
        }
    },
    
    /**
     * Basic AABB collision detection
     * @param {number} x1 - Object 1 X
     * @param {number} y1 - Object 1 Y
     * @param {number} w1 - Object 1 width
     * @param {number} h1 - Object 1 height
     * @param {number} x2 - Object 2 X
     * @param {number} y2 - Object 2 Y
     * @param {number} w2 - Object 2 width
     * @param {number} h2 - Object 2 height
     * @returns {boolean} Whether objects collide
     */
    checkAABBCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 &&
               x1 + w1 > x2 &&
               y1 < y2 + h2 &&
               y1 + h1 > y2;
    },
    
    /**
     * Circular collision detection
     * @param {number} x1 - Circle 1 center X
     * @param {number} y1 - Circle 1 center Y
     * @param {number} r1 - Circle 1 radius
     * @param {number} x2 - Circle 2 center X
     * @param {number} y2 - Circle 2 center Y
     * @param {number} r2 - Circle 2 radius
     * @returns {boolean} Whether circles collide
     */
    checkCircularCollision(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (r1 + r2);
    },
    
    /**
     * Advanced collision detection with collision response
     * @param {object} obj1 - First object
     * @param {object} obj2 - Second object
     * @returns {object|null} Collision data or null
     */
    checkAdvancedCollision(obj1, obj2) {
        // Calculate overlap
        const overlapX = Math.min(obj1.x + obj1.width, obj2.x + obj2.width) - Math.max(obj1.x, obj2.x);
        const overlapY = Math.min(obj1.y + obj1.height, obj2.y + obj2.height) - Math.max(obj1.y, obj2.y);
        
        if (overlapX > 0 && overlapY > 0) {
            return {
                overlapX: overlapX,
                overlapY: overlapY,
                direction: overlapX < overlapY ? 'horizontal' : 'vertical',
                centerDistance: Math.sqrt(
                    Math.pow((obj1.x + obj1.width/2) - (obj2.x + obj2.width/2), 2) +
                    Math.pow((obj1.y + obj1.height/2) - (obj2.y + obj2.height/2), 2)
                )
            };
        }
        
        return null;
    },
    
    /**
     * Handle collision between player and obstacle
     * @param {object} obstacle - Obstacle that collided
     * @param {number} obstacleIndex - Obstacle index in array
     * @returns {boolean} Whether collision was handled
     */
    handlePlayerObstacleCollision(obstacle, obstacleIndex) {
        if (Game.State.Player.isInvulnerable()) return false;
        
        // Handle collectible obstacles
        if (obstacle.isCollectible) {
            return this.handlePlayerCollectibleCollision(obstacle, obstacleIndex);
        }
        
        // Handle damage obstacles
        return this.handlePlayerDamageCollision(obstacle, obstacleIndex);
    },
    
    /**
     * Handle collision between player and collectible
     * @param {object} collectible - Collectible obstacle
     * @param {number} collectibleIndex - Collectible index
     * @returns {boolean} Whether collision was handled
     */
    handlePlayerCollectibleCollision(collectible, collectibleIndex) {
        const reward = collectible.reward || Game.CONSTANTS.BULLETS_PER_BOX;
        
        // Add bullets
        Game.Player.Stats.addBullets(reward);
        
        // Create pickup popup
        const theme = Game.Cache.ThemeCache.getTheme();
        const label = `+${reward} ${theme.labels.bullets}`;
        Game.Effects.createScorePopup(
            collectible.x + collectible.width / 2,
            collectible.y,
            label
        );
        
        // Play collect sound
        Game.Sound.Effects.collect();
        
        // Remove collectible
        Game.State.Objects.removeObject('obstacles', collectibleIndex);
        
        return true;
    },
    
    /**
     * Handle collision between player and damage obstacle
     * @param {object} obstacle - Damage obstacle
     * @param {number} obstacleIndex - Obstacle index
     * @returns {boolean} Whether collision was handled
     */
    handlePlayerDamageCollision(obstacle, obstacleIndex) {
        // Deal damage to player
        const damageDealt = Game.Player.Controller.takeDamage(obstacle);
        
        if (damageDealt) {
            // Create camera shake
            Game.Rendering.Renderer.startCameraShake(8, 15);
            
            // Remove obstacle
            Game.State.Objects.removeObject('obstacles', obstacleIndex);
            
            return true;
        }
        
        return false;
    },
    
    /**
     * Handle collision between bullet and obstacle
     * @param {object} bullet - Bullet that collided
     * @param {number} bulletIndex - Bullet index
     * @param {object} obstacle - Obstacle that was hit
     * @param {number} obstacleIndex - Obstacle index
     * @returns {boolean} Whether collision was handled
     */
    handleBulletObstacleCollision(bullet, bulletIndex, obstacle, obstacleIndex) {
        const damage = bullet.enhanced ? 2 : 1;
        
        // Damage obstacle
        obstacle.health -= damage;
        
        // Create hit effect
        this.createHitEffect(obstacle, bullet);
        
        // Handle special bullet effects
        this.handleSpecialBulletEffects(bullet, obstacle);
        
        // Remove bullet
        Game.State.Objects.removeObject('bullets', bulletIndex);
        
        // Check if obstacle is destroyed
        if (obstacle.health <= 0) {
            this.handleObstacleDestroyed(obstacle, obstacleIndex);
        }
        
        return true;
    },
    
    /**
     * Create hit effect for obstacle
     * @param {object} obstacle - Hit obstacle
     * @param {object} bullet - Bullet that hit
     */
    createHitEffect(obstacle, bullet) {
        const theme = Game.Cache.ThemeCache.getTheme();
        const hitX = obstacle.x + obstacle.width / 2;
        const hitY = obstacle.y + obstacle.height / 2;
        
        if (theme.id === 'Dungeon') {
            Game.Effects.createLightningEffect(hitX, hitY);
            
            // Enhanced bullets create additional effects
            if (bullet.enhanced) {
                Game.Rendering.Renderer.startCameraShake(3, 8);
            }
        } else {
            const explosionType = bullet.enhanced ? 'enhanced' : 'normal';
            Game.Effects.createExplosion(hitX, hitY, explosionType);
            
            // Enhanced bullets create particle burst
            if (bullet.enhanced) {
                Game.Effects.Explosions.createParticles(hitX, hitY, 12);
                Game.Rendering.Renderer.startCameraShake(3, 8);
            }
        }
    },
    
    /**
     * Handle special bullet effects
     * @param {object} bullet - Bullet with special effects
     * @param {object} obstacle - Hit obstacle
     */
    handleSpecialBulletEffects(bullet, obstacle) {
        // Chain lightning effect for dungeon theme
        if (bullet.type === 'chainLightning' && bullet.enhanced) {
            this.handleChainLightningEffect(bullet, obstacle);
        }
        
        // Multi-shot penetration (future feature)
        if (bullet.piercing) {
            // Don't remove bullet, let it continue
        }
    },
    
    /**
     * Handle chain lightning effect
     * @param {object} bullet - Chain lightning bullet
     * @param {object} primaryTarget - Primary target hit
     */
    handleChainLightningEffect(bullet, primaryTarget) {
        const obstacles = Game.State.Objects.getObjects('obstacles');
        const chainRange = 80;
        const maxChains = 2;
        const chainDamage = Math.max(1, Math.floor(bullet.enhanced ? 2 : 1));
        
        let chainTargets = obstacles.filter(obstacle => {
            if (obstacle === primaryTarget || obstacle.isCollectible) return false;
            
            const distance = Math.sqrt(
                Math.pow(obstacle.x - primaryTarget.x, 2) + 
                Math.pow(obstacle.y - primaryTarget.y, 2)
            );
            
            return distance <= chainRange;
        }).slice(0, maxChains);
        
        // Create chain effects and deal damage
        chainTargets.forEach(chainTarget => {
            // Create visual chain effect
            Game.Effects.Lightning.createChain(
                primaryTarget.x + primaryTarget.width / 2,
                primaryTarget.y + primaryTarget.height / 2,
                chainTarget.x + chainTarget.width / 2,
                chainTarget.y + chainTarget.height / 2
            );
            
            // Deal chain damage
            chainTarget.health -= chainDamage;
            
            // Check if chain target is destroyed
            if (chainTarget.health <= 0) {
                const chainIndex = obstacles.indexOf(chainTarget);
                if (chainIndex !== -1) {
                    this.handleObstacleDestroyed(chainTarget, chainIndex);
                }
            }
        });
    },
    
    /**
     * Handle obstacle destruction
     * @param {object} obstacle - Destroyed obstacle
     * @param {number} obstacleIndex - Obstacle index
     */
    handleObstacleDestroyed(obstacle, obstacleIndex) {
        const gameData = Game.State.Manager.getData();
        
        // Calculate and award points
        const points = Game.Logic.Rules.calculateObstaclePoints(obstacle);
        Game.Player.Stats.addScore(points, obstacle.x + obstacle.width/2, obstacle.y);
        
        // Update statistics
        Game.State.Manager.updateData({
            enemiesDefeated: gameData.enemiesDefeated + 1,
            levelProgress: gameData.levelProgress + 3
        });
        
        // Handle bullet hit for life bonus
        Game.Player.Stats.onBulletHit();
        
        // Special effects for boss destruction
        if (obstacle.isBoss) {
            this.handleBossDestruction(obstacle);
        }
        
        // Remove obstacle
        Game.State.Objects.removeObject('obstacles', obstacleIndex);
        
        // Play hit sound
        Game.Sound.Effects.hit();
    },
    
    /**
     * Handle boss destruction with special effects
     * @param {object} boss - Destroyed boss
     */
    handleBossDestruction(boss) {
        // Create dramatic explosion
        Game.Effects.Explosions.createParticles(
            boss.x + boss.width / 2,
            boss.y + boss.height / 2,
            20
        );
        
        // Camera shake
        Game.Rendering.Renderer.startCameraShake(15, 30);
        
        // Bonus points popup
        Game.Effects.createScorePopup(
            boss.x + boss.width / 2,
            boss.y - 20,
            'BOSS DEFEATED!',
            'bonus'
        );
        
        // Show notification
        Game.UI.Manager.showNotification('Boss Defeated!', 'success', 3000);
    },
    
    /**
     * Check collision between two moving objects (with prediction)
     * @param {object} obj1 - First moving object
     * @param {object} obj2 - Second moving object
     * @returns {object|null} Collision prediction data
     */
    predictCollision(obj1, obj2) {
        // Simple linear prediction
        const relativeVelX = (obj1.velocityX || 0) - (obj2.velocityX || 0);
        const relativeVelY = (obj1.velocityY || 0) - (obj2.velocityY || 0);
        
        if (relativeVelX === 0 && relativeVelY === 0) return null;
        
        const relativeX = obj2.x - obj1.x;
        const relativeY = obj2.y - obj1.y;
        
        const timeToCollisionX = relativeVelX !== 0 ? -relativeX / relativeVelX : Infinity;
        const timeToCollisionY = relativeVelY !== 0 ? -relativeY / relativeVelY : Infinity;
        
        const timeToCollision = Math.min(timeToCollisionX, timeToCollisionY);
        
        if (timeToCollision > 0 && timeToCollision < 60) { // Within 1 second at 60fps
            return {
                timeToCollision: timeToCollision,
                collisionX: obj1.x + (obj1.velocityX || 0) * timeToCollision,
                collisionY: obj1.y + (obj1.velocityY || 0) * timeToCollision
            };
        }
        
        return null;
    },
    
    /**
     * Get collision statistics
     * @returns {object} Collision statistics
     */
    getStats() {
        return {
            ...this.stats,
            checksPerFrame: this.stats.totalChecks,
            efficiency: this.stats.totalChecks > 0 ? 
                (this.stats.skippedChecks / this.stats.totalChecks * 100).toFixed(1) + '%' : '0%'
        };
    },
    
    /**
     * Reset collision statistics
     */
    resetStats() {
        this.stats = {
            playerCollisions: 0,
            bulletCollisions: 0,
            totalChecks: 0,
            skippedChecks: 0
        };
    },
    
    /**
     * Debug visualization of collision system
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    debugRender(ctx) {
        if (!Game.DEBUG.ENABLED || !Game.DEBUG.SHOW_COLLISION_BOXES) return;
        
        // Draw spatial grid
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x <= Game.CONSTANTS.CANVAS_WIDTH; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, Game.CONSTANTS.CANVAS_HEIGHT);
            ctx.stroke();
        }
        
        for (let y = 0; y <= Game.CONSTANTS.CANVAS_HEIGHT; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(Game.CONSTANTS.CANVAS_WIDTH, y);
            ctx.stroke();
        }
        
        // Highlight occupied cells
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        this.spatialGrid.cells.forEach((cell, index) => {
            if (cell.length > 0) {
                const x = (index % this.spatialGrid.width) * this.gridSize;
                const y = Math.floor(index / this.spatialGrid.width) * this.gridSize;
                ctx.fillRect(x, y, this.gridSize, this.gridSize);
            }
        });
    }
};

// ENTFERNT: Die init() Funktion wird von main.js aufgerufen, nicht hier!
// Game.Logic.CollisionSystem.init();