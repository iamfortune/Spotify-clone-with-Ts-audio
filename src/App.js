import React, { useState, useEffect, useRef, useCallback } from 'react';
import Player from './Player';
import Playlist from './Playlist';

export default function App() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [error, setError] = useState(null);

  const audioRef = useRef(null);
  // Refs for values used inside event handlers to avoid stale closures
  const isShuffleRef = useRef(isShuffle);
  const isRepeatRef = useRef(isRepeat);
  const songsLengthRef = useRef(0);
  const setCurrentSongRef = useRef(setCurrentSong);
  // Signals the song-load effect to autoplay even when audio was previously paused
  const autoPlayRef = useRef(false);

  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { isRepeatRef.current = isRepeat; }, [isRepeat]);
  useEffect(() => { songsLengthRef.current = songs.length; }, [songs.length]);

  // Fetch songs from Go backend
  useEffect(() => {
    fetch('/api/songs')
      .then(res => {
        if (!res.ok) throw new Error(`Backend error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setSongs(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  // Set up Audio element and attach persistent event listeners once
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.8;
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (isRepeatRef.current) {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      setCurrentSongRef.current(prev => {
        const len = songsLengthRef.current;
        if (len === 0) return prev;
        if (isShuffleRef.current) {
          const next = Math.floor(Math.random() * len);
          return next === prev ? (next + 1) % len : next;
        }
        return (prev + 1) % len;
      });
      setIsPlaying(true);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Load new song whenever currentSong or songs list changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || songs.length === 0) return;
    const shouldPlay = !audio.paused || autoPlayRef.current;
    autoPlayRef.current = false;
    audio.src = songs[currentSong].audio_url;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (shouldPlay) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentSong, songs]);

  // Sync repeat to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = isRepeat;
  }, [isRepeat]);

  const handlePlay = useCallback(() => {
    audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
  }, []);

  const handlePause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentSong(prev => {
      const len = songsLengthRef.current;
      if (isShuffle) {
        const next = Math.floor(Math.random() * len);
        return next === prev ? (next + 1) % len : next;
      }
      return (prev + 1) % len;
    });
    setIsPlaying(true);
  }, [isShuffle]);

  const handlePrev = useCallback(() => {
    const audio = audioRef.current;
    // Restart current song if more than 3 seconds in
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setCurrentSong(prev => (prev - 1 + songsLengthRef.current) % songsLengthRef.current);
  }, []);

  const handleSeek = useCallback(time => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleVolumeChange = useCallback(vol => {
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  const handleSongSelect = useCallback(index => {
    autoPlayRef.current = true;
    setCurrentSong(index);
    setIsPlaying(true);
  }, []);

  if (isLoading) {
    return (
      <div className="App">
        <div className="state-card">
          <div className="spinner" />
          <p>Loading songs…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="state-card error">
          <p>{error}</p>
          <p className="hint">Make sure the Go backend is running on port 8080</p>
        </div>
      </div>
    );
  }

  const song = songs[currentSong];

  return (
    <div className="App">
      <div className="c-player">
        <div className="c-player--header">
          <span className="now-playing-label">Now Playing</span>
          <button
            className={`playlist-toggle-btn ${showPlaylist ? 'active' : ''}`}
            onClick={() => setShowPlaylist(s => !s)}
            title="Toggle playlist"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
        </div>

        {showPlaylist ? (
          <Playlist
            songs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onSelect={handleSongSelect}
          />
        ) : (
          <div className="c-player--details">
            <div className="details-img-wrap">
              <img
                src={song.image_url}
                alt={song.title}
                className={`details-img${isPlaying ? ' spinning' : ''}`}
              />
              <div className="details-img-ring" />
            </div>
            <h1 className="details-title">{song.title}</h1>
            <h2 className="details-artist">{song.artist}</h2>
          </div>
        )}

        <Player
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isShuffle={isShuffle}
          isRepeat={isRepeat}
          onPlay={handlePlay}
          onPause={handlePause}
          onNext={handleNext}
          onPrev={handlePrev}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onShuffleToggle={() => setIsShuffle(s => !s)}
          onRepeatToggle={() => setIsRepeat(r => !r)}
        />
      </div>
    </div>
  );
}
