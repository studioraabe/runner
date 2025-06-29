/* ====================================
   SOUNDMANAGER.JS - Audio-System
   ==================================== */

// Sound Namespace
Game.Sound = Game.Sound || {};

/**
 * SoundManager - Web Audio API basiertes Sound-System
 */
window.soundManager = {
    // Audio context
    audioContext: null,
    isMuted: false,
    isInitialized: false,
    masterVolume: 0.1,
    
    // Sound configuration
    config: {
        maxOscillators: 10,
        defaultType: 'sine',
        fadeOutTime: 0.1
    },
    
    // Active oscillators tracking
    activeOscillators: new Set(),
    
    /**
     * Initialize audio context
     */
    init() {
        if (!this.isInitialized) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.isInitialized = true;
                console.log('🔊 Audio context initialized');
            } catch (error) {
                console.warn('⚠️ Audio context not supported:', error);
                this.isInitialized = false;
            }
        }
    },
    
    /**
     * Resume audio context (required for user interaction)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    },
    
    /**
     * Play a sound with given parameters
     * @param {number} frequency - Sound frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type (sine, square, triangle, sawtooth)
     * @param {number} volume - Volume (0-1)
     */
    play(frequency, duration, type = 'sine', volume = 1) {
        if (!this.audioContext || this.isMuted || !this.isInitialized) return;
        
        try {
            // Limit number of concurrent sounds
            if (this.activeOscillators.size >= this.config.maxOscillators) {
                return;
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Configure oscillator
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            // Configure gain (volume)
            const adjustedVolume = volume * this.masterVolume;
            gainNode.gain.setValueAtTime(adjustedVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            // Track oscillator
            this.activeOscillators.add(oscillator);
            
            // Clean up when finished
            oscillator.onended = () => {
                this.activeOscillators.delete(oscillator);
            };
            
            // Start and stop
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
        } catch (error) {
            console.warn('⚠️ Error playing sound:', error);
        }
    },
    
    /**
     * Play complex sound with multiple frequencies
     * @param {Array} frequencies - Array of frequency objects
     * @param {number} duration - Duration in seconds
     */
    playComplex(frequencies, duration) {
        if (!this.audioContext || this.isMuted) return;
        
        frequencies.forEach(freq => {
            this.play(freq.frequency, duration, freq.type || 'sine', freq.volume || 1);
        });
    },
    
    /**
     * Set master volume
     * @param {number} volume - Volume (0-1)
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    },
    
    /**
     * Toggle mute
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        // Update UI
        const muteIcon = document.getElementById('muteIcon');
        const muteButton = document.getElementById('muteButton');
        
        if (muteIcon && muteButton) {
            if (this.isMuted) {
                muteIcon.textContent = '🔇';
                muteButton.classList.add('muted');
            } else {
                muteIcon.textContent = '🔊';
                muteButton.classList.remove('muted');
            }
        }
        
        return this.isMuted;
    },
    
    /**
     * Stop all active sounds
     */
    stopAll() {
        this.activeOscillators.forEach(oscillator => {
            try {
                oscillator.stop();
            } catch (error) {
                // Oscillator might already be stopped
            }
        });
        this.activeOscillators.clear();
    },
    
    /**
     * Get audio context state
     * @returns {string} Audio context state
     */
    getState() {
        return this.audioContext ? this.audioContext.state : 'not initialized';
    }
};

/**
 * Sound Effects Library
 */
Game.Sound.Effects = {
    /**
     * Jump sound effect
     */
    jump() {
        window.soundManager.play(200, 0.2, 'square', 0.8);
    },
    
    /**
     * Shoot sound effect
     */
    shoot() {
        const theme = Game.Cache.ThemeCache.getTheme();
        
        if (theme.id === 'Dungeon') {
            // Lightning bolt effect
            window.soundManager.play(800, 0.05, 'sawtooth', 0.6);
            setTimeout(() => {
                window.soundManager.play(400, 0.05, 'sawtooth', 0.4);
            }, 50);
        } else {
            // Gunshot effect
            window.soundManager.play(600, 0.05, 'triangle', 0.7);
        }
    },
    
    /**
     * Hit/damage sound effect
     */
    hit() {
        window.soundManager.play(150, 0.2, 'triangle', 0.9);
    },
    
    /**
     * Death sound effect
     */
    death() {
        window.soundManager.play(100, 0.5, 'sawtooth', 1.0);
        setTimeout(() => {
            window.soundManager.play(80, 0.6, 'sawtooth', 0.8);
        }, 200);
    },
    
    /**
     * Power-up/buff sound effect
     */
    powerUp() {
        const frequencies = [
            { frequency: 220, volume: 0.5 },
            { frequency: 330, volume: 0.3 },
            { frequency: 440, volume: 0.2 }
        ];
        window.soundManager.playComplex(frequencies, 0.4);
    },
    
    /**
     * Level complete sound effect
     */
    levelComplete() {
        setTimeout(() => window.soundManager.play(262, 0.2, 'sine', 0.6), 0);   // C
        setTimeout(() => window.soundManager.play(330, 0.2, 'sine', 0.6), 200); // E
        setTimeout(() => window.soundManager.play(392, 0.2, 'sine', 0.6), 400); // G
        setTimeout(() => window.soundManager.play(523, 0.4, 'sine', 0.8), 600); // C (higher)
    },
    
    /**
     * Game over sound effect
     */
    gameOver() {
        setTimeout(() => window.soundManager.play(220, 0.3, 'sawtooth', 0.8), 0);
        setTimeout(() => window.soundManager.play(196, 0.3, 'sawtooth', 0.7), 300);
        setTimeout(() => window.soundManager.play(174, 0.3, 'sawtooth', 0.6), 600);
        setTimeout(() => window.soundManager.play(146, 0.5, 'sawtooth', 0.5), 900);
    },
    
    /**
     * Menu select sound effect
     */
    menuSelect() {
        window.soundManager.play(440, 0.1, 'sine', 0.3);
    },
    
    /**
     * Menu hover sound effect
     */
    menuHover() {
        window.soundManager.play(880, 0.05, 'sine', 0.2);
    },
    
    /**
     * Collect item sound effect
     */
    collect() {
        window.soundManager.play(523, 0.15, 'triangle', 0.5);
        setTimeout(() => {
            window.soundManager.play(659, 0.15, 'triangle', 0.4);
        }, 100);
    },
    
    /**
     * Boss spawn sound effect
     */
    bossSpawn() {
        const frequencies = [
            { frequency: 80, type: 'sawtooth', volume: 0.8 },
            { frequency: 120, type: 'sawtooth', volume: 0.6 },
            { frequency: 160, type: 'square', volume: 0.4 }
        ];
        window.soundManager.playComplex(frequencies, 1.0);
    }
};

/**
 * Sound Sequence Player - For complex sound sequences
 */
Game.Sound.Sequencer = {
    activeSequences: new Map(),
    
    /**
     * Play a sequence of sounds
     * @param {string} id - Sequence ID
     * @param {Array} sequence - Array of sound objects with timing
     */
    playSequence(id, sequence) {
        // Stop existing sequence with same ID
        this.stopSequence(id);
        
        const timeouts = [];
        
        sequence.forEach(sound => {
            const timeout = setTimeout(() => {
                window.soundManager.play(
                    sound.frequency,
                    sound.duration,
                    sound.type || 'sine',
                    sound.volume || 1
                );
            }, sound.delay || 0);
            
            timeouts.push(timeout);
        });
        
        this.activeSequences.set(id, timeouts);
        
        // Clean up after sequence completes
        const maxDelay = Math.max(...sequence.map(s => (s.delay || 0) + (s.duration || 0) * 1000));
        setTimeout(() => {
            this.activeSequences.delete(id);
        }, maxDelay + 100);
    },
    
    /**
     * Stop a sequence
     * @param {string} id - Sequence ID
     */
    stopSequence(id) {
        const timeouts = this.activeSequences.get(id);
        if (timeouts) {
            timeouts.forEach(timeout => clearTimeout(timeout));
            this.activeSequences.delete(id);
        }
    },
    
    /**
     * Stop all sequences
     */
    stopAllSequences() {
        this.activeSequences.forEach((timeouts, id) => {
            this.stopSequence(id);
        });
    }
};

/**
 * Initialize sound system
 */
Game.Sound.init = function() {
    console.log('🎵 Sound system initialized');
    
    // Set up global references for backward compatibility
    window.soundManager = window.soundManager;
    
    // Initialize audio context on first user interaction
    const initOnInteraction = () => {
        window.soundManager.init();
        window.soundManager.resume();
        
        // Remove event listeners after first interaction
        document.removeEventListener('click', initOnInteraction);
        document.removeEventListener('keydown', initOnInteraction);
        document.removeEventListener('touchstart', initOnInteraction);
    };
    
    // Listen for user interaction
    document.addEventListener('click', initOnInteraction);
    document.addEventListener('keydown', initOnInteraction);
    document.addEventListener('touchstart', initOnInteraction);
    
    return true;
};

// Global sound functions for backward compatibility
Game.toggleMute = function() {
    return window.soundManager.toggleMute();
};

// Auto-initialize
Game.Sound.init();