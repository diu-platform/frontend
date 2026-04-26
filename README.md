# 🔬 DIU Physics Interactive

<div align="center">

![Version](https://img.shields.io/badge/version-0.15.13-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Languages](https://img.shields.io/badge/languages-8-orange.svg)
![Status](https://img.shields.io/badge/status-beta-yellow.svg)

**Interactive 3D Quantum Physics Simulations**

*An open-source educational platform for visualizing quantum phenomena*

[Live Demo](https://diu-os.dev/physics) • [Documentation](https://docs.diu-os.dev) • [Contributing](#-contributing)

</div>

---

## 📖 About

DIU Physics Interactive is an educational platform that brings quantum physics experiments to life through immersive 3D visualizations. Built with scientific accuracy based on peer-reviewed publications, it makes complex quantum concepts accessible to students, educators, and curious minds worldwide.

> **"If I have seen further, it is by standing on the shoulders of giants"**  
> — Isaac Newton, 1675

### 🎯 Key Features

- **🧪 Double-Slit Experiment** — Visualize wave-particle duality in real-time
- **🔬 Research Mode** — Extended parameters for scientists and researchers
- **📊 Real-time Statistics** — Histogram, fringe count, contrast analysis
- **🌡️ Heatmap Visualization** — Multiple color schemes and interpolation methods
- **📐 Theory Comparison** — R² metric comparing experimental data with theory
- **🌍 8 Languages** — RU, EN, ES, PT, DE, FR, ZH, AR
- **📱 Responsive Design** — Works on desktop and mobile
- **🖥️ Fullscreen Mode** — Immersive viewing experience

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/desci-intelligent-universe/diu-physics.git
cd diu-physics

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🏗️ Architecture

### No Backend Required!

DIU Physics is a **fully client-side application**. All physics calculations run in the browser using WebGL/Three.js. This means:

- ✅ No server required
- ✅ No database needed
- ✅ No user authentication (in current version)
- ✅ Can be hosted on static hosting (GitHub Pages, Netlify, Vercel)
- ✅ Works offline after initial load

### Tech Stack

| Layer | Technology |
|-------|------------|
| **3D Rendering** | Three.js + React Three Fiber |
| **UI Framework** | React 18 + TypeScript |
| **Styling** | Tailwind CSS |
| **State Management** | React Hooks |
| **Build Tool** | Vite |
| **Physics** | Custom implementation based on Optica papers |

### Project Structure

```
diu-physics/
├── src/
│   ├── App.tsx                 # Main application
│   ├── components/
│   │   ├── ModeSelector.tsx    # Demo/Lab/Research modes
│   │   ├── ControlsPanel.tsx   # Parameter controls
│   │   ├── ResearchPanel.tsx   # Extended parameters
│   │   ├── StatsPanel.tsx      # Statistics display
│   │   ├── ScientificCredits.tsx # Attribution panel
│   │   ├── FullscreenToggle.tsx # Fullscreen support
│   │   └── ...
│   ├── simulations/
│   │   └── DoubleSlit/
│   │       ├── index.tsx       # Main simulation
│   │       ├── Particles.tsx   # Photon simulation
│   │       ├── Barrier.tsx     # Double-slit barrier
│   │       ├── HeatmapScreen.tsx
│   │       └── hooks/
│   │           ├── useInterference.ts  # Fresnel-Kirchhoff formula
│   │           └── useWavelengthColor.ts
│   └── i18n/
│       ├── translations.ts     # 8 languages
│       └── LanguageContext.tsx
├── public/
├── package.json
└── README.md
```

---

## 🎓 Modes

### 👁️ Demo Mode — "Observe"
*For curious minds and first-time visitors*

- Simplified controls
- Beautiful visualizations
- Interactive theory explanations
- Quiz for understanding

### 📚 Laboratory Mode — "Explore"
*For students and educators*

- Guided tasks with XP rewards
- Data export (CSV, JSON)
- Theory comparison overlay
- Extended statistics

### 🔬 Research Mode — "Discover"
*For scientists and researchers*

- **Source Parameters**: λ, Δλ, coherence, polarization, source type
- **Geometry Parameters**: d, a, t (barrier thickness), L, angle, N-slit
- **Detector Parameters**: CCD/PMT/SPAD, pixel size, QE, dark counts
- **Environment Parameters**: medium (vacuum/air/N₂/O₂/He/Ar/CO₂/H₂O), T, P
- **Quick Presets**: HeNe laser, Nd:YAG, Na lamp, SPDC

### 🧪 Simulation Mode — *Coming Soon*
Monte Carlo simulations, batch runs, GPU acceleration

### 🤝 Collaboration Mode — *Coming Soon*
Real-time shared sessions, annotations, team workspaces

### 🔧 Sandbox Mode — *Coming Soon*
Custom experiment builder, plugin system, API access

---

## 📚 Scientific Sources

This simulation is based on peer-reviewed scientific publications:

| Source | Contribution |
|--------|--------------|
| **Pearson et al. 2018** (Optica) | Fresnel-Kirchhoff formula with sinc² envelope |
| **Hong & Noh 1998** (JOSA B) | Binary photon detection model |
| **Tonomura et al. 1989** (AJP) | Single-particle pattern buildup visualization |
| **Essen & Froome 1953** (Proc. Phys. Soc.) | Gas refractive indices |
| **Young 1802** | Original interference principle |

### Formula Implementation

```
I(θ) = I₀ · V · cos²(πd·sinθ/λ) · sinc²(πa·sinθ/λ) · G(θ) · A(θ)
```

Where:
- `I₀` — Initial intensity
- `V` — Visibility/coherence factor (0-1)
- `d` — Slit separation
- `a` — Slit width
- `t` — Barrier thickness
- `λ` — Wavelength (in medium: λ_eff = λ_vacuum / n)
- `G(θ)` — Gaussian beam profile
- `A(θ)` — Angular cutoff function (θ_max = arctan(a/t))

### Barrier Thickness Effect

Real barriers have non-zero thickness which acts as a collimator:

| Parameter | Effect |
|-----------|--------|
| Thin barrier (t << a) | All angles pass freely |
| Thick barrier (t >> a) | Only near-normal angles pass |
| θ_max = arctan(a/t) | Maximum transmission angle |

---

## 🌍 Languages

| Language | Status | Native Name |
|----------|--------|-------------|
| 🇺🇸 English | ✅ Verified | English |
| 🇷🇺 Russian | ✅ Verified | Русский |
| 🇪🇸 Spanish | ✅ Verified | Español |
| 🇧🇷 Portuguese | ✅ Verified | Português |
| 🇩🇪 German | ✅ Verified | Deutsch |
| 🇫🇷 French | ✅ Verified | Français |
| 🇨🇳 Chinese | ⚠️ Needs Review | 中文 |
| 🇸🇦 Arabic | ⚠️ Needs Review | العربية |

**Help us improve translations!** Chinese and Arabic translations need native speaker review for scientific terminology accuracy.

---

## 🤝 Contributing

We welcome contributions from scientists, educators, and developers!

### For Scientists
- Suggest physics model improvements
- Point out formula inaccuracies
- Share experimental data for calibration
- Become a scientific advisor

### For Educators
- Propose educational scenarios
- Help improve explanations
- Test with students
- Provide feedback

### For Developers
- Fix bugs and improve performance
- Add new simulations
- Improve accessibility
- Translate to new languages

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 How to Cite

If you use DIU Physics in your research or educational materials:

```bibtex
@software{diu_physics_2025,
  author = {{DIU Team}},
  title = {DIU Physics Interactive: 3D Quantum Physics Simulation},
  year = {2025},
  url = {https://github.com/desci-intelligent-universe/diu-physics},
  note = {DeSci Intelligent Universe}
}
```

---

## ⚠️ Disclaimer

This simulation is designed for **educational purposes**. While we strive for scientific accuracy based on peer-reviewed publications, for rigorous scientific research we recommend:

1. Consulting primary sources (linked in Credits)
2. Verifying parameters against your specific experimental setup
3. Using specialized scientific software for publishable results

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Optica Publishing Group** — Primary source for quantum optics research
- **American Physical Society** — Physics research standards
- **Three.js Community** — 3D visualization framework
- **React Three Fiber** — React renderer for Three.js
- **All scientists** whose work made this simulation possible

---

## 📬 Contact

- **Email**: science@diu-os.dev
- **GitHub**: [@desci-intelligent-universe](https://github.com/desci-intelligent-universe)
- **Website**: [diu-os.dev](https://diu-os.dev)

---

<div align="center">

**Made with ❤️ by DIU Team**

*Part of the DeSci Intelligent Universe project*

[🔬 Try the Demo](https://diu-os.dev/physics) | [📖 Read the Docs](https://docs.diu-os.dev) | [⭐ Star on GitHub](https://github.com/desci-intelligent-universe/diu-physics)

</div>
