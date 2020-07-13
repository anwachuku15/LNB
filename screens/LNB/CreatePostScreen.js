import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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
    FlatList,
    Keyboard,
} from 'react-native'
import { StackActions, NavigationActions } from 'react-navigation'
import { ListItem } from 'react-native-elements'

import { Ionicons, FontAwesome, SimpleLineIcons } from '@expo/vector-icons'
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
import CameraModal from '../../components/LNB/CameraModal'
import Lightbox from 'react-native-lightbox'


const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 10

const CreatePostScreen = props => {
    const scheme = useColorScheme()

    const userName = useSelector(state => state.auth.credentials.displayName)
    const userImage = useSelector(state => state.auth.credentials.imageUrl)
    const authId = useSelector(state => state.auth.userId)

    const uri = props.navigation.getParam('uri')
    const existingBody = props.navigation.getParam('existingBody')

    const allUsers = useSelector(state => state.auth.allUsers)
    
    const dispatch = useDispatch()

    let text, postOptionsBorderTopColor, postOptionsBackground, background
    if (scheme === 'dark') {
        text = 'white'
        background ='black'
        postOptionsBackground = 'black'
        postOptionsBorderTopColor = Colors.darkSearch
    } else {
        text = 'black'
        background = 'white'
        postOptionsBackground = 'white'
        postOptionsBorderTopColor = Colors.lightSearch
    }

    const [isLoading, setIsLoading] = useState(false)
    const [mediaScroll, setMediaScroll] = useState(true)
    const [body, setBody] = useState(existingBody ? existingBody : '')
    const [image, setImage] = useState(uri ? uri : null)
    const [video, setVideo] = useState()
    const [mediaAssets, setMediaAssets] = useState()
    const [isCameraVisible, setIsCameraVisible] = useState(false)
    const [cameraView, setCameraView] = useState(Camera.Constants.Type.back)
    const [cameraFlashMode, setCameraFlashMode] = useState(Camera.Constants.FlashMode.off)

    const [isMentioning, setIsMentioning] = useState(false)
    const [search, setSearch] = useState('')
    const [results, setResults] = useState([])
    const [taggedUsers, setTaggedUsers] = useState([])

    const searchInput = useRef(null)
    const textInput = useRef(null)

    const loadMediaAssets = useCallback(async () => {
        try {
            const data = await MediaLibrary.getAssetsAsync()
            let assets = []
            let i = 0
            while (i < 10) {
                assets.push({
                    uri: data.assets[i].uri,
                    mediaType: data.assets[i].mediaType,
                    duration: data.assets[i].duration
                })
                i++
            }
            setMediaAssets(assets)
        } catch (err) {
            console.log(err)
        }
    }, [setMediaAssets])

    useEffect(() => {
        loadMediaAssets().catch(err => console.log(err))
        if (image !== null) {
            setMediaScroll(false)
        }
        return () => {
            loadMediaAssets
        }
    }, [loadMediaAssets])

    useEffect(() => {
        getPhotoPermission()
    }, [getPhotoPermission])

    // useEffect(() => {
    //     const willFocusSub = props.navigation.addListener(
    //         'willFocus', () => {
    //             if (existingBody) {
    //                 setBody(existingBody)
    //             } else {
    //                 setBody('')
    //             }
    //         }
    //     )
    //     return () => {
    //         willFocusSub
    //     }
    // }, [setBody])

    const getPhotoPermission = async () => {
        if (Constants.platform.ios) {
            const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)

            if(status != 'granted') {
                alert('We need permission to access your camera roll')
            }
        }
    }


    const toggleCamera = async () => {
        if (Constants.platform.ios) {
            const { status } = await Camera.requestPermissionsAsync()
            if (status != 'granted') {
                alert('We need permission to access your camera')
            } else {
                setIsCameraVisible(!isCameraVisible)
            }
        }
    }

    const pickImage = async () => {
        UserPermissions.getCameraPermission()
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All, // ImagePicker.MediaTypeOptions.Images & ImagePicker.MediaTypeOptions.Videos for Android
            allowsEditing: false,
            aspect: [4,3],
            // videoExportPreset: 0
        })

        if(!result.cancelled) {
            setImage(result.uri)
            setMediaScroll(false)
        }
    }
    

    const handlePost = async (userName, body, image) => {
        // taggedUsers.forEach(user => {
        //     if (!body.includes(user.name)) {
        //         taggedUsers.splice(taggedUsers.indexOf(taggedUsers.find(tagged => tagged.uid === user.uid)), 1)
        //         setTaggedUsers(taggedUsers)
        //     }
        // })
        
        try {
            if (image) {
                await dispatch(createNeed(userName, body.trimEnd(), image, taggedUsers))
            } else {
                await dispatch(createNeed(userName, body.trimEnd(), '', taggedUsers))
            }
            setBody('')
            setImage(null)
            props.navigation.goBack()
        } catch (err) {
            alert(err)
            console.log(err)
        }
    }


    const updateSearch = (text) => {
        setSearch(text)
        if (text.includes('  ') || text.includes('.')) {
            setIsMentioning(false)
        } else {
            const newResults = allUsers.filter(result => {
                const resultData = `${result.name.toUpperCase()}`
                const query = text.toUpperCase()
    
                return resultData.includes(query)
            })
            setResults(newResults)
        }
    }

    const cancelSearch = () => {
        searchInput.current.blur()
    }

    const tagUser = (uid, name) => {
        const text = textInput.current._getText()
        const index = text.lastIndexOf('@')
        const endIndex = text.trim().length
        const newText = text.slice(0, index)
        setBody(newText + name)
        taggedUsers.push({
            uid,
            name
        })
        setTaggedUsers(taggedUsers)
        setIsMentioning(false)
    }


    const renderItem = ({item}) => (
        <TouchableCmp onPress={() => {
            tagUser(item.uid, item.name)
        }}>
            <ListItem
                containerStyle={{
                    backgroundColor:background,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                }}
                leftAvatar={{
                    source: {uri: item.imageUrl},
                    rounded: true
                }}
                title={
                    <Text style={{color:text, fontSize: 14}}>{item.name}</Text>
                }
            />
        </TouchableCmp>
    )

    const memoizedItem = useMemo(() => {
        return renderItem
    }, [])

    const navToCamera = StackActions.replace({
        routeName: 'cameraModal',
        params: {
            body: body
        }
    })

    const mediaItem = ({item}) => (
        <TouchableCmp onPress={() => {
            setImage(item.uri)
            setMediaScroll(false)
            Keyboard.dismiss()
        }}>
            <Image source={{uri: item.uri}} style={styles.mediaAssetContainer} />
        </TouchableCmp>
    )


    return (
        <View style={{...styles.screen, backgroundColor: background}}>
            <SafeAreaView>
                <View style={styles.header}>
                    <TouchableOpacity onPress={()=>props.navigation.goBack()}>
                        <Ionicons name='md-close' size={24} color={Colors.primary}/>
                    </TouchableOpacity>
                    <Text style={{color:text, fontFamily:'open-sans-bold'}}>Share a Need</Text>
                    <TouchableOpacity onPress={() => handlePost(userName, body, image)} disabled={!body.trim().length && !image}>
                        <Text style={{fontWeight:'500', color: (!body.trim().length && !image) ? Colors.disabled : Colors.primary}}>Post</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            
            <ScrollView contentContainerStyle={{}} keyboardShouldPersistTaps={true}>
                <View style={styles.inputContainer}>
                    <Image source={{uri: userImage}} style={styles.avatar}/>
                    <TextInput 
                        ref={textInput}
                        autoFocus={true} 
                        multiline={true} 
                        numberOfLines={4} 
                        style={{flex:1, color:text, fontSize: 18}}
                        placeholder={'What do you need?'}
                        placeholderTextColor={Colors.placeholder}
                        onChangeText={text => {
                            // const index = text.lastIndexOf('@')
                            // const end = text.length
                            // if (!text.includes('@') || (text.charAt(index-1) !== ' ' && index !== 0)) {
                            //     setIsMentioning(false)
                            // }
                            // if (text.length > 0 && index === text.length-1) {
                            //     setIsMentioning(true)
                            // }
                            // if (isMentioning) {
                            //     updateSearch(text.slice(index+1, end))
                            // }
                            setBody(text)
                        }}
                        value={body}
                    />
                </View>

                <View style={{marginHorizontal: 32, marginTop: 10, marginBottom: 20, height: '80%', width: '80%', alignSelf:'center',}}>
                    {image ? (
                        <Lightbox
                            backgroundColor='rgba(0, 0, 0, 0.8)'
                            underlayColor={scheme==='dark' ? 'black' : 'white'}
                            springConfig={{tension: 15, friction: 7}}
                            renderHeader={(close) => (
                                <TouchableCmp 
                                    onPress={close}
                                    style={styles.closeButton}
                                >
                                    <Ionicons 
                                        name='ios-close'
                                        size={36}
                                        color='white'
                                    />
                                </TouchableCmp >
                            )}
                            renderContent={() => (
                                <Image source={{uri: image}} style={styles.lightboxImage} />
                            )}
                        >
                        <ImageBackground source={{uri: image}} imageStyle={{borderRadius:12}} style={styles.image}>
                            <TouchableCmp
                                style={styles.removeImageButton}
                                onPress={() => {
                                    setImage()
                                    setMediaScroll(true)
                                    textInput.current.focus()
                                }}
                            >
                                <Ionicons
                                    name={Platform.OS==='android' ? 'md-close' : 'ios-close'}
                                    color='white'
                                    size={24}
                                />
                            </TouchableCmp>
                        </ImageBackground>
                    </Lightbox>
                    ) : (
                        null
                    )}
                </View>
            </ScrollView>
            
            {/* {isMentioning && <View style={{flex: 2, borderWidth: 1, borderColor: Colors.placeholder}}>
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={search.length === 0 ? allUsers : results}
                    renderItem={memoizedItem}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps='always'
                />
            </View>} */}


            <KeyboardAvoidingView behavior='padding'>
                {mediaAssets && mediaScroll &&
                    <FlatList
                        keyExtractor={(item, index) => index.toString()}
                        data={mediaAssets}
                        keyboardShouldPersistTaps='always'
                        renderItem={mediaItem}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ListHeaderComponent={() => (
                            <TouchableCmp 
                                onPress={() => props.navigation.dispatch(navToCamera)}
                                style={{backgroundColor: background, justifyContent:'center', alignItems:'center', ...styles.mediaAssetContainer}}
                            >
                                <SimpleLineIcons 
                                    name='camera' 
                                    size={36} 
                                    color={Colors.primary}
                                />
                            </TouchableCmp>
                        )}
                        ListFooterComponent={() => (
                            <TouchableCmp 
                                onPress={pickImage}
                                style={{backgroundColor: background, justifyContent:'center', alignItems:'center', ...styles.mediaAssetContainer, marginRight: 10}}
                            >
                                <FontAwesome 
                                    name='image' 
                                    size={36} 
                                    color={Colors.primary}
                                />
                            </TouchableCmp>
                        )}
                    />
                }
                <View style={{...styles.postOptions, backgroundColor: postOptionsBackground, borderTopColor: postOptionsBorderTopColor}}>
                    {/* <TouchableOpacity 
                        style={styles.photo}
                        onPress={() => props.navigation.dispatch(navToCamera)}
                    >
                        <SimpleLineIcons 
                            name='camera' 
                            size={26} 
                            color={Colors.primary}
                        />
                    </TouchableOpacity> */}
                    <TouchableOpacity 
                        style={styles.photo}
                        onPress={pickImage}
                    >
                        <FontAwesome 
                            name='image' 
                            size={26} 
                            color={Colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* <CameraModal 
                isCameraVisible={isCameraVisible}
                toggleCamera={toggleCamera}
                cameraView={cameraView}
                setCameraView={setCameraView}
                cameraFlashMode={cameraFlashMode}
                setCameraFlashMode={setCameraFlashMode}
            /> */}
        </View>
        

            
    )
}


CreatePostScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Create a Post'
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    mediaAssetContainer: {
        marginBottom: 10,
        marginLeft: 10,
        width: 80, 
        height: 80, 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: Colors.primary,
    },
    modalView: {
        // flex: 1,
        // justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 500,
        marginBottom: 0
    },
    cameraControls: {
        flex: 1,
        marginTop: SCREEN_HEIGHT * 0.08,
        flexDirection: 'row',
        justifyContent:'space-between',
        backgroundColor: 'transparent',
        // justifyContent: 'flex-end',
        // marginTop: 100,
    },
    cameraControlButton: {
        color: 'white',
        backgroundColor: 'rgba(40, 40, 40, 0.7)',
        borderRadius: 20,
        marginHorizontal: 18,
        height: 40,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    lightboxImage: {
        width: SCREEN_WIDTH * 0.9,
        height: SCREEN_HEIGHT * 0.9,
        alignSelf: 'center',
        borderRadius: 10,
        marginVertical: 10,
    },
    closeButton: {
        color: 'white',
        backgroundColor: 'rgba(40, 40, 40, 0.7)',
        borderRadius: 20,
        marginHorizontal: 18,
        marginVertical: 32,
        height: 40,
        width: 40,
        paddingTop: 2,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end'
    },
    removeImageButton: {
        alignItems: 'center',
        marginRight: 7,
        marginTop: 7,
        backgroundColor: 'rgba(0,0,0,0.7)',
        height: 24,
        width: 24,
        borderRadius: 12
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
    inputContainer: {
        marginRight: 32,
        marginLeft: 20,
        marginTop: 20,
        marginBottom: 5,
        flexDirection: 'row',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16
    },
    photo: {
        alignItems: 'flex-end',
        marginHorizontal: 15
    },
    image: {
        width: SCREEN_WIDTH * 0.8,
        height: SCREEN_HEIGHT * 0.8,
        alignItems: 'flex-end',
    },
    postOptions: {
        borderTopWidth: 0.5,
        paddingTop: 9,
        flexDirection:'row', 
        alignItems:'center', 
        paddingBottom: 25,
    }
})


export default CreatePostScreen