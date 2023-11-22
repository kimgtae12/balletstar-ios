import {useMusicStore} from '@/store';
import axios from 'axios';
import queryString from 'query-string';
import React from 'react';
import {Image, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import TrackPlayer, {
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
} from 'react-native-track-player';
import {PlayerItemType} from './playerType';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Slider from '@react-native-community/slider';
interface MusicPlayerType {
  route: any;
}

interface NowMusicInfoType {
  title: string;
  duration: number;
}

export const MusicPlayer = ({route}: MusicPlayerType) => {
  const {db_idx} = route.params;
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const playbackState = usePlaybackState();
  const progress = useProgress();

  const {item} = useMusicStore(state => state);
  const [nowPlayIdx, setNowPlayIdx] = React.useState<number>(0); //현재 재생중인 플레이어 번호

  const [nowMusicInfo, setMusicInfo] = React.useState<NowMusicInfoType>({
    title: '',
    duration: 0,
  });
  const [isRepeat, setIsRepeat] = React.useState(false);

  async function checkRepeatMode() {
    //반복모드 확인
    try {
      const repeatMode = await TrackPlayer.getRepeatMode();
      if (repeatMode === 1) {
        setIsRepeat(true);
      } else if (repeatMode === 0) {
        setIsRepeat(false);
      }
    } catch (error) {
      console.error('Error while getting repeat mode:', error);
    }
  }

  async function repeatModeHandler() {
    if (isRepeat) {
      TrackPlayer.setRepeatMode(RepeatMode.Off);
      setIsRepeat(false);
    } else {
      TrackPlayer.setRepeatMode(RepeatMode.Track);
      setIsRepeat(true);
    }
  }

  React.useEffect(() => {
    TrackPlayer.addEventListener(
      'playback-track-changed',
      async (event: any) => {
        TrackPlayer.getQueue().then((res: PlayerItemType[]) => {
          if (res) {
            const nowPlayInfo = res[event.nextTrack];
            setMusicInfo({
              title: nowPlayInfo.title,
              duration: nowPlayInfo.duration,
            });
          }
        });
      },
    );
  }, []);

  React.useEffect(() => {
    if (isFocused) {
      TrackPlayer.getQueue().then((res: PlayerItemType[]) => {
        if (res) {
          const nowPlayInfo = res.filter(
            (el: PlayerItemType) => el.dbIdx === db_idx,
          )[0];
          const nowPlayIdx = res.findIndex(
            (el: PlayerItemType) => el.dbIdx === db_idx,
          );

          TrackPlayer.skip(nowPlayIdx);
          TrackPlayer.play();

          setMusicInfo({
            title: nowPlayInfo.title,
            duration: nowPlayInfo.duration,
          });
        }
      });
    }
  }, [isFocused]);

  React.useEffect(() => {
    checkRepeatMode();
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          height: 40,
          borderBottomColor: '#e2e2e2',
          borderBottomWidth: 1,
          paddingHorizontal: 20,
          justifyContent: 'center',
        }}
      >
        <TouchableOpacity
          style={{
            width: 30,
            height: 30,
            justifyContent: 'center',
            // alignItems: 'center',
          }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            style={{width: 20, height: 20}}
            source={require('@/assets/img/back_icon.png')}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 40,
        }}
      >
        <Text style={{fontSize: 18, fontWeight: '700'}}>
          {nowMusicInfo.title}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            borderRadius: 8,
            marginVertical: 20,
          }}
        >
          <Image
            source={require('../../assets/img/music_icon.png')}
            style={{width: 250, height: 250, borderRadius: 8}}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 40,
          }}
        >
          <View style={{marginRight: 10}}>
            <Text>
              {Math.floor(progress?.position / 60) < 10
                ? '0' + Math.floor(progress?.position / 60)
                : Math.floor(progress?.position / 60)}{' '}
              :{' '}
              {Math.floor(progress?.position % 60) < 10
                ? '0' + Math.floor(progress?.position % 60)
                : Math.floor(progress?.position % 60)}
            </Text>
          </View>
          <Slider
            value={progress?.position}
            onSlidingComplete={async value => {
              await TrackPlayer.seekTo(value);
            }}
            style={{width: '96%', height: 20, alignSelf: 'center'}}
            // hitSlop={20}
            minimumValue={0}
            maximumValue={nowMusicInfo.duration}
            thumbTintColor={'#000'}
            minimumTrackTintColor={'#000'}
            maximumTrackTintColor={'#e2e2e2'}
          />
          <View style={{marginLeft: 10}}>
            <Text>
              {Math.floor(nowMusicInfo.duration / 60) < 10
                ? '0' + Math.floor(nowMusicInfo.duration / 60)
                : Math.floor(nowMusicInfo.duration / 60)}{' '}
              :{' '}
              {nowMusicInfo.duration % 60 < 10
                ? '0' + (nowMusicInfo.duration % 60)
                : nowMusicInfo.duration % 60}
            </Text>
          </View>
        </View>

        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* <View style={{width: 70, height: 70,backgroundColor:''}} /> */}
          <TouchableOpacity
            style={{
              marginTop: 20,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Image
              style={{width: 50, height: 50}}
              source={require('@/assets/img/ico_playlist.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginTop: 20,
              flex: 1.5,
              // width: 70,
              // height: 70,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              try {
                TrackPlayer.skipToPrevious();
              } catch (err) {
                console.log(err);
              }
            }}
          >
            <Image
              style={{width: 50, height: 50}}
              source={require('@/assets/img/ico_prev.png')}
            />
          </TouchableOpacity>
          {playbackState === State.Playing ? (
            <TouchableOpacity
              style={{
                marginTop: 20,
                // width: 70,
                // height: 70,
                flex: 2,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                TrackPlayer.pause();
              }}
            >
              <Image
                style={{width: 50, height: 50}}
                source={require('@/assets/img/ico_pause.png')}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                marginTop: 20,
                flex: 2,
                // width: 70,
                // height: 70,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                TrackPlayer.play();
              }}
            >
              <Image
                style={{width: 50, height: 50}}
                source={require('@/assets/img/ico_play.png')}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{
              marginTop: 20,
              width: 70,
              height: 70,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              try {
                TrackPlayer.skipToNext();
              } catch (err) {
                console.log(err);
              }
            }}
          >
            <Image
              style={{width: 50, height: 50}}
              source={require('@/assets/img/ico_next.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginTop: 20,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              repeatModeHandler();
            }}
          >
            <Image
              style={{width: 50, height: 50}}
              source={
                isRepeat
                  ? require('@/assets/img/ico_repeat_on.png')
                  : require('@/assets/img/ico_repeat_off.png')
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
