import React, { useState, useEffect } from 'react'
import { 
    View, 
    Text, 
    StyleSheet, 
    Image,
    TextInput,
    SafeAreaView
} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import { Ionicons } from '@expo/vector-icons'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import TouchableCmp from '../../components/LNB/TouchableCmp'
import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
import * as ImagePicker from 'expo-image-picker'
import { createComment } from '../../redux/actions/postsActions'

const CreateCommentScreen = props => {
    const scheme = useColorScheme()
    const needId = props.navigation.getParam('needId')
    const need = useSelector(state => state.posts.allNeeds.filter(need => need.id === needId))
    const user = need[0].userName

    const userName = useSelector(state => state.auth.credentials.displayName)
    const userImage = useSelector(state => state.auth.credentials.imageUrl)



    const dispatch = useDispatch()

    

    let text, background
    if (scheme === 'dark') {
        text = 'white'
        background = 'black'
    } else {
        text = 'black'
        background = 'white'
    }

    
    const [body, setBody] = useState('')
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
    

    const handlePost = async () => {
        try {
            await dispatch(createComment(needId, body, image))
            setBody('')
            setImage(null)
            props.navigation.goBack()
        } catch (err) {
            alert(err)
            console.log(err)
        }
    }

    


    return (
        
        <SafeAreaView style={{...styles.screen, backgroundColor: background}}>
            <View style={styles.header}>
                <TouchableCmp onPress={()=>props.navigation.goBack()}>
                    <Ionicons name='md-close' size={24} color={Colors.primary}/>
                </TouchableCmp>
                <Text style={{color:text, fontFamily:'open-sans-bold'}}>Reply to {user}</Text>
                <TouchableCmp onPress={handlePost}>
                    <Text style={{fontWeight:'500', color:text}}>Reply</Text>
                </TouchableCmp>
            </View>

            <View style={styles.inputContainer}>
                <Image source={{uri: userImage}} style={styles.avatar}/>
                <TextInput 
                    autoFocus={true} 
                    multiline={true} 
                    numberOfLines={4} 
                    style={{flex:1, color:text}}
                    placeholder={'Leave a reply'}
                    placeholderTextColor={'#838383'}
                    onChangeText={text => {
                        setBody(text)
                    }}
                    value={body}
                />
            </View>


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


CreateCommentScreen.navigationOptions = (navData) => {
    
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingVertical:12,
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


export default CreateCommentScreen