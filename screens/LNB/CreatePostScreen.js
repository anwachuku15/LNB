import React, { useState, useEffect } from 'react'
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
    TextInput,
    SafeAreaView,
    Dimensions,
    KeyboardAvoidingView,
} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
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
import { Video } from 'expo-av'

import Fire from '../../Firebase/Firebase'
import { createNeed } from '../../redux/actions/postsActions'
import UserPermissions from '../../util/UserPermissions'
import TouchableCmp from '../../components/LNB/TouchableCmp'
import Lightbox from 'react-native-lightbox'


const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 10

const CreatePostScreen = props => {
    const scheme = useColorScheme()

    const userName = useSelector(state => state.auth.credentials.displayName)
    const userImage = useSelector(state => state.auth.credentials.imageUrl)
    const productId = props.navigation.getParam('productId')
    const selectedProduct = useSelector(state => state.products.availableProducts.find(prod => prod.id === productId))
    const dispatch = useDispatch()

    let text, postOptionsBorderTopColor, postOptionsBackground
    if (scheme === 'dark') {
        text = 'white'
        postOptionsBackground = 'black'
        postOptionsBorderTopColor = Colors.darkSearch
    } else {
        text = 'black'
        postOptionsBackground = 'white'
        postOptionsBorderTopColor = Colors.lightSearch
    }

    
    const [body, setBody] = useState('')
    const [image, setImage] = useState()
    const [video, setVideo] = useState()

    // useEffect(() => {
    //     getPhotoPermission()
    // }, [getPhotoPermission])

    // const getPhotoPermission = async () => {
    //     if (Constants.platform.ios) {
    //         const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)

    //         if(status != 'granted') {
    //             alert('We need permission to access your camera roll')
    //         }
    //     }
    // }

    const pickImage = async () => {
        UserPermissions.getCameraPermission()
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All, // ImagePicker.MediaTypeOptions.Images & ImagePicker.MediaTypeOptions.Videos for Android
            allowsEditing: false,
            aspect: [4,3],
            videoExportPreset: 0
        })

        if(!result.cancelled) {
            setImage(result.uri)
        }
    }
    

    const handlePost = async (userName, body, image) => {
        try {
            if (image) {
                await dispatch(createNeed(userName, body, image))
            } else {
                await dispatch(createNeed(userName, body, ''))
            }
            setBody('')
            setImage(null)
            props.navigation.goBack()
        } catch (err) {
            alert(err)
            console.log(err)
        }
    }



    return (
        <View style={styles.screen}>
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
            
            <ScrollView contentContainerStyle={{flex: 1}}>
                <View style={styles.inputContainer}>
                    <Image source={{uri: userImage}} style={styles.avatar}/>
                    <TextInput 
                        autoFocus={true} 
                        multiline={true} 
                        numberOfLines={4} 
                        style={{flex:1, color:text}}
                        placeholder={'What do you need?'}
                        placeholderTextColor={Colors.placeholder}
                        onChangeText={text => {
                            setBody(text)
                        }}
                        value={body}
                    />
                </View>

                <View style={{marginHorizontal: 32, marginTop: 10, height: '80%', width: '80%', alignSelf:'center',}}>
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
                                onPress={() => setImage()}
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

            {/* <SafeAreaView style={{height: '10%'}}> */}
                <KeyboardAvoidingView behavior='padding'>
                    <View style={{...styles.postOptions, backgroundColor: postOptionsBackground, borderTopColor: postOptionsBorderTopColor}}>
                        <TouchableOpacity 
                            style={styles.photo}
                            onPress={() => {
                                Alert.alert('Camera coming soon', "You'll be able to take pictures soon. For now, just upload something from your camera roll.", [
                                    {
                                        text: 'Cancel',
                                        style: 'cancel'
                                    },
                                    {
                                        text: 'Open Camera Roll',
                                        style: 'default',
                                        onPress: pickImage
                                    }
                                ])
                            }}
                        >
                            <SimpleLineIcons 
                                name='camera' 
                                size={26} 
                                color={Colors.primary}
                            />
                        </TouchableOpacity>
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
            {/* </SafeAreaView> */}
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
        justifyContent: 'center'
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
        marginHorizontal: 32,
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
        // height: '100%', 
        // width: '100%',
        width: SCREEN_WIDTH * 0.8,
        height: SCREEN_HEIGHT * 0.8,
        alignItems: 'flex-end',
        // alignSelf: 'center'
    },
    postOptions: {
        borderTopWidth: 0.5,
        paddingTop: 9,
        flexDirection:'row', 
        alignItems:'center', 
        paddingBottom: 30,
    }
})


export default CreatePostScreen