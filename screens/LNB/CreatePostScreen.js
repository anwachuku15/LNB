import React, { useState, useEffect } from 'react'
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    Button, 
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView
} from 'react-native'
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
import '@firebase/firestore'

const CreatePostScreen = props => {
    const scheme = useColorScheme()

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


    const [post, setPost] = useState('')
    const [image, setImage] = useState()

    useEffect(() => {
        getPhotoPermission()
    }, [getPhotoPermission])

    const getPhotoPermission = async () => {
        if (Constants.platform.ios) {
            const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)

            if(status != 'granted') {
                alert('We need permission to access your camera roll')
            }
        }
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4,3]
        })

        if(!result.cancelled) {
            setImage(result.uri)
        }
    }
    
    const handlePost = () => {
        Fire.shared
            .addPost({
                post: post.trim(), 
                localUri: image
            })
            .then(ref => {
                setPost('')
                setImage(null)
                props.navigation.goBack()
            })
            .catch(err => {
                alert(err)
                console.log(err)
            })
    }

    const handlePostNoImg = () => {
        console.log('no image')
        Fire.shared
            .addPost({
                post: post.trim()
            })
            .then(ref => {
                setPost('')
                setImage(null)
                props.navigation.goBack()
            })
            .catch(err => {
                alert(err)
                console.log(err)
            })
    }


    return (
        
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <TouchableOpacity onPress={()=>props.navigation.goBack()}>
                    <Ionicons name='md-close' size={24} color={Colors.primary}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={!image ? handlePostNoImg : handlePost}>
                    <Text style={{fontWeight:'500', color:text}}>Post</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <Image source={{uri: userImage}} style={styles.avatar}/>
                <TextInput 
                    autoFocus={true} 
                    multiline={true} 
                    numberOfLines={4} 
                    style={{flex:1, color:text}}
                    placeholder={'What\'s up?'}
                    placeholderTextColor={'#838383'}
                    onChangeText={text => {
                        setPost(text)
                    }}
                    value={post}
                />
            </View>

            <TouchableOpacity 
                style={styles.photo}
                onPress={pickImage}
            >
                <Ionicons name='ios-camera' size={32} color={'#838383'}/>
            </TouchableOpacity>

            <View style={{marginHorizontal: 32, marginTop: 32, height: 150}}>
                {image ? (
                    <Image source={{uri: image}} style={{width: '100%', height: '100%'}} />
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.primary
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