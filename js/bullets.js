// ============================================
// The Chrono-Splinter - Bullet System
// ============================================

class Bullet {
    constructor(x, y, angle, damage, isPlayerBullet, options = {}) {
        this.x = x;
        this.y = y;
        this.width = BULLET.WIDTH;
        this.height = BULLET.HEIGHT;
        this.angle = angle;
        this.speed = BULLET.SPEED;
        this.damage = damage;
        this.isPlayerBullet = isPlayerBullet;
        this.active = true;

        // Special properties
        this.piercing = options.piercing || false;
        this.homing = options.homing || false;
        this.ricochet = options.ricochet || false;
        this.ricochetCount = options.ricochet ? 3 : 0;
        this.plasma = options.plasma || false;

        if (this.plasma) {
            this.width = 40;
            this.height = 80;
            this.damage *= 2; // Further boost (already 5x from player)
            this.speed *= 0.8; // Slower, heavier feel
            this.color = '#00ffff'; // Cyan
        }

        // Visual
        this.trail = [];
        this.color = this.plasma ? '#00ffff' : (isPlayerBullet ? BULLET.COLOR : COLORS.SECONDARY);
    }

    update(deltaTime, enemies, player) {
        // Homing logic (only for player bullets)
        if (this.homing && this.isPlayerBullet && enemies.length > 0) {
            // Find nearest enemy
            let nearest = null;
            let nearestDist = Infinity;

            for (const enemy of enemies) {
                const dist = Utils.distance(this.x, this.y, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = enemy;
                }
            }

            if (nearest && nearestDist < 300) {
                const targetAngle = Utils.angle(this.x, this.y, nearest.x + nearest.width / 2, nearest.y + nearest.height / 2);
                // Gradually turn towards target
                const turnSpeed = 0.1;
                let angleDiff = targetAngle - this.angle;

                // Normalize angle difference
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                this.angle += Utils.clamp(angleDiff, -turnSpeed, turnSpeed);
            }
        }

        // Store trail position
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) this.trail.shift();

        // Move
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Ricochet off screen edges
        if (this.ricochet && this.ricochetCount > 0) {
            if (this.x <= 0 || this.x >= GAME.WIDTH) {
                this.angle = Math.PI - this.angle;
                this.x = Utils.clamp(this.x, 1, GAME.WIDTH - 1);
                this.ricochetCount--;
            }
            if (this.y <= 50 || this.y >= GAME.HEIGHT) {
                this.angle = -this.angle;
                this.y = Utils.clamp(this.y, 51, GAME.HEIGHT - 1);
                this.ricochetCount--;
            }
        } else {
            // Check if off screen
            if (this.x < -20 || this.x > GAME.WIDTH + 20 ||
                this.y < -20 || this.y > GAME.HEIGHT + 20) {
                this.active = false;
            }
        }
    }

    draw(ctx) {
        ctx.save();

        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i / this.trail.length) * 0.5;
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(
                this.trail[i].x - this.width / 4,
                this.trail[i].y - this.height / 4,
                this.width / 2,
                this.height / 2
            );
        }

        // Draw bullet
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;

        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2);

        // Bullet shape
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.restore();
    }

    /**
     * Called when bullet hits something
     */
    onHit() {
        if (!this.piercing) {
            this.active = false;
        }
    }
}

// ============================================
// Bullet Manager
// ============================================

class BulletManager {
    constructor() {
        this.playerBullets = [];
        this.enemyBullets = [];
    }

    createPlayerBullet(x, y, angle, damage, options = {}) {
        this.playerBullets.push(new Bullet(x, y, angle, damage, true, options));
    }

    createEnemyBullet(x, y, angle, damage) {
        const bullet = new Bullet(x, y, angle, damage, false);
        bullet.speed = 6; // Slower than player bullets
        this.enemyBullets.push(bullet);
    }

    update(deltaTime, enemies, player) {
        // Update player bullets
        for (const bullet of this.playerBullets) {
            bullet.update(deltaTime, enemies, player);
        }

        // Update enemy bullets
        for (const bullet of this.enemyBullets) {
            bullet.update(deltaTime, enemies, player);
        }

        // Remove inactive bullets
        this.playerBullets = this.playerBullets.filter(b => b.active);
        this.enemyBullets = this.enemyBullets.filter(b => b.active);
    }

    draw(ctx) {
        for (const bullet of this.playerBullets) {
            bullet.draw(ctx);
        }
        for (const bullet of this.enemyBullets) {
            bullet.draw(ctx);
        }
    }

    clear() {
        this.playerBullets = [];
        this.enemyBullets = [];
    }
}
