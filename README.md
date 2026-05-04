# Spotify Clone

A Spotify-inspired music player with a **Go backend** and a **React frontend**.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, HTML5 Audio API, Font Awesome |
| Backend | Go 1.21 (stdlib only) |
| Styling | Custom CSS — dark Spotify-inspired theme |

## Features

- Song metadata served from Go REST API
- Audio streaming with **HTTP Range request** support (enables seeking)
- Progress bar with click-to-seek
- Volume control
- Shuffle & Repeat toggles
- Playlist view with animated EQ bars
- Spinning album art while playing

## Getting Started

### 1. Start the Go backend

```bash
cd backend
go run main.go
# Listening on :8080
```

### 2. Start the React frontend

```bash
# In the project root
yarn start
# Opens http://localhost:3000
```

The React dev server proxies all `/api/*` requests to `http://localhost:8080`.

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/songs` | List all songs (JSON) |
| GET | `/api/audio/:id` | Stream MP3 (supports Range) |
| GET | `/api/images/:id` | Serve album art |
| GET | `/health` | Health check |

## Project Structure

```
├── backend/
│   ├── main.go       # Go HTTP server
│   └── go.mod
├── src/
│   ├── App.js        # Root component — state & audio management
│   ├── Player.js     # Playback controls (progress, volume, shuffle, repeat)
│   ├── Playlist.js   # Song list panel
│   ├── index.css     # Global styles
│   └── music/        # MP3 files (served by backend)
│   └── images/       # Album art (served by backend)
└── package.json
```
