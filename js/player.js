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

        // Visual
        this.thrusterFlicker = 0;
    }

    /**
     * Update player state
     */
    update(deltaTime) {
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

        // Thruster animation
        this.thrusterFlicker = (this.thrusterFlicker + 1) % 10;
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
        ctx.save();

        // Invincibility blink
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Ship body (The Epoch)
        ctx.fillStyle = COLORS.PRIMARY;
        ctx.beginPath();
        // Main hull
        ctx.moveTo(this.x + this.width / 2, this.y); // Nose
        ctx.lineTo(this.x + this.width, this.y + this.height * 0.7); // Right wing
        ctx.lineTo(this.x + this.width * 0.7, this.y + this.height); // Right engine
        ctx.lineTo(this.x + this.width * 0.3, this.y + this.height); // Left engine
        ctx.lineTo(this.x, this.y + this.height * 0.7); // Left wing
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width / 2,
            this.y + this.height * 0.4,
            this.width * 0.15,
            this.height * 0.2,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        // Thruster glow
        const thrusterSize = 5 + (this.thrusterFlicker < 5 ? 3 : 0);
        ctx.fillStyle = COLORS.SECONDARY;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.35, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height + thrusterSize);
        ctx.lineTo(this.x + this.width * 0.65, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        // Shield visual
        if (this.activePowerups.SHIELD) {
            ctx.strokeStyle = COLORS.COINS;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.3;
            ctx.beginPath();
            ctx.ellipse(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.width * 0.8,
                this.height * 0.7,
                0, 0, Math.PI * 2
            );
            ctx.stroke();
        }

        ctx.restore();
    }
}
