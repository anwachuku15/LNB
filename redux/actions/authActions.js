import * as firebase from 'firebase'
import { db } from '../../Firebase/Fire'
// import '@firebase/functions'

import {config} from '../../Firebase/Fire'
import {AsyncStorage} from 'react-native'
import jwtDecode from 'jwt-decode'

export const AUTHENTICATE = 'AUTHENTICATE'
// export const SIGNUP = 'SIGNUP'
// export const LOGIN = 'LOGIN'
export const LOGOUT = 'LOGOUT'
export const SET_USER = 'SET_USER'
export const SET_ALL_USERS = 'SET_ALL_USERS'
export const SET_SELECTED_USER = 'SET_SELECTED_USER'
export const SET_PENDING_CONNECTIONS = 'SET_PENDING_CONNECTIONS'
export const SET_NEW_CONNECTION = 'SET_NEW_CONNECTION'
export const SET_USER_CONNECTIONS = 'SET_USER_CONNECTIONS'
// export const SET_LIKES = 'SET_LIKES'
export const SET_NOTIFICATIONS = 'SET_NOTIFICATIONS'
export const SET_MESSAGE_NOTIFICATIONS = 'SET_MESSAGE_NOTIFICATIONS'
export const SET_CONNECT_NOTIFICATIONS = 'SET_CONNECT_NOTIFICATIONS'
export const MARK_NOTIFICATIONS_READ = 'MARK_NOTIFICATIONS_READ'
export const MARK_MESSAGE_NOTIFICATIONS_READ = 'MARK_MESSAGE_NOTIFICATIONS_READ'
export const MARK_CONNECT_NOTIFICATIONS_READ = 'MARK_CONNECT_NOTIFICATIONS_READ'
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION'
export const LAST_READ_TIMESTAMP = 'LAST_READ_TIMESTAMP'
export const SET_ANNOUNCEMENTS = 'SET_ANNOUNCEMENTS'
export const SET_ANNOUNCEMENT = 'SET_ANNOUNCEMENT'
export const LIKE_ANNOUNCEMENT = 'LIKE_ANNOUNCEMENT'
export const UNLIKE_ANNOUNCEMENT = 'UNLIKE_ANNOUNCEMENT'
export const SET_CONNECTIONS = 'SET_CONNECTIONS'
export const SET_INCOMING_REQUESTS = 'SET_INCOMING_REQUESTS'
export const SET_OUTGOING_REQUESTS = 'SET_OUTGOING_REQUESTS'
export const SET_GROUP_CHATS = 'SET_GROUP_CHATS'


// AUTH UTILS
export const authenticate = (token, userId) => {
    return dispatch => {
        // dispatch(setLogoutTimer(expiresIn))
        dispatch({
            type: AUTHENTICATE,
            token: token,
            userId: userId
        })
    }
}

// LOGOUT WHEN exp EXPIRES
// let timer
// const setLogoutTimer = exp => {
//     return dispatch => {
//         timer = setTimeout(() => {
//             dispatch(logout())
//         }, exp)
//     }
// }


// const clearLogoutTimer = () => {
//     if (timer) {
//         clearTimeout(timer)
//     }
// }

export const logout = () => {
    // clearLogoutTimer()
    AsyncStorage.removeItem('authData')
    return { type: LOGOUT }
}

export const saveDataToStorage = (token, userId, expDate) => {
    AsyncStorage.setItem('authData', JSON.stringify({
        token: token,
        userId: userId,
        expDate: expDate.toISOString()
    }))
}

const updateStorageData = (newToken, userId, newDate) => {
    AsyncStorage.mergeItem('authData', JSON.stringify({
        token: newToken,
        userId: userId,
        expDate: newDate.toISOString()
    }))
}


// firebase.auth().onIdTokenChanged(async user => {
//     // console.log('TOKEN CHANGED!')
//     if (user == null) return AsyncStorage.removeItem('authData')
//     if (user !== null) {
//         const uid = user.uid
//         const newToken = await user.getIdToken()
//         const newDate = new Date(jwtDecode(newToken).exp * 1000)

//         const authData = await AsyncStorage.getItem('authData')
//         if (authData) {
//             const transformedData = JSON.parse(authData)
//             const {token, userId, expDate} = transformedData
//             if (token !== newToken) {
//                 updateStorageData(newToken, uid, newDate)
//                 authenticate(newToken, uid)
//             }
//         }
//     }
// })


// SIGNUP + LOGIN + LOGOUT
export const signup = (email, password, displayName) => {
    return async dispatch => {
        let data, userId, idToken, expTime, expiresIn, expDate, imageUrl
        let isAdmin = false
        // ---- ADD NEW USER TO FIREBASE ---- //
        try {
            data = await firebase.auth().createUserWithEmailAndPassword(email, password)
        } catch (err) {
            console.error(err)
            throw err
        }
        
        userId = data.user.uid
        
        idToken = await data.user.getIdToken()
        expTime = jwtDecode(idToken).exp * 1000
        expDate = new Date(expTime)
        // expiresIn = expTime - ((new Date()).getTime())
        // displayName = fname + ' ' + lname
        
        const noImg = 'no-img.png'
        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`
        
        // imageUrl = localUri === undefined 
        //             ? `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`
        //             : await uploadPhotoAsyn(localUri)

        const isNewUser = data.additionalUserInfo.isNewUser
        db.doc(`/users/${userId}`).set({
            isNewUser: isNewUser,
            userId: userId,
            createdAt: new Date().toISOString(),
            email: email,
            displayName: displayName,
            headline: '',
            imageUrl: imageUrl,
            connections: 0,
            pendingConnections: [],
            outgoingRequests: [],
            location: '',
            bio: '',
            website: '',
            messages: {},
            isAdmin: isAdmin,
            lastReadAnnouncements: null
        })
        .catch(err => {
            console.log(err)
        })
        
        saveDataToStorage(idToken, userId, expDate)
        dispatch(authenticate(idToken, userId))
        dispatch(getAuthenticatedUser(isNewUser, userId, email, displayName, '', imageUrl, '', '', '', 0, [], [], {}, isAdmin, null))

        //ONBOARDING - SEND NOTIFICATION TO ANDREW & ROB
        // data.additionalUserInfo.isNewUser for onboarding
        // data.user.metadata.creationTime
        // data.user.metadata.lastSignInTime

    }
}

export const createProfile = (uri, headline, bio) => {
    return async (dispatch, getState) => {
        console.log(`update: ${headline}`)
        const auth = getState().auth
        const uid = firebase.auth().currentUser.uid
        let imageUrl
        const noImg = 'no-img.png'
        
        if (uri === 'none' || uri === 'authPic') {
            imageUrl = "don't update"
        } else {
            imageUrl = await uploadPhotoAsyn(uri)
        }

        if (imageUrl === "don't update") {
            await db.doc(`/users/${auth.userId}`).update({
                isNewUser: false,
                headline: headline,
                bio: bio
            }).catch(err => console.log(err))
        } else {
            await db.doc(`/users/${auth.userId}`).update({
                isNewUser: false,
                imageUrl: imageUrl,
                headline: headline,
                bio: bio
            }).catch(err => console.log(err))
        }
        
        const isNewUser = false
        const imgUrl = imageUrl === "don't update" ? auth.credentials.imageUrl : imageUrl

        dispatch(getAuthenticatedUser(
            isNewUser,
            auth.userId,
            auth.credentials.email,
            auth.credentials.displayName,
            headline,
            imgUrl,
            '',
            bio,
            '',
            auth.connections,
            auth.pendingConnections,
            auth.outgoingRequests,
            auth.messages,
            auth.credentials.isAdmin,
            auth.lastReadAnnouncements
        ))

    }
}

export const updateProfile = (headline, location, bio, link, uri) => {
    return async (dispatch, getState) => {
        
        let imageUrl
        const auth = getState().auth
        if (uri !== getState().auth.credentials.imageUrl) {
            imageUrl = await uploadPhotoAsyn(uri)
        } else {
            imageUrl = uri
        }
        const website = link.trim() !== '' && link.trim().substring(0,4) !== 'http'
                        ? `https://${link.trim()}`
                        : link
        await db.doc(`/users/${auth.userId}`).update({
            headline: headline,
            location: location,
            bio: bio,
            website: website,
            imageUrl: imageUrl
        })
        .catch(err => {
            console.log(err)
        }) 

        dispatch(getAuthenticatedUser(
            false,
            auth.userId,
            auth.credentials.email,
            auth.credentials.displayName,
            headline,
            imageUrl,
            location,
            bio,
            website,
            auth.connections,
            auth.pendingConnections,
            auth.outgoingRequests,
            auth.messages,
            auth.credentials.isAdmin,
            auth.lastReadAnnouncements
        ))
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
        // expiresIn = expTime - ((new Date()).getTime())
        saveDataToStorage(idToken, userId, expDate)
        dispatch(authenticate(idToken, userId))
        const userDoc = await db.doc(`/users/${userId}`).get()
        if (userDoc.exists) {
            const { userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, outgoingRequests, messages, isAdmin, lastReadAnnouncements } = userDoc.data()
            // userDoc.ref.update({isNewUser: false})
            dispatch(getAuthenticatedUser(false, userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, outgoingRequests, messages, isAdmin, lastReadAnnouncements))
        }
    }
}

export const googleSignIn = (data, googleUser) => {
    return async dispatch => {
        let userId, idToken, expTime, expDate
        
        userId = data.user.uid
        idToken = googleUser ? googleUser.idToken : await data.user.getIdToken()
        expTime = jwtDecode(idToken).exp * 1000
        expDate = new Date(expTime)

        saveDataToStorage(idToken, userId, expDate)
        dispatch(authenticate(idToken, userId))

        if (data.additionalUserInfo.isNewUser) {
            const noImg = 'no-img.png'
            const imgUrl = data.user.photoURL ? data.user.photoURL : `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`
            db.doc(`/users/${userId}`).set({
                isNewUser: true,
                userId: userId,
                createdAt: new Date().toISOString(),
                email: data.user.email,
                displayName: data.user.displayName,
                headline: '',
                imageUrl: imgUrl,
                connections: 0,
                pendingConnections: [],
                outgoingRequests: [],
                location: '',
                bio: '',
                website: '',
                messages: {},
                isAdmin: false,
                lastReadAnnouncements: null
            })
            .catch(err => {
                console.log(err)
            })
            dispatch(getAuthenticatedUser(true, userId, data.user.email, data.user.displayName, '', imgUrl, '', '', '', 0, [], [], {}, false, null))
        } else {
            db.doc(`/users/${userId}`).get()
                .then(userDoc => {
                    if (userDoc.exists) {
                        const { userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, outgoingRequests, messages, isAdmin, lastReadAnnouncements } = userDoc.data()
                        dispatch(getAuthenticatedUser(false, userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, outgoingRequests, messages, isAdmin, lastReadAnnouncements))            
                    }
                })
        }

    }
}

export const appleLogin = (data, displayName) => {
    return async dispatch => {
        let userId, idToken, expTime, expDate
        
        userId = data.user.uid
        idToken = await data.user.getIdToken()
        expTime = jwtDecode(idToken).exp * 1000
        expDate = new Date(expTime)

        saveDataToStorage(idToken, userId, expDate)
        dispatch(authenticate(idToken, userId))

        if (data.additionalUserInfo.isNewUser) {
            const noImg = 'no-img.png'
            const imgUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`
            db.doc(`/users/${userId}`).set({
                isNewUser: true,
                userId: userId,
                createdAt: new Date().toISOString(),
                email: data.user.email,
                displayName: displayName,
                headline: '',
                imageUrl: imgUrl,
                connections: 0,
                pendingConnections: [],
                outgoingRequests: [],
                location: '',
                bio: '',
                website: '',
                messages: {},
                isAdmin: false,
                lastReadAnnouncements: null
            })
            .catch(err => {
                console.log(err)
            })
            dispatch(getAuthenticatedUser(true, userId, data.user.email, displayName, '', imgUrl, '', '', '', 0, [], [], {}, false, null))
        } else {
            db.doc(`/users/${userId}`).get()
                .then(userDoc => {
                    if (userDoc.exists) {
                        const { userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, outgoingRequests, messages, isAdmin, lastReadAnnouncements } = userDoc.data()
                        dispatch(getAuthenticatedUser(false, userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, outgoingRequests, messages, isAdmin, lastReadAnnouncements))            
                    }
                })
        }
    }
}




// SET USER ACTIONS


export const getAuthenticatedUser = (isNewUser, userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, outgoingRequests, messages, isAdmin, lastReadAnnouncements) => {
    return async dispatch => {
        try {
            dispatch({
                type: SET_USER,
                credentials: {
                    isNewUser: isNewUser,
                    isAdmin: isAdmin,
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
                outgoingRequests: outgoingRequests,
                messages: messages,
                likes: [],
                notifications: [],
                connectNotifications: [],
                messageNotifications: [],
                lastReadAnnouncements: lastReadAnnouncements
            })
            // dispatch(fetchConnections(userId))

            
            let lastReadMessages = []
            await (await db.collection('chats').get()).docs
            .forEach(doc => {
                if (doc.id.includes(userId)) {
                    if (doc.data().lastRead.user1 && doc.data().lastRead.user1.uid === userId) {
                        lastReadMessages.push({
                            chatId: doc.id,
                            uid: doc.data().lastRead.user1.uid,
                            timestamp: doc.data().lastRead.user1.timestamp
                        })
                        dispatch({
                            type: LAST_READ_TIMESTAMP,
                            lastReadMessage: lastReadMessages
                        })
                    } else if (doc.data().lastRead.user2 && doc.data().lastRead.user2.uid === userId) {
                        lastReadMessages.push({
                            chatId: doc.id,
                            uid: doc.data().lastRead.user2.uid,
                            timestamp: doc.data().lastRead.user2.timestamp
                        })
                        dispatch({
                            type: LAST_READ_TIMESTAMP,
                            lastReadMessage: lastReadMessages
                        })
                    }
                }
            })

            const newConnectionListener = db.collection('connections')
                                            .where('requestedBy', '==', userId)
                                            .onSnapshot(snapshot => {
                                                dispatch(fetchConnections(userId))
                                            })
            newConnectionListener

            const requestsListener = db.doc(`/users/${userId}`)
                                        .get()
                                        .then(doc => {
                                            const requestListener = doc.ref.onSnapshot(snapshot => {
                                                dispatch(updateOutgoingRequests(snapshot.data().outgoingRequests))
                                                dispatch(updateIncomingRequests(snapshot.data().pendingConnections))
                                            })
                                        }).catch(err => console.log(err))

            const unreadListener = db.collection('notifications')
                                    .where('recipientId', '==', userId)
                                    .onSnapshot(snapshot => {
                                        dispatch(setNotifications())
                                    })
            unreadListener

            const announcementListener = db.collection('announcements')
                                        .onSnapshot(snapshot => {
                                            dispatch(setAnnouncements())
                                        })
            announcementListener
            
        } catch (err) {
            console.log(err)
        }
    }
}



export const fetchUserConnections = (uid) => {
    return async (dispatch, getState) => {
        try {
            let selectedUserConnectionIds = []
            let selectedUserConnections = []

            const allConnections = await db.collection('connections').get()
            const users = await db.collection('users').get()
            allConnections.forEach(doc => {
                if (doc.id.includes(uid)) {
                    let userId = doc.id.replace(uid, '')
                    selectedUserConnectionIds.push(userId)
                }
            })

            users.forEach(doc => {
                if (selectedUserConnectionIds.includes(doc.id)) {
                    selectedUserConnections.push({
                        uid: doc.id,
                        name: doc.data().displayName,
                        imageUrl: doc.data().imageUrl,
                        headline: doc.data().headline,
                        location: doc.data().location,
                    })
                }
            })
            
            dispatch({
                type: SET_USER_CONNECTIONS,
                selectedUserConnections: selectedUserConnections
            })

        } catch (err) {
            console.log(err)
        }
    }
}



export const fetchConnections = (uid) => {
    return async (dispatch, getState) => {
        try {
            const userConnectionIds = []
            const userConnections = []
            const allUsers = []
            const isOnline = []
            const allConnections = await db.collection('connections').get()
            const users = await db.collection('users').orderBy('displayName', 'asc').get()
            
            allConnections.forEach(doc => {
                if (doc.id.includes(uid)) {
                    userConnectionIds.push(doc.id.replace(uid,''))
                }
            })

            users.forEach(doc => {
                allUsers.push({
                    userId: doc.data().userId,
                    displayName: doc.data().displayName,
                    email: doc.data().email,
                    headline: doc.data().headline,
                    location: doc.data().location,
                    bio: doc.data().bio,
                    imageUrl: doc.data().imageUrl,
                    website: doc.data().website,
                    connections: doc.data().connections,
                    // isOnline: doc.data().isOnline,
                })
                // if (doc.data().isOnline === true) {
                //     isOnline.push(doc.data().userId)
                // }

                if (userConnectionIds.includes(doc.id)) {
                    userConnections.push({
                        uid: doc.data().userId,
                        name: doc.data().displayName,
                        headline: doc.data().headline,
                        location: doc.data().location,
                        bio: doc.data().bio,
                        imageUrl: doc.data().imageUrl,
                        website: doc.data().website,
                        connections: doc.data().connections,
                        // isOnline: doc.data().isOnline,
                    })
                }
            })
            // console.log(isOnline)
            dispatch({
                type: SET_ALL_USERS,
                allUsers: allUsers,
                // isOnline: isOnline
            })
            dispatch({
                type: SET_CONNECTIONS,
                userConnections: userConnections,
                userConnectionIds: userConnectionIds
            })
        } catch (err) {
            throw err
        }
    }
}

export const getAnnouncement = (announcementId) => {
    return async dispatch => {
        try {
            const announcementData = await db.doc(`/announcements/${announcementId}`).get()
            dispatch({
                type: SET_ANNOUNCEMENT,
                announcement: announcementData.data()
            })
        } catch (err) {
            throw err
        }
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
            const { userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages, isAdmin, isOnline } = userData.data()
            // console.log(displayName)
            dispatch({
                type: SET_SELECTED_USER,
                selectedUser: {
                    credentials: {
                        isAdmin: isAdmin,
                        userId: userId,
                        email: email,
                        displayName: displayName,
                        headline: headline,
                        imageUrl: imageUrl,
                        location: location,
                        bio: bio,
                        website: website
                    },
                    // isOnline: isOnline,
                    connections: connections,
                    pendingConnections: pendingConnections,
                    messages: messages,
                    // likes: likes
                }
            })
        }
    }
}

export const pinNeed = (needId, uid) => {
    db.collection('needs')
        .where('uid', '==', uid)
        .where('isPinned', '==', true)
        .limit(1)
        .get()
        .then(doc => {
            if (!doc.empty) {
                doc.docs[0].ref.set(
                    {isPinned: false}, 
                    {merge: true}
                )
            }
        })
        .then(() => {
            db.doc(`/needs/${needId}`).set(
                {isPinned: true}, 
                {merge: true}
            )
        })
        .catch(err => console.log(err))
    
}

export const unpinNeed = (needId) => {
    db.doc(`needs/${needId}`).set(
        {isPinned: false}, 
        {merge: true}
    ).catch(err => console.log(err))
}



export const readAnnouncements = () => {
    return async (dispatch, getState) => {
        const justRead = new Date().toISOString()
        const auth = getState().auth

        try {
            await db.doc(`/users/${auth.userId}`).update({
                lastReadAnnouncements: justRead
            })
            dispatch(getAuthenticatedUser(
                false,
                auth.userId,
                auth.credentials.email,
                auth.credentials.displayName,
                auth.credentials.headline,
                auth.credentials.imageUrl,
                auth.credentials.location,
                auth.credentials.bio,
                auth.credentials.website,
                auth.connections,
                auth.pendingConnections,
                auth.outgoingRequests,
                auth.messages,
                auth.credentials.isAdmin,
                justRead
            ))
        } catch (err) {
            console.log(err)
        }
    }
}

export const uploadPhotoAsyn = async (uri) => {
    const path = `photos/${firebase.auth().currentUser.uid}/${Date.now()}.jpg`
    return new Promise(async (res, rej) => {
        const response = await fetch(uri)
        const file = await response.blob()

        let upload = firebase.storage().ref(path).put(file)

        upload.on(
            'state_changed', 
            snapshot => {}, 
            err => {
                rej(err)
                console.log(err)
            },
            async () => {
                const url = await upload.snapshot.ref.getDownloadURL()
                res(url)
            }
        )
    })
}


// CONNECT ACTIONS & NOTIFICATIONS
export const connectReq = (authId, authName, selectedUserId) => {
    return async (dispatch, getState) => {
        const authImg = getState().auth.credentials.imageUrl
        const authHeadline = getState().auth.credentials.headline

        const userData = await db.doc(`/users/${selectedUserId}`).get()
        let userPendingReq = userData.data().pendingConnections

        const authData = await db.doc(`/users/${authId}`).get()
        let authOutgoingReq = authData.data().outgoingRequests
        
        if (userPendingReq.indexOf(authId) === -1) {
            userPendingReq.push(authId)
            const pending = {
                pendingConnections: userPendingReq
            }
            authOutgoingReq.push(selectedUserId)
            const outgoing = {
                outgoingRequests: authOutgoingReq
            }
            db.doc(`/users/${authId}`)
                .update(outgoing)
                .then(() => {
                    db.doc(`/users/${authId}`).get()
                    .then(doc => {
                        dispatch(updateOutgoingRequests(doc.data().outgoingRequests))
                    })
                })
                .catch(err => {
                    console.log(err)
                })
                
            db.doc(`/users/${selectedUserId}`)
                .update(pending)
                .then(() => {
                    db.doc(`/users/${selectedUserId}`).get()
                        .then(doc => {
                            const { userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages, isAdmin, isOnline } = doc.data()

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
                                sendRequestNotification(authId, authName, authImg, authHeadline, selectedUserId, pushToken)
                                
                            }
                        })
                })
                .catch(err => {
                    console.error(err)
                })
            
        }
    }
}

const updateGroupChats = (groupChats) => {
    return async dispatch => {
        dispatch({
            type: SET_GROUP_CHATS,
            groupChats: groupChats
        })
    }
}

const updateOutgoingRequests = (outgoingRequests) => {
    return async dispatch => {
        dispatch({
            type: SET_OUTGOING_REQUESTS,
            outgoingRequests: outgoingRequests
        })
    }
}

const updateIncomingRequests = (incomingRequests) => {
    return async dispatch => {
        dispatch({
            type: SET_INCOMING_REQUESTS,
            incomingRequests: incomingRequests
        })
    }
}


const sendRequestNotification = (authId, authName, authImg, authHeadline, selectedUserId, pushToken) => {
    db.collection('notifications').add({
        timestamp: new Date().toISOString(),
        type: 'connection request',
        recipientId: selectedUserId,
        senderId: authId,
        senderName: authName,
        senderHeadline: authHeadline,
        senderImage: authImg,
        read: false,
        accepted: false,
        declined: false
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
            body: authName + ' wants to connect.',
            data: {
                type: 'connection request',
            }
        })
    })
}
export const confirmConnect = (authId, authName, selectedUserId, selectedUserName) => {
    return async (dispatch, getState) => {
        const authImg = getState().auth.credentials.imageUrl
        const authHeadline = getState().auth.credentials.headline
        // Accept request notification
        const notificationData = (await db.collection('notifications')
                                         .where('type', '==', 'connection request')
                                         .where('recipientId', '==', authId)
                                         .where('senderId', '==', selectedUserId)
                                         .limit(1)
                                         .get()).docs[0]
        notificationData.ref.delete()

        let authPendingState = getState().auth.pendingConnections

        const authData = await (await db.doc(`/users/${authId}`).get()).data()
        const selectedUserData = (await db.doc(`/users/${selectedUserId}`).get()).data()

        // Remove from pendingConnections
        const index = authData.pendingConnections.indexOf(selectedUserId)
        authData.pendingConnections.splice(index, 1)
        db.doc(`/users/${authId}`).set(
            {pendingConnections: authData.pendingConnections},
            {merge: true}
        )
        // Increment connections by 1
        db.doc(`/users/${authId}`).set(
            {connections: authData.connections + 1},
            {merge: true}
        )
            
        
        // Remove from outgoingRequests
        const index2 = selectedUserData.outgoingRequests.indexOf(authId)
        selectedUserData.outgoingRequests.splice(index2, 1)
        db.doc(`/users/${selectedUserId}`).set(
            {outgoingRequests: selectedUserData.outgoingRequests},
            {merge: true}
        )

        // Increment selected user connections by 1
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
        }).then(() => {
            dispatch(fetchConnections(authId))
        })

        dispatch({
            type: SET_SELECTED_USER,
            selectedUser: {
                credentials: {
                    isAdmin: selectedUserData.isAdmin,
                    userId: selectedUserData.userId,
                    email: selectedUserData.email,
                    displayName: selectedUserName,
                    headline: selectedUserData.headline,
                    imageUrl: selectedUserData.imageUrl,
                    location: selectedUserData.location,
                    bio: selectedUserData.bio,
                    website: selectedUserData.website
                },
                // isOnline: selectedUserData.isOnline,
                connections: selectedUserData.connections + 1,
                pendingConnections: selectedUserData.pendingConnections,
                messages: selectedUserData.messages,
                // likes: selectedUserData.likes
            }
        })
        sendConnectionNotification(authId, authName, authImg, authHeadline, selectedUserId, selectedUserName, selectedUserData.imageUrl, selectedUserData.headline, selectedUserData.pushToken)
        // dispatch({
        //     type: SET_PENDING_CONNECTIONS,
        //     pendingConnections: authPendingState
        // })
    }
}

const sendConnectionNotification = (authId, authName, authImg, authHeadline, selectedUserId, selectedName, selectedImg, selectedHeadline, pushToken) => {
    db.collection('notifications').add({
        timestamp: new Date().toISOString(),
        type: 'new connection',
        recipientId: selectedUserId,
        senderId: authId,
        senderName: authName,
        senderHeadline: authHeadline,
        senderImage: authImg,
        read: false
    })
    db.collection('notifications').add({
        timestamp: new Date().toISOString(),
        type: 'new connection',
        recipientId: authId,
        senderId: selectedUserId,
        senderName: selectedName,
        senderHeadline: selectedHeadline,
        senderImage: selectedImg,
        read: true
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
            body: 'You are now connected with ' + authName + '.',
            data: {
                type: 'new connection'
            }
        })
    })
}

export const declineConnect = (authId, selectedUserId, selectedUserName) => {
    return async (dispatch, getState) => {
        const authImg = getState().auth.credentials.imageUrl
        // read then set to false
        const notificationData = (await db.collection('notifications')
                                         .where('type', '==', 'connection request')
                                         .where('recipientId', '==', authId)
                                         .where('senderId', '==', selectedUserId)
                                         .limit(1)
                                         .get()).docs[0]
        const updatedFields = {
            declined: true,
            read: true
        }
        notificationData.ref.update(updatedFields).then(() => {
            // Delete request notification
            notificationData.ref.delete()
        })
        
        let authPendingState = getState().auth.pendingConnections
        const authData = await (await db.doc(`/users/${authId}`).get()).data()
        const selectedUserData = await (await db.doc(`/users/${selectedUserId}`).get()).data()
        
        // Remove from pendingConnections
        const index = authData.pendingConnections.indexOf(selectedUserId)
        authData.pendingConnections.splice(index, 1)
        db.doc(`/users/${authId}`).set(
            {pendingConnections: authData.pendingConnections},
            {merge: true}
        )

        // Remove from outgoingRequests
        const index2 = selectedUserData.outgoingRequests.indexOf(authId)
        selectedUserData.outgoingRequests.splice(index2, 1)
        db.doc(`/users/${selectedUserId}`).set(
            {outgoingRequests: selectedUserData.outgoingRequests},
            {merge: true}
        )
        
        // dispatch({
        //     type: SET_PENDING_CONNECTIONS,
        //     pendingConnections: authPendingState
        // })
    }
}

// export const setLikes = () => {
//     return async (dispatch, getState) => {
//         const likes = []
//         await (await db.collection('likes').where('uid', '==', getState().auth.userId).get()).forEach(doc => {
//             likes.push(doc.data())
//         })
//         dispatch({
//             type: SET_LIKES,
//             likes: likes
//         })
//     }
// }

export const setAnnouncements = () => {
    return async (dispatch, getState) => {
        try {
            const announcements = []
            const announcementsData = await db.collection('announcements').orderBy('timestamp', 'desc').get()
            announcementsData.forEach(doc => {
                announcements.push({
                    id: doc.id,
                    timestamp: doc.data().timestamp,
                    uid: doc.data().uid,
                    admin: doc.data().admin,
                    adminHeadline: doc.data().adminHeadline,
                    adminImage: doc.data().adminImage,
                    subject: doc.data().subject,
                    body: doc.data().body,
                    imageUrl: doc.data().imageUrl,
                    likeCount: doc.data().likeCount,
                    commentCount: doc.data().commentCount,
                    isPinned: doc.data().isPinned
                })
                if (doc.data().imageUrl) {
                    announcements.concat({
                        imageUrl: doc.data().imageUrl
                    })
                }
            })
            dispatch({
                type: SET_ANNOUNCEMENTS,
                announcements: announcements
            })
        } catch (err) {
            throw err
        }
    }
}

export const setNotifications = () => {
    return async (dispatch, getState) => {
        const userNotifications = []
        const userMessageNotifications = []
        const userConnectNotifications = []
        await (await db.collection('notifications').where('recipientId', '==', getState().auth.userId).get())
        .forEach(doc => {
            if (doc.data().type == 'likeNeed' || doc.data().type == 'commentNeed') {
                userNotifications.push({
                    id: doc.id,
                    type: doc.data().type,
                    senderId: doc.data().senderId,
                    senderName: doc.data().senderName,
                    senderImage: doc.data().senderImage,
                    needId: doc.data().needId,
                    read: doc.data().read,
                    timestamp: doc.data().timestamp,
                })
            } else if (doc.data().type == 'commentThread') {
                userNotifications.push({
                    id: doc.id,
                    type: doc.data().type,
                    senderId: doc.data().senderName,
                    senderName: doc.data().senderName,
                    senderImage: doc.data().senderImage,
                    needId: doc.data().needId,
                    needUserName: doc.data().needUserName,
                    read: doc.data().read,
                    timestamp: doc.data().timestamp
                })
            } else if (doc.data().type == 'new connection') {
                userNotifications.push({
                    id: doc.id,
                    type: doc.data().type,
                    senderId: doc.data().senderId,
                    senderName: doc.data().senderName,
                    senderHeadline: doc.data().senderHeadline,
                    senderImage: doc.data().senderImage,
                    read: doc.data().read,
                    timestamp: doc.data().timestamp,
                })
            } else if (doc.data().type == 'connection request') {
                userNotifications.push({
                    id: doc.id,
                    type: doc.data().type,
                    senderId: doc.data().senderId,
                    senderName: doc.data().senderName,
                    senderHeadline: doc.data().senderHeadline,
                    senderImage: doc.data().senderImage,
                    read: doc.data().read,
                    timestamp: doc.data().timestamp,
                })
            } else if (doc.data().type == 'message') {
                userMessageNotifications.push({
                    id: doc.id,
                    type: doc.data().type,
                    senderId: doc.data().senderId,
                    read: doc.data().read,
                    timestamp: doc.data().timestamp,
                })
            } else if (doc.data().type == 'groupMessage') {
                userMessageNotifications.push({
                    id: doc.id,
                    type: doc.data().type,
                    senderId: doc.data().senderId,
                    groupId: doc.data().groupId,
                    groupName: doc.data().groupName,
                    read: doc.data().read,
                    timestamp: doc.data().timestamp
                })
            }
        })
        dispatch({
            type: SET_NOTIFICATIONS,
            notifications: userNotifications
        })
        dispatch({
            type: SET_CONNECT_NOTIFICATIONS,
            connectNotifications: userConnectNotifications
        })
        dispatch({
            type: SET_MESSAGE_NOTIFICATIONS,
            messageNotifications: userMessageNotifications
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
        }).catch(err => {console.log(err)})                                                   
        
        
        dispatch({
            type: MARK_NOTIFICATIONS_READ
        })
    }
}

export const markMessageNotificationsAsRead = () => {
    return async (dispatch, getState) => {
        let batch = db.batch()
        const unreadNotificationIds = getState().auth.messageNotifications.filter(notification => !notification.read)
                                                                   .map(notification => notification.id)
        unreadNotificationIds.forEach(id => {
            const notification = db.doc(`notifications/${id}`)
            batch.update(notification, {read: true})
        })
        batch.commit().then(() => {
            // console.log('message notifications read')
        }).catch(err => {
            console.log(err)
        })                                                   
        // Consider deleting message notifications
        dispatch({
            type: MARK_MESSAGE_NOTIFICATIONS_READ
        })
    }
}

export const markConnectNotificationsAsRead = () => {
    return async (dispatch, getState) => {
        let batch = db.batch()
        const unreadNotificationIds = getState().auth.connectNotifications.filter(notification => !notification.read)
                                                                   .map(notification => notification.id)
        unreadNotificationIds.forEach(id => {
            const notification = db.doc(`notifications/${id}`)
            batch.update(notification, {read: true})
        })
        batch.commit().then(() => {
            console.log('connect notifications read')
        }).catch(err => {
            console.log(err)
        })                                                   
        
        dispatch({
            type: MARK_CONNECT_NOTIFICATIONS_READ
        })
    }
}

export const setLastReadMessage = (chatId, selectedUserId, readTimestamp) => {
    return async (dispatch, getState ) => {
        
        const uid = getState().auth.userId
        if (uid < selectedUserId) {
            await db.collection('chats').doc(`${chatId}`).set(
                {lastRead: {
                    user1: {
                        uid: uid,
                        timestamp: readTimestamp
                    }
                }},
                {merge: true}
            )
            db.doc(`chats/${chatId}`)
                .get()
                .then(doc => {
                    let lastReadMessages = getState().auth.lastReadMessages
                    let existingChat = lastReadMessages.find(chat => chat.chatId === chatId)
                    if (existingChat) {
                        lastReadMessages.splice(lastReadMessages.indexOf(existingChat), 1)
                        lastReadMessages.push({
                            chatId: doc.id,
                            uid: doc.data().lastRead.user1.uid,
                            timestamp: doc.data().lastRead.user1.timestamp
                        })
                    }
                    dispatch({
                        type: LAST_READ_TIMESTAMP,
                        lastReadMessage: lastReadMessages
                    })
                })
                .catch(err => console.log(err))
        } else if (selectedUserId < uid) {
            await db.collection('chats').doc(`${chatId}`).set(
                {lastRead: {
                    user2: {
                        uid: uid,
                        timestamp: readTimestamp
                    }
                }},
                {merge: true}
            )
            db.doc(`chats/${chatId}`)
                .get()
                .then(doc => {
                    let lastReadMessages = getState().auth.lastReadMessages
                    let existingChat = lastReadMessages.find(chat => chat.chatId === chatId)
                    if (existingChat) {
                        lastReadMessages.splice(lastReadMessages.indexOf(existingChat), 1)
                        lastReadMessages.push({
                            chatId: doc.id,
                            uid: doc.data().lastRead.user2.uid,
                            timestamp: doc.data().lastRead.user2.timestamp
                        })
                    }
                    dispatch({
                        type: LAST_READ_TIMESTAMP,
                        lastReadMessage: lastReadMessages
                    })
                })
                .catch(err => console.log(err))
        }
    }
}

export const setLastReadGroupMessage = (groupChatId, readTimestamp) => {
    return async (dispatch, getState) => {
        const uid = getState().auth.userId
        db.doc(`/chats/${groupChatId}`).get()
            .then(doc => {
                const members = doc.data().memberIds
                const memberIndex = members.indexOf(uid).toString()
                const key = 'user' + memberIndex
                const lastRead = {}
                lastRead[key] = {
                    uid: uid,
                    timestamp: readTimestamp
                }
                doc.ref.set({lastRead: lastRead}, {merge: true})
            })
            .catch(err => console.log(err))

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
    return async (dispatch, getState) => {

        if (authId < selectedUserId) {
            db.doc(`/connections/${authId+selectedUserId}`).delete()
            
        } else {
            db.doc(`/connections/${selectedUserId+authId}`).delete()
        }
        const users = [authId, selectedUserId]
        const notifications = await db.collection('notifications')
            .where('type', '==', 'new connection')
            .get()
        notifications.forEach(doc => {
            if (users.includes(doc.data().recipientId) && users.includes(doc.data().senderId)) {
                db.doc(`/notifications/${doc.id}`).delete()
            }
        })

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
                isAdmin: authData.isAdmin,
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
            pendingConnections: authData.pendingConnections,
            outgoingRequests: authData.outgoingRequests,
            likes: [],
            notifications: [],
            connectNotifications: [],
            messageNotifications: [],
            lastReadAnnouncements: authData.lastReadAnnouncements
        })
        dispatch(setNotifications())
        // dispatch(setLikes())
        
        
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

        const authData = await db.doc(`/users/${authId}`).get()
        let authOutgoingReq = authData.data().outgoingRequests

        if (userPendingReq.indexOf(authId) > -1) {
            userPendingReq.splice(userPendingReq.indexOf(authId), 1)
            const pending = {
                pendingConnections: userPendingReq
            }
            authOutgoingReq.splice(authOutgoingReq.indexOf(selectedUserId), 1)
            const outgoing = {
                outgoingRequests: authOutgoingReq
            }
            db.doc(`/users/${selectedUserId}`)
                .update(pending)
                .then(() => {
                    db.doc(`/users/${selectedUserId}`).get()
                        .then(doc => {
                            const { userId, email, displayName, headline, imageUrl, location, bio, website, connections, pendingConnections, messages, isAdmin, isOnline } = doc.data()
                            dispatch({
                                type: SET_SELECTED_USER,
                                selectedUser: {
                                    credentials: {
                                        isAdmin: isAdmin,
                                        userId: userId,
                                        email: email,
                                        displayName: displayName,
                                        headline: headline,
                                        imageUrl: imageUrl,
                                        location: location,
                                        bio: bio,
                                        website: website
                                    },
                                    // isOnline: isOnline,
                                    connections: connections,
                                    pendingConnections: pendingConnections,
                                    messages: messages,
                                    // likes: likes
                                }
                            })
                        })
                })
                .catch(err => console.log(err))
            db.doc(`/users/${authId}`)
                .update(outgoing)
                .then(() => {
                    db.doc(`/users/${authId}`).get()
                    .then(doc => {
                        dispatch(updateOutgoingRequests(doc.data().outgoingRequests))
                    })
                })
                .catch(err => {console.log(err)})
        }
    }
}













