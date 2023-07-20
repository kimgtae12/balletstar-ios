import TrackPlayer, {Capability} from 'react-native-track-player';

export default TrackPlayerInitializer = async () => {
  await TrackPlayer.setupPlayer().then(async () => {
    TrackPlayer.updateOptions({
      stopWithApp: true,
      // Media controls capabilities
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SeekTo,
        Capability.Stop,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      // Capabilities that will show up when the notification is in the compact form on Android
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SeekTo,
        Capability.Stop,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      state: TrackPlayer.STATE_PAUSED,
      // playIcon: play,
      // pauseIcon: pause,
      // forwardIcon: forward,
      // previousIcon: backward,
    });
  });
};
