import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faForwardStep,
  faBackwardStep,
  faShuffle,
  faRepeat,
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons';

function formatTime(secs) {
  if (!secs || isNaN(secs) || !isFinite(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = String(Math.floor(secs % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

function VolumeIcon({ volume }) {
  if (volume === 0) return <FontAwesomeIcon icon={faVolumeXmark} />;
  if (volume < 0.5) return <FontAwesomeIcon icon={faVolumeLow} />;
  return <FontAwesomeIcon icon={faVolumeHigh} />;
}

export default function Player({
  isPlaying,
  currentTime,
  duration,
  volume,
  isShuffle,
  isRepeat,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onShuffleToggle,
  onRepeatToggle,
}) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  function handleProgressClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  }

  return (
    <div className="c-player--controls">
      {/* Progress bar */}
      <div className="progress-area">
        <span className="time-label">{formatTime(currentTime)}</span>
        <div className="progress-track" onClick={handleProgressClick} role="slider" aria-label="Seek">
          <div className="progress-fill" style={{ width: `${progress}%` }}>
            <div className="progress-thumb" />
          </div>
        </div>
        <span className="time-label">{formatTime(duration)}</span>
      </div>

      {/* Main controls */}
      <div className="controls-row">
        <button
          className={`icon-btn${isShuffle ? ' active' : ''}`}
          onClick={onShuffleToggle}
          title="Shuffle"
        >
          <FontAwesomeIcon icon={faShuffle} />
        </button>

        <button className="skip-btn" onClick={onPrev} title="Previous">
          <FontAwesomeIcon icon={faBackwardStep} />
        </button>

        <button
          className="play-btn"
          onClick={isPlaying ? onPause : onPlay}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>

        <button className="skip-btn" onClick={onNext} title="Next">
          <FontAwesomeIcon icon={faForwardStep} />
        </button>

        <button
          className={`icon-btn${isRepeat ? ' active' : ''}`}
          onClick={onRepeatToggle}
          title="Repeat"
        >
          <FontAwesomeIcon icon={faRepeat} />
        </button>
      </div>

      {/* Volume */}
      <div className="volume-row">
        <span className="volume-icon">
          <VolumeIcon volume={volume} />
        </span>
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="1"
          step="0.02"
          value={volume}
          onChange={e => onVolumeChange(parseFloat(e.target.value))}
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
