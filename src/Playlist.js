export default function Playlist({ songs, currentSong, isPlaying, onSelect }) {
  return (
    <div className="playlist">
      {songs.map((song, index) => {
        const isActive = index === currentSong;
        return (
          <div
            key={song.id}
            className={`playlist-item${isActive ? ' active' : ''}`}
            onClick={() => onSelect(index)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onSelect(index)}
          >
            <div className="playlist-img-wrap">
              <img src={song.image_url} alt={song.title} className="playlist-img" />
              {isActive && (
                <div className="playlist-playing-overlay">
                  <span className={`eq-bars${isPlaying ? ' playing' : ''}`}>
                    <span /><span /><span />
                  </span>
                </div>
              )}
            </div>
            <div className="playlist-info">
              <span className="playlist-title">{song.title}</span>
              <span className="playlist-artist">{song.artist}</span>
            </div>
            <span className="playlist-num">{String(index + 1).padStart(2, '0')}</span>
          </div>
        );
      })}
    </div>
  );
}
