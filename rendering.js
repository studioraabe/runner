// Drawing Functions - All visual rendering code

function drawPlayer(x, y, facingLeft = false, isDead = false) {
    const isInvulnerable = postBuffInvulnerability > 0 || postDamageInvulnerability > 0;
    
    if (isInvulnerable) {
        const blinkFrequency = 8;
        const activeInvulnerability = Math.max(postBuffInvulnerability, postDamageInvulnerability);
        
        if (Math.floor(activeInvulnerability / blinkFrequency) % 2 === 0) {
            return;
        }
    }
    
    if (currentTheme === 'cowboy') {
        drawCowboy(x, y, facingLeft, isDead);
    } else {
        drawDungeon(x, y, facingLeft, isDead);
    }
}

function drawCowboy(x, y, facingLeft = false, isDead = false) {
    ctx.save();
    
    if (facingLeft) {
        ctx.scale(-1, 1);
        x = -x - player.width;
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
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 8, y + 44, 24, 4);
    
    // Belt buckle
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x + 17, y + 43, 6, 6);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 18, y + 44, 4, 4);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 19, y + 45, 2, 2);
    
    // Belt studs/decoration
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x + 12, y + 45, 1, 2);
    ctx.fillRect(x + 27, y + 45, 1, 2);
    
    // Arms
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(x + 6, y + 30, 6, 12);
    ctx.fillRect(x + 28, y + 30, 6, 12);
    
    // Legs (blue jeans)
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(x + 14, y + 48, 6, 10);
    ctx.fillRect(x + 20, y + 48, 6, 10);
    
    // Cowboy boots
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 12, y + 58, 10, 6);
    ctx.fillRect(x + 18, y + 58, 10, 6);
    
    // Boot heels
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 12, y + 62, 10, 2);
    ctx.fillRect(x + 18, y + 62, 10, 2);
    
    // Boot spurs
    ctx.fillStyle = '#C0C0C0';
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
    if (bullets > 0) {
        ctx.fillStyle = activeBuffs.multiShot > 0 ? '#FF4500' : '#d9d9d9';
        ctx.fillRect(x + 34, y + 34, 12, 3);
        ctx.fillRect(x + 30, y + 36, 6, 8);
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(x + 32, y + 39, 2, 3);
        
        if (activeBuffs.multiShot > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 35, y + 33, 10, 1);
            ctx.fillRect(x + 35, y + 37, 10, 1);
        }
    }
    
    ctx.restore();
}

function drawDungeon(x, y, facingLeft = false, isDead = false) {
    ctx.save();
    
    if (facingLeft) {
        ctx.scale(-1, 1);
        x = -x - player.width;
    }
    
    // Enhanced flat-top head
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(x + 8, y + 6, 24, 18);
    ctx.fillRect(x + 6, y + 6, 28, 4);
    
    // Forehead scar
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x + 10, y + 8, 20, 1);
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 6; i++) {
        ctx.fillRect(x + 12 + i * 3, y + 7, 1, 1);
        ctx.fillRect(x + 12 + i * 3, y + 9, 1, 1);
    }
    
    // Enhanced neck bolts with electrical sparks
    const boltGlow = 0.7 + Math.sin(Date.now() * 0.008) * 0.3;
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x + 2, y + 16, 6, 3);
    ctx.fillRect(x + 32, y + 16, 6, 3);
    
    // Bolt cores
    ctx.fillStyle = '#696969';
    ctx.fillRect(x + 3, y + 16, 4, 3);
    ctx.fillRect(x + 33, y + 16, 4, 3);
    
    // Electrical sparks around bolts
    if (bullets > 0 || Math.random() > 0.7) {
        ctx.fillStyle = `rgba(0, 255, 255, ${boltGlow})`;
        ctx.fillRect(x + 1, y + 15, 1, 1);
        ctx.fillRect(x + 0, y + 18, 1, 1);
        ctx.fillRect(x + 4, y + 14, 1, 1);
        ctx.fillRect(x + 37, y + 15, 1, 1);
        ctx.fillRect(x + 38, y + 18, 1, 1);
        ctx.fillRect(x + 35, y + 14, 1, 1);
    }
    
    // Dark, wild hair
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 4, y, 32, 8);
    ctx.fillRect(x + 2, y + 2, 3, 4);
    ctx.fillRect(x + 35, y + 1, 3, 5);
    ctx.fillRect(x + 12, y - 1, 2, 3);
    ctx.fillRect(x + 26, y - 1, 2, 3);
    
    // Eyes
    if (isDead) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x + 14, y + 12, 3, 3);
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
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x + 14, y + 12, 3, 3);
        ctx.fillRect(x + 23, y + 12, 3, 3);
        // Eye glow effect
        const eyeGlow = 0.5 + Math.sin(Date.now() * 0.006) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 0, ${eyeGlow})`;
        ctx.fillRect(x + 13, y + 11, 5, 5);
        ctx.fillRect(x + 22, y + 11, 5, 5);
    }
    
    // Mouth with stitches
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x + 17, y + 19, 6, 2);
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + 17 + i * 1.5, y + 18, 1, 1);
        ctx.fillRect(x + 17 + i * 1.5, y + 21, 1, 1);
    }
    
    // Face scars
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x + 12, y + 14, 1, 6);
    ctx.fillRect(x + 27, y + 16, 1, 1);
    ctx.fillRect(x + 28, y + 17, 1, 1);
    ctx.fillRect(x + 29, y + 18, 1, 1);
    
    // Stitching dots for face scars
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 11, y + 15, 1, 1);
    ctx.fillRect(x + 13, y + 15, 1, 1);
    ctx.fillRect(x + 11, y + 18, 1, 1);
    ctx.fillRect(x + 13, y + 18, 1, 1);
    
    // Body
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(x + 8, y + 24, 24, 24);
    
    // Torn laboratory coat
    ctx.fillStyle = '#2F4F4F';
    ctx.fillRect(x + 6, y + 26, 28, 20);
    
    // Coat tears
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(x + 12, y + 30, 4, 6);
    ctx.fillRect(x + 24, y + 35, 3, 4);
    ctx.fillRect(x + 18, y + 28, 2, 8);
    
    // Coat buttons
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x + 19, y + 29, 2, 2);
    ctx.fillRect(x + 19, y + 39, 2, 2);
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(x + 19, y + 34, 2, 1);
    
    // Body stitching
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x + 10, y + 32, 20, 1);
    ctx.fillRect(x + 20, y + 26, 1, 15);
    
    // Body stitching dots
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 8; i++) {
        ctx.fillRect(x + 11 + i * 2.5, y + 31, 1, 1);
        ctx.fillRect(x + 11 + i * 2.5, y + 33, 1, 1);
    }
    for (let i = 0; i < 6; i++) {
        ctx.fillRect(x + 19, y + 27 + i * 2.5, 1, 1);
        ctx.fillRect(x + 21, y + 27 + i * 2.5, 1, 1);
    }
    
    // Arms
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(x + 2, y + 28, 8, 16);
    ctx.fillRect(x + 30, y + 28, 8, 16);
    
    // Arm patches
    ctx.fillStyle = '#7CCD7C';
    ctx.fillRect(x + 3, y + 30, 3, 4);
    ctx.fillRect(x + 32, y + 35, 3, 3);
    
    // Arm stitching
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x + 3, y + 34, 6, 1);
    ctx.fillRect(x + 31, y + 38, 6, 1);
    
    // Arm stitching dots
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + 3 + i * 1.5, y + 33, 1, 1);
        ctx.fillRect(x + 3 + i * 1.5, y + 35, 1, 1);
        ctx.fillRect(x + 31 + i * 1.5, y + 37, 1, 1);
        ctx.fillRect(x + 31 + i * 1.5, y + 39, 1, 1);
    }
    
    // Legs
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(x + 12, y + 48, 6, 14);
    ctx.fillRect(x + 22, y + 48, 6, 14);
    
    // Hand energy effect when has bullets
    if (bullets > 0) {
        const energyPulse = 0.6 + Math.sin(Date.now() * 0.01) * 0.4;
        
        // Energy glow around hand
        ctx.fillStyle = `rgba(0, 255, 255, ${energyPulse * 0.3})`;
        ctx.fillRect(x + 32, y + 28, 12, 12);
        
        // Energy core in palm
        ctx.fillStyle = activeBuffs.multiShot > 0 ? '#FF4500' : '#00FFFF';
        ctx.fillRect(x + 35, y + 31, 6, 6);
        
        // Energy crackling effect
        if (activeBuffs.multiShot > 0) {
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
}

function drawObstacle(obstacle) {
    const animTime = obstacle.animationTime || 0;
    switch(obstacle.type) {
        case 'cactus': drawCactus(obstacle.x, obstacle.y, obstacle.height, animTime); break;
        case 'rock': drawRock(obstacle.x, obstacle.y, obstacle.width, obstacle.height); break;
        case 'vulture': drawVulture(obstacle.x, obstacle.y); break;
        case 'bull': drawBull(obstacle.x, obstacle.y, false, animTime); break;
        case 'boss': drawBull(obstacle.x, obstacle.y, true, animTime); break;
        case 'prisoner': drawPrisoner(obstacle.x, obstacle.y, animTime); break;
        case 'bulletBox': drawBulletBox(obstacle.x, obstacle.y, animTime); break;
        case 'bat': drawBat(obstacle.x, obstacle.y); break;
        case 'vampire': drawVampire(obstacle.x, obstacle.y, animTime); break;
        case 'spider': drawSpider(obstacle.x, obstacle.y, false, animTime); break;
        case 'alphaWolf': drawWolf(obstacle.x, obstacle.y, true, animTime); break;
        case 'skeleton': drawSkeleton(obstacle.x, obstacle.y, animTime); break;
        case 'boltBox': drawBoltBox(obstacle.x, obstacle.y, animTime); break;
    }
}

function drawCactus(x, y, height, animTime = 0) {
    const sway = Math.sin(animTime * 0.002) * 1;
    
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x + 10 + sway, y, 12, height);
    ctx.fillRect(x + sway, y + height/3, 8, height/3);
    ctx.fillRect(x + 8 + sway, y + height/3, 4, 8);
    ctx.fillRect(x + 24 + sway, y + height/2, 8, height/4);
    ctx.fillRect(x + 20 + sway, y + height/2, 4, 8);
    
    const spineIntensity = 0.5 + Math.sin(animTime * 0.003) * 0.3;
    ctx.fillStyle = `rgba(0, 100, 0, ${spineIntensity})`;
    for (let i = 0; i < height; i += 8) {
        const spineOffset = Math.sin(animTime * 0.004 + i * 0.1) * 0.5;
        ctx.fillRect(x + 8 + sway + spineOffset, y + i, 2, 3);
        ctx.fillRect(x + 22 + sway - spineOffset, y + i + 4, 2, 3);
    }
}

function drawRock(x, y, width, height) {
    if (currentTheme === 'cowboy') {
        // Desert rock formation
        ctx.fillStyle = '#696969';
        ctx.fillRect(x + 2, y + 8, width - 4, height - 8);
        ctx.fillRect(x, y + 12, width, height - 12);
        ctx.fillRect(x + 4, y + 4, width - 8, 8);
        
        // Rock layers
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
        
        // Horizontal stress fractures
        ctx.fillRect(x + 6, y + 14, 8, 1);
        ctx.fillRect(x + 12, y + 20, 12, 1);
        
        // Desert weathering spots
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x + 3, y + 8, 2, 3);
        ctx.fillRect(x + width - 4, y + 12, 2, 4);
        ctx.fillRect(x + 10, y + height - 6, 3, 2);
        
        // Small pebbles and debris around base
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(x - 1, y + height - 2, 2, 2);
        ctx.fillRect(x + width, y + height - 1, 1, 1);
        ctx.fillRect(x + 6, y + height + 1, 1, 1);
    } else {
        // Dungeon gravestone
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(x, y + height - 8, width, 8);
        ctx.fillRect(x - 2, y + height - 4, width + 4, 4);
        
        // Main gravestone body
        ctx.fillStyle = '#696969';
        ctx.fillRect(x + 3, y + 6, width - 6, height - 14);
        
        // Rounded top
        ctx.fillRect(x + 5, y + 2, width - 10, 8);
        ctx.fillRect(x + 7, y, width - 14, 6);
        
        // Stone texture
        ctx.fillStyle = '#808080';
        ctx.fillRect(x + 4, y + 4, 2, height - 16);
        ctx.fillRect(x + 6, y + 2, width - 14, 2);
        
        // Weathering and moss
        ctx.fillStyle = '#556B2F';
        ctx.fillRect(x + 5, y + 8, 3, 6);
        ctx.fillRect(x + width - 6, y + 12, 2, 8);
        ctx.fillRect(x + 8, y + height - 12, 6, 4);
        
        // Cracks
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(x + 10, y + 4, 1, height - 18);
        ctx.fillRect(x + 6, y + 14, 8, 1);
        ctx.fillRect(x + 12, y + height - 10, 6, 1);
        
        // Gothic cross
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + width/2, y + 8, 1, 8);
        ctx.fillRect(x + width/2 - 3, y + 11, 7, 1);
        
        // Carved text lines
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(x + 6, y + 20, width - 12, 1);
        ctx.fillRect(x + 8, y + 23, width - 16, 1);
        ctx.fillRect(x + 7, y + 26, width - 14, 1);
    }
}

function drawVulture(x, y) {
    ctx.save();
    ctx.scale(-1, 1);
    x = -x - 42;
    
    ctx.fillStyle = '#2F4F2F';
    ctx.fillRect(x + 15, y + 12, 12, 8);
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 25, y + 8, 8, 8);
    
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 33, y + 10, 4, 3);
    
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x + 28, y + 10, 2, 2);
    
    const wingFlap = Math.sin(Date.now() * 0.01) * 3;
    ctx.fillStyle = '#2F4F2F';
    ctx.fillRect(x + 5, y + 10 - wingFlap, 12, 4);
    ctx.fillRect(x + 29, y + 10 + wingFlap, 12, 4);
    ctx.fillRect(x + 8, y + 4, 8, 6);
    
    ctx.restore();
}

function drawBull(x, y, isBoss = false, animTime = 0) {
    const scale = isBoss ? 1.5 : 1;
    const scaledWidth = 42 * scale;
    const scaledHeight = 38 * scale;
    
    const breathe = Math.sin(animTime * 0.004) * 0.5;
    
    if (isBoss) {
        const gradient = ctx.createRadialGradient(
            x + scaledWidth/2, y + scaledHeight/2, 0,
            x + scaledWidth/2, y + scaledHeight/2, scaledWidth * 0.8
        );
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.6)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 15, y - 15, scaledWidth + 30, scaledHeight + 30);
    }
    
    ctx.fillStyle = isBoss ? '#654321' : '#8B4513';
    ctx.fillRect(x + 5 * scale, y + 10 * scale + breathe, 30 * scale, 20 * scale);
    ctx.fillRect(x, y + 5 * scale + breathe, 15 * scale, 15 * scale);
    
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(x + 2 * scale, y + breathe, 3 * scale, 8 * scale);
    ctx.fillRect(x + 10 * scale, y + breathe, 3 * scale, 8 * scale);
    
    const eyeFlicker = Math.sin(animTime * 0.01) > 0.8 ? 1 : 0;
    ctx.fillStyle = isBoss ? '#FF4500' : '#FF0000';
    ctx.fillRect(x + 4 * scale, y + 8 * scale + breathe + eyeFlicker, 2 * scale, 2 * scale);
    ctx.fillRect(x + 9 * scale, y + 8 * scale + breathe + eyeFlicker, 2 * scale, 2 * scale);
    
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 8 * scale, y + 30 * scale, 4 * scale, 8 * scale);
    ctx.fillRect(x + 14 * scale, y + 30 * scale, 4 * scale, 8 * scale);
    ctx.fillRect(x + 20 * scale, y + 30 * scale, 4 * scale, 8 * scale);
    ctx.fillRect(x + 26 * scale, y + 30 * scale, 4 * scale, 8 * scale);
    
    const tailWag = Math.sin(animTime * 0.005) * 2;
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 35 * scale + tailWag, y + 15 * scale, 6 * scale, 2 * scale);
    
    if (isBoss || Math.sin(animTime * 0.006) > 0.5) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        const steamY = y + 12 * scale + breathe;
        ctx.fillRect(x + 5 * scale, steamY - 2, 1, 3);
        ctx.fillRect(x + 8 * scale, steamY - 3, 1, 4);
        ctx.fillRect(x + 11 * scale, steamY - 2, 1, 3);
    }
    
    if (isBoss) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 5 * scale, y - 3 * scale + breathe, 2 * scale, 5 * scale);
        ctx.fillRect(x + 10 * scale, y - 3 * scale + breathe, 2 * scale, 5 * scale);
        ctx.fillRect(x + 15 * scale, y - 3 * scale + breathe, 2 * scale, 5 * scale);
    }
}

function drawPrisoner(x, y, animTime = 0) {
    const struggle = Math.sin(animTime * 0.01) * 0.8;
    const headShake = Math.sin(animTime * 0.008) * 0.5;
    
    ctx.fillStyle = '#FDBCB4';
    ctx.fillRect(x + 12 + headShake, y + 8, 16, 16);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 16 + headShake, y + 12, 2, 2);
    ctx.fillRect(x + 22 + headShake, y + 12, 2, 2);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 10 + struggle, y + 24, 20, 20);
    
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 5; i++) {
        const stripeOffset = Math.sin(animTime * 0.003 + i * 0.5) * 0.2;
        ctx.fillRect(x + 10 + struggle + stripeOffset, y + 26 + i * 4, 20, 2);
    }
    
    const armStruggle = Math.sin(animTime * 0.007) * 1;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 6 + armStruggle, y + 26, 6, 12);
    ctx.fillRect(x + 28 - armStruggle, y + 26, 6, 12);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 6 + armStruggle, y + 28, 6, 2);
    ctx.fillRect(x + 6 + armStruggle, y + 32, 6, 2);
    ctx.fillRect(x + 28 - armStruggle, y + 28, 6, 2);
    ctx.fillRect(x + 28 - armStruggle, y + 32, 6, 2);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 14 + struggle, y + 44, 6, 16);
    ctx.fillRect(x + 20 + struggle, y + 44, 6, 16);
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + 14 + struggle, y + 46 + i * 4, 6, 2);
        ctx.fillRect(x + 20 + struggle, y + 46 + i * 4, 6, 2);
    }
    
    const chainSwing = Math.sin(animTime * 0.004) * 1.5;
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 16 + chainSwing, y + 30, 8, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 17 + chainSwing, y + 31, 6, 4);
    
    ctx.fillStyle = '#666666';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(x + 19 + chainSwing + i * 2, y + 36 + i, 2, 3);
    }
}

function drawBulletBox(x, y, animTime = 0) {
    const float = Math.sin(animTime * 0.003) * 2;
    const pulse = 0.6 + Math.sin(animTime * 0.005) * 0.4;
    
    const gradient = ctx.createRadialGradient(x + 12, y + 8 + float, 0, x + 12, y + 8 + float, 35);
    gradient.addColorStop(0, `rgba(255, 215, 0, ${pulse})`);
    gradient.addColorStop(0.5, `rgba(255, 215, 0, ${pulse * 0.5})`);
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 15, y - 15 + float, 54, 46);
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y + float, 24, 16);
    
    ctx.fillStyle = '#CD853F';
    ctx.fillRect(x + 2, y + 2 + float, 20, 2);
    ctx.fillRect(x + 2, y + 2 + float, 2, 12);
    
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 20, y + 4 + float, 4, 12);
    ctx.fillRect(x + 4, y + 12 + float, 20, 4);
    
    const glowIntensity = 0.7 + Math.sin(animTime * 0.006) * 0.3;
    ctx.fillStyle = `rgba(255, 215, 0, ${glowIntensity})`;
    ctx.fillRect(x + 8, y + 6 + float, 8, 4);
    ctx.fillStyle = '#FFF8DC';
    ctx.fillRect(x + 9, y + 7 + float, 6, 2);
    
    if (Math.sin(animTime * 0.01) > 0.7) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 6 + Math.sin(animTime * 0.02) * 2, y + 4 + float, 1, 1);
        ctx.fillRect(x + 22 + Math.cos(animTime * 0.02) * 2, y + 8 + float, 1, 1);
    }
    
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 18, y + 6 + float, 3, 4);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(x + 18, y + 6 + float, 2, 1);
    ctx.fillRect(x + 18, y + 8 + float, 2, 1);
}

// Additional drawing functions (simplified for brevity)
function drawBat(x, y) {
    const wingFlap = Math.sin(Date.now() * 0.02) * 4;
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x + 15, y + 8, 8, 12);
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(x + 2 + wingFlap, y + 6, 12, 8);
    ctx.fillRect(x + 24 - wingFlap, y + 6, 12, 8);
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x + 16, y + 10, 2, 2);
    ctx.fillRect(x + 20, y + 10, 2, 2);
}

function drawVampire(x, y, animTime = 0) {
    const sway = Math.sin(animTime * 0.003) * 1;
    const capeFlutter = Math.sin(animTime * 0.007) * 2;
    
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(x + 5 + sway - capeFlutter, y + 20, 30 + capeFlutter, 25);
    
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(x + 12 + sway, y + 8, 16, 16);
    
    const eyeGlow = 0.7 + Math.sin(animTime * 0.008) * 0.3;
    ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
    ctx.fillRect(x + 15 + sway, y + 11, 3, 3);
    ctx.fillRect(x + 21 + sway, y + 11, 3, 3);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 17 + sway, y + 18, 1, 3);
    ctx.fillRect(x + 22 + sway, y + 18, 1, 3);
}

function drawSpider(x, y, isBoss = false, animTime = 0) {
    const scale = isBoss ? 1.5 : 1;
    const bodyBob = Math.sin(animTime * 0.006) * 0.4;
    
    ctx.fillStyle = isBoss ? '#4B0082' : '#1A1A1A';
    ctx.fillRect(x + 20 * scale, y + 8 * scale + bodyBob, 18 * scale, 14 * scale);
    ctx.fillRect(x + 12 * scale, y + 12 * scale + bodyBob, 12 * scale, 10 * scale);
    
    const eyeGlow = isBoss ? 1 : 0.8 + Math.sin(animTime * 0.007) * 0.2;
    ctx.fillStyle = isBoss ? `rgba(138, 43, 226, ${eyeGlow})` : `rgba(255, 0, 0, ${eyeGlow})`;
    ctx.fillRect(x + 14 * scale, y + 14 * scale + bodyBob, 2 * scale, 2 * scale);
    ctx.fillRect(x + 18 * scale, y + 14 * scale + bodyBob, 2 * scale, 2 * scale);
    
    // Spider legs
    for (let i = 0; i < 4; i++) {
        const legMovement = Math.sin(animTime * 0.01 + i * 0.5) * 1.5;
        const legY = y + 10 * scale + i * 3 * scale + bodyBob;
        
        ctx.fillStyle = isBoss ? '#4B0082' : '#1A1A1A';
        ctx.fillRect(x + (2 + legMovement) * scale, legY, 6 * scale, 2 * scale);
        ctx.fillRect(x + (34 - legMovement) * scale, legY, 6 * scale, 2 * scale);
    }
}

function drawWolf(x, y, isBoss = false, animTime = 0) {
    const scale = isBoss ? 1.5 : 1;
    const prowl = Math.sin(animTime * 0.004) * 0.8;
    
    if (isBoss) {
        const gradient = ctx.createRadialGradient(
            x + 21 * scale, y + 14 * scale, 0,
            x + 21 * scale, y + 14 * scale, 30 * scale
        );
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 15, y - 15, 72, 58);
    }
    
    ctx.fillStyle = isBoss ? '#4A4A4A' : '#696969';
    ctx.fillRect(x + 8 * scale, y + 12 * scale + prowl, 26 * scale, 16 * scale);
    ctx.fillRect(x, y + 8 * scale + prowl, 12 * scale, 12 * scale);
    
    const eyeGlow = isBoss ? 1 : 0.8 + Math.sin(animTime * 0.006) * 0.2;
    ctx.fillStyle = isBoss ? `rgba(255, 255, 0, ${eyeGlow})` : `rgba(255, 0, 0, ${eyeGlow})`;
    ctx.fillRect(x + 3 * scale, y + 10 * scale + prowl, 2 * scale, 2 * scale);
    ctx.fillRect(x + 7 * scale, y + 10 * scale + prowl, 2 * scale, 2 * scale);
}

function drawSkeleton(x, y, animTime = 0) {
    const rattle = Math.sin(animTime * 0.015) * 0.5;
    const sway = Math.sin(animTime * 0.003) * 0.8;
    
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(x + 12 + sway, y + 8, 16, 16);
    
    const eyeGlow = 0.6 + Math.sin(animTime * 0.008) * 0.4;
    ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
    ctx.fillRect(x + 16 + sway, y + 12, 3, 3);
    ctx.fillRect(x + 21 + sway, y + 12, 3, 3);
    
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(x + 18 + sway + rattle, y + 24, 4, 20);
    
    for (let i = 0; i < 3; i++) {
        const ribRattle = Math.sin(animTime * 0.012 + i * 0.5) * 0.3;
        ctx.fillRect(x + 12 + sway + ribRattle, y + 28 + i * 4, 16, 2);
    }
}

function drawBoltBox(x, y, animTime = 0) {
    const float = Math.sin(animTime * 0.004) * 2.5;
    const electricPulse = 0.5 + Math.sin(animTime * 0.008) * 0.5;
    
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x, y + float, 24, 16);
    
    const boltGlow = 0.8 + Math.sin(animTime * 0.01) * 0.2;
    ctx.fillStyle = `rgba(0, 255, 255, ${boltGlow})`;
    ctx.fillRect(x + 10, y + 6 + float, 2, 4);
    ctx.fillRect(x + 8, y + 7 + float, 6, 2);
    ctx.fillRect(x + 12, y + 8 + float, 4, 2);
}

function drawBullet(x, y, enhanced = false) {
    if (currentTheme === 'cowboy') {
        ctx.fillStyle = enhanced ? '#FF4500' : '#FFD700';
        ctx.fillRect(x, y, 8, 4);
    } else {
        ctx.fillStyle = enhanced ? '#FF4500' : '#00FFFF';
        ctx.fillRect(x, y, 8, 2);
        ctx.fillRect(x + 2, y - 1, 4, 4);
        
        const glowAlpha = 0.4 + Math.sin(Date.now() * 0.02 + x * 0.1) * 0.2;
        ctx.fillStyle = enhanced ? `rgba(255, 69, 0, ${glowAlpha})` : `rgba(0, 255, 255, ${glowAlpha})`;
        ctx.fillRect(x - 1, y - 1, 10, 4);
    }
}

function drawExplosion(x, y, frame) {
    const colors = currentTheme === 'Dungeon' ? 
        ['#00FFFF', '#87CEEB', '#FFFF00', '#FF4500'] :
        ['#FF4500', '#FF6347', '#FFD700', '#FFA500'];
    const maxFrame = 15;
    const size = (frame / maxFrame) * 20 + 10;
    
    ctx.fillStyle = colors[Math.floor(frame / 4) % colors.length];
    
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const particleX = x + Math.cos(angle) * size;
        const particleY = y + Math.sin(angle) * size;
        ctx.fillRect(particleX, particleY, 4, 4);
    }
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 2, y - 2, 4, 4);
}

function drawEnvironmentElement(element) {
    if (element.type === 'cloud') {
        drawCloud(element.x, element.y, element.width);
    } else if (element.type === 'torch') {
        drawTorch(element.x, element.y, element.flicker);
    }
}

function drawCloud(x, y, width) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, width/4, 0, Math.PI * 2);
    ctx.arc(x + width/3, y, width/3, 0, Math.PI * 2);
    ctx.arc(x + width/2, y, width/4, 0, Math.PI * 2);
    ctx.fill();
}

function drawTorch(x, y, flicker) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y + 15, 4, 25);
    
    ctx.fillStyle = '#654321';
    ctx.fillRect(x - 2, y + 10, 8, 8);
    
    const flameHeight = 12 + Math.sin(flicker) * 3;
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(x, y + 2, 4, flameHeight);
    
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(x + 1, y + 4, 2, flameHeight - 4);
}

function drawEffects() {
    // Draw blood particles
    for (const particle of bloodParticles) {
        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = `rgba(139, 0, 0, ${alpha})`;
        ctx.fillRect(particle.x, particle.y, 3, 3);
    }

    // Draw lightning effects
    for (const effect of lightningEffects) {
        const alpha = effect.life / effect.maxLife;
        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.lineWidth = 2;
        
        for (let i = 0; i < effect.branches; i++) {
            ctx.beginPath();
            ctx.moveTo(effect.x, effect.y);
            
            const endX = effect.x + (Math.random() - 0.5) * 40;
            const endY = effect.y + (Math.random() - 0.5) * 40;
            
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }

    // Draw score popups
    for (const popup of scorePopups) {
        const alpha = popup.life / popup.maxLife;
        const color = currentTheme === 'Dungeon' ? 
            `rgba(255, 255, 0, ${alpha})` : 
            `rgba(255, 215, 0, ${alpha})`;
        ctx.fillStyle = color;
        ctx.font = '16px Inter';
        ctx.fillText(`+${popup.points}`, popup.x, popup.y);
    }

    // Draw double jump particles
    for (const particle of doubleJumpParticles) {
        const alpha = particle.life / particle.maxLife;
        
        if (currentTheme === 'cowboy') {
            ctx.fillStyle = `rgba(210, 180, 140, ${alpha * 0.8})`;
        } else {
            ctx.fillStyle = `rgba(138, 43, 226, ${alpha * 0.9})`;
        }
        
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
}

// Main Render Function
function render() {
    if (!needsRedraw && gameState === GameState.PLAYING) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw environment elements
    for (const element of environmentElements) {
        drawEnvironmentElement(element);
    }
    
    // Draw ground
    const theme = gameCache.getTheme();
    ctx.fillStyle = theme.groundColor;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    
    // Floor details
    ctx.fillStyle = theme.floorDetailColor;
    for (let x = 0; x < canvas.width; x += 25) {
        if (currentTheme === 'cowboy') {
            ctx.fillRect(x, groundY + 12, 12, 3);
            ctx.fillRect(x + 6, groundY + 25, 10, 2);
        } else {
            ctx.fillRect(x, groundY + 10, 30, 3);
            ctx.fillRect(x + 6, groundY + 25, 25, 2);
        }
    }
    
    // Draw player
    const isDead = lives <= 0;
    drawPlayer(player.x, player.y, player.facingDirection === -1, isDead);
    
    // Draw obstacles
    for (const obstacle of obstacles) {
        drawObstacle(obstacle);
        
        // Health bars for multi-hit enemies
        if (obstacle.health > 1 && obstacle.type !== 'bulletBox' && obstacle.type !== 'boltBox') {
            const barWidth = obstacle.width;
            const barHeight = 4;
            const healthPercent = obstacle.health / obstacle.maxHealth;
            
            ctx.fillStyle = '#8B0000';
            ctx.fillRect(obstacle.x, obstacle.y - 8, barWidth, barHeight);
            
            const healthColor = (obstacle.type === 'boss' || obstacle.type === 'alphaWolf') ? '#FFFF00' : '#00FF00';
            ctx.fillStyle = healthColor;
            ctx.fillRect(obstacle.x, obstacle.y - 8, barWidth * healthPercent, barHeight);
        }
    }
    
    // Draw bullets
    for (const bullet of bulletsFired) {
        drawBullet(bullet.x, bullet.y, bullet.enhanced);
    }
    
    // Draw explosions
    for (const explosion of explosions) {
        drawExplosion(explosion.x, explosion.y, explosion.frame);
    }
    
    // Draw all effects
    drawEffects();
    
    needsRedraw = false;
}
