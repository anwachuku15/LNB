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
import { FontAwesome5, AntDesign } from '@expo/vector-icons'
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
import * as Google from 'expo-google-app-auth'
import ENV from '../../secrets/env'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'

const SCREEN_WIDTH = Dimensions.get('screen').width
const SCREEN_HEIGHT = Dimensions.get('screen').height
let text

const EmailScreen = props => {
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

    const isUserEqual = (googleUser, firebaseUser) => {
        if (firebaseUser) {
            const providerData = firebaseUser.providerData;
            for (let i = 0; i < providerData.length; i++) {
            if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                providerData[i].uid === googleUser.getBasicProfile().getId()) {
                // We don't need to reauth the Firebase connection.
                return true;
            }
            }
        }
        return false;
    }
    
    const onSignIn = (googleUser) => {
        // console.log('Google Auth Response', googleUser);
        // We need to register an Observer on Firebase Auth to make sure auth is initialized.
        const unsubscribe = firebase.auth().onAuthStateChanged(async firebaseUser => {
            unsubscribe();
            // Check if we are already signed-in Firebase with the correct user.
            if (!isUserEqual(googleUser, firebaseUser)) {
            // Build Firebase credential with the Google ID token.
            const credential = firebase.auth.GoogleAuthProvider.credential(
                googleUser.idToken,
                googleUser.accessToken
            )
            // Sign in with credential from the Google user.
            // let data
            try {
                const data = await firebase.auth().signInWithCredential(credential)
                
                await dispatch(googleSignIn(data, googleUser))
                if (data.additionalUserInfo.isNewUser) {
                    props.navigation.navigate('Onboarding')
                }
            } catch (err) {
                // console.log(err.message)
            }
            } else {
            console.log('User already signed-in Firebase.');
            }
        });
    }
    
    const signInWithGoogleAsync = async () => {
        try {
            const result = await Google.logInAsync({
                // androidClientId: YOUR_CLIENT_ID_HERE,
                behavior: 'web',
                iosClientId: ENV.google_ios_expo_client,
                iosStandaloneAppClientId: ENV.google_ios_app_client,
                scopes: ['profile', 'email'],
            });
        
        if (result.type === 'success') {
            onSignIn(result)
            return result.accessToken;
        } else {
            return { cancelled: true };
        }
        } catch (e) {
            return { error: true };
        }
    }
    
    const loginWithApple = async () => {
        const csrf = Math.random().toString(36).substring(2, 15)
        const nonce = Math.random().toString(36).substring(2, 10)
        const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce)
        const appleCredential = await AppleAuthentication.signInAsync({
            requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL
            ],
            state: csrf,
            nonce: hashedNonce
        })
        const { identityToken, email, state, fullName } = appleCredential
    
        if (identityToken) {
            const provider = new firebase.auth.OAuthProvider('apple.com')
            const credential = provider.credential({
                idToken: identityToken,
                rawNonce: nonce
            })
            const data = await firebase.auth().signInWithCredential(credential)
            
            const displayName = fullName.givenName + ' ' + fullName.familyName
            await dispatch(appleLogin(data, displayName))
            if (data.additionalUserInfo.isNewUser) {
                props.navigation.navigate('Onboarding')
            }
        }
    }

    // APPLE SIGN IN
    const [isLoginAvailable, setIsLoginAvailable] = useState(null)

    const loadAppleAuth = useCallback(async () => {
        const loginAvailable = await AppleAuthentication.isAvailableAsync()
        setIsLoginAvailable(loginAvailable)
    },[])

    useEffect(() => {
        loadAppleAuth()
    }, [loadAppleAuth])
    
    
    
    const [email, setEmail] = useState('')

    const textChangeHandler = text => {
        setEmail(text)
    }

    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const navToDisplayName = () => {
        props.navigation.navigate({
            routeName: 'DisplayName',
            params: {
                email: email
            }
        })
    }
    
    return (
        <View style={{...styles.screen, backgroundColor: background}}>
            <View style={styles.authContainer}>
                <Text style={styles.createAccountText}>Create your account</Text>
                
                <TextInput
                    style={{
                        ...styles.input,
                        backgroundColor: inputColor,
                    }}
                    id='email'
                    type='email'
                    placeholder='Email'
                    placeholderTextColor={placeholder}
                    keyboardType='email-address'
                    onChangeText={textChangeHandler}
                    autoCapitalize='none'
                />
                
                <View style={{
                    ...styles.buttonContainer,
                    opacity: !emailRegex.test(email) ? 0.4 : 1
                }}>
                    <TouchableOpacity 
                        disabled={!emailRegex.test(email)}
                        style={styles2.button}
                        onPress={navToDisplayName}
                    >
                        <Text style={{color:'white', fontWeight:'500'}}>Next</Text>
                    </TouchableOpacity>
                </View>
                
            </View>

            {/* ---OR--- */}
            <View style={{flexDirection: 'row', alignItems:'center'}}>
                <Divider style={{ backgroundColor: Colors.placeholder, width: 145, marginVertical: 30 }} />
                <Text style={{color:Colors.placeholder, marginHorizontal: 5}}>OR</Text>
                <Divider style={{ backgroundColor: Colors.placeholder, width: 145, marginVertical: 30 }} />
            </View>

            {/* SOCIAL AUTH */}
            <TouchableCmp
                // disabled={!request || !nonce}
                onPress={signInWithGoogleAsync}
                style={{...styles.socialButton, marginTop: 0, backgroundColor: '#4885ed',}}
            >
                <View style={{backgroundColor:'white', padding: 8, borderRadius: 50,}}>
                    <Image 
                        source={require('../../assets/googleicon.png')} 
                        resizeMode='contain' 
                        style={{width: 30, height: 30 }}
                    /> 
                </View>
                <Text style={{color: 'white', fontWeight:'bold', marginRight: 90}}>Sign up with Google</Text>
            </TouchableCmp>


            {isLoginAvailable && 
                <TouchableCmp
                    onPress={loginWithApple}
                    style={{...styles.socialButton, backgroundColor: 'black'}}
                >
                    <View style={{marginLeft: 10}}>
                        <FontAwesome5
                            name='apple'
                            size={30}
                            color='white'
                        />
                    </View>
                    <Text style={{color: 'white', fontWeight:'bold', marginRight: 97}}>Sign up with Apple</Text>
                </TouchableCmp>

                // <View style={{alignItems: 'center'}}>
                //     <AppleAuthentication.AppleAuthenticationButton
                //         buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}  
                //         buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                //         cornerRadius={5}
                //         style={{width: 250, height: 50, marginTop: 15}}
                //         onPress={loginWithApple}              
                //     />
                // </View>
            }
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
    createAccountText: {
        alignSelf: 'center', 
        fontWeight: 'bold', 
        color: Colors.primary, 
        fontSize: 20, 
        marginBottom: 30
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
        marginTop: 10,
    },
    input: {
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
        marginTop: 10,
    }
})

export default EmailScreen