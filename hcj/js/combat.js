// ===== COMBAT SYSTEM WITH BOMB DISARM =====
const Combat = {
    combo: 0, comboTimer: 0, comboTimeout: 2,
    score: 0, totalDefeated: 0, bombsDisarmed: 0,
    attackCooldown: 0,

    init() {
        this.combo = 0; this.score = 0; this.totalDefeated = 0;
        this.bombsDisarmed = 0; this.comboTimer = 0; this.attackCooldown = 0;
    },

    update(dt) {
        if (this.combo > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) { this.combo = 0; UI.updateCombo(0); }
        }
        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        if (Player.mouseButtons.left && this.attackCooldown <= 0 && Player.isPointerLocked) {
            this.punch();
        }
        if (Player.mouseButtons.right && this.attackCooldown <= 0 && Player.isPointerLocked) {
            this.heavyAttack();
        }

        // F key: stealth takedown OR bomb disarm
        if (Player.keys['KeyF'] && Player.isPointerLocked) {
            Player.keys['KeyF'] = false;
            // Check bomb first
            const bomb = CityGenerator.getClosestActiveBomb(Player.position, 4);
            if (bomb) {
                this.disarmBomb(bomb);
            } else {
                this.stealthTakedown();
            }
        }

        // Show interaction prompt
        const nearBomb = CityGenerator.getClosestActiveBomb(Player.position, 5);
        const nearEnemy = EnemyManager.getClosestEnemy(Player.position, 4);
        if (nearBomb) {
            UI.showInteraction('Press F to DISARM BOMB');
        } else if (nearEnemy && nearEnemy.state !== 'unconscious' && EnemyManager.getEnemyBehindCheck(nearEnemy)) {
            UI.showInteraction('Press F for STEALTH TAKEDOWN');
        } else {
            UI.hideInteraction();
        }

        // Dodge
        if (Player.keys['Space'] && Player.isGrounded) {
            const closeEnemy = EnemyManager.getClosestEnemy(Player.position, 5);
            if (closeEnemy && closeEnemy.state === 'combat') {
                let dx = 0, dz = 0;
                if (Player.keys['KeyA']) dx = 1;
                if (Player.keys['KeyD']) dx = -1;
                if (Player.keys['KeyW']) dz = 1;
                if (Player.keys['KeyS']) dz = -1;
                if (dx !== 0 || dz !== 0) Player.dodge(dx, dz);
            }
        }
    },

    punch() {
        this.attackCooldown = 0.35;
        const enemy = EnemyManager.getClosestEnemy(Player.position, 3);
        if (enemy) {
            const damage = 15 + this.combo * 2;
            const defeated = EnemyManager.damageEnemy(enemy, damage);
            this.incrementCombo();
            if (defeated) { this.addScore(100); this.totalDefeated++; UI.showAlert('KNOCKOUT +100'); }
        }
        if (Player.arms.right) {
            Player.arms.right.rotation.x = -Math.PI / 2.5;
            setTimeout(() => { if (Player.arms.right) Player.arms.right.rotation.x = 0; }, 150);
        }
    },

    heavyAttack() {
        this.attackCooldown = 0.7;
        const enemy = EnemyManager.getClosestEnemy(Player.position, 3.5);
        if (enemy) {
            const damage = 30 + this.combo * 3;
            const defeated = EnemyManager.damageEnemy(enemy, damage);
            this.incrementCombo();
            if (defeated) { this.addScore(100); this.totalDefeated++; UI.showAlert('HEAVY KO +100'); }
            const dir = enemy.position.clone().sub(Player.position).normalize();
            enemy.position.x += dir.x * 2;
            enemy.position.z += dir.z * 2;
        }
        if (Player.arms.left) {
            Player.arms.left.rotation.x = -Math.PI / 3;
            setTimeout(() => { if (Player.arms.left) Player.arms.left.rotation.x = 0; }, 250);
        }
        if (Player.arms.right) {
            Player.arms.right.rotation.x = -Math.PI / 3;
            setTimeout(() => { if (Player.arms.right) Player.arms.right.rotation.x = 0; }, 250);
        }
    },

    stealthTakedown() {
        const enemy = EnemyManager.getClosestEnemy(Player.position, 3);
        if (!enemy || enemy.state === 'unconscious') return;
        const isBehind = EnemyManager.getEnemyBehindCheck(enemy);
        if (isBehind || enemy.state === 'patrol') {
            EnemyManager.stealthTakedown(enemy);
            this.addScore(200); this.totalDefeated++;
            this.incrementCombo();
            UI.showAlert('STEALTH TAKEDOWN +200');
        }
    },

    disarmBomb(bomb) {
        CityGenerator.disarmBomb(bomb);
        this.bombsDisarmed++;
        this.addScore(300);
        UI.showAlert('💣 BOMB DISARMED +300');
        UI.updateBombCount(CityGenerator.getActiveBombCount());
    },

    incrementCombo() {
        this.combo++;
        this.comboTimer = this.comboTimeout;
        UI.updateCombo(this.combo);
    },

    addScore(base) {
        const multiplier = 1 + this.combo * 0.1;
        const points = Math.floor(base * multiplier);
        this.score += points;
        UI.updateScore(this.score);
    },

    reset() {
        this.combo = 0; this.score = 0; this.totalDefeated = 0;
        this.bombsDisarmed = 0; this.comboTimer = 0; this.attackCooldown = 0;
    }
};
