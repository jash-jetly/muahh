// ===== GAME LOOP WITH BOMB TIMER & MISSION TIME =====
const GameLoop = {
    state: 'menu', // menu, playing, gameover
    currentSector: 0,
    difficulty: 1,
    sectorsCleared: 0,
    clock: null,
    sectorClearBonus: 500,

    // Bomb timer
    bombTimer: 180, // 3 minutes per sector
    bombTimerMax: 180,
    bombsPerSector: 3,

    // Mission timer (total time played)
    missionTime: 0,

    // Leaderboard toggle
    leaderboardOpen: false,

    init() {
        this.clock = new THREE.Clock();
        this.state = 'menu';
        this.currentSector = 0;
        this.difficulty = 1;
        this.sectorsCleared = 0;
        this.missionTime = 0;
        this.leaderboardOpen = false;

        // TAB key for leaderboard
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Tab') {
                e.preventDefault();
                if (this.state === 'menu' || this.state === 'playing') {
                    this.leaderboardOpen = !this.leaderboardOpen;
                    if (this.leaderboardOpen) {
                        UI.showLeaderboard();
                    } else {
                        UI.hideLeaderboard();
                    }
                }
            }
        });
    },

    startGame() {
        this.state = 'playing';
        this.currentSector = 0;
        this.difficulty = 1;
        this.sectorsCleared = 0;
        this.missionTime = 0;
        this.leaderboardOpen = false;

        UI.hideStartScreen();
        UI.hideGameOver();
        UI.hideLeaderboard();
        UI.showHUD();
        UI.updateHealth(Player.maxHealth, Player.maxHealth);
        UI.updateScore(0);
        UI.updateSector(1);
        UI.updateDetective(Player.detectiveMaxTime, Player.detectiveMaxTime);

        Player.reset();
        Combat.reset();
        this.clock.getDelta(); // reset clock

        this.loadSector(0);
        Player.lockPointer();
    },

    loadSector(sectorIndex) {
        this.currentSector = sectorIndex;
        CityGenerator.generateSector(sectorIndex);

        // Spawn enemies
        EnemyManager.spawnEnemiesForSector(sectorIndex, this.difficulty);

        // Spawn bombs
        const bombCount = this.bombsPerSector + Math.floor(this.difficulty * 0.5);
        CityGenerator.spawnBombs(sectorIndex, bombCount);

        // Add extra guards around each bomb
        for (let b of CityGenerator.bombs) {
            EnemyManager.spawnEnemy(b.building, 'thug', this.difficulty);
            EnemyManager.spawnEnemy(b.building, 'gunman', this.difficulty);
            EnemyManager.spawnEnemy(b.building, 'brute', this.difficulty);
        }

        // Reset bomb timer (more time for higher sectors)
        this.bombTimer = this.bombTimerMax + (sectorIndex * 30);

        // Place player on first building
        const buildings = CityGenerator.getBuildingsInSector(sectorIndex);
        if (buildings.length > 0) {
            const b = buildings[0];
            Player.position.set(b.centerX, b.height + 2, b.centerZ);
        }

        UI.updateEnemyCount(EnemyManager.getActiveCount());
        UI.updateBombCount(CityGenerator.getActiveBombCount());
        UI.updateSector(sectorIndex + 1);
        UI.showSectorBanner(sectorIndex + 1, bombCount);
    },

    update() {
        if (this.state !== 'playing') return;

        const dt = Math.min(this.clock.getDelta(), 0.05);
        this.missionTime += dt;

        // Update systems
        Player.update(dt);
        Grapple.update(dt, Player.position);
        Parkour.update(dt);
        Glide.update(dt);
        EnemyManager.update(dt);
        Combat.update(dt);
        CityGenerator.updateBombs(dt);

        // Grapple input
        if (Player.keys['KeyE'] && Player.isPointerLocked) {
            Player.keys['KeyE'] = false;
            const dir = Player.getForwardDirection();
            if (Grapple.fire(Player.position.clone(), dir)) {
                UI.showAlert('GRAPPLE');
            }
        }

        // Parkour
        if (!Player.isGrounded && !Player.isGrappling) {
            Parkour.checkWallRun();
            Parkour.checkLedgeGrab();
        }
        if (Player.isGrounded && Player.isSprinting) {
            Parkour.checkVault();
        }

        // Update HUD
        UI.updateEnemyCount(EnemyManager.getActiveCount());
        UI.updateMissionTimer(this.missionTime);

        // Bomb timer countdown
        this.bombTimer -= dt;
        UI.updateTimer(Math.max(0, this.bombTimer));

        // Time's up = explosion
        if (this.bombTimer <= 0 && CityGenerator.getActiveBombCount() > 0) {
            this.bombExploded();
            return;
        }

        // Check sector clear: all enemies down AND all bombs disarmed
        if (EnemyManager.getActiveCount() === 0 && CityGenerator.getActiveBombCount() === 0) {
            this.sectorCleared();
        }

        // Player death
        if (Player.health <= 0) {
            this.gameOver(false);
        }
    },

    sectorCleared() {
        this.sectorsCleared++;
        this.difficulty++;
        Combat.addScore(this.sectorClearBonus);
        UI.showAlert('⚡ SECTOR CLEARED +500');

        // Time bonus
        const timeBonus = Math.floor(this.bombTimer * 2);
        if (timeBonus > 0) {
            Combat.score += timeBonus;
            UI.updateScore(Combat.score);
            setTimeout(() => UI.showAlert('TIME BONUS +' + timeBonus), 1000);
        }

        setTimeout(() => {
            if (this.state === 'playing') {
                this.loadSector(this.currentSector + 1);
            }
        }, 2500);
    },

    bombExploded() {
        UI.explosionFlash();
        UI.showAlert('💥 BOMB DETONATED — MISSION FAILED');
        Player.takeDamage(1000);
        setTimeout(() => this.gameOver(false), 1500);
    },

    gameOver(isVictory) {
        this.state = 'gameover';
        UI.hideHUD();
        UI.showGameOver(Combat.score, Combat.totalDefeated, Combat.bombsDisarmed, this.sectorsCleared, this.missionTime, isVictory);
        Leaderboard.addScore(Combat.score, this.missionTime, this.sectorsCleared, Combat.bombsDisarmed);
        document.exitPointerLock();
    },

    restart() {
        EnemyManager.clearAll();
        Grapple.release();
        CityGenerator.bombs = [];
        this.startGame();
    }
};
