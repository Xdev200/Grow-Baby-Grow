# Implementation Plan: Grow Baby Grow

> [!NOTE]
> This plan outlines the technical and architectural roadmap for building an offline-first PWA for tracking child milestones based on AIIMS New Delhi and IAP clinical standards.

## 1. Requirement Analysis
### Problem & Solution
Indian parents lack a trusted, local-standard digital tool for milestone tracking. **Grow Baby Grow** solves this by providing an offline-first PWA pre-loaded with **AIIMS New Delhi** clinical data, offering age-corrected assessments and red-flag alerts without requiring any backend infrastructure.

### Functional Scope
- **Child Profile**: Birth data with premature correction (gestational age adjustment).
- **Interactive Quiz**: Age-contextualised milestone check-ins.
- **Assessment Engine**: 4-tier status tracking (On track, Watch, Lagging, Partial).
- **Red Flag System**: Persistent alerts for clinical thresholds.
- **Growth Monitoring**: WHO standard weight/height/head-circumference charts (SVG-based).
- **PDF Export**: Paediatrician-ready reports generated on-device.

---

## 2. System Architecture
### Client-Centric Design
| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Core** | React 18 + Vite 5 | Fast, modular, and optimized for PWA. |
| **Storage** | IndexedDB (`idb-keyval`) | High-capacity, structured offline storage. |
| **Styling** | CSS Modules | Scoped, zero-runtime overhead. |
| **PWA** | `vite-plugin-pwa` | Robust service worker management via Workbox. |
| **PDF** | `jsPDF` | On-device report generation (no server). |

### Application Layers
1. **View Layer**: React Components + CSS Modules.
2. **Logic Layer**: Custom Hooks (`useChild`, `useMilestones`, `useQuiz`).
3. **Data Access**: IndexedDB CRUD helpers (zero ORM).
4. **Static Data**: JSON assets for AIIMS milestones and WHO growth curves.

---

## 3. UI/UX Strategy
- **Design Tokens**: Vibrant, non-clinical palette (Green `#1D9E75`, Amber `#BA7517`, Coral `#D85A30`).
- **Typography**: System sans-serif stack to minimize font loading overhead.
- **Signature Interaction**: A vertical **"Tendril" Timeline** that grows as milestones are achieved.
- **Accessibility**: WCAG 2.1 AA compliance (44px tap targets, semantic HTML).

---

## 4. Implementation Roadmap

### Phase 1: Foundation & Data Engine (Week 1)
- [ ] Initialize Vite project with `vite-plugin-pwa`.
- [ ] Encode **AIIMS Milestone Data** into static JSON.
- [ ] Implement `StorageService` for IndexedDB CRUD.
- [ ] Unit tests for Age & Corrected Age calculation logic.

### Phase 2: Onboarding & Dashboard (Week 2)
- [ ] Build Profile Creation flow (corrected age logic).
- [ ] Implement Dashboard with **Domain Progress Rings**.
- [ ] Setup global State Context for active child profile.

### Phase 3: Quiz & Logic (Week 3)
- [ ] Interactive Quiz UI with state persistence.
- [ ] **Assessment Logic**: Map answers to clinical statuses (On track, Watch, Lagging).
- [ ] Recommendation engine (Suggestion cards for lags).

### Phase 4: Data Visualization (Week 4)
- [ ] Vertical **Timeline Screen** with SVG spine.
- [ ] WHO Growth Charts (SVG) for Weight, Height, and Head Circumference.
- [ ] Manual logging FAB and milestone picker.

### Phase 5: Clinical Safety & Reports (Week 5)
- [ ] Red Flag alarm system with persistent banners.
- [ ] **On-device PDF Generation** using `jsPDF`.
- [ ] Data Export/Import for backup.

### Phase 6: Polish & Launch (Week 6)
- [ ] Lighthouse PWA audit (Target: 100/100).
- [ ] Performance optimization (Bundle < 500KB).
- [ ] Final clinical copy review.

---

## 5. Testing Strategy
- **Unit Testing**: Vitest for core utilities (Age, Percentiles, Red Flags).
- **Integration Testing**: React Testing Library for user flows (Onboarding to Quiz).
- **Manual QA**: Offline validation, manifest install verification on iOS/Android.

> [!IMPORTANT]
> All red-flag alerts and clinical suggestions must undergo final clinical sign-off before the production build.
