/* ====================================
   EFFECTS.JS - Partikel und Effekt-System
   ==================================== */

// Effects Namespace
Game.Effects = Game.Effects || {};

Game.Effects.getTheme = function() {
    return (window.game?.getGameCache) ? window.game.getGameCache().getTheme() : { id: 'cowboy' };
};

/**
 * Effects Manager - Verwaltet alle visuellen Effekte
 */
Game.Effects.Manager = {
    /**
     * Update all effects
     */
    update() {
        this.updateExplosions();
        this.updateBloodParticles();
        this.updateLightningEffects();
        this.updateScorePopups();
        this.updateDoubleJumpParticles();
        this.updateEnvironmentElements();
    },
    
    /**
     * Update explosion effects
     */
    updateExplosions() {
        const explosions = Game.State.Objects.getObjects('explosions');
        
        for (let i = explosions.length - 1; i >= 0; i--) {
            const explosion = explosions[i];
            explosion.frame++;
            
            if (explosion.frame > Game.ANIMATION_CONFIG.EXPLOSION_FRAMES) {
                Game.State.Objects.removeObject('explosions', i);
            }
        }
    },
    
    /**
     * Update blood particle effects
     */
    updateBloodParticles() {
        const particles = Game.State.Objects.getObjects('bloodParticles');
        
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // Update position
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityY += 0.2; // Gravity
            
            // Update life
            particle.life--;
            
            if (particle.life <= 0) {
                Game.State.Objects.removeObject('bloodParticles', i);
            }
        }
    },
    
    /**
     * Update lightning effects
     */
    updateLightningEffects() {
        const effects = Game.State.Objects.getObjects('lightningEffects');
        
        for (let i = effects.length - 1; i >= 0; i--) {
            const effect = effects[i];
            effect.life--;
            
            if (effect.life <= 0) {
                Game.State.Objects.removeObject('lightningEffects', i);
            }
        }
    },
    
    /**
     * Update score popup effects
     */
    updateScorePopups() {
        const popups = Game.State.Objects.getObjects('scorePopups');
        
        for (let i = popups.length - 1; i >= 0; i--) {
            const popup = popups[i];
            popup.y -= 1; // Float upward
            popup.life--;
            
            if (popup.life <= 0) {
                Game.State.Objects.removeObject('scorePopups', i);
            }
        }
    },
    
    /**
     * Update double jump particles
     */
    updateDoubleJumpParticles() {
        const particles = Game.State.Objects.getObjects('doubleJumpParticles');
        
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // Update position
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityY += 0.1; // Slight gravity
            
            // Update life
            particle.life--;
            
            if (particle.life <= 0) {
                Game.State.Objects.removeObject('doubleJumpParticles', i);
            }
        }
    },
    
    /**
     * Update environment elements
     */
    updateEnvironmentElements() {
        const elements = Game.State.Objects.getObjects('environmentElements');
        const gameData = Game.State.Manager.getData();
        const speed = gameData.gameSpeed || 2;
        
        elements.forEach(element => {
            if (element.type === 'cloud') {
                element.x -= element.speed;
                if (element.x + element.width < 0) {
                    element.x = Game.CONSTANTS.CANVAS_WIDTH;
                    element.y = Math.random() * 100 + 25;
                }
            } else if (element.type === 'torch') {
                element.flicker += 0.1;
                element.x -= speed * 0.75;
                if (element.x < -20) {
                    element.x = Game.CONSTANTS.CANVAS_WIDTH + 20;
                    element.y = 50 + Math.random() * 35;
                }
            }
        });
    }
};

/**
 * Explosion Effects
 */
Game.Effects.Explosions = {
    /**
     * Create explosion effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Explosion type
     */
    create(x, y, type = 'normal') {
        const explosion = {
            x: x,
            y: y,
            frame: 0,
            type: type,
            size: type === 'large' ? 1.5 : 1,
            intensity: type === 'enhanced' ? 1.2 : 1
        };
        
        Game.State.Objects.addObject('explosions', explosion);
    },
    
    /**
     * Create multiple explosion particles
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} count - Number of particles
     */
    createParticles(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            const distance = 10 + Math.random() * 15;
            
            const particle = {
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 20 + Math.random() * 10,
                maxLife: 30,
                size: 2 + Math.random() * 3,
                frame: 0
            };
            
            Game.State.Objects.addObject('explosions', particle);
        }
    }
};

/**
 * Blood Particle Effects
 */
Game.Effects.BloodParticles = {
    /**
     * Create blood particles at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} count - Number of particles
     */
    create(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            const particle = {
                x: x + Math.random() * 20 - 10,
                y: y + Math.random() * 20 - 10,
                velocityX: (Math.random() - 0.5) * 6,
                velocityY: (Math.random() - 0.5) * 6 - 2,
                life: Game.ANIMATION_CONFIG.BLOOD_PARTICLE_LIFE,
                maxLife: Game.ANIMATION_CONFIG.BLOOD_PARTICLE_LIFE,
                size: 1 + Math.random() * 2
            };
            
            Game.State.Objects.addObject('bloodParticles', particle);
        }
    },
    
    /**
     * Create blood spray effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} direction - Spray direction (-1 or 1)
     */
    createSpray(x, y, direction = 1) {
        for (let i = 0; i < 12; i++) {
            const angle = (Math.random() - 0.5) * Math.PI * 0.5; // 90 degree spread
            const speed = 3 + Math.random() * 4;
            
            const particle = {
                x: x,
                y: y,
                velocityX: Math.cos(angle) * speed * direction,
                velocityY: Math.sin(angle) * speed - 1,
                life: 25 + Math.random() * 15,
                maxLife: 40,
                size: 1 + Math.random() * 2
            };
            
            Game.State.Objects.addObject('bloodParticles', particle);
        }
    }
};

/**
 * Lightning Effects
 */
Game.Effects.Lightning = {
    /**
     * Create lightning effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} branches - Number of branches
     */
    create(x, y, branches = null) {
        if (Game.Cache.ThemeCache.getTheme().id !== 'Dungeon') return;
        
        const branchCount = branches || (Math.floor(Math.random() * 3) + 2);
        
        const effect = {
            x: x,
            y: y,
            life: Game.ANIMATION_CONFIG.LIGHTNING_LIFE,
            maxLife: Game.ANIMATION_CONFIG.LIGHTNING_LIFE,
            branches: branchCount,
            intensity: 0.8 + Math.random() * 0.4
        };
        
        Game.State.Objects.addObject('lightningEffects', effect);
    },
    
    /**
     * Create chain lightning between two points
     * @param {number} x1 - Start X
     * @param {number} y1 - Start Y
     * @param {number} x2 - End X
     * @param {number} y2 - End Y
     */
    createChain(x1, y1, x2, y2) {
        const effect = {
            startX: x1,
            startY: y1,
            endX: x2,
            endY: y2,
            life: 15,
            maxLife: 15,
            intensity: 0.7 + Math.random() * 0.3,
            isChain: true
        };
        
        Game.State.Objects.addObject('lightningEffects', effect);
    },
    
    /**
     * Create lightning storm effect
     * @param {number} centerX - Center X position
     * @param {number} centerY - Center Y position
     * @param {number} radius - Effect radius
     */
    createStorm(centerX, centerY, radius = 50) {
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            setTimeout(() => {
                this.create(x, y, 1);
            }, i * 100);
        }
    }
};

/**
 * Score Popup Effects
 */
Game.Effects.ScorePopups = {
    /**
     * Create score popup
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number|string} points - Points value or text
     * @param {string} type - Popup type (normal, bonus, life)
     */
    create(x, y, points, type = 'normal') {
        const popup = {
            x: x,
            y: y,
            points: points,
            life: Game.ANIMATION_CONFIG.SCORE_POPUP_LIFE,
            maxLife: Game.ANIMATION_CONFIG.SCORE_POPUP_LIFE,
            type: type,
            scale: type === 'bonus' ? 1.2 : 1,
            color: this.getPopupColor(type)
        };
        
        Game.State.Objects.addObject('scorePopups', popup);
    },
    
    /**
     * Get popup color based on type
     * @param {string} type - Popup type
     * @returns {string} Color value
     */
    getPopupColor(type) {
if (Game.Effects.getTheme().id !== 'Dungeon') return;
        const colors = {
            normal: theme.id === 'Dungeon' ? '#FFD700' : '#FFD700',
            bonus: '#00FF00',
            life: '#FF69B4',
            damage: '#FF0000'
        };
        return colors[type] || colors.normal;
    },
    
    /**
     * Create floating text effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Text to display
     * @param {string} color - Text color
     */
    createFloatingText(x, y, text, color = '#FFFFFF') {
        const popup = {
            x: x,
            y: y,
            points: text,
            life: 90,
            maxLife: 90,
            type: 'text',
            color: color,
            velocityY: -0.5
        };
        
        Game.State.Objects.addObject('scorePopups', popup);
    }
};

/**
 * Double Jump Particles
 */
Game.Effects.DoubleJumpParticles = {
    /**
     * Create double jump particles
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    create(x, y) {
const theme = Game.Effects.getTheme();
        const particleCount = theme.id === 'cowboy' ? 
            Game.ANIMATION_CONFIG.COWBOY_DOUBLE_JUMP_PARTICLES : 
            Game.ANIMATION_CONFIG.DUNGEON_DOUBLE_JUMP_PARTICLES;
        
        for (let i = 0; i < particleCount; i++) {
            let particle;
            
            if (theme.id === 'cowboy') {
                // Dust cloud particles
                particle = {
                    x: x + Math.random() * 40 - 20,
                    y: y + 30 + Math.random() * 10,
                    velocityX: (Math.random() - 0.5) * 4,
                    velocityY: Math.random() * 2 + 1,
                    life: Game.ANIMATION_CONFIG.DOUBLE_JUMP_PARTICLE_LIFE,
                    maxLife: Game.ANIMATION_CONFIG.DOUBLE_JUMP_PARTICLE_LIFE,
                    size: 2 + Math.random() * 3,
                    color: '#D2B48C'
                };
            } else {
                // Shadow energy particles
                particle = {
                    x: x + 20 + Math.random() * 20 - 10,
                    y: y + 20 + Math.random() * 20 - 10,
                    velocityX: (Math.random() - 0.5) * 6,
                    velocityY: (Math.random() - 0.5) * 6,
                    life: 30,
                    maxLife: 30,
                    size: 1 + Math.random() * 2,
                    color: '#8A2BE2'
                };
            }
            
            Game.State.Objects.addObject('doubleJumpParticles', particle);
        }
    }
};

/**
 * Environment Effects
 */
Game.Effects.Environment = {
    /**
     * Initialize environment elements based on theme
     */
    init() {
        const elements = Game.State.Objects.getObjects('environmentElements');
        elements.length = 0; // Clear existing elements
        
const theme = Game.Effects.getTheme();
        
        if (theme.id === 'cowboy') {
            this.initCowboyEnvironment();
        } else {
            this.initDungeonEnvironment();
        }
    },
    
    /**
     * Initialize cowboy theme environment
     */
    initCowboyEnvironment() {
        for (let i = 0; i < 4; i++) {
            const cloud = {
                type: 'cloud',
                x: Math.random() * 1000,
                y: Math.random() * 100 + 25,
                width: 60 + Math.random() * 40,
                speed: 0.5 + Math.random() * 0.5
            };
            
            Game.State.Objects.addObject('environmentElements', cloud);
        }
    },
    
    /**
     * Initialize dungeon theme environment
     */
    initDungeonEnvironment() {
        for (let i = 0; i < 8; i++) {
            const torch = {
                type: 'torch',
                x: i * 125 + 70,
                y: 50 + Math.random() * 35,
                flicker: Math.random() * 20
            };
            
            Game.State.Objects.addObject('environmentElements', torch);
        }
    }
};

/**
 * Particle Pool System - For performance optimization
 */
Game.Effects.ParticlePool = {
    pools: {
        bloodParticles: [],
        explosions: [],
        lightningEffects: [],
        doubleJumpParticles: []
    },
    maxPoolSize: 50,
    
    /**
     * Get particle from pool
     * @param {string} type - Particle type
     * @returns {object} Particle object
     */
    getParticle(type) {
        const pool = this.pools[type];
        if (pool && pool.length > 0) {
            return pool.pop();
        }
        return {};
    },
    
    /**
     * Return particle to pool
     * @param {string} type - Particle type
     * @param {object} particle - Particle to return
     */
    returnParticle(type, particle) {
        const pool = this.pools[type];
        if (pool && pool.length < this.maxPoolSize) {
            // Clean particle properties
            Object.keys(particle).forEach(key => {
                delete particle[key];
            });
            pool.push(particle);
        }
    },
    
    /**
     * Clear all pools
     */
    clearPools() {
        Object.values(this.pools).forEach(pool => {
            pool.length = 0;
        });
    }
};

/**
 * Global Effect Creation Functions
 */
Game.Effects.createExplosion = function(x, y, type = 'normal') {
    Game.Effects.Explosions.create(x, y, type);
};

Game.Effects.createBloodParticles = function(x, y, count = 8) {
    Game.Effects.BloodParticles.create(x, y, count);
};

Game.Effects.createLightningEffect = function(x, y, branches = null) {
    Game.Effects.Lightning.create(x, y, branches);
};

Game.Effects.createScorePopup = function(x, y, points, type = 'normal') {
    Game.Effects.ScorePopups.create(x, y, points, type);
};

Game.Effects.createDoubleJumpParticles = function(x, y) {
    Game.Effects.DoubleJumpParticles.create(x, y);
};

/**
 * Initialize Effects System
 */
Game.Effects.init = function() {
    console.log('✨ Effects system initializing...');
    
    // Initialize environment based on current theme
    Game.Effects.Environment.init();
    
    // Set up global references for backward compatibility
    window.explosions = Game.State.Objects.explosions;
    window.bloodParticles = Game.State.Objects.bloodParticles;
    window.lightningEffects = Game.State.Objects.lightningEffects;
    window.scorePopups = Game.State.Objects.scorePopups;
    window.doubleJumpParticles = Game.State.Objects.doubleJumpParticles;
    window.environmentElements = Game.State.Objects.environmentElements;
    
    console.log('✅ Effects system initialized');
    return true;
};

// Auto-initialize
Game.Effects.init();