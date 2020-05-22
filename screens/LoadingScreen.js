import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { authenticate, getAuthenticatedUser } from '../redux/actions/authActions' 
import { StyleSheet, View, ActivityIndicator, AsyncStorage } from 'react-native'
import Colors from '../constants/Colors'
import * as firebase from 'firebase'
import jwtDecode from 'jwt-decode'

// import { db } from '../Firebase/Firebase'

const db = firebase.firestore()
const LoadingScreen = props => {
    const dispatch = useDispatch()
    
    useEffect(() => {
        const tryLogin = async () => {
            const authData = await AsyncStorage.getItem('authData')
            console.log('tryLogin')
            firebase.auth().onAuthStateChanged(async user => {
                if (authData) {
                    const transformedData = JSON.parse(authData)
                    const {token, userId, expDate} = transformedData
                    
                    dispatch(authenticate(token, userId))
                    db.doc(`/users/${userId}`)
                        .get()
                        .then(userDoc => {
                            if (userDoc.exists) {
                                const {userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages, isAdmin} = userDoc.data()
                                dispatch(getAuthenticatedUser(userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages, isAdmin))
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