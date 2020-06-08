import React, { useCallback, useEffect, useState, useReducer} from 'react'
import { 
    Platform,
    View, 
    Text, 
    TextInput,
    StyleSheet, 
    Image, 
    Button, 
    ScrollView,
    TouchableOpacity,
    TouchableNativeFeedback,
    KeyboardAvoidingView,
    SafeAreaView
} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import Input from '../../components/UI/Input'
import { Ionicons } from '@expo/vector-icons'
// REDUX
import { updateProfile } from '../../redux/actions/authActions'
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'

import UserPermissions from '../../util/UserPermissions'
import * as ImagePicker from 'expo-image-picker'

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



let themeColor
let text
const OnboardingScreen = props => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState()
    
    
    
    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)
    
    const [profilePic, setProfilePic] = useState(auth.credentials.imageUrl)

    // FORM VALIDATION - INITIAL STATE
    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            headline: auth.credentials.headline,
            location: auth.credentials.location,
            bio: auth.credentials.bio,
            website: auth.credentials.website
        }, 
        inputValidities: {
            headline: true,
            location: true,
            bio: true,
            website: true
        }, 
        formIsValid: true,
    })

    // FORM VALIDATION ACTION
    // callback -> use effect in input componet
    const inputChangeHandler = useCallback((inputType, inputValue, inputValidity) => {
        dispatchFormState({
            type: FORM_INPUT_UPDATE,
            value: inputValue,
            input: inputType,
            isValid: inputValidity,
        })
    }, [dispatchFormState])

    useEffect(() => {
        if (error) {
            Alert.alert(
                'Error', 
                error, 
                [{text: 'Okay', style: 'cancel'}]
            )
        }
    }, [error])

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

    const submitHandler = useCallback(async () => {
        if (!formState.formIsValid) {
            Alert.alert('Invalid Information', 'Please check for errors', [
                { text: 'Okay' }
            ])
            return
        }
        setError(null)
        setIsLoading(true)
        try {
            console.log(formState.inputValues.location)
            await dispatch(updateProfile(
                formState.inputValues.headline,
                formState.inputValues.location,
                formState.inputValues.bio,
                formState.inputValues.website,
                profilePic
            ))
            props.navigation.goBack()
        } catch (err) {
            console.log(err)
        }
    }, [dispatch, formState, profilePic])

    const scheme = useColorScheme()
    let text
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
    } else {
        themeColor = 'white'
        text = 'black'
    }

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }
    return (
        
        <View style={styles.screen}>
            <View style={styles.header}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Direct'
                        iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        onPress={() => {props.navigation.goBack()}}
                    />
                </HeaderButtons>
                <Text style={styles.headerTitle}>LNB Onboarding</Text>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Save'
                        iconName={Platform.OS==='android' ? 'md-checkmark' : 'ios-checkmark-circle-outline'}
                        onPress={submitHandler}
                    />
                </HeaderButtons>
            </View>
            
            <KeyboardAvoidingView behavior='padding' style={{flex: 1}}>
                <ScrollView keyboardDismissMode='on-drag' showsVerticalScrollIndicator={false}>
                    <View style={{flex: 1, justifyContent: 'flex-start'}}>
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
                        
                        <View style={styles.form}>
                            <View>
                                <Input
                                    id='headline'
                                    label='Headline'
                                    errorText='Please enter a valid headline'
                                    keyboardType='default'
                                    autoCapitalize='sentences'
                                    autoCorrect
                                    returnKeyType='next'
                                    onInputChange={inputChangeHandler}
                                    initialValue={auth.credentials.headline}
                                    initiallyValid={!!auth.credentials}
                                    required
                                />

                                <Input
                                    id='bio'
                                    label='Bio'
                                    errorText='Please enter your bio (160 character max)'
                                    keyboardType='default'
                                    autoCapitalize='sentences'
                                    autoCorrect
                                    returnKeyType='next'
                                    onInputChange={inputChangeHandler}
                                    initialValue={auth.credentials.bio}
                                    initiallyValid={!!auth.credentials}
                                    required
                                    multiline
                                    numberOfLines={3}
                                />
                                <Input
                                    id='location'
                                    label='Location'
                                    errorText='Please enter a valid location'
                                    keyboardType='default'
                                    autoCapitalize='sentences'
                                    autoCorrect
                                    returnKeyType='next'
                                    onInputChange={inputChangeHandler}
                                    initialValue={auth.credentials.location}
                                    initiallyValid={!!auth.credentials}
                                    required
                                />

                                <Input
                                    id='website'
                                    website
                                    label='Website'
                                    errorText='Please enter a valid website'
                                    keyboardType='default'
                                    autoCapitalize='none'
                                    autoCorrect
                                    returnKeyType='next'
                                    onInputChange={inputChangeHandler}
                                    initialValue={auth.credentials.website}
                                    initiallyValid={!!auth.credentials}
                                    required
                                />

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity 
                                        style={{...styles.button, ...{marginTop: 20}}} 
                                        onPress={submitHandler}
                                    >
                                        <Text style={{color:text, fontWeight:'500'}}>Save Changes</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            
        </View>

            
    )
}


OnboardingScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'EditProfile'
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center'
    },
    inner: {
        padding: 24,
        flex: 1,
        justifyContent: "flex-end",
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingTop: 49,
        paddingBottom: 16,
        backgroundColor: themeColor,
        borderBottomColor: Colors.primary,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    header2: {
        // borderBottomWidth: 0.5,
        // shadowColor: Colors.primary,
        // shadowOffset: {height: 5},
        // shadowRadius: 15,
        // shadowOpacity: 0.26,
        // zIndex: 10
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500'
    },
    avatarContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#E1E2E6',
        borderRadius: 50,
        marginTop: 48,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20
    },
    avatar: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    form: {
        marginBottom: 48,
        marginHorizontal: 30
    },
    buttonContainer: {
        marginHorizontal: 10
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
export default OnboardingScreen