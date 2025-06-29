/* ====================================
   OBSTACLERENDERER.JS - Hindernis-Zeichnung
   ==================================== */

// Obstacle Renderer Namespace
Game.Rendering.ObstacleRenderer = {
    /**
     * Draw obstacle based on type
     * @param {object} obstacle - Obstacle to draw
     */
    draw(obstacle) {
        const ctx = Game.Rendering.Renderer.ctx;
        const animData = Game.Obstacles.Animation.getAnimationData(obstacle);
        
        switch(obstacle.type) {
            case 'cactus':
                this.drawCactus(ctx, obstacle, animData);
                break;
            case 'rock':
                this.drawRock(ctx, obstacle);
                break;
            case 'vulture':
                this.drawVulture(ctx, obstacle, animData);
                break;
            case 'bull':
                this.drawBull(ctx, obstacle, animData, false);
                break;
            case 'boss':
                this.drawBull(ctx, obstacle, animData, true);
                break;
            case 'prisoner':
                this.drawPrisoner(ctx, obstacle, animData);
                break;
            case 'bulletBox':
                this.drawBulletBox(ctx, obstacle, animData);
                break;
            case 'bat':
                this.drawBat(ctx, obstacle, animData);
                break;
            case 'vampire':
                this.drawVampire(ctx, obstacle, animData);
                break;
            case 'spider':
                this.drawSpider(ctx, obstacle, animData, false);
                break;
            case 'alphaWolf':
                this.drawWolf(ctx, obstacle, animData, true);
                break;
            case 'skeleton':
                this.drawSkeleton(ctx, obstacle, animData);
                break;
            case 'boltBox':
                this.drawBoltBox(ctx, obstacle, animData);
                break;
            default:
                this.drawGeneric(ctx, obstacle);
                break;
        }
    },
    
    /**
     * Draw cactus obstacle
     */
    drawCactus(ctx, obstacle, animData) {
        const x = obstacle.x;
        const y = obstacle.y;
        const height = obstacle.height;
        const sway = animData.sway;
        
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x + 10 + sway, y, 12, height);
        ctx.fillRect(x + sway, y + height/3, 8, height/3);
        ctx.fillRect(x + 8 + sway, y + height/3, 4, 8);
        ctx.fillRect(x + 24 + sway, y + height/2, 8, height/4);
        ctx.fillRect(x + 20 + sway, y + height/2, 4, 8);
        
        // Animated spines
        const spineIntensity = animData.spineGlow;
        ctx.fillStyle = `rgba(0, 100, 0, ${spineIntensity})`;
        for (let i = 0; i < height; i += 8) {
            const spineOffset = Math.sin(obstacle.animationTime * 0.004 + i * 0.1) * 0.5;
            ctx.fillRect(x + 8 + sway + spineOffset, y + i, 2, 3);
            ctx.fillRect(x + 22 + sway - spineOffset, y + i + 4, 2, 3);
        }
    },
    
    /**
     * Draw rock/gravestone obstacle
     */
    drawRock(ctx, obstacle) {
        const x = obstacle.x;
        const y = obstacle.y;
        const width = obstacle.width;
        const height = obstacle.height;
        const theme = Game.Cache.ThemeCache.getTheme();
        
        if (theme.id === 'cowboy') {
            this.drawDesertRock(ctx, x, y, width, height);
        } else {
            this.drawGravestone(ctx, x, y, width, height);
        }
    },
    
    /**
     * Draw desert rock (cowboy theme)
     */
    drawDesertRock(ctx, x, y, width, height) {
        // Base rock mass (irregular shape)
        ctx.fillStyle = '#696969';
        ctx.fillRect(x + 2, y + 8, width - 4, height - 8);
        ctx.fillRect(x, y + 12, width, height - 12);
        ctx.fillRect(x + 4, y + 4, width - 8, 8);
        
        // Rock layers and stratification
        ctx.fillStyle = '#808080';
        ctx.fillRect(x + 1, y + 10, width - 2, 2);
        ctx.fillRect(x + 3, y + 16, width - 6, 2);
        ctx.fillRect(x + 2, y + 22, width - 4, 2);
        
        // Rock highlights
        ctx.fillStyle = '#A9A9A9';
        ctx.fillRect(x + 2, y + 6, 4, height - 10);
        ctx.fillRect(x + 4, y + 4, width - 12, 4);
        
        // Rock shadows and cracks
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(x + width - 6, y + 8, 4, height - 8);
        ctx.fillRect(x + 4, y + height - 4, width - 8, 4);
        
        // Vertical cracks
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(x + 8, y + 6, 1, height - 8);
        ctx.fillRect(x + 15, y + 10, 1, height - 12);
        ctx.fillRect(x + 20, y + 8, 1, height - 10);
    },
    
    /**
     * Draw gravestone (dungeon theme)
     */
    drawGravestone(ctx, x, y, width, height) {
        // Gravestone base/foundation
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(x, y + height - 8, width, 8);
        ctx.fillRect(x - 2, y + height - 4, width + 4, 4);
        
        // Main gravestone body
        ctx.fillStyle = '#696969';
        ctx.fillRect(x + 3, y + 6, width - 6, height - 14);
        
        // Rounded/arched top
        ctx.fillRect(x + 5, y + 2, width - 10, 8);
        ctx.fillRect(x + 7, y, width - 14, 6);
        
        // Gothic cross carving
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + width/2, y + 8, 1, 8);
        ctx.fillRect(x + width/2 - 3, y + 11, 7, 1);
        
        // Weathering and moss stains
        ctx.fillStyle = '#556B2F';
        ctx.fillRect(x + 5, y + 8, 3, 6);
        ctx.fillRect(x + width - 6, y + 12, 2, 8);
    },
    
    /**
     * Draw vulture
     */
    drawVulture(ctx, obstacle, animData) {
        const x = obstacle.x;
        const y = obstacle.y;
        const wingFlap = animData.wingFlap;
        
        ctx.save();
        ctx.scale(-1, 1);
        const flippedX = -x - 42;
        
        ctx.fillStyle = '#2F4F2F';
        ctx.fillRect(flippedX + 15, y + 12, 12, 8);
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(flippedX + 25, y + 8, 8, 8);
        
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(flippedX + 33, y + 10, 4, 3);
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(flippedX + 28, y + 10, 2, 2);
        
        // Animated wings
        ctx.fillStyle = '#2F4F2F';
        ctx.fillRect(flippedX + 5, y + 10 - wingFlap, 12, 4);
        ctx.fillRect(flippedX + 29, y + 10 + wingFlap, 12, 4);
        ctx.fillRect(flippedX + 8, y + 4, 8, 6);
        
        ctx.restore();
    },
    
    /**
     * Draw bull (normal or boss)
     */
    drawBull(ctx, obstacle, animData, isBoss = false) {
        const x = obstacle.x;
        const y = obstacle.y;
        const scale = isBoss ? 1.5 : 1;
        const scaledWidth = 42 * scale;
        const scaledHeight = 38 * scale;
        const breathe = animData.breathe;
        
        // Boss aura effect
        if (isBoss) {
            const auraIntensity = animData.aura;
            const gradient = ctx.createRadialGradient(
                x + scaledWidth/2, y + scaledHeight/2, 0,
                x + scaledWidth/2, y + scaledHeight/2, scaledWidth * 0.8
            );
            gradient.addColorStop(0, `rgba(255, 0, 0, ${auraIntensity * 0.6})`);
            gradient.addColorStop(0.5, `rgba(255, 0, 0, ${auraIntensity * 0.3})`);
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - 15, y - 15, scaledWidth + 30, scaledHeight + 30);
        }
        
        // Main body
        ctx.fillStyle = isBoss ? '#654321' : '#8B4513';
        ctx.fillRect(x + 5 * scale, y + 10 * scale + breathe, 30 * scale, 20 * scale);
        ctx.fillRect(x, y + 5 * scale + breathe, 15 * scale, 15 * scale);
        
        // Horns
        ctx.fillStyle = '#F5DEB3';
        ctx.fillRect(x + 2 * scale, y + breathe, 3 * scale, 8 * scale);
        ctx.fillRect(x + 10 * scale, y + breathe, 3 * scale, 8 * scale);
        
        // Eyes with animation
        const eyeFlicker = Math.sin(obstacle.animationTime * 0.01) > 0.8 ? 1 : 0;
        ctx.fillStyle = isBoss ? '#FF4500' : '#FF0000';
        ctx.fillRect(x + 4 * scale, y + 8 * scale + breathe + eyeFlicker, 2 * scale, 2 * scale);
        ctx.fillRect(x + 9 * scale, y + 8 * scale + breathe + eyeFlicker, 2 * scale, 2 * scale);
        
        // Legs
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 8 * scale, y + 30 * scale, 4 * scale, 8 * scale);
        ctx.fillRect(x + 14 * scale, y + 30 * scale, 4 * scale, 8 * scale);
        ctx.fillRect(x + 20 * scale, y + 30 * scale, 4 * scale, 8 * scale);
        ctx.fillRect(x + 26 * scale, y + 30 * scale, 4 * scale, 8 * scale);
        
        // Animated tail
        const tailWag = Math.sin(obstacle.animationTime * 0.005) * 2;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 35 * scale + tailWag, y + 15 * scale, 6 * scale, 2 * scale);
        
        // Steam from nostrils
        if (isBoss || Math.sin(obstacle.animationTime * 0.006) > 0.5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            const steamY = y + 12 * scale + breathe;
            ctx.fillRect(x + 5 * scale, steamY - 2, 1, 3);
            ctx.fillRect(x + 8 * scale, steamY - 3, 1, 4);
            ctx.fillRect(x + 11 * scale, steamY - 2, 1, 3);
        }
        
        // Boss crown
        if (isBoss) {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 5 * scale, y - 3 * scale + breathe, 2 * scale, 5 * scale);
            ctx.fillRect(x + 10 * scale, y - 3 * scale + breathe, 2 * scale, 5 * scale);
            ctx.fillRect(x + 15 * scale, y - 3 * scale + breathe, 2 * scale, 5 * scale);
        }
    },
    
    /**
     * Draw prisoner
     */
    drawPrisoner(ctx, obstacle, animData) {
        const x = obstacle.x;
        const y = obstacle.y;
        const struggle = animData.sway;
        const headShake = Math.sin(obstacle.animationTime * 0.008) * 0.5;
        
        // Head
        ctx.fillStyle = '#FDBCB4';
        ctx.fillRect(x + 12 + headShake, y + 8, 16, 16);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 16 + headShake, y + 12, 2, 2);
        ctx.fillRect(x + 22 + headShake, y + 12, 2, 2);
        
        // Prison uniform body
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 10 + struggle, y + 24, 20, 20);
        
        // Prison stripes
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 5; i++) {
            const stripeOffset = Math.sin(obstacle.animationTime * 0.003 + i * 0.5) * 0.2;
            ctx.fillRect(x + 10 + struggle + stripeOffset, y + 26 + i * 4, 20, 2);
        }
        
        // Arms with struggle animation
        const armStruggle = Math.sin(obstacle.animationTime * 0.007) * 1;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 6 + armStruggle, y + 26, 6, 12);
        ctx.fillRect(x + 28 - armStruggle, y + 26, 6, 12);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 6 + armStruggle, y + 28, 6, 2);
        ctx.fillRect(x + 6 + armStruggle, y + 32, 6, 2);
        ctx.fillRect(x + 28 - armStruggle, y + 28, 6, 2);
        ctx.fillRect(x + 28 - armStruggle, y + 32, 6, 2);
        
        // Legs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 14 + struggle, y + 44, 6, 16);
        ctx.fillRect(x + 20 + struggle, y + 44, 6, 16);
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x + 14 + struggle, y + 46 + i * 4, 6, 2);
            ctx.fillRect(x + 20 + struggle, y + 46 + i * 4, 6, 2);
        }
        
        // Ball and chain
        const chainSwing = Math.sin(obstacle.animationTime * 0.004) * 1.5;
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 16 + chainSwing, y + 30, 8, 6);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 17 + chainSwing, y + 31, 6, 4);
        
        // Chain links
        ctx.fillStyle = '#666666';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(x + 19 + chainSwing + i * 2, y + 36 + i, 2, 3);
        }
    },
    
    /**
     * Draw bullet box
     */
    drawBulletBox(ctx, obstacle, animData) {
        const x = obstacle.x;
        const y = obstacle.y;
        const float = Math.sin(obstacle.animationTime * 0.003) * 2;
        const pulse = animData.glow;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(x + 12, y + 8 + float, 0, x + 12, y + 8 + float, 35);
        gradient.addColorStop(0, `rgba(255, 215, 0, ${pulse})`);
        gradient.addColorStop(0.5, `rgba(255, 215, 0, ${pulse * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 15, y - 15 + float, 54, 46);
        
        // Box body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y + float, 24, 16);
        
        // Box highlights
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(x + 2, y + 2 + float, 20, 2);
        ctx.fillRect(x + 2, y + 2 + float, 2, 12);
        
        // Box shadows
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 20, y + 4 + float, 4, 12);
        ctx.fillRect(x + 4, y + 12 + float, 20, 4);
        
        // Golden center glow
        const glowIntensity = 0.7 + Math.sin(obstacle.animationTime * 0.006) * 0.3;
        ctx.fillStyle = `rgba(255, 215, 0, ${glowIntensity})`;
        ctx.fillRect(x + 8, y + 6 + float, 8, 4);
        ctx.fillStyle = '#FFF8DC';
        ctx.fillRect(x + 9, y + 7 + float, 6, 2);
        
        // Sparkle effects
        if (animData.sparkle) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x + 6 + Math.sin(obstacle.animationTime * 0.02) * 2, y + 4 + float, 1, 1);
            ctx.fillRect(x + 22 + Math.cos(obstacle.animationTime * 0.02) * 2, y + 8 + float, 1, 1);
        }
        
        // Bullet symbol
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 18, y + 6 + float, 3, 4);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x + 18, y + 6 + float, 2, 1);
        ctx.fillRect(x + 18, y + 8 + float, 2, 1);
    },
    
    /**
     * Draw bat
     */
    drawBat(ctx, obstacle, animData) {
        const x = obstacle.x;
        const y = obstacle.y;
        const wingFlap = animData.wingFlap;
        
        // Body
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(x + 15, y + 8, 8, 12);
        
        // Wings with flapping animation
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(x + 2 + wingFlap, y + 6, 12, 8);
        ctx.fillRect(x + 24 - wingFlap, y + 6, 12, 8);
        ctx.fillRect(x + 4 + wingFlap, y + 2, 8, 6);
        ctx.fillRect(x + 26 - wingFlap, y + 2, 8, 6);
        
        // Eyes
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x + 16, y + 10, 2, 2);
        ctx.fillRect(x + 20, y + 10, 2, 2);
    },
    
    /**
     * Draw vampire
     */
    drawVampire(ctx, obstacle, animData) {
        const x = obstacle.x;
        const y = obstacle.y;
        const sway = animData.sway;
        const capeFlutter = Math.sin(obstacle.animationTime * 0.007) * 2;
        
        // Cape
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(x + 5 + sway - capeFlutter, y + 20, 30 + capeFlutter, 25);
        ctx.fillRect(x + 10 + sway, y + 10, 20, 15);
        
        // Cape edges
        ctx.fillStyle = '#660000';
        ctx.fillRect(x + 4 + sway - capeFlutter, y + 22, 2, 20);
        ctx.fillRect(x + 33 + sway + capeFlutter, y + 22, 2, 20);
        
        // Head
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(x + 12 + sway, y + 8, 16, 16);
        
        // Hair with flow animation
        ctx.fillStyle = '#000000';
        const hairFlow = Math.sin(obstacle.animationTime * 0.004) * 1;
        ctx.fillRect(x + 10 + sway + hairFlow, y + 4, 20, 8);
        
        // Glowing red eyes
        const eyeGlow = 0.7 + Math.sin(obstacle.animationTime * 0.008) * 0.3;
        ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
        ctx.fillRect(x + 15 + sway, y + 11, 3, 3);
        ctx.fillRect(x + 21 + sway, y + 11, 3, 3);
        
        // Fangs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 17 + sway, y + 18, 1, 3);
        ctx.fillRect(x + 22 + sway, y + 18, 1, 3);
        
        // Arms
        const armSway = Math.sin(obstacle.animationTime * 0.006) * 0.5;
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(x + 6 + sway - armSway, y + 26, 6, 12);
        ctx.fillRect(x + 28 + sway + armSway, y + 26, 6, 12);
        
        // Legs
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 14 + sway, y + 44, 6, 16);
        ctx.fillRect(x + 20 + sway, y + 44, 6, 16);
        
        // Mist effect
        if (Math.sin(obstacle.animationTime * 0.01) > 0.3) {
            ctx.fillStyle = 'rgba(139, 0, 0, 0.3)';
            ctx.fillRect(x + 2 + sway, y + 15, 1, 8);
            ctx.fillRect(x + 37 + sway, y + 18, 1, 6);
            ctx.fillRect(x + 15 + sway, y + 2, 1, 3);
        }
    },
    
    /**
     * Draw spider
     */
    drawSpider(ctx, obstacle, animData, isBoss = false) {
        const x = obstacle.x;
        const y = obstacle.y;
        const scale = isBoss ? 1.5 : 1;
        const scaledWidth = 42 * scale;
        const scaledHeight = 28 * scale;
        const scuttle = Math.sin(obstacle.animationTime * 0.008) * 1.2;
        const bodyBob = animData.breathe;
        
        // Boss aura
        if (isBoss) {
            const gradient = ctx.createRadialGradient(
                x + scaledWidth/2, y + scaledHeight/2, 0,
                x + scaledWidth/2, y + scaledHeight/2, scaledWidth * 0.8
            );
            gradient.addColorStop(0, 'rgba(139, 0, 139, 0.6)');
            gradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.3)');
            gradient.addColorStop(1, 'rgba(75, 0, 130, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - 15, y - 15, scaledWidth + 30, scaledHeight + 30);
        }
        
        // Spider abdomen
        ctx.fillStyle = isBoss ? '#4B0082' : '#1A1A1A';
        ctx.fillRect(x + 20 * scale, y + 8 * scale + bodyBob, 18 * scale, 14 * scale);
        ctx.fillRect(x + 22 * scale, y + 6 * scale + bodyBob, 14 * scale, 18 * scale);
        
        // Abdomen markings
        ctx.fillStyle = isBoss ? '#8B008B' : '#8B0000';
        ctx.fillRect(x + 24 * scale, y + 10 * scale + bodyBob, 10 * scale, 2 * scale);
        ctx.fillRect(x + 26 * scale, y + 14 * scale + bodyBob, 6 * scale, 2 * scale);
        ctx.fillRect(x + 25 * scale, y + 18 * scale + bodyBob, 8 * scale, 2 * scale);
        
        // Spider cephalothorax
        ctx.fillStyle = isBoss ? '#4B0082' : '#2F2F2F';
        ctx.fillRect(x + 12 * scale, y + 12 * scale + bodyBob, 12 * scale, 10 * scale);
        
        // Multiple spider eyes
        const eyeGlow = isBoss ? 1 : 0.8 + Math.sin(obstacle.animationTime * 0.007) * 0.2;
        ctx.fillStyle = isBoss ? `rgba(138, 43, 226, ${eyeGlow})` : `rgba(255, 0, 0, ${eyeGlow})`;
        
        // Main eyes
        ctx.fillRect(x + 14 * scale, y + 14 * scale + bodyBob, 2 * scale, 2 * scale);
        ctx.fillRect(x + 18 * scale, y + 14 * scale + bodyBob, 2 * scale, 2 * scale);
        
        // Secondary eyes
        ctx.fillRect(x + 13 * scale, y + 12 * scale + bodyBob, 1 * scale, 1 * scale);
        ctx.fillRect(x + 20 * scale, y + 12 * scale + bodyBob, 1 * scale, 1 * scale);
        
        // Spider legs - 8 legs total
        const legColors = isBoss ? '#4B0082' : '#1A1A1A';
        ctx.fillStyle = legColors;
        
        // Left side legs
        for (let i = 0; i < 4; i++) {
            const legMovement = Math.sin(obstacle.animationTime * 0.01 + i * 0.5) * 1.5;
            const legY = y + 10 * scale + i * 3 * scale + bodyBob;
            
            ctx.fillRect(x + (2 + legMovement) * scale, legY, 6 * scale, 2 * scale);
            ctx.fillRect(x + (1 + legMovement) * scale, legY + 2 * scale, 4 * scale, 2 * scale);
            ctx.fillRect(x + legMovement * scale, legY + 4 * scale, 3 * scale, 1 * scale);
        }
        
        // Right side legs
        for (let i = 0; i < 4; i++) {
            const legMovement = Math.sin(obstacle.animationTime * 0.01 + i * 0.5 + Math.PI) * 1.5;
            const legY = y + 10 * scale + i * 3 * scale + bodyBob;
            
            ctx.fillRect(x + (34 - legMovement) * scale, legY, 6 * scale, 2 * scale);
            ctx.fillRect(x + (37 - legMovement) * scale, legY + 2 * scale, 4 * scale, 2 * scale);
            ctx.fillRect(x + (39 - legMovement) * scale, legY + 4 * scale, 3 * scale, 1 * scale);
        }
        
        // Web silk strand
        if (Math.sin(obstacle.animationTime * 0.005) > 0.7) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 18 * scale, y);
            ctx.lineTo(x + 18 * scale, y + 8 * scale + bodyBob);
            ctx.stroke();
        }
    },
    
    /**
     * Draw wolf
     */
    drawWolf(ctx, obstacle, animData, isBoss = false) {
        const x = obstacle.x;
        const y = obstacle.y;
        const scale = isBoss ? 1.5 : 1;
        const scaledWidth = 42 * scale;
        const scaledHeight = 28 * scale;
        const prowl = animData.sway;
        const breathe = animData.breathe;
        
        // Boss aura
        if (isBoss) {
            const gradient = ctx.createRadialGradient(
                x + scaledWidth/2, y + scaledHeight/2, 0,
                x + scaledWidth/2, y + scaledHeight/2, scaledWidth * 0.8
            );
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0.6)');
            gradient.addColorStop(0.5, 'rgba(139, 0, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(139, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - 15, y - 15, scaledWidth + 30, scaledHeight + 30);
        }
        
        // Wolf body
        ctx.fillStyle = isBoss ? '#4A4A4A' : '#696969';
        ctx.fillRect(x + 8 * scale, y + 12 * scale + prowl + breathe, 26 * scale, 16 * scale);
        ctx.fillRect(x, y + 8 * scale + prowl + breathe, 12 * scale, 12 * scale);
        
        // Ears with twitch animation
        const earTwitch = Math.sin(obstacle.animationTime * 0.012) * 0.5;
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(x + 2 * scale, y + 4 * scale + prowl + earTwitch, 3 * scale, 6 * scale);
        ctx.fillRect(x + 7 * scale, y + 4 * scale + prowl - earTwitch, 3 * scale, 6 * scale);
        
        // Eyes
        const eyeGlow = isBoss ? 1 : 0.8 + Math.sin(obstacle.animationTime * 0.006) * 0.2;
        ctx.fillStyle = isBoss ? `rgba(255, 255, 0, ${eyeGlow})` : `rgba(255, 0, 0, ${eyeGlow})`;
        ctx.fillRect(x + 3 * scale, y + 10 * scale + prowl + breathe, 2 * scale, 2 * scale);
        ctx.fillRect(x + 7 * scale, y + 10 * scale + prowl + breathe, 2 * scale, 2 * scale);
        
        // Legs with movement
        const legMove = Math.sin(obstacle.animationTime * 0.003) * 0.3;
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(x + 10 * scale + legMove, y + 26 * scale, 4 * scale, 8 * scale);
        ctx.fillRect(x + 16 * scale - legMove, y + 26 * scale, 4 * scale, 8 * scale);
        ctx.fillRect(x + 22 * scale + legMove, y + 26 * scale, 4 * scale, 8 * scale);
        ctx.fillRect(x + 28 * scale - legMove, y + 26 * scale, 4 * scale, 8 * scale);
        
        // Tail
        const tailWag = Math.sin(obstacle.animationTime * 0.008) * 3;
        ctx.fillStyle = isBoss ? '#4A4A4A' : '#696969';
        ctx.fillRect(x + 34 * scale + tailWag, y + 14 * scale + prowl, 6 * scale, 3 * scale);
        
        // Boss crown
        if (isBoss) {
            const crownGlow = 0.6 + Math.sin(obstacle.animationTime * 0.007) * 0.4;
            ctx.fillStyle = `rgba(255, 215, 0, ${crownGlow})`;
            ctx.fillRect(x + 3 * scale, y + 2 * scale + prowl, 2 * scale, 3 * scale);
            ctx.fillRect(x + 6 * scale, y + 1 * scale + prowl, 2 * scale, 4 * scale);
            ctx.fillRect(x + 9 * scale, y + 2 * scale + prowl, 2 * scale, 3 * scale);
        }
    },
    
    /**
     * Draw skeleton
     */
    drawSkeleton(ctx, obstacle, animData) {
        const x = obstacle.x;
        const y = obstacle.y;
        const rattle = Math.sin(obstacle.animationTime * 0.015) * 0.5;
        const sway = animData.sway;
        const boneBobble = Math.sin(obstacle.animationTime * 0.01) * 0.3;
        
        // Skull
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(x + 12 + sway, y + 8 + boneBobble, 16, 16);
        
        // Glowing eye sockets
        const eyeGlow = 0.6 + Math.sin(obstacle.animationTime * 0.008) * 0.4;
        ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
        ctx.fillRect(x + 16 + sway, y + 12 + boneBobble, 3, 3);
        ctx.fillRect(x + 21 + sway, y + 12 + boneBobble, 3, 3);
        
        // Jaw with chatter
        const jawChatter = Math.sin(obstacle.animationTime * 0.02) > 0.5 ? 1 : 0;
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(x + 14 + sway, y + 20 + boneBobble + jawChatter, 12, 4);
        
        // Spine
        ctx.fillRect(x + 18 + sway + rattle, y + 24, 4, 20);
        
        // Ribs
        for (let i = 0; i < 3; i++) {
            const ribRattle = Math.sin(obstacle.animationTime * 0.012 + i * 0.5) * 0.3;
            ctx.fillRect(x + 12 + sway + ribRattle, y + 28 + i * 4, 16, 2);
        }
        
        // Arms
        const leftArmRattle = Math.sin(obstacle.animationTime * 0.014) * 0.8;
        const rightArmRattle = Math.sin(obstacle.animationTime * 0.016) * 0.8;
        
        ctx.fillRect(x + 8 + leftArmRattle, y + 30, 8, 4);
        ctx.fillRect(x + 24 + rightArmRattle, y + 30, 8, 4);
        ctx.fillRect(x + 6 + leftArmRattle, y + 32, 4, 8);
        ctx.fillRect(x + 30 + rightArmRattle, y + 32, 4, 8);
        
        // Legs
        const leftLegRattle = Math.sin(obstacle.animationTime * 0.013) * 0.4;
        const rightLegRattle = Math.sin(obstacle.animationTime * 0.017) * 0.4;
        
        ctx.fillRect(x + 14 + sway + leftLegRattle, y + 44, 4, 16);
        ctx.fillRect(x + 22 + sway + rightLegRattle, y + 44, 4, 16);
        
        // Bone dust effect
        if (Math.sin(obstacle.animationTime * 0.009) > 0.7) {
            ctx.fillStyle = 'rgba(245, 245, 220, 0.5)';
            const dustX = x + 15 + sway + Math.sin(obstacle.animationTime * 0.02) * 3;
            const dustY = y + 35 + Math.cos(obstacle.animationTime * 0.02) * 2;
            ctx.fillRect(dustX, dustY, 1, 1);
            ctx.fillRect(dustX + 3, dustY - 2, 1, 1);
        }
    },
    
    /**
     * Draw bolt box (dungeon theme)
     */
    drawBoltBox(ctx, obstacle, animData) {
        const x = obstacle.x;
        const y = obstacle.y;
        const float = Math.sin(obstacle.animationTime * 0.004) * 2.5;
        const electricPulse = animData.glow;
        
        // Electric glow
        const gradient = ctx.createRadialGradient(x + 12, y + 8 + float, 0, x + 12, y + 8 + float, 35);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${electricPulse})`);
        gradient.addColorStop(0.5, `rgba(0, 255, 255, ${electricPulse * 0.6})`);
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 15, y - 15 + float, 54, 46);
        
        // Box body with electric shake
        const electricShake = Math.sin(obstacle.animationTime * 0.025) * 0.2;
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(x + electricShake, y + float, 24, 16);
        
        // Box details
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(x + 2 + electricShake, y + 2 + float, 20, 2);
        ctx.fillRect(x + 2 + electricShake, y + 2 + float, 2, 12);
        
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(x + 20 + electricShake, y + 4 + float, 4, 12);
        ctx.fillRect(x + 4 + electricShake, y + 12 + float, 20, 4);
        
        // Lightning bolt symbol
        const boltGlow = 0.8 + Math.sin(obstacle.animationTime * 0.01) * 0.2;
        ctx.fillStyle = `rgba(0, 255, 255, ${boltGlow})`;
        ctx.fillRect(x + 10 + electricShake, y + 6 + float, 2, 4);
        ctx.fillRect(x + 8 + electricShake, y + 7 + float, 6, 2);
        ctx.fillRect(x + 12 + electricShake, y + 8 + float, 4, 2);
        
        // Electric sparks
        ctx.fillStyle = `rgba(255, 255, 0, ${electricPulse})`;
        const spark1X = x + 12 + Math.sin(obstacle.animationTime * 0.02) * 4;
        const spark1Y = y + 8 + float + Math.cos(obstacle.animationTime * 0.02) * 3;
        const spark2X = x + 16 + Math.sin(obstacle.animationTime * 0.018) * 3;
        const spark2Y = y + 6 + float + Math.cos(obstacle.animationTime * 0.022) * 4;
        
        ctx.fillRect(spark1X, spark1Y, 1, 1);
        ctx.fillRect(spark2X, spark2Y, 1, 1);
        
        // Lightning effects
        if (Math.sin(obstacle.animationTime * 0.015) > 0.6) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${electricPulse * 0.8})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 8, y + 4 + float);
            ctx.lineTo(x + 18 + Math.sin(obstacle.animationTime * 0.03) * 2, y + 10 + float);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x + 20, y + 6 + float);
            ctx.lineTo(x + 14 + Math.cos(obstacle.animationTime * 0.025) * 2, y + 12 + float);
            ctx.stroke();
        }
        
        // Center glow
        if (Math.sin(obstacle.animationTime * 0.012) > 0.4) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(x + 11 + electricShake, y + 7 + float, 2, 2);
        }
    },
    
    /**
     * Draw generic obstacle (fallback)
     */
    drawGeneric(ctx, obstacle) {
        ctx.fillStyle = '#FF00FF'; // Magenta for unknown types
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Draw type text for debugging
        if (Game.DEBUG.ENABLED) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px monospace';
            ctx.fillText(obstacle.type, obstacle.x, obstacle.y - 2);
        }
    }
};

/**
 * Initialize Obstacle Renderer
 */
Game.Rendering.ObstacleRenderer.init = function() {
    console.log('🚧 Obstacle renderer initialized');
    return true;
};

// Auto-initialize
Game.Rendering.ObstacleRenderer.init();