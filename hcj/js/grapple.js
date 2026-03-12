// ===== GRAPPLING HOOK SYSTEM =====
const Grapple = {
    isActive: false,
    isFiring: false,
    target: null,
    cable: null,
    cooldown: 0,
    maxRange: 45,
    pullSpeed: 30,
    cableMaterial: null,
    hookMesh: null,
    fireProgress: 0,
    fireSpeed: 3,

    init(scene) {
        this.scene = scene;
        this.cableMaterial = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            transparent: true,
            opacity: 0.8
        });
        this.hookMaterial = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
    },

    fire(origin, direction) {
        if (this.cooldown > 0 || this.isActive || this.isFiring) return false;

        const target = CityGenerator.getGrappleTarget(origin, direction, this.maxRange);
        if (!target) return false;

        this.target = target;
        this.isFiring = true;
        this.fireProgress = 0;
        this.createCable(origin, origin);
        this.createHook(origin);

        return true;
    },

    createCable(start, end) {
        if (this.cable) {
            this.scene.remove(this.cable);
        }
        const dir = end.clone().sub(start);
        const length = dir.length();
        if (length < 0.1) return;

        const geo = new THREE.CylinderGeometry(0.03, 0.03, length, 4);
        geo.rotateX(Math.PI / 2);
        this.cable = new THREE.Mesh(geo, this.cableMaterial);

        const mid = start.clone().add(end).multiplyScalar(0.5);
        this.cable.position.copy(mid);
        this.cable.lookAt(end);
        this.scene.add(this.cable);
    },

    createHook(pos) {
        if (this.hookMesh) {
            this.scene.remove(this.hookMesh);
        }
        const geo = new THREE.SphereGeometry(0.15, 6, 6);
        this.hookMesh = new THREE.Mesh(geo, this.hookMaterial);
        this.hookMesh.position.copy(pos);
        this.scene.add(this.hookMesh);
    },

    update(dt, playerPos) {
        if (this.cooldown > 0) {
            this.cooldown -= dt;
            UI.updateGrapple(Math.max(0, this.cooldown), 1.5);
        }

        if (this.isFiring) {
            this.fireProgress += dt * this.fireSpeed;
            if (this.fireProgress >= 1) {
                this.fireProgress = 1;
                this.isFiring = false;
                this.isActive = true;
            }

            const hookPos = playerPos.clone().lerp(this.target, this.fireProgress);
            if (this.hookMesh) this.hookMesh.position.copy(hookPos);
            this.createCable(playerPos, hookPos);
            return;
        }

        if (!this.isActive) return;

        // Pull player toward target
        const toTarget = this.target.clone().sub(playerPos);
        const dist = toTarget.length();

        if (dist < 2) {
            this.release();
            Player.velocity.set(0, 5, 0);
            Player.isGrounded = false;
            return;
        }

        toTarget.normalize();
        Player.position.add(toTarget.clone().multiplyScalar(this.pullSpeed * dt));
        Player.velocity.copy(toTarget.clone().multiplyScalar(this.pullSpeed * 0.5));
        Player.isGrappling = true;

        // Update cable
        this.createCable(playerPos, this.target);
        if (this.hookMesh) this.hookMesh.position.copy(this.target);
    },

    release() {
        this.isActive = false;
        this.isFiring = false;
        Player.isGrappling = false;
        this.cooldown = 1.5;

        if (this.cable) {
            this.scene.remove(this.cable);
            this.cable = null;
        }
        if (this.hookMesh) {
            this.scene.remove(this.hookMesh);
            this.hookMesh = null;
        }
    }
};
