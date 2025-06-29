// js/core/GameCache.js - Vollständig korrigierte Version
class GameCache {
    constructor(gameState = null) {
        this.themeCache = null;
        this.currentThemeName = null;
        this.gameState = gameState;
        this.cache = new Map();
        this.maxCacheSize = 100;
        this.defaultTTL = 60000;
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };
        
        console.log('💾 Cache system initialized');
        console.log('📊 Max cache size:', this.maxCacheSize);
        console.log('⏱️ Default TTL:', this.defaultTTL + 'ms');
        
        // Theme-Definitionen direkt eingebaut für Robustheit
        this.themes = {
            cowboy: {
                name: 'Desert Cowboy',
                title: '🤠 Desert Cowboy Runner',
                labels: {
                    score: 'Score',
                    level: 'Level', 
                    bullets: 'Bullets',
                    lives: 'Lives',
                    highScore: 'High Score',
                    enemies: 'Enemies',
                    gameOver: '💀 Game Over! 💀',
                    finalScore: 'Final Score'
                },
                buffs: [
                    { id: 'multiShot', title: '🔥 Multi-Shot', desc: 'Fire 3 bullets at once and deal extra damage per shot' },
                    { id: 'toughHide', title: '❤️ Tough Hide', desc: 'Gain extra life every 10 (15) bullet hits' },
                    { id: 'doubleJump', title: '🦅 Sky Walker', desc: 'Unlock double jump ability and increased mobility' }
                ],
                enemies: ['cactus', 'rock', 'vulture', 'bull', 'boss', 'prisoner', 'bulletBox'],
                groundColor: '#A17F53',
                floorDetailColor: '#D2B48C',
                startButton: 'Start Adventure'
            },
            Dungeon: {
                name: 'Dungeon\'s Escape',
                title: '⚡ Dungeon\'s Escape',
                labels: {
                    score: 'Souls',
                    level: 'Floor',
                    bullets: 'Bolts',
                    lives: 'Lives',
                    highScore: 'High Score',
                    enemies: 'Monsters',
                    gameOver: '💀 Final Death! 💀',
                    finalScore: 'Final Souls'
                },
                buffs: [
                    { id: 'chainLightning', title: '⚡ Chain Lightning', desc: 'Unleash 3 bolts at once that arc between enemies' },
                    { id: 'undeadResilience', title: '🧟 Undead Vigor', desc: 'Gain extra life every 10 (15) bullet hits' },
                    { id: 'shadowLeap', title: '🌙 Shadow Leap', desc: 'Unlock double jump with ethereal shadow form' }
                ],
                enemies: ['bat', 'vampire', 'spider', 'alphaWolf', 'skeleton', 'boltBox'],
                groundColor: '#2F2F2F',
                floorDetailColor: '#1A1A1A',
                startButton: 'Begin Nightmare'
            }
        };
        
        // Performance monitoring - ohne Game.Manager Abhängigkeit
        this.initPerformanceMonitoring();
    }

    // Setter für GameState (wird von main.js aufgerufen)
    setGameState(gameState) {
        this.gameState = gameState;
    }

    // Sichere Theme-Abfrage mit mehreren Fallbacks
    getCurrentTheme() {
        // 1. Versuch: GameState verwenden
        if (this.gameState && typeof this.gameState.getCurrentTheme === 'function') {
            try {
                return this.gameState.getCurrentTheme();
            } catch (e) {
                console.warn('GameState.getCurrentTheme() failed:', e);
            }
        }
        
        // 2. Versuch: Globale Variable
        if (typeof window !== 'undefined' && window.currentTheme) {
            return window.currentTheme;
        }
        
        // 3. Versuch: Legacy currentTheme Variable
        if (typeof currentTheme !== 'undefined') {
            return currentTheme;
        }
        
        // 4. Ultimate Fallback
        return 'cowboy';
    }

    // Hauptmethode für Theme-Abruf
    getTheme(themeName = null) {
        // Sichere Theme-Abfrage mit mehreren Fallbacks
        let themeToGet = themeName;
        
        if (!themeToGet) {
            themeToGet = this.getCurrentTheme();
        }
        
        // Cache-Check
        if (this.currentThemeName !== themeToGet) {
            this.currentThemeName = themeToGet;
            this.themeCache = this.themes[themeToGet] || this.themes.cowboy;
            this.stats.misses++;
        } else {
            this.stats.hits++;
        }
        
        return this.themeCache;
    }

    // Cache-Management Methoden
    set(key, value, ttl = this.defaultTTL) {
        if (this.cache.size >= this.maxCacheSize) {
            this.evictOldest();
        }
        
        const item = {
            value: value,
            expires: Date.now() + ttl,
            created: Date.now()
        };
        
        this.cache.set(key, item);
        this.stats.sets++;
    }

    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            this.stats.misses++;
            return null;
        }
        
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }
        
        this.stats.hits++;
        return item.value;
    }

    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.stats.deletes++;
        }
        return deleted;
    }

    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.stats.deletes += size;
    }

    // Cache-Wartung
    evictOldest() {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
            this.cache.delete(firstKey);
            this.stats.deletes++;
        }
    }

    cleanup() {
        const now = Date.now();
        let expiredCount = 0;
        
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expires) {
                this.cache.delete(key);
                expiredCount++;
            }
        }
        
        if (expiredCount > 0) {
            this.stats.deletes += expiredCount;
            console.log(`🧹 Cache cleanup: ${expiredCount} expired items removed`);
        }
    }

    // Performance-Monitoring ohne Game.Manager Abhängigkeit
    initPerformanceMonitoring() {
        // Cleanup-Zyklus
        setInterval(() => {
            this.cleanup();
            // Entfernt: Game.Manager.performance.log() - ersetzt durch lokales Logging
            this.logPerformance();
        }, this.defaultTTL);
    }

    logPerformance() {
        const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) * 100 || 0;
        console.log(`📊 Cache Stats - Hit Rate: ${hitRate.toFixed(1)}%, Size: ${this.cache.size}/${this.maxCacheSize}`);
    }

    // Legacy-Kompatibilität
    invalidate() {
        this.themeCache = null;
        this.currentThemeName = null;
        this.clear();
    }

    // Theme-Management Methoden
    updateTheme(themeName) {
        this.currentThemeName = themeName;
        this.themeCache = this.themes[themeName] || this.themes.cowboy;
        return this.themeCache;
    }

    // Hilfsmethoden
    getThemeNames() {
        return Object.keys(this.themes);
    }

    hasTheme(themeName) {
        return this.themes.hasOwnProperty(themeName);
    }

    getDefaultTheme() {
        return this.themes.cowboy;
    }

    // Statistics
    getStats() {
        const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) * 100 || 0;
        return {
            ...this.stats,
            hitRate: hitRate,
            size: this.cache.size,
            maxSize: this.maxCacheSize
        };
    }

    // Debugging
    debug() {
        console.group('🔍 GameCache Debug Info');
        console.log('Current Theme:', this.currentThemeName);
        console.log('Cache Size:', this.cache.size);
        console.log('Stats:', this.getStats());
        console.log('Available Themes:', this.getThemeNames());
        console.groupEnd();
    }
}