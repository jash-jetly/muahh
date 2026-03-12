// ===== MAIN - GAME INIT WITH MINIMAP =====
(function () {
    'use strict';

    let scene, camera, renderer;
    let minimapCanvas, minimapCtx;

    function initThree() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x060612);
        scene.fog = new THREE.FogExp2(0x060612, 0.005);

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
        camera.position.set(0, 30, -10);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        document.getElementById('game-container').appendChild(renderer.domElement);

        // Moonlight
        const moonlight = new THREE.DirectionalLight(0x9999dd, 0.6);
        moonlight.position.set(50, 120, 30);
        moonlight.castShadow = true;
        moonlight.shadow.mapSize.width = 2048;
        moonlight.shadow.mapSize.height = 2048;
        moonlight.shadow.camera.near = 0.5;
        moonlight.shadow.camera.far = 300;
        moonlight.shadow.camera.left = -120;
        moonlight.shadow.camera.right = 120;
        moonlight.shadow.camera.top = 120;
        moonlight.shadow.camera.bottom = -120;
        scene.add(moonlight);

        const ambient = new THREE.AmbientLight(0x2a2a4e, 0.5);
        scene.add(ambient);

        const hemiLight = new THREE.HemisphereLight(0x2244aa, 0x442266, 0.4);
        scene.add(hemiLight);

        const cityGlow = new THREE.PointLight(0xff8844, 0.3, 200);
        cityGlow.position.set(50, -5, 50);
        scene.add(cityGlow);

        const accentLight = new THREE.PointLight(0x7c3aed, 0.4, 150);
        accentLight.position.set(0, 60, 0);
        scene.add(accentLight);

        const accent2 = new THREE.PointLight(0x3b82f6, 0.3, 150);
        accent2.position.set(100, 40, 100);
        scene.add(accent2);

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        return { scene, camera, renderer };
    }

    // ===== MINIMAP RENDERER =====
    function initMinimap() {
        minimapCanvas = document.getElementById('minimap');
        minimapCtx = minimapCanvas.getContext('2d');
    }

    function renderMinimap() {
        if (!minimapCanvas || GameLoop.state !== 'playing') return;

        const ctx = minimapCtx;
        const w = minimapCanvas.width;
        const h = minimapCanvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const scale = 0.8; // pixels per world unit
        const isDetective = Player.detectiveActive;

        // Clear with circular clip
        ctx.save();
        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
        ctx.clip();

        // Background
        ctx.fillStyle = isDetective ? 'rgba(0, 15, 30, 0.9)' : 'rgba(5, 5, 20, 0.85)';
        ctx.fillRect(0, 0, w, h);

        // Player position as center reference
        const px = Player.position.x;
        const pz = Player.position.z;

        // Draw buildings
        for (const b of CityGenerator.buildings) {
            const dx = (b.centerX - px) * scale;
            const dz = (b.centerZ - pz) * scale;

            // Skip if out of minimap range
            if (Math.abs(dx) > cx + 20 || Math.abs(dz) > cy + 20) continue;

            const bw = b.width * scale;
            const bd = b.depth * scale;

            // Rotate relative to player
            const cosR = Math.cos(-Player.rotation);
            const sinR = Math.sin(-Player.rotation);
            const rx = dx * cosR - dz * sinR;
            const rz = dx * sinR + dz * cosR;

            ctx.save();
            ctx.translate(cx + rx, cy - rz);
            ctx.rotate(-Player.rotation);

            if (isDetective) {
                ctx.strokeStyle = 'rgba(0, 100, 180, 0.3)';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(-bw / 2, -bd / 2, bw, bd);
            } else {
                ctx.fillStyle = 'rgba(30, 30, 50, 0.6)';
                ctx.fillRect(-bw / 2, -bd / 2, bw, bd);
                ctx.strokeStyle = 'rgba(80, 60, 140, 0.3)';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(-bw / 2, -bd / 2, bw, bd);
            }
            ctx.restore();
        }

        // Draw enemies as red dots
        if (typeof EnemyManager !== 'undefined') {
            for (const enemy of EnemyManager.enemies) {
                if (enemy.state === 'unconscious') continue;
                const dx = (enemy.position.x - px) * scale;
                const dz = (enemy.position.z - pz) * scale;
                if (Math.abs(dx) > cx || Math.abs(dz) > cy) continue;

                const cosR = Math.cos(-Player.rotation);
                const sinR = Math.sin(-Player.rotation);
                const rx = dx * cosR - dz * sinR;
                const rz = dx * sinR + dz * cosR;

                const size = isDetective ? 5 : 4;
                ctx.beginPath();
                ctx.arc(cx + rx, cy - rz, size, 0, Math.PI * 2);
                ctx.fillStyle = isDetective ? '#ff2222' : '#ff4466';
                ctx.fill();

                // Always draw a faint ring so they are easier to spot on minimap
                ctx.beginPath();
                ctx.arc(cx + rx, cy - rz, isDetective ? 8 : 6, 0, Math.PI * 2);
                ctx.strokeStyle = isDetective ? 'rgba(255, 34, 34, 0.4)' : 'rgba(255, 68, 102, 0.2)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        // Draw bombs as green/yellow dots
        for (const bomb of CityGenerator.bombs) {
            if (bomb.disarmed) continue;
            const dx = (bomb.position.x - px) * scale;
            const dz = (bomb.position.z - pz) * scale;
            if (Math.abs(dx) > cx || Math.abs(dz) > cy) continue;

            const cosR = Math.cos(-Player.rotation);
            const sinR = Math.sin(-Player.rotation);
            const rx = dx * cosR - dz * sinR;
            const rz = dx * sinR + dz * cosR;

            const size = isDetective ? 5 : 3.5;
            const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;

            // Pulsing glow
            if (isDetective) {
                ctx.beginPath();
                ctx.arc(cx + rx, cy - rz, 10, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 255, 68, ${0.1 + pulse * 0.1})`;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(cx + rx, cy - rz, size, 0, Math.PI * 2);
            ctx.fillStyle = isDetective ? '#00ff44' : '#f59e0b';
            ctx.fill();
        }

        // Draw player (center triangle pointing forward)
        ctx.save();
        ctx.translate(cx, cy);
        // No rotation needed - the player is always pointing up on minimap since everything else rotates around them

        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(-4, 5);
        ctx.lineTo(4, 5);
        ctx.closePath();
        ctx.fillStyle = isDetective ? '#22d3ee' : '#a78bfa';
        ctx.fill();

        // Player glow
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.strokeStyle = isDetective ? 'rgba(34, 211, 238, 0.3)' : 'rgba(167, 139, 250, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Compass ring
        ctx.beginPath();
        ctx.arc(cx, cy, cx - 3, 0, Math.PI * 2);
        ctx.strokeStyle = isDetective ? 'rgba(6, 182, 212, 0.2)' : 'rgba(167, 139, 250, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // N/S/E/W labels (rotate with player)
        const dirs = [
            { label: 'N', angle: 0 },
            { label: 'E', angle: Math.PI / 2 },
            { label: 'S', angle: Math.PI },
            { label: 'W', angle: -Math.PI / 2 }
        ];
        ctx.font = '8px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (const d of dirs) {
            const a = d.angle - Player.rotation;
            const lx = cx + Math.sin(a) * (cx - 12);
            const ly = cy - Math.cos(a) * (cy - 12);
            ctx.fillStyle = isDetective ? 'rgba(6, 182, 212, 0.4)' : 'rgba(167, 139, 250, 0.3)';
            ctx.fillText(d.label, lx, ly);
        }

        // Update detective class
        minimapCanvas.className = isDetective ? 'detective-active' : '';

        ctx.restore();
    }

    function initGame() {
        const result = initThree();
        scene = result.scene;
        camera = result.camera;

        UI.init();
        CityGenerator.init(scene);
        Player.init(scene, camera);
        Player.camera = camera;
        Grapple.init(scene);
        Parkour.init();
        Glide.init();
        EnemyManager.init(scene);
        Combat.init();
        GameLoop.init();
        initMinimap();

        document.getElementById('start-btn').addEventListener('click', () => {
            GameLoop.startGame();
        });
        document.getElementById('restart-btn').addEventListener('click', () => {
            GameLoop.restart();
        });

        function animate() {
            requestAnimationFrame(animate);
            GameLoop.update();
            renderMinimap();
            renderer.render(scene, camera);
        }
        animate();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
})();
