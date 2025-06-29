/* ====================================
   LEVELSYSTEM.JS - Level-Verwaltung
   ==================================== */

// Level System Namespace
Game.Logic = Game.Logic || {};

/**
 * Level System - Verwaltet Level-Progression und Buffs
 */
Game.Logic.LevelSystem = {
    // Buff configuration
    availableBuffs: [],
    activeBuffs: {},
    
    /**
     * Initialize level system
     */
    init() {
        console.log('📊 Level system initializing...');
        this.resetAvailableBuffs();
        console.log('✅ Level system initialized');
    },
    
    /**
     * Reset available buffs based on theme
     */
    resetAvailableBuffs() {
        const themes = {
            cowboy: [
                { id: 'multiShot', title: '🔥 Multi-Shot', desc: 'Fire 3 bullets at once and deal extra damage per shot' },
                { id: 'toughHide', title: '❤️ Tough Hide', desc: 'Gain extra life every 10 (15) bullet hits' },
                { id: 'doubleJump', title: '🦅 Sky Walker', desc: 'Unlock double jump ability and increased mobility' }
            ],
            Dungeon: [
                { id: 'chainLightning', title: '⚡ Chain Lightning', desc: 'Unleash 3 bolts at once that arc between enemies' },
                { id: 'undeadResilience', title: '🧟 Undead Vigor', desc: 'Gain extra life every 10 (15) bullet hits' },
                { id: 'shadowLeap', title: '🌙 Shadow Leap', desc: 'Unlock double jump with ethereal shadow form' }
            ]
        };

        const currentTheme = Game.Themes.Manager.currentTheme || 'cowboy';
        this.availableBuffs = [...themes[currentTheme]];
        this.activeBuffs = {};
        
        // Update game state
        if (Game.State && Game.State.Manager) {
            Game.State.Manager.updateData({
                availableBuffs: this.availableBuffs,
                activeBuffs: this.activeBuffs
            });
        }
    },
    
    /**
     * Update level progression
     */
    update() {
        const gameData = Game.State.Manager.getData();
        
        // Check if level is complete
        if (gameData.levelProgress >= Game.CONSTANTS.MAX_LEVEL_PROGRESS) {
            console.log(`🎉 Level ${gameData.level} complete!`);
            Game.Actions.completeLevel();
        }
    },
    
    /**
     * Check if current level should show buff selection
     * @returns {boolean}
     */
    shouldShowBuffSelection() {
        const gameData = Game.State.Manager.getData();
        const isBuffLevel = gameData.level % Game.CONSTANTS.BUFF_LEVEL_INTERVAL === 0;
        const hasAvailableBuffs = gameData.availableBuffs.length > 0;
        
        return isBuffLevel && hasAvailableBuffs;
    },
    
    /**
     * Handle buff selection
     * @param {string} buffId - Selected buff ID
     */
    selectBuff(buffId) {
        const gameData = Game.State.Manager.getData();
        const buff = gameData.availableBuffs.find(b => b.id === buffId);
        
        if (!buff) {
            console.warn(`⚠️ Buff not found: ${buffId}`);
            return;
        }
        
        // Map buff to internal type
        const internalType = Game.Themes.Manager.mapBuffToInternal(buffId);
        
        // Activate the buff
        Game.Player.Abilities.activateAbility(internalType, 1);
        
        // Remove from available buffs
        const newAvailableBuffs = gameData.availableBuffs.filter(b => b.id !== buffId);
        Game.State.Manager.updateData({
            availableBuffs: newAvailableBuffs
        });
        
        console.log(`🔥 Buff selected: ${buff.title}`);
    },
    
    /**
     * Get spawn configuration for current level
     * @returns {object} Spawn configuration
     */
    getSpawnConfig() {
        const gameData = Game.State.Manager.getData();
        const level = gameData.level;
        
        return {
            spawnRate: this.calculateSpawnRate(level),
            spawnChances: this.calculateSpawnChances(level),
            enemyHealth: this.calculateEnemyHealth(level),
            enemySpeed: this.calculateEnemySpeed(level)
        };
    },
    
    /**
     * Calculate spawn rate for level
     * @param {number} level - Current level
     * @returns {number} Spawn rate multiplier
     */
    calculateSpawnRate(level) {
        return Math.max(0.3, 1 - (level * 0.05));
    },
    
    /**
     * Calculate spawn chances for level
     * @param {number} level - Current level
     * @returns {object} Spawn chances
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
     * Calculate enemy health multiplier for level
     * @param {number} level - Current level
     * @returns {number} Health multiplier
     */
    calculateEnemyHealth(level) {
        return Math.floor(1 + (level * 0.2));
    },
    
    /**
     * Calculate enemy speed multiplier for level
     * @param {number} level - Current level
     * @returns {number} Speed multiplier
     */
    calculateEnemySpeed(level) {
        return 1 + (level * 0.1);
    },
    
    /**
     * Calculate spawn timer for obstacle type
     * @param {number} baseTimer - Base timer value
     * @param {number} minTimer - Minimum timer value
     * @param {number} level - Current level
     * @returns {number} Calculated spawn timer
     */
    calculateSpawnTimer(baseTimer, minTimer, level) {
        const maxReductionPercent = 0.65;
        const maxReduction = baseTimer * maxReductionPercent;
        
        const reductionProgress = 1 - Math.exp(-level * 0.25);
        const totalReduction = maxReduction * reductionProgress;
        
        const finalTimer = Math.floor(baseTimer - totalReduction);
        const effectiveMinTimer = Math.max(minTimer, Math.floor(baseTimer * 0.25));
        
        return Math.max(finalTimer, effectiveMinTimer);
    },
    
    /**
     * Get current buff status
     * @returns {object} Buff status
     */
    getBuffStatus() {
        const gameData = Game.State.Manager.getData();
        
        return {
            available: gameData.availableBuffs,
            active: gameData.activeBuffs,
            nextBuffLevel: Math.ceil(gameData.level / Game.CONSTANTS.BUFF_LEVEL_INTERVAL) * Game.CONSTANTS.BUFF_LEVEL_INTERVAL
        };
    },
    
    /**
     * Reset level system
     */
    reset() {
        this.resetAvailableBuffs();
        console.log('🔄 Level system reset');
    }
};