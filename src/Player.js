import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faPlay,
	faPause,
	faForward,
	faBackward,
} from '@fortawesome/free-solid-svg-icons';

export default function Player({
	play,
	pause,
	next,
	prev,
	isPlaying,
	setIsPlaying,
}) {
	return (
		<div className="c-player--controls">
			<button className="skip-btn" onClick={prev}>
				<FontAwesomeIcon icon={faBackward} />
			</button>
			<button
				className="play-btn"
				onClick={() => setIsPlaying(!isPlaying ? play : pause)}
			>
				<FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
			</button>
			<button className="skip-btn" onClick={next}>
				<FontAwesomeIcon icon={faForward} />
			</button>

			{/* <button onClick={play}>Play</button>
			<button onClick={pause}>Pause</button>
			<button onClick={next}>Next</button>
			<button onClick={prev}>Previous</button> */}
		</div>
	);
}
