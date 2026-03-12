const Parkour = {
    isWallRunning: false,
    wallRunTimer: 0,
    wallRunMaxTime: 1.2,
    wallRunSide: 0, // -1 left, 1 right
    isLedgeGrabbing: false,
    ledgeTarget: null,
    isVaulting: false,
    vaultTimer: 0,

    init() {
        // Nothing to initialize
    },

    update(dt) {
        // Wall run
        if (this.isWallRunning) {
            this.wallRunTimer += dt;
            if (this.wallRunTimer >= this.wallRunMaxTime || Player.isGrounded) {
                this.endWallRun();
            } else {
                // Sustain height during wall run
                Player.velocity.y = 2;

                // Move along wall
                const wallDir = new THREE.Vector3(
                    Math.sin(Player.rotation + this.wallRunSide * Math.PI / 2),
                    0,
                    Math.cos(Player.rotation + this.wallRunSide * Math.PI / 2)
                );
                Player.velocity.x = Math.sin(Player.rotation) * Player.speed * 1.2;
                Player.velocity.z = Math.cos(Player.rotation) * Player.speed * 1.2;

                // Tilt camera
                // (handled in camera)
            }
        }

        // Ledge grab
        if (this.isLedgeGrabbing && this.ledgeTarget) {
            const target = this.ledgeTarget.clone();
            target.y += 0.5;
            const toTarget = target.sub(Player.position);
            if (toTarget.length() < 0.5) {
                this.isLedgeGrabbing = false;
                this.ledgeTarget = null;
                Player.isGrounded = true;
                Player.velocity.set(0, 0, 0);
            } else {
                toTarget.normalize();
                Player.position.add(toTarget.multiplyScalar(12 * dt));
                Player.velocity.set(0, 0, 0);
            }
        }

        // Vault
        if (this.isVaulting) {
            this.vaultTimer -= dt;
            if (this.vaultTimer <= 0) {
                this.isVaulting = false;
            }
        }
    },

    checkWallRun() {
        if (Player.isGrounded || this.isWallRunning || !Player.isSprinting) return;
        if (Player.velocity.y > 0) return; // only on descent or level

        // Check for walls on sides
        const rightDir = new THREE.Vector3(
            Math.cos(Player.rotation),
            0,
            -Math.sin(Player.rotation)
        );
        const leftDir = rightDir.clone().negate();

        const rightCheck = Player.position.clone().add(rightDir.clone().multiplyScalar(1));
        const leftCheck = Player.position.clone().add(leftDir.clone().multiplyScalar(1));

        const rightBuilding = CityGenerator.checkBuildingCollision(rightCheck.x, rightCheck.z, 0.3);
        const leftBuilding = CityGenerator.checkBuildingCollision(leftCheck.x, leftCheck.z, 0.3);

        if (rightBuilding && Player.position.y < rightBuilding.height) {
            this.startWallRun(1);
        } else if (leftBuilding && Player.position.y < leftBuilding.height) {
            this.startWallRun(-1);
        }
    },

    startWallRun(side) {
        this.isWallRunning = true;
        this.wallRunTimer = 0;
        this.wallRunSide = side;
        Player.velocity.y = 3;
    },

    endWallRun() {
        this.isWallRunning = false;
        this.wallRunTimer = 0;
        this.wallRunSide = 0;
        // Wall jump boost
        if (Player.keys['Space']) {
            Player.velocity.y = Player.jumpForce * 0.8;
            Player.velocity.x += -this.wallRunSide * Math.cos(Player.rotation) * 5;
            Player.velocity.z += this.wallRunSide * Math.sin(Player.rotation) * 5;
        }
    },

    checkLedgeGrab() {
        if (Player.isGrounded || this.isLedgeGrabbing || Player.velocity.y > 0) return;

        const forward = Player.getForwardDirection();
        forward.y = 0;
        forward.normalize();

        const checkPos = Player.position.clone().add(forward.clone().multiplyScalar(1.5));

        for (const b of CityGenerator.buildings) {
            if (checkPos.x >= b.minX - 0.5 && checkPos.x <= b.maxX + 0.5 &&
                checkPos.z >= b.minZ - 0.5 && checkPos.z <= b.maxZ + 0.5) {
                const heightDiff = b.height - Player.position.y;
                if (heightDiff > 0 && heightDiff < 3) {
                    this.isLedgeGrabbing = true;
                    this.ledgeTarget = new THREE.Vector3(
                        Math.max(b.minX + 1, Math.min(b.maxX - 1, Player.position.x)),
                        b.height,
                        Math.max(b.minZ + 1, Math.min(b.maxZ - 1, Player.position.z))
                    );
                    Player.velocity.set(0, 0, 0);
                    break;
                }
            }
        }
    },

    checkVault() {
        if (!Player.isGrounded || !Player.isSprinting) return;

        const forward = Player.getForwardDirection();
        forward.y = 0;
        forward.normalize();

        const checkPos = Player.position.clone().add(forward.clone().multiplyScalar(1));
        // Check for low obstacles (rooftop objects)
        const groundH = CityGenerator.getHeightAt(checkPos.x, checkPos.z);
        if (groundH > Player.position.y && groundH - Player.position.y < 1.5) {
            this.isVaulting = true;
            this.vaultTimer = 0.3;
            Player.velocity.y = 8;
            Player.velocity.x = Math.sin(Player.rotation) * Player.speed * 1.5;
            Player.velocity.z = Math.cos(Player.rotation) * Player.speed * 1.5;
        }
    }
};
