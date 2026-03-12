<div align="center">

# 🦇 NIGHT VIGIL

### *The city sleeps. You don't.*

A browser-based superhero rooftop traversal & combat game built entirely with **procedural geometry** — no images, no textures, no sprites.

---

**Three.js** · **Vanilla JavaScript** · **Pure Geometry**

</div>

---

## 🌃 About

**Night Vigil** is a 3D action game playable directly in the browser. You play as a masked vigilante patrolling a procedurally generated noir cityscape at night — grappling between rooftops, gliding across streets, and taking down criminals in fluid combat.

Every single visual element — buildings, enemies, props, lighting — is rendered using **Three.js geometry and materials only**. No image assets exist. The entire world is math.

> 💀 **The Joker has planted explosive devices across the city's rooftops.**
> His thugs guard each bomb. Time is running out.
> Use your detective vision to locate threats and disarm every bomb before the city falls.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏙️ **Procedural City** | Grid-based city generation with randomized building heights, widths, and rooftop props (water towers, vents, antennas, satellite dishes) |
| 🪝 **Grappling Hook** | Fire a cable up to 45m, latch onto rooftops, and get pulled to the anchor point with animated cable visualization |
| 🏃 **Parkour System** | Fluid ledge grabs, wall climbs, vaults, and wall runs triggered contextually while sprinting |
| 🦅 **Gliding** | Deploy your cape mid-air to slow descent and glide across city blocks |
| 👊 **Combat** | Punch, heavy attack, dodge roll, stealth takedowns, and a combo system with score multipliers |
| 🤖 **Enemy AI** | Three enemy types (Thug, Gunman, Brute) with patrol → alert → combat → search behavior states and vision cones |
| 🔍 **Detective Vision** | Toggle an X-ray-like overlay that highlights enemies, bombs, and environmental details through walls |
| 💣 **Bomb Missions** | Locate and disarm Joker's bombs under a ticking countdown timer — clear sectors to progress |
| 🗺️ **Live Minimap** | Rotating radar-style minimap showing buildings, enemies, bombs, and compass directions |
| 🏆 **Leaderboard** | Track your best completion times locally |

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| `W A S D` | Move |
| `Mouse` | Look around |
| `Space` | Jump / Glide (hold while falling) |
| `Shift` | Detective Vision |
| `Ctrl` | Crouch |
| `E` | Grappling Hook |
| `F` | Stealth Takedown / Disarm Bomb |
| `Left Click` | Punch |
| `Right Click` | Heavy Attack |
| `Space` + Direction | Dodge Roll |
| `Tab` | Leaderboard |

---

## 🚀 Getting Started

No build tools. No dependencies. No server required.

```bash
# Clone the repository
git clone https://github.com/jash-jetly/muahh.git
cd muahh

# Open in your browser
open index.html
```

Or simply double-click `index.html` — that's it.

> **Note:** Three.js is loaded via CDN (`r128`), so you'll need an internet connection on first load.

---

## 📁 Project Structure

```
night-vigil/
├── index.html            # Entry point & HUD layout
├── css/
│   └── style.css         # UI styling, HUD, screens
├── js/
│   ├── main.js           # Game initialization & minimap renderer
│   ├── player.js         # Player model, movement, camera, detective vision
│   ├── grapple.js        # Grappling hook mechanics & cable rendering
│   ├── parkour.js        # Wall runs, ledge grabs, vaults
│   ├── glide.js          # Cape gliding system
│   ├── enemy.js          # Enemy types, AI states, vision cones
│   ├── combat.js         # Melee combat, combos, takedowns
│   ├── cityGenerator.js  # Procedural city & rooftop prop generation
│   ├── gameLoop.js       # Game states, sector progression, bomb timer
│   └── ui.js             # HUD updates, score, health bars, alerts
└── prompt.md             # Original game design document
```

---

## 🎨 Visual Philosophy

Night Vigil deliberately avoids textures and image assets. The entire aesthetic is achieved through:

- **Primitive geometry** — cubes, cylinders, spheres, cones, capsules
- **Material colors** — a palette of blacks, midnight blues, dim purples, and soft neon accents
- **Lighting** — moonlight, ambient city glow, hemisphere lighting, and accent point lights
- **Fog** — exponential distance fog for atmospheric depth
- **Shadows** — PCF soft shadow mapping for grounded realism

The result is a stylized, minimalist noir cityscape that runs at **60 FPS**.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Structure & HUD |
| **CSS3** | UI styling, animations, screen transitions |
| **Vanilla JavaScript** | All game logic — zero frameworks |
| **Three.js r128** | WebGL rendering, geometry, lighting, shadows |

No React. No Vue. No Node. No build step. Just the browser.

---

## 📊 Performance

- Target: **60 FPS** on modern browsers
- Optimized geometry with `PCFSoftShadowMap`
- `ACESFilmicToneMapping` for cinematic color grading
- Pixel ratio capped at `2x` for high-DPI displays
- Exponential fog culls distant geometry visually

---

<div align="center">

*Built with geometry, grit, and late nights.* 🌙

</div>
