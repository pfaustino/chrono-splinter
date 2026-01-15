// ============================================
// The Chrono-Splinter - Collision System
// ============================================

const Collision = {
    checkAll(player, bulletManager, enemyManager, powerupManager, coinManager, particleManager) {
        let enemiesKilled = 0;

        // Player bullets vs enemies
        for (const bullet of bulletManager.playerBullets) {
            for (const enemy of enemyManager.enemies) {
                // Use generous circle collision for shooting enemies (easier to hit)
                if (Utils.circleCollision(bullet, enemy, 0.5, 0.45)) {
                    const killed = enemy.takeDamage(bullet.damage);
                    particleManager.spawnImpact(bullet.x, bullet.y, '#fff', bullet.angle + Math.PI); // Spark opposite to bullet
                    bullet.onHit();

                    if (killed) {
                        enemiesKilled++;
                        player.addScore(enemy.points);
                        coinManager.spawn(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.coins);
                        powerupManager.spawn(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

                        // Play explosion sound
                        Audio.play('explosion');
                        particleManager.spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, 15);

                        if (enemy.splitInto > 0) {
                            enemyManager.spawnSplitEnemies(enemy);
                        }
                    }
                    if (!bullet.active) break;
                }
            }
        }

        // Enemy bullets vs player
        for (const bullet of bulletManager.enemyBullets) {
            // Precise hitbox for player (tiny core)
            if (Utils.circleCollision(bullet, player, 0.4, 0.25)) {
                particleManager.spawnImpact(player.x + player.width / 2, player.y + player.height / 2, '#ff0000');
                const died = player.takeDamage(10);
                bullet.active = false;
                if (died) return { gameOver: true, enemiesKilled };
            }
        }

        // Enemies vs player (collision damage - also counts as kill)
        for (const enemy of enemyManager.enemies) {
            // Forgiving hitbox for ship crashing
            if (Utils.circleCollision(enemy, player, 0.4, 0.3)) {
                const died = player.takeDamage(20);
                const wasActive = enemy.active;
                enemy.takeDamage(enemy.maxHealth);
                if (wasActive && !enemy.active) {
                    enemiesKilled++;
                }
                if (died) return { gameOver: true, enemiesKilled };
            }
        }

        // Power-ups vs player
        for (const powerup of powerupManager.powerups) {
            if (Utils.rectCollision(powerup, player)) {
                this.collectPowerup(player, powerup);
                powerup.active = false;
            }
        }

        coinManager.checkCollection(player);
        return { gameOver: false, enemiesKilled };
    },

    collectPowerup(player, powerup) {
        if (powerup.type === 'LIFE') {
            if (player.lives < PLAYER.MAX_LIVES) {
                player.lives++;
                if (typeof Game !== 'undefined' && Game.addFloatingText) {
                    Game.addFloatingText(player.x, player.y, '+1 LIFE', '#ff4757');
                }
                Audio.play('powerup');
            } else {
                player.addScore(500);
                if (typeof Game !== 'undefined' && Game.addFloatingText) {
                    Game.addFloatingText(player.x, player.y, '+500', '#ffd700');
                }
                Audio.play('coin');
            }
            return;
        }

        if (powerup.isWeapon) {
            player.addWeaponMod(powerup.type);
        } else {
            player.addPowerup(powerup.type, {
                duration: powerup.duration,
                hits: powerup.hits
            });
        }
    },
};
