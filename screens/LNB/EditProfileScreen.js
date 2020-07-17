import React, { useCallback, useEffect, useState, useReducer} from 'react'
import { 
    Platform,
    SafeAreaView,
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
    Switch
} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import Input from '../../components/UI/Input'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
// REDUX
import { updateProfile } from '../../redux/actions/authActions'
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import HeaderButtonDisabled from '../../components/UI/HeaderButtonDisabled'

import UserPermissions from '../../util/UserPermissions'
import * as ImagePicker from 'expo-image-picker'
import { Alert } from 'react-native'

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
const EditProfileScreen = props => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState()
    const auth = useSelector(state => state.auth)
    const authWebsite = useSelector(state => state.auth.credentials.website)
    
    const [isInstagram, setIsInstagram] = useState(authWebsite.includes('instagram.com') ? true : false)
    const [isTwitter, setIsTwitter] = useState(authWebsite.includes('twitter.com') ? true : false)
    const [isLinkedIn, setIsLinkedIn] = useState(authWebsite.includes('linkedin.com') ? true : false)
    const [isWebsite, setIsWebsite] = useState(
        !authWebsite.includes('instagram.com') && 
        !authWebsite.includes('linkedin.com') && 
        !authWebsite.includes('twitter.com') && 
        authWebsite !== '' ? true : false)
    const [linkLabel, setLinkLabel] = useState('Link')
    
    const dispatch = useDispatch()
    
    const [profilePic, setProfilePic] = useState(auth.credentials.imageUrl)

    // FORM VALIDATION - INITIAL STATE
    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            headline: auth.credentials.headline,
            location: auth.credentials.location,
            bio: auth.credentials.bio,
            website: authWebsite.includes('instagram') ? authWebsite.substring(22) : 
                    (authWebsite.includes('linkedin') ? authWebsite.substring(24) : authWebsite)
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
        console.log(formState.inputValues.website)
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

    const toggleInstagram = () => {
        setIsInstagram(!isInstagram)
        if (!isInstagram) {
            setIsLinkedIn(false)
            setIsWebsite(false)
        } else setLinkLabel('Link')
    }
    const toggleLinkedIn = () => {
        setIsLinkedIn(!isLinkedIn)
        if (!isLinkedIn) {
            setIsInstagram(false)
            setIsWebsite(false)
        } else setLinkLabel('Link')
        
    }
    const toggleWebsite = () => {
        setIsWebsite(!isWebsite)
        if (!isWebsite) {
            setIsInstagram(false)
            setIsLinkedIn(false)
        } else setLinkLabel('Link')
    }


    const submitHandler = useCallback(async () => {
        if ((isInstagram || isLinkedIn) && formState.inputValues.website.includes('.com/')) {
            Alert.alert("You're doing too much!", 'All you need to provide is your username for this link. Try again.', [
                { text: 'Okay'}
            ])
            return
        }
        if (!formState.formIsValid) {
            Alert.alert('Invalid Information', 'Please check for errors', [
                { text: 'Okay' }
            ])
            return
        }
        setError(null)
        setIsLoading(true)
        try {
            let linkInput
            if (isWebsite) {
                linkInput = formState.inputValues.website
            } else if (isInstagram) {
                linkInput = 'instagram.com/' + formState.inputValues.website.replace(' ','')
            } else if (isLinkedIn) {
                linkInput = 'linkedin.com/in/' + formState.inputValues.website.replace(' ','')
            } else if (!isInstagram && !isLinkedIn && !isWebsite) {
                linkInput = ''
            }
            console.log(isInstagram)
            console.log(isLinkedIn)
            console.log(isWebsite)
            await dispatch(updateProfile(
                formState.inputValues.headline,
                formState.inputValues.location,
                formState.inputValues.bio,
                linkInput,
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
        
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        onPress={() => {props.navigation.goBack()}}
                        title='Back'
                        // iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        iconName='md-close'
                        buttonStyle={{marginLeft: 15}}
                    />
                </HeaderButtons>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                {(formState.inputValues.headline === '') || (formState.inputValues.bio === '') || (formState.inputValues.location === '') ? (
                    <HeaderButtons HeaderButtonComponent={HeaderButtonDisabled}>
                        <Item
                            title='Save'
                            iconName={Platform.OS==='android' ? 'md-checkmark' : 'ios-checkmark-circle-outline'}
                            // onPress={submitHandler}
                        />
                    </HeaderButtons>
                ) : (
                    <HeaderButtons HeaderButtonComponent={HeaderButton}>
                        <Item
                            title='Save'
                            iconName={Platform.OS==='android' ? 'md-checkmark' : 'ios-checkmark-circle-outline'}
                            onPress={submitHandler}
                        />
                    </HeaderButtons>
                )}
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
                                    errorText='Please enter your bio (150 character max)'
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

                                <View style={{flexDirection:'column'}}>
                                    <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                                        <View style={{flexDirection:'column'}}>
                                            <Text style={styles.label}>Instagram</Text>
                                            <Switch
                                                style={{marginTop: 10}}
                                                value={isInstagram}
                                                onValueChange={toggleInstagram}
                                                trackColor={{false: Colors.darkSearch, true: Colors.primary}}
                                                thumbColor={Colors.lightHeader}
                                            />
                                        </View>
                                        <View style={{flexDirection:'column'}}>
                                            <Text style={styles.label}>LinkedIn</Text>
                                            <Switch
                                                style={{marginTop: 10}}
                                                value={isLinkedIn}
                                                onValueChange={toggleLinkedIn}
                                                trackColor={{false: Colors.darkSearch, true: Colors.primary}}
                                                thumbColor={Colors.lightHeader}
                                            />
                                        </View>
                                        <View style={{flexDirection:'column'}}>
                                            <Text style={styles.label}>Website</Text>
                                            <Switch
                                                style={{marginTop: 10}}
                                                value={isWebsite}
                                                onValueChange={toggleWebsite}
                                                trackColor={{false: Colors.darkSearch, true: Colors.primary}}
                                                thumbColor={Colors.lightHeader}
                                            />
                                        </View>
                                    </View>
                                </View>

                                {isLinkedIn && (
                                    <Text style={styles.labelLinkedIn}>LINK (enter only your LinkedIn username)</Text>
                                )}
                                {isInstagram && (
                                    <Text style={styles.labelLinkedIn}>LINK (enter only your Instagram username)</Text>
                                )}
                                {isWebsite && (
                                    <Text style={styles.label}>LINK</Text>
                                )}

                                {/* {!isLinkedIn && !isInstagram && !isWebsite && (
                                    <Text style={{...styles.label, color:'red'}}>Please selected one link to share</Text>
                                )} */}
                                {isInstagram && <View style={{flexDirection:'row'}}>
                                    <View style={{flexDirection: 'row', alignItems: 'flex-start', alignSelf:'center'}}>
                                        <MaterialCommunityIcons 
                                            name='instagram' 
                                            size={24}
                                            color='#C13584'
                                            style={{marginRight:3}}
                                        />
                                        <Text style={{color:Colors.disabled, alignSelf:'center', fontWeight: 'bold', fontSize: 16, marginRight: 5}}>@</Text>
                                    </View>
                                    <View style={{flex:1}}>
                                        <Input
                                            id='website'
                                            website
                                            errorText='Please enter a valid website'
                                            keyboardType='default'
                                            autoCapitalize='none'
                                            autoCorrect
                                            returnKeyType='done'
                                            onInputChange={inputChangeHandler}
                                            initialValue={authWebsite.includes('instagram') ? authWebsite.substring(22) : ''}
                                            initiallyValid={!!auth.credentials}
                                            required
                                        />
                                    </View>
                                </View>}
                                {isLinkedIn && <View style={{flexDirection:'row'}}>
                                    <View style={{flexDirection: 'row', alignItems: 'flex-start', alignSelf:'center'}}>
                                        <MaterialCommunityIcons 
                                            name='linkedin-box' 
                                            size={24}
                                            color='#2867B2'
                                            // style={{marginRight:3}}
                                        />
                                        <Text style={{color:Colors.disabled, alignSelf:'center', fontWeight: 'bold', fontSize: 16, marginRight: 5}}>/</Text>
                                    </View>
                                    <View style={{flex:1}}>
                                        <Input
                                            id='website'
                                            website
                                            errorText='Please enter a valid website'
                                            keyboardType='default'
                                            autoCapitalize='none'
                                            autoCorrect
                                            returnKeyType='done'
                                            onInputChange={inputChangeHandler}
                                            initialValue={authWebsite.includes('linkedin') ? authWebsite.substring(24) : ''}
                                            initiallyValid={!!auth.credentials}
                                            required
                                        />
                                    </View>
                                </View>}
                                {isWebsite && <View style={{flexDirection:'row'}}>
                                    <Ionicons 
                                        name='md-link' 
                                        size={24}
                                        color={Colors.blue}
                                        style={{marginRight: 5, alignSelf: 'center'}}
                                    />
                                    <View style={{flex:1}}>
                                        <Input
                                            id='website'
                                            website
                                            errorText='Please enter a valid website'
                                            keyboardType='default'
                                            autoCapitalize='none'
                                            autoCorrect
                                            returnKeyType='done'
                                            onInputChange={inputChangeHandler}
                                            initialValue={(!authWebsite.includes('instagram') && !authWebsite.includes('linkedin')) ? authWebsite : ''}
                                            initiallyValid={!!auth.credentials}
                                            required
                                        />
                                    </View>
                                </View>}

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity 
                                        style={{...styles.button, marginTop: 20, backgroundColor: Colors.placeholder}} 
                                        onPress={() => props.navigation.goBack()}
                                    >
                                        <Text style={{color:'white', fontWeight:'500'}}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity 
                                        style={
                                            (formState.inputValues.headline === '') || (formState.inputValues.bio === '') || (formState.inputValues.location === '') ?
                                            {...styles.disabledButton, marginTop: 20} : {...styles.button, marginTop: 20}
                                        } 
                                        onPress={submitHandler}
                                        disabled={(formState.inputValues.headline === '') || (formState.inputValues.bio === '') || (formState.inputValues.location === '')}
                                    >
                                        <Text style={{
                                            color: (formState.inputValues.headline === '') || (formState.inputValues.bio === '') || (formState.inputValues.location === '') ?
                                                    'gray' : 'black',
                                            fontWeight:'500'}}>Save Changes</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>

            
    )
}


EditProfileScreen.navigationOptions = (navData) => {
    const background = navData.screenProps.theme
    return {
        headerTitle: 'EditProfile',
        headerStyle: {
            backgroundColor: background === 'dark' ? 'black' : 'white',
            borderBottomColor: Colors.primary
        },
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
        paddingVertical: 12,
        backgroundColor: themeColor,
        borderBottomColor: Colors.primary,
        // borderBottomWidth: StyleSheet.hairlineWidth
    },
    header2: {
        // borderBottomWidth: 0.5,
        // shadowColor: Colors.primary,
        // shadowOffset: {height: 5},
        // shadowRadius: 15,
        // shadowOpacity: 0.26,
        // zIndex: 10
    },
    label: {
        color: '#8A8F9E',
        marginTop: 15,
        fontSize: 12,
        textTransform: 'uppercase'
    },
    labelLinkedIn: {
        color: '#8A8F9E',
        marginTop: 15,
        fontSize: 12,
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
        marginHorizontal: 30,
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
    },
    disabledButton: {
        marginHorizontal: 30,
        backgroundColor: 'rgba(251, 188, 4, 0.3)',
        borderRadius: 4,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    }
})
export default EditProfileScreen