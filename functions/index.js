/* eslint-disable consistent-return */
/* eslint-disable promise/always-return */
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const firebaseConfig = {
    apiKey: "AIzaSyBjFDet9PN8mZjani67TVYKumPfqouGQyE",
    authDomain: "reactnative-ac7bd.firebaseapp.com",
    databaseURL: "https://reactnative-ac7bd.firebaseio.com",
    projectId: "reactnative-ac7bd",
    storageBucket: "reactnative-ac7bd.appspot.com",
    messagingSenderId: "974259196275",
    appId: "1:974259196275:web:216c9373645566b3edb506",
    measurementId: "G-5WY86MEB0H"
  };
admin.initializeApp(firebaseConfig)
const db = admin.firestore()

const algoliasearch = require('algoliasearch')
const APP_ID = functions.config().algolia.app
const ADMIN_KEY = functions.config().algolia.key

const client = algoliasearch(APP_ID, ADMIN_KEY)
const index = client.initIndex('LNBmembers')

exports.addToIndex = functions.firestore.document('/users/{userId}')
  .onCreate(snapshot => {
    const data = {
      uid: snapshot.id,
      name: snapshot.data().displayName,
      headline: snapshot.data().headline,
      location: snapshot.data().location,
      bio: snapshot.data().bio,
      imageUrl: snapshot.data().imageUrl,
      website: snapshot.data().website,
      connections: snapshot.data().connections
    }
    const objectID = snapshot.id

    return index.addObject({ data, objectID })
  })

exports.updateIndex = functions.firestore.document('/users/{userId}')
  .onUpdate((change) => {
    const newData = {
      uid: change.after.id,
      name: change.after.data().displayName,
      headline: change.after.data().headline,
      location: change.after.data().location,
      bio: change.after.data().bio,
      imageUrl: change.after.data().imageUrl,
      website: change.after.data().website,
      connections: change.after.data().connections
    }
    const objectID = change.after.id

    return index.saveObject({ newData, objectID })
  })

exports.deleteFromIndex = functions.firestore.document('/users/{userId}')
  .onDelete(snapshot => index.deleteObject(snapshot.id))


// UPDATE TWO COLLECTIONS: https://stackoverflow.com/questions/57653308/firestore-transaction-update-multiple-collections-in-a-single-transaction

exports.onUserImageChange = functions
  .firestore
  .document('/users/{userId}')
  .onUpdate((change) => {
    
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log('image has changed')
      const batch = db.batch()
      return db
        .collection('needs')
        .where('uid','==',change.before.data().userId)
        .get()
        .then((data) => {
          data.forEach(doc => {
            const need = db.doc(`/needs/${doc.id}`)
            batch.update(need, { userImage: change.after.data().imageUrl })
          })
          return db
            .collection('comments')
            .where('uid', '==', change.before.data().userId)
            .get()
        })
        .then((data) => {
          data.forEach(doc => {
            const comment = db.doc(`/comments/${doc.id}`)
            batch.update(comment, { userImage: change.after.data().imageUrl })
          })
          return db
            .collection('likes')
            .where('senderId', '==', change.before.data().userId)
            .get()
        })
        .then((data) => {
          data.forEach(doc => {
            const like = db.doc(`/likes/${doc.id}`)
            batch.update(like, { senderImage: change.after.data().imageUrl})
          })
          return db
            .collection('notifications')
            .where('type', 'in', ['likeNeed', 'new connection'])
            .where('senderId', '==', change.before.data().userId)
            .get()
        })
        .then((data) => {
          data.forEach(doc => {
            const notification = db.doc(`/notifications/${doc.id}`)
            batch.update(notification, { senderImage: change.after.data().imageUrl})
          })
          return batch.commit()
        })
        .catch(err => console.error(err))
    } else return true
  })

exports.onCommentCountChange = functions
  .firestore
  .document('/comments/{commentId}')
  .onDelete(snapshot => {
    return db.doc(`/needs/${snapshot.data().postId}`)
      .update({commentCount: admin.firestore.FieldValue.increment(-1)})
      .catch(err => {
        console.error(err)
      })
  })