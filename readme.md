# Janikoke - Geo Challenge App

Janikoke is a mobile application built with Expo and React Native that challenges users to explore specific geographical areas in a city.

## Features

- **Live GPS Tracking**: Real-time tracking of user location on a map.
- **Geofencing**: Detection of when a user enters a specific challenge area (polygon).
- **Vibration Feedback**: Tactile notification when a challenge is successfully collected.
- **Challenge System**: Multiple challenges composed of different areas.
- **Personal Scoreboard**: Track your collections and points grouped by challenge.
- **Session Persistence**: Stay logged in across app restarts.
- **Dynamic Map**: Automatic zooming and fitting to show all challenge areas.

## Technical Details

- **Frontend**: React Native with Expo.
- **Maps**: `react-native-maps` with Google Maps integration.
- **Location**: `expo-location` for precise tracking.
- **Networking**: Axios for API communication.
- **Storage**: `AsyncStorage` for session management.
- **Geo-Logic**: Custom Haversine and Ray-casting algorithms for distance and polygon detection.

## Development

### Prerequisites

- Node.js
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npx expo start
   ```

### Building for Production

To build a standalone Android APK:

```bash
eas build --profile production --platform android
```

## API Integration

The app communicates with a backend to:

- Authenticate users.
- Fetch available rounds and challenges.
- Post successful area collections.
- Retrieve user results.

Janikoke - Technical Plan
Current State

React Native + Expo mobile app
Laravel backend
PostgreSQL database (hosted on Aruba)
Users manually inserted into DB
REST API with bearer token auth

What You're Building

1. Google Authentication (Go service)

User taps "Sign in with Google" in the app
Expo handles Google OAuth flow via expo-auth-session
App receives Google access_token, sends it to Go backend
Go verifies token with Google, finds or creates user in users table (using auth0_id column for Google's ID)
Go returns a JWT bearer token
App stores JWT in AsyncStorage, uses it for all future requests

2. Area Collection Endpoint (Go service)

Frontend already detects when user enters a polygon area (ray-casting)
When inside area, app calls Go endpoint with userId + areaId
Go checks how many times user has visited that area
Calculates points based on visit count (diminishing returns)
Records the visit and awards points in PostgreSQL
Returns points earned + total visits

Tech Stack
LayerTechnologyMobileReact Native + ExpoAuth & Game LogicGo (net/http, raw SQL)Existing backendLaravel (kept for other endpoints)DatabasePostgreSQL on ArubaAuth methodJWT bearer tokenGoogle Auth (mobile)expo-auth-session

What's NOT changing

Existing Laravel endpoints stay as-is
PostgreSQL schema — minimal changes (no new tables needed for auth)
Frontend geofencing logic stays on the client

Open Decisions

Point calculation formula (diminishing returns — exact tiers TBD)
Whether visits are counted per round/challenge or globally
Whether to consolidate Auth + Area logic in one Go service or separate services

Want me to finalize any of the open decisions before you start building?
