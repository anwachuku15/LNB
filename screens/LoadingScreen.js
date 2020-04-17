import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { authenticate, getAuthenticatedUser } from '../redux/actions/authActions' 
import { StyleSheet, View, ActivityIndicator, AsyncStorage } from 'react-native'
import Colors from '../constants/Colors'
import * as firebase from 'firebase'
import { db } from '../Firebase/Firebase'


const LoadingScreen = props => {
    const dispatch = useDispatch()
    
    useEffect(() => {
        const tryLogin = async () => {
            const authData = await AsyncStorage.getItem('authData')
            firebase.auth().onAuthStateChanged(user => {
                if (authData) {
                    const transformedData = JSON.parse(authData)
                    const {token, userId, expDate} = transformedData
                        if (expDate < new Date() || !token || !userId) { 
                            props.navigation.navigate('Auth')
                            return
                        }
                    const expTime = new Date(expDate).getTime()
                    dispatch(authenticate(token, userId, expTime))
                    db.doc(`/users/${user.uid}`)
                        .get()
                        .then(userDoc => {
                            if (userDoc.exists) {
                                const {userId, email, displayName, imageUrl, location, bio, website, connections, messages, likes, notifications} = userDoc.data()
                                dispatch(getAuthenticatedUser(userId, email, displayName, imageUrl, location, bio, website, connections, messages, likes, notifications))
                                props.navigation.navigate('App')
                            } else {
                                props.navigation.navigate('Auth')
                            }
                        })
                } else {
                    props.navigation.navigate('Auth')
                }
                return
            })
        }

        tryLogin()
    }, [dispatch])

    return (
        <View style={styles.screen}>
            <ActivityIndicator size='large' color={Colors.primary} />
        </View>
    )
}


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default LoadingScreen