// ============================================
// The Chrono-Splinter - Drone Companion
// ============================================

class Drone {
    constructor(player) {
        this.player = player;
        this.orbitAngle = 0;
        this.orbitRadius = 60;
        this.orbitSpeed = 0.002; // Rad per ms

        this.x = player.x;
        this.y = player.y;
        this.width = 15;
        this.height = 15;

        this.fireTimer = 0;
        this.fireRate = 500; // ms
        this.range = 400;

        this.color = '#1e90ff'; // DodgerBlue
        this.active = true;
    }

    update(deltaTime, enemies, bulletManager) {
        // Orbit player
        this.orbitAngle += this.orbitSpeed * deltaTime;
        this.x = this.player.x + this.player.width / 2 + Math.cos(this.orbitAngle) * this.orbitRadius - this.width / 2;
        this.y = this.player.y + this.player.height / 2 + Math.sin(this.orbitAngle) * this.orbitRadius - this.height / 2;

        // Auto-fire logic
        this.fireTimer += deltaTime;
        if (this.fireTimer >= this.fireRate) {
            this.tryFire(enemies, bulletManager);
        }
    }

    tryFire(enemies, bulletManager) {
        // Find nearest enemy
        let nearest = null;
        let minDist = this.range;

        for (const enemy of enemies) {
            if (!enemy.active) continue;
            const dist = Utils.distance(this.x, this.y, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        }

        if (nearest) {
            // Calculate angle to enemy
            const angle = Utils.angle(this.x + this.width / 2, this.y + this.height / 2, nearest.x + nearest.width / 2, nearest.y + nearest.height / 2);

            // Fire bullet
            bulletManager.createPlayerBullet(
                this.x + this.width / 2,
                this.y + this.height / 2,
                angle,
                5, // Drone damage (lower than player)
                { homing: true } // Drones shoot homing missiles!
            );

            this.fireTimer = 0;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        // Rotate drone itself (spin)
        ctx.rotate(this.orbitAngle * 2);

        // Drone body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(this.width / 2, 0);
        ctx.lineTo(0, this.height / 2);
        ctx.lineTo(-this.width / 2, 0);
        ctx.closePath();
        ctx.fill();

        // Glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.stroke();

        ctx.restore();
    }
}
