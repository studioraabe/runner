/* ====================================
   OBSTACLE.JS - Hindernisse und Feinde
   ==================================== */

// Obstacle Namespace
Game.Obstacles = Game.Obstacles || {};

/**
 * Obstacle Manager - Verwaltet alle Hindernisse und Feinde
 */
Game.Obstacles.Manager = {
    /**
     * Update all obstacles
     */
    update() {
        if (!Game.State.Manager.gameRunning) return;
        
        this.spawnObstacles();
        this.updateExistingObstacles();
        this.checkObstaclesPassed();
        this.cleanupObstacles();
    },
    
    /**
     * Spawn new obstacles based on timer and level
     */
    spawnObstacles() {
        const objects = Game.State.Objects;
        
        if (objects.obstacleTimer <= 0) {
            const obstacle = this.generateObstacle();
            if (obstacle) {
                objects.addObject('obstacles', obstacle);
                objects.obstacleTimer = this.calculateSpawnTimer(obstacle.type);
            }
        }
        
        objects.obstacleTimer--;
    },
    
    /**
     * Generate new obstacle based on current level and theme
     * @returns {object|null} Generated obstacle
     */
    generateObstacle() {
        const gameData = Game.State.Manager.getData();
        const theme = Game.Cache.ThemeCache.getTheme();
        const spawnChance = Math.random();
        
        // Calculate dynamic spawn chances
        const chances = this.calculateSpawnChances(gameData.level);
        
        // Check for bullet boxes first (limited per level)
        if (spawnChance < chances.bulletBox && gameData.bulletBoxesFound < Game.CONSTANTS.MAX_BULLET_BOXES_PER_LEVEL) {
            const boxType = theme.id === 'cowboy' ? 'bulletBox' : 'boltBox';
            const obstacle = this.createObstacle(boxType, Game.CONSTANTS.CANVAS_WIDTH, Game.CONSTANTS.GROUND_Y - 16);
            
            Game.State.Manager.updateData({
                bulletBoxesFound: gameData.bulletBoxesFound + 1
            });
            
            return obstacle;
        }
        
        // Determine obstacle type based on cumulative chances
        let obstacleType = null;
        
        if (spawnChance < chances.boss) {
            obstacleType = theme.id === 'cowboy' ? 'boss' : 'alphaWolf';
        } else if (spawnChance < chances.flying) {
            obstacleType = theme.id === 'cowboy' ? 'vulture' : 'bat';
        } else if (spawnChance < chances.medium) {
            obstacleType = theme.id === 'cowboy' ? 'bull' : 'spider';
        } else if (spawnChance < chances.human) {
            obstacleType = theme.id === 'cowboy' ? 'prisoner' : 'vampire';
        } else if (spawnChance < chances.static) {
            obstacleType = theme.id === 'cowboy' ? 'cactus' : 'skeleton';
        } else {
            obstacleType = 'rock';
        }
        
        return this.createObstacle(obstacleType, Game.CONSTANTS.CANVAS_WIDTH, null);
    },
    
    /**
     * Calculate spawn chances based on level
     * @param {number} level - Current level
     * @returns {object} Spawn chances object
     */
    calculateSpawnChances(level) {
        const config = Game.SPAWN_CONFIG.SPAWN_CHANCES;
        
        return {
            bulletBox: config.BULLET_BOX,
            boss: Math.min(config.BOSS_BASE + (level * config.BOSS_INCREMENT), config.BOSS_MAX),
            flying: config.BOSS_BASE + Math.min(config.FLYING_BASE + (level * config.FLYING_INCREMENT), config.FLYING_MAX),
            medium: config.BOSS_BASE + config.FLYING_MAX + Math.min(config.MEDIUM_BASE + (level * config.MEDIUM_INCREMENT), config.MEDIUM_MAX),
            human: config.BOSS_BASE + config.FLYING_MAX + config.MEDIUM_MAX + Math.min(config.HUMAN_BASE + (level * config.HUMAN_INCREMENT), config.HUMAN_MAX),
            static: config.BOSS_BASE + config.FLYING_MAX + config.MEDIUM_MAX + config.HUMAN_MAX + config.STATIC_CHANCE
        };
    },
    
    /**
     * Create obstacle with given type and position
     * @param {string} type - Obstacle type
     * @param {number} x - X position
     * @param {number} y - Y position (null for auto-calculation)
     * @returns {object} Created obstacle
     */
    createObstacle(type, x, y) {
        const config = Game.Themes.Manager.getEnemyConfig(type);
        const constants = Game.CONSTANTS;
        
        if (!config) {
            console.warn(`⚠️ Unknown obstacle type: ${type}`);
            return null;
        }
        
        // Calculate Y position if not provided
        if (y === null) {
            if (config.spawnsOnGround) {
                y = constants.GROUND_Y - config.height;
            } else {
                const yRange = config.yRange || [140, 280];
                y = yRange[0] + Math.random() * (yRange[1] - yRange[0]);
            }
        }
        
        const obstacle = {
            x: x,
            y: y,
            width: config.width,
            height: config.height,
            type: type,
            health: config.health,
            maxHealth: config.health,
            passed: false,
            animationTime: Math.random() * 1000,
            isCollectible: config.isCollectible || false,
            reward: config.reward || 0
        };
        
        // Add special properties for boss enemies
        if (config.hasBossAI) {
            obstacle.verticalMovement = 0;
            obstacle.jumpTimer = Math.random() * 240 + 180;
        }
        
        return obstacle;
    },
    
    /**
     * Update existing obstacles
     */
    updateExistingObstacles() {
        const obstacles = Game.State.Objects.getObjects('obstacles');
        const gameData = Game.State.Manager.getData();
        const speed = gameData.gameSpeed;
        
        obstacles.forEach(obstacle => {
            // Move obstacle
            obstacle.x -= speed;
            
            // Update animation timer
            obstacle.animationTime += 16;
            
            // Handle special movement patterns
            this.updateSpecialMovement(obstacle);
        });
    },
    
    /**
     * Update special movement patterns for specific obstacle types
     * @param {object} obstacle - Obstacle to update
     */
    updateSpecialMovement(obstacle) {
        switch (obstacle.type) {
            case 'vulture':
            case 'bat':
                // Flying pattern
                obstacle.y += Math.sin(Date.now() * 0.01 + obstacle.animationTime * 0.001) * 1.5;
                break;
                
            case 'boss':
            case 'alphaWolf':
                // Boss jumping pattern
                if (obstacle.jumpTimer !== undefined) {
                    obstacle.jumpTimer--;
                    if (obstacle.jumpTimer <= 0) {
                        obstacle.verticalMovement = -15;
                        obstacle.jumpTimer = Math.random() * 240 + 180;
                    }
                    
                    obstacle.y += obstacle.verticalMovement;
                    obstacle.verticalMovement += 0.8; // Gravity
                    
                    if (obstacle.y >= Game.CONSTANTS.GROUND_Y - obstacle.height) {
                        obstacle.y = Game.CONSTANTS.GROUND_Y - obstacle.height;
                        obstacle.verticalMovement = 0;
                    }
                }
                break;
                
            case 'bulletBox':
            case 'boltBox':
                // Floating animation for collectibles
                obstacle.y += Math.sin(obstacle.animationTime * 0.003) * 2;
                break;
        }
    },
    
    /**
     * Check which obstacles have been passed by the player
     */
    checkObstaclesPassed() {
        const obstacles = Game.State.Objects.getObjects('obstacles');
        const playerX = Game.State.Player.position.x;
        
        obstacles.forEach(obstacle => {
            if (!obstacle.passed && !obstacle.isCollectible && obstacle.x + obstacle.width < playerX) {
                obstacle.passed = true;
                Game.Player.Stats.onObstacleAvoided();
                
                // Update level progress
                const gameData = Game.State.Manager.getData();
                Game.State.Manager.updateData({
                    levelProgress: gameData.levelProgress + 2
                });
            }
        });
    },
    
    /**
     * Remove off-screen obstacles
     */
    cleanupObstacles() {
        const obstacles = Game.State.Objects.getObjects('obstacles');
        
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            if (obstacle.x + obstacle.width < 0) {
                Game.State.Objects.removeObject('obstacles', i);
            }
        }
    },
    
    /**
     * Calculate spawn timer for obstacle type
     * @param {string} obstacleType - Type of obstacle
     * @returns {number} Spawn timer value
     */
    calculateSpawnTimer(obstacleType) {
        const gameData = Game.State.Manager.getData();
        const level = gameData.level;
        
        // Get base and min timers for obstacle type
        const timerKey = this.getTimerKey(obstacleType);
        const baseTimer = Game.SPAWN_CONFIG.BASE_TIMERS[timerKey] || 100;
        const minTimer = Game.SPAWN_CONFIG.MIN_TIMERS[timerKey] || 20;
        
        // Calculate reduction based on level
        const maxReductionPercent = 0.65;
        const maxReduction = baseTimer * maxReductionPercent;
        const reductionProgress = 1 - Math.exp(-level * 0.25);
        const totalReduction = maxReduction * reductionProgress;
        
        const finalTimer = Math.floor(baseTimer - totalReduction);
        const effectiveMinTimer = Math.max(minTimer, Math.floor(baseTimer * 0.25));
        
        return Math.max(finalTimer, effectiveMinTimer);
    },
    
    /**
     * Get timer configuration key for obstacle type
     * @param {string} obstacleType - Obstacle type
     * @returns {string} Timer key
     */
    getTimerKey(obstacleType) {
        const typeMap = {
            'bulletBox': 'BULLET_BOX',
            'boltBox': 'BULLET_BOX',
            'boss': 'BOSS',
            'alphaWolf': 'BOSS',
            'vulture': 'FLYING',
            'bat': 'FLYING',
            'bull': 'MEDIUM',
            'spider': 'MEDIUM',
            'prisoner': 'HUMAN',
            'vampire': 'HUMAN',
            'cactus': 'STATIC',
            'skeleton': 'STATIC',
            'rock': 'ROCK'
        };
        
        return typeMap[obstacleType] || 'ROCK';
    },
    
    /**
     * Get all obstacles of specific type
     * @param {string} type - Obstacle type
     * @returns {Array} Array of obstacles
     */
    getObstaclesByType(type) {
        const obstacles = Game.State.Objects.getObjects('obstacles');
        return obstacles.filter(obstacle => obstacle.type === type);
    },
    
    /**
     * Clear all obstacles
     */
    clearAll() {
        Game.State.Objects.obstacles.length = 0;
    }
};

/**
 * Obstacle Collision System
 */
Game.Obstacles.Collision = {
    /**
     * Check collisions between player and all obstacles
     */
    checkPlayerCollisions() {
        if (Game.State.Player.isInvulnerable()) return;
        
        const obstacles = Game.State.Objects.getObjects('obstacles');
        
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            
            if (Game.Player.Collision.checkCollision(obstacle)) {
                const wasHandled = Game.Player.Collision.handleObstacleCollision(obstacle);
                
                if (wasHandled) {
                    Game.State.Objects.removeObject('obstacles', i);
                    
                    // Break after first collision to prevent multiple hits
                    break;
                }
            }
        }
    },
    
    /**
     * Check collisions between bullets and obstacles
     */
    checkBulletCollisions() {
        const bullets = Game.State.Objects.getObjects('bullets');
        const obstacles = Game.State.Objects.getObjects('obstacles');
        
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            
            for (let j = obstacles.length - 1; j >= 0; j--) {
                const obstacle = obstacles[j];
                
                // Skip collectibles
                if (obstacle.isCollectible) continue;
                
                // Check collision
                if (this.checkBulletObstacleCollision(bullet, obstacle)) {
                    const damage = bullet.enhanced ? 2 : 1;
                    obstacle.health -= damage;
                    
                    // Create hit effect
                    this.createHitEffect(obstacle);
                    
                    // Remove bullet
                    Game.State.Objects.removeObject('bullets', i);
                    
                    // Check if obstacle is destroyed
                    if (obstacle.health <= 0) {
                        this.handleObstacleDestroyed(obstacle, j);
                    }
                    
                    break; // Bullet can only hit one obstacle
                }
            }
        }
    },
    
    /**
     * Check collision between bullet and obstacle
     * @param {object} bullet - Bullet object
     * @param {object} obstacle - Obstacle object
     * @returns {boolean} Whether collision occurred
     */
    checkBulletObstacleCollision(bullet, obstacle) {
        return bullet.x < obstacle.x + obstacle.width &&
               bullet.x + 8 > obstacle.x &&
               bullet.y < obstacle.y + obstacle.height &&
               bullet.y + 4 > obstacle.y;
    },
    
    /**
     * Create hit effect for obstacle
     * @param {object} obstacle - Hit obstacle
     */
    createHitEffect(obstacle) {
        const theme = Game.Cache.ThemeCache.getTheme();
        
        if (theme.id === 'Dungeon') {
            Game.Effects.createLightningEffect(
                obstacle.x + obstacle.width / 2,
                obstacle.y + obstacle.height / 2
            );
        } else {
            Game.Effects.createExplosion(
                obstacle.x + obstacle.width / 2,
                obstacle.y + obstacle.height / 2
            );
        }
    },
    
    /**
     * Handle obstacle destruction
     * @param {object} obstacle - Destroyed obstacle
     * @param {number} index - Obstacle index in array
     */
    handleObstacleDestroyed(obstacle, index) {
        const gameData = Game.State.Manager.getData();
        
        // Calculate points
        const basePoints = Game.POINTS_CONFIG.BASE_POINTS[obstacle.type.toUpperCase()] || 10;
        const levelBonus = (gameData.level - 1) * Game.POINTS_CONFIG.LEVEL_BONUS_PER_LEVEL;
        const points = basePoints + levelBonus;
        
        // Add score and create popup
        Game.Player.Stats.addScore(points, obstacle.x + obstacle.width/2, obstacle.y);
        
        // Update statistics
        Game.State.Manager.updateData({
            enemiesDefeated: gameData.enemiesDefeated + 1,
            levelProgress: gameData.levelProgress + 3
        });
        
        // Handle bullet hit for life bonus
        Game.Player.Stats.onBulletHit();
        
        // Remove obstacle
        Game.State.Objects.removeObject('obstacles', index);
        
        // Play hit sound
        Game.Sound.Effects.hit();
    }
};

/**
 * Obstacle AI System
 */
Game.Obstacles.AI = {
    /**
     * Update AI for all obstacles
     */
    update() {
        const obstacles = Game.State.Objects.getObjects('obstacles');
        
        obstacles.forEach(obstacle => {
            this.updateObstacleAI(obstacle);
        });
    },
    
    /**
     * Update AI for specific obstacle
     * @param {object} obstacle - Obstacle to update
     */
    updateObstacleAI(obstacle) {
        switch (obstacle.type) {
            case 'boss':
            case 'alphaWolf':
                this.updateBossAI(obstacle);
                break;
                
            case 'vulture':
            case 'bat':
                this.updateFlyingAI(obstacle);
                break;
                
            case 'prisoner':
            case 'vampire':
                this.updateHumanoidAI(obstacle);
                break;
        }
    },
    
    /**
     * Update boss AI behavior
     * @param {object} boss - Boss obstacle
     */
    updateBossAI(boss) {
        const playerY = Game.State.Player.position.y;
        const playerX = Game.State.Player.position.x;
        
        // More aggressive jumping when player is nearby
        if (Math.abs(boss.x - playerX) < 200) {
            if (boss.jumpTimer > 120) {
                boss.jumpTimer = 120; // Reduce jump cooldown when close to player
            }
        }
        
        // Slight tracking behavior
        if (boss.x > playerX + 100 && boss.verticalMovement === 0) {
            // Boss is ahead of player, slightly adjust position
            boss.y += Math.sin(boss.animationTime * 0.002) * 0.3;
        }
    },
    
    /**
     * Update flying enemy AI
     * @param {object} flyer - Flying obstacle
     */
    updateFlyingAI(flyer) {
        const playerY = Game.State.Player.position.y;
        const playerX = Game.State.Player.position.x;
        
        // Slight homing behavior when close to player
        if (Math.abs(flyer.x - playerX) < 150) {
            const yDiff = playerY - flyer.y;
            flyer.y += Math.sign(yDiff) * 0.5;
        }
        
        // Keep within vertical bounds
        flyer.y = Math.max(100, Math.min(300, flyer.y));
    },
    
    /**
     * Update humanoid enemy AI
     * @param {object} humanoid - Humanoid obstacle
     */
    updateHumanoidAI(humanoid) {
        // Add struggle/movement animation
        const struggle = Math.sin(humanoid.animationTime * 0.01) * 0.8;
        humanoid.x += struggle * 0.1; // Slight horizontal movement
    }
};

/**
 * Obstacle Animation System
 */
Game.Obstacles.Animation = {
    /**
     * Get animation data for obstacle
     * @param {object} obstacle - Obstacle to animate
     * @returns {object} Animation data
     */
    getAnimationData(obstacle) {
        const baseData = {
            frame: Math.floor(obstacle.animationTime / 200) % 4,
            cycle: obstacle.animationTime / 1000,
            breathe: Math.sin(obstacle.animationTime * 0.004) * 0.5,
            sway: Math.sin(obstacle.animationTime * 0.003) * 1,
            flicker: Math.sin(obstacle.animationTime * 0.008) * 0.3
        };
        
        // Add type-specific animations
        switch (obstacle.type) {
            case 'cactus':
                baseData.spineGlow = 0.5 + Math.sin(obstacle.animationTime * 0.003) * 0.3;
                break;
                
            case 'vulture':
            case 'bat':
                baseData.wingFlap = Math.sin(obstacle.animationTime * 0.02) * 4;
                break;
                
            case 'boss':
            case 'alphaWolf':
                baseData.aura = 0.7 + Math.sin(obstacle.animationTime * 0.008) * 0.3;
                break;
                
            case 'bulletBox':
            case 'boltBox':
                baseData.glow = 0.6 + Math.sin(obstacle.animationTime * 0.005) * 0.4;
                baseData.sparkle = Math.sin(obstacle.animationTime * 0.01) > 0.7;
                break;
        }
        
        return baseData;
    }
};

/**
 * Obstacle Health System
 */
Game.Obstacles.Health = {
    /**
     * Damage obstacle
     * @param {object} obstacle - Obstacle to damage
     * @param {number} damage - Damage amount
     * @returns {boolean} Whether obstacle was destroyed
     */
    damageObstacle(obstacle, damage) {
        obstacle.health -= damage;
        
        // Create damage effect
        Game.Obstacles.Collision.createHitEffect(obstacle);
        
        return obstacle.health <= 0;
    },
    
    /**
     * Heal obstacle
     * @param {object} obstacle - Obstacle to heal
     * @param {number} healing - Healing amount
     */
    healObstacle(obstacle, healing) {
        obstacle.health = Math.min(obstacle.maxHealth, obstacle.health + healing);
    },
    
    /**
     * Get health percentage
     * @param {object} obstacle - Obstacle
     * @returns {number} Health percentage (0-1)
     */
    getHealthPercentage(obstacle) {
        return obstacle.health / obstacle.maxHealth;
    },
    
    /**
     * Check if obstacle should show health bar
     * @param {object} obstacle - Obstacle to check
     * @returns {boolean} Whether to show health bar
     */
    shouldShowHealthBar(obstacle) {
        return obstacle.maxHealth > 1 && 
               !obstacle.isCollectible && 
               obstacle.health < obstacle.maxHealth;
    }
};

/**
 * Obstacle Factory - Creates specific obstacle types
 */
Game.Obstacles.Factory = {
    /**
     * Create boss obstacle
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {object} Boss obstacle
     */
    createBoss(x, y) {
        const theme = Game.Cache.ThemeCache.getTheme();
        const bossType = theme.id === 'cowboy' ? 'boss' : 'alphaWolf';
        
        const boss = Game.Obstacles.Manager.createObstacle(bossType, x, y);
        
        // Add boss-specific properties
        boss.isBoss = true;
        boss.spawnTime = Date.now();
        
        // Play boss spawn sound
        Game.Sound.Effects.bossSpawn();
        
        // Show boss notification
        Game.UI.Manager.showNotification('Boss Enemy Appeared!', 'warning', 3000);
        
        return boss;
    },
    
    /**
     * Create collectible
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {object} Collectible obstacle
     */
    createCollectible(x, y) {
        const theme = Game.Cache.ThemeCache.getTheme();
        const collectibleType = theme.id === 'cowboy' ? 'bulletBox' : 'boltBox';
        
        return Game.Obstacles.Manager.createObstacle(collectibleType, x, y);
    }
};

/**
 * Initialize Obstacle System
 */
Game.Obstacles.init = function() {
    console.log('🚧 Obstacle system initializing...');
    
    // Set up global references for backward compatibility
    window.obstacles = Game.State.Objects.obstacles;
    window.createObstacle = (type, x, y, width, height) => {
        return Game.Obstacles.Manager.createObstacle(type, x, y);
    };
    
    console.log('✅ Obstacle system initialized');
    return true;
};

// Auto-initialize
Game.Obstacles.init();

/**
 * Obstacle AI System
 */
Game.Obstacles.AI = {
    /**
     * Update AI for all obstacles
     */
    update() {
        const obstacles = Game.State.Objects.getObjects('obstacles');
        
        obstacles.forEach(obstacle => {
            this.updateObstacleAI(obstacle);
        });
    },
    
    /**
     * Update AI for specific obstacle
     * @param {object} obstacle - Obstacle to update
     */
    updateObstacleAI(obstacle) {
        switch (obstacle.type) {
            case 'boss':
            case 'alphaWolf':
                this.updateBossAI(obstacle);
                break;
                
            case 'vulture':
            case 'bat':
                this.updateFlyingAI(obstacle);
                break;
                
            case 'prisoner':
            case 'vampire':
                this.updateHumanoidAI(obstacle);
                break;
        }
    },
    
    /**
     * Update boss AI behavior
     * @param {object} boss - Boss obstacle
     */
    updateBossAI(boss) {
        const playerY = Game.State.Player.position.y;
        const playerX = Game.State.Player.position.x;
        
        // More aggressive jumping when player is nearby
        if (Math.abs(boss.x - playerX) < 200) {
            if (boss.jumpTimer > 120) {
                boss.jumpTimer = 120; // Reduce jump cooldown when close to player
            }
        }
        
        // Slight tracking behavior
        if (boss.x > playerX + 100 && boss.verticalMovement === 0) {
            // Boss is ahead of player, slightly adjust position
            boss.y += Math.sin(boss.animationTime * 0.002) * 0.3;
        }
    },
    
    /**
     * Update flying enemy AI
     * @param {object} flyer - Flying obstacle
     */
    updateFlyingAI(flyer) {
        const playerY = Game.State.Player.position.y;
        const playerX = Game.State.Player.position.x;
        
        // Slight homing behavior when close to player
        if (Math.abs(flyer.x - playerX) < 150) {
            const yDiff = playerY - flyer.y;
            flyer.y += Math.sign(yDiff) * 0.5;
        }
        
        // Keep within vertical bounds
        flyer.y = Math.max(100, Math.min(300, flyer.y));
    },
    
    /**
     * Update humanoid enemy AI
     * @param {object} humanoid - Humanoid obstacle
     */
    updateHumanoidAI(humanoid) {
        // Add struggle/movement animation
        const struggle = Math.sin(humanoid.animationTime * 0.01) * 0.8;
        humanoid.x += struggle * 0.1; // Slight horizontal movement
    }
};

/**
 * Obstacle Animation System
 */
Game.Obstacles.Animation = {
    /**
     * Get animation data for obstacle
     * @param {object} obstacle - Obstacle to animate
     * @returns {object} Animation data
     */
    getAnimationData(obstacle) {
        const baseData = {
            frame: Math.floor(obstacle.animationTime / 200) % 4,
            cycle: obstacle.animationTime / 1000,
            breathe: Math.sin(obstacle.animationTime * 0.004) * 0.5,
            sway: Math.sin(obstacle.animationTime * 0.003) * 1,
            flicker: Math.sin(obstacle.animationTime * 0.008) * 0.3
        };
        
        // Add type-specific animations
        switch (obstacle.type) {
            case 'cactus':
                baseData.spineGlow = 0.5 + Math.sin(obstacle.animationTime * 0.003) * 0.3;
                break;
                
            case 'vulture':
            case 'bat':
                baseData.wingFlap = Math.sin(obstacle.animationTime * 0.02) * 4;
                break;
                
            case 'boss':
            case 'alphaWolf':
                baseData.aura = 0.7 + Math.sin(obstacle.animationTime * 0.008) * 0.3;
                break;
                
            case 'bulletBox':
            case 'boltBox':
                baseData.glow = 0.6 + Math.sin(obstacle.animationTime * 0.005) * 0.4;
                baseData.sparkle = Math.sin(obstacle.animationTime * 0.01) > 0.7;
                break;
        }
        
        return baseData;
    }
};

/**
 * Obstacle Health System
 */
Game.Obstacles.Health = {
    /**
     * Damage obstacle
     * @param {object} obstacle - Obstacle to damage
     * @param {number} damage - Damage amount
     * @returns {boolean} Whether obstacle was destroyed
     */
    damageObstacle(obstacle, damage) {
        obstacle.health -= damage;
        
        // Create damage effect
        Game.Obstacles.Collision.createHitEffect(obstacle);
        
        return obstacle.health <= 0;
    },
    
    /**
     * Heal obstacle
     * @param {object} obstacle - Obstacle to heal
     * @param {number} healing - Healing amount
     */
    healObstacle(obstacle, healing) {
        obstacle.health = Math.min(obstacle.maxHealth, obstacle.health + healing);
    },
    
    /**
     * Get health percentage
     * @param {object} obstacle - Obstacle
     * @returns {number} Health percentage (0-1)
     */
    getHealthPercentage(obstacle) {
        return obstacle.health / obstacle.maxHealth;
    },
    
    /**
     * Check if obstacle should show health bar
     * @param {object} obstacle - Obstacle to check
     * @returns {boolean} Whether to show health bar
     */
    shouldShowHealthBar(obstacle) {
        return obstacle.maxHealth > 1 && 
               !obstacle.isCollectible && 
               obstacle.health < obstacle.maxHealth;
    }
};

/**
 * Obstacle Factory - Creates specific obstacle types
 */
Game.Obstacles.Factory = {
    /**
     * Create boss obstacle
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {object} Boss obstacle
     */
    createBoss(x, y) {
        const theme = Game.Cache.ThemeCache.getTheme();
        const bossType = theme.id === 'cowboy' ? 'boss' : 'alphaWolf';
        
        const boss = Game.Obstacles.Manager.createObstacle(bossType, x, y);
        
        // Add boss-specific properties
        boss.isBoss = true;
        boss.spawnTime = Date.now();
        
        // Play boss spawn sound
        Game.Sound.Effects.bossSpawn();
        
        // Show boss notification
        Game.UI.Manager.showNotification('Boss Enemy Appeared!', 'warning', 3000);
        
        return boss;
    },
    
    /**
     * Create collectible
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {object} Collectible obstacle
     */
    createCollectible(x, y) {
        const theme = Game.Cache.ThemeCache.getTheme();
        const collectibleType = theme.id === 'cowboy' ? 'bulletBox' : 'boltBox';
        
        return Game.Obstacles.Manager.createObstacle(collectibleType, x, y);
    }
};

/**
 * Initialize Obstacle System
 */
Game.Obstacles.init = function() {
    console.log('🚧 Obstacle system initializing...');
    
    // Set up global references for backward compatibility
    window.obstacles = Game.State.Objects.obstacles;
    window.createObstacle = (type, x, y, width, height) => {
        return Game.Obstacles.Manager.createObstacle(type, x, y);
    };
    
    console.log('✅ Obstacle system initialized');
    return true;
};

// Auto-initialize
Game.Obstacles.init();