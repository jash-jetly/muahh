// ===== PLAYER SYSTEM WITH DETECTIVE MODE =====
const Player = {
    mesh: null, body: null, head: null, cape: null,
    arms: { left: null, right: null },
    legs: { left: null, right: null },

    position: new THREE.Vector3(0, 30, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    rotation: 0, pitch: 0,

    health: 100, maxHealth: 100,
    isGrounded: false, isSprinting: false, isCrouching: false,
    isGliding: false, isGrappling: false,
    isDodging: false, dodgeTimer: 0, dodgeCooldown: 0,
    invulnerable: false, invulnerableTimer: 0,

    // Detective mode
    detectiveActive: false,
    detectiveTimer: 0,
    detectiveMaxTime: 60,
    detectiveCooldown: 0,
    detectiveCooldownMax: 1,
    originalMaterials: new Map(),
    _buildingOrigMaterials: [],

    speed: 10, sprintMultiplier: 1.6, jumpForce: 12, gravity: -28,
    cameraSmoothness: 0.12,

    keys: {}, mouseDX: 0, mouseDY: 0,
    mouseButtons: { left: false, right: false },
    mouseSensitivity: 0.002,
    isPointerLocked: false,
    walkCycle: 0,

    init(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.mesh = new THREE.Group();

        const bodyGeo = new THREE.CylinderGeometry(0.4, 0.35, 1.2, 8);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x2a2a3a });
        this.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.body.position.y = 0.9;
        this.mesh.add(this.body);

        const headGeo = new THREE.SphereGeometry(0.25, 8, 6);
        const headMat = new THREE.MeshLambertMaterial({ color: 0x3a3a4a });
        this.head = new THREE.Mesh(headGeo, headMat);
        this.head.position.y = 1.7;
        this.mesh.add(this.head);

        // Batman mask ears
        const earGeo = new THREE.ConeGeometry(0.06, 0.2, 4);
        const earMat = new THREE.MeshLambertMaterial({ color: 0x2a2a3a });
        const earL = new THREE.Mesh(earGeo, earMat);
        earL.position.set(-0.15, 1.95, 0);
        this.mesh.add(earL);
        const earR = new THREE.Mesh(earGeo, earMat);
        earR.position.set(0.15, 1.95, 0);
        this.mesh.add(earR);

        const visorGeo = new THREE.BoxGeometry(0.3, 0.08, 0.05);
        const visorMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.8 });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 1.72, 0.22);
        this.mesh.add(visor);

        const armGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.7, 6);
        const armMat = new THREE.MeshLambertMaterial({ color: 0x2a2a3a });
        this.arms.left = new THREE.Mesh(armGeo, armMat);
        this.arms.left.position.set(-0.55, 1.0, 0);
        this.mesh.add(this.arms.left);
        this.arms.right = new THREE.Mesh(armGeo, armMat);
        this.arms.right.position.set(0.55, 1.0, 0);
        this.mesh.add(this.arms.right);

        const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.8, 6);
        const legMat = new THREE.MeshLambertMaterial({ color: 0x222233 });
        this.legs.left = new THREE.Mesh(legGeo, legMat);
        this.legs.left.position.set(-0.18, 0.1, 0);
        this.mesh.add(this.legs.left);
        this.legs.right = new THREE.Mesh(legGeo, legMat);
        this.legs.right.position.set(0.18, 0.1, 0);
        this.mesh.add(this.legs.right);

        // Cape
        const capeGeo = new THREE.PlaneGeometry(0.8, 1.4, 5, 8);
        const capeMat = new THREE.MeshLambertMaterial({ color: 0x1a0a2e, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
        this.cape = new THREE.Mesh(capeGeo, capeMat);
        this.cape.position.set(0, 1.0, -0.35);
        this.mesh.add(this.cape);

        this.mesh.castShadow = true;
        scene.add(this.mesh);
        this.setupInput();
    },

    setupInput() {
        document.addEventListener('keydown', (e) => { this.keys[e.code] = true; });
        document.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                this.mouseDX += e.movementX;
                this.mouseDY += e.movementY;
            }
        });
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.mouseButtons.left = true;
            if (e.button === 2) this.mouseButtons.right = true;
        });
        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouseButtons.left = false;
            if (e.button === 2) this.mouseButtons.right = false;
        });
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = !!document.pointerLockElement;
        });
    },

    lockPointer() { document.body.requestPointerLock(); },

    update(dt) {
        if (!this.isPointerLocked) return;

        // ===== MOUSE LOOK =====
        this.rotation -= this.mouseDX * this.mouseSensitivity;
        this.pitch -= this.mouseDY * this.mouseSensitivity;
        this.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.pitch));
        this.mouseDX = 0;
        this.mouseDY = 0;

        // Crouch
        this.isCrouching = !!this.keys['ControlLeft'] || !!this.keys['ControlRight'];

        // Detective mode toggle (Shift)
        if ((this.keys['ShiftLeft'] || this.keys['ShiftRight']) && !this.detectiveActive && this.detectiveCooldown <= 0) {
            this.keys['ShiftLeft'] = false;
            this.keys['ShiftRight'] = false;
            this.activateDetectiveMode();
        }

        // Detective timers
        if (this.detectiveActive) {
            this.detectiveTimer -= dt;
            UI.updateDetective(this.detectiveTimer, this.detectiveMaxTime);
            if (this.detectiveTimer <= 0) this.deactivateDetectiveMode();
        }
        if (this.detectiveCooldown > 0) {
            this.detectiveCooldown -= dt;
            if (!this.detectiveActive) {
                UI.updateDetective(this.detectiveCooldownMax - this.detectiveCooldown, this.detectiveCooldownMax);
            }
        }

        // ===== PROPER WASD MOVEMENT =====
        // Build local-space move direction from keys
        // In Three.js: +X is right, +Z is toward camera (backward in world)
        // Our convention: rotation=0 means facing +Z direction
        let inputX = 0; // right/left
        let inputZ = 0; // forward/backward

        if (this.keys['KeyW']) inputZ = 1;   // forward
        if (this.keys['KeyS']) inputZ = -1;  // backward
        if (this.keys['KeyA']) inputX = -1;  // left
        if (this.keys['KeyD']) inputX = 1;   // right

        const hasInput = (inputX !== 0 || inputZ !== 0);

        if (hasInput) {
            // Normalize diagonal movement
            const len = Math.sqrt(inputX * inputX + inputZ * inputZ);
            inputX /= len;
            inputZ /= len;

            // Convert to world space using player rotation
            // Forward direction: (sin(rot), 0, cos(rot))
            // Right direction: (cos(rot), 0, -sin(rot))
            const sinR = Math.sin(this.rotation);
            const cosR = Math.cos(this.rotation);

            const worldX = inputX * cosR + inputZ * sinR;
            const worldZ = -inputX * sinR + inputZ * cosR;

            let currentSpeed = this.speed;
            if (this.isCrouching) currentSpeed *= 0.5;

            this.velocity.x = worldX * currentSpeed;
            this.velocity.z = worldZ * currentSpeed;
            this.walkCycle += dt * currentSpeed * 0.5;
        } else {
            // Decelerate
            this.velocity.x *= 0.85;
            this.velocity.z *= 0.85;
        }

        // Dodge
        if (this.dodgeCooldown > 0) this.dodgeCooldown -= dt;
        if (this.isDodging) {
            this.dodgeTimer -= dt;
            if (this.dodgeTimer <= 0) { this.isDodging = false; this.invulnerable = false; }
        }

        // Jump
        if (this.keys['Space'] && this.isGrounded && !this.isGrappling) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }

        // Gravity
        if (!this.isGrounded && !this.isGrappling) {
            if (this.isGliding) {
                this.velocity.y += this.gravity * 0.12 * dt;
                if (this.velocity.y < -2.5) this.velocity.y = -2.5;
            } else {
                this.velocity.y += this.gravity * dt;
            }
        }

        // Apply velocity
        if (!this.isGrappling) {
            this.position.x += this.velocity.x * dt;
            this.position.y += this.velocity.y * dt;
            this.position.z += this.velocity.z * dt;
        }

        // Floor collision
        const groundH = CityGenerator.getHeightAt(this.position.x, this.position.z);
        if (this.position.y <= groundH) {
            this.position.y = groundH;
            this.velocity.y = 0;
            this.isGrounded = true;
            this.isGliding = false;
        } else if (this.position.y > groundH + 0.5) {
            this.isGrounded = false;
        }
        if (this.position.y < 0) { this.position.y = 0; this.velocity.y = 0; this.isGrounded = true; }

        // Building side collision
        const collB = CityGenerator.checkBuildingCollision(this.position.x, this.position.z, 0.5);
        if (collB && this.position.y < collB.height - 0.5) {
            const dx = this.position.x - collB.centerX;
            const dz = this.position.z - collB.centerZ;
            const angle = Math.atan2(dz, dx);
            this.position.x = collB.centerX + Math.cos(angle) * (collB.width / 2 + 0.6);
            this.position.z = collB.centerZ + Math.sin(angle) * (collB.depth / 2 + 0.6);
        }

        // Invulnerability
        if (this.invulnerable) {
            this.invulnerableTimer -= dt;
            if (this.invulnerableTimer <= 0) this.invulnerable = false;
        }

        // Update mesh position & rotation
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;

        // Walk animation
        if (hasInput && this.isGrounded) {
            const swing = Math.sin(this.walkCycle * 3) * 0.3;
            this.legs.left.rotation.x = swing;
            this.legs.right.rotation.x = -swing;
            this.arms.left.rotation.x = -swing * 0.5;
            this.arms.right.rotation.x = swing * 0.5;
        } else {
            this.legs.left.rotation.x *= 0.9;
            this.legs.right.rotation.x *= 0.9;
            this.arms.left.rotation.x *= 0.9;
            this.arms.right.rotation.x *= 0.9;
        }

        // Cape animation
        if (this.cape) {
            const verts = this.cape.geometry.attributes.position;
            for (let i = 0; i < verts.count; i++) {
                const y = verts.getY(i);
                if (y < 0) {
                    const wave = Math.sin(Date.now() * 0.003 + i * 0.5) * 0.1;
                    const wind = this.isGliding ? 0.5 : 0.05;
                    verts.setZ(i, -0.35 - Math.abs(y) * wind + wave);
                }
            }
            verts.needsUpdate = true;
            if (this.isGliding) {
                this.cape.scale.set(3.5, 2.5, 1);
            } else {
                this.cape.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            }
        }

        this.updateCamera(dt);
    },

    updateCamera(dt) {
        if (this.camera) {
            let targetFov = 70;
            if (this.isGliding) targetFov = 100;
            else if (this.isSprinting) targetFov = 85;
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, 0.05);
            this.camera.updateProjectionMatrix();
        }

        // Camera offset behind and above player
        const idealOffset = new THREE.Vector3(0, 3.5, -6);
        if (this.isCrouching) idealOffset.set(0, 2, -5);
        if (this.isGliding) idealOffset.set(0, 5, -10);

        // Rotate the offset by player's yaw and partial pitch
        const quat = new THREE.Quaternion();
        quat.setFromEuler(new THREE.Euler(this.pitch * 0.3, this.rotation, 0, 'YXZ'));
        idealOffset.applyQuaternion(quat);

        const idealPos = this.position.clone().add(idealOffset);
        this.camera.position.lerp(idealPos, this.cameraSmoothness);

        // Look ahead of the player
        const lookTarget = new THREE.Vector3(
            this.position.x + Math.sin(this.rotation) * 10,
            this.position.y + 1.5 + Math.sin(this.pitch) * 5,
            this.position.z + Math.cos(this.rotation) * 10
        );
        this.camera.lookAt(lookTarget);
    },

    // ===== DETECTIVE MODE =====
    activateDetectiveMode() {
        this.detectiveActive = true;
        this.detectiveTimer = this.detectiveMaxTime;
        document.getElementById('detective-overlay').classList.remove('hidden');
        UI.showAlert('DETECTIVE VISION ACTIVATED');

        // Dark blue world
        if (this.scene.fog) {
            this._origFogColor = this.scene.fog.color.clone();
            this._origFogDensity = this.scene.fog.density;
            this.scene.fog.color.setHex(0x001122);
            this.scene.fog.density = 0.003;
        }
        this._origBg = this.scene.background.clone();
        this.scene.background.setHex(0x000a15);

        // Make ALL buildings transparent (x-ray)
        this._buildingOrigMaterials = [];
        const xrayMat = new THREE.MeshBasicMaterial({
            color: 0x0044aa, transparent: true, opacity: 0.08, wireframe: true
        });
        for (const b of CityGenerator.buildings) {
            this._buildingOrigMaterials.push({ mesh: b.mesh, mat: b.mesh.material });
            b.mesh.material = xrayMat;
        }

        // Highlight enemies bright red
        for (const enemy of EnemyManager.enemies) {
            if (enemy.state === 'unconscious') continue;
            this._storeOrigMaterial(enemy.body, enemy.body.material);
            enemy.body.material = new THREE.MeshBasicMaterial({ color: 0xff2222, transparent: true, opacity: 0.8 });
            if (!enemy.detectiveGlow) {
                const glowGeo = new THREE.SphereGeometry(2, 8, 8);
                const glowMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.2 });
                enemy.detectiveGlow = new THREE.Mesh(glowGeo, glowMat);
                enemy.mesh.add(enemy.detectiveGlow);
                enemy.detectiveGlow.position.y = 1;
            }
            enemy.detectiveGlow.visible = true;
        }

        // Highlight bombs bright green
        for (const bomb of CityGenerator.bombs) {
            if (bomb.disarmed) continue;
            if (!bomb.detectiveGlow) {
                const glowGeo = new THREE.SphereGeometry(3, 8, 8);
                const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ff44, transparent: true, opacity: 0.25 });
                bomb.detectiveGlow = new THREE.Mesh(glowGeo, glowMat);
                bomb.mesh.add(bomb.detectiveGlow);
            }
            bomb.detectiveGlow.visible = true;
        }
    },

    deactivateDetectiveMode() {
        this.detectiveActive = false;
        this.detectiveCooldown = this.detectiveCooldownMax;
        document.getElementById('detective-overlay').classList.add('hidden');

        // Restore fog
        if (this._origFogColor && this.scene.fog) {
            this.scene.fog.color.copy(this._origFogColor);
            if (this._origFogDensity) this.scene.fog.density = this._origFogDensity;
        }
        if (this._origBg) this.scene.background.copy(this._origBg);

        // Restore building materials
        for (const entry of this._buildingOrigMaterials) {
            entry.mesh.material = entry.mat;
        }
        this._buildingOrigMaterials = [];

        // Restore enemies
        for (const enemy of EnemyManager.enemies) {
            this._restoreOrigMaterial(enemy.body);
            if (enemy.detectiveGlow) enemy.detectiveGlow.visible = false;
        }

        // Hide bomb glows
        for (const bomb of CityGenerator.bombs) {
            if (bomb.detectiveGlow) bomb.detectiveGlow.visible = false;
        }
    },

    _storeOrigMaterial(mesh, mat) {
        if (!this.originalMaterials.has(mesh)) this.originalMaterials.set(mesh, mat);
    },
    _restoreOrigMaterial(mesh) {
        if (this.originalMaterials.has(mesh)) {
            mesh.material = this.originalMaterials.get(mesh);
            this.originalMaterials.delete(mesh);
        }
    },

    takeDamage(amount) {
        if (this.invulnerable || this.isDodging) return;
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        UI.updateHealth(this.health, this.maxHealth);
        UI.damageFlash();
    },

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        UI.updateHealth(this.health, this.maxHealth);
    },

    dodge(dirX, dirZ) {
        if (this.dodgeCooldown > 0 || this.isDodging) return;
        this.isDodging = true; this.invulnerable = true;
        this.dodgeTimer = 0.3; this.dodgeCooldown = 0.8; this.invulnerableTimer = 0.3;
        const sinR = Math.sin(this.rotation);
        const cosR = Math.cos(this.rotation);
        this.velocity.x = (dirX * cosR + dirZ * sinR) * 15;
        this.velocity.z = (-dirX * sinR + dirZ * cosR) * 15;
    },

    getForwardDirection() {
        return new THREE.Vector3(
            Math.sin(this.rotation),
            Math.sin(this.pitch),
            Math.cos(this.rotation)
        ).normalize();
    },

    reset() {
        this.health = this.maxHealth;
        this.position.set(0, 30, 0);
        this.velocity.set(0, 0, 0);
        this.rotation = 0; this.pitch = 0;
        this.isGrounded = false; this.isSprinting = false; this.isCrouching = false;
        this.isGliding = false; this.isGrappling = false;
        this.isDodging = false; this.invulnerable = false;
        this.detectiveActive = false; this.detectiveTimer = 0; this.detectiveCooldown = 0;
        this._buildingOrigMaterials = [];
        document.getElementById('detective-overlay').classList.add('hidden');
    }
};
