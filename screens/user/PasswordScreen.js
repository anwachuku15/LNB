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
    TouchableOpacity, 
    TouchableNativeFeedback,
    KeyboardAvoidingView, 
    StyleSheet, 
    Button, 
    ActivityIndicator
} from 'react-native'
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
import { Ionicons } from '@expo/vector-icons'

import UserPermissions from '../../util/UserPermissions'
import * as ImagePicker from 'expo-image-picker'

import * as firebase from 'firebase'
import { signInWithGoogleAsync, loginWithApple } from '../../util/authFlow'
import * as AppleAuthentication from 'expo-apple-authentication'

// import * as Facebook from 'expo-facebook'

// import * as WebBrowser from 'expo-web-browser'
// import { makeRedirectUri, ResponseType, useAuthRequest, useAutoDiscovery } from 'expo-auth-session'
// import useNonce from '../../hooks/useNonce'
const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE'
// FORM VALIDATION REDUCER
const formReducer = (state, action) => {
    if (action.type === FORM_INPUT_UPDATE) {

        const updatedValues = {
            ...state.inputValues,
            [action.input]: action.value
        }
        const updatedValidities = {
            ...state.inputValidities,
            [action.input]: action.isValid
        }
        let updatedFormIsValid = true
        for (const key in updatedValidities) {
            updatedFormIsValid = updatedFormIsValid && updatedValidities[key]
        }
        
        let newValues = {}
        for (const key in updatedValues) {
            newValues[key] = updatedValues[key].trimStart()
        }

        return {
            ...state,
            formIsValid: updatedFormIsValid,
            inputValues: newValues,
            inputValidities: updatedValidities,
        }
    }
    return state
}

// WebBrowser.maybeCompleteAuthSession();

const SCREEN_WIDTH = Dimensions.get('screen').width
const SCREEN_HEIGHT = Dimensions.get('screen').height
let text
const PasswordScreen = props => {
    

    const [isSignup, setIsSignup] = useState(false)
    const [error, setError] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const [profilePic, setProfilePic] = useState()
    const dispatch = useDispatch()
    
    const email = props.navigation.getParam('email')
    const displayName = props.navigation.getParam('displayName')
    
     // FORM REDUCER - INITIAL STATE
    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            fname: '',
            lname: '',
            headline: '',
            email: '',
            password: ''
        }, 
        inputValidities: {
            fname: false,
            lname: false,
            headline: false,
            email: false,
            password: false
        }, 
        formIsValid: false,
    })

    useEffect(() => {
        if (error) {
            Alert.alert(
                'Error', 
                error, 
                [{text: 'Okay', style: 'cancel'}]
            )
        }
    }, [error])

    

    const authHandler = async () => {
        signup(email, userPassword, displayName)
        setError(null)
        setIsLoading(true)
        try {
            await dispatch(action)
            // props.navigation.navigate('App')
            if (isSignup) {
                props.navigation.navigate('Onboarding')
            } else {
                props.navigation.navigate('App')
            }
        } catch (err) {
            setError(err.message)
            setIsLoading(false)
        }
    }   

    const inputChangeHandler = useCallback(
        (inputType, inputValue, inputValidity) => {
            dispatchFormState({
                type: FORM_INPUT_UPDATE,
                value: inputValue,
                input: inputType,
                isValid: inputValidity,
            })
            
    }, [dispatchFormState])

    const chooseProfilePicture = async () => {
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
    
    const scheme = useColorScheme()
    let switchButton, background, inputColor, placeholder
    
    if(scheme === 'dark') {
        inputColor = Colors.darkInput
        placeholder = '#AFAFAF'
        text = 'white'
        switchButton = Colors.tan
        background = '#1B1B1B'
    } else {
        inputColor = Colors.lightInput
        placeholder = Colors.placeholder
        text = 'black'
        switchButton = '#414959'
        background = 'white'
    }

    const [userPassword, setUserPassword] = useState('')

    const signupHandler = () => {
        dispatch(signup(email, userPassword, displayName))
    }
    return (
        // <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={Platform.OS === 'android' ? -200 : 50} style={{backgroundColor: background, ...styles.screen}}>
            <View style={{...styles.screen, backgroundColor: background}}>

            <View style={styles.authContainer}>
                {/* <ScrollView> */}
                    
                    <Text style={{alignSelf: 'center', fontWeight: 'bold', color: Colors.primary, fontSize: 20, marginBottom: 30}}>Choose a password</Text>
                    <Text style={{alignSelf:'center', color: Colors.placeholder, marginBottom: 10}}>Must be 8 characters or more</Text>
                    <TextInput 
                        style={{
                            ...styles.input,
                            backgroundColor: inputColor
                        }}
                        id='password' 
                        placeholder='Password'
                        placeholderTextColor={placeholder}
                        keyboardType='default'
                        secureTextEntry
                        minLength={8} 
                        autoCapitalize='none' 
                        errorText='Please enter a valid password, at least 8 characters' 
                        onChangeText={text => setUserPassword(text)}
                        initialValue=''
                    />
                    
                    <View style={{
                        ...styles.buttonContainer,
                        opacity: userPassword.length < 8 ? 0.4 : 1
                    }}>
                        <TouchableOpacity 
                            disabled={userPassword.length < 8}
                            style={{...styles2.button, ...{marginTop: 10}}} 
                            onPress={signupHandler}
                        >
                            <Text style={{color:'white', fontWeight:'500'}}>Next</Text>
                        </TouchableOpacity>
                    </View>
                    
                {/* </ScrollView> */}
            </View>

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
    input: {
        marginVertical: 10,
        width: '100%',
        paddingHorizontal: 13,
        paddingVertical: 13,
        borderRadius: 10,
        backgroundColor: Colors.lightInput,
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
    avatarContainer: {
        // flex: 1,
        width: 100,
        height: 100,
        backgroundColor: '#E1E2E6',
        borderRadius: 50,
        marginTop: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    avatar: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    authContainer: {
        marginTop: SCREEN_HEIGHT*0.1,
        width: '80%',
        maxWidth: 400,
        paddingHorizontal: 30
    },
    buttonContainer: {
        marginTop: 10
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
        marginHorizontal: 30,
        backgroundColor: Colors.primary,
        borderRadius: 4,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    }
})

export default PasswordScreen