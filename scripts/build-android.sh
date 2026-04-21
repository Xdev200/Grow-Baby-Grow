#!/bin/bash

# Grow Baby Grow - Android Build Automation Script
# This script builds the web assets, syncs with Capacitor, and generates a signed APK/AAB.

set -e # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==> 1. Building Web Assets...${NC}"
npm run build

echo -e "${BLUE}==> 2. Syncing with Capacitor...${NC}"
npx cap sync android

echo -e "${BLUE}==> 3. Generating Signed APK...${NC}"
cd android
./gradlew assembleRelease

echo -e "${BLUE}==> 4. Generating App Bundle (AAB)...${NC}"
./gradlew bundleRelease

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Build Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "APK: android/app/build/outputs/apk/release/app-release.apk"
echo -e "AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo -e "${GREEN}========================================${NC}"
