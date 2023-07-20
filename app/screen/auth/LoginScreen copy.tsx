import {AuthStackProps} from '@/navigation/auth';
import {useBearStore, useCountPersistStore} from '@/store';
import React from 'react';
import {useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Linking,
  Platform,
  SafeAreaView,
  View,
} from 'react-native';

import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import queryString from 'query-string';
import {API} from './API';
import MusicControl, {Command} from 'react-native-music-control';
import WebView from 'react-native-webview';
type LoginType = 'kakao' | 'naver' | 'google' | 'apple';

interface LoginForm {
  id: string;
  password: string;
}

const LoginScreen = ({navigation, route}: AuthStackProps) => {
  let {height, width} = Dimensions.get('window');

  //웹작업 토큰이 회원테이블에 있으면 자동로그인 없으면 로그인 페이지로 작업
  //const domain_url = 'dmonster1886.cafe24.com'
  //const domain_url = 'todaydoc.kr'
  //const app_domain = 'https://'+domain_url+'/'
  //const url = app_domain
  const domain_url = 'www.jtballetstar.com';
  const app_domain = 'https://' + domain_url + '/';
  const url = app_domain + 'auth.php?chk_app=Y&app_token=';
  const exit_domain = 'https://' + domain_url + '/login.php?chk_app=Y';
  const exit_domain2 = 'https://' + domain_url + '/?chk_app=Y';
  const exit_domain3 = 'https://' + domain_url + '/index.php?chk_app=Y';
  const [webview_url, set_webview_url] = React.useState(url);
  const [urls, set_urls] = React.useState('ss');
  const [webview_load, set_webview_load] = React.useState(false);
  const webViews = React.useRef(null);
  const [is_loading, set_is_loading] = React.useState(false);

  const [musicState, setMusicState] = React.useState('');

  React.useEffect(() => {
    setTimeout(() => {}, 1000);

    //푸시 갯수 초기화
    PushNotification.setApplicationIconBadgeNumber(0);

    //기기토큰 가져오기
    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission();
      //console.log('authStatus:', authStatus);
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      //await get_token()

      if (enabled) {
        console.log('Authorization status:', authStatus);
        await get_token();
      } else {
        // await getInstanceId()
      }
    }

    async function get_token() {
      await messaging()
        .getToken()
        .then(token => {
          console.log('token', token);

          if (token) {
            const type = route.params?.type;
            const response = route.params?.response;

            if (response) {
              const query = queryString.stringify(response);
              if (type === 'payment') {
                const impURL = url + token + '&' + query;
                //console.log('impURL ', impURL)
                set_webview_url(impURL);
              }
            } else {
              set_webview_url(url + token);
            }

            return true;
          } else {
            return false;
          }
        });
    }

    requestUserPermission();

    set_is_loading(true);

    // const onWebViewMessage = messaging().onMessage(async remoteMessage => {
    //   let jsonData = JSON.stringify(remoteMessage)
    //   console.log('jsonData : ', jsonData);
    //   //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    //   Alert.alert(
    //     remoteMessage.notification.body,
    //     [
    //       {
    //         text: '확인',
    //       },
    //     ],
    //   );

    // })
  }, []);

  const onNavigationStateChange = (webViewState: any) => {
    //console.log('onNavigationStateChange : ' + webViewState.url);

    var chk_uri = 'Y';

    if (webViewState.url.includes(domain_url)) {
      chk_uri = 'N';
    }
    if (webViewState.url.includes('wauth.teledit.com')) {
      chk_uri = 'N';
    }
    if (chk_uri == 'Y') {
      Linking.openURL(webViewState.url).catch(err => {
        //console.log('onNavigationStateChange Linking.openURL')
      });
      webViews.current.stopLoading();
    }

    //항상 앱 접속 확인
    if (webViewState.url.includes('?')) {
      webViewState.url = webViewState.url + '&chk_app=Y';
    } else {
      webViewState.url = webViewState.url + '?chk_app=Y';
    }

    //console.log(webViewState.url)
    set_urls(webViewState.url);

    //안드로이드 뒤로가기 버튼 처리
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
  };

  const handleBackButton = () => {
    console.log('handleBackButton');

    if (navigation.isFocused() === true) {
      if (
        urls == app_domain + 'media_player2.php?chk_app=Y' ||
        urls == app_domain + 'media_player3.php?chk_app=Y' ||
        urls == app_domain + 'media_player5.php?chk_app=Y' ||
        urls == app_domain + 'join2.php'
      ) {
        return true;
      }
      // 제일 첫페이지, 특정 페이지에서 뒤로가기시 어플 종료
      if (
        urls == app_domain ||
        urls == exit_domain ||
        urls == exit_domain2 ||
        urls == exit_domain3
      ) {
        Alert.alert('어플을 종료할까요?', '', [
          {
            text: '네',
            onPress: () => {
              BackHandler.exitApp();
              return true;
            },
          },
          {
            text: '아니요',
            onPress: () => null,
          },
        ]);
      } else {
        // if (webViews.current) {
        //   webViews.current.injectJavaScript('javascript:history.back();');
        // }
        BackKeyApi(urls);
      }
      return true;
    } else {
      return false;
    }
  };

  const BackKeyApi = async (uri: any) => {
    try {
      const res = await API.post(app_domain + 'api/uri_return.php', {uri});
      // console.log(res)

      if (res.data.result) {
        let MoveUri = res.data.data.move_uri;
        // console.log("||||||||")
        // console.log(typeof MoveUri)
        // console.log(res.data.data.or_uri)
        // console.log(MoveUri)
        if (!MoveUri || MoveUri === 'null') {
          webViews.current.goBack();
        } else {
          MovePage(MoveUri);
        }
      }
    } catch (error) {
      webViews.current.goBack();
    }
  };

  const MovePage = async MoveUri => {
    let moveUri = 'window.location = "' + MoveUri + '"';
    webViews.current.injectJavaScript(moveUri);
  };

  const onShouldStartLoadWithRequest = event => {
    const {url, lockIdentifier} = event;
    var URI = require('urijs');
    var uri = new URI(url);

    //console.log('onShouldStartLoadWithRequest : ', uri);

    if (
      /* && react-native-webview 버전이 v10.8.3 이상 */
      event.lockIdentifier === 0
    ) {
      /**
       * [feature/react-native-webview] 웹뷰 첫 렌더링시 lockIdentifier === 0
       * 이때 무조건 onShouldStartLoadWithRequest를 true 처리하기 때문에
       * Error Loading Page 에러가 발생하므로
       * 강제로 lockIdentifier를 1로 변환시키도록 아래 네이티브 코드 호출
       */
      // RNCWebView.onShouldStartLoadWithRequestCallback(
      //   false,
      //   event.lockIdentifier
      // )
    }

    if (
      event.url.startsWith('http://') ||
      event.url.startsWith('https://') ||
      event.url.startsWith('about:blank')
    ) {
      if (uri.hostname() != '') {
        var chk_uri = 'Y';

        if (uri.hostname() != domain_url) {
          chk_uri = 'N';
        }
        if (uri.hostname() != 'postcode.map.daum.net') {
          chk_uri = 'N';
        }
        if (uri.hostname() != 'kauth.kakao.com') {
          chk_uri = 'N';
        }
        if (uri.hostname() != 'appleid.apple.com') {
          chk_uri = 'N';
        }
        if (uri.hostname() != 'nid.naver.com') {
          chk_uri = 'N';
        }
        if (uri.hostname() != 'm.facebook.com') {
          chk_uri = 'N';
        }
        if (uri.hostname() != 'mobile.inicis.com') {
          chk_uri = 'N';
        }
        if (uri.hostname() != 'service.iamport.kr') {
          chk_uri = 'N';
        }
        if (uri.hostname() != 'ksmobile.inicis.com') {
          chk_uri = 'N';
        }
        if (uri.query().includes('tt=nb')) {
          chk_uri = 'Y';
        }
        if (chk_uri == 'Y') {
          Linking.openURL(event.url).catch(err => {
            console.log('onShouldStartLoadWithRequest Linking.openURL');
          });
          return false;
        }
      }

      return true;
    }
    if (
      event.url.startsWith('tel:') ||
      event.url.startsWith('mailto:') ||
      event.url.startsWith('maps:') ||
      event.url.startsWith('geo:') ||
      event.url.startsWith('sms:')
    ) {
      Linking.openURL(event.url).catch(er => {
        console.log('Failed to open Link: ' + er.message);
      });
      return false;
    }

    if (Platform.OS === 'android') {
      const SendIntentAndroid = require('react-native-send-intent');
      SendIntentAndroid.openChromeIntent(event.url)
        .then((isOpened: any) => {
          if (!isOpened) {
            Alert.alert('앱 실행이 실패했습니다');
          }
        })
        .catch(err => {
          console.log(err);
        });

      return false;
    } else {
      Linking.openURL(event.url).catch(err => {
        // alert('앱 실행이 실패했습니다. 설치가 되어있지 않은 경우 설치하기 버튼을 눌러주세요.');
      });
      return false;
    }
  };

  const setMusicControlHandler = () => {
    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('stop', false);
    MusicControl.enableControl('nextTrack', true);
    MusicControl.enableControl('previousTrack', true);
    MusicControl.enableControl('closeNotification', true, {when: 'always'});
    MusicControl.enableControl('changePlaybackPosition', true);
    if (Platform.OS === 'android') {
      MusicControl.enableControl('seek', true); // Android only
    } else {
      MusicControl.enableControl('seekForward', true); // iOS only
      MusicControl.enableControl('seekBackward', true); // iOS only
    }
  };

  const musicPlayHandler = () => {
    MusicControl.on(Command.play, () => {
      webViews.current.postMessage(
        JSON.stringify({
          action: musicState === 'pause' ? 'replay' : 'now_play',
        }),
      );
    });
  };

  const musicPauseHandler = () => {
    MusicControl.on(Command.pause, () => {
      webViews.current.postMessage(
        JSON.stringify({
          action: 'pause',
        }),
      );
    });
  };

  const musicNextHandler = () => {
    MusicControl.on(Command.nextTrack, () => {
      webViews.current.postMessage(
        JSON.stringify({
          action: 'next',
        }),
      );
    });
  };

  const musicPrevHandler = () => {
    MusicControl.on(Command.previousTrack, () => {
      webViews.current.postMessage(
        JSON.stringify({
          action: 'prev',
        }),
      );
    });
  };

  const musicSeekHandler = () => {
    MusicControl.on(Command.seek, position => {
      console.log(position);
      webViews.current.postMessage(
        JSON.stringify({
          action: 'move_bar',
          seek: position,
        }),
      );
    });
  };
  const musicSeekForwardHandler = () => {
    MusicControl.on(Command.seekForward, position => {
      console.log(position);
      webViews.current.postMessage(
        JSON.stringify({
          action: 'move_bar',
          seek: position,
        }),
      );
    });
  };
  const musicSeekBackwardHandler = () => {
    MusicControl.on(Command.seekBackward, position => {
      console.log(position);
      webViews.current.postMessage(
        JSON.stringify({
          action: 'move_bar',
          seek: position,
        }),
      );
    });
  };

  React.useEffect(() => {
    musicPlayHandler();
    musicPauseHandler();
    musicSeekHandler();
    musicNextHandler();
    musicPrevHandler();
    musicSeekForwardHandler();
    musicSeekBackwardHandler();
    return () => {
      MusicControl.stopControl();
      MusicControl.resetNowPlaying();
    };
  }, []);

  const handleMessage = (event: any) => {
    // WebView에서 전달된 메시지 수신
    try {
      const message = JSON.parse(event.nativeEvent.data);

      console.log('message', message);

      // 수신한 메시지에 따라 필요한 동작 수행
      const {
        title,
        artist,
        duration,
        action,
        pause_duration,
        replay_duration,
        move_duration,
      } = message;
      setMusicState(action);

      if (action === 'now_play') {
        console.log('its play!!!!!!!!');

        // console.log(title, artist, duration);

        MusicControl.setNowPlaying({
          title: title,
          artwork: require('../../assets/img/music_icon.png'), // URL or RN's image require()
          artist: artist,
          album: 'Thriller',
          cover: 'Post-disco, Rhythm and Blues, Funk, Dance-pop',
          duration: duration, // (Seconds)
          isLiveStream: true, // iOS Only (Boolean), Show or hide Live Indicator instead of seekbar on lock screen for live streams. Default value is false.
        });

        MusicControl.updatePlayback({
          state: MusicControl.STATE_PLAYING, // (STATE_ERROR, STATE_STOPPED, STATE_PLAYING, STATE_PAUSED, STATE_BUFFERING)
          speed: 1, // Playback Rate
          elapsedTime: 0, // (Seconds)
          // bufferedTime: 200, // Android Only (Seconds)
          volume: 10, // Android Only (Number from 0 to maxVolume) - Only used when remoteVolume is enabled
          maxVolume: 10, // Android Only (Number) - Only used when remoteVolume is enabled
        });
      } else if (action === 'replay' && replay_duration) {
        MusicControl.updatePlayback({
          state: MusicControl.STATE_PLAYING,
          speed: 1,
          elapsedTime: replay_duration,
          // bufferedTime: 200,
          volume: 10, // Android Only (Number from 0 to maxVolume) - Only used when remoteVolume is enabled
          maxVolume: 10, // Android Only (Number) - Only used when remoteVolume is enabled
        });
      } else if (action === 'move_bar' && move_duration) {
        MusicControl.updatePlayback({
          state: MusicControl.STATE_PLAYING, // (STATE_ERROR, STATE_STOPPED, STATE_PLAYING, STATE_PAUSED, STATE_BUFFERING)
          speed: 1, // Playback Rate
          elapsedTime: move_duration, // (Seconds)
          // bufferedTime: 200, // Android Only (Seconds)
          volume: 10, // Android Only (Number from 0 to maxVolume) - Only used when remoteVolume is enabled
          maxVolume: 10, // Android Only (Number) - Only used when remoteVolume is enabled
        });
      } else if (action === 'pause') {
        MusicControl.updatePlayback({
          state: MusicControl.STATE_PAUSED, // (STATE_ERROR, STATE_STOPPED, STATE_PLAYING, STATE_PAUSED, STATE_BUFFERING)
          elapsedTime: pause_duration, // (Seconds)
        });
      }
    } catch (err) {
      // Alert.alert(err);
    }
    // 이벤트 처리 로직을 작성
  };
  React.useEffect(() => {
    setMusicControlHandler();
  }, []);

  React.useEffect(() => {
    if (musicState === 'pause') {
      musicPlayHandler();
    } else if (musicState === 'now_play') {
      musicSeekHandler();
    }
  }, [musicState]);

  return (
    <SafeAreaView style={{flex: 1}}>
      {is_loading ? (
        <View style={{flex: 1, height: height}}>
          <WebView
            ref={webViews}
            source={{uri: webview_url}}
            useWebKit={true}
            sharedCookiesEnabled
            onMessage={webViews => handleMessage(webViews)}
            onNavigationStateChange={webViews =>
              onNavigationStateChange(webViews)
            }
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            javaScriptEnabledAndroid={true}
            allowFileAccess={true}
            renderLoading={true}
            mediaPlaybackRequiresUserAction={false}
            setJavaScriptEnabled={true}
            scalesPageToFit={true}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            mixedContentMode={'compatibility'}
            overScrollMode={'never'}
            userAgent="Mozilla/5.0 (Linux; Android 8.0.0; SM-G935S Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Mobile Safari/537.36"
          />
        </View>
      ) : (
        <View style={{marginTop: '49%'}}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default LoginScreen;
