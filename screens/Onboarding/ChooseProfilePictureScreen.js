import React, { useState, useReducer, useCallback, useEffect } from 'react'
import { 
    Dimensions,
    ScrollView, 
    Alert, 
    Platform, 
    View, 
    Text, 
    TextInput, 
    Image, 
    TouchableWithoutFeedback,
    TouchableOpacity, 
    TouchableNativeFeedback,
    KeyboardAvoidingView, 
    StyleSheet, 
    Button, 
    ActivityIndicator,
    Animated,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { Divider, SocialIcon } from 'react-native-elements'
import { FontAwesome5 } from '@expo/vector-icons'
import TouchableCmp from '../../components/LNB/TouchableCmp'
import { LinearGradient } from 'expo-linear-gradient'

import { useDispatch } from 'react-redux'
import { signup, login, googleSignIn, appleLogin, logout} from '../../redux/actions/authActions'

import Input from '../../components/UI/Input'
import Card from '../../components/UI/Card'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'

import UserPermissions from '../../util/UserPermissions'
import * as ImagePicker from 'expo-image-picker'

import * as firebase from 'firebase'



const SCREEN_WIDTH = Dimensions.get('screen').width
const SCREEN_HEIGHT = Dimensions.get('screen').height
let text
const ChooseProfilePictureScreen = props => {
    

    const [error, setError] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const [profilePic, setProfilePic] = useState()
    const dispatch = useDispatch()
    
  

    useEffect(() => {
        if (error) {
            Alert.alert(
                'Error', 
                error, 
                [{text: 'Okay', style: 'cancel'}]
            )
        }
    }, [error])


    
    
    const scheme = useColorScheme()
    let switchButton, background
    
    if(scheme === 'dark') {
        text = 'white'
        switchButton = Colors.tan
        background = '#1B1B1B'
    } else {
        text = 'black'
        switchButton = '#414959'
        background = 'white'
    }

    const addPhotoSize = new Animated.Value(1)

    const pressAddPhoto = () => {
        Animated.timing(addPhotoSize, {
            toValue: 0.95,
            duration: 50
        }).start()
        // Haptics.impactAsync('medium')
    }



    const addPhotoStyle = {
        transform: [{
            scale: addPhotoSize
        }]
    }

    const chooseProfilePicture = async () => {
        Animated.timing(addPhotoSize, {
            toValue: 1,
            duration: 50
        }).start()

        UserPermissions.getCameraPermission()

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4,3]
        })
        if(!result.cancelled) {
            setProfilePic(result.uri)
        } 
    }

    return (
        // <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={Platform.OS === 'android' ? -200 : 50} style={{backgroundColor: background, ...styles.screen}}>
            <View style={{...styles.screen, backgroundColor: background}}>
                <View style={styles.authContainer}>
                    <Text style={{color: text, fontWeight: 'bold', fontSize: 20}}>Put a face to the name!</Text>
                    <Text style={{color: Colors.placeholder, marginTop: 15}}>Upload a profile picture</Text>

                    <View style={{alignItems: 'center', marginTop: 100}}>
                        <Image source={require('../../assets/no-img.png')} style={styles.avatar} />
                        <TouchableWithoutFeedback onPressIn={pressAddPhoto} onPressOut={chooseProfilePicture}>
                            <Animated.View style={[addPhotoStyle, {...styles.addPhotoContainer, backgroundColor: background}]}>
                                <MaterialIcons
                                    name='add-a-photo'
                                    color={Colors.primary}
                                    size={40}
                                />
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>

                <View style={{
                        ...styles.buttonContainer,
                        opacity: !profilePic ? 0.4 : 1
                }}>
                    <TouchableCmp 
                        disabled={!profilePic}
                        style={{...styles2.button, ...{marginTop: 10}}} 
                        onPress={() => props.navigation.navigate({
                            routeName: 'CreateHeadline',
                            params: {
                                profilePic: profilePic
                            }
                        })}
                    >
                        <Text style={{color:'white', fontWeight:'500', fontSize: 18}}>Next</Text>
                    </TouchableCmp>
                </View>

                <TouchableCmp 
                    style={{marginTop: 20,}}
                    onPress={() => props.navigation.navigate({
                        routeName: 'CreateHeadline',
                        params: {
                            profilePic: 'none'
                        }
                    })}
                >
                    <Text style={{color: Colors.primary, fontWeight: '500', fontSize: 18}}>Skip for now</Text>
                </TouchableCmp>

            </View>
        // </KeyboardAvoidingView>
    )
}



const styles = StyleSheet.create({
    screen: {
        flex: 1,
        // justifyContent: 'center',
        paddingTop: SCREEN_HEIGHT*0.05,
        alignItems: 'center',
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 55,
        borderRadius: 50,
        marginTop: 15,
        paddingHorizontal: 5,
        width: 330,
        shadowColor: 'black',
        shadowOpacity: 0.5,
        shadowOffset: {width: 0, height: 2},
        elevation: 5,
    },
    // avatarContainer: {
    //     // flex: 1,
    //     width: 300,
    //     height: 300,
    //     backgroundColor: '#E1E2E6',
    //     borderRadius: 50,
    //     marginTop: 48,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     marginBottom: 20
    // },
    avatar: {
        // position: 'absolute',
        width: SCREEN_WIDTH*0.75,
        height: SCREEN_WIDTH*0.75,
        borderRadius: (SCREEN_WIDTH*0.75) / 2,
    },
    addPhotoContainer: {
        position: 'absolute',
        bottom: -SCREEN_WIDTH*0.01,
        right: SCREEN_WIDTH*0.04,
        borderWidth: 2,
        borderColor: Colors.primaryDark,
        padding: 24,
        borderRadius: 50
    },
    authContainer: {
        alignItems: 'center',
        marginTop: SCREEN_HEIGHT*0.1,
        width: '80%',
        maxWidth: 400,
        // height: '50%',
        // maxHeight: 500,
        paddingHorizontal: 30
    },
    buttonContainer: {
        marginTop: SCREEN_HEIGHT*0.15,
    }
})

const styles2 = StyleSheet.create({
    screen: {
      flex: 1,
    },
    greeting: {
      marginTop: 32,
      fontSize: 18,
      fontWeight: '400',
      textAlign: 'center'
    },
    errMessage: {
      height: 72,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 30
    },
    form: {
      marginBottom: 48,
      marginHorizontal: 30
    },
    inputTitle: {
      color: Colors.primary,
      fontSize: 10,
      textTransform: 'uppercase',
      fontFamily: 'open-sans-bold'
    },
    input: {
      borderBottomColor: Colors.primary,
      borderBottomWidth: StyleSheet.hairlineWidth,
      height: 40,
      fontSize: 15,
      color: text
    },
    button: {
        paddingHorizontal: SCREEN_WIDTH*0.35,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    }
})

export default ChooseProfilePictureScreen