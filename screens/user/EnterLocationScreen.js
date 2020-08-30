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
import { TextField } from 'react-native-material-textfield'

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

const EnterLocationScreen = props => {
    
    const [error, setError] = useState()
    const [isLoading, setIsLoading] = useState(false)
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

   
    const [location, setLocation] = useState('')

    const textChangeHandler = text => {
        setLocation(text)
    }

    const updateHeadline = () => {
        console.log(headline)
    }
    return (
        // <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={Platform.OS === 'android' ? -200 : 50} style={{backgroundColor: background, ...styles.screen}}>
            <View style={{...styles.screen, backgroundColor: background}}>
                <View style={styles.authContainer}>
                    {/* <ScrollView> */}
                        
                        <Text style={{alignSelf: 'center', fontWeight: 'bold', color: text, fontSize: 20}}>Where do you live?</Text>
                        <Text style={{alignSelf: 'center', color: Colors.placeholder, marginTop: 15, marginBottom: 30}}>Enter your occupation or job title</Text>
                        
{/*                         
                        <Input
                            id='headline' 
                            placeholder='Headline (Entrepreneur, designer, etc.)' 
                            placeholderTextColor={placeholder}
                            keyboardType='default'
                            required 
                            autoCapitalize='words'
                            errorText='Please enter your headline'
                            initialValue=''
                        /> */}
        

                        <TextField
                            id='location' 
                            placeholder='Location (e.g. Los Angeles, CA)' 
                            // placeholderTextColor={C}
                            tintColor={Colors.primary}
                            textColor={text}
                            keyboardType='default'
                            autoCapitalize='sentences'
                            initialValue=''
                            characterRestriction={50}
                            baseColor={Colors.primary}
                            numberOfLines={3}
                            onChangeText={textChangeHandler}
                        />
                        
                    {/* </ScrollView> */}
                </View>

                <View style={{
                        ...styles.buttonContainer,
                        opacity: location.length < 2 ? 0.4 : 1
                }}>
                    <TouchableCmp 
                        disabled={location.length < 2}
                        style={{...styles2.button, ...{marginTop: 10}}} 
                        onPress={() => {}}
                    >
                        <Text style={{color:'white', fontWeight:'500', fontSize: 18}}>Next</Text>
                    </TouchableCmp>
                </View>

                <TouchableCmp 
                    style={{marginTop: 20,}}
                    onPress={() => props.navigation.navigate('CreateBio')}
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
        marginTop: SCREEN_HEIGHT*0.48
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

export default EnterLocationScreen