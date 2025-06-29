/* ====================================
   PLAYERRENDERER.JS - Player-Zeichnung
   ==================================== */

// Player Renderer Namespace
Game.Rendering.PlayerRenderer = {
    /**
     * Draw player based on current theme
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} facingLeft - Whether player is facing left
     * @param {boolean} isDead - Whether player is dead
     */
    draw(x, y, facingLeft = false, isDead = false) {
        const ctx = Game.Rendering.Renderer.ctx;
        const gameData = Game.State.Manager.getData();
        
        // Check for invulnerability blinking
        if (this.shouldBlink()) return;
        
        const theme = Game.Cache.ThemeCache.getTheme();
        
        if (theme.id === 'cowboy') {
            this.drawCowboy(ctx, x, y, facingLeft, isDead);
        } else {
            this.drawDungeon(ctx, x, y, facingLeft, isDead);
        }
    },
    
    /**
     * Check if player should blink due to invulnerability
     * @returns {boolean} Whether to skip drawing
     */
    shouldBlink() {
        const gameData = Game.State.Manager.getData();
        const player = Game.State.Player;
        
        const isInvulnerable = gameData.postBuffInvulnerability > 0 || 
                              gameData.postDamageInvulnerability > 0;
        
        if (isInvulnerable) {
            const blinkFrequency = 8;
            const activeInvulnerability = Math.max(
                gameData.postBuffInvulnerability, 
                gameData.postDamageInvulnerability
            );
            
            return Math.floor(activeInvulnerability / blinkFrequency) % 2 === 0;
        }
        
        return false;
    },
    
    /**
     * Draw cowboy player
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} facingLeft - Facing direction
     * @param {boolean} isDead - Death state
     */
    drawCowboy(ctx, x, y, facingLeft = false, isDead = false) {
        ctx.save();
        
        if (facingLeft) {
            ctx.scale(-1, 1);
            x = -x - Game.State.Player.properties.width;
        }
        
        // Classic Cowboy Hat with curved brim and proper crown
        ctx.fillStyle = '#654321'; // Dark brown leather
        
        // Hat brim (curved/upturned at sides)
        ctx.fillRect(x + 2, y + 8, 36, 4); // Main brim
        ctx.fillRect(x + 4, y + 6, 4, 4); // Left brim upturn
        ctx.fillRect(x + 32, y + 6, 4, 4); // Right brim upturn
        ctx.fillRect(x + 6, y + 4, 2, 4); // Left brim curve
        ctx.fillRect(x + 32, y + 4, 2, 4); // Right brim curve
        
        // Hat crown (main body)
        ctx.fillStyle = '#8B4513'; // Lighter brown for crown
        ctx.fillRect(x + 10, y - 2, 20, 12); // Main crown body
        ctx.fillRect(x + 12, y - 4, 16, 8); // Crown top
        
        // Crown shaping (classic cowboy indentations)
        ctx.fillStyle = '#654321'; // Shadow/indent color
        ctx.fillRect(x + 15, y - 3, 3, 8); // Left front crease
        ctx.fillRect(x + 22, y - 3, 3, 8); // Right front crease
        ctx.fillRect(x + 18, y - 4, 4, 6); // Center front dip
        
        // Hat band
        ctx.fillStyle = '#2F1B14'; // Dark leather band
        ctx.fillRect(x + 9, y + 8, 22, 3);
        
        // Hat band decoration (simple metal ring)
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + 19, y + 8, 2, 3);
        
        // Head
        ctx.fillStyle = '#FDBCB4';
        ctx.fillRect(x + 12, y + 12, 16, 16);
        
        // Eyes
        ctx.fillStyle = isDead ? '#FF0000' : '#000';
        ctx.fillRect(x + 16, y + 16, 2, 2);
        ctx.fillRect(x + 22, y + 16, 2, 2);
        
        // Mustache (classic cowboy feature)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 17, y + 21, 6, 2);
        ctx.fillRect(x + 16, y + 22, 2, 1);
        ctx.fillRect(x + 22, y + 22, 2, 1);
        
        // Body (beige/tan color)
        ctx.fillStyle = '#F5DEB3';
        ctx.fillRect(x + 10, y + 28, 20, 20);
        
        // Sheriff badge
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 18, y + 32, 4, 4);
        ctx.fillStyle = '#B8860B';
        ctx.fillRect(x + 18, y + 32, 4, 4);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 19, y + 33, 2, 2);
        
        // Enhanced belt with buckle
        ctx.fillStyle = '#8B4513'; // Brown leather belt
        ctx.fillRect(x + 8, y + 44, 24, 4);
        
        // Belt buckle
        ctx.fillStyle = '#C0C0C0'; // Silver buckle
        ctx.fillRect(x + 17, y + 43, 6, 6);
        ctx.fillStyle = '#FFD700'; // Gold accent
        ctx.fillRect(x + 18, y + 44, 4, 4);
        ctx.fillStyle = '#8B4513'; // Buckle center hole
        ctx.fillRect(x + 19, y + 45, 2, 2);
        
        // Belt studs/decoration
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + 12, y + 45, 1, 2);
        ctx.fillRect(x + 27, y + 45, 1, 2);
        
        // Arms (beige/tan color)
        ctx.fillStyle = '#F5DEB3';
        ctx.fillRect(x + 6, y + 30, 6, 12);
        ctx.fillRect(x + 28, y + 30, 6, 12);
        
        // Legs (blue jeans)
        ctx.fillStyle = '#4169E1'; // Blue jeans
        ctx.fillRect(x + 14, y + 48, 6, 10);
        ctx.fillRect(x + 20, y + 48, 6, 10);
        
        // Enhanced cowboy boots (brown)
        ctx.fillStyle = '#8B4513'; // Brown leather boots
        ctx.fillRect(x + 12, y + 58, 10, 6);
        ctx.fillRect(x + 18, y + 58, 10, 6);
        
        // Boot heels
        ctx.fillStyle = '#654321'; // Darker brown for heels
        ctx.fillRect(x + 12, y + 62, 10, 2);
        ctx.fillRect(x + 18, y + 62, 10, 2);
        
        // Boot spurs
        ctx.fillStyle = '#C0C0C0'; // Silver spurs
        ctx.fillRect(x + 10, y + 62, 2, 2);
        ctx.fillRect(x + 28, y + 62, 2, 2);
        
        // Boot stitching details
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(x + 14, y + 60, 6, 1);
        ctx.fillRect(x + 20, y + 60, 6, 1);
        
        // Boot toe caps
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 12, y + 58, 3, 3);
        ctx.fillRect(x + 25, y + 58, 3, 3);

        // Gun
        const gameData = Game.State.Manager.getData();
        if (gameData.bullets > 0) {
            ctx.fillStyle = gameData.activeBuffs.multiShot > 0 ? '#FF4500' : '#d9d9d9';
            ctx.fillRect(x + 34, y + 34, 12, 3);
            ctx.fillRect(x + 30, y + 36, 6, 8);
            ctx.fillStyle = '#1A1A1A';
            ctx.fillRect(x + 32, y + 39, 2, 3);
            
            if (gameData.activeBuffs.multiShot > 0) {
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 35, y + 33, 10, 1);
                ctx.fillRect(x + 35, y + 37, 10, 1);
            }
        }
        
        ctx.restore();
    },
    
    /**
     * Draw dungeon player (Frankenstein-like)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} facingLeft - Facing direction
     * @param {boolean} isDead - Death state
     */
    drawDungeon(ctx, x, y, facingLeft = false, isDead = false) {
        ctx.save();
        
        if (facingLeft) {
            ctx.scale(-1, 1);
            x = -x - Game.State.Player.properties.width;
        }
        
        // Enhanced flat-top head (classic Frankenstein)
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(x + 8, y + 6, 24, 18); // Main head
        ctx.fillRect(x + 6, y + 6, 28, 4);  // Flat top forehead extension
        
        // Forehead scar (horizontal across top)
        ctx.fillStyle = '#228B22'; // Darker green for scars
        ctx.fillRect(x + 10, y + 8, 20, 1);
        ctx.fillStyle = '#000000'; // Black stitching dots
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(x + 12 + i * 3, y + 7, 1, 1);
            ctx.fillRect(x + 12 + i * 3, y + 9, 1, 1);
        }
        
        // Enhanced neck bolts with electrical sparks
        const gameData = Game.State.Manager.getData();
        const boltGlow = 0.7 + Math.sin(Date.now() * 0.008) * 0.3;
        ctx.fillStyle = '#C0C0C0'; // Silver bolts
        ctx.fillRect(x + 2, y + 16, 6, 3); // Left bolt - larger
        ctx.fillRect(x + 32, y + 16, 6, 3); // Right bolt - larger
        
        // Bolt cores (darker)
        ctx.fillStyle = '#696969';
        ctx.fillRect(x + 3, y + 16, 4, 3);
        ctx.fillRect(x + 33, y + 16, 4, 3);
        
        // Electrical sparks around bolts
        if (gameData.bullets > 0 || Math.random() > 0.7) {
            ctx.fillStyle = `rgba(0, 255, 255, ${boltGlow})`;
            // Left bolt sparks
            ctx.fillRect(x + 1, y + 15, 1, 1);
            ctx.fillRect(x + 0, y + 18, 1, 1);
            ctx.fillRect(x + 4, y + 14, 1, 1);
            // Right bolt sparks  
            ctx.fillRect(x + 37, y + 15, 1, 1);
            ctx.fillRect(x + 38, y + 18, 1, 1);
            ctx.fillRect(x + 35, y + 14, 1, 1);
        }
        
        // Dark, wild hair
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 4, y, 32, 8); // Main hair mass
        // Hair spikes/wild strands
        ctx.fillRect(x + 2, y + 2, 3, 4);
        ctx.fillRect(x + 35, y + 1, 3, 5);
        ctx.fillRect(x + 12, y - 1, 2, 3);
        ctx.fillRect(x + 26, y - 1, 2, 3);
        
        // Eyes with more character
        if (isDead) {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(x + 14, y + 12, 3, 3); // Larger dead eyes
            ctx.fillRect(x + 23, y + 12, 3, 3);
            // X marks for dead eyes
            ctx.fillStyle = '#000000';
            ctx.fillRect(x + 14, y + 12, 1, 1);
            ctx.fillRect(x + 16, y + 14, 1, 1);
            ctx.fillRect(x + 16, y + 12, 1, 1);
            ctx.fillRect(x + 14, y + 14, 1, 1);
            ctx.fillRect(x + 23, y + 12, 1, 1);
            ctx.fillRect(x + 25, y + 14, 1, 1);
            ctx.fillRect(x + 25, y + 12, 1, 1);
            ctx.fillRect(x + 23, y + 14, 1, 1);
        } else {
            ctx.fillStyle = '#FFFF00'; // Glowing yellow eyes
            ctx.fillRect(x + 14, y + 12, 3, 3);
            ctx.fillRect(x + 23, y + 12, 3, 3);
            // Eye glow effect
            const eyeGlow = 0.5 + Math.sin(Date.now() * 0.006) * 0.3;
            ctx.fillStyle = `rgba(255, 255, 0, ${eyeGlow})`;
            ctx.fillRect(x + 13, y + 11, 5, 5);
            ctx.fillRect(x + 22, y + 11, 5, 5);
        }
        
        // Mouth with stitches
        ctx.fillStyle = '#228B22'; // Dark green mouth
        ctx.fillRect(x + 17, y + 19, 6, 2);
        // Mouth stitches
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x + 17 + i * 1.5, y + 18, 1, 1);
            ctx.fillRect(x + 17 + i * 1.5, y + 21, 1, 1);
        }
        
        // Face scars and stitching
        ctx.fillStyle = '#228B22';
        // Vertical scar on left cheek
        ctx.fillRect(x + 12, y + 14, 1, 6);
        // Diagonal scar on right cheek  
        ctx.fillRect(x + 27, y + 16, 1, 1);
        ctx.fillRect(x + 28, y + 17, 1, 1);
        ctx.fillRect(x + 29, y + 18, 1, 1);
        
        // Stitching dots for face scars
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 11, y + 15, 1, 1);
        ctx.fillRect(x + 13, y + 15, 1, 1);
        ctx.fillRect(x + 11, y + 18, 1, 1);
        ctx.fillRect(x + 13, y + 18, 1, 1);
        
        // Enhanced body with torn laboratory coat
        // Base body (green skin showing through tears)
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(x + 8, y + 24, 24, 24);
        
        // Torn laboratory coat/vest
        ctx.fillStyle = '#2F4F4F'; // Dark lab coat
        ctx.fillRect(x + 6, y + 26, 28, 20); // Main coat
        // Coat tears and patches
        ctx.fillStyle = '#90EE90'; // Skin showing through
        ctx.fillRect(x + 12, y + 30, 4, 6); // Left tear
        ctx.fillRect(x + 24, y + 35, 3, 4); // Right tear
        ctx.fillRect(x + 18, y + 28, 2, 8); // Center tear
        
        // Coat buttons (remaining ones)
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + 19, y + 29, 2, 2);
        ctx.fillRect(x + 19, y + 39, 2, 2);
        // Missing button (torn off)
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(x + 19, y + 34, 2, 1); // Button hole
        
        // Body stitching and scars
        ctx.fillStyle = '#228B22';
        // Horizontal chest scar
        ctx.fillRect(x + 10, y + 32, 20, 1);
        // Vertical torso scar
        ctx.fillRect(x + 20, y + 26, 1, 15);
        
        // Body stitching dots
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 8; i++) {
            // Chest stitches
            ctx.fillRect(x + 11 + i * 2.5, y + 31, 1, 1);
            ctx.fillRect(x + 11 + i * 2.5, y + 33, 1, 1);
        }
        for (let i = 0; i < 6; i++) {
            // Vertical stitches
            ctx.fillRect(x + 19, y + 27 + i * 2.5, 1, 1);
            ctx.fillRect(x + 21, y + 27 + i * 2.5, 1, 1);
        }
        
        // Enhanced arms with patches and stitching
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(x + 2, y + 28, 8, 16); // Left arm
        ctx.fillRect(x + 30, y + 28, 8, 16); // Right arm
        
        // Arm patches (different colored skin grafts)
        ctx.fillStyle = '#7CCD7C'; // Slightly different green
        ctx.fillRect(x + 3, y + 30, 3, 4); // Left arm patch
        ctx.fillRect(x + 32, y + 35, 3, 3); // Right arm patch
        
        // Arm stitching
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x + 3, y + 34, 6, 1); // Left arm horizontal scar
        ctx.fillRect(x + 31, y + 38, 6, 1); // Right arm horizontal scar
        
        // Arm stitching dots
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x + 3 + i * 1.5, y + 33, 1, 1);
            ctx.fillRect(x + 3 + i * 1.5, y + 35, 1, 1);
            ctx.fillRect(x + 31 + i * 1.5, y + 37, 1, 1);
            ctx.fillRect(x + 31 + i * 1.5, y + 39, 1, 1);
        }
        
        // Enhanced legs
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(x + 12, y + 48, 6, 14);
        ctx.fillRect(x + 22, y + 48, 6, 14);
        
        // Enhanced hand energy effect when has bullets
        if (gameData.bullets > 0) {
            const energyPulse = 0.6 + Math.sin(Date.now() * 0.01) * 0.4;
            
            // Energy glow around hand
            ctx.fillStyle = `rgba(0, 255, 255, ${energyPulse * 0.3})`;
            ctx.fillRect(x + 32, y + 28, 12, 12);
            
            // Energy core in palm
            ctx.fillStyle = gameData.activeBuffs.multiShot > 0 ? '#FF4500' : '#00FFFF';
            ctx.fillRect(x + 35, y + 31, 6, 6);
            
            // Energy crackling effect
            if (gameData.activeBuffs.multiShot > 0) {
                ctx.fillStyle = `rgba(255, 215, 0, ${energyPulse})`;
                ctx.fillRect(x + 33, y + 29, 2, 2);
                ctx.fillRect(x + 39, y + 35, 2, 2);
                ctx.fillRect(x + 36, y + 27, 1, 1);
            }
            
            // Energy sparks
            const sparkX = x + 37 + Math.sin(Date.now() * 0.02) * 2;
            const sparkY = y + 33 + Math.cos(Date.now() * 0.015) * 2;
            ctx.fillStyle = `rgba(255, 255, 255, ${energyPulse})`;
            ctx.fillRect(sparkX, sparkY, 1, 1);
        }
        
        ctx.restore();
    },
    
    /**
     * Draw player aura effect (for buffs)
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    drawPlayerAura(x, y) {
        const ctx = Game.Rendering.Renderer.ctx;
        const gameData = Game.State.Manager.getData();
        const theme = Game.Cache.ThemeCache.getTheme();
        
        // Draw aura for active buffs
        if (Object.keys(gameData.activeBuffs).length > 0) {
            const auraTime = Date.now() * 0.005;
            const auraIntensity = 0.3 + Math.sin(auraTime) * 0.2;
            
            // Determine aura color based on theme
            const auraColor = theme.id === 'cowboy' ? 
                `rgba(255, 215, 0, ${auraIntensity})` : 
                `rgba(138, 43, 226, ${auraIntensity})`;
            
            ctx.save();
            
            // Create circular aura
            const auraRadius = 30 + Math.sin(auraTime * 2) * 5;
            const gradient = ctx.createRadialGradient(
                x + Game.State.Player.properties.width / 2, 
                y + Game.State.Player.properties.height / 2, 
                0,
                x + Game.State.Player.properties.width / 2, 
                y + Game.State.Player.properties.height / 2, 
                auraRadius
            );
            
            gradient.addColorStop(0, auraColor);
            gradient.addColorStop(0.7, `rgba(255, 255, 255, ${auraIntensity * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(
                x - auraRadius + Game.State.Player.properties.width / 2, 
                y - auraRadius + Game.State.Player.properties.height / 2, 
                auraRadius * 2, 
                auraRadius * 2
            );
            
            ctx.restore();
        }
    },
    
    /**
     * Draw player movement trail
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    drawMovementTrail(x, y) {
        const player = Game.State.Player;
        
        // Only draw trail if player is moving fast
        if (Math.abs(player.velocity.x) > 2 || Math.abs(player.velocity.y) > 3) {
            const ctx = Game.Rendering.Renderer.ctx;
            const theme = Game.Cache.ThemeCache.getTheme();
            
            const trailColor = theme.id === 'cowboy' ? 
                'rgba(210, 180, 140, 0.3)' : 
                'rgba(138, 43, 226, 0.3)';
            
            ctx.save();
            ctx.fillStyle = trailColor;
            
            // Draw simple trail rectangles behind player
            for (let i = 1; i <= 3; i++) {
                const trailX = x - (player.velocity.x * i * 2);
                const trailY = y - (player.velocity.y * i);
                const alpha = 0.3 - (i * 0.1);
                
                ctx.globalAlpha = alpha;
                ctx.fillRect(
                    trailX + 5, 
                    trailY + 5, 
                    Game.State.Player.properties.width - 10, 
                    Game.State.Player.properties.height - 10
                );
            }
            
            ctx.restore();
        }
    },
    
    /**
     * Draw player with all effects
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} facingLeft - Facing direction
     * @param {boolean} isDead - Death state
     */
    drawWithEffects(x, y, facingLeft = false, isDead = false) {
        // Draw movement trail first (behind player)
        this.drawMovementTrail(x, y);
        
        // Draw aura effect (behind player)
        this.drawPlayerAura(x, y);
        
        // Draw main player
        this.draw(x, y, facingLeft, isDead);
    }
};

/**
 * Initialize Player Renderer
 */
Game.Rendering.PlayerRenderer.init = function() {
    console.log('🏃 Player renderer initialized');
    return true;
};

// Auto-initialize
Game.Rendering.PlayerRenderer.init();