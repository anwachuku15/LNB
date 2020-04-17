import React, { useState, useReducer, useCallback, useEffect } from 'react'
import { ScrollView, Alert, Platform, View, Text, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, StyleSheet, Button, ActivityIndicator} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import { useDispatch, useSelector } from 'react-redux'
import { signup, login, logout } from '../../redux/actions/authActions'

import Input from '../../components/UI/Input'
import Card from '../../components/UI/Card'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import * as firebase from 'firebase'

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


let text

const AuthScreen = props => {
    
    const [isSignup, setIsSignup] = useState(false)
    const [error, setError] = useState()
    const [isLoading, setIsLoading] = useState(false)

    const dispatch = useDispatch()
    
     // FORM REDUCER - INITIAL STATE
    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            fname: '',
            lname: '',
            email: '',
            password: '',
            confirmPassword: ''
        }, 
        inputValidities: {
            fname: false,
            lname: false,
            email: false,
            password: false,
            confirmPassword: false
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
                formState.inputValues.fname, 
                formState.inputValues.lname
            )
        } else {
            action = login(formState.inputValues.email, formState.inputValues.password)
        }
        setError(null)
        setIsLoading(true)
        try {
            await dispatch(action)
            props.navigation.navigate('App')
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
    
    const colorScheme = useColorScheme()
    let switchButton
    
    if(colorScheme === 'dark') {
        text = 'white'
        switchButton = Colors.tan
    } else {
        text = 'black'
        switchButton = Colors.pastel
    }

    return (
        <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={50} style={styles.screen}>
            <Image source={require('../../assets/lnb.png')} resizeMode='contain' style={{maxWidth: '35%', maxHeight: '15%', marginBottom:20, marginTop: -100 }}/>
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
                    {isSignup ? (
                        <Input
                            confirmPassword 
                            id='confirmPassword' 
                            placeholder='Confirm Password' 
                            keyboardType='default'
                            secureTextEntry
                            required 
                            minLength={8} 
                            autoCapitalize='none' 
                            errorText='Make sure passwords match' 
                            onInputChange={inputChangeHandler}
                            initialValue=''
                        />
                    ) : (null)}
                    <View style={styles.buttonContainer}>
                        {/* <Button 
                            title={isSignup ? 'Sign Up' : 'Login'}
                            color={Colors.primary}
                            onPress={authHandler}
                        /> */}
                        <TouchableOpacity style={{...styles2.button, ...{marginTop: 10}}} onPress={authHandler}>
                            {isSignup ? (<Text style={{color:text, fontWeight:'500', fontFamily:'open-sans-bold'}}>Sign Up</Text>)
                                        : (<Text style={{color:text, fontWeight:'500'}}>Login</Text>)
                            }
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonContainer}>
                        {isLoading ? (
                            <ActivityIndicator size='small' color={Colors.primary} />
                        ) : ( 
                            <Button 
                                title={`Switch to ${isSignup ? 'Login' : 'Sign Up'}`} 
                                color={switchButton}
                                onPress={() => {
                                    setIsSignup(!isSignup)
                                    logout()
                                }}
                                // setIsSignup(prevState => !prevState)
                            />
                        )}
                    </View>
                </ScrollView>
            </Card>
        </KeyboardAvoidingView>

        // <View style={styles2.screen}>
        //     <Text style={styles2.greeting}>Welcome Back</Text>

        //     <View style={styles2.errMessage}>
        //         <Text>Error</Text>
        //     </View>

        //     <View style={styles2.form}>
        //         <View>
        //             <Text style={styles2.inputTitle}>Email Address</Text>
        //             <TextInput style={styles2.input} autoCapitalize='none'/>
        //         </View>
        //         <View style={{marginTop:32}}>
        //             <Text style={styles2.inputTitle}>Password</Text>
        //             <TextInput style={styles2.input} secureTextEntry autoCapitalize='none'/>
        //         </View>
        //     </View>

        //     {isSignup ? (
        //         <View>
        //             <TouchableOpacity style={styles2.button}>
        //                 <Text style={{color:text, fontWeight:'500'}}>Sign In</Text>
        //             </TouchableOpacity>

        //             <TouchableOpacity style={{alignSelf: 'center', marginTop:32}} onPress={() => {setIsSignup(!isSignup)}}>
        //                 <Text style={{color:text, fontSize:13}}>
        //                     New LNB Member? <Text style={{fontWeight: '500', color: Colors.primary}}>Sign Up</Text>
        //                 </Text>
        //             </TouchableOpacity>
        //         </View>
        //     ) : (
        //         <View>
        //             <TouchableOpacity style={styles2.button}>
        //                 <Text style={{color:text, fontWeight:'500'}}>Sign Up</Text>
        //             </TouchableOpacity>

        //             <TouchableOpacity style={{alignSelf: 'center', marginTop:32}} onPress={() => {setIsSignup(!isSignup)}}>
        //                 <Text style={{color:text, fontSize:13}}>
        //                     Returning LNB Member? <Text style={{fontWeight: '500', color: Colors.primary}}>Sign In</Text>
        //                 </Text>
        //             </TouchableOpacity>
        //         </View>
        //         )
        //     }
        // </View>
    )
}

AuthScreen.navigationOptions = {
    headerTitle: 'Sign In'
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    gradient: {
        // width: '100%',
        // height: '100%',
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