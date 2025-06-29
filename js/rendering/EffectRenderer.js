/* ====================================
   EFFECTRENDERER.JS - Effekt-Zeichnung
   ==================================== */

// Effect Renderer Namespace
Game.Rendering.EffectRenderer = {
    /**
     * Draw bullet
     * @param {object} bullet - Bullet object
     */
    drawBullet(bullet) {
        const ctx = Game.Rendering.Renderer.ctx;
        const theme = Game.Cache.ThemeCache.getTheme();
        
        if (theme.id === 'cowboy') {
            this.drawCowboyBullet(ctx, bullet);
        } else {
            this.drawDungeonBullet(ctx, bullet);
        }
    },
    
    /**
     * Draw cowboy bullet
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {object} bullet - Bullet object
     */
    drawCowboyBullet(ctx, bullet) {
        // Main bullet body
        ctx.fillStyle = bullet.enhanced ? '#FF4500' : '#FFD700';
        ctx.fillRect(bullet.x, bullet.y, 8, 4);
        
        // Enhanced bullet effects
        if (bullet.enhanced) {
            // Fire trail effect
            const trailAlpha = 0.6 + Math.sin((bullet.trailPhase || 0)) * 0.3;
            ctx.fillStyle = `rgba(255, 69, 0, ${trailAlpha})`;
            ctx.fillRect(bullet.x - 2, bullet.y - 1, 4, 6);
            
            // Sparks
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(bullet.x - 1, bullet.y + 1, 1, 1);
            ctx.fillRect(bullet.x - 1, bullet.y + 3, 1, 1);
        }
        
        // Bullet tip
        ctx.fillStyle = '#B8860B';
        ctx.fillRect(bullet.x + 6, bullet.y + 1, 2, 2);
    },
    
    /**
     * Draw dungeon bullet (shadow energy)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {object} bullet - Bullet object
     */
    drawDungeonBullet(ctx, bullet) {
        // Shadow energy bullets - match hand energy core colors
        const baseColor = bullet.enhanced ? '#FF4500' : '#00FFFF';
        ctx.fillStyle = baseColor;
        ctx.fillRect(bullet.x, bullet.y, 8, 2);
        ctx.fillRect(bullet.x + 2, bullet.y - 1, 4, 4);
        
        // Add energy glow effect
        const glowAlpha = bullet.glowIntensity || (0.4 + Math.sin(Date.now() * 0.02 + bullet.x * 0.1) * 0.2);
        const glowColor = bullet.enhanced ? `rgba(255, 69, 0, ${glowAlpha})` : `rgba(0, 255, 255, ${glowAlpha})`;
        ctx.fillStyle = glowColor;
        ctx.fillRect(bullet.x - 1, bullet.y - 1, 10, 4);
        
        // Energy core
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(bullet.x + 3, bullet.y, 2, 2);
        
        // Chain lightning effect for enhanced bullets
        if (bullet.enhanced && bullet.type === 'chainLightning') {
            const arcIntensity = bullet.arcIntensity || 0.5;
            ctx.strokeStyle = `rgba(255, 255, 0, ${arcIntensity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bullet.x, bullet.y);
            ctx.lineTo(bullet.x + 8 + Math.sin(Date.now() * 0.02) * 2, bullet.y + 2);
            ctx.stroke();
        }
    },
    
    /**
     * Draw explosion
     * @param {object} explosion - Explosion object
     */
    drawExplosion(explosion) {
        const ctx = Game.Rendering.Renderer.ctx;
        const theme = Game.Cache.ThemeCache.getTheme();
        
        const colors = theme.id === 'Dungeon' ? 
            ['#00FFFF', '#87CEEB', '#FFFF00', '#FF4500'] :
            ['#FF4500', '#FF6347', '#FFD700', '#FFA500'];
        
        const maxFrame = Game.ANIMATION_CONFIG.EXPLOSION_FRAMES;
        const size = (explosion.frame / maxFrame) * 20 + 10;
        const intensity = (explosion.intensity || 1) * (1 - explosion.frame / maxFrame);
        
        ctx.fillStyle = colors[Math.floor(explosion.frame / 4) % colors.length];
        
        // Draw explosion particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particleSize = size * intensity;
            const particleX = explosion.x + Math.cos(angle) * particleSize;
            const particleY = explosion.y + Math.sin(angle) * particleSize;
            
            ctx.fillRect(particleX, particleY, 4 * intensity, 4 * intensity);
        }
        
        // Central flash
        ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
        ctx.fillRect(explosion.x - 2, explosion.y - 2, 4, 4);
    },
    
    /**
     * Draw blood particle
     * @param {object} particle - Blood particle object
     */
    drawBloodParticle(particle) {
        const ctx = Game.Rendering.Renderer.ctx;
        const alpha = particle.life / particle.maxLife;
        
        ctx.fillStyle = `rgba(139, 0, 0, ${alpha})`;
        const size = particle.size || 3;
        ctx.fillRect(particle.x, particle.y, size, size);
        
        // Add some variation to blood particles
        if (alpha > 0.5) {
            ctx.fillStyle = `rgba(180, 0, 0, ${alpha * 0.7})`;
            ctx.fillRect(particle.x + 1, particle.y + 1, Math.max(1, size - 1), Math.max(1, size - 1));
        }
    },
    
    /**
     * Draw lightning effect
     * @param {object} effect - Lightning effect object
     */
    drawLightningEffect(effect) {
        const ctx = Game.Rendering.Renderer.ctx;
        const alpha = effect.life / effect.maxLife;
        const intensity = effect.intensity || 1;
        
        if (effect.isChain) {
            // Chain lightning between two points
            this.drawChainLightning(ctx, effect, alpha);
        } else {
            // Standard lightning effect
            this.drawStandardLightning(ctx, effect, alpha, intensity);
        }
    },
    
    /**
     * Draw chain lightning
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {object} effect - Lightning effect
     * @param {number} alpha - Transparency
     */
    drawChainLightning(ctx, effect, alpha) {
        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(effect.startX, effect.startY);
        
        // Add some randomness to the chain path
        const midX = (effect.startX + effect.endX) / 2 + (Math.random() - 0.5) * 20;
        const midY = (effect.startY + effect.endY) / 2 + (Math.random() - 0.5) * 20;
        
        ctx.quadraticCurveTo(midX, midY, effect.endX, effect.endY);
        ctx.stroke();
        
        // Add glow effect
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    },
    
    /**
     * Draw standard lightning
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {object} effect - Lightning effect
     * @param {number} alpha - Transparency
     * @param {number} intensity - Effect intensity
     */
    drawStandardLightning(ctx, effect, alpha, intensity) {
        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * intensity})`;
        ctx.lineWidth = 2;
        
        const branches = effect.branches || 3;
        
        for (let i = 0; i < branches; i++) {
            ctx.beginPath();
            ctx.moveTo(effect.x, effect.y);
            
            // Create branching lightning
            const angle = (i / branches) * Math.PI * 2;
            const length = 20 + Math.random() * 20;
            const endX = effect.x + Math.cos(angle) * length + (Math.random() - 0.5) * 10;
            const endY = effect.y + Math.sin(angle) * length + (Math.random() - 0.5) * 10;
            
            // Add jagged path
            const segments = 3;
            let currentX = effect.x;
            let currentY = effect.y;
            
            for (let j = 1; j <= segments; j++) {
                const segmentX = effect.x + (endX - effect.x) * (j / segments) + (Math.random() - 0.5) * 8;
                const segmentY = effect.y + (endY - effect.y) * (j / segments) + (Math.random() - 0.5) * 8;
                
                ctx.lineTo(segmentX, segmentY);
                currentX = segmentX;
                currentY = segmentY;
            }
            
            ctx.stroke();
        }
        
        // Central glow
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * intensity})`;
        ctx.fillRect(effect.x - 1, effect.y - 1, 2, 2);
    },
    
    /**
     * Draw score popup
     * @param {object} popup - Score popup object
     */
    drawScorePopup(popup) {
        const ctx = Game.Rendering.Renderer.ctx;
        const alpha = popup.life / popup.maxLife;
        const scale = popup.scale || 1;
        
        // Get color based on popup type or theme
        let color = popup.color;
        if (!color) {
            const theme = Game.Cache.ThemeCache.getTheme();
            color = theme.id === 'Dungeon' ? '#FFD700' : '#FFD700';
        }
        
        // Apply alpha to color
        const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
            color = `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
        } else {
            // Fallback for hex colors
            color = `rgba(255, 215, 0, ${alpha})`;
        }
        
        ctx.save();
        
        // Set font and style
        ctx.font = `${Math.floor(16 * scale)}px Inter, sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        
        // Add text shadow for better visibility
        Game.Rendering.Utils.drawTextWithOutline(
            ctx, 
            `+${popup.points}`, 
            popup.x, 
            popup.y, 
            color, 
            'rgba(0, 0, 0, 0.8)', 
            2
        );
        
        ctx.restore();
    },
    
    /**
     * Draw double jump particle
     * @param {object} particle - Double jump particle object
     */
    drawDoubleJumpParticle(particle) {
        const ctx = Game.Rendering.Renderer.ctx;
        const theme = Game.Cache.ThemeCache.getTheme();
        const alpha = particle.life / particle.maxLife;
        const size = particle.size || 2;
        
        let color = particle.color;
        if (!color) {
            color = theme.id === 'cowboy' ? '#D2B48C' : '#8A2BE2';
        }
        
        // Apply alpha to color
        if (color.startsWith('#')) {
            // Convert hex to rgba
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else if (color.startsWith('rgb')) {
            // Add alpha to existing rgb
            color = color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(particle.x, particle.y, size, size);
        
        // Add glow effect for dungeon theme
        if (theme.id === 'Dungeon') {
            ctx.fillStyle = `rgba(138, 43, 226, ${alpha * 0.3})`;
            ctx.fillRect(particle.x - 1, particle.y - 1, size + 2, size + 2);
        }
    },
    
    /**
     * Draw environment element
     * @param {object} element - Environment element object
     */
    drawEnvironmentElement(element) {
        const ctx = Game.Rendering.Renderer.ctx;
        
        if (element.type === 'cloud') {
            this.drawCloud(ctx, element);
        } else if (element.type === 'torch') {
            this.drawTorch(ctx, element);
        }
    },
    
    /**
     * Draw cloud (cowboy theme)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {object} cloud - Cloud object
     */
    drawCloud(ctx, cloud) {
        ctx.save();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Draw cloud as overlapping circles
        const centerX = cloud.x + cloud.width / 2;
        const centerY = cloud.y;
        const radius = cloud.width / 6;
        
        // Create cloud shape with multiple circles
        ctx.beginPath();
        ctx.arc(centerX - radius, centerY, radius, 0, Math.PI * 2);
        ctx.arc(centerX, centerY - radius/2, radius * 1.2, 0, Math.PI * 2);
        ctx.arc(centerX + radius, centerY, radius, 0, Math.PI * 2);
        ctx.arc(centerX + radius/2, centerY + radius/2, radius * 0.8, 0, Math.PI * 2);
        ctx.arc(centerX - radius/2, centerY + radius/2, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },
    
    /**
     * Draw torch (dungeon theme)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {object} torch - Torch object
     */
    drawTorch(ctx, torch) {
        const x = torch.x;
        const y = torch.y;
        const flicker = torch.flicker;
        
        // Torch base/holder
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y + 15, 4, 25);
        
        // Torch head
        ctx.fillStyle = '#654321';
        ctx.fillRect(x - 2, y + 10, 8, 8);
        
        // Flame with flicker animation
        const flameHeight = 12 + Math.sin(flicker) * 3;
        const flameIntensity = 0.7 + Math.sin(flicker * 1.5) * 0.3;
        
        // Outer flame (red/orange)
        ctx.fillStyle = `rgba(255, 69, 0, ${flameIntensity})`;
        ctx.fillRect(x, y + 2, 4, flameHeight);
        ctx.fillRect(x - 1, y + 4, 6, flameHeight - 2);
        
        // Inner flame (yellow)
        ctx.fillStyle = `rgba(255, 255, 0, ${flameIntensity})`;
        ctx.fillRect(x + 1, y + 4, 2, flameHeight - 4);
        
        // Flame glow
        const glowRadius = 15 + Math.sin(flicker) * 3;
        const gradient = ctx.createRadialGradient(x + 2, y + 8, 0, x + 2, y + 8, glowRadius);
        gradient.addColorStop(0, `rgba(255, 100, 0, ${flameIntensity * 0.3})`);
        gradient.addColorStop(0.5, `rgba(255, 150, 0, ${flameIntensity * 0.1})`);
        gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x - glowRadius + 2, y - glowRadius + 8, glowRadius * 2, glowRadius * 2);
        
        // Sparks (occasional)
        if (Math.sin(flicker * 2) > 0.8) {
            ctx.fillStyle = '#FFFF00';
            const sparkX = x + 2 + Math.sin(flicker * 3) * 3;
            const sparkY = y + Math.cos(flicker * 2) * 2;
            ctx.fillRect(sparkX, sparkY, 1, 1);
            ctx.fillRect(sparkX + 2, sparkY - 1, 1, 1);
        }
    },
    
    /**
     * Draw particle trail effect
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     * @param {number} endX - End X position
     * @param {number} endY - End Y position
     * @param {string} color - Trail color
     * @param {number} alpha - Trail transparency
     */
    drawTrail(x, y, endX, endY, color = '#FFFFFF', alpha = 0.5) {
        const ctx = Game.Rendering.Renderer.ctx;
        
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2;
        
        // Create gradient along the trail
        const gradient = ctx.createLinearGradient(x, y, endX, endY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.strokeStyle = gradient;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        ctx.restore();
    },
    
    /**
     * Draw shield/protection effect
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} radius - Shield radius
     * @param {number} alpha - Shield transparency
     */
    drawShieldEffect(x, y, radius = 30, alpha = 0.3) {
        const ctx = Game.Rendering.Renderer.ctx;
        
        ctx.save();
        
        // Create radial gradient for shield
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${alpha * 0.1})`);
        gradient.addColorStop(0.8, `rgba(0, 255, 255, ${alpha})`);
        gradient.addColorStop(1, `rgba(0, 255, 255, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Shield border
        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    },
    
    /**
     * Draw impact ripple effect
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} radius - Ripple radius
     * @param {number} alpha - Ripple transparency
     */
    drawRippleEffect(x, y, radius = 20, alpha = 0.5) {
        const ctx = Game.Rendering.Renderer.ctx;
        
        ctx.save();
        
        // Draw multiple ripple rings
        for (let i = 0; i < 3; i++) {
            const ringRadius = radius - (i * 5);
            const ringAlpha = alpha * (1 - i * 0.3);
            
            if (ringRadius > 0) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
                ctx.lineWidth = 2 - i;
                ctx.beginPath();
                ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
};

/**
 * Initialize Effect Renderer
 */
Game.Rendering.EffectRenderer.init = function() {
    console.log('✨ Effect renderer initialized');
    return true;
};

// Auto-initialize
Game.Rendering.EffectRenderer.init();