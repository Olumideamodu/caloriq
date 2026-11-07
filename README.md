# CaloriQ 🔥

> A lightweight, modern, and privacy-first Calorie & Macro Tracker built with pure vanilla HTML, CSS, and JavaScript. Zero external frameworks, zero CSS variables, zero backend. All data persists locally in the browser via `localStorage`.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)

---

## ✨ Features

- **📊 Dynamic Energy Balance**: Real-time circular SVG donut visualizer showing consumed calories vs. daily target and remaining budget.
- **🍗 Macro Breakdown**: Live percentage and gram tracking for Protein ($P$), Carbohydrates ($C$), and Fats ($F$).
- **⚡ 1-Click Quick Add Presets**: Instant logging for 12 popular everyday food items.
- **📅 Interactive Calendar & History**: Day-by-day navigation (`<`, `Today`, `>`) and native date picker integration.
- **📈 7-Day Trend Chart**: Crisp High-DPI Canvas bar chart with daily target benchmarks. Click any day on the chart to jump directly to its log!
- **💧 Hydration Tracker**: Log daily water intake in 250ml increments toward a 2,500ml daily target.
- **🍽️ Categorized Meal Logging**: Track and organize items across Breakfast, Lunch, Dinner, and Snacks with full in-place edit and delete capabilities.
- **💾 Full Data Portability**: Export your complete log as a JSON backup or import previous backups anytime.
- **🔒 Privacy First**: 100% client-side. No trackers, no accounts, and no data leaves your browser.

---

## 🚀 Getting Started

No installation, build step, or dependencies required!

### Option 1: Direct File Open
Simply double-click `index.html` or open it in any modern web browser.

### Option 2: Local HTTP Server (Optional)
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .
```
Then visit `http://localhost:8000`.

---

## 📂 Project Structure

```text
├── index.html     # Semantic UI structure, modals, and dashboard components
├── style.css      # Pure custom styling (zero CSS variables, zero Tailwind)
├── app.js         # State machine, calculations, canvas chart, and localStorage engine
└── README.md      # Documentation
```

---

## 📄 License

This project is licensed under the MIT License - feel free to use and modify it!

