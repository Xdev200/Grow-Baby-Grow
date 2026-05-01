<div align="center">

<img src="./public/GBG_NoText-no_bg.png" width="160" height="160" alt="Grow Baby Grow Logo">

# 🌿 Grow Baby Grow - [Playstore](https://play.google.com/store/apps/details?id=com.growbabygrow.app)
### Precision Pediatric Tracking for the Modern Indian Parent

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Platform: Android](https://img.shields.io/badge/Platform-Android-3DDC84.svg?logo=android&logoColor=white)](android/app/build/outputs/apk/release/app-release.apk)
[![App Status: PWA](https://img.shields.io/badge/Web-PWA-indigo.svg?logo=progressive-web-apps&logoColor=white)](https://growbabygrow.in)
[![Standards: AIIMS/IAP](https://img.shields.io/badge/Standards-AIIMS%20%7C%20IAP-blue.svg)](https://www.aiims.edu)

---

**Every milestone is a masterpiece.** Grow Baby Grow is an offline-first, clinically-accurate developmental ecosystem that gives parents the tools of a pediatrician at their fingertips.



</div>

## 💡 The "Why"
In India, early developmental delays are often missed simply because monitoring is complex. We've simplified it. By encoding the **AIIMS New Delhi** and **IAP** guidelines into a high-performance, private-by-default application, we empower parents to track, understand, and act on their child's growth with professional confidence.

## ✨ Core Pillars

### 📈 Clinical Intelligence
- **AIIMS Verified**: Developmental assessments mapped across 6 key domains: **Gross Motor, Fine Motor, Social & Adaptive, Language, Vision, and Hearing**.
- **Corrected Age Logic**: Automatic clinical adjustments for premature infants until 24 months.

### 💉 Immunization Tracking
- **NIS Compliant**: Comprehensive tracker based on the **National Immunization Schedule (NIS)** for India.
- **IAP Recommendations**: Integration of latest Indian Academy of Pediatrics (IAP) vaccine guidelines, including optional boosters.

### 🌐 Privacy & Performance
- **Local-First Architecture**: Your child's data never leaves your device. Powered by Distributed IndexedDB.
- **Zero Internet Needed**: Fully functional offline PWA with instant native Android performance via Capacitor.

### 🏥 Safety & Reporting
- **Red Flag Engine**: Instant clinical alerts for critical developmental lags that require medical attention.
- **Consult-Ready PDFs**: Generate professional reports with one tap to share with your pediatrician.

## 🛠️ The Tech Ecosystem

| Layer | Technology | Why? |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TS | Type-safe, declarative UI at scale. |
| **Build System** | Vite 6 | Lightning fast HMR and optimized asset delivery. |
| **Native Bridge**| Capacitor 6 | Native Android performance with a zero-maintenance bridge. |
| **Storage** | IndexedDB | High-capacity on-device persistence (Privacy First). |
| **Logic** | AIIMS/IAP Rules | Adherence to the gold standard of Indian pediatrics. |

## 🚀 Experience It Locally

1. **Clone & Install**
   ```bash
   git clone https://github.com/your-repo/grow-baby-grow.git
   cd grow-baby-grow
   npm install
   ```
2. **Start Dev Server**
   ```bash
   npm run dev
   ```
3. **Build Native APK/AAB**
   ```bash
   npm run build:android
   ```

## 🗺️ Roadmap
- [x] **Phase 1-6**: Core PWA & Clinical Data Engine.
- [x] **Phase 7-8**: Advanced Growth Charting (WHO/IAP 2015).
- [x] **Phase 9**: Vaccination Tracker (NIS & IAP Recommendations).
- [x] **Phase 10**: Native Android (Play Store Production Build).
- [ ] **Phase 11**: AI-Powered Developmental Insights.

## 🩺 Medical Review & UX Design
Special thanks to **Dr. Shubham Kashyap** for the comprehensive medical review, clinical data encoding, and user experience design.
- **GitHub**: [DrOpenSource](https://github.com/DrOpenSource)
- **LinkedIn**: [imkashyaps](https://www.linkedin.com/in/imkashyaps/)


## ⚖️ Clinical Disclaimer
Grow Baby Grow is a digital screening companion. It does **not** provide medical diagnoses. Always consult with a certified pediatrician for definitive assessments.

---

<p align="center">
  Built with ❤️ for Indian Parents by the Grow Baby Grow Open Source Team.
</p>
