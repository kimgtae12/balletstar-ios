import TrackPlayer, {Event} from 'react-native-track-player';

async function handleRemoteSeek(event) {
  const position = event.position;

  // SeekBar 위치를 업데이트합니다.
  // 이 위치는 useTrackPlayerProgress hook에서 가져온 position 값과 같아야 합니다.

  // TrackPlayer를 사용하여 SeekBar 위치를 설정합니다.
  // await TrackPlayer.pause();
  await TrackPlayer.seekTo(position, true);
  setTimeout(async () => {
    await TrackPlayer.play();
  }, 700);
}

module.exports = async () => {
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.destroy());
  TrackPlayer.addEventListener(Event.RemoteNext, () =>
    TrackPlayer.skipToNext(),
  );
  TrackPlayer.addEventListener(Event.RemotePrevious, () =>
    TrackPlayer.skipToPrevious(),
  );
  TrackPlayer.addEventListener('remote-seek', handleRemoteSeek);
};
