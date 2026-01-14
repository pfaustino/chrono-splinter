// ============================================
// The Chrono-Splinter - Collision System
// ============================================

const Collision = {
    checkAll(player, bulletManager, enemyManager, powerupManager, coinManager) {
        let enemiesKilled = 0;

        // Player bullets vs enemies
        for (const bullet of bulletManager.playerBullets) {
            for (const enemy of enemyManager.enemies) {
                if (Utils.rectCollision(bullet, enemy)) {
                    const killed = enemy.takeDamage(bullet.damage);
                    bullet.onHit();

                    if (killed) {
                        enemiesKilled++;
                        player.addScore(enemy.points);
                        coinManager.spawn(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.coins);
                        powerupManager.spawn(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

                        // Play explosion sound
                        Audio.play('explosion');

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
            if (Utils.rectCollision(bullet, player)) {
                const died = player.takeDamage(10);
                bullet.active = false;
                if (died) return { gameOver: true, enemiesKilled };
            }
        }

        // Enemies vs player (collision damage - also counts as kill)
        for (const enemy of enemyManager.enemies) {
            if (Utils.rectCollision(enemy, player)) {
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
