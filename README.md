# Spot.it & Music App

Spot.it is a modern, full-featured web application for discovering, searching, and managing music. It combines a beautiful, responsive UI with advanced features such as translation, theme switching, AI-powered recipe generation, and seamless backend integration.

## Features

### 1. Music Discovery & Playback
- Browse, search, and play songs from a rich catalog.
- Responsive UI for both desktop and mobile, with smooth transitions and modern controls.
- Song sliders, draggable/collapsible footers, and full-width YouTube video playback.
- Dynamic search with debounced suggestions and Redux-powered state management.
- Song titles auto-scroll with smooth fade for long names, supporting both LTR and RTL languages.

### 4. Theme Switching
- Toggle between light and dark modes for optimal viewing.
- Theme is remembered across sessions.

### 5. Backend Integration
- Connects to a Node.js/Express backend (BE) for:
  - Fetching and updating songs and recipes
  - AI-powered recipe and image generation
  - User playlist and search history management
- Real-time updates and robust error handling.

## Environment setup

For Google login on startup, add this variable in your local environment:

- REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_web_client_id

