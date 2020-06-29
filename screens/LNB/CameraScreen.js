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
    Modal
} from 'react-native'

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

    const camera = useRef(null)

    // PERMISSIONS
    useEffect(() => {
        console.log('camera mounted')
        return () => {
            console.log('camera unmounted')
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

    
    return (
        <View style={styles.screen}>
            {screenView === 'cameraReady' && 
                <TouchableWithoutFeedback onPress={() => doubleTapFlip()}>
                    <Camera 
                        style={{ flex: 1 }} 
                        type={cameraView} 
                        flashMode={cameraFlashMode}
                        ref={camera}
                        onCameraReady={() => console.log('camera ready')}
                        onMountError={() => console.log('mount error')}
                    >
                        <View style={styles.cameraControls}>
                            <TouchableOpacity
                                style={{...styles.cameraControlButton}}
                                onPress={() => props.navigation.goBack()}
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
                            <TouchableCmp
                                style={{...styles.cameraControlButton, marginTop: 40}}
                                onPress={() => {
                                    setScreenView('cameraReady')
                                    setLocalUri()
                                }}
                            >
                                <Ionicons
                                    name={Platform.OS==='android' ? 'md-close' : 'ios-close'}
                                    color='white'
                                    size={24}
                                />
                            </TouchableCmp>
                        </ImageBackground>
                    </TouchableWithoutFeedback>
                </View>
            }

        </View>
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
        // width: SCREEN_WIDTH * 0.8,
        // height: SCREEN_HEIGHT * 0.8,
        alignItems: 'flex-end',
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
        height: 40,
        width: 40,
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