import config from '../../Firebase/Fire'
import firebase from 'firebase'
// import '@firebase/firestore'
import moment from 'moment'
import { uploadPhotoAsyn } from '../actions/authActions'
const db = firebase.firestore()

export const CREATE_ANNOUNCEMENT = 'CREATE_ANNOUNCEMENT'
export const CREATE_ANNOUNCEMENT_NOIMG = 'CREATE_ANNOUNCEMENT_NOIMG'
export const DELETE_ANNOUNCEMENT = 'DELETE_ANNOUNCEMENT'


// Consider drafts (published: false vs published: true, pubTimestamp)
export const createAnnouncement = (admin, body, localUri) => {
    return async (dispatch, getState) => {
        const uid = getState().auth.userId
        const adminHeadline = getState().auth.credentials.headline
        const adminImage = getState().auth.credentials.imageUrl
        let remoteUri, announcementId

        const timestamp = moment(Date.now()).toISOString()
        if (localUri !== '') {
            remoteUri = await uploadPhotoAsyn(localUri)
            db.collection('announcements')
            .add({
                admin,
                body,
                uid: uid,
                adminImage,
                adminHeadline,
                timestamp: timestamp,
                imageUrl: remoteUri,
                commentCount: 0,
                likeCount: 0
            })
            .then(doc => {
                announcementId = doc.id
            })
            .catch(err => console.log(err))

            sendAnnouncementNotification(announcementId)

            dispatch({
                type: CREATE_ANNOUNCEMENT,
                postData: {
                    id: announcementId,
                    uid,
                    timestamp: timestamp,
                    admin,
                    adminImage,
                    adminHeadline,
                    body: body,
                    imageUrl: remoteUri,
                    commentCount: 0,
                    likeCount: 0
                }
            })
        } else {
            db.collection('announcements')
            .add({
                admin,
                body,
                uid,
                adminImage,
                adminHeadline,
                timestamp: timestamp,
                imageUrl: null,
                commentCount: 0,
                likeCount: 0
            })
            .then(doc => {
                announcementId = doc.id
            })
            .catch(err => console.log(err))

            sendAnnouncementNotification(announcementId)
            
            dispatch({
                type: CREATE_ANNOUNCEMENT,
                postData: {
                    id: announcementId,
                    uid: uid,
                    timestamp: timestamp,
                    admin,
                    adminImage,
                    adminHeadline,
                    body: body,
                    imageUrl: null,
                    commentCount: 0,
                    likeCount: 0
                }
            })
        }
    } 
}

export const createAnnouncementNoImg = (admin, body) => {
    return async (dispatch, getState) => {
        const uid = getState().auth.userId
        const adminHeadline = getState().auth.credentials.headline
        const adminImage = getState().auth.credentials.imageUrl
        const timestamp = moment(Date.now()).toISOString()
        let announcementId
        db.collection('announcements')
        .add({
            admin,
            body,
            uid,
            adminImage,
            adminHeadline,
            imageUrl: null,
            timestamp: timestamp,
            commentCount: 0,
            likeCount: 0
        })
        .then(doc => {
            announcementId = doc.id
        })
        .catch(err => console.log(err))

        sendAnnouncementNotification(announcementId)

        dispatch({
            type: CREATE_ANNOUNCEMENT_NOIMG,
            postData: {
                id: announcementId,
                uid: uid,
                timestamp: timestamp,
                admin,
                adminImage,
                adminHeadline,
                body: body,
                commentCount: 0,
                likeCount: 0
            }
        })

    }
}

const sendAnnouncementNotification = (announcementId) => {
    db.collection('users')
    // .where('isAdmin', '==', true)
    .get()
    .then(data => {
        data.forEach(doc => {
            if (doc.data().pushToken) {
                let res = fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        to: doc.data().pushToken,
                        sound: 'default',
                        title: 'Announcement',
                        body: 'New announcement from LNB',
                        data: {
                            type: 'announcement',
                            announcementId: announcementId
                        },
                        _displayInForeground: true
                    })
                })
            }
        })
    })


}

export const deleteAnnouncement = (announcementId) => {
    db.doc(`/announcements/${announcementId}`).delete()
    .catch(err => console.log(err))
}