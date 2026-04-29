# Work Breakdown Structure (WBS) - Grow Baby Grow

## Phase 1: Foundation & Data Engine (Week 1)
- [x] Initialize Vite project with `vite-plugin-pwa` @done(2026-04-18)
- [x] Encode **AIIMS Milestone Data** into static JSON @done(2026-04-18)
- [x] Implement `StorageService` for IndexedDB CRUD @done(2026-04-18)
- [x] Unit tests for Age & Corrected Age calculation logic @done(2026-04-18)
- [x] Configure PWA manifest and service worker @done(2026-04-18)

## Phase 2: Onboarding & Dashboard (Week 2)
- [x] Build Profile Creation flow (corrected age logic)
- [x] Implement Dashboard with **Domain Progress Rings**
- [x] Setup global State Context for active child profile

## Phase 3: Quiz & Logic (Week 3)
- [x] Interactive Quiz UI with state persistence
- [x] **Assessment Logic**: Map answers to clinical statuses (On track, Watch, Lagging)
- [x] Recommendation engine (Suggestion cards for lags)

## Phase 4: Data Visualization (Week 4)
- [x] Vertical **Timeline Screen** with SVG spine
- [x] WHO Growth Charts (SVG) for Weight, Height, and Head Circumference
- [x] Manual logging FAB and milestone picker

## Phase 5: Clinical Safety & Reports (Week 5)
- [x] Task 5.1: Clinical Red Flag Detection Engine (AIIMS Standard)
- [x] Task 5.2: Red Flag Banner UI Component & Emergency Action
- [x] Task 5.3: Persistent Alert Bar on Dashboard for Clinical Lags
- [x] Task 5.4: On-Device Clinical Report PDF Generation (jsPDF)
- [x] Data Export/Import for backup

## Phase 6: Polish & Launch (Week 6)
- [x] Task 6.1: Lighthouse PWA audit (Target: 100/100)
- [x] Task 6.2: Performance optimization (Bundle < 500KB)
- [x] Task 6.3: Final clinical copy review
## Phase 7: Refinement & Clinical Accuracy (Current)
- [x] Atomize combined milestones into unique clinical tasks @done(2026-04-18)
- [x] Implement domain-based grouping for Quiz and Timeline @done(2026-04-18)
- [x] Harden age calculation logic for infants and corrected age @done(2026-04-18)
- [x] Fix quiz data persistence and redirect loop @done(2026-04-18)
- [x] Add clinical timing context badges to quiz questions @done(2026-04-18)
- [x] Enrich milestone data with layman descriptions and home-testing instructions @done(2026-04-18)
- [x] Update onboarding to include birth weight and height tracking @done(2026-04-18)
- [x] Refine Quiz/Timeline UI with parental info tooltips @done(2026-04-18)
- [x] Implement dynamic growth chart infrastructure (WHO Height data & Reference charts) @done(2026-04-18)
## Phase 8: Optimization & Bug Fixes (Week 8)
- [x] Task 8.1: Complete rebranding to Grow Baby Grow @done(2026-04-21)
- [x] Fix quiz repetition bug and progress tracking @done(2026-04-19)
- [x] Implement Fast Onboarding (latest age bracket only) @done(2026-04-19)
- [x] Auto-achievement logic for historical milestones @done(2026-04-19)
- [x] Mandatory weight/height for older infants (onboarding) @done(2026-04-19)
- [x] Clinical report logic fix for older-child onboards @done(2026-04-19)
- [x] Dashboard drill-down (DomainDetailModal) @done(2026-04-19)
- [x] Interactive growth measurement logging and editing @done(2026-04-19)
- [x] Mobile UI/UX audit and click-handler fixes @done(2026-04-19)
- [x] Fix quiz sequence (Hearing/Vision priority) @done(2026-04-19)
- [x] Mobile-first UI compliance audit and ergonomics optimization @done(2026-04-19)
- [x] Sync Timeline achievement with real quiz logs @done(2026-04-19)
- [x] Fix misleading Red Flags for future/current milestones @done(2026-04-19)
- [x] Ensure cross-domain quiz coverage (latest clinical fallback) @done(2026-04-19)
- [x] Implement Material Design tokens and responsive layouts @done(2026-04-19)
- [x] Integrate dynamic IAP 2015/WHO combined growth charts @done(2026-04-19)
- [x] Plot child height/weight using interactive charting engine @done(2026-04-19)
- [x] Implement clinical deviation highlighting and status badges @done(2026-04-19)
- [x] PWA implementation: manifest, service worker, offline caching, mobile meta tags @done(2026-04-20)
- [x] Mobile optimization: safe areas, viewport-fit, touch targets, form clipping fix @done(2026-04-20)

## Phase 9: Health & Medical (Week 9)
- [x] Task 9.1: Vaccination Tracker based on National Immunization Schedule @done(2026-04-25)
- [x] Task 9.2: Added Varicella (Chicken Pox) optional vaccines (15th and 18th month) @done(2026-04-25)
- [x] Task 9.3: Vaccine Information cards with dose, route, and site info @done(2026-04-25)
- [x] Task 9.4: Vaccination completion tracking & persistence in IndexedDB @done(2026-04-25)
- [x] Task 9.5: Vaccine reminder/scheduling system via Parent-confirmed date picker @done(2026-04-25)
- [x] Task 9.6: Refined Missed Vaccine UI (Red status, high contrast buttons) @done(2026-04-25)
- [x] Task 9.7: Standardized Milestone and Vaccine text to sentence case @done(2026-04-25)
- [x] Task 9.8: Improved generic reminder toggle contrast @done(2026-04-25)
- [x] Task 9.9: Local notification scheduling with custom offset and time @done(2026-04-25)

## Phase 10: Native App & Play Store (Week 10)
- [x] Task 10.1: Capacitor integration for Native Android @done(2026-04-21)
- [x] Task 10.2: Production build and signed APK generation @done(2026-04-21)
- [x] Task 10.3: Play Store Bundle (AAB) generation @done(2026-04-21)
- [x] Task 10.6: High-impact (Viral) README generation @done(2026-04-21)
- [x] Task 10.7: Marketing Website (Landing, Privacy, Terms) @done(2026-04-21)
- [ ] Task 10.4: App Store (iOS) integration
- [ ] Task 10.5: Store metadata and screenshots preparation
- [x] Task 10.9: Update README with clinical domains, NIS references, and medical credits @done(2026-04-27)
- [x] Task 10.8: Aligned App Icon with Launcher Icon & Bumped version to 1.0.2 (vCode 3) @done(2026-04-24)
- [x] Task 10.10: Update Landing Page with Vaccination and Multilingual features @done(2026-04-28)
- [x] Task 10.11: Add subtle 'Medically reviewed by experienced pediatricians' badge on landing screen @done(2026-04-28)
- [x] Task 10.12: Refactor Landing Screen into a dynamic 3-4 slide Splash Screen Carousel @done(2026-04-28)
- [x] Task 10.13: Generate Production build (v1.0.3) and Release Notes @done(2026-04-28)
- [x] Task 10.14: Update Landing Page with Google Play Store CTA button @done(2026-04-29)

## Phase 11: Localization (Week 11)
- [x] Task 11.1: Integrate `react-i18next` for multilingual support @done(2026-04-27)
- [x] Task 11.2: Implement English, Hindi, and Bengali translations @done(2026-04-27)
- [x] Task 11.3: Add Language Switcher to Profile Screen @done(2026-04-27)
- [x] Task 11.4: Refactor all screens (Growth, Timeline, Vaccination) for full i18n @done(2026-04-27)
- [x] Task 11.5: Implement clinical data (vaccines and milestones) localization for Hindi @done(2026-04-28)
