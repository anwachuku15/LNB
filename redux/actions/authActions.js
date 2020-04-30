import * as firebase from 'firebase'
import '@firebase/firestore'
import '@firebase/functions'
import {config} from '../../Firebase/Fire'
import {AsyncStorage} from 'react-native'
import jwtDecode from 'jwt-decode'

export const AUTHENTICATE = 'AUTHENTICATE'
// export const SIGNUP = 'SIGNUP'
// export const LOGIN = 'LOGIN'
export const LOGOUT = 'LOGOUT'
export const SET_USER = 'SET_USER'
export const SET_SELECTED_USER = 'SET_SELECTED_USER'
export const SET_PENDING_CONNECTIONS = 'SET_PENDING_CONNECTIONS'
export const SET_NEW_CONNECTION = 'SET_NEW_CONNECTION'
export const SET_LIKES = 'SET_LIKES'
export const SET_NOTIFICATIONS = 'SET_NOTIFICATIONS'
export const MARK_NOTIFICATIONS_READ = 'MARK_NOTIFICATIONS_READ'
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION'


const db = firebase.firestore()

// AUTH UTILS
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
const saveDataToStorage = (token, userId, expDate) => {
    AsyncStorage.setItem('authData', JSON.stringify({
        token: token,
        userId: userId,
        expDate: expDate.toISOString()
    }))
}


// SIGNUP + LOGIN + LOGOUT
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
            messages: {}
        })
        saveDataToStorage(idToken, userId, expDate)
        dispatch(authenticate(idToken, userId, expiresIn))
        dispatch(getAuthenticatedUser(userId, email, displayName, headline, imageUrl, '', '', '', 0, [], {}))
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
            const { userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages } = userDoc.data()
            
            dispatch(getAuthenticatedUser(userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages))
        }
    }
}
export const logout = () => {
    clearLogoutTimer()
    AsyncStorage.removeItem('authData')
    return {type: LOGOUT }
}

// SET USER ACTIONS
export const getAuthenticatedUser = (userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages) => {
    return async dispatch => {
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
            likes: [],
            notifications: []
        })
    }
}

export const getUser = (userId) => {
    return async (dispatch, getState) => {
        let userData, authId, connectionId
        authId = getState().auth.userId
        if (authId < userId) {
            connectionId = authId + userId
        } else {
            connectionId = userId + authId
        }
        try {
            userData = await db.doc(`/users/${userId}`).get()
        } catch (err) {
            throw err
        }

        if (userData.exists) {
            const { userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages } = userData.data()
            // console.log(isConnected)
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
                    // likes: likes
                }
            })
        }
    }
}

// CONNECT ACTIONS & NOTIFICATIONS
export const connectReq = (authId, authName, selectedUserId) => {
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
                            const { userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages } = doc.data()
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
                                    // likes: likes
                                }
                            })

                            dispatch({
                                type: SET_PENDING_CONNECTIONS,
                                pendingConnections: {
                                    recipientId: selectedUserId,
                                    senderId: authId
                                }
                            })
                        })
                        .then(async () => {
                            
                            const pushToken = (await db.doc(`/users/${selectedUserId}`).get()).data().pushToken
                            if (pushToken) {
                                sendRequestNotification(authId, authName, selectedUserId, pushToken)
                                
                            }
                        })
                })
                .catch(err => {
                    console.error(err)
                })
        }
    }
}
const sendRequestNotification = (authId, authName, selectedUserId, pushToken) => {
    db.collection('notifications').add({
        timestamp: new Date().toISOString(),
        type: 'connection request',
        recipientId: selectedUserId,
        senderId: authId,
        senderName: authName,
        read: false
    })
    let res = fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to: pushToken,
            sound: 'default',
            title: 'New Connect Request',
            body: authName + ' wants to connect.'
        })
    })
}
export const confirmConnect = (authId, authName, selectedUserId, selectedUserName) => {
    return async (dispatch, getState) => {
        let authPendingState = getState().auth.pendingConnections
        const authData = await (await db.doc(`/users/${authId}`).get()).data()
        
        const index = authData.pendingConnections.indexOf(selectedUserId)
        authData.pendingConnections.splice(index, 1)
        db.doc(`/users/${authId}`).set(
            {pendingConnections: authData.pendingConnections},
            {merge: true}
        )
        db.doc(`/users/${authId}`).set(
            {connections: authData.connections + 1},
            {merge: true}
        )

        const selectedUserData = (await db.doc(`/users/${selectedUserId}`).get()).data()
        db.doc(`/users/${selectedUserId}`).set(
            {connections: selectedUserData.connections + 1},
            {merge: true}
        )

        let connectionId
        if (authId < selectedUserId) {
            connectionId = authId + selectedUserId
        } else {
            connectionId = selectedUserId + authId
        }

        db.doc(`/connections/${connectionId}`).set({
            requestedBy: selectedUserId,
            acceptedBy: authId,
            timestamp: new Date().toISOString()
        })

        dispatch({
            type: SET_SELECTED_USER,
            selectedUser: {
                credentials: {
                    userId: selectedUserData.userId,
                    email: selectedUserData.email,
                    displayName: selectedUserName,
                    headline: selectedUserData.headline,
                    imageUrl: selectedUserData.imageUrl,
                    location: selectedUserData.location,
                    bio: selectedUserData.bio,
                    website: selectedUserData.website
                },
                connections: selectedUserData.connections + 1,
                pendingConnections: selectedUserData.pendingConnections,
                messages: selectedUserData.messages,
                // likes: selectedUserData.likes
            }
        })
        sendConnectionNotification(authId, authName, selectedUserId, selectedUserData.pushToken)
            dispatch({
                type: SET_PENDING_CONNECTIONS,
                pendingConnections: authPendingState
            })
        

    }
}
const sendConnectionNotification = (authId, authName, selectedUserId, pushToken) => {
    db.collection('notifications').add({
        timestamp: new Date().toISOString(),
        type: 'new connection',
        recipientId: selectedUserId,
        senderId: authId,
        senderName: authName,
        read: false
    })
    let res = fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to: pushToken,
            sound: 'default',
            title: 'New Connection',
            body: 'You are now connected with ' + authName + '.'
        })
    })
}

export const setLikes = () => {
    return async dispatch => {
        const likes = []
        await (await db.collection('likes').where('uid', '==', firebase.auth().currentUser.uid).get()).forEach(doc => {
            likes.push(doc.data())
        })
        dispatch({
            type: SET_LIKES,
            likes: likes
        })
    }
}


export const setNotifications = () => {
    return async dispatch => {
        const userNotifications = []
        await (await db.collection('notifications').where('recipientId', '==', firebase.auth().currentUser.uid).get()).forEach(doc => {
            if (doc.data().type != 'message') {
                userNotifications.push({
                    id: doc.id,
                    type: doc.data().type,
                    senderId: doc.data().senderId,
                    senderName: doc.data().senderName,
                    timestamp: doc.data().timestamp,
                    read: doc.data().read
                })
            }
        })
        dispatch({
            type: SET_NOTIFICATIONS,
            notifications: userNotifications
        })
    }
}

export const markNotificationsAsRead = () => {
    return async (dispatch, getState) => {
        let batch = db.batch()
        const unreadNotificationIds = getState().auth.notifications.filter(notification => !notification.read)
                                                                   .map(notification => notification.id)
        unreadNotificationIds.forEach(id => {
            const notification = db.doc(`notifications/${id}`)
            batch.update(notification, {read: true})
        })
        batch.commit().then(() => {
            console.log('notifications read')
        }).catch(err => {console.log(err)})                                                   
        
        dispatch({
            type: MARK_NOTIFICATIONS_READ
        })
    }
}




export const removeNotification = (type, recipientId, senderId, timestamp, read) => {
    return (dispatch, getState) => {
        const thisNotification = getState().auth.notifications
        console.log(thisNotification)
        dispatch({
            type: REMOVE_NOTIFICATION,
            // notification: {
            //     type: type,
            //     recipientId: recipientId,
            //     senderId: senderId,
            //     timestamp: timestamp,
            //     read: read
            // }
        })
    }
}



        
  


// DISCONNECT + UNREQUEST
export const disconnect = (authId, selectedUserId) => {
    return async dispatch => {
        if (authId < selectedUserId) {
            db.doc(`/connections/${authId+selectedUserId}`).delete()
            
        } else {
            db.doc(`/connections/${selectedUserId+authId}`).delete()
        }
        const authData = await (await db.doc(`/users/${authId}`).get()).data()
        const selectedUserData = await (await db.doc(`/users/${selectedUserId}`).get()).data()

        await db.doc(`/users/${authId}`).set(
            {connections: authData.connections - 1},
            {merge: true}
        )
        await db.doc(`/users/${selectedUserId}`).set(
            {connections: selectedUserData.connections - 1},
            {merge: true}
        )

        dispatch({
            type: SET_USER,
            credentials: {
                userId: authId,
                email: authData.email,
                displayName: authData.displayName,
                headline: authData.headline,
                imageUrl: authData.imageUrl,
                location: authData.location,
                bio: authData.bio,
                website: authData.website
            },
            connections: authData.connections,
            pendingConnections: authData.pendingConnections
        })
        dispatch({
            type: SET_SELECTED_USER,
            selectedUser: {
                credentials: {
                    userId: selectedUserData.userId,
                    email: selectedUserData.email,
                    displayName: selectedUserData.displayName,
                    headline: selectedUserData.headline,
                    imageUrl: selectedUserData.imageUrl,
                    location: selectedUserData.location,
                    bio: selectedUserData.bio,
                    website: selectedUserData.website
                },
                connections: selectedUserData.connections,
                pendingConnections: selectedUserData.pendingConnections,
                messages: selectedUserData.messages,
                // likes: selectedUserData.likes
            }
        })
    }
}

export const unrequest = (authId, selectedUserId) => {
    return async dispatch => {
        const notification = await db.collection('notifications')
            .where('recipientId', '==', selectedUserId)
            .where('senderId', '==', authId)
            .where('type','==','connection request')
            .limit(1)
            .get()
        notification.docs[0].ref.delete()
        
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
                            const { userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages } = doc.data()
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
                                    // likes: likes
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













