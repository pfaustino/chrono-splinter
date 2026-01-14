// ============================================
// The Chrono-Splinter - Enemy System
// ============================================

class Enemy {
    constructor(type, x, y) {
        const config = ENEMY_TYPES[type];

        this.type = type;
        this.x = x;
        this.y = y;
        this.width = config.width;
        this.height = config.height;
        this.speed = config.speed;
        this.health = config.health;
        this.maxHealth = config.health;
        this.points = config.points;
        this.coins = config.coins;
        this.color = config.color;
        this.splitInto = config.splitInto || 0;

        this.active = true;
        this.flashTimer = 0;

        // Movement pattern
        this.pattern = 'dive'; // dive, sine, zigzag, orbit
        this.patternTimer = 0;
        this.patternPhase = Math.random() * Math.PI * 2;

        // Glitch effect (temporal flickering)
        this.glitchOffset = { x: 0, y: 0 };
        this.glitchTimer = 0;
    }

    update(deltaTime, player, bulletManager) {
        this.patternTimer += deltaTime;

        // Apply movement pattern
        switch (this.pattern) {
            case 'dive':
                this.y += this.speed;
                break;

            case 'sine':
                this.y += this.speed;
                this.x += Math.sin(this.patternTimer / 500 + this.patternPhase) * 2;
                break;

            case 'zigzag':
                this.y += this.speed * 0.7;
                this.x += Math.sin(this.patternTimer / 300) > 0 ? this.speed : -this.speed;
                break;

            case 'orbit':
                // Circle around a point
                const centerX = GAME.WIDTH / 2;
                const centerY = 200;
                const radius = 150;
                this.x = centerX + Math.cos(this.patternTimer / 1000 + this.patternPhase) * radius;
                this.y = centerY + Math.sin(this.patternTimer / 1000 + this.patternPhase) * radius * 0.5;
                break;
        }

        // Glitch effect
        this.glitchTimer += deltaTime;
        if (this.glitchTimer > 100) {
            this.glitchTimer = 0;
            if (Math.random() < 0.3) {
                this.glitchOffset.x = Utils.random(-3, 3);
                this.glitchOffset.y = Utils.random(-2, 2);
            } else {
                this.glitchOffset.x = 0;
                this.glitchOffset.y = 0;
            }
        }

        // Flash timer
        if (this.flashTimer > 0) {
            this.flashTimer -= deltaTime;
        }

        // Wrap around when off screen (bottom) - recycle back to top
        if (this.y > GAME.HEIGHT + 50) {
            this.y = -50;
            this.x = Utils.random(50, GAME.WIDTH - 50 - this.width);
            // Randomize pattern on re-entry for variety
            const patterns = ['dive', 'sine', 'zigzag'];
            this.pattern = Utils.randomChoice(patterns);
            this.patternPhase = Math.random() * Math.PI * 2;
        }

        // Keep within horizontal bounds
        if (this.x < -this.width) {
            this.x = GAME.WIDTH;
        } else if (this.x > GAME.WIDTH) {
            this.x = -this.width;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.flashTimer = 100;

        if (this.health <= 0) {
            this.active = false;
            return true; // Enemy died
        }
        return false;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();

        const drawX = this.x + this.glitchOffset.x;
        const drawY = this.y + this.glitchOffset.y;

        // Flash white when hit
        if (this.flashTimer > 0) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = this.color;
        }

        // Draw based on enemy type
        switch (this.type) {
            case 'DRIFTER':
                this.drawDrifter(ctx, drawX, drawY);
                break;
            case 'STITCHER':
                this.drawStitcher(ctx, drawX, drawY);
                break;
            case 'WRAITH':
                this.drawWraith(ctx, drawX, drawY);
                break;
            case 'HARVESTER':
                this.drawHarvester(ctx, drawX, drawY);
                break;
            case 'SPLITTER':
                this.drawSplitter(ctx, drawX, drawY);
                break;
            default:
                // Default rectangle
                ctx.fillRect(drawX, drawY, this.width, this.height);
        }

        // Health bar (if damaged)
        if (this.health < this.maxHealth) {
            const barWidth = this.width;
            const barHeight = 4;
            const healthPercent = this.health / this.maxHealth;

            ctx.fillStyle = '#333';
            ctx.fillRect(drawX, drawY - 8, barWidth, barHeight);
            ctx.fillStyle = COLORS.HEALTH;
            ctx.fillRect(drawX, drawY - 8, barWidth * healthPercent, barHeight);
        }

        ctx.restore();
    }

    drawDrifter(ctx, x, y) {
        // Angular, aggressive shape
        ctx.beginPath();
        ctx.moveTo(x + this.width / 2, y + this.height);
        ctx.lineTo(x + this.width, y + this.height * 0.3);
        ctx.lineTo(x + this.width * 0.7, y);
        ctx.lineTo(x + this.width * 0.3, y);
        ctx.lineTo(x, y + this.height * 0.3);
        ctx.closePath();
        ctx.fill();
    }

    drawStitcher(ctx, x, y) {
        // Circular repair drone
        ctx.beginPath();
        ctx.arc(x + this.width / 2, y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Cross symbol
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + this.width / 2, y + 5);
        ctx.lineTo(x + this.width / 2, y + this.height - 5);
        ctx.moveTo(x + 5, y + this.height / 2);
        ctx.lineTo(x + this.width - 5, y + this.height / 2);
        ctx.stroke();
    }

    drawWraith(ctx, x, y) {
        // Ghost-like stealth bomber
        ctx.globalAlpha = 0.7 + Math.sin(Date.now() / 200) * 0.3;
        ctx.beginPath();
        ctx.moveTo(x + this.width / 2, y);
        ctx.bezierCurveTo(
            x + this.width, y + this.height * 0.3,
            x + this.width, y + this.height,
            x + this.width / 2, y + this.height
        );
        ctx.bezierCurveTo(
            x, y + this.height,
            x, y + this.height * 0.3,
            x + this.width / 2, y
        );
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    drawHarvester(ctx, x, y) {
        // Big chunky cargo ship
        ctx.fillRect(x + 5, y, this.width - 10, this.height);
        ctx.fillRect(x, y + 10, this.width, this.height - 20);

        // Cargo bay lights
        ctx.fillStyle = COLORS.COINS;
        ctx.fillRect(x + 10, y + 15, 8, 8);
        ctx.fillRect(x + this.width - 18, y + 15, 8, 8);
    }

    drawSplitter(ctx, x, y) {
        // Hexagonal shape that splits
        const sides = 6;
        const radius = this.width / 2;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
            const px = x + this.width / 2 + Math.cos(angle) * radius;
            const py = y + this.height / 2 + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Split line
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + this.width / 2, y);
        ctx.lineTo(x + this.width / 2, y + this.height);
        ctx.stroke();
    }
}

// ============================================
// Enemy Manager
// ============================================

class EnemyManager {
    constructor() {
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // ms between spawns
        this.waveNumber = 0;
    }

    update(deltaTime, player, bulletManager) {
        // Update all enemies
        for (const enemy of this.enemies) {
            enemy.update(deltaTime, player, bulletManager);
        }

        // Remove inactive enemies
        this.enemies = this.enemies.filter(e => e.active);

        // Spawn new enemies
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnWave();
        }
    }

    spawnWave() {
        this.waveNumber++;

        // Spawn 3-6 enemies in a wave
        const count = Utils.randomInt(3, 6);
        const types = ['DRIFTER', 'DRIFTER', 'DRIFTER', 'STITCHER', 'WRAITH', 'SPLITTER'];

        // Add Harvesters occasionally
        if (this.waveNumber % 5 === 0) {
            types.push('HARVESTER');
        }

        for (let i = 0; i < count; i++) {
            const type = Utils.randomChoice(types);
            const x = Utils.random(50, GAME.WIDTH - 50 - ENEMY_TYPES[type].width);
            const y = -50 - i * 40;

            const enemy = new Enemy(type, x, y);

            // Assign movement pattern
            const patterns = ['dive', 'sine', 'zigzag'];
            enemy.pattern = Utils.randomChoice(patterns);

            this.enemies.push(enemy);
        }
    }

    /**
     * Spawn split enemies when a Splitter dies
     */
    spawnSplitEnemies(parent) {
        for (let i = 0; i < parent.splitInto; i++) {
            const offsetX = i === 0 ? -20 : 20;
            const mini = new Enemy('DRIFTER', parent.x + offsetX, parent.y);
            mini.health = 10;
            mini.maxHealth = 10;
            mini.width = 20;
            mini.height = 20;
            mini.pattern = 'zigzag';
            this.enemies.push(mini);
        }
    }

    draw(ctx) {
        for (const enemy of this.enemies) {
            enemy.draw(ctx);
        }
    }

    clear() {
        this.enemies = [];
        this.waveNumber = 0;
    }
}
