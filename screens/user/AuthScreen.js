import React, { useState, useReducer, useCallback, useEffect } from 'react'
import { 
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
import { LinearGradient } from 'expo-linear-gradient'

import { useDispatch } from 'react-redux'
import { signup, login } from '../../redux/actions/authActions'

import Input from '../../components/UI/Input'
import Card from '../../components/UI/Card'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { Ionicons } from '@expo/vector-icons'

import UserPermissions from '../../util/UserPermissions'
import * as ImagePicker from 'expo-image-picker'

import * as firebase from 'firebase'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri, ResponseType, useAuthRequest, useAutoDiscovery, generateHexStringAsync } from 'expo-auth-session'


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

WebBrowser.maybeCompleteAuthSession();

const useProxy = Platform.select({ web: false, default: true });

// Generate a random hex string for the nonce parameter


let text

const AuthScreen = props => {
    
    const [isSignup, setIsSignup] = useState(false)
    const [error, setError] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const [profilePic, setProfilePic] = useState()
    const dispatch = useDispatch()
    
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
    let switchButton
    
    if(scheme === 'dark') {
        text = 'white'
        switchButton = Colors.tan
    } else {
        text = 'black'
        switchButton = '#414959'
    }

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }

    return (
        <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={Platform.OS === 'android' ? -200 : 50} style={styles.screen}>
            {isSignup ? (
                <TouchableCmp 
                    onPress={chooseProfilePicture}
                    style={styles.avatarContainer} 
                >
                    <Image source={{uri: profilePic}} style={styles.avatar}/>
                    <Ionicons 
                        name='ios-camera'
                        size={30}
                        color={Colors.disabled}
                        style={{marginTop: 6, marginLeft: 2}}
                    />
                </TouchableCmp>
            ) : (
                <Image 
                    source={require('../../assets/lnb.png')} 
                    resizeMode='contain' 
                    style={{maxWidth: '35%', maxHeight: '15%', marginBottom:20, marginTop: -100 }}
                /> 
            )}
            <Card style={styles.authContainer}>
                <ScrollView>
                    {isSignup ? (
                        <Input
                            id='fname'
                            placeholder='First Name'
                            keyboardType='default'
                            required
                            autoCapitalize='words'
                            errorText='Please enter your first name'
                            onInputChange={inputChangeHandler}
                            initialValue=''
                        />
                    ) : (null)}
                    {isSignup ? (
                        <Input 
                            // label='Last Name'
                            placeholder='Last Name'
                            id='lname'
                            keyboardType='default'
                            required
                            autoCapitalize='words'
                            errorText='Please enter your last name'
                            onInputChange={inputChangeHandler}
                            initialValue=''
                        />
                    ) : (null)}
                    {isSignup ? (
                        <Input
                            id='headline' 
                            placeholder='Headline (Entrepreneur, designer, etc.)' 
                            keyboardType='default'
                            required 
                            autoCapitalize='words'
                            errorText='Please enter your headline'
                            onInputChange={inputChangeHandler}
                            initialValue=''
                        />
                    ) : (null)}
                    <Input 
                        id='email' 
                        placeholder='Email' 
                        keyboardType='email-address'
                        email 
                        required 
                        autoCapitalize='none' 
                        errorText='Please enter a valid email address' 
                        onInputChange={inputChangeHandler}
                        initialValue=''
                    />
                    <Input 
                        id='password' 
                        placeholder='Password' 
                        keyboardType='default'
                        secureTextEntry
                        required
                        minLength={8} 
                        autoCapitalize='none' 
                        errorText='Please enter a valid password, at least 8 characters' 
                        onInputChange={inputChangeHandler}
                        initialValue=''
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={{...styles2.button, ...{marginTop: 10}}} onPress={authHandler}>
                            {isSignup ? (<Text style={{color:text, fontWeight:'500'}}>Sign Up</Text>)
                                        : (<Text style={{color:text, fontWeight:'500'}}>Login</Text>)
                            }
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonContainer}>
                        {isLoading ? (
                            <ActivityIndicator size='small' color={Colors.primary} />
                        ) : ( 
                            <TouchableCmp 
                                onPress={() => {
                                    setIsSignup(!isSignup)
                                    // logout()
                                }} 
                                style={{alignSelf: 'center', marginTop: 10}}>
                                {isSignup ? (
                                    <Text style={{color: switchButton, fontSize: 13}}>
                                        Returning LNB Member? <Text style={{fontWeight:'500', color:Colors.primary}}>Log In</Text>
                                    </Text>
                                ) : (
                                    <Text style={{color: switchButton, fontSize: 13}}>
                                        New LNB Member? <Text style={{fontWeight:'500', color:Colors.primary}}>Sign Up</Text>
                                    </Text>
                                )}
                            </TouchableCmp>
                        )}
                    </View>
                </ScrollView>
            </Card>
        </KeyboardAvoidingView>
    )
}

AuthScreen.navigationOptions = {
    headerTitle: 'Leave Normal Behind'
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
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
        width: '80%',
        maxWidth: 400,
        // height: '50%',
        maxHeight: 500,
        padding: 30
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

export default AuthScreen