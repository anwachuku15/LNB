
import firebase from 'firebase'
import '@firebase/firestore'
import moment from 'moment'

export const db = firebase.firestore()

class Fire {

    getPosts = async () => {
        try {
            const data = await 
                db.collection('posts')
                  .orderBy('timestamp', 'desc')
                  .get()
            let posts = []
            data.forEach(post => {
                posts.push({
                    postId: post.id,
                    ...post.data()
                })
            })
        } catch (err) {
            throw err
        }
    }

    addPost = async ({post, localUri}) => {
        let remoteUri
        if (localUri) {
            remoteUri = await this.uploadPhotoAsyn(localUri)
            return new Promise((res, rej) => {
                firebase.firestore().collection('posts').add({
                    post,
                    uid: this.uid,
                    timestamp: moment(this.timestamp).toISOString(),
                    image: remoteUri
                })
                .then(ref => {
                    console.log(this.uid)
                    res(ref)
                })
                .catch(err => {
                    rej(err)
                })
            })
        } else {
            return new Promise((res, rej) => {
                firebase.firestore().collection('posts').add({
                    post,
                    uid: this.uid,
                    timestamp: moment(this.timestamp).toISOString()
                })
                .then(ref => {
                    res(ref)
                })
                .catch(err=> {
                    rej(err)
                })
            })
        }
    }


    uploadPhotoAsyn = async uri => {
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

    get firestore() {
        return firebase.firestore
    }

    get uid() {
        return (firebase.auth().currentUser || {}).uid
    }

    get timestamp() {
        return Date.now()
    }
}


Fire.shared = new Fire()

export default Fire