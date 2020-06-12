import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { authenticate, getAuthenticatedUser } from '../redux/actions/authActions' 
import { StyleSheet, View, ActivityIndicator, AsyncStorage } from 'react-native'
import Colors from '../constants/Colors'
import * as firebase from 'firebase'
import jwtDecode from 'jwt-decode'
import { saveDataToStorage } from '../redux/actions/authActions'
// import { db } from '../Firebase/Firebase'

const db = firebase.firestore()
const LoadingScreen = props => {
    const dispatch = useDispatch()
    
    useEffect(() => {
        const tryLogin = async () => {
            
            firebase.auth().onAuthStateChanged(async user => {
                if (user) {
                    // let token, userId, expDate
                    const authData = await AsyncStorage.getItem('authData')
                    if (authData) {
                        const transformedData = JSON.parse(authData)
                        const {token, userId} = transformedData
                        dispatch(authenticate(token, userId))
                    } else {
                        const token = await user.getIdToken()
                        const userId = user.uid
                        const expDate = new Date(jwtDecode(token).exp * 1000)
                        saveDataToStorage(token, userId, expDate)
                    }
                    db.doc(`/users/${user.uid}`)
                        .get()
                        .then(userDoc => {
                            if (userDoc.exists) {
                                const {userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, outgoingRequests, messages, isAdmin, lastReadAnnouncements} = userDoc.data()
                                dispatch(getAuthenticatedUser(userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, outgoingRequests, messages, isAdmin, lastReadAnnouncements))
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