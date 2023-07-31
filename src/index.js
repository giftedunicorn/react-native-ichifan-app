import React, {useRef, useState, useEffect} from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {PermissionsAndroid, Platform} from 'react-native';
import {
    ClientRoleType,
    createAgoraRtcEngine,
    RtcSurfaceView,
    ChannelProfileType,
} from 'react-native-agora';

const appId = 'c61e30466a2942ed9f9e840b760e9a5b';
const token = '';
const channelName = 'testChannel';
const uid = 0;

const App = () => {
    const agoraEngineRef = useRef();
    const [isJoined, setIsJoined] = useState(false); 
    const [remoteUid, setRemoteUid] = useState(0);
    const [message, setMessage] = useState(''); 

    useEffect(() => {
        setupVideoSDKEngine();
    });
     
    const setupVideoSDKEngine = async () => {
        try {
            if (Platform.OS === 'android') {
            await getPermission()};
            agoraEngineRef.current = createAgoraRtcEngine();
            const agoraEngine = agoraEngineRef.current;

            agoraEngine.registerEventHandler({
                onJoinChannelSuccess: () => {
                    showMessage('joined successfully' + channelName);
                    setIsJoined(true);
                },
                onUserJoined: (_connection, Uid) => {
                    showMessage('Remote ' + Uid + ' joined');
                    setRemoteUid(Uid);
                },
                onUserOffline: (_connection, Uid) => {
                    showMessage('Remote ' + Uid + 'left');
                    setRemoteUid(0);
                },
            });
            agoraEngine.initialize({
                appId: appId,
            });
            agoraEngine.enableVideo();
        } catch (e) {
            console.log(e);
        }
    };

    const join = async () => {
        if (isJoined) {
            return;
        }
        try {
            agoraEngineRef.current?.setChannelProfile(
                ChannelProfileType.ChannelProfileCommunication,
            );
            agoraEngineRef.current?.startPreview();
            agoraEngineRef.current?.joinChannel(token, channelName, uid, {
                clientRoleType: ClientRoleType.ClientRoleBroadcaster,
            });
        } catch (e) {
            console.log(e);
        }
    };

    const leave = () => {
        try {
            agoraEngineRef.current?.leaveChannel();
            setRemoteUid(0);
            setIsJoined(false);
            showMessage('已离开频道');
        } catch (e) {
            console.log(e);
        }
    };

    const getPermission = async () => {
        if (Platform.OS === 'android') {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                PermissionsAndroid.PERMISSIONS.CAMERA,
            ]);
        }
    };

    function showMessage(msg) {
        setMessage(msg);
    }

    return (
        <SafeAreaView style={styles.main}>
            <Text style={styles.head}>Live Streaming</Text>
            <View style={styles.btnContainer}>
                <Text onPress={join} style={styles.button}>
                    Join Channel
                </Text>
                <Text onPress={leave} style={styles.button}>
                    Leave Channel
                </Text>
            </View>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContainer}>
                {isJoined ? (
                    <React.Fragment key={0}>
                    <RtcSurfaceView canvas={{uid: 0}} style={styles.videoView} />
                    <Text>Local uid: {uid}</Text>
                    </React.Fragment>
                ) : (
                    <Text>Join Channel</Text>
                )}
                {isJoined && remoteUid !== 0 ? (
                    <React.Fragment key={remoteUid}>
                    <RtcSurfaceView
                        canvas={{uid: remoteUid}}
                        style={styles.videoView}
                    />
                    <Text>Remote uid: {remoteUid}</Text>
                    </React.Fragment>
                ) : (
                    <Text>Waiting for remote user joining</Text>
                )}
                <Text style={styles.info}>{message}</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 25,
        paddingVertical: 4,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#0055cc',
        margin: 5,
    },
    main: {flex: 1, alignItems: 'center'},
    scroll: {flex: 1, backgroundColor: '#ddeeff', width: '100%'},
    scrollContainer: {alignItems: 'center'},
    videoView: {width: '90%', height: 200},
    btnContainer: {flexDirection: 'row', justifyContent: 'center'},
    head: {fontSize: 20},
    info: {backgroundColor: '#ffffe0', color: '#0000ff'}
});

export default App;
