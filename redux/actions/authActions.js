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
export const SET_SELECTED_USER = 'SET_SELECTED_USER'
export const SET_CONNECT_REQUEST = 'SET_CONNECT_REQUEST'

const db = firebase.firestore()

export const signup = (email, password, fname, lname, headline) => {
    return async dispatch => {
        let data, userId, idToken, expTime, expiresIn, expDate, displayName, noImg, imageUrl
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
        expiresIn = expTime - ((new Date()).getTime())
        displayName = fname + ' ' + lname
        noImg = 'no-img.png'
        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`
        db.doc(`/users/${userId}`).set({
            userId: userId,
            createdAt: new Date().toISOString(),
            email: email,
            displayName: displayName,
            headline: headline,
            imageUrl: imageUrl,
            connections: 0,
            pendingConnections: [],
            location: '',
            bio: '',
            website: '',
            messages: {},
            likes: [],
            notifications: []
        })
        saveDataToStorage(idToken, userId, expDate)
        dispatch(authenticate(idToken, userId, expiresIn))
        dispatch(getAuthenticatedUser(userId, email, displayName, headline, imageUrl, '', '', '', 0, [], {}, [], []))
    }
}

export const login = (email, password) => {
    return async dispatch => {
        let data, userId, idToken, expTime, expDate, expiresIn, displayName, noImg, imageUrl
        try {
            data = await firebase.auth().signInWithEmailAndPassword(email, password)
        } catch (err) {
            console.log(err.code)
            if (err.code === 'auth/user-not-found') {
                throw new Error('Email not found.\nPlease try again or sign up.')
            } else {
                throw new Error('Invalid credentials. Please try again.')
            }
        }
        userId = data.user.uid
        idToken = await data.user.getIdToken()
        expTime = jwtDecode(idToken).exp * 1000;
        expDate = new Date(expTime)
        expiresIn = expTime - ((new Date()).getTime())
        saveDataToStorage(idToken, userId, expDate)
        dispatch(authenticate(idToken, userId, expiresIn))
        const userDoc = await db.doc(`/users/${userId}`).get()
        if (userDoc.exists) {
            const { userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages, likes, notifications } = userDoc.data()
            dispatch(getAuthenticatedUser(userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages, likes, notifications))
        }
    }
}

export const getAuthenticatedUser = (userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages, likes, notifications) => {
    return dispatch => {
        dispatch({
            type: SET_USER,
            credentials: {
                userId: userId,
                email: email,
                displayName: displayName,
                headline: headline,
                imageUrl: imageUrl,
                location: location,
                bio: bio,
                website: website
            },
            connections: connections,
            pendingConnections: pendingConnections,
            messages: messages,
            likes: likes,
            notifications: notifications
        })
    }
}

export const getUser = (userId) => {
    return async dispatch => {
        let userData
        try {
            userData = await db.doc(`/users/${userId}`).get()
        } catch (err) {
            throw err
        }

        if (userData.exists) {
            const { userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages, likes, notifications } = userData.data()
            dispatch({
                type: SET_SELECTED_USER,
                selectedUser: {
                    credentials: {
                        userId: userId,
                        email: email,
                        displayName: displayName,
                        headline: headline,
                        imageUrl: imageUrl,
                        location: location,
                        bio: bio,
                        website: website
                    },
                    connections: connections,
                    pendingConnections: pendingConnections,
                    messages: messages,
                    likes: likes,
                    notifications: notifications
                }
            })
        }
    }
}

export const connectReq = (authId, selectedUserId) => {
    return async dispatch => {
        const userData = await db.doc(`/users/${selectedUserId}`).get()
        let userPendingReq = userData.data().pendingConnections
        
        if (userPendingReq.indexOf(authId) === -1) {
            userPendingReq.push(authId)
            const pending = {
                pendingConnections: userPendingReq
            }
            db.doc(`/users/${selectedUserId}`)
                .update(pending)
                .then(() => {
                    db.doc(`/users/${selectedUserId}`).get()
                        .then(doc => {
                            const { userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages, likes, notifications } = doc.data()
                            dispatch({
                                type: SET_SELECTED_USER,
                                selectedUser: {
                                    credentials: {
                                        userId: userId,
                                        email: email,
                                        displayName: displayName,
                                        headline: headline,
                                        imageUrl: imageUrl,
                                        location: location,
                                        bio: bio,
                                        website: website
                                    },
                                    connections: connections,
                                    pendingConnections: pendingConnections,
                                    messages: messages,
                                    likes: likes,
                                    notifications: notifications
                                }
                            })
                        })
                })
                .catch(err => {
                    console.error(err)
                })
        }
    }
}

export const disconnect = (authId, selectedUserId) => {
    return async dispatch => {
        const userData = await db.doc(`/users/${selectedUserId}`).get()
        let userPendingReq = userData.data().pendingConnections
        
        if (userPendingReq.indexOf(authId) > -1) {
            userPendingReq.splice(userPendingReq.indexOf(authId), 1)
            const pending = {
                pendingConnections: userPendingReq
            }
            db.doc(`/users/${selectedUserId}`)
                .update(pending)
                .then(() => {
                    db.doc(`/users/${selectedUserId}`).get()
                        .then(doc => {
                            const { userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages, likes, notifications } = doc.data()
                            dispatch({
                                type: SET_SELECTED_USER,
                                selectedUser: {
                                    credentials: {
                                        userId: userId,
                                        email: email,
                                        displayName: displayName,
                                        headline: headline,
                                        imageUrl: imageUrl,
                                        location: location,
                                        bio: bio,
                                        website: website
                                    },
                                    connections: connections,
                                    pendingConnections: pendingConnections,
                                    messages: messages,
                                    likes: likes,
                                    notifications: notifications
                                }
                            })
                        })
                })
                .catch(err => {
                    console.error(err)
                })
        }
    }
}

export const authenticate = (token, userId, expiresIn) => {
    return dispatch => {
        dispatch(setLogoutTimer(expiresIn))
        dispatch({
            type: AUTHENTICATE,
            token: token,
            userId: userId
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




