// ===== ENEMY SYSTEM =====
const EnemyManager = {
    enemies: [],
    visionCones: [],
    enemyMaterials: {},

    init(scene) {
        this.scene = scene;
        this.enemies = [];
        this.visionCones = [];
        this.enemyMaterials = {
            thug: new THREE.MeshLambertMaterial({ color: 0x8b0000 }),
            gunman: new THREE.MeshLambertMaterial({ color: 0x4a4a00 }),
            brute: new THREE.MeshLambertMaterial({ color: 0x5a2d0c }),
            head: new THREE.MeshLambertMaterial({ color: 0xcc9966 }),
            vision: new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.08, side: THREE.DoubleSide }),
            visionAlert: new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
        };
    },

    spawnEnemiesForSector(sectorIndex, difficulty) {
        const buildings = CityGenerator.getBuildingsInSector(sectorIndex);
        const numEnemies = Math.min(3 + difficulty * 2, 15);
        const usedBuildings = [];

        for (let i = 0; i < numEnemies && i < buildings.length; i++) {
            let b;
            do {
                b = buildings[Math.floor(Math.random() * buildings.length)];
            } while (usedBuildings.includes(b) && usedBuildings.length < buildings.length);
            usedBuildings.push(b);

            const typeRoll = Math.random();
            let type = 'thug';
            if (typeRoll > 0.7 && difficulty > 1) type = 'gunman';
            if (typeRoll > 0.9 && difficulty > 2) type = 'brute';

            this.spawnEnemy(b, type, difficulty);
        }
    },

    spawnEnemy(building, type, difficulty) {
        const group = new THREE.Group();
        let scale = 1;
        let health = 30;
        let speed = 2;
        let damage = 10;
        let attackRange = 2;
        const mat = this.enemyMaterials[type];

        switch (type) {
            case 'thug':
                health = 40 + difficulty * 5;
                speed = 2.5 + difficulty * 0.2;
                damage = 8 + difficulty * 1;
                attackRange = 2.5;
                break;
            case 'gunman':
                health = 50 + difficulty * 5;
                speed = 2.0;
                damage = 12 + difficulty * 2;
                attackRange = 20;
                break;
            case 'brute':
                scale = 1.4;
                health = 90 + difficulty * 10;
                speed = 1.8;
                damage = 20 + difficulty * 2;
                attackRange = 3;
                break;
        }

        // Body
        const bodyGeo = new THREE.CylinderGeometry(0.35 * scale, 0.3 * scale, 1.1 * scale, 8);
        const body = new THREE.Mesh(bodyGeo, mat);
        body.position.y = 0.8 * scale;
        group.add(body);

        // Head
        const headGeo = new THREE.SphereGeometry(0.22 * scale, 8, 6);
        const head = new THREE.Mesh(headGeo, this.enemyMaterials.head);
        head.position.y = 1.55 * scale;
        group.add(head);

        // Arms
        const armGeo = new THREE.CylinderGeometry(0.08 * scale, 0.06 * scale, 0.6 * scale, 6);
        const leftArm = new THREE.Mesh(armGeo, mat);
        leftArm.position.set(-0.45 * scale, 0.9 * scale, 0);
        group.add(leftArm);
        const rightArm = new THREE.Mesh(armGeo, mat);
        rightArm.position.set(0.45 * scale, 0.9 * scale, 0);
        group.add(rightArm);

        // Health bar
        const hbBgGeo = new THREE.PlaneGeometry(1, 0.08);
        const hbBgMat = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
        const hbBg = new THREE.Mesh(hbBgGeo, hbBgMat);
        hbBg.position.y = 2 * scale;
        group.add(hbBg);

        const hbGeo = new THREE.PlaneGeometry(1, 0.08);
        const hbMat = new THREE.MeshBasicMaterial({ color: 0xff4444, side: THREE.DoubleSide });
        const hb = new THREE.Mesh(hbGeo, hbMat);
        hb.position.y = 2 * scale;
        group.add(hb);

        // Enemy Marker (visible through walls)
        const markerGeo = new THREE.ConeGeometry(0.2 * scale, 0.4 * scale, 4);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.8, depthTest: false, depthWrite: false });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.rotation.x = Math.PI;
        marker.position.y = 2.6 * scale;
        group.add(marker);

        // Vision cone
        const visionRange = 15 + difficulty * 2;
        const visionAngle = Math.PI / 4;
        const coneGeo = new THREE.ConeGeometry(Math.tan(visionAngle) * visionRange, visionRange, 8, 1, true);
        const cone = new THREE.Mesh(coneGeo, this.enemyMaterials.vision);
        cone.rotation.x = Math.PI / 2;
        cone.position.set(0, 1, visionRange / 2);
        group.add(cone);

        // Position on building
        const px = building.centerX + (Math.random() - 0.5) * (building.width * 0.5);
        const pz = building.centerZ + (Math.random() - 0.5) * (building.depth * 0.5);
        group.position.set(px, building.height, pz);

        this.scene.add(group);

        // Patrol points
        const patrolPoints = [];
        const numPoints = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numPoints; i++) {
            patrolPoints.push(new THREE.Vector3(
                building.centerX + (Math.random() - 0.5) * (building.width * 0.6),
                building.height,
                building.centerZ + (Math.random() - 0.5) * (building.depth * 0.6)
            ));
        }

        const enemy = {
            mesh: group,
            body, head, leftArm, rightArm, hb, hbBg, cone, marker,
            type, health, maxHealth: health, speed, damage, attackRange,
            state: 'patrol', // patrol, alert, combat, search, unconscious
            position: group.position,
            rotation: Math.random() * Math.PI * 2,
            patrolPoints,
            currentPatrolIndex: 0,
            alertTimer: 0,
            searchTimer: 0,
            attackCooldown: 0,
            visionRange,
            building,
            scale
        };

        this.enemies.push(enemy);
        return enemy;
    },

    update(dt) {
        const playerPos = Player.position;

        for (const enemy of this.enemies) {
            if (enemy.state === 'unconscious') continue;

            // Update health bar to face camera
            if (enemy.hb && enemy.hbBg) {
                enemy.hb.lookAt(Player.camera ? Player.camera.position : playerPos);
                enemy.hbBg.lookAt(Player.camera ? Player.camera.position : playerPos);
                enemy.hb.scale.x = enemy.health / enemy.maxHealth;
                enemy.hb.position.x = -(1 - enemy.health / enemy.maxHealth) * 0.5;
            }

            if (enemy.marker) {
                enemy.marker.rotation.y += dt * 2;
                enemy.marker.position.y = (2.6 + Math.sin(Date.now() * 0.005) * 0.1) * enemy.scale;
            }

            const toPlayer = playerPos.clone().sub(enemy.position);
            toPlayer.y = 0;
            const distToPlayer = toPlayer.length();
            const dirToPlayer = toPlayer.clone().normalize();

            // Check vision
            const canSeePlayer = this.checkVision(enemy, playerPos, distToPlayer, dirToPlayer);

            switch (enemy.state) {
                case 'patrol':
                    this.updatePatrol(enemy, dt);
                    if (canSeePlayer) {
                        enemy.state = 'alert';
                        enemy.alertTimer = 1.5;
                        this.setVisionAlert(enemy, true);
                    }
                    break;

                case 'alert':
                    enemy.alertTimer -= dt;
                    // Turn toward player
                    const targetRot = Math.atan2(dirToPlayer.x, dirToPlayer.z);
                    enemy.rotation = this.lerpAngle(enemy.rotation, targetRot, 3 * dt);
                    enemy.mesh.rotation.y = enemy.rotation;

                    if (enemy.alertTimer <= 0) {
                        enemy.state = 'combat';
                    }
                    if (!canSeePlayer && distToPlayer > enemy.visionRange) {
                        enemy.state = 'search';
                        enemy.searchTimer = 5;
                        this.setVisionAlert(enemy, false);
                    }
                    break;

                case 'combat':
                    this.updateCombat(enemy, dt, playerPos, distToPlayer, dirToPlayer);
                    if (!canSeePlayer && distToPlayer > enemy.visionRange * 1.5) {
                        enemy.state = 'search';
                        enemy.searchTimer = 5;
                        this.setVisionAlert(enemy, false);
                    }
                    break;

                case 'search':
                    enemy.searchTimer -= dt;
                    // Rotate looking for player
                    enemy.rotation += dt * 1.5;
                    enemy.mesh.rotation.y = enemy.rotation;

                    if (canSeePlayer) {
                        enemy.state = 'combat';
                        this.setVisionAlert(enemy, true);
                    }
                    if (enemy.searchTimer <= 0) {
                        enemy.state = 'patrol';
                        this.setVisionAlert(enemy, false);
                    }
                    break;
            }
        }
    },

    checkVision(enemy, playerPos, dist, dir) {
        if (dist > enemy.visionRange) return false;
        if (Player.isCrouching && dist > enemy.visionRange * 0.5) return false;

        const forward = new THREE.Vector3(Math.sin(enemy.rotation), 0, Math.cos(enemy.rotation));
        const dot = forward.dot(dir);
        return dot > 0.5;
    },

    updatePatrol(enemy, dt) {
        if (enemy.patrolPoints.length === 0) return;

        const target = enemy.patrolPoints[enemy.currentPatrolIndex];
        const toTarget = target.clone().sub(enemy.position);
        toTarget.y = 0;
        const dist = toTarget.length();

        if (dist < 1) {
            enemy.currentPatrolIndex = (enemy.currentPatrolIndex + 1) % enemy.patrolPoints.length;
            return;
        }

        const dir = toTarget.normalize();
        enemy.position.x += dir.x * enemy.speed * dt;
        enemy.position.z += dir.z * enemy.speed * dt;

        enemy.rotation = Math.atan2(dir.x, dir.z);
        enemy.mesh.rotation.y = enemy.rotation;
    },

    updateCombat(enemy, dt, playerPos, dist, dir) {
        // Turn toward player
        const targetRot = Math.atan2(dir.x, dir.z);
        enemy.rotation = this.lerpAngle(enemy.rotation, targetRot, 5 * dt);
        enemy.mesh.rotation.y = enemy.rotation;

        // Move toward player if out of range
        if (dist > enemy.attackRange * 1.2) {
            enemy.position.x += dir.x * enemy.speed * 1.5 * dt;
            enemy.position.z += dir.z * enemy.speed * 1.5 * dt;
        }

        // Attack
        enemy.attackCooldown -= dt;
        if (dist <= enemy.attackRange && enemy.attackCooldown <= 0) {
            this.attack(enemy);
        }
    },

    attack(enemy) {
        enemy.attackCooldown = enemy.type === 'brute' ? 1.0 : 0.6;
        Player.takeDamage(enemy.damage);

        // Animate arm
        if (enemy.rightArm) {
            enemy.rightArm.rotation.x = -Math.PI / 3;
            setTimeout(() => { if (enemy.rightArm) enemy.rightArm.rotation.x = 0; }, 200);
        }
    },

    damageEnemy(enemy, amount) {
        enemy.health -= amount;
        if (enemy.health <= 0) {
            this.knockOut(enemy);
            return true;
        }
        // Flash red
        if (enemy.body) {
            const origColor = enemy.body.material.color.getHex();
            enemy.body.material.color.setHex(0xff0000);
            setTimeout(() => { if (enemy.body) enemy.body.material.color.setHex(origColor); }, 100);
        }
        return false;
    },

    knockOut(enemy) {
        enemy.state = 'unconscious';
        enemy.health = 0;
        // Fall over nicely
        let fallInt = setInterval(() => {
            if (!enemy.mesh) { clearInterval(fallInt); return; }
            enemy.mesh.rotation.x += 0.15;
            enemy.mesh.position.y -= 0.05;
            if (enemy.mesh.rotation.x >= Math.PI / 2) {
                enemy.mesh.rotation.x = Math.PI / 2;
                clearInterval(fallInt);
            }
        }, 30);
        // Hide vision cone
        if (enemy.cone) enemy.cone.visible = false;
        if (enemy.hb) enemy.hb.visible = false;
        if (enemy.hbBg) enemy.hbBg.visible = false;
        if (enemy.marker) enemy.marker.visible = false;
    },

    stealthTakedown(enemy) {
        this.knockOut(enemy);
        return true;
    },

    getClosestEnemy(position, maxDist) {
        let closest = null;
        let closestDist = maxDist;
        for (const e of this.enemies) {
            if (e.state === 'unconscious') continue;
            const dist = position.distanceTo(e.position);
            if (dist < closestDist) {
                closestDist = dist;
                closest = e;
            }
        }
        return closest;
    },

    getEnemyBehindCheck(enemy) {
        const playerDir = Player.getForwardDirection();
        playerDir.y = 0;
        playerDir.normalize();
        const enemyForward = new THREE.Vector3(Math.sin(enemy.rotation), 0, Math.cos(enemy.rotation));
        const toPlayer = Player.position.clone().sub(enemy.position);
        toPlayer.y = 0;
        toPlayer.normalize();
        return enemyForward.dot(toPlayer) < -0.3;
    },

    getActiveCount() {
        return this.enemies.filter(e => e.state !== 'unconscious').length;
    },

    setVisionAlert(enemy, alert) {
        if (enemy.cone) {
            enemy.cone.material = alert ? this.enemyMaterials.visionAlert : this.enemyMaterials.vision;
        }
    },

    lerpAngle(a, b, t) {
        let diff = b - a;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return a + diff * Math.min(t, 1);
    },

    clearAll() {
        for (const e of this.enemies) {
            this.scene.remove(e.mesh);
        }
        this.enemies = [];
    }
};
