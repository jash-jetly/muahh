// ===== UI SYSTEM WITH BOMBS, TIMER, DETECTIVE, LEADERBOARD =====
const UI = {
    elements: {},

    init() {
        this.elements = {
            hud: document.getElementById('hud'),
            healthBar: document.getElementById('health-bar'),
            healthBarGlow: document.getElementById('health-bar-glow'),
            healthText: document.getElementById('health-text'),
            grappleBar: document.getElementById('grapple-bar'),
            grappleStatus: document.getElementById('grapple-status'),
            detectiveBar: document.getElementById('detective-bar'),
            detectiveStatus: document.getElementById('detective-status'),
            comboContainer: document.getElementById('combo-container'),
            comboCount: document.getElementById('combo-count'),
            scoreValue: document.getElementById('score-value'),
            enemyCount: document.getElementById('enemy-count'),
            sectorValue: document.getElementById('sector-value'),
            alertText: document.getElementById('alert-text'),
            bombCount: document.getElementById('bomb-count'),
            timerValue: document.getElementById('timer-value'),
            missionTimerValue: document.getElementById('mission-timer-value'),
            interactionPrompt: document.getElementById('interaction-prompt'),
            startScreen: document.getElementById('start-screen'),
            gameoverScreen: document.getElementById('gameover-screen'),
            gameoverTitle: document.getElementById('gameover-title'),
            gameoverSubtitle: document.getElementById('gameover-subtitle'),
            finalScore: document.getElementById('final-score'),
            finalEnemies: document.getElementById('final-enemies'),
            finalBombs: document.getElementById('final-bombs'),
            finalSectors: document.getElementById('final-sectors'),
            finalTime: document.getElementById('final-time'),
            leaderboardOverlay: document.getElementById('leaderboard-overlay'),
            leaderboardList: document.getElementById('leaderboard-list'),
        };
    },

    showHUD() { this.elements.hud.classList.remove('hidden'); },
    hideHUD() { this.elements.hud.classList.add('hidden'); },

    updateHealth(current, max) {
        const pct = (current / max) * 100;
        this.elements.healthBar.style.width = pct + '%';
        this.elements.healthBarGlow.style.width = pct + '%';
        this.elements.healthText.textContent = Math.ceil(current);
        this.elements.healthBar.style.background = pct < 30
            ? 'linear-gradient(90deg, #ff4466, #ff2244)'
            : 'linear-gradient(90deg, #a78bfa, #7c3aed)';
    },

    updateGrapple(cooldown, maxCooldown) {
        const pct = ((maxCooldown - cooldown) / maxCooldown) * 100;
        this.elements.grappleBar.style.width = pct + '%';
        this.elements.grappleStatus.textContent = cooldown <= 0 ? 'READY' : 'RECHARGING';
        this.elements.grappleStatus.style.color = cooldown <= 0 ? 'rgba(6,182,212,0.7)' : 'rgba(255,255,255,0.3)';
    },

    updateDetective(current, max) {
        const pct = (current / max) * 100;
        this.elements.detectiveBar.style.width = pct + '%';
        if (Player.detectiveActive) {
            this.elements.detectiveStatus.textContent = Math.ceil(current) + 's ACTIVE';
            this.elements.detectiveStatus.style.color = 'rgba(6,182,212,0.9)';
            this.elements.detectiveBar.style.background = 'linear-gradient(90deg, #06b6d4, #22d3ee)';
        } else if (Player.detectiveCooldown > 0) {
            this.elements.detectiveStatus.textContent = 'COOLDOWN';
            this.elements.detectiveStatus.style.color = 'rgba(255,255,255,0.3)';
            this.elements.detectiveBar.style.background = 'linear-gradient(90deg, #666, #888)';
        } else {
            this.elements.detectiveStatus.textContent = 'READY [SHIFT]';
            this.elements.detectiveStatus.style.color = 'rgba(6,182,212,0.7)';
            this.elements.detectiveBar.style.width = '100%';
            this.elements.detectiveBar.style.background = 'linear-gradient(90deg, #06b6d4, #22d3ee)';
        }
    },

    updateCombo(count) {
        if (count > 0) {
            this.elements.comboContainer.classList.remove('hidden');
            this.elements.comboContainer.classList.add('active');
            this.elements.comboCount.textContent = count;
        } else {
            this.elements.comboContainer.classList.add('hidden');
            this.elements.comboContainer.classList.remove('active');
        }
    },

    updateScore(score) { this.elements.scoreValue.textContent = score.toLocaleString(); },
    updateEnemyCount(count) { this.elements.enemyCount.textContent = count; },
    updateSector(sector) { this.elements.sectorValue.textContent = sector; },
    updateBombCount(count) { this.elements.bombCount.textContent = count; },

    updateTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        this.elements.timerValue.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        if (seconds < 30) {
            this.elements.timerValue.classList.add('warning');
        } else {
            this.elements.timerValue.classList.remove('warning');
        }
    },

    updateMissionTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        this.elements.missionTimerValue.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    },

    showAlert(text) {
        this.elements.alertText.textContent = text;
        this.elements.alertText.classList.remove('hidden');
        this.elements.alertText.style.animation = 'none';
        void this.elements.alertText.offsetHeight;
        this.elements.alertText.style.animation = 'alertFade 2s ease-out forwards';
        setTimeout(() => { this.elements.alertText.classList.add('hidden'); }, 2000);
    },

    showInteraction(text) {
        this.elements.interactionPrompt.textContent = text;
        this.elements.interactionPrompt.classList.remove('hidden');
    },
    hideInteraction() {
        this.elements.interactionPrompt.classList.add('hidden');
    },

    damageFlash() {
        const flash = document.createElement('div');
        flash.className = 'damage-flash';
        flash.style.position = 'fixed';
        flash.style.inset = '0';
        flash.style.background = 'radial-gradient(circle, transparent 20%, rgba(255, 0, 0, 0.7) 100%)';
        flash.style.backgroundColor = 'rgba(255,0,0,0.5)';
        flash.style.zIndex = '9999';
        flash.style.pointerEvents = 'none';
        flash.style.transition = 'opacity 0.4s ease-out';
        document.body.appendChild(flash);
        setTimeout(() => { flash.style.opacity = '0'; }, 50);
        setTimeout(() => flash.remove(), 400);
    },

    explosionFlash() {
        const flash = document.createElement('div');
        flash.className = 'explosion-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 1500);
    },

    showSectorBanner(sectorNum, bombCount) {
        const banner = document.createElement('div');
        banner.className = 'sector-banner';
        banner.innerHTML = `<h2>SECTOR ${sectorNum}</h2><p>DISARM ${bombCount} BOMBS — NEUTRALIZE ALL HOSTILES</p>`;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 3000);
    },

    showStartScreen() { this.elements.startScreen.classList.add('active'); },
    hideStartScreen() { this.elements.startScreen.classList.remove('active'); },

    showGameOver(score, enemies, bombs, sectors, time, isVictory) {
        this.elements.finalScore.textContent = score.toLocaleString();
        this.elements.finalEnemies.textContent = enemies;
        this.elements.finalBombs.textContent = bombs;
        this.elements.finalSectors.textContent = sectors;
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        this.elements.finalTime.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

        if (isVictory) {
            this.elements.gameoverTitle.textContent = 'GOTHAM SAVED';
            this.elements.gameoverTitle.classList.add('victory');
            this.elements.gameoverSubtitle.textContent = 'THE JOKER\'S PLAN FAILED';
        } else {
            this.elements.gameoverTitle.textContent = 'FALLEN';
            this.elements.gameoverTitle.classList.remove('victory');
            this.elements.gameoverSubtitle.textContent = 'THE NIGHT CLAIMED YOU';
        }
        this.elements.gameoverScreen.classList.add('active');
    },
    hideGameOver() { this.elements.gameoverScreen.classList.remove('active'); },

    // Leaderboard
    showLeaderboard() {
        const scores = Leaderboard.getScores();
        let html = '<div class="lb-row header"><span class="lb-rank">#</span><span class="lb-score">SCORE</span><span class="lb-time">TIME</span><span class="lb-sectors">SECTORS</span></div>';
        if (scores.length === 0) {
            html += '<div class="lb-row"><span style="color:rgba(255,255,255,0.3);letter-spacing:0.2em">NO RECORDS YET</span></div>';
        }
        scores.forEach((s, i) => {
            const mins = Math.floor(s.time / 60);
            const secs = Math.floor(s.time % 60);
            const timeStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
            html += `<div class="lb-row"><span class="lb-rank">${i + 1}</span><span class="lb-score">${s.score.toLocaleString()}</span><span class="lb-time">${timeStr}</span><span class="lb-sectors">${s.sectors}</span></div>`;
        });
        this.elements.leaderboardList.innerHTML = html;
        this.elements.leaderboardOverlay.classList.add('active');
    },
    hideLeaderboard() {
        this.elements.leaderboardOverlay.classList.remove('active');
    }
};

// ===== LEADERBOARD (localStorage) =====
const Leaderboard = {
    key: 'nightvigil_leaderboard',

    getScores() {
        try {
            return JSON.parse(localStorage.getItem(this.key)) || [];
        } catch { return []; }
    },

    addScore(score, time, sectors, bombs) {
        const scores = this.getScores();
        scores.push({ score, time, sectors, bombs, date: Date.now() });
        scores.sort((a, b) => b.score - a.score);
        if (scores.length > 10) scores.length = 10;
        localStorage.setItem(this.key, JSON.stringify(scores));
    }
};
