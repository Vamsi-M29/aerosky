# AeroSky Weather Dashboard

A premium, glassmorphic weather tracking application that provides real-time atmospheric observations and forecasts with dynamic ambient visuals. Built with **React 19**, **TypeScript**, **Vite**, and animated using **Framer Motion**.

---

## ✨ Features

* **🔍 Live Location Tracking**: Instantly search for and track any city globally with keyboard-accessible, staggered dropdown suggestions.
* **⚡ Multi-API Integration with Auto-Fallback**:
  * Uses **OpenWeatherMap** as the primary high-accuracy data source for current weather, hourly/daily forecasts, UV index, and Air Quality index.
  * Implements a fail-safe fallback adapter using **Open-Meteo**. If the OpenWeatherMap key is invalid, unpaid, or pending activation, the app automatically and seamlessly falls back to Open-Meteo to prevent layout breakage.
* **🌌 Dynamic Particle Weather Backgrounds**: The interface adapts to the current weather condition using active canvas and SVG particle effects:
  * **Clear Day**: Warm solar flares and a pulsing sun.
  * **Clear Night**: Twinkling stars gently drifting across the screen.
  * **Cloudy**: Multiple billowy layers of drifting clouds.
  * **Fog**: Soft, ground-level mist flows.
  * **Rain**: Diagonal, high-velocity rain lines.
  * **Snow**: Whirling, spinning, and drifting snowflakes of random sizes.
  * **Thunderstorm**: Diagonal rain synchronized with dramatic, randomized lightning flashes.
* **📊 Visual Data Analytics**:
  * **Hourly Forecast**: Interactive horizontal slider featuring a custom SVG Bezier curve line graph illustrating temperature trends.
  * **Daily Forecast**: Apple Weather-style horizontal range progress bars representing the weekly low-to-high scale.
  * **Interactive Conditions Grid**: Details like relative humidity, cloud cover, pressure, UV index, Air Quality Index (AQI), and wind speed (the wind icon spins at a rate proportional to the actual wind speed).
* **🎨 Premium Glassmorphic Design**: Modern dark layout centered horizontally and vertically, styled strictly with CSS variables, backdrop blurs, and typography (paired monospace **Fira Code** for precise analytics and **Fira Sans** for readable body copy).

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 19 (TypeScript)
* **Build System:** Vite
* **Animations:** Framer Motion
* **Icons:** Lucide React
* **Styling:** Vanilla CSS (Glassmorphism & CSS Custom Properties)

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm or yarn

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/aerosky-weather.git
   cd aerosky-weather
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**
   Create a `.env` file in the root directory and add your OpenWeatherMap API key (if you don't have one, the app will automatically fall back to Open-Meteo):
   ```env
   VITE_OPENWEATHER_API_KEY=your_openweathermap_api_key_here
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173/`.

### Building for Production

To compile a highly optimized production bundle, run:
```bash
npm run build
```
The built files will be located in the `dist/` directory.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
