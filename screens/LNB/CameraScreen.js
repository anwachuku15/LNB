import React, { useState, useEffect, useRef } from 'react'
import { 
    Alert,
    Platform,
    View, 
    Text, 
    StyleSheet, 
    Image,
    ImageBackground, 
    Button, 
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    SafeAreaView,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Keyboard
} from 'react-native'
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

import { StackActions, NavigationActions } from 'react-navigation'
import ZoomView from '../../components/LNB/ZoomView'
import { Ionicons, FontAwesome, SimpleLineIcons, Feather, } from '@expo/vector-icons'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library'
import { Camera } from 'expo-camera'
import { Video } from 'expo-av'

import Fire from '../../Firebase/Firebase'
import { createNeed } from '../../redux/actions/postsActions'
import UserPermissions from '../../util/UserPermissions'
import TouchableCmp from '../../components/LNB/TouchableCmp'
import Lightbox from 'react-native-lightbox'


const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 30

// Permissions.AUDIO_RECORDING for video
// LOAD CAMERA ERRORS - onCameraReady mount issue when camera was in use by Twitter


const CameraScreen = props => {
    const [cameraView, setCameraView] = useState(Camera.Constants.Type.back)
    const [cameraFlashMode, setCameraFlashMode] = useState(Camera.Constants.FlashMode.off)
    const [captureMode, setCaptureMode] = useState('picture')
    const [lastTap, setLastTap] = useState()
    const [screenView, setScreenView] = useState('cameraReady')
    const [localUri, setLocalUri] = useState()
    const body = props.navigation.getParam('body')
    const [zoom, setZoom] = useState(0)

    const camera = useRef(null)

    // PERMISSIONS
    useEffect(() => {
        // console.log('camera mounted')
        Keyboard.dismiss()
        return () => {
            // console.log('camera unmounted')
        }
    }, [])

    const getMediaLibraryPermission = async () => {
        if (Constants.platform.ios) {
            const { status } = await MediaLibrary.getPermissionsAsync()
            return status
        }
    }
    
    const capturePicture = async () => {
        if (camera) {
            try {
                getMediaLibraryPermission()
                .then(async res => {
                    if (res === 'granted') {
                        const { uri } = await camera.current.takePictureAsync()
                        await MediaLibrary.saveToLibraryAsync(uri)
                        setLocalUri(uri)
                        setScreenView('imageReady')
                    }
                })
            } catch (err) {
                console.log(err)
            }
        }
    }

    const doubleTapFlip = () => {
        const now = Date.now()
        const DOUBLE_TAP_DELAY = 300
        if (lastTap && (now - lastTap) < DOUBLE_TAP_DELAY) {
            setCameraView(
                cameraView === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
            );
        } else {
            setLastTap(now)
        }
    }

    
    // ZOOM
    const handlePinch = ({nativeEvent}) => {
        // const { scale, velocity } = nativeEvent
        const scale = nativeEvent.scale
        const velocity = nativeEvent.velocity
        console.log(scale)
        console.log('------\n')
        let newZoom = 
            velocity > 0 
                ? zoom + scale * velocity * (Platform.OS === 'ios' ? 0.01 : 25)
                : zoom - scale * Math.abs(velocity) * (Platform.OS === 'ios' ? 0.01 : 25)
        if (newZoom < 0) newZoom = 0
        else if (newZoom > 0.5) newZoom = 0.5
        setZoom(newZoom)
    }
    const pinchStateHandler = (event) => {
        const pinch_start = event.nativeEvent.state === State.END
        const pinch_begin = event.nativeEvent.state === State.BEGAN
        const pinch_active = event.nativeEvent.state === State.ACTIVE
        // if (pinch_start) {
        //     handlePinch()
        // } else if (pinch_begin && pinch_active) {
        //     handlePinch()
        // }
    }

    const navToPostModal = StackActions.replace({
        routeName: 'postModal',
        params: {
            uri: localUri,
            existingBody: body
        }
    })
    const goBack = StackActions.replace({
        routeName: 'postModal'
    })
    return (
        <PinchGestureHandler onGestureEvent={handlePinch} >

        <View style={styles.screen}>
            {screenView === 'cameraReady' && 
                <TouchableWithoutFeedback onPress={() => doubleTapFlip()}>
                    <Camera 
                        style={{ flex: 1 }} 
                        type={cameraView} 
                        flashMode={cameraFlashMode}
                        ref={camera}
                        zoom={zoom}
                        onMountError={() => console.log('mount error')}
                        autoFocus={true}
                    >
                        <View style={styles.cameraControls}>
                            <TouchableOpacity
                                style={{...styles.cameraControlButton}}
                                onPress={() => props.navigation.dispatch(navToPostModal)}
                            >
                                <Ionicons 
                                    name='ios-close'
                                    size={36}
                                    color='white'
                                    style={{alignSelf:'center'}}
                                />
                            </TouchableOpacity>
                            <View style={{flexDirection: 'row'}}>
                                <View style={{flexDirection:'column', alignItems:'center'}}>
                                    <TouchableOpacity
                                        style={{...styles.cameraControlButton}}
                                        onPress={() => {
                                            setCameraFlashMode(
                                                cameraFlashMode === Camera.Constants.FlashMode.off
                                                ? Camera.Constants.FlashMode.on
                                                : Camera.Constants.FlashMode.off
                                            );
                                        }}>
                                            <Ionicons 
                                                name={cameraFlashMode=== Camera.Constants.FlashMode.off ? 'ios-flash' : 'ios-flash-off'}
                                                size={28}
                                                color='white'
                                            />
                                    </TouchableOpacity>
                                    {/* <View style={{alignItems: 'center', alignSelf:'center', margin: 5, padding: 3, borderRadius: 5, backgroundColor: 'rgba(180, 180, 180, 0.7)'}}>
                                        <Text style={{fontSize: 13, color: 'white'}}>Turn flash {cameraFlashMode === Camera.Constants.FlashMode.off ? 'on' : 'off'}</Text>
                                    </View> */}
                                </View>
                                <TouchableOpacity
                                    style={{...styles.cameraControlButton}}
                                    onPress={() => {
                                        setCameraView(
                                            cameraView === Camera.Constants.Type.back
                                            ? Camera.Constants.Type.front
                                            : Camera.Constants.Type.back
                                        );
                                    }}>
                                    <Feather
                                        name='rotate-ccw'
                                        size={20}
                                        color={'white'}
                                        style={{alignSelf:'center'}}
                                    />
                                </TouchableOpacity>
                                
                            </View>
                        </View>

                        <View style={{marginBottom: 20, alignItems:'center'}}>
                            <TouchableCmp 
                                style={{...styles.captureControl, backgroundColor: captureMode==='picture' ? 'rgba(251, 188, 4, 0.8)' : Colors.redcrayola}}
                                onPress={() => capturePicture()}
                            >
                                <SimpleLineIcons 
                                    name='camera' 
                                    size={40} 
                                    color={'white'}
                                    style={{alignSelf:'center', margin: 20}}
                                />
                            </TouchableCmp>
                        </View>
                    </Camera>
                </TouchableWithoutFeedback>
                
            }
            
            {screenView === 'imageReady' && localUri &&
                <View style={{flex: 1, justifyContent:'center', alignContent: 'center', }}>
                    <TouchableWithoutFeedback onPress={() => {}} style={{justifyContent:'center'}}>
                        <ImageBackground source={{uri: localUri}} style={styles.image}>
                            <View style={{flexDirection:'row', justifyContent: 'space-between', marginHorizontal: 20}}>
                                <TouchableCmp
                                    style={{...styles.imageReadyControlButton, backgroundColor: 'rgba(180, 180, 180, 0.7)', marginBottom: 60}}
                                    onPress={() => {
                                        setScreenView('cameraReady')
                                        setLocalUri()
                                    }}
                                >
                                    <Text style={{color: 'white'}}>Retake</Text>
                                </TouchableCmp>
                                <TouchableCmp
                                    style={{...styles.imageReadyControlButton, marginBottom: 60}}
                                    onPress={() => {props.navigation.dispatch(navToPostModal)}}
                                >
                                    <Text style={{color: 'white'}}>Use Photo</Text>
                                </TouchableCmp>
                            </View>
                        </ImageBackground>
                    </TouchableWithoutFeedback>
                </View>
            }

        </View>
        </PinchGestureHandler>
    )
}



const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.primary,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    image: { 
        flex: 1,
        alignSelf: 'center',
        height: '100%', 
        width: '100%',
        justifyContent: 'flex-end',
        // width: SCREEN_WIDTH * 0.8,
        // height: SCREEN_HEIGHT * 0.8,
        // alignItems: 'flex-end',
    },
    modalView: {
        flex: 1,
        alignItems: 'center',
        marginTop: 22,
        marginBottom: 0
    },
    cameraControls: {
        flex: 1,
        marginTop: SCREEN_HEIGHT * 0.08,
        flexDirection: 'row',
        justifyContent:'space-between',
    },
    cameraControlButton: {
        color: 'white',
        backgroundColor: 'rgba(180, 180, 180, 0.7)',
        borderRadius: 20,
        marginHorizontal: 18,
        paddingHorizontal: 10,
        height: 40,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageReadyControlButton: {
        color: 'white',
        // backgroundColor: 'rgba(180, 180, 180, 0.7)',
        backgroundColor: Colors.primary,
        borderRadius: 20,
        marginHorizontal: 18,
        padding: 10,
        // height: 40,
        // width: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    captureControl: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: BASE_PADDING, 
        borderColor: 'white', 
        borderWidth: 4, 
        borderRadius: 50,
        // height: 40,
        // width: 40
    },
})


export default CameraScreen