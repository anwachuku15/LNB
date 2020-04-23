import firebase from 'firebase'


const db = firebase.firestore()

export const send = (messages, messagesId) => {
    messages.forEach(dm => {
        const message = {
            userId: dm.userId,
            text: dm.text,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
        }
        db.doc(`messages/${messagesId}`).set(
            {messages: message},
            {merge: true}
        )
    })
}

const parse = message => {
    const {userId, text, timestamp} = message.val()
    // const 
}