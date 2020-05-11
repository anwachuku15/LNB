import config from '../../Firebase/Fire'
import firebase from 'firebase'
// import '@firebase/firestore'
import moment from 'moment'
import Need from '../../models/need-model'
import { setNotifications } from './authActions'
const db = firebase.firestore()

export const CREATE_NEED = 'CREATE_NEED'
export const CREATE_NEED_NOIMG = 'CREATE_NEED_NOIMG'
export const DELETE_NEED = 'DELETE_NEED'
export const SET_NEEDS = 'SET_NEEDS'
export const SET_NEED = 'SET_NEED'
export const LIKE_NEED = 'LIKE_NEED'
export const UNLIKE_NEED = 'UNLIKE_NEED'
export const CREATE_COMMENT = 'CREATE_COMMENT'

export const fetchNeeds = () => {
    return async (dispatch, getState) => {
        const userId = getState().auth.userId
        try {
            const loadedNeeds = []
            const needsData = await db.collection('needs').orderBy('timestamp', 'desc').get()
            needsData.forEach(doc => {
                loadedNeeds.push({
                    id: doc.id,
                    timestamp: doc.data().timestamp,
                    uid: doc.data().uid,
                    userName: doc.data().userName,
                    userImage: doc.data().userImage,
                    body: doc.data().body,
                    imageUrl: doc.data().image ? doc.data().image : null,
                    likeCount: doc.data().likeCount,
                    commentCount: doc.data().commentCount
                })
            })
            dispatch({
                type: SET_NEEDS,
                allNeeds: loadedNeeds,
                userNeeds: loadedNeeds.filter(need => need.uid === userId)
            })
        } catch (err) {
            throw err
        }
    }
}


export const createNeed = (userName, body, localUri) => {
    return async (dispatch, getState) => {
        const uid = getState().auth.userId
        const userImage = getState().auth.credentials.imageUrl
        let remoteUri, postId
        const timestamp = moment(Date.now()).toISOString()
        if (localUri !== '') {
            remoteUri = await uploadPhotoAsyn(localUri)
            db.collection('needs')
            .add({
                userName,
                body,
                uid: uid,
                userImage: userImage,
                timestamp: timestamp,
                image: remoteUri,
                commentCount: 0,
                likeCount: 0
            })
            .then(doc => {
                postId = doc.id
            })

            dispatch({
                type: CREATE_NEED,
                postData: {
                    id: postId,
                    timestamp: timestamp,
                    userName: userName,
                    userImage: userImage,
                    body: body,
                    imageUrl: remoteUri,
                    commentCount: 0,
                    likeCount: 0
                }
            })
        } else {
            db.collection('needs')
            .add({
                userName,
                body,
                uid,
                userImage,
                timestamp: timestamp,
                imageUrl: null,
                commentCount: 0,
                likeCount: 0
            })
            .then(doc => {
                postId = doc.id
            })
            dispatch({
                type: CREATE_NEED,
                postData: {
                    id: postId,
                    uid: uid,
                    timestamp: timestamp,
                    userName: userName,
                    userImage: userImage,
                    body: body,
                    imageUrl: null,
                    commentCount: 0,
                    likeCount: 0
                }
            })
        }
    } 
}

export const createNeedNoImg = (userName, body) => {
    return async (dispatch, getState) => {
        const uid = getState().auth.userId
        const userImage = getState().auth.credentials.imageUrl
        const timestamp = moment(Date.now()).toISOString()
        let postId
        db.collection('needs')
        .add({
            userName,
            body,
            uid,
            userImage,
            timestamp: timestamp,
            commentCount: 0,
            likeCount: 0
        })
        .then(doc => {
            postId = doc.id
        })
        dispatch({
            type: CREATE_NEED_NOIMG,
            postData: {
                id: postId,
                uid: uid,
                timestamp: timestamp,
                userName: userName,
                userImage: userImage,
                body: body,
                commentCount: 0,
                likeCount: 0
            }
        })
    }
}

export const createComment = (postId, body, localUri) => {
    return async (dispatch, getState) => {
        const uid = getState().auth.userId
        const userName = getState().auth.credentials.displayName
        const userImage = getState().auth.credentials.imageUrl
        const needDocument = db.doc(`/needs/${postId}`)

        let imageUrl, commentId
        if (localUri !== undefined) {
            imageUrl = await uploadPhotoAsyn(localUri)
        } else {
            imageUrl = null
        }
        const timestamp = moment(Date.now()).toISOString()
        const newComment = {
            timestamp,
            postId,
            uid,
            userName,
            userImage,
            body,
            imageUrl,
            commentCount: 0,
            likeCount: 0
        }
        let needData
        
        needDocument.get()
            .then(doc => {
                if (doc.exists) {
                    needData = doc.data()
                    needData.id = doc.id
                }
            })
            .catch(err => {
                console.log(err)
            })
        
        db.collection('comments')
        .add(newComment)
        .then(doc => {
            commentId = doc.id
            needData.commentCount++
            db.doc(`/needs/${postId}`).update({ commentCount: needData.commentCount })
        })
        .catch(err => {
            console.error(err)
        })
        dispatch({
            type: CREATE_COMMENT,
            commentData: {
                id: commentId,
                timestamp: newComment.timestamp,
                postId: newComment.postId,
                uid: newComment.uid,
                userName: newComment.userName,
                userImage: newComment.userImage,
                body: newComment.body,
                imageUrl: newComment.imageUrl,
                commentCount: newComment.commentCount,
                likeCount: newComment.likeCount
            }
        })
        dispatch(getNeed(postId))

    } 
}

export const getNeed = (needId) => {
    return async dispatch => {
        try {
            const needData = await db.doc(`/needs/${needId}`).get()
            dispatch({
                type: SET_NEED,
                need: needData.data()
            })
        } catch (err) {
            throw err
        }
    }
}

const uploadPhotoAsyn = async uri => {
    const path = `photos/${this.uid}/${Date.now()}.jpg`
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

export const likeNeed = (needId) => {
    return async (dispatch, getState) => {
        const likeDocument = db
            .collection('likes')
            .where('uid','==',firebase.auth().currentUser.uid)
            .where('needId', '==', needId)
            .limit(1)
        const needDocument = db.doc(`/needs/${needId}`)
        
        let needData
        let needUserId
        const authUserId = firebase.auth().currentUser.uid
        const authUserName = getState().auth.credentials.displayName
        const authUserImage = getState().auth.credentials.imageUrl
        needDocument.get()
            .then(doc => {
                if (doc.exists) {
                    needData = doc.data()
                    needData.id = doc.id
                    return likeDocument.get()
                } else {
                    return res.status(404).json({error: 'Post does not exist'})
                }
            })
            .then(data => {
                if (data.empty) {
                    return db.collection('likes').add({
                        needId: needId,
                        uid: authUserId,
                        userName: authUserName,
                        userImage: authUserImage,
                        timestamp: new Date().toISOString()
                    })
                    .then(() => {
                        dispatch({
                            type: LIKE_NEED,
                            needData: needData 
                        })
                        needData.likeCount++
                        return needDocument.update({ likeCount: needData.likeCount })
                    })
                    .then(() => {
                        db.doc(`/needs/${needId}`).get()
                        .then(async (doc) => {
                            needUserId = doc.data().uid
                            const pushToken = (await db.doc(`/users/${needUserId}`).get()).data().pushToken
                            if (pushToken) {
                                sendLikeNeedNotification(needId, needUserId, pushToken, authUserId, authUserName, authUserImage)
                            }
                        })
                    })
                } else {
                    // unlike 
                }
            })
            .catch(err => {
                console.error(err)
            })
    }
}

const sendLikeNeedNotification = (needId, recipientId, pushToken, authId, authName, authImage) => {
    db.collection('notifications').add({
        timestamp: new Date().toISOString(),
        type: 'likeNeed',
        needId,
        recipientId,
        senderId: authId,
        senderName: authName,
        senderImage: authImage,
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
            title: 'New Like',
            body: authName + ' liked one of your needs.'
        })
    })
}

export const unLikeNeed = (needId) => {
    return async (dispatch, getState) => {
        const likeDocument = db
            .collection('likes')
            .where('uid', '==', firebase.auth().currentUser.uid)
            .where('needId', '==', needId)
            .limit(1)
        const needDocument = db.doc(`/needs/${needId}`)

        let needData
        needDocument.get()
            .then(doc => {
                if (doc.exists) {
                    needData = doc.data()
                    needData.id = doc.id
                    return likeDocument.get()
                } else {
                    return res.status(404).json({error: 'Post does not exist'})
                }
            })
            .then(data => {
                if (data.empty) {
                    return res.status(400).json({error: 'post not liked'})
                } else {
                    return db.doc(`/likes/${data.docs[0].id}`)
                        .delete()
                        .then(() => {
                            dispatch({
                                type: UNLIKE_NEED,
                                needData: needData
                            })
                            needData.likeCount--
                            return needDocument.update({ likeCount: needData.likeCount })
                        })
                        .catch(err => {
                            console.log(err)
                        })
                }
            })
            .then(async () => {
                db.collection('notifications')
                .where('needId', '==', needId)
                .where('senderId', '==', firebase.auth().currentUser.uid)
                .limit(1)
                .get()
                .then(data => {
                    db.doc(`/notifications/${data.docs[0].id}`)
                    .delete()
                    // .then(() => {
                    //     dispatch(setNotifications())
                    // })
                })
            })
            .catch(err => {
                console.error(err)
            })
    }
}



