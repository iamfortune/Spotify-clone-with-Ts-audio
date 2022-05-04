import React, { useMemo, useState } from 'react';
import Player from './Player';
import { AudioPlaylist } from 'ts-audio';

// Music import
import Eyes from './music/01. Jon Bellion - Eyes To The Sky.mp3';
import Mood from './music/24kGoldn-Mood-Official-Audio-ft.-Iann-Dior.mp3';
import Audio from './music/audio.mp3';
import Broken from './music/Cant Be Broken .mp3';
import Lazarus from './music/Lazarus.mp3';
import Sia from './music/Sia - Bird Set Free.mp3';
import Nobody from './music/T-Classic-Nobody-Fine-Pass-You.mp3';
import Yosemite from './music/Yosemite.mp3';

// Pictures import
import EyesImg from './images/Eyes to the sky.jpeg';
import MoodImg from './images/mood.jpeg';
import AudioImg from './images/lana.jpeg';
import BrokenImg from './images/lil wayne.jpeg';
import LazarusImg from './images/dave.jpeg';
import SiaImg from './images/sia.jpeg';
import NobodyImg from './images/nobody.jpeg';
import YosemiteImg from './images/travis.jpeg';

export default function App() {
	const [currentSong, setCurrentSong] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);

	const songs = useMemo(
		() => [
			{
				title: 'Eyes to the sky',
				artist: 'Jon Bellion',
				img_src: EyesImg,
				src: Eyes,
			},
			{
				title: 'Lazarus',
				artist: 'Dave',
				img_src: LazarusImg,
				src: Lazarus,
			},
			{
				title: 'Yosemite',
				artist: 'Travis scott',
				img_src: YosemiteImg,
				src: Yosemite,
			},
			{
				title: 'Bird set free',
				artist: 'Sia',
				img_src: SiaImg,
				src: Sia,
			},
			{
				title: 'Cant be broken',
				artist: 'Lil wayne',
				img_src: BrokenImg,
				src: Broken,
			},
			{
				title: 'Mood',
				artist: '24kGoldn',
				img_src: MoodImg,
				src: Mood,
			},
			{
				title: 'Nobody fine pass you',
				artist: 'T-Classic',
				img_src: NobodyImg,
				src: Nobody,
			},
			{
				title: 'Dark paradise',
				artist: 'Lana Del Ray',
				img_src: AudioImg,
				src: Audio,
			},
		],
		[]
	);

	const playlist = useMemo(() => {
		return AudioPlaylist({
			files: songs.map((song) => song.src),
		});
	}, [songs]);

	const handlePlay = () => {
		playlist.play();
		setIsPlaying(true);
	};

	const handlePause = () => {
		playlist.pause();
		setIsPlaying(false);
	};

	const handleSkip = () => {
		playlist.next();
		setIsPlaying(true);

		setCurrentSong(
			(currentSong) => (currentSong + 1 + songs.length) % songs.length
		);
	};

	const handlePrevious = () => {
		playlist.prev();
		setIsPlaying(false);
		setCurrentSong(
			(currentSong) => (currentSong - 1 + songs.length) % songs.length
		);
	};

	return (
		<>
			<div className="App">
				<div className="c-player">
					<div className="c-player--details">
						{' '}
						<div className="details-img">
							{' '}
							<img src={songs[currentSong].img_src} alt="img" />
						</div>
						<h1 className="details-title">{songs[currentSong].title}</h1>
						<h2 className="details-artist">{songs[currentSong].artist}</h2>
					</div>

					<Player
						play={handlePlay}
						pause={handlePause}
						isPlaying={isPlaying}
						setIsPlaying={setIsPlaying}
						next={handleSkip}
						prev={handlePrevious}
					/>
				</div>
			</div>
		</>
	);
}
