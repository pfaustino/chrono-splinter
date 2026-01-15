// ============================================
// The Chrono-Splinter - Particle System
// ============================================

class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;

        // Physics
        const speed = options.speed || Utils.random(1, 3);
        const angle = options.angle !== undefined ? options.angle : Utils.random(0, Math.PI * 2);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        // Appearance
        this.size = options.size || Utils.random(2, 4);
        this.color = options.color || '#ffffff';
        this.shape = options.shape || 'circle'; // circle, rect

        // Life
        this.life = 1.0;
        this.decay = options.decay || Utils.random(0.02, 0.05);
        this.active = true;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;

        // Add minimal drag
        this.vx *= 0.95;
        this.vy *= 0.95;

        this.life -= this.decay;

        if (this.life <= 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;

        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        }

        ctx.globalAlpha = 1;
    }
}

class ParticleManager {
    constructor() {
        this.particles = [];
        this.maxParticles = 500; // soft limit to prevent lag
    }

    /**
     * Spawn an explosion of particles
     */
    spawnExplosion(x, y, color, count = 20) {
        if (this.particles.length > this.maxParticles) return;

        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, {
                color: color,
                speed: Utils.random(2, 8),
                size: Utils.random(3, 6),
                decay: Utils.random(0.02, 0.06)
            }));
        }
    }

    /**
     * Spawn a small impact spark
     */
    spawnImpact(x, y, color, angle = null) {
        if (this.particles.length > this.maxParticles) return;

        const count = 5;
        for (let i = 0; i < count; i++) {
            // If angle provided, spray in cone, else random
            const sprayAngle = angle !== null
                ? angle + Utils.random(-0.5, 0.5)
                : Utils.random(0, Math.PI * 2);

            this.particles.push(new Particle(x, y, {
                color: color,
                speed: Utils.random(2, 5),
                size: Utils.random(1, 3),
                angle: sprayAngle,
                decay: 0.1 // Short life
            }));
        }
    }

    /**
     * Spawn a trail particle
     */
    spawnTrail(x, y, color, size = 3) {
        // Lower priority, skip if busy
        if (this.particles.length > this.maxParticles * 0.8) return;

        this.particles.push(new Particle(x, y, {
            color: color,
            speed: Utils.random(0.5, 1.5),
            angle: Math.PI / 2 + Utils.random(-0.2, 0.2), // Downward drift usually
            size: size,
            decay: 0.05
        }));
    }

    update(deltaTime) {
        for (const p of this.particles) {
            p.update(deltaTime);
        }
        this.particles = this.particles.filter(p => p.active);
    }

    draw(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }

    clear() {
        this.particles = [];
    }
}
