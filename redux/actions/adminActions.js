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
export const createAnnouncement = (admin, subject, body, localUri) => {
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
                subject,
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

            sendAnnouncementNotification(announcementId, subject)

            dispatch({
                type: CREATE_ANNOUNCEMENT,
                postData: {
                    id: announcementId,
                    uid,
                    timestamp: timestamp,
                    admin,
                    adminImage,
                    adminHeadline,
                    subject: subject,
                    body: body,
                    imageUrl: remoteUri,
                    commentCount: 0,
                    likeCount: 0
                },
            })
        } else {
            db.collection('announcements')
            .add({
                admin,
                subject,
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
            
            dispatch({
                type: CREATE_ANNOUNCEMENT,
                postData: {
                    id: announcementId,
                    uid: uid,
                    timestamp: timestamp,
                    admin,
                    adminImage,
                    adminHeadline,
                    subject: subject,
                    body: body,
                    imageUrl: null,
                    commentCount: 0,
                    likeCount: 0
                },
            })
        }
    } 
}

export const createAnnouncementNoImg = (admin, subject, body) => {
    return async (dispatch, getState) => {
        const uid = getState().auth.userId
        const adminHeadline = getState().auth.credentials.headline
        const adminImage = getState().auth.credentials.imageUrl
        const timestamp = moment(Date.now()).toISOString()
        let announcementId
        db.collection('announcements')
        .add({
            admin,
            subject,
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

        sendAnnouncementNotification(announcementId, subject)

        dispatch({
            type: CREATE_ANNOUNCEMENT_NOIMG,
            postData: {
                id: announcementId,
                uid: uid,
                timestamp: timestamp,
                admin,
                adminImage,
                adminHeadline,
                subject: subject,
                body: body,
                commentCount: 0,
                likeCount: 0
            }
        })

    }
}

const sendAnnouncementNotification = (announcementId, subject) => {
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
                        body: subject,
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
    return async dispatch => {
        try {
            await db.doc(`/announcements/${announcementId}`).delete()
            dispatch({
                type: DELETE_ANNOUNCEMENT,
                announcementId: announcementId
            })
        } catch (err) {
            console.log(err)
        }
        
    }
}

export const pinAnnouncement = (announcementId) => {
    return async dispatch => {
        db.collection('announcements')
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
                db.doc(`/announcements/${announcementId}`).set(
                    {isPinned: true}, 
                    {merge: true}
                )
            })
            .catch(err => console.log(err))
    }
}

export const unpinAnnouncement = (announcementId) => {
    return async => {
        db.collection('announcements')
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
            .catch(err => console.log(err))
    }
}
