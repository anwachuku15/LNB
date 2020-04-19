import config from '../../Firebase/Fire'
import firebase from 'firebase'
import '@firebase/firestore'
import moment from 'moment'
import Need from '../../models/need-model'
const db = firebase.firestore()

export const CREATE_NEED = 'CREATE_NEED'
export const CREATE_NEED_NOIMG = 'CREATE_NEED_NOIMG'
export const DELETE_NEED = 'DELETE_NEED'
export const SET_NEEDS = 'SET_NEEDS'
// export const SET_NEED = 'SET_NEED'

// export const fetchNeeds = () => {
//     return async (dispatch, getState) => {
//         const userId = getState().auth.userId
//         let loadedNeeds = []
//         db.collection('needs').orderBy('timestamp', 'desc')
//             .get()
//             .then(data => {
//                 data.forEach(doc => {
//                     loadedNeeds.push({
//                         id: doc.id,
//                         timestamp: doc.data().timestamp,
//                         uid: doc.data().uid,
//                         userName: doc.data().userName,
//                         userImage: doc.data().userImage,
//                         body: doc.data().body,
//                         imageUrl: doc.data().image ? doc.data().image : null,
//                         likeCount: doc.data().likeCount,
//                         commentCount: doc.data().commentCount
//                     })
//                 })
//             })
//             .then(() => {
//                 dispatch({
//                     type: SET_NEEDS,
//                     allNeeds: loadedNeeds,
//                     userNeeds: loadedNeeds.filter(need => need.uid === userId)
//                 })
//             })
//             .catch(err => {
//                 console.log(err)
//                 throw err
//             })
//     }
// }

export const fetchNeeds = () => {
    return async (dispatch, getState) => {
        const userId = getState().auth.userId
        try {
            const needsData = await db.collection('needs').orderBy('timestamp', 'desc').get()
            const loadedNeeds = []
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