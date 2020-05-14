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


// UPDATE TWO COLLECTIONS: https://stackoverflow.com/questions/57653308/firestore-transaction-update-multiple-collections-in-a-single-transaction

exports.onUserImageChange = functions
  .firestore
  .document('/users/{userId}')
  .onUpdate((change) => {
    
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log('image has changed')
      const batch = db.batch()
      db.collection('needs')
        .where('uid','==',change.before.data().userId)
        .get()
        .then((data) => {
          data.forEach(doc => {
            const need = db.doc(`/needs/${doc.id}`)
            batch.update(need, { userImage: change.after.data().imageUrl })
          })
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