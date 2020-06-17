import React, { useState, useEffect, useRef } from 'react'
import { 
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
} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import { Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
import * as ImagePicker from 'expo-image-picker'
import Fire from '../../Firebase/Firebase'
import { createAnnouncement, createAnnouncementNoImg } from '../../redux/actions/adminActions'
import UserPermissions from '../../util/UserPermissions'
import TouchableCmp from '../../components/LNB/TouchableCmp'
import Lightbox from 'react-native-lightbox'
import { sub } from 'react-native-reanimated'

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 10

const CreateAnnouncementScreen = props => {
    const scheme = useColorScheme()

    const admin = useSelector(state => state.auth.credentials.displayName)
    const userImage = useSelector(state => state.auth.credentials.imageUrl)
    const dispatch = useDispatch()

    let text
    if (scheme === 'dark') {
        text = 'white'
    } else {
        text = 'black'
    }

    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [image, setImage] = useState()

    const announcementInput = useRef()


    const pickImage = async () => {
        UserPermissions.getCameraPermission()
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4,3]
        })

        if(!result.cancelled) {
            setImage(result.uri)
        }
    }
    

    const handlePost = async () => {
        try {
            await dispatch(createAnnouncement(admin, subject, body, image))
            setSubject('')
            setBody('')
            setImage(null)
            props.navigation.goBack()
        } catch (err) {
            alert(err)
            console.log(err)
        }
    }


    const handlePostNoImg = async () => {
        try {
            await dispatch(createAnnouncementNoImg(admin, subject, body, ''))
            setSubject('')
            setBody('')
            setImage(null)
            props.navigation.goBack()
        } catch (err) {
            alert(err)
            console.log(err)
        }
    }


    return (
        
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <TouchableOpacity onPress={()=>props.navigation.goBack()}>
                    <Ionicons name='md-close' size={24} color={Colors.primary}/>
                </TouchableOpacity>
                <Text style={{color:text, fontFamily:'open-sans-bold'}}>Create an Announcement</Text>
                <TouchableOpacity onPress={!image ? handlePostNoImg : handlePost} disabled={!body.trim().length}>
                    <Text style={{fontWeight:'500', color: !body.trim().length || !subject.trim().length ? Colors.disabled : Colors.primary}}>Post</Text>
                </TouchableOpacity>
            </View>

            <ScrollView>
                <View style={styles.inputContainer}>
                    <Image source={{uri: userImage}} style={styles.avatar}/>
                    <View style={{flex: 1, flexDirection: 'column'}}>
                        <TextInput
                            autoFocus={true}
                            numberOfLines={2}
                            maxLength={50}
                            placeholder={'Subject'}
                            placeholderTextColor={Colors.placeholder}
                            onSubmitEditing={() => announcementInput.current.focus()}
                            style={{justifyContent:'center', borderWidth: 1, borderColor: Colors.primary, borderRadius: 50, width: '100%', padding: 10}}
                            onChangeText={text => {setSubject(text)}}
                            value={subject}
                            returnKeyType='next'
                            // returnKeyLabel='Next' - ANDROID
                        />
                        <View style={{flexDirection:'row'}}>
                            <TextInput
                                ref={announcementInput}
                                multiline={true} 
                                numberOfLines={4} 
                                style={{flex: 7, marginTop: 5, padding: 10, color:text,}}
                                placeholder={'Announcement'}
                                placeholderTextColor={Colors.placeholder}
                                onChangeText={text => {
                                    setBody(text)
                                }}
                                value={body}
                            />
                            <TouchableOpacity 
                                style={{flex: 1, alignItems: 'flex-end', marginTop: 10}}
                                onPress={pickImage}
                            >
                                <FontAwesome name='image' size={26} color={Colors.placeholder}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>


                <View style={{marginHorizontal: 32, marginTop: 10, height: '100%',}}>
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
                                <Image source={{uri: image}} style={styles.lightboxImage} resizeMode='contain' />
                            )}
                        >
                            <ImageBackground source={{uri: image}} imageStyle={{borderRadius:12}} style={{width: '100%', height: '100%', alignItems:'flex-end'}}>
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
        </SafeAreaView>

            
    )
}


CreateAnnouncementScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Create a Post'
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        // justifyContent: 'center'
    },
    lightboxImage: {
        width: SCREEN_WIDTH * 0.9,
        height: SCREEN_HEIGHT * 0.9 - BASE_PADDING,
        alignSelf: 'center',
        borderRadius: 5,
        marginVertical: 10,
    },
    closeButton: {
        color: 'white',
        backgroundColor: 'gray',
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
        margin: 20,
        flexDirection: 'row',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16
    },
})


export default CreateAnnouncementScreen