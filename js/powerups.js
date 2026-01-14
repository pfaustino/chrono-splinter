// ============================================
// The Chrono-Splinter - Power-up System
// ============================================

class Powerup {
    constructor(type, x, y) {
        this.type = type;
        const config = POWERUP_TYPES[type];

        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.color = config.color;
        this.symbol = config.symbol;
        this.isWeapon = config.weapon || false;
        this.duration = config.duration || 0;
        this.hits = config.hits || 0;

        this.active = true;
        this.speed = 1.5;
        this.bobPhase = Math.random() * Math.PI * 2;
        this.rotationAngle = 0;
    }

    update(deltaTime) {
        // Float downward
        this.y += this.speed;

        // Bob animation
        this.bobPhase += deltaTime / 200;

        // Rotation
        this.rotationAngle += deltaTime / 500;

        // Remove if off screen
        if (this.y > GAME.HEIGHT + 50) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.save();

        const bobOffset = Math.sin(this.bobPhase) * 3;
        const drawY = this.y + bobOffset;

        // Outer glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;

        // Background circle
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, drawY + this.height / 2, this.width / 2 + 5, 0, Math.PI * 2);
        ctx.fill();

        // Main body
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, drawY + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Symbol
        ctx.fillStyle = this.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, this.x + this.width / 2, drawY + this.height / 2);

        ctx.restore();
    }
}

// ============================================
// Power-up Manager
// ============================================

class PowerupManager {
    constructor() {
        this.powerups = [];
    }

    /**
     * Spawn a random power-up at position
     */
    spawn(x, y) {
        // 20% chance to spawn a power-up
        if (Math.random() > 0.20) return;

        const allTypes = Object.keys(POWERUP_TYPES);
        const type = Utils.randomChoice(allTypes);

        this.powerups.push(new Powerup(type, x, y));
    }

    /**
     * Spawn a specific power-up
     */
    spawnSpecific(type, x, y) {
        this.powerups.push(new Powerup(type, x, y));
    }

    update(deltaTime) {
        for (const powerup of this.powerups) {
            powerup.update(deltaTime);
        }
        this.powerups = this.powerups.filter(p => p.active);
    }

    draw(ctx) {
        for (const powerup of this.powerups) {
            powerup.draw(ctx);
        }
    }

    clear() {
        this.powerups = [];
    }
}
