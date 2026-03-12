// ===== PROCEDURAL CITY GENERATOR WITH STREET LIGHTS & BOMBS =====
const CityGenerator = {
    buildings: [],
    streetLights: [],
    bombs: [],
    gridSize: 5,
    blockSize: 40,
    streetWidth: 12,
    buildingMaterials: [],

    init(scene) {
        this.scene = scene;
        this.buildings = [];
        this.streetLights = [];
        this.bombs = [];

        this.buildingMaterials = [
            new THREE.MeshLambertMaterial({ color: 0x1a1a2e }),
            new THREE.MeshLambertMaterial({ color: 0x16213e }),
            new THREE.MeshLambertMaterial({ color: 0x0f0f23 }),
            new THREE.MeshLambertMaterial({ color: 0x1a1025 }),
            new THREE.MeshLambertMaterial({ color: 0x121220 }),
        ];
        this.accentMaterial = new THREE.MeshLambertMaterial({ color: 0x2d1b69 });
        this.ventMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a3a });
        this.pipeMaterial = new THREE.MeshLambertMaterial({ color: 0x3a3a4a });
        this.waterTowerMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
        this.antennaMaterial = new THREE.MeshLambertMaterial({ color: 0x5a5a6a });
        this.dishMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a5a });
        this.windowMaterial = new THREE.MeshBasicMaterial({ color: 0x332255, transparent: true, opacity: 0.3 });
        this.litWindowMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd88, transparent: true, opacity: 0.6 });
        this.groundMaterial = new THREE.MeshLambertMaterial({ color: 0x0a0a14 });
        this.ledgeMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a3e });
        this.streetMaterial = new THREE.MeshLambertMaterial({ color: 0x111118 });
        this.lampPoleMaterial = new THREE.MeshLambertMaterial({ color: 0x3a3a4a });
        this.lampHeadMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.9 });
        // Bomb materials
        this.bombBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        this.bombLightMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.bombDisarmedMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // Detective mode materials (stored for toggling)
        this.detectiveEnemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.6 });
        this.detectiveBombMaterial = new THREE.MeshBasicMaterial({ color: 0x22ff22, transparent: true, opacity: 0.8 });
        this.detectiveBuildingMaterial = new THREE.MeshBasicMaterial({ color: 0x0066aa, transparent: true, opacity: 0.15 });
    },

    generateSector(sectorIndex) {
        const offsetX = sectorIndex * (this.gridSize * (this.blockSize + this.streetWidth));
        const buildings = [];
        const sectorW = this.gridSize * (this.blockSize + this.streetWidth);

        // Ground plane
        const groundGeo = new THREE.PlaneGeometry(sectorW + 50, sectorW + 50);
        const ground = new THREE.Mesh(groundGeo, this.groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(offsetX + sectorW / 2, 0, sectorW / 2);
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Street markings (subtle lines on ground)
        for (let gx = 0; gx <= this.gridSize; gx++) {
            const sx = offsetX + gx * (this.blockSize + this.streetWidth) - this.streetWidth / 2;
            const streetGeo = new THREE.PlaneGeometry(this.streetWidth, sectorW);
            const street = new THREE.Mesh(streetGeo, this.streetMaterial);
            street.rotation.x = -Math.PI / 2;
            street.position.set(sx + this.streetWidth / 2, 0.01, sectorW / 2);
            this.scene.add(street);
        }
        for (let gz = 0; gz <= this.gridSize; gz++) {
            const sz = gz * (this.blockSize + this.streetWidth) - this.streetWidth / 2;
            const streetGeo = new THREE.PlaneGeometry(sectorW, this.streetWidth);
            const street = new THREE.Mesh(streetGeo, this.streetMaterial);
            street.rotation.x = -Math.PI / 2;
            street.position.set(offsetX + sectorW / 2, 0.01, sz + this.streetWidth / 2);
            this.scene.add(street);
        }

        for (let gx = 0; gx < this.gridSize; gx++) {
            for (let gz = 0; gz < this.gridSize; gz++) {
                const bw = 15 + Math.random() * 20;
                const bd = 15 + Math.random() * 20;
                const bh = 20 + Math.random() * 60;
                const x = offsetX + gx * (this.blockSize + this.streetWidth) + (this.blockSize - bw) / 2;
                const z = gz * (this.blockSize + this.streetWidth) + (this.blockSize - bd) / 2;

                const building = this.createBuilding(x, z, bw, bd, bh, sectorIndex);
                buildings.push(building);

                if (Math.random() > 0.3) {
                    this.addRooftopProps(x, z, bw, bd, bh);
                }

                // Add street lights around buildings
                this.addStreetLights(x, z, bw, bd, offsetX, gx, gz);
            }
        }

        this.buildings.push(...buildings);
        return buildings;
    },

    addStreetLights(bx, bz, bw, bd, offsetX, gx, gz) {
        // Place lights at corners of blocks
        const positions = [
            [bx - 3, bz - 3],
            [bx + bw + 3, bz - 3],
            [bx - 3, bz + bd + 3],
            [bx + bw + 3, bz + bd + 3]
        ];

        for (const [lx, lz] of positions) {
            if (Math.random() > 0.4) continue; // Don't place every single one

            const poleH = 6;
            // Pole
            const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, poleH, 6);
            const pole = new THREE.Mesh(poleGeo, this.lampPoleMaterial);
            pole.position.set(lx, poleH / 2, lz);
            pole.castShadow = true;
            this.scene.add(pole);

            // Lamp arm
            const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.5, 4);
            const arm = new THREE.Mesh(armGeo, this.lampPoleMaterial);
            arm.rotation.z = Math.PI / 2;
            arm.position.set(lx + 0.75, poleH, lz);
            this.scene.add(arm);

            // Lamp head (glowing)
            const headGeo = new THREE.SphereGeometry(0.25, 8, 6);
            const head = new THREE.Mesh(headGeo, this.lampHeadMaterial);
            head.position.set(lx + 1.5, poleH - 0.1, lz);
            this.scene.add(head);

            // Actual point light
            const light = new THREE.PointLight(0xffaa44, 0.6, 25, 2);
            light.position.set(lx + 1.5, poleH - 0.3, lz);
            light.castShadow = false; // perf
            this.scene.add(light);

            // Ground glow circle
            const glowGeo = new THREE.CircleGeometry(3, 16);
            const glowMat = new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.04 });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.rotation.x = -Math.PI / 2;
            glow.position.set(lx + 1.5, 0.02, lz);
            this.scene.add(glow);

            this.streetLights.push({ pole, arm, head, light, glow });
        }
    },

    spawnBombs(sectorIndex, count) {
        const sectorBuildings = this.getBuildingsInSector(sectorIndex);
        const usedBuildings = new Set();
        const newBombs = [];

        for (let i = 0; i < count && i < sectorBuildings.length; i++) {
            let b;
            do {
                b = sectorBuildings[Math.floor(Math.random() * sectorBuildings.length)];
            } while (usedBuildings.has(b) && usedBuildings.size < sectorBuildings.length);
            usedBuildings.add(b);

            const bomb = this.createBomb(b);
            newBombs.push(bomb);
        }

        return newBombs;
    },

    createBomb(building) {
        const group = new THREE.Group();

        // Bomb body (box with cylinders)
        const bodyGeo = new THREE.BoxGeometry(1.2, 0.8, 0.6);
        const body = new THREE.Mesh(bodyGeo, this.bombBodyMaterial);
        group.add(body);

        // Blinking light
        const lightGeo = new THREE.SphereGeometry(0.1, 6, 6);
        const blinkLight = new THREE.Mesh(lightGeo, this.bombLightMaterial.clone());
        blinkLight.position.set(0, 0.45, 0);
        group.add(blinkLight);

        // Wires
        for (let i = 0; i < 3; i++) {
            const wireGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4);
            const wireMat = new THREE.MeshBasicMaterial({ color: [0xff0000, 0x00ff00, 0x0000ff][i] });
            const wire = new THREE.Mesh(wireGeo, wireMat);
            wire.position.set(-0.3 + i * 0.3, -0.5, 0);
            group.add(wire);
        }

        // Glow ring (pulsing)
        const ringGeo = new THREE.TorusGeometry(1, 0.05, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.3 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.1;
        group.add(ring);

        // Point light for bomb glow
        const bombLight = new THREE.PointLight(0xff2200, 0.5, 10);
        bombLight.position.set(0, 0.5, 0);
        group.add(bombLight);

        // Position on building
        const px = building.centerX + (Math.random() - 0.5) * building.width * 0.4;
        const pz = building.centerZ + (Math.random() - 0.5) * building.depth * 0.4;
        group.position.set(px, building.height + 0.4, pz);

        this.scene.add(group);

        const bombData = {
            mesh: group,
            blinkLight,
            ring,
            bombLight,
            position: group.position,
            building,
            disarmed: false,
            blinkTimer: 0
        };
        this.bombs.push(bombData);
        return bombData;
    },

    updateBombs(dt) {
        for (const bomb of this.bombs) {
            if (bomb.disarmed) continue;

            bomb.blinkTimer += dt;
            const blink = Math.sin(bomb.blinkTimer * 4) > 0;
            bomb.blinkLight.material.opacity = blink ? 1 : 0.2;
            bomb.ring.scale.setScalar(1 + Math.sin(bomb.blinkTimer * 2) * 0.2);
            bomb.ring.material.opacity = 0.2 + Math.sin(bomb.blinkTimer * 3) * 0.15;
            bomb.bombLight.intensity = 0.3 + Math.sin(bomb.blinkTimer * 4) * 0.3;
        }
    },

    disarmBomb(bomb) {
        bomb.disarmed = true;
        bomb.blinkLight.material.color.setHex(0x00ff00);
        bomb.blinkLight.material.opacity = 1;
        bomb.ring.material.color.setHex(0x00ff00);
        bomb.ring.material.opacity = 0.5;
        bomb.bombLight.color.setHex(0x00ff00);
        bomb.bombLight.intensity = 0.8;
    },

    getActiveBombCount() {
        return this.bombs.filter(b => !b.disarmed).length;
    },

    getClosestActiveBomb(position, maxDist) {
        let closest = null;
        let closestDist = maxDist;
        for (const b of this.bombs) {
            if (b.disarmed) continue;
            const dist = position.distanceTo(b.position);
            if (dist < closestDist) {
                closestDist = dist;
                closest = b;
            }
        }
        return closest;
    },

    createBuilding(x, z, w, d, h, sectorIndex) {
        const mat = this.buildingMaterials[Math.floor(Math.random() * this.buildingMaterials.length)];
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x + w / 2, h / 2, z + d / 2);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        // Ledge
        const ledgeGeo = new THREE.BoxGeometry(w + 0.6, 0.5, d + 0.6);
        const ledge = new THREE.Mesh(ledgeGeo, this.ledgeMaterial);
        ledge.position.set(x + w / 2, h, z + d / 2);
        this.scene.add(ledge);

        this.addWindows(mesh, x, z, w, d, h);

        // Accent strip
        if (Math.random() > 0.5) {
            const stripH = 0.3;
            const stripY = h * (0.6 + Math.random() * 0.3);
            const stripGeo = new THREE.BoxGeometry(w + 0.1, stripH, d + 0.1);
            const strip = new THREE.Mesh(stripGeo, this.accentMaterial);
            strip.position.set(x + w / 2, stripY, z + d / 2);
            this.scene.add(strip);
        }

        return {
            mesh, x, z, width: w, depth: d, height: h,
            centerX: x + w / 2, centerZ: z + d / 2,
            sectorIndex,
            minX: x, maxX: x + w,
            minZ: z, maxZ: z + d
        };
    },

    addWindows(buildingMesh, x, z, w, d, h) {
        const windowSize = 1.2;
        const windowSpacing = 4;
        const floors = Math.floor(h / windowSpacing);
        const windowsPerFloorW = Math.floor(w / windowSpacing);

        for (let f = 1; f < floors; f++) {
            const wy = f * windowSpacing;
            for (let i = 0; i < windowsPerFloorW; i++) {
                if (Math.random() > 0.4) {
                    const mat = Math.random() > 0.65 ? this.litWindowMaterial : this.windowMaterial;
                    const wGeo = new THREE.PlaneGeometry(windowSize, windowSize * 1.5);
                    const wMesh = new THREE.Mesh(wGeo, mat);
                    wMesh.position.set(x + (i + 1) * (w / (windowsPerFloorW + 1)), wy, z + d + 0.05);
                    this.scene.add(wMesh);
                }
            }
            for (let i = 0; i < windowsPerFloorW; i++) {
                if (Math.random() > 0.4) {
                    const mat = Math.random() > 0.65 ? this.litWindowMaterial : this.windowMaterial;
                    const wGeo = new THREE.PlaneGeometry(windowSize, windowSize * 1.5);
                    const wMesh = new THREE.Mesh(wGeo, mat);
                    wMesh.position.set(x + (i + 1) * (w / (windowsPerFloorW + 1)), wy, z - 0.05);
                    wMesh.rotation.y = Math.PI;
                    this.scene.add(wMesh);
                }
            }
        }
    },

    addRooftopProps(x, z, bw, bd, bh) {
        const propType = Math.random();
        const roofY = bh;
        const cx = x + bw / 2;
        const cz = z + bd / 2;

        if (propType < 0.25) {
            const tankGeo = new THREE.CylinderGeometry(2, 2, 3, 8);
            const tank = new THREE.Mesh(tankGeo, this.waterTowerMaterial);
            tank.position.set(cx + (Math.random() - 0.5) * bw * 0.4, roofY + 4, cz + (Math.random() - 0.5) * bd * 0.4);
            this.scene.add(tank);
            const topGeo = new THREE.ConeGeometry(2.2, 1, 8);
            const top = new THREE.Mesh(topGeo, this.waterTowerMaterial);
            top.position.copy(tank.position);
            top.position.y += 2;
            this.scene.add(top);
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 4);
                const leg = new THREE.Mesh(legGeo, this.antennaMaterial);
                leg.position.set(tank.position.x + Math.cos(angle) * 1.2, roofY + 1.25, tank.position.z + Math.sin(angle) * 1.2);
                this.scene.add(leg);
            }
        } else if (propType < 0.5) {
            const numVents = 1 + Math.floor(Math.random() * 3);
            for (let i = 0; i < numVents; i++) {
                const vw = 1 + Math.random() * 1.5;
                const vh = 0.8 + Math.random() * 1.2;
                const ventGeo = new THREE.BoxGeometry(vw, vh, vw);
                const vent = new THREE.Mesh(ventGeo, this.ventMaterial);
                vent.position.set(cx + (Math.random() - 0.5) * bw * 0.5, roofY + vh / 2, cz + (Math.random() - 0.5) * bd * 0.5);
                this.scene.add(vent);
            }
        } else if (propType < 0.7) {
            const pipeGeo = new THREE.CylinderGeometry(0.15, 0.15, 3 + Math.random() * 4, 6);
            const pipe = new THREE.Mesh(pipeGeo, this.pipeMaterial);
            pipe.position.set(cx + (Math.random() - 0.5) * bw * 0.6, roofY + 2, cz + (Math.random() - 0.5) * bd * 0.6);
            this.scene.add(pipe);
        } else if (propType < 0.85) {
            const antennaH = 5 + Math.random() * 8;
            const antennaGeo = new THREE.CylinderGeometry(0.08, 0.08, antennaH, 4);
            const antenna = new THREE.Mesh(antennaGeo, this.antennaMaterial);
            antenna.position.set(cx + (Math.random() - 0.5) * bw * 0.3, roofY + antennaH / 2, cz + (Math.random() - 0.5) * bd * 0.3);
            this.scene.add(antenna);
            const lightGeo = new THREE.SphereGeometry(0.15, 6, 6);
            const lightMat = new THREE.MeshBasicMaterial({ color: 0xff2244 });
            const blinker = new THREE.Mesh(lightGeo, lightMat);
            blinker.position.copy(antenna.position); blinker.position.y += antennaH / 2;
            this.scene.add(blinker);
        } else {
            const dishGeo = new THREE.SphereGeometry(1.2, 8, 4, 0, Math.PI * 2, 0, Math.PI / 3);
            const dish = new THREE.Mesh(dishGeo, this.dishMaterial);
            dish.position.set(cx + (Math.random() - 0.5) * bw * 0.4, roofY + 1, cz + (Math.random() - 0.5) * bd * 0.4);
            dish.rotation.x = -Math.PI / 4 + Math.random() * 0.5;
            dish.rotation.y = Math.random() * Math.PI * 2;
            this.scene.add(dish);
            const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 4);
            const pole = new THREE.Mesh(poleGeo, this.antennaMaterial);
            pole.position.copy(dish.position); pole.position.y -= 0.5;
            this.scene.add(pole);
        }
    },

    getBuildingsInSector(sectorIndex) {
        return this.buildings.filter(b => b.sectorIndex === sectorIndex);
    },

    getHeightAt(px, pz) {
        let maxH = 0;
        for (const b of this.buildings) {
            if (px >= b.minX - 0.3 && px <= b.maxX + 0.3 && pz >= b.minZ - 0.3 && pz <= b.maxZ + 0.3) {
                if (b.height > maxH) maxH = b.height;
            }
        }
        return maxH;
    },

    checkBuildingCollision(px, pz, radius) {
        for (const b of this.buildings) {
            const closestX = Math.max(b.minX, Math.min(px, b.maxX));
            const closestZ = Math.max(b.minZ, Math.min(pz, b.maxZ));
            const dx = px - closestX;
            const dz = pz - closestZ;
            if (dx * dx + dz * dz < radius * radius) return b;
        }
        return null;
    },

    getGrappleTarget(origin, direction, maxRange) {
        let bestTarget = null;
        let bestDist = maxRange;
        for (const b of this.buildings) {
            const target = new THREE.Vector3(b.centerX, b.height + 0.5, b.centerZ);
            const toTarget = target.clone().sub(origin);
            const dist = toTarget.length();
            if (dist > maxRange) continue;
            toTarget.normalize();
            if (direction.dot(toTarget) < 0.7) continue;
            if (dist < bestDist) { bestDist = dist; bestTarget = target; }
        }
        return bestTarget;
    }
};
