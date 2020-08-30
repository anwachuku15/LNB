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
    ImageBackground,
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

import ENV from '../../secrets/env'
import * as Google from 'expo-google-app-auth';
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'

const SCREEN_WIDTH = Dimensions.get('screen').width
const SCREEN_HEIGHT = Dimensions.get('screen').height
const IntroScreen = props => {
    const scheme = useColorScheme()
    let background, text
    if(scheme === 'dark') {
        text = 'white'
        background = '#1B1B1B'
    } else {
        text = 'black'
        background = 'white'
    }
    return (
        <View style={{...styles.screen, backgroundColor: background}}>
            {/* <ImageBackground 
                source={require('../../assets/lnb.png')}
                resizeMode='contain'
                // imageStyle={{width:100, height:100}}
            /> */}
            <ImageBackground
                source={require('../../assets/lnb.png')}
                style={[
                    StyleSheet.absoluteFill, {
                        marginTop: SCREEN_HEIGHT*0.1,
                        marginBottom: SCREEN_HEIGHT*0.6,
                        width: SCREEN_WIDTH,
                        // opacity: 0.4,
                    },
                ]}
                resizeMode='contain'
                // blurRadius={10}
            />
            <View style={{marginTop: SCREEN_HEIGHT*0.2}}>
                {/* <View style={{width: SCREEN_WIDTH * 0.60, alignItems: 'center'}}>
                    <Image 
                        source={require('../../assets/lnb.png')} 
                        resizeMode='contain' 
                        style={{width:100, height:100}}
                    />
                </View> */}
                <View style={{alignItems: 'flex-start', marginTop: SCREEN_HEIGHT*0.2}}>
                    <Text style={{color: text, ...styles.lnb}}>LEAVE</Text>
                    <Text style={{color: text, ...styles.lnb}}>NORMAL</Text>
                    <Text style={{color: text, ...styles.lnb}}>BEHIND</Text>
                    <Text style={{color: text, ...styles.lnbCaption}}>The Modern Day Renaissance Movement</Text>
                    <TouchableCmp 
                        onPress={() => props.navigation.navigate('SignUp')}
                        style={styles.signUpButton}
                    >
                        <Text style={{color:'white', fontWeight:'bold'}}>Sign Up</Text>
                    </TouchableCmp>
                    <TouchableCmp onPress={() => props.navigation.navigate('Auth')} style={styles.signIn}>
                        <Text style={{color:Colors.placeholder}}>Already have an account? </Text>
                        <Text style={{color:Colors.primary}}>Sign In</Text>
                    </TouchableCmp>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
    },
    lnb: {
        fontSize: 40,
        fontFamily: 'MPLUSRounded1c_500Medium'
    },
    lnbCaption: {
        fontSize: 16,
        fontFamily: 'MPLUSRounded1c_300Light'
    },
    signUpButton: {
        alignSelf: 'center',
        marginTop: 30,
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        paddingHorizontal: SCREEN_WIDTH * 0.25,
        borderRadius: 10,
    },
    signIn: {
        flexDirection: 'row',
        alignSelf: 'center',
        bottom: -SCREEN_HEIGHT * 0.035
    },
})

export default IntroScreen