// ============================================
// The Chrono-Splinter - Boss System
// ============================================

class Boss {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = 120;
        this.height = 100;
        this.health = 500;
        this.maxHealth = 500;
        this.phase = 1;
        this.maxPhase = 3;
        this.active = true;
        this.entering = true;
        this.defeated = false;

        this.flashTimer = 0;
        this.phaseTransition = false;
        this.phaseTransitionTimer = 0;

        // Attack timers
        this.attackTimer = 0;
        this.attackCooldown = 2000;
        this.patternTimer = 0;
    }

    update(deltaTime, player, bulletManager) {
        // Override in subclass
    }

    takeDamage(amount) {
        if (this.phaseTransition || this.entering) return false;

        this.health -= amount;
        this.flashTimer = 100;

        // Check phase transitions
        const phaseHealth = this.maxHealth / this.maxPhase;
        const newPhase = Math.ceil(this.health / phaseHealth);

        if (newPhase < this.phase && this.phase > 1) {
            this.phase = Math.max(1, newPhase);
            this.startPhaseTransition();
        }

        if (this.health <= 0) {
            this.defeated = true;
            this.active = false;
            return true;
        }
        return false;
    }

    startPhaseTransition() {
        this.phaseTransition = true;
        this.phaseTransitionTimer = 2000;
    }

    draw(ctx) {
        // Override in subclass
    }

    drawHealthBar(ctx) {
        const barWidth = 300;
        const barHeight = 20;
        const x = GAME.WIDTH / 2 - barWidth / 2;
        const y = GAME.HEIGHT - 50;

        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

        // Health
        const healthPercent = Math.max(0, this.health / this.maxHealth);
        const healthColor = this.phase === 3 ? '#ff4757' :
            this.phase === 2 ? '#ffa502' : '#ff6b35';
        ctx.fillStyle = healthColor;
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);

        // Phase markers
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        for (let i = 1; i < this.maxPhase; i++) {
            const markerX = x + (barWidth / this.maxPhase) * i;
            ctx.beginPath();
            ctx.moveTo(markerX, y);
            ctx.lineTo(markerX, y + barHeight);
            ctx.stroke();
        }

        // Border
        ctx.strokeStyle = COLORS.PRIMARY;
        ctx.strokeRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

        // Boss name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(this.name.toUpperCase(), GAME.WIDTH / 2, y - 10);
    }
}

// ============================================
// The Sunkeeper - Mercury Boss
// ============================================

class Sunkeeper extends Boss {
    constructor() {
        super('The Sunkeeper', GAME.WIDTH / 2 - 60, -150);
        this.targetY = 80;
        this.oscillatePhase = 0;

        this.health = 800;
        this.maxHealth = 800;

        // Phase-specific
        this.shieldActive = true;
        this.shieldAngle = 0;
        this.ventAngles = [Math.PI * 0.7, Math.PI * 0.3]; // Weak points
        this.flareCharge = 0;
        this.meltdownActive = false;
        this.debris = [];
    }

    update(deltaTime, player, bulletManager) {
        // Entry animation
        if (this.entering) {
            this.y += 1;
            if (this.y >= this.targetY) {
                this.entering = false;
            }
            return;
        }

        // Phase transition
        if (this.phaseTransition) {
            this.phaseTransitionTimer -= deltaTime;
            if (this.phaseTransitionTimer <= 0) {
                this.phaseTransition = false;
                if (this.phase === 2) {
                    this.shieldActive = false;
                } else if (this.phase === 1) {
                    this.meltdownActive = true;
                }
            }
            return;
        }

        // Flash timer
        if (this.flashTimer > 0) this.flashTimer -= deltaTime;

        // Movement
        this.oscillatePhase += deltaTime / 1000;
        this.x = GAME.WIDTH / 2 - this.width / 2 + Math.sin(this.oscillatePhase) * 150;

        // Shield rotation
        if (this.shieldActive) {
            this.shieldAngle += deltaTime / 500;
        }

        // Attack patterns by phase
        this.attackTimer += deltaTime;
        this.patternTimer += deltaTime;

        switch (this.phase) {
            case 3: this.phase3Attack(bulletManager, player); break;
            case 2: this.phase2Attack(bulletManager, player); break;
            case 1: this.phase1Attack(bulletManager, player); break;
        }

        // Update debris (phase 1)
        if (this.meltdownActive) {
            for (const d of this.debris) {
                d.y += d.speed;
                d.rotation += d.rotSpeed;
            }
            this.debris = this.debris.filter(d => d.y < GAME.HEIGHT + 50);

            if (Math.random() < 0.05) {
                this.spawnDebris();
            }
        }
    }

    phase3Attack(bulletManager, player) {
        // Solar Shield phase - fire from vents (slower attack rate)
        if (this.attackTimer >= 2500) {
            this.attackTimer = 0;

            // Fire bullets from vents
            for (const ventAngle of this.ventAngles) {
                const angle = this.shieldAngle + ventAngle;
                const bx = this.x + this.width / 2 + Math.cos(angle) * 70;
                const by = this.y + this.height / 2 + Math.sin(angle) * 70;
                const targetAngle = Utils.angle(bx, by, player.x + player.width / 2, player.y + player.height / 2);
                bulletManager.createEnemyBullet(bx, by, targetAngle, 10);
            }
        }
    }

    phase2Attack(bulletManager, player) {
        // Flare Barrage - spread shots (slower attack rate)
        if (this.attackTimer >= 1800) {
            this.attackTimer = 0;

            // Spread shot - 3 bullets instead of 5
            const baseAngle = Math.PI / 2;
            for (let i = -1; i <= 1; i++) {
                const bx = this.x + this.width / 2;
                const by = this.y + this.height;
                bulletManager.createEnemyBullet(bx, by, baseAngle + i * 0.25, 10);
            }
        }
    }

    phase1Attack(bulletManager, player) {
        // Meltdown - debris falling, desperate attacks (slower rate)
        if (this.attackTimer >= 1200) {
            this.attackTimer = 0;

            // Aimed shots - 2 bullets instead of 3
            const bx = this.x + this.width / 2;
            const by = this.y + this.height;
            const angle = Utils.angle(bx, by, player.x + player.width / 2, player.y + player.height / 2);
            bulletManager.createEnemyBullet(bx, by, angle, 10);
            bulletManager.createEnemyBullet(bx, by, angle + 0.2, 10);
        }
    }

    spawnDebris() {
        this.debris.push({
            x: Utils.random(0, GAME.WIDTH),
            y: -30,
            size: Utils.random(10, 30),
            speed: Utils.random(2, 5),
            rotation: 0,
            rotSpeed: Utils.random(-0.1, 0.1),
        });
    }

    takeDamage(amount) {
        // In phase 3, can only be hit at vents
        if (this.phase === 3 && this.shieldActive) {
            // Reduce damage significantly when shield is up
            amount *= 0.2;
        }
        return super.takeDamage(amount);
    }

    draw(ctx) {
        if (this.flashTimer > 0 && Math.floor(this.flashTimer / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Draw debris first (behind boss)
        for (const d of this.debris) {
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.rotation);
            ctx.fillStyle = '#ff6b35';
            ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size);
            ctx.restore();
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // Main body - Helios Engine core
        ctx.fillStyle = this.phaseTransition ? '#fff' : '#cc4400';
        ctx.beginPath();
        ctx.arc(cx, cy, 50, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow
        const innerGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
        innerGradient.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
        innerGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fill();

        // Shield (phase 3)
        if (this.shieldActive) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(this.shieldAngle);

            // Shield arc
            ctx.strokeStyle = 'rgba(255, 150, 50, 0.8)';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(0, 0, 65, 0, Math.PI * 1.5);
            ctx.stroke();

            // Vent weak points
            ctx.fillStyle = '#50fa7b';
            for (const angle of this.ventAngles) {
                ctx.beginPath();
                ctx.arc(
                    Math.cos(angle) * 65,
                    Math.sin(angle) * 65,
                    8, 0, Math.PI * 2
                );
                ctx.fill();
            }

            ctx.restore();
        }

        // Meltdown effect (phase 1)
        if (this.meltdownActive) {
            ctx.strokeStyle = `rgba(255, 50, 50, ${0.5 + Math.sin(Date.now() / 100) * 0.3})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, 55 + Math.sin(Date.now() / 50) * 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;

        // Health bar
        this.drawHealthBar(ctx);

        // Phase indicator
        ctx.fillStyle = '#fff';
        ctx.font = '12px "Courier New"';
        ctx.textAlign = 'center';
        const phaseText = this.phase === 3 ? 'SOLAR SHIELD' :
            this.phase === 2 ? 'FLARE BARRAGE' : 'MELTDOWN';
        ctx.fillText(phaseText, GAME.WIDTH / 2, GAME.HEIGHT - 60);
    }
}

// ============================================
// The Stormweaver - Venus Boss
// ============================================

class Stormweaver extends Boss {
    constructor() {
        super('The Stormweaver', GAME.WIDTH / 2 - 60, -150);
        this.targetY = 100;
        this.movePhase = 0;

        this.health = 1000;
        this.maxHealth = 1000;

        // Phase-specific
        this.lightningCharging = false;
        this.lightningTimer = 0;
        this.stormClouds = [];
        this.windAngle = 0;
    }

    update(deltaTime, player, bulletManager) {
        // Entry animation
        if (this.entering) {
            this.y += 1.5;
            if (this.y >= this.targetY) {
                this.entering = false;
            }
            return;
        }

        // Phase transition
        if (this.phaseTransition) {
            this.phaseTransitionTimer -= deltaTime;
            if (this.phaseTransitionTimer <= 0) {
                this.phaseTransition = false;
            }
            return;
        }

        // Flash timer
        if (this.flashTimer > 0) this.flashTimer -= deltaTime;

        // Movement - figure 8 pattern
        this.movePhase += deltaTime / 1500;
        this.x = GAME.WIDTH / 2 - this.width / 2 + Math.sin(this.movePhase) * 180;
        this.y = this.targetY + Math.sin(this.movePhase * 2) * 30;

        // Wind rotation
        this.windAngle += deltaTime / 300;

        // Attack patterns by phase
        this.attackTimer += deltaTime;

        switch (this.phase) {
            case 3: this.phase3Attack(bulletManager, player); break;
            case 2: this.phase2Attack(bulletManager, player); break;
            case 1: this.phase1Attack(bulletManager, player); break;
        }
    }

    phase3Attack(bulletManager, player) {
        // Storm Gathering - rotating wind bullets
        if (this.attackTimer >= 2000) {
            this.attackTimer = 0;

            // Spiral shot
            for (let i = 0; i < 8; i++) {
                const angle = this.windAngle + (i / 8) * Math.PI * 2;
                const bx = this.x + this.width / 2;
                const by = this.y + this.height / 2;
                bulletManager.createEnemyBullet(bx, by, angle, 8);
            }
        }
    }

    phase2Attack(bulletManager, player) {
        // Lightning Storm - aimed shots + random lightning
        if (this.attackTimer >= 1500) {
            this.attackTimer = 0;

            // Aimed triple shot
            const bx = this.x + this.width / 2;
            const by = this.y + this.height;
            const angle = Utils.angle(bx, by, player.x + player.width / 2, player.y + player.height / 2);

            bulletManager.createEnemyBullet(bx, by, angle, 10);
            bulletManager.createEnemyBullet(bx - 30, by, angle, 10);
            bulletManager.createEnemyBullet(bx + 30, by, angle, 10);
        }
    }

    phase1Attack(bulletManager, player) {
        // Fury of Venus - rapid spiral + aimed
        if (this.attackTimer >= 800) {
            this.attackTimer = 0;

            // Fast spiral
            for (let i = 0; i < 12; i++) {
                const angle = this.windAngle * 2 + (i / 12) * Math.PI * 2;
                const bx = this.x + this.width / 2;
                const by = this.y + this.height / 2;
                bulletManager.createEnemyBullet(bx, by, angle, 8);
            }
        }
    }

    draw(ctx) {
        if (this.flashTimer > 0 && Math.floor(this.flashTimer / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // Storm vortex behind boss
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.windAngle);

        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            ctx.strokeStyle = `rgba(180, 140, 80, ${0.3 - i * 0.05})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 60 + i * 15, angle, angle + Math.PI);
            ctx.stroke();
        }
        ctx.restore();

        // Main body - swirling cloud mass
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
        gradient.addColorStop(0, '#8B7355');
        gradient.addColorStop(0.5, '#5D4E37');
        gradient.addColorStop(1, '#3D2817');

        ctx.fillStyle = this.phaseTransition ? '#fff' : gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 50, 0, Math.PI * 2);
        ctx.fill();

        // Inner eye
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.fill();

        // Lightning crackling (phase 2 and 1)
        if (this.phase <= 2) {
            ctx.strokeStyle = `rgba(255, 255, 100, ${0.5 + Math.sin(Date.now() / 50) * 0.3})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const length = 30 + Math.random() * 30;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                let lx = cx, ly = cy;
                for (let j = 0; j < 3; j++) {
                    lx += Math.cos(angle) * (length / 3) + (Math.random() - 0.5) * 15;
                    ly += Math.sin(angle) * (length / 3) + (Math.random() - 0.5) * 15;
                    ctx.lineTo(lx, ly);
                }
                ctx.stroke();
            }
        }

        ctx.globalAlpha = 1;

        // Health bar
        this.drawHealthBar(ctx);

        // Phase indicator
        ctx.fillStyle = '#fff';
        ctx.font = '12px "Courier New"';
        ctx.textAlign = 'center';
        const phaseText = this.phase === 3 ? 'STORM GATHERING' :
            this.phase === 2 ? 'LIGHTNING STORM' : 'FURY OF VENUS';
        ctx.fillText(phaseText, GAME.WIDTH / 2, GAME.HEIGHT - 60);
    }
}

// ============================================
// The Chrono-Weaver - Earth Orbit Boss
// ============================================

class ChronoWeaver extends Boss {
    constructor() {
        super('The Chrono-Weaver', GAME.WIDTH / 2 - 60, -150);
        this.targetY = 100;
        this.movePhase = 0;

        this.health = 1200;
        this.maxHealth = 1200;

        // Phase-specific
        this.timeRifts = [];
        this.clockAngle = 0;
        this.timeFreeze = false;
        this.timeFreezeTimer = 0;
        this.realityTear = false;
        this.tearParticles = [];
    }

    update(deltaTime, player, bulletManager) {
        // Entry animation
        if (this.entering) {
            this.y += 1.2;
            if (this.y >= this.targetY) {
                this.entering = false;
            }
            return;
        }

        // Phase transition
        if (this.phaseTransition) {
            this.phaseTransitionTimer -= deltaTime;
            if (this.phaseTransitionTimer <= 0) {
                this.phaseTransition = false;
                if (this.phase === 1) {
                    this.realityTear = true;
                }
            }
            return;
        }

        // Flash timer
        if (this.flashTimer > 0) this.flashTimer -= deltaTime;

        // Movement - teleport-like jumps
        this.movePhase += deltaTime / 2000;
        const targetX = GAME.WIDTH / 2 + Math.sin(this.movePhase * 2) * 200;
        const targetY = this.targetY + Math.sin(this.movePhase * 3) * 40;

        // Smooth but quick movement
        this.x += (targetX - this.width / 2 - this.x) * 0.05;
        this.y += (targetY - this.y) * 0.05;

        // Clock rotation
        this.clockAngle += deltaTime / 400;

        // Attack patterns by phase
        this.attackTimer += deltaTime;

        // Update time rifts
        for (const rift of this.timeRifts) {
            rift.timer -= deltaTime;
            rift.angle += deltaTime / 300;
            rift.size = Math.min(40, rift.size + 0.5);

            // Rift fires bullets
            if (rift.timer <= 0 && rift.shots > 0) {
                const angle = Utils.angle(rift.x, rift.y, player.x + player.width / 2, player.y + player.height / 2);
                bulletManager.createEnemyBullet(rift.x, rift.y, angle, 8);
                rift.timer = 800;
                rift.shots--;
            }
        }
        this.timeRifts = this.timeRifts.filter(r => r.shots > 0);

        // Update tear particles (phase 1)
        if (this.realityTear) {
            for (const p of this.tearParticles) {
                p.x += Math.cos(p.angle) * p.speed;
                p.y += Math.sin(p.angle) * p.speed;
                p.life -= deltaTime;
            }
            this.tearParticles = this.tearParticles.filter(p => p.life > 0);

            if (Math.random() < 0.1) {
                this.spawnTearParticle();
            }
        }

        switch (this.phase) {
            case 3: this.phase3Attack(bulletManager, player); break;
            case 2: this.phase2Attack(bulletManager, player); break;
            case 1: this.phase1Attack(bulletManager, player); break;
        }
    }

    phase3Attack(bulletManager, player) {
        // Temporal Nexus - spawn time rifts
        if (this.attackTimer >= 3000) {
            this.attackTimer = 0;

            // Spawn a time rift
            this.timeRifts.push({
                x: Utils.random(100, GAME.WIDTH - 100),
                y: Utils.random(100, GAME.HEIGHT / 2),
                size: 10,
                angle: 0,
                timer: 500,
                shots: 4
            });

            // Also fire clock hands pattern
            for (let i = 0; i < 12; i++) {
                const angle = this.clockAngle + (i / 12) * Math.PI * 2;
                bulletManager.createEnemyBullet(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    angle, 6
                );
            }
        }
    }

    phase2Attack(bulletManager, player) {
        // Time Dilation - aimed bursts
        if (this.attackTimer >= 1500) {
            this.attackTimer = 0;

            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            const angle = Utils.angle(cx, cy, player.x + player.width / 2, player.y + player.height / 2);

            // Burst of 5 bullets with slight spread
            for (let i = -2; i <= 2; i++) {
                bulletManager.createEnemyBullet(cx, cy, angle + i * 0.15, 10);
            }

            // Spawn rift occasionally
            if (Math.random() < 0.4) {
                this.timeRifts.push({
                    x: Utils.random(100, GAME.WIDTH - 100),
                    y: Utils.random(100, GAME.HEIGHT / 2),
                    size: 10,
                    angle: 0,
                    timer: 500,
                    shots: 3
                });
            }
        }
    }

    phase1Attack(bulletManager, player) {
        // Reality Collapse - chaotic patterns
        if (this.attackTimer >= 800) {
            this.attackTimer = 0;

            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;

            // Double spiral
            for (let i = 0; i < 16; i++) {
                const angle1 = this.clockAngle * 3 + (i / 16) * Math.PI * 2;
                const angle2 = -this.clockAngle * 3 + (i / 16) * Math.PI * 2;
                bulletManager.createEnemyBullet(cx, cy, angle1, 7);
                bulletManager.createEnemyBullet(cx, cy, angle2, 7);
            }
        }
    }

    spawnTearParticle() {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        this.tearParticles.push({
            x: cx + Utils.random(-30, 30),
            y: cy + Utils.random(-30, 30),
            angle: Utils.random(0, Math.PI * 2),
            speed: Utils.random(0.5, 2),
            size: Utils.random(2, 6),
            life: Utils.random(500, 1500),
            color: Utils.randomChoice(['#ff00ff', '#00ffff', '#ff0066', '#6600ff'])
        });
    }

    draw(ctx) {
        if (this.flashTimer > 0 && Math.floor(this.flashTimer / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // Draw time rifts first
        for (const rift of this.timeRifts) {
            ctx.save();
            ctx.translate(rift.x, rift.y);
            ctx.rotate(rift.angle);

            // Rift glow
            const riftGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, rift.size);
            riftGradient.addColorStop(0, 'rgba(150, 50, 255, 0.8)');
            riftGradient.addColorStop(0.5, 'rgba(100, 0, 200, 0.5)');
            riftGradient.addColorStop(1, 'rgba(50, 0, 100, 0)');
            ctx.fillStyle = riftGradient;
            ctx.beginPath();
            ctx.arc(0, 0, rift.size, 0, Math.PI * 2);
            ctx.fill();

            // Rift ring
            ctx.strokeStyle = '#aa66ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, rift.size * 0.7, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }

        // Tear particles
        for (const p of this.tearParticles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / 1500;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1;

        // Clock face behind boss
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.clockAngle * 0.1);

        // Outer clock ring
        ctx.strokeStyle = 'rgba(150, 100, 255, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 70, 0, Math.PI * 2);
        ctx.stroke();

        // Clock markings
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const inner = 60;
            const outer = 68;
            ctx.strokeStyle = i % 3 === 0 ? '#aa88ff' : '#6644aa';
            ctx.lineWidth = i % 3 === 0 ? 3 : 1;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
            ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
            ctx.stroke();
        }

        // Clock hands
        ctx.strokeStyle = '#cc99ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const hourAngle = this.clockAngle - Math.PI / 2;
        ctx.lineTo(Math.cos(hourAngle) * 35, Math.sin(hourAngle) * 35);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const minAngle = this.clockAngle * 12 - Math.PI / 2;
        ctx.lineTo(Math.cos(minAngle) * 50, Math.sin(minAngle) * 50);
        ctx.stroke();

        ctx.restore();

        // Main body - crystalline temporal core
        const bodyGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45);
        bodyGradient.addColorStop(0, '#e0d0ff');
        bodyGradient.addColorStop(0.4, '#9966cc');
        bodyGradient.addColorStop(1, '#4422aa');

        ctx.fillStyle = this.phaseTransition ? '#fff' : bodyGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 45, 0, Math.PI * 2);
        ctx.fill();

        // Inner eye/core
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Reality tear effect (phase 1)
        if (this.realityTear) {
            ctx.strokeStyle = `rgba(255, 0, 255, ${0.5 + Math.sin(Date.now() / 100) * 0.3})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                const tearAngle = Math.random() * Math.PI * 2;
                const length = 40 + Math.random() * 30;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                let tx = cx, ty = cy;
                for (let j = 0; j < 4; j++) {
                    tx += Math.cos(tearAngle) * (length / 4) + (Math.random() - 0.5) * 20;
                    ty += Math.sin(tearAngle) * (length / 4) + (Math.random() - 0.5) * 20;
                    ctx.lineTo(tx, ty);
                }
                ctx.stroke();
            }
        }

        ctx.globalAlpha = 1;

        // Health bar
        this.drawHealthBar(ctx);

        // Phase indicator
        ctx.fillStyle = '#fff';
        ctx.font = '12px "Courier New"';
        ctx.textAlign = 'center';
        const phaseText = this.phase === 3 ? 'TEMPORAL NEXUS' :
            this.phase === 2 ? 'TIME DILATION' : 'REALITY COLLAPSE';
        ctx.fillText(phaseText, GAME.WIDTH / 2, GAME.HEIGHT - 60);
    }
}

// ============================================
// Procedural Boss for Ch 4-12
// ============================================

class ProceduralBoss extends Boss {
    constructor(config) {
        super(config.name, GAME.WIDTH / 2 - 60, -150);
        this.config = config;
        this.targetY = 100;
        this.movePhase = 0;
        this.health = config.health || 1000;
        this.maxHealth = this.health;
        this.color = config.color || '#fff';
        this.secondaryColor = config.secondaryColor || '#888';
        this.shape = config.shape || 'circle'; // circle, square, triangle, hexagon
    }

    update(deltaTime, player, bulletManager) {
        // Entry
        if (this.entering) {
            this.y += 1;
            if (this.y >= this.targetY) {
                this.entering = false;
            }
            return;
        }

        // Phase transition
        if (this.phaseTransition) {
            this.phaseTransitionTimer -= deltaTime;
            if (this.phaseTransitionTimer <= 0) this.phaseTransition = false;
            return;
        }

        if (this.flashTimer > 0) this.flashTimer -= deltaTime;

        // Movement
        this.movePhase += deltaTime / 1000;
        const moveType = this.config.movement || 'sine';

        if (moveType === 'sine') {
            this.x = GAME.WIDTH / 2 - this.width / 2 + Math.sin(this.movePhase) * 150;
        } else if (moveType === 'figure8') {
            this.x = GAME.WIDTH / 2 - this.width / 2 + Math.sin(this.movePhase) * 180;
            this.y = this.targetY + Math.sin(this.movePhase * 2) * 30;
        } else if (moveType === 'bounce') {
            this.x += Math.sin(this.movePhase * 2) * 2;
            this.y = this.targetY + Math.abs(Math.sin(this.movePhase)) * 50;
        }

        // Attacks
        this.attackTimer += deltaTime;
        const attackInterval = this.config.attackInterval || 1500;

        if (this.attackTimer >= attackInterval) {
            this.attackTimer = 0;
            this.performAttack(bulletManager, player);
        }
    }

    performAttack(bulletManager, player) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const phaseMult = this.maxPhase - this.phase + 1; // More bullets in later phases

        const attackType = this.config.attack || 'aimed';

        if (attackType === 'aimed') {
            const angle = Utils.angle(cx, cy, player.x + player.width / 2, player.y + player.height / 2);
            for (let i = 0; i < phaseMult; i++) {
                bulletManager.createEnemyBullet(cx, cy, angle + (i * 0.2) - (phaseMult * 0.1), 8);
            }
        } else if (attackType === 'spiral') {
            const count = 8 * phaseMult;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + this.movePhase;
                bulletManager.createEnemyBullet(cx, cy, angle, 6);
            }
        } else if (attackType === 'scatter') {
            for (let i = 0; i < 5 * phaseMult; i++) {
                const angle = Math.random() * Math.PI; // Downwards
                bulletManager.createEnemyBullet(cx, cy, angle, 7);
            }
        }
    }

    draw(ctx) {
        if (this.flashTimer > 0 && Math.floor(this.flashTimer / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // Custom shape drawing based on config could go here
        // For now, generic robust shapes

        // Aura
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
        gradient.addColorStop(0, this.secondaryColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 60, 0, Math.PI * 2);
        ctx.fill();

        // Core Shape
        ctx.fillStyle = this.phaseTransition ? '#fff' : this.color;

        switch (this.shape) {
            case 'square':
                ctx.fillRect(cx - 40, cy - 40, 80, 80);
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(cx, cy - 50);
                ctx.lineTo(cx + 45, cy + 30);
                ctx.lineTo(cx - 45, cy + 30);
                ctx.closePath();
                ctx.fill();
                break;
            case 'hexagon':
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = i * Math.PI / 3;
                    const r = 45;
                    ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
                }
                ctx.closePath();
                ctx.fill();
                break;
            default: // circle
                ctx.beginPath();
                ctx.arc(cx, cy, 40, 0, Math.PI * 2);
                ctx.fill();
        }

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(cx - 15, cy - 10, 10, 10);
        ctx.fillRect(cx + 5, cy - 10, 10, 10);

        ctx.globalAlpha = 1;
        this.drawHealthBar(ctx);

        // Phase text fallback
        ctx.fillStyle = '#fff';
        ctx.font = '12px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(`PHASE ${4 - this.phase}`, GAME.WIDTH / 2, GAME.HEIGHT - 60);
    }
}

// Boss factory
const Bosses = {
    create(name) {
        let boss = null;
        switch (name) {
            case 'SUNKEEPER': boss = new Sunkeeper(); break;
            case 'STORMWEAVER': boss = new Stormweaver(); break;
            case 'CHRONOWEAVER': boss = new ChronoWeaver(); break;

            // New Bosses
            case 'THEECHO': boss = new ProceduralBoss({
                name: 'The Echo', color: '#aaa', secondaryColor: '#555', shape: 'square',
                health: 1400, movement: 'sine', attack: 'aimed'
            }); break;
            case 'THEWARDEN': boss = new ProceduralBoss({
                name: 'The Warden', color: '#d00', secondaryColor: '#500', shape: 'triangle',
                health: 1600, movement: 'bounce', attack: 'scatter'
            }); break;
            case 'THESIEGEBREAKER': boss = new ProceduralBoss({
                name: 'The Siegebreaker', color: '#852', secondaryColor: '#421', shape: 'hexagon',
                health: 1800, movement: 'figure8', attack: 'spiral'
            }); break;
            case 'THETEMPEST': boss = new ProceduralBoss({
                name: 'The Tempest', color: '#fa0', secondaryColor: '#840', shape: 'triangle',
                health: 2000, movement: 'sine', attack: 'aimed'
            }); break;
            case 'THELEVIATHAN': boss = new ProceduralBoss({
                name: 'The Leviathan', color: '#00f', secondaryColor: '#008', shape: 'circle',
                health: 2200, movement: 'figure8', attack: 'scatter'
            }); break;
            case 'THERINGMASTER': boss = new ProceduralBoss({
                name: 'The Ringmaster', color: '#fd0', secondaryColor: '#860', shape: 'hexagon',
                health: 2500, movement: 'bounce', attack: 'spiral'
            }); break;
            case 'THEFORGEMASTER': boss = new ProceduralBoss({
                name: 'The Forgemaster', color: '#0ff', secondaryColor: '#088', shape: 'square',
                health: 2800, movement: 'sine', attack: 'aimed'
            }); break;
            case 'THEARCHITECT': boss = new ProceduralBoss({
                name: 'The Architect', color: '#f0f', secondaryColor: '#808', shape: 'triangle',
                health: 3200, movement: 'figure8', attack: 'spiral'
            }); break;
            case 'THELOOMCORE': boss = new ProceduralBoss({
                name: 'The Loom Core', color: '#000', secondaryColor: '#fff', shape: 'hexagon',
                health: 5000, movement: 'sine', attack: 'scatter'
            }); break;
        }

        if (boss) {
            const diff = DIFFICULTIES[Settings.difficulty || 'EASY'];
            boss.health = Math.floor(boss.health * diff.hpMult);
            boss.maxHealth = Math.floor(boss.maxHealth * diff.hpMult);
        }

        return boss;
    }
};

