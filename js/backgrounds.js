// ============================================
// The Chrono-Splinter - Background System
// ============================================

class Background {
    constructor() {
        this.stars = [];
        this.generateStars();
    }

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * GAME.WIDTH,
                y: Math.random() * GAME.HEIGHT,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.2,
                brightness: Math.random() * 0.5 + 0.5,
            });
        }
    }

    update(deltaTime) {
        for (const star of this.stars) {
            star.y += star.speed;
            if (star.y > GAME.HEIGHT) {
                star.y = 0;
                star.x = Math.random() * GAME.WIDTH;
            }
        }
    }

    draw(ctx) {
        for (const star of this.stars) {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// ============================================
// Mercury Background - Solar Forge
// ============================================

class MercuryBackground extends Background {
    constructor() {
        super();
        this.solarFlares = [];
        this.heatWaves = [];
        this.sunGlow = 0;
        this.sunPulsePhase = 0;

        // Generate initial flares
        for (let i = 0; i < 3; i++) {
            this.spawnFlare();
        }

        // Load Planet Image
        this.planet = new Image();
        this.planet.src = 'assets/mercury.png';

        // Planet Position (Start peeking top-right)
        this.planetSize = 500;
        this.planetX = GAME.WIDTH - 200;
        this.planetY = -this.planetSize + 100; // Just peeking in
        this.planetSpeed = 0.05; // Very slow scroll
    }

    spawnFlare() {
        this.solarFlares.push({
            x: Utils.random(-50, GAME.WIDTH + 50),
            y: -100,
            width: Utils.random(20, 60),
            height: Utils.random(100, 300),
            speed: Utils.random(1, 3),
            angle: Utils.random(-0.3, 0.3),
            opacity: Utils.random(0.3, 0.7),
            hue: Utils.random(15, 45), // Orange to yellow
        });
    }

    spawnHeatWave() {
        this.heatWaves.push({
            y: GAME.HEIGHT,
            opacity: 0.3,
            speed: Utils.random(0.5, 1.5),
        });
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Scroll planet
        this.planetY += this.planetSpeed;

        // Sun pulse
        this.sunPulsePhase += deltaTime / 1000;
        this.sunGlow = 0.3 + Math.sin(this.sunPulsePhase) * 0.1;

        // Update flares
        for (const flare of this.solarFlares) {
            flare.y += flare.speed;
            flare.x += Math.sin(flare.y / 50) * 0.5;
        }
        this.solarFlares = this.solarFlares.filter(f => f.y < GAME.HEIGHT + 200);

        // Spawn new flares
        if (Math.random() < 0.02) {
            this.spawnFlare();
        }

        // Update heat waves
        for (const wave of this.heatWaves) {
            wave.y -= wave.speed;
            wave.opacity -= 0.002;
        }
        this.heatWaves = this.heatWaves.filter(w => w.opacity > 0);

        // Spawn heat waves
        if (Math.random() < 0.01) {
            this.spawnHeatWave();
        }
    }

    draw(ctx) {
        // Deep space gradient with orange tint
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME.HEIGHT);
        gradient.addColorStop(0, '#1a0a00');
        gradient.addColorStop(0.3, '#0d0d1a');
        gradient.addColorStop(1, '#0a0a12');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        // Sun glow at top
        const sunGradient = ctx.createRadialGradient(
            GAME.WIDTH / 2, -100, 0,
            GAME.WIDTH / 2, -100, 400
        );
        sunGradient.addColorStop(0, `rgba(255, 200, 50, ${this.sunGlow})`);
        sunGradient.addColorStop(0.5, `rgba(255, 100, 0, ${this.sunGlow * 0.5})`);
        sunGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = sunGradient;
        ctx.fillRect(0, 0, GAME.WIDTH, 300);

        // Draw stars (dimmer due to sun proximity)
        ctx.globalAlpha = 0.4;
        super.draw(ctx);
        ctx.globalAlpha = 1;

        // Draw Planet
        if (this.planet.complete) {
            ctx.drawImage(this.planet, this.planetX, this.planetY, this.planetSize, this.planetSize);
        }

        // Draw solar flares
        for (const flare of this.solarFlares) {
            ctx.save();
            ctx.translate(flare.x, flare.y);
            ctx.rotate(flare.angle);

            const flareGradient = ctx.createLinearGradient(0, 0, 0, flare.height);
            flareGradient.addColorStop(0, `hsla(${flare.hue}, 100%, 60%, ${flare.opacity})`);
            flareGradient.addColorStop(0.5, `hsla(${flare.hue}, 100%, 50%, ${flare.opacity * 0.7})`);
            flareGradient.addColorStop(1, `hsla(${flare.hue}, 100%, 40%, 0)`);

            ctx.fillStyle = flareGradient;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(flare.width / 2, flare.height);
            ctx.lineTo(-flare.width / 2, flare.height);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        // Draw heat waves (horizontal distortion lines)
        for (const wave of this.heatWaves) {
            ctx.strokeStyle = `rgba(255, 150, 50, ${wave.opacity})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, wave.y);
            for (let x = 0; x < GAME.WIDTH; x += 20) {
                const wobble = Math.sin((x + wave.y) / 30) * 3;
                ctx.lineTo(x, wave.y + wobble);
            }
            ctx.stroke();
        }

        // Vignette effect (darker edges)
        const vignette = ctx.createRadialGradient(
            GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.HEIGHT * 0.3,
            GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.HEIGHT * 0.8
        );
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
    }
}

// ============================================
// Venus Background - Acid Clouds
// ============================================

class VenusBackground extends Background {
    constructor() {
        super();
        this.clouds = [];
        this.acidDrops = [];
        this.lightningTimer = 0;
        this.lightningFlash = 0;

        // Generate initial clouds
        for (let i = 0; i < 5; i++) {
            this.spawnCloud();
        }

        // Load Planet Image
        this.planet = new Image();
        this.planet.src = 'assets/venus.png';

        // Planet Position (Start peeking top-left)
        this.planetSize = 600;
        this.planetX = -300;
        this.planetY = -this.planetSize + 150; // Just peeking in
        this.planetSpeed = 0.08;
    }

    spawnCloud() {
        this.clouds.push({
            x: Utils.random(-100, GAME.WIDTH + 100),
            y: Utils.random(-50, GAME.HEIGHT),
            width: Utils.random(150, 300),
            height: Utils.random(40, 80),
            speed: Utils.random(0.2, 0.5),
            opacity: Utils.random(0.2, 0.5),
        });
    }

    spawnAcidDrop() {
        this.acidDrops.push({
            x: Utils.random(0, GAME.WIDTH),
            y: -10,
            speed: Utils.random(3, 6),
            length: Utils.random(10, 25),
        });
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Scroll planet
        this.planetY += this.planetSpeed;

        // Update clouds
        for (const cloud of this.clouds) {
            cloud.y += cloud.speed;
            cloud.x += Math.sin(cloud.y / 100) * 0.3;
        }
        this.clouds = this.clouds.filter(c => c.y < GAME.HEIGHT + 100);

        if (Math.random() < 0.01) {
            this.spawnCloud();
        }

        // Update acid drops
        for (const drop of this.acidDrops) {
            drop.y += drop.speed;
        }
        this.acidDrops = this.acidDrops.filter(d => d.y < GAME.HEIGHT + 30);

        if (Math.random() < 0.1) {
            this.spawnAcidDrop();
        }

        // Lightning
        this.lightningTimer += deltaTime;
        if (this.lightningTimer > 3000 && Math.random() < 0.01) {
            this.lightningFlash = 200;
            this.lightningTimer = 0;
        }
        if (this.lightningFlash > 0) {
            this.lightningFlash -= deltaTime;
        }
    }

    draw(ctx) {
        // Toxic atmosphere gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME.HEIGHT);
        gradient.addColorStop(0, '#2d1f0f');
        gradient.addColorStop(0.3, '#3d2817');
        gradient.addColorStop(0.7, '#1a1510');
        gradient.addColorStop(1, '#0d0a08');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        // Stars (barely visible through atmosphere)
        ctx.globalAlpha = 0.15;
        super.draw(ctx);
        ctx.globalAlpha = 1;

        // Draw Planet
        if (this.planet.complete) {
            // Faint planet visible through the haze
            ctx.globalAlpha = 0.8;
            ctx.drawImage(this.planet, this.planetX, this.planetY, this.planetSize, this.planetSize);
            ctx.globalAlpha = 1;
        }

        // Draw clouds
        for (const cloud of this.clouds) {
            ctx.fillStyle = `rgba(180, 140, 80, ${cloud.opacity})`;
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Cloud highlight
            ctx.fillStyle = `rgba(200, 160, 100, ${cloud.opacity * 0.5})`;
            ctx.beginPath();
            ctx.ellipse(cloud.x - cloud.width * 0.2, cloud.y - cloud.height * 0.2,
                cloud.width * 0.3, cloud.height * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw acid rain
        ctx.strokeStyle = 'rgba(150, 200, 50, 0.6)';
        ctx.lineWidth = 1;
        for (const drop of this.acidDrops) {
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
            ctx.stroke();
        }

        // Lightning flash
        if (this.lightningFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 200, ${this.lightningFlash / 400})`;
            ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
        }

        // Atmospheric haze at bottom
        const haze = ctx.createLinearGradient(0, GAME.HEIGHT - 150, 0, GAME.HEIGHT);
        haze.addColorStop(0, 'rgba(180, 140, 80, 0)');
        haze.addColorStop(1, 'rgba(180, 140, 80, 0.3)');
        ctx.fillStyle = haze;
        ctx.fillRect(0, GAME.HEIGHT - 150, GAME.WIDTH, 150);
    }
}

// ============================================
// Earth Orbit Background - Home Orbit
// ============================================

class EarthOrbitBackground extends Background {
    constructor() {
        super();
        this.debris = [];
        this.satellites = [];
        this.temporalRifts = [];
        this.earthGlow = 0;
        this.earthPhase = 0;

        // Generate initial debris
        for (let i = 0; i < 8; i++) {
            this.spawnDebris();
        }

        // Generate initial satellites
        for (let i = 0; i < 3; i++) {
            this.spawnSatellite();
        }

        // Load Earth Image
        this.planet = new Image();
        this.planet.src = 'assets/earth.png';
        this.planetY = GAME.HEIGHT - 350; // Position at bottom
    }

    spawnDebris() {
        this.debris.push({
            x: Utils.random(-50, GAME.WIDTH + 50),
            y: Utils.random(-50, GAME.HEIGHT),
            size: Utils.random(3, 12),
            speed: Utils.random(0.3, 1),
            rotation: Utils.random(0, Math.PI * 2),
            rotSpeed: Utils.random(-0.02, 0.02),
            type: Utils.randomChoice(['square', 'triangle', 'line'])
        });
    }

    spawnSatellite() {
        this.satellites.push({
            x: Utils.random(50, GAME.WIDTH - 50),
            y: Utils.random(-100, -50),
            speed: Utils.random(0.2, 0.5),
            angle: Utils.random(-0.1, 0.1),
            blinkTimer: Utils.random(0, 1000)
        });
    }

    spawnTemporalRift() {
        this.temporalRifts.push({
            x: Utils.random(50, GAME.WIDTH - 50),
            y: Utils.random(50, GAME.HEIGHT / 2),
            size: 0,
            maxSize: Utils.random(20, 40),
            life: Utils.random(2000, 4000),
            angle: 0
        });
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Earth glow pulse
        this.earthPhase += deltaTime / 2000;
        this.earthGlow = 0.3 + Math.sin(this.earthPhase) * 0.1;

        // Update debris
        for (const d of this.debris) {
            d.y += d.speed;
            d.rotation += d.rotSpeed;
        }
        this.debris = this.debris.filter(d => d.y < GAME.HEIGHT + 50);

        if (Math.random() < 0.02) {
            this.spawnDebris();
        }

        // Update satellites
        for (const sat of this.satellites) {
            sat.y += sat.speed;
            sat.x += sat.angle;
            sat.blinkTimer += deltaTime;
        }
        this.satellites = this.satellites.filter(s => s.y < GAME.HEIGHT + 100);

        if (this.satellites.length < 3 && Math.random() < 0.005) {
            this.spawnSatellite();
        }

        // Update temporal rifts
        for (const rift of this.temporalRifts) {
            rift.life -= deltaTime;
            rift.angle += deltaTime / 500;
            if (rift.size < rift.maxSize) {
                rift.size += 0.3;
            }
            if (rift.life < 500) {
                rift.size -= 0.5;
            }
        }
        this.temporalRifts = this.temporalRifts.filter(r => r.life > 0 && r.size > 0);

        if (Math.random() < 0.003) {
            this.spawnTemporalRift();
        }
    }

    draw(ctx) {
        // Deep space gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME.HEIGHT);
        gradient.addColorStop(0, '#0a0a15');
        gradient.addColorStop(0.5, '#0d0d20');
        gradient.addColorStop(1, '#101025');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        // Draw stars
        super.draw(ctx);

        // Draw Earth Image
        if (this.planet.complete) {
            // Draw large earth at bottom centered
            const size = 800;
            const x = GAME.WIDTH / 2 - size / 2;

            // Add atmospheric glow behind
            const earthGlow = ctx.createRadialGradient(
                GAME.WIDTH / 2, this.planetY + size / 2, size / 3,
                GAME.WIDTH / 2, this.planetY + size / 2, size / 1.5
            );
            earthGlow.addColorStop(0, `rgba(100, 150, 255, ${0.4 + this.earthGlow * 0.2})`);
            earthGlow.addColorStop(1, 'rgba(0, 50, 150, 0)');
            ctx.fillStyle = earthGlow;
            ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

            ctx.drawImage(this.planet, x, this.planetY, size, size);
        } else {
            // Fallback procedural glow if image loads slowly
            const earthGradient = ctx.createRadialGradient(
                GAME.WIDTH / 2, GAME.HEIGHT + 300, 50,
                GAME.WIDTH / 2, GAME.HEIGHT + 300, 500
            );
            earthGradient.addColorStop(0, `rgba(100, 150, 255, ${this.earthGlow})`);
            earthGradient.addColorStop(0.3, `rgba(50, 100, 200, ${this.earthGlow * 0.6})`);
            earthGradient.addColorStop(0.6, `rgba(30, 60, 150, ${this.earthGlow * 0.3})`);
            earthGradient.addColorStop(1, 'rgba(0, 0, 50, 0)');
            ctx.fillStyle = earthGradient;
            ctx.fillRect(0, GAME.HEIGHT - 200, GAME.WIDTH, 200);
        }

        // Horizon line
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, GAME.HEIGHT - 30);
        ctx.bezierCurveTo(
            GAME.WIDTH * 0.25, GAME.HEIGHT - 35,
            GAME.WIDTH * 0.75, GAME.HEIGHT - 35,
            GAME.WIDTH, GAME.HEIGHT - 30
        );
        ctx.stroke();

        // Draw temporal rifts
        for (const rift of this.temporalRifts) {
            ctx.save();
            ctx.translate(rift.x, rift.y);
            ctx.rotate(rift.angle);

            const riftGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, rift.size);
            riftGradient.addColorStop(0, 'rgba(150, 50, 255, 0.6)');
            riftGradient.addColorStop(0.5, 'rgba(100, 0, 200, 0.3)');
            riftGradient.addColorStop(1, 'rgba(50, 0, 100, 0)');
            ctx.fillStyle = riftGradient;
            ctx.beginPath();
            ctx.arc(0, 0, rift.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // Draw debris
        ctx.fillStyle = '#555';
        for (const d of this.debris) {
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.rotation);

            ctx.fillStyle = '#444';
            if (d.type === 'square') {
                ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size);
            } else if (d.type === 'triangle') {
                ctx.beginPath();
                ctx.moveTo(0, -d.size / 2);
                ctx.lineTo(d.size / 2, d.size / 2);
                ctx.lineTo(-d.size / 2, d.size / 2);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillRect(-d.size / 2, -1, d.size, 2);
            }

            ctx.restore();
        }

        // Draw satellites
        for (const sat of this.satellites) {
            ctx.fillStyle = '#666';
            ctx.fillRect(sat.x - 8, sat.y - 2, 16, 4);
            ctx.fillRect(sat.x - 2, sat.y - 6, 4, 12);

            // Solar panels
            ctx.fillStyle = '#446688';
            ctx.fillRect(sat.x - 20, sat.y - 3, 10, 6);
            ctx.fillRect(sat.x + 10, sat.y - 3, 10, 6);

            // Blinking light
            if (Math.floor(sat.blinkTimer / 500) % 2 === 0) {
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(sat.x, sat.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// ============================================
// Procedural Background for Ch 4-12
// ============================================

class ProceduralBackground extends Background {
    constructor(config) {
        super();
        this.config = config;
        this.elements = [];

        // Load Planet Image if available
        if (config.image) {
            this.planet = new Image();
            this.planet.src = config.image;

            this.planetSize = config.size || 400;
            this.planetX = GAME.WIDTH / 2 - this.planetSize / 2;
            this.planetY = GAME.HEIGHT + 100; // Start below screen
            this.targetPlanetY = GAME.HEIGHT - this.planetSize + 100; // Rise up
            this.planetSpeed = 0.2;
        }

        // Generate specific elements based on type
        if (config.type === 'asteroids') {
            for (let i = 0; i < 20; i++) this.spawnAsteroid();
        } else if (config.type === 'gas_giant') {
            // Nothing extra, just gradient
        } else if (config.type === 'dust') {
            for (let i = 0; i < 15; i++) this.spawnDust();
        }
    }

    spawnAsteroid() {
        this.elements.push({
            x: Math.random() * GAME.WIDTH,
            y: Math.random() * GAME.HEIGHT,
            size: Math.random() * 20 + 5,
            speed: Math.random() * 2 + 1,
            rotation: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.1,
            type: 'asteroid'
        });
    }

    spawnDust() {
        this.elements.push({
            x: Math.random() * GAME.WIDTH,
            y: Math.random() * GAME.HEIGHT,
            size: Math.random() * 100 + 50,
            speed: Math.random() * 4 + 2,
            opacity: Math.random() * 0.2,
            type: 'dust'
        });
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Move planet into position
        if (this.planet && this.planetY > this.targetPlanetY) {
            this.planetY -= this.planetSpeed;
        }

        for (const el of this.elements) {
            el.y += el.speed;
            if (el.type === 'asteroid') el.rotation += el.rotSpeed;

            if (el.y > GAME.HEIGHT + 100) {
                el.y = -100;
                el.x = Math.random() * GAME.WIDTH;
            }
        }
    }

    draw(ctx) {
        // Gradient Background
        const grad = ctx.createLinearGradient(0, 0, 0, GAME.HEIGHT);
        grad.addColorStop(0, this.config.topColor || '#000');
        grad.addColorStop(1, this.config.bottomColor || '#111');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        // Stars
        super.draw(ctx);

        // Draw Planet Image (Behind elements)
        if (this.planet && this.planet.complete) {
            ctx.save();
            ctx.drawImage(this.planet, this.planetX, this.planetY, this.planetSize, this.planetSize);
            ctx.restore();
        } else if (this.config.planetName && !this.planet) {
            // Text fallback only if no image
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.font = '100px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.config.planetName.toUpperCase(), GAME.WIDTH / 2, GAME.HEIGHT / 2);
        }

        // Elements
        for (const el of this.elements) {
            if (el.type === 'asteroid') {
                ctx.save();
                ctx.translate(el.x, el.y);
                ctx.rotate(el.rotation);
                ctx.fillStyle = '#666';
                ctx.fillRect(-el.size / 2, -el.size / 2, el.size, el.size);
                ctx.restore();
            } else if (el.type === 'dust') {
                ctx.fillStyle = this.config.dustColor || 'rgba(100,50,0,0.1)';
                ctx.globalAlpha = el.opacity;
                ctx.beginPath();
                ctx.arc(el.x, el.y, el.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
    }
}

// Background factory
const Backgrounds = {
    create(chapterNum) {
        switch (chapterNum) {
            case 1: return new MercuryBackground();
            case 2: return new VenusBackground();
            case 3: return new EarthOrbitBackground();

            // New Procedural Backgrounds
            case 4: return new ProceduralBackground({
                planetName: 'The Moon', topColor: '#1a1a1a', bottomColor: '#000', type: 'asteroids'
            });
            case 5: return new ProceduralBackground({
                planetName: 'Mars', topColor: '#3d1a1a', bottomColor: '#1a0a0a', type: 'dust',
                dustColor: 'rgba(200,50,0,0.2)', image: 'assets/mars.png', size: 500
            });
            case 6: return new ProceduralBackground({
                planetName: 'Asteroid Belt', topColor: '#000', bottomColor: '#111', type: 'asteroids'
            });
            case 7: return new ProceduralBackground({
                planetName: 'Jupiter', topColor: '#4d2e00', bottomColor: '#2e1a00', type: 'gas_giant',
                image: 'assets/jupiter.png', size: 600
            });
            case 8: return new ProceduralBackground({
                planetName: 'Europa', topColor: '#001a1a', bottomColor: '#000', type: 'dust',
                dustColor: 'rgba(100,200,255,0.05)'
            });
            case 9: return new ProceduralBackground({
                planetName: 'Saturn', topColor: '#2e2e1a', bottomColor: '#1a1a0a', type: 'gas_giant',
                dustColor: 'rgba(200,200,100,0.1)', image: 'assets/saturn.png', size: 550
            });
            case 10: return new ProceduralBackground({
                planetName: 'Uranus', topColor: '#002e2e', bottomColor: '#001a1a', type: 'gas_giant',
                dustColor: 'rgba(100,255,255,0.05)', image: 'assets/uranus.png', size: 500
            });
            case 11: return new ProceduralBackground({
                planetName: 'Neptune', topColor: '#00002e', bottomColor: '#00001a', type: 'gas_giant',
                dustColor: 'rgba(50,50,200,0.1)', image: 'assets/neptune.png', size: 500
            });
            case 12: return new ProceduralBackground({
                planetName: 'The Edge', topColor: '#110011', bottomColor: '#000', type: 'none'
            });

            default: return new Background();
        }
    }
};

