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
    ActivityIndicator,
    Dimensions,
} from 'react-native'
import { Formik, Form, Field, useFormik } from 'formik'
import { handleTextInput, withNextInputAutoFocusInput, withNextInputAutoFocusForm } from 'react-native-formik'
import { TextField, OutlinedTextField, FilledTextField } from 'react-native-material-textfield'
import * as Yup from 'yup'
import { compose } from 'recompose'
import Hide from 'react-native-hide-with-keyboard'
import KeyboardSpacer from 'react-native-keyboard-spacer'


import { LinearGradient } from 'expo-linear-gradient'

import { useDispatch, useSelector } from 'react-redux'
import { signup, login, logout, updateProfile } from '../../redux/actions/authActions'

import TouchableCmp from '../../components/LNB/TouchableCmp'

import Input from '../../components/UI/Input'
import Card from '../../components/UI/Card'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import * as firebase from 'firebase'
import { Ionicons } from '@expo/vector-icons'

import UserPermissions from '../../util/UserPermissions'
import * as ImagePicker from 'expo-image-picker'



const validationSchema = Yup.object().shape({
    email: Yup.string().required('Please enter a valid email').email('Please enter a valid email'),
    password: Yup.string().required('Password must be at least 8 characters').min(8, 'Password must be at least 8 characters'),
    firstName: Yup.string().required('Please enter your first name').min(2, 'Must be longer than 2 characters').max(30, 'This seems a little too long...'),
    lastName: Yup.string().required('Please enter your last name').min(2, 'Must be longer than 2 characters').max(30, 'This seems a little too long...'),
    headline: Yup.string().required('Please enter your headline or job title').min(3, 'Headline must be at least 3 characters').max(30, 'Try keeping your headline under 30 characters'),
    location: Yup.string().required('Please enter your location').min(2, 'Location should be at least 2 characters').max(30, 'Try shortening your location to under 30 characters'),
    bio: Yup.string().required('Please provide a short bio').min(6, 'Your bio should be at least 6 characters long').max(150, 'Try shortening your bio to 150 characters at most'),
    link: Yup.string().notRequired(),
})

const initialValues = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    headline: '',
    location: '',
    bio: '',
    link: '',
}

const SCREEN_WIDTH = Dimensions.get('screen').width
let text, color
const RegisterScreen = props => {
    
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        color = 'white'
    } else {
        color = 'black'
    }
    

    const MyInput = compose(
        handleTextInput,
        withNextInputAutoFocusInput
    )(TextField)

    const Form = withNextInputAutoFocusForm(View)

    const authHandler = async (values) => {
        
    }  

    return (
        <View style={styles.screen}>
            <Formik
                onSubmit={values => console.log(values)}
                validationSchema={validationSchema}
                initialValues={initialValues}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => 
                    <Form style={{width: SCREEN_WIDTH*0.5,}}>
                        <MyInput 
                            label='Location' 
                            name='location' 
                            type='location' 
                            tintColor={Colors.primary} 
                            containerStyle={{marginVertical: 10}} 
                        />
                        <MyInput 
                            label='Bio' 
                            name='bio' 
                            type='name' tintColor={Colors.primary} 
                            containerStyle={{marginVertical: 10}} 
                            multiline
                            characterRestriction={150}
                            maxLength={150}
                        />
                        <MyInput 
                            label='Link (optional)' 
                            name='link' 
                            type='name' 
                            tintColor={Colors.primary} 
                            containerStyle={{marginVertical: 10}}
                            autoCapitalize='none'
                        />
                        
                        <Button onPress={handleSubmit} title='Sign Up' />
                    </Form>
                }
            </Formik>
        </View>
    )
}


RegisterScreen.navigationOptions = {
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
      width: 40,
    },
    textField: {
        marginVertical: 30
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

export default RegisterScreen