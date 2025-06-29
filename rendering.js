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
    ctx.fillRect(x + 12, y + 12, 16, 16); // Moved down to accommodate taller hat
    
    // Eyes
    ctx.fillStyle = isDead ? '#FF0000' : '#000';
    ctx.fillRect(x + 16, y + 16, 2, 2); // Moved down
    ctx.fillRect(x + 22, y + 16, 2, 2); // Moved down
    
    // Mustache (classic cowboy feature)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 17, y + 21, 6, 2); // Moved down
    ctx.fillRect(x + 16, y + 22, 2, 1); // Moved down
    ctx.fillRect(x + 22, y + 22, 2, 1); // Moved down
    
    // Body (beige/tan color)
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(x + 10, y + 28, 20, 20);
    
    // Sheriff badge (smaller)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 18, y + 32, 4, 4); // Smaller badge
    ctx.fillStyle = '#B8860B';
    ctx.fillRect(x + 18, y + 32, 4, 4); // Badge inner area
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 19, y + 33, 2, 2); // Badge center star
    
    // Enhanced belt with buckle
    ctx.fillStyle = '#8B4513'; // Brown leather belt
    ctx.fillRect(x + 8, y + 44, 24, 4); // Moved down
    
    // Belt buckle
    ctx.fillStyle = '#C0C0C0'; // Silver buckle
    ctx.fillRect(x + 17, y + 43, 6, 6); // Moved down
    ctx.fillStyle = '#FFD700'; // Gold accent
    ctx.fillRect(x + 18, y + 44, 4, 4); // Moved down
    ctx.fillStyle = '#8B4513'; // Buckle center hole
    ctx.fillRect(x + 19, y + 45, 2, 2); // Moved down
    
    // Belt studs/decoration
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x + 12, y + 45, 1, 2); // Moved down
    ctx.fillRect(x + 27, y + 45, 1, 2); // Moved down
    
    // Arms (beige/tan color)
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(x + 6, y + 30, 6, 12); // Moved down
    ctx.fillRect(x + 28, y + 30, 6, 12); // Moved down
    
    // Legs (blue jeans) - REDUCED HEIGHT FROM 16px TO 10px (-6px)
    ctx.fillStyle = '#4169E1'; // Blue jeans
    ctx.fillRect(x + 14, y + 48, 6, 10); // CHANGED: was 16, now 10 (-6px)
    ctx.fillRect(x + 20, y + 48, 6, 10); // CHANGED: was 16, now 10 (-6px)
    
    // Enhanced cowboy boots (brown) - MOVED UP 4px, REDUCED HEIGHT 2px
    ctx.fillStyle = '#8B4513'; // Brown leather boots
    ctx.fillRect(x + 12, y + 58, 10, 6); // CHANGED: was y + 62, height 8 -> y + 58, height 6
    ctx.fillRect(x + 18, y + 58, 10, 6); // CHANGED: was y + 62, height 8 -> y + 58, height 6
    
    // Boot heels - ADJUSTED
    ctx.fillStyle = '#654321'; // Darker brown for heels
    ctx.fillRect(x + 12, y + 62, 10, 2); // CHANGED: was y + 66, height 4 -> y + 62, height 2
    ctx.fillRect(x + 18, y + 62, 10, 2); // CHANGED: was y + 66, height 4 -> y + 62, height 2
    
    // Boot spurs - ADJUSTED
    ctx.fillStyle = '#C0C0C0'; // Silver spurs
    ctx.fillRect(x + 10, y + 62, 2, 2); // CHANGED: was y + 66 -> y + 62
    ctx.fillRect(x + 28, y + 62, 2, 2); // CHANGED: was y + 66 -> y + 62
    
    // Boot stitching details - ADJUSTED
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(x + 14, y + 60, 6, 1); // CHANGED: was y + 64 -> y + 60
    ctx.fillRect(x + 20, y + 60, 6, 1); // CHANGED: was y + 64 -> y + 60
    
    // Boot toe caps - ADJUSTED
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 12, y + 58, 3, 3); // CHANGED: was y + 62, height 4 -> y + 58, height 3
    ctx.fillRect(x + 25, y + 58, 3, 3); // CHANGED: was y + 62, height 4 -> y + 58, height 3

    // Gun (existing code) - ADJUSTED
    if (bullets > 0) {
        ctx.fillStyle = activeBuffs.multiShot > 0 ? '#FF4500' : '#d9d9d9';
        ctx.fillRect(x + 34, y + 34, 12, 3); // Moved down
        ctx.fillRect(x + 30, y + 36, 6, 8); // Moved down
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(x + 32, y + 39, 2, 3); // Moved down
        
        if (activeBuffs.multiShot > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 35, y + 33, 10, 1); // Moved down
            ctx.fillRect(x + 35, y + 37, 10, 1); // Moved down
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
    const boltGlow = 0.7 + Math.sin(Date.now() * 0.008) * 0.3;
    ctx.fillStyle = '#C0C0C0'; // Silver bolts
    ctx.fillRect(x + 2, y + 16, 6, 3); // Left bolt - larger
    ctx.fillRect(x + 32, y + 16, 6, 3); // Right bolt - larger
    
    // Bolt cores (darker)
    ctx.fillStyle = '#696969';
    ctx.fillRect(x + 3, y + 16, 4, 3);
    ctx.fillRect(x + 33, y + 16, 4, 3);
    
    // Electrical sparks around bolts
    if (bullets > 0 || Math.random() > 0.7) {
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
    ctx.fillStyle = '#2F4F4F'; // Dark lab coat (using original body color)
    ctx.fillRect(x + 6, y + 26, 28, 20); // Main coat
    //
