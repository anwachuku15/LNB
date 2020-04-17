import * as firebase from 'firebase'
import '@firebase/firestore'
import {config} from '../../Firebase/Fire'
import {AsyncStorage} from 'react-native'
import jwtDecode from 'jwt-decode'

export const AUTHENTICATE = 'AUTHENTICATE'
// export const SIGNUP = 'SIGNUP'
// export const LOGIN = 'LOGIN'
export const LOGOUT = 'LOGOUT'
export const SET_USER = 'SET_USER'

const db = firebase.firestore()

export const signup = (email, password, fname, lname ) => {
    return async dispatch => {
        let data, userId, idToken, expTime, expDate, displayName, noImg, imageUrl
        // ---- ADD NEW USER TO FIREBASE ---- //
        try {
            data = await firebase.auth().createUserWithEmailAndPassword(email, password)
        } catch (err) {
            console.log(err)
            throw err
        }
        userId = data.user.uid
        idToken = await data.user.getIdToken()
        expTime = jwtDecode(idToken).exp * 1000
        expDate = new Date(expTime)
        displayName = fname + ' ' + lname
        noImg = 'no-img.png'
        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`
        db.doc(`/users/${userId}`).set({
            userId: userId,
            createdAt: new Date().toISOString(),
            email: email,
            displayName: displayName,
            imageUrl: imageUrl,
            connections: 0,
            location: '',
            bio: '',
            website: '',
            messages: {},
            likes: [],
            notifications: []
        })
        saveDataToStorage(idToken, userId, expDate)
        dispatch(authenticate(idToken, userId, expTime))
        dispatch(getAuthenticatedUser(userId, email, displayName, imageUrl, '', '', '', 0, {}, [], []))
    }
}

export const login = (email, password) => {
    return async dispatch => {
        let data, userId, idToken, expTime, expDate, displayName, noImg, imageUrl
        try {
            data = await firebase.auth().signInWithEmailAndPassword(email, password)
        } catch (err) {
            console.log(err.code)
            throw new Error('Invalid credentials. Please try again.')
        }
        userId = data.user.uid
        idToken = await data.user.getIdToken()
        expTime = jwtDecode(idToken).exp * 1000;
        expDate = new Date(expTime)
        saveDataToStorage(idToken, userId, expDate)
        dispatch(authenticate(idToken, userId, expTime))
        const userDoc = await db.doc(`/users/${userId}`).get()
        if (userDoc.exists) {
            const { userId, email, displayName, imageUrl, location, bio, website, connections, messages, likes, notifications } = userDoc.data()
            dispatch(getAuthenticatedUser(userId, email, displayName, imageUrl, location, bio, website, connections, messages, likes, notifications))
        }
    }
}

export const authenticate = (token, userId, expTime) => {
    return dispatch => {
        dispatch(setLogoutTimer(expTime))
        dispatch({
            type: AUTHENTICATE,
            token: token,
            userId: userId
        })
    }
}

export const getAuthenticatedUser = (userId, email, displayName, imageUrl, location, bio, website, connections, messages, likes, notifications) => {
    return dispatch => {
        dispatch({
            type: SET_USER,
            credentials: {
                userId: userId,
                email: email,
                displayName: displayName,
                imageUrl: imageUrl,
                location: location,
                bio: bio,
                website: website
            },
            connections: connections,
            messages: messages,
            likes: likes,
            notifications: notifications
        })
    }
}

const saveDataToStorage = (token, userId, expDate) => {
    AsyncStorage.setItem('authData', JSON.stringify({
        token: token,
        userId: userId,
        expDate: expDate.toISOString()
    }))
}

let timer

const setLogoutTimer = exp => {
    return dispatch => {
        timer = setTimeout(() => {
            dispatch(logout())
        }, exp)
    }
}

const clearLogoutTimer = () => {
    if (timer) {
        clearTimeout(timer)
    }
}

export const logout = () => {
    clearLogoutTimer()
    AsyncStorage.removeItem('authData')
    return {type: LOGOUT }
}




