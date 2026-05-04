package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type Song struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Artist   string `json:"artist"`
	AudioURL string `json:"audio_url"`
	ImageURL string `json:"image_url"`
}

var songs = []Song{
	{ID: 1, Title: "Eyes to the Sky", Artist: "Jon Bellion", AudioURL: "/api/audio/1", ImageURL: "/api/images/1"},
	{ID: 2, Title: "Lazarus", Artist: "Dave", AudioURL: "/api/audio/2", ImageURL: "/api/images/2"},
	{ID: 3, Title: "Yosemite", Artist: "Travis Scott", AudioURL: "/api/audio/3", ImageURL: "/api/images/3"},
	{ID: 4, Title: "Bird Set Free", Artist: "Sia", AudioURL: "/api/audio/4", ImageURL: "/api/images/4"},
	{ID: 5, Title: "Can't Be Broken", Artist: "Lil Wayne", AudioURL: "/api/audio/5", ImageURL: "/api/images/5"},
	{ID: 6, Title: "Mood", Artist: "24kGoldn ft. Iann Dior", AudioURL: "/api/audio/6", ImageURL: "/api/images/6"},
	{ID: 7, Title: "Nobody Fine Pass You", Artist: "T-Classic", AudioURL: "/api/audio/7", ImageURL: "/api/images/7"},
	{ID: 8, Title: "Dark Paradise", Artist: "Lana Del Rey", AudioURL: "/api/audio/8", ImageURL: "/api/images/8"},
}

// audioFiles maps song ID to filename (relative to musicDir)
var audioFiles = map[int]string{
	1: "01. Jon Bellion - Eyes To The Sky.mp3",
	2: "Lazarus.mp3",
	3: "Yosemite.mp3",
	4: "Sia - Bird Set Free.mp3",
	5: "Cant Be Broken .mp3",
	6: "24kGoldn-Mood-Official-Audio-ft.-Iann-Dior.mp3",
	7: "T-Classic-Nobody-Fine-Pass-You.mp3",
	8: "audio.mp3",
}

// imageFiles maps song ID to filename (relative to imagesDir)
var imageFiles = map[int]string{
	1: "Eyes to the sky.jpeg",
	2: "dave.jpeg",
	3: "travis.jpeg",
	4: "sia.jpeg",
	5: "lil wayne.jpeg",
	6: "mood.jpeg",
	7: "nobody.jpeg",
	8: "lana.jpeg",
}

const musicDir = "../src/music"
const imagesDir = "../src/images"

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Range")
		w.Header().Set("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges, Content-Length")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func handleSongs(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/api/songs" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(songs); err != nil {
		log.Printf("encode songs: %v", err)
	}
}

func serveFile(w http.ResponseWriter, r *http.Request, dir, filename string) {
	absDir, err := filepath.Abs(dir)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	absPath := filepath.Join(absDir, filename)
	// Path traversal guard
	if !strings.HasPrefix(absPath, absDir+string(os.PathSeparator)) {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}
	f, err := os.Open(absPath)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	defer f.Close()
	fi, err := f.Stat()
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	// http.ServeContent handles Range requests, enabling audio seeking
	http.ServeContent(w, r, fi.Name(), fi.ModTime(), f)
}

func handleAudio(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/audio/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid song id", http.StatusBadRequest)
		return
	}
	filename, ok := audioFiles[id]
	if !ok {
		http.Error(w, "song not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "audio/mpeg")
	serveFile(w, r, musicDir, filename)
}

func handleImage(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/images/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid song id", http.StatusBadRequest)
		return
	}
	filename, ok := imageFiles[id]
	if !ok {
		http.Error(w, "image not found", http.StatusNotFound)
		return
	}
	serveFile(w, r, imagesDir, filename)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"status":"ok","timestamp":"%s"}`, time.Now().Format(time.RFC3339))
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/songs", handleSongs)
	mux.HandleFunc("/api/audio/", handleAudio)
	mux.HandleFunc("/api/images/", handleImage)
	mux.HandleFunc("/health", handleHealth)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Spotify backend listening on :%s", port)
	if err := http.ListenAndServe(":"+port, cors(mux)); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
