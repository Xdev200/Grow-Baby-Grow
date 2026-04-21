# Grow Baby Grow PWA

An offline-first, clinically-aware developmental milestone tracker designed specifically for Indian parents, adhering to **AIIMS New Delhi** and **IAP (Indian Academy of Pediatrics)** guidelines.

![App Icon](./public/GBG_NoText.png)

## 🌟 Features

- **Clinical Integrity**: Milestone assessments based on AIIMS New Delhi clinical data (0-5 years).
- **Offline-First (PWA)**: Works without internet. Data is persisted locally using IndexedDB for maximum privacy.
- **Prematurity Adjustments**: Clinical calculations for corrected age until 24 months.
- **Visual Growth Tracking**: WHO Weight-for-age charts with percentiles (P3, P50, P97).
- **Clinical Red Flags**: Professional alert system for critical developmental markers.
- **Professional Reporting**: On-device PDF generation for pediatric consultations.
- **Data Sovereignty**: Local backup export (JSON) and import.

## 🛠️ Tech Stack

- **Core**: React 18 + TypeScript + Vite 6
- **Storage**: IndexedDB (`idb`)
- **Reporting**: `jsPDF` + `jsPDF-AutoTable`
- **Visualization**: Custom SVG D3-inspired charting
- **Styling**: Vanilla CSS Modules (Emerald/Amber/Coral palette)

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Development
```bash
npm run dev
```

### 3. Production Build
```bash
npm run build
```

## 📋 Roadmap (WBS Status)

All 6 Phases completed:
1. **Foundation**: AIIMS Data & IndexedDB Storage.
2. **UI/UX**: Dashboard & Domain Progress Rings.
3. **Clinical Logic**: Age corrections & Assessment engine.
4. **Visualization**: SVG Timelines & WHO Growth Charts.
5. **Safety**: Red Flag alarms & PDF Clinical Reports.
6. **Polish**: PWA optimization & Performance.

## ⚖️ Clinical Disclaimer
Grow Baby Grow is a digital screening tool designed to assist parents in monitoring child development. It is **not** a substitute for regular pediatric visits or professional developmental assessments by a qualified healthcare provider.

---
Built with ❤️ for Indian Parents.
