import React, { useState, useEffect } from 'react'
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
    SafeAreaView
} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import { Ionicons } from '@expo/vector-icons'
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
import { createNeed, createNeedNoImg } from '../../redux/actions/postsActions'
import UserPermissions from '../../util/UserPermissions'
import TouchableCmp from '../../components/LNB/TouchableCmp'

const CreatePostScreen = props => {
    const scheme = useColorScheme()

    const userName = useSelector(state => state.auth.credentials.displayName)
    const userImage = useSelector(state => state.auth.credentials.imageUrl)
    const productId = props.navigation.getParam('productId')
    const selectedProduct = useSelector(state => state.products.availableProducts.find(prod => prod.id === productId))
    const dispatch = useDispatch()

    let text
    if (scheme === 'dark') {
        text = 'white'
    } else {
        text = 'black'
    }

    
    const [body, setBody] = useState('')
    const [image, setImage] = useState()

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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4,3]
        })

        if(!result.cancelled) {
            setImage(result.uri)
        }
    }
    

    const handlePost = async () => {
        try {
            await dispatch(createNeed(userName, body, image))
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
            await dispatch(createNeedNoImg(userName, body, ''))
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
                <Text style={{color:text, fontFamily:'open-sans-bold'}}>Share a Need</Text>
                <TouchableOpacity onPress={!image ? handlePostNoImg : handlePost} disabled={!body.trim().length && !image}>
                    <Text style={{fontWeight:'500', color: (!body.trim().length && !image) ? Colors.disabled : Colors.primary}}>Post</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <Image source={{uri: userImage}} style={styles.avatar}/>
                <TextInput 
                    autoFocus={true} 
                    multiline={true} 
                    numberOfLines={4} 
                    style={{flex:1, color:text}}
                    placeholder={'What do you need?'}
                    placeholderTextColor={'#838383'}
                    onChangeText={text => {
                        setBody(text)
                    }}
                    value={body}
                />
            </View>

            <TouchableOpacity 
                style={styles.photo}
                onPress={pickImage}
            >
                <Ionicons name='ios-camera' size={32} color={'#838383'}/>
            </TouchableOpacity>

            <View style={{marginHorizontal: 32, marginTop: 10, height: 150}}>
                {image ? (
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
                ) : (
                    null
                )}
            </View>
        </SafeAreaView>

            
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
        margin: 32,
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
        marginHorizontal: 32
    }
})


export default CreatePostScreen