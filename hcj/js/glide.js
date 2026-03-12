// ===== IMPROVED BATMAN-STYLE GLIDE SYSTEM =====
const Glide = {
    init() { },

    update(dt) {
        // Activate glide: hold Space while falling, not grounded, not grappling
        if (!Player.isGrounded && !Player.isGrappling && Player.keys['Space'] && Player.velocity.y < 0) {
            if (!Player.isGliding) Player.isGliding = true;
        } else if (Player.isGrounded || Player.isGrappling) {
            Player.isGliding = false;
        }
        // Release Space to stop gliding
        if (Player.isGliding && !Player.keys['Space']) {
            Player.isGliding = false;
        }

        if (Player.isGliding) {
            const forward = Player.getForwardDirection();
            forward.y = 0;
            forward.normalize();

            // Strong forward push (Batman swooping feeling)
            Player.velocity.x += forward.x * 30 * dt;
            Player.velocity.z += forward.z * 30 * dt;

            // Gentle descent — glide, don't fly
            if (Player.velocity.y < -3) Player.velocity.y = -3;

            // Steering with A/D while gliding
            const rightDir = new THREE.Vector3(
                Math.cos(Player.rotation), 0, -Math.sin(Player.rotation)
            );
            if (Player.keys['KeyA']) {
                Player.velocity.x -= rightDir.x * 15 * dt;
                Player.velocity.z -= rightDir.z * 15 * dt;
                Player.mesh.rotation.z = THREE.MathUtils.lerp(Player.mesh.rotation.z, 0.5, 0.1);
            } else if (Player.keys['KeyD']) {
                Player.velocity.x += rightDir.x * 15 * dt;
                Player.velocity.z += rightDir.z * 15 * dt;
                Player.mesh.rotation.z = THREE.MathUtils.lerp(Player.mesh.rotation.z, -0.5, 0.1);
            } else {
                Player.mesh.rotation.z = THREE.MathUtils.lerp(Player.mesh.rotation.z, 0, 0.1);
            }

            // Dive bomb: press Ctrl while gliding to speed dive
            if (Player.keys['ControlLeft'] || Player.keys['ControlRight']) {
                Player.velocity.y -= 40 * dt;
                Player.velocity.x += forward.x * 45 * dt;
                Player.velocity.z += forward.z * 45 * dt;
                Player.pitch = Math.min(Player.pitch + 0.05, Math.PI / 3);
            }

            // Limit horizontal speed
            const hSpeed = Math.sqrt(Player.velocity.x ** 2 + Player.velocity.z ** 2);
            const maxSpeed = 40;
            if (hSpeed > maxSpeed) {
                Player.velocity.x = (Player.velocity.x / hSpeed) * maxSpeed;
                Player.velocity.z = (Player.velocity.z / hSpeed) * maxSpeed;
            }
        }
    }
};
