import React, { useState, useReducer, useCallback, useEffect, useRef, forwardRef } from 'react'
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

const DisplayNameScreen = props => {
    

    const [isSignup, setIsSignup] = useState(false)
    const [error, setError] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const [profilePic, setProfilePic] = useState()
    const dispatch = useDispatch()
    
    const email = props.navigation.getParam('email')
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

    // GOOGLE SIGN IN


    // APPLE SIGN IN
    const [isLoginAvailable, setIsLoginAvailable] = useState(null)

    const loadAppleAuth = useCallback(async () => {
        const loginAvailable = await AppleAuthentication.isAvailableAsync()
        setIsLoginAvailable(loginAvailable)
    },[])

    useEffect(() => {
        loadAppleAuth()
    }, [loadAppleAuth])
    
    
    

    const authHandler = async () => {
        let action
        if (isSignup) {
            action = signup(
                formState.inputValues.email, 
                formState.inputValues.password, 
                formState.inputValues.fname.trimEnd(), 
                formState.inputValues.lname.trimEnd(),
                formState.inputValues.headline.trimEnd(),
                profilePic
            )
        } else {
            action = login(formState.inputValues.email, formState.inputValues.password)
        }
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
    
    if (scheme === 'dark') {
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

    
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')

    
    return (
        // <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={Platform.OS === 'android' ? -200 : 50} style={{backgroundColor: background, ...styles.screen}}>
        <View style={{...styles.screen, backgroundColor: background}}>
            {/* EMAIL/PASSWORD AUTH */}
            <View style={styles.authContainer}>
                {/* <ScrollView> */}
                    
                    <Text style={{alignSelf: 'center', fontWeight: 'bold', color: Colors.primary, fontSize: 20, marginBottom: 30}}>What's your name?</Text>
                    <TextInput 
                        style={{
                            ...styles.input,
                            backgroundColor: inputColor,
                        }}
                        id='fname' 
                        placeholder='First Name' 
                        placeholderTextColor={placeholder}
                        keyboardType='default'
                        autoCapitalize='words' 
                        initialValue=''
                        onChangeText={text => setFirstName(text)}
                    />
                    <TextInput 
                        style={{
                            ...styles.input,
                            backgroundColor: inputColor,
                        }}
                        placeholder='Last Name'
                        placeholderTextColor={placeholder}
                        id='lname'
                        keyboardType='default'
                        autoCapitalize='words'
                        errorText='Please enter your last name'
                        initialValue=''
                        onChangeText={text => setLastName(text)}
                    />
                    
                    
                    <View style={{
                        ...styles.buttonContainer,
                        opacity: (!firstName.trim().length || !lastName.trim().length) ? 0.4 : 1
                    }}>
                        <TouchableOpacity 
                            disabled={firstName.trim().length === 0 || lastName.trim().length === 0}
                            style={styles2.button}
                            onPress={() => {
                                const displayName = firstName.trimEnd() + ' ' + lastName.trimEnd()
                                props.navigation.navigate({
                                    routeName: 'Password',
                                    params: {
                                        email: email,
                                        displayName: displayName
                                    }
                                })
                            }}
                        >
                            <Text style={{color:'white', fontWeight:'500'}}>Next</Text>
                        </TouchableOpacity>
                    </View>
                {/* </ScrollView> */}
            </View>


        </View>
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
        // height: '50%',
        // maxHeight: 500,
        paddingHorizontal: 30
    },
    buttonContainer: {
        marginTop: 10
    },
    input: {
        marginVertical: 10,
        width: '100%',
        paddingHorizontal: 13,
        paddingVertical: 13,
        borderRadius: 10,
        
    },
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
    button: {
        marginHorizontal: 30,
        backgroundColor: Colors.primary,
        borderRadius: 4,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    }
})

export default DisplayNameScreen