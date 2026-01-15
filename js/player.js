// ============================================
// The Chrono-Splinter - Player Ship
// ============================================

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = PLAYER.WIDTH;
        this.height = PLAYER.HEIGHT;

        // Stats
        this.speed = PLAYER.SPEED;
        this.atk = PLAYER.BASE_ATK;
        this.def = PLAYER.BASE_DEF;
        this.fireRate = PLAYER.FIRE_RATE;

        // State
        this.lives = PLAYER.MAX_LIVES;
        this.coins = 0;
        this.score = 0;
        this.lastFireTime = 0;
        this.invincible = false;
        this.invincibleUntil = 0;

        // Weapon mods (max 2)
        this.weaponMods = [];

        // Temporary power-ups
        this.activePowerups = {};

        // Upgrade levels (0-5)
        this.upgrades = {
            ATK: 0,
            DEF: 0,
            SPD: 0,
            FIRE_RATE: 0,
        };

        // Drones
        this.drones = [];

        // Visual
        this.thrusterFlicker = 0;
        this.tilt = 0; // -1 to 1 (Left to Right)

        // Plasma Cannon State
        this.plasmaTimer = 0;
        this.plasmaThreshold = 2000; // 2 seconds to charge
    }

    /**
     * Update player state
     */
    update(deltaTime, particleManager, enemyManager, bulletManager) {
        // Check for touch/drag target first
        const touchTarget = Input.getTouchTarget();

        if (touchTarget) {
            // Direct positioning mode - move towards touch point
            // Center the ship on the touch point
            const targetX = touchTarget.x - this.width / 2;
            const targetY = touchTarget.y - this.height / 2;

            // Smooth movement towards target
            const moveSpeed = this.speed * 1.5;
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 2) {
                // Move towards target
                const moveX = (dx / dist) * Math.min(moveSpeed, dist);
                const moveY = (dy / dist) * Math.min(moveSpeed, dist);
                this.x += moveX;
                this.y += moveY;
            } else {
                // Snap to target when close
                this.x = targetX;
                this.y = targetY;
            }
        } else {
            // Keyboard/Gamepad movement
            const { dx, dy } = Input.getMovement();
            this.x += dx * this.speed;
            this.y += dy * this.speed;

            // Calculate tilt
            this.tilt = Utils.lerp(this.tilt, dx, 0.1);
        }

        // Keep in bounds (respect HUD at top)
        this.x = Utils.clamp(this.x, 0, GAME.WIDTH - this.width);
        this.y = Utils.clamp(this.y, 50, GAME.HEIGHT - this.height);

        // Handle invincibility
        if (this.invincible && Date.now() > this.invincibleUntil) {
            this.invincible = false;
        }

        // Update active power-ups
        this.updatePowerups();

        // Thruster animation & particles
        this.thrusterFlicker = (this.thrusterFlicker + 1) % 10;

        // Spawn thruster particles (if manager provided)
        if (particleManager && Math.random() < 0.3) {
            particleManager.spawnTrail(
                this.x + this.width / 2,
                this.y + this.height,
                COLORS.SECONDARY || '#ff6b35'
            );
        }

        // Update drones
        for (const drone of this.drones) {
            drone.update(deltaTime, enemyManager?.enemies || [], bulletManager);
        }
    }

    /**
     * Try to fire bullets
     */
    tryFire(bulletManager) {
        const now = Date.now();
        const effectiveFireRate = this.activePowerups.RAPID_FIRE
            ? this.fireRate / 2
            : this.fireRate;

        if (now - this.lastFireTime >= effectiveFireRate) {
            this.fire(bulletManager);
            this.lastFireTime = now;
        }
    }

    /**
     * Fire bullets based on current weapon mods
     */
    fire(bulletManager) {
        const bulletX = this.x + this.width / 2;
        const bulletY = this.y;

        // Base shot
        const bullets = [{ x: bulletX, y: bulletY, angle: -Math.PI / 2 }];

        // Check weapon mods
        if (this.hasWeaponMod('SPREAD_SHOT')) {
            bullets.push(
                { x: bulletX, y: bulletY, angle: -Math.PI / 2 - 0.2 },
                { x: bulletX, y: bulletY, angle: -Math.PI / 2 + 0.2 }
            );
        }

        if (this.hasWeaponMod('REAR_GUN')) {
            bullets.push({ x: bulletX, y: this.y + this.height, angle: Math.PI / 2 });
        }

        // Create bullets
        bullets.forEach(b => {
            bulletManager.createPlayerBullet(
                b.x,
                b.y,
                b.angle,
                this.atk,
                {
                    piercing: this.hasWeaponMod('PIERCING'),
                    homing: this.hasWeaponMod('HOMING'),
                    ricochet: this.hasWeaponMod('RICOCHET'),
                }
            );
        });

        // Play laser sound
        Audio.play('laser');

        // Plasma Cannon Logic
        if (this.hasWeaponMod('PLASMA_CANNON')) {
            // Charge up
            this.plasmaTimer += PLAYER.FIRE_RATE;

            // Visual charge effect (handled in draw or particles?)

            if (this.plasmaTimer >= this.plasmaThreshold) {
                this.firePlasma(bulletManager);
                this.plasmaTimer = 0;
            }
        } else {
            this.plasmaTimer = 0;
        }
    }

    firePlasma(bulletManager) {
        bulletManager.createPlayerBullet(
            this.x + this.width / 2,
            this.y,
            -Math.PI / 2,
            this.atk * 5, // 5x Damage
            { plasma: true, piercing: true }
        );
        Audio.play('explosion'); // Heavy sound for now

        // recoil?
        this.y += 5;
    }

    /**
     * Take damage
     */
    takeDamage(amount) {
        if (this.invincible) return false;

        // Check for shield power-up
        if (this.activePowerups.SHIELD) {
            this.activePowerups.SHIELD.hits--;
            if (this.activePowerups.SHIELD.hits <= 0) {
                delete this.activePowerups.SHIELD;
            }
            return false;
        }

        // Apply defense reduction
        const actualDamage = Math.max(1, amount * (1 - this.def / 100));

        this.lives--;

        // Visual Feedback
        Game.triggerShake(10, 300);
        Game.addFloatingText(this.x, this.y, `-${Math.round(actualDamage)}`, '#ff0000');

        this.invincible = true;
        this.invincibleUntil = Date.now() + PLAYER.INVINCIBILITY_TIME;

        // Lose weapon mods on death
        if (this.lives <= 0) {
            this.weaponMods = [];
        }

        return this.lives <= 0;
    }

    /**
     * Collect coins
     */
    addCoins(amount) {
        this.coins += amount;
    }

    /**
     * Add score
     */
    addScore(points) {
        this.score += points;
    }

    /**
     * Add a weapon mod
     */
    addWeaponMod(type) {
        if (this.weaponMods.length >= 2) {
            // Remove oldest mod
            this.weaponMods.shift();
        }
        this.weaponMods.push(type);

        // Initialize Drone if added
        if (type === 'DRONE') {
            this.drones.push(new Drone(this));
        }
    }

    /**
     * Check if player has a weapon mod
     */
    hasWeaponMod(type) {
        return this.weaponMods.includes(type);
    }

    /**
     * Add a temporary power-up
     */
    addPowerup(type, data) {
        this.activePowerups[type] = {
            ...data,
            expiresAt: data.duration ? Date.now() + data.duration : null,
        };
    }

    /**
     * Update active power-ups
     */
    updatePowerups() {
        const now = Date.now();
        for (const type in this.activePowerups) {
            const powerup = this.activePowerups[type];
            if (powerup.expiresAt && now > powerup.expiresAt) {
                delete this.activePowerups[type];
            }
        }
    }

    /**
     * Draw the player ship
     */
    draw(ctx) {
        // Draw drones first (under/around ship)
        for (const drone of this.drones) {
            drone.draw(ctx);
        }

        ctx.save();

        // Apply tilt rotation/skew
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        ctx.translate(cx, cy);
        ctx.rotate(this.tilt * 0.2); // Slight bank angle
        ctx.translate(-cx, -cy);

        // Invincibility blink
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        const x = this.x;
        const y = this.y;
        const w = this.width;
        const h = this.height;

        // --- THE EPOCH ---

        // Engine Trails (Internal Glow)
        ctx.fillStyle = COLORS.SECONDARY; // Orange glow
        ctx.globalAlpha = 0.6;
        const flicker = (this.thrusterFlicker / 10) * 5;
        // Left Engine
        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, y + h * 0.8);
        ctx.lineTo(x + w * 0.3, y + h + 10 + flicker);
        ctx.lineTo(x + w * 0.4, y + h * 0.8);
        ctx.fill();
        // Right Engine
        ctx.beginPath();
        ctx.moveTo(x + w * 0.6, y + h * 0.8);
        ctx.lineTo(x + w * 0.7, y + h + 10 + flicker);
        ctx.lineTo(x + w * 0.8, y + h * 0.8);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Wings (Main Hull) - Sleek Forward Swept
        ctx.fillStyle = '#e0e0e0'; // Platinum Hull
        ctx.beginPath();
        ctx.moveTo(x + w * 0.5, y); // Nose
        ctx.lineTo(x + w, y + h * 0.6); // Right Wing Tip
        ctx.lineTo(x + w * 0.8, y + h); // Right Engine Rear
        ctx.lineTo(x + w * 0.5, y + h * 0.8); // Rear Center
        ctx.lineTo(x + w * 0.2, y + h); // Left Engine Rear
        ctx.lineTo(x, y + h * 0.6); // Left Wing Tip
        ctx.closePath();
        ctx.fill();

        // Dark plating / Detail
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.5, y + h * 0.2);
        ctx.lineTo(x + w * 0.7, y + h * 0.7);
        ctx.lineTo(x + w * 0.3, y + h * 0.7);
        ctx.fill();

        // Cyan Energy Lines (Tron-like)
        ctx.strokeStyle = COLORS.PRIMARY; // Cyan
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Center line
        ctx.moveTo(x + w * 0.5, y + 5);
        ctx.lineTo(x + w * 0.5, y + h * 0.9);
        // Wing lines
        ctx.moveTo(x + w * 0.2, y + h * 0.6);
        ctx.lineTo(x + w * 0.4, y + h * 0.4);
        ctx.moveTo(x + w * 0.8, y + h * 0.6);
        ctx.lineTo(x + w * 0.6, y + h * 0.4);
        ctx.stroke();

        // Cockpit
        ctx.fillStyle = '#0984e3'; // Bright Blue Glass
        ctx.beginPath();
        ctx.ellipse(
            x + w * 0.5,
            y + h * 0.45,
            w * 0.1,
            h * 0.15,
            0, 0, Math.PI * 2
        );
        ctx.fill();
        // Cockpit Glint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(
            x + w * 0.52,
            y + h * 0.42,
            w * 0.03,
            h * 0.05,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        // Shield visual
        if (this.activePowerups.SHIELD) {
            ctx.strokeStyle = COLORS.COINS;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.3;
            ctx.beginPath();
            ctx.ellipse(
                cx, cy,
                this.width * 0.8,
                this.height * 0.7,
                0, 0, Math.PI * 2
            );
            ctx.stroke();
        }

        ctx.restore();
    }
}
