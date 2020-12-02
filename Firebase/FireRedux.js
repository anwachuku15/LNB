import * as firebase from "firebase";
import "@firebase/firestore";
import { db } from "./Fire";

class FirePostData {
  fetchNeeds = async () => {
    try {
      let loadedNeeds = [];
      const needsData = await db
        .collection("needs")
        .orderBy("timestamp", "desc")
        .get();
      const comments = await db.collection("comments").get();
      let postComments = [];
      comments.forEach((doc) => {
        postComments.push(doc.data().postId);
      });
      needsData.forEach(async (doc) => {
        const fetchCommentCount = postComments.filter(
          (postId) => postId === doc.id
        ).length;
        db.doc(`/needs/${doc.id}`).update({ commentCount: fetchCommentCount });
        loadedNeeds.push({
          id: doc.id,
          timestamp: doc.data().timestamp,
          postType: doc.data().postType,
          uid: doc.data().uid,
          userName: doc.data().userName,
          userImage: doc.data().userImage,
          body: doc.data().body,
          imageUrl: doc.data().imageUrl ? doc.data().imageUrl : null,
          media: doc.data().media ? doc.data().media : null,
          likeCount: doc.data().likeCount,
          //   commentCount: doc.data().commentCount,
          commentCount: fetchCommentCount,
          isPinned: doc.data().isPinned,
          taggedUsers: doc.data().taggedUsers,
        });
      });

      return loadedNeeds;
    } catch (err) {
      console.log(err);
    }
  };

  fetchEventPosts = async () => {
    try {
      let loadedNeeds = [];
      const needsData = await db
        .collection("needs")
        .where("postType", "==", "event")
        .orderBy("timestamp", "desc")
        .get();
      const comments = await db.collection("comments").get();
      let postComments = [];
      comments.forEach((doc) => {
        postComments.push(doc.data().postId);
      });
      needsData.forEach(async (doc) => {
        const fetchCommentCount = postComments.filter(
          (postId) => postId === doc.id
        ).length;
        db.doc(`/needs/${doc.id}`).update({ commentCount: fetchCommentCount });
        loadedNeeds.push({
          id: doc.id,
          timestamp: doc.data().timestamp,
          postType: doc.data().postType,
          uid: doc.data().uid,
          userName: doc.data().userName,
          userImage: doc.data().userImage,
          body: doc.data().body,
          imageUrl: doc.data().imageUrl ? doc.data().imageUrl : null,
          media: doc.data().media ? doc.data().media : null,
          likeCount: doc.data().likeCount,
          //   commentCount: doc.data().commentCount,
          commentCount: fetchCommentCount,
          isPinned: doc.data().isPinned,
          taggedUsers: doc.data().taggedUsers,
        });
      });

      return loadedNeeds;
    } catch (err) {
      console.log(err);
    }
  };

  uploadPhotoAsyn = async (uri) => {
    const path = `photos/${firebase.auth().currentUser.uid}/${Date.now()}.jpg`;
    // const path = `photos/${getState().auth.userId}/${Date.now()}.jpg`
    return new Promise(async (res, rej) => {
      const response = await fetch(uri);
      const file = await response.blob();

      let upload = firebase.storage().ref(path).put(file);

      upload.on(
        "state_changed",
        (snapshot) => {},
        (err) => {
          rej(err);
          console.log(err);
        },
        async () => {
          const url = await upload.snapshot.ref.getDownloadURL();
          res(url);
        }
      );
    });
  };

  uploadVideoAsyn = async (uri) => {
    const path = `videos/${firebase.auth().currentUser.uid}/${Date.now()}.mp4`;
    return new Promise(async (res, rej) => {
      const response = await fetch(uri);
      const file = await response.blob();
      let upload = firebase.storage().ref(path).put(file);
      // console.log(uri)
      // console.log(upload)
      upload.on(
        "state_changed",
        (snapshot) => {},
        (err) => {
          rej(err);
          console.log(err);
        },
        async () => {
          const url = await upload.snapshot.ref.getDownloadURL();
          res(url);
        }
      );
    });
  };

  createNeedMedia = (
    timestamp,
    postId,
    postType,
    uid,
    userImage,
    userName,
    body,
    media,
    remoteUri,
    taggedUsers
  ) => {
    db.collection("needs")
      .add({
        userName,
        body,
        uid: uid,
        userImage: userImage,
        timestamp: timestamp,
        postType: postType,
        media: media.type && {
          type: media.type === "video" ? "video" : "image",
          duration: media.type === "video" ? media.duration : null,
          uri: remoteUri,
          height: media.height,
          width: media.width,
        },
        imageUrl: !media.type ? remoteUri : null,
        commentCount: 0,
        likeCount: 0,
        taggedUsers: taggedUsers,
      })
      .then((doc) => {
        postId = doc.id;
      })
      .catch((err) => console.log(err));
  };

  createNeed = (
    timestamp,
    postId,
    postType,
    uid,
    userImage,
    userName,
    body,
    taggedUsers
  ) => {
    db.collection("needs")
      .add({
        userName,
        body,
        uid,
        userImage,
        timestamp: timestamp,
        postType: postType,
        commentCount: 0,
        likeCount: 0,
        taggedUsers: taggedUsers,
      })
      .then((doc) => {
        postId = doc.id;
      })
      .catch((err) => console.log(err));
  };

  deleteNeed = (needId) => {
    db.doc(`/needs/${needId}`)
      .delete()
      .catch((err) => console.log(err));
  };

  addComment = (
    newComment,
    commentId,
    needData,
    postId,
    needUserId,
    authUserId,
    authUserName,
    authUserImage
  ) => {
    db.collection("comments")
      .add(newComment)
      .then((doc) => {
        commentId = doc.id;
        needData.commentCount++;
        return db
          .doc(`/needs/${postId}`)
          .update({ commentCount: needData.commentCount });
      })
      .then(() => {
        db.doc(`/needs/${postId}`)
          .get()
          .then(async (doc) => {
            needUserId = doc.data().uid;
            if (needUserId !== authUserId) {
              const pushToken = (
                await db.doc(`/users/${needUserId}`).get()
              ).data().pushToken;
              this.sendCommentNeedNotification(
                postId,
                needUserId,
                pushToken,
                authUserId,
                authUserName,
                authUserImage
              );
            }
          });
        return db.collection("comments").where("postId", "==", postId).get();
      })
      .then((data) => {
        const commenters = [];
        data.forEach((doc) => {
          if (!commenters.includes(doc.data().uid)) {
            commenters.push(doc.data().uid);
          }
        });
        commenters.forEach(async (uid) => {
          if (uid !== needUserId && uid !== authUserId) {
            const pushToken = (await db.doc(`/users/${uid}`).get()).data()
              .pushToken;
            this.sendCommentNotificationBatch(
              postId,
              needData.userName,
              uid,
              pushToken,
              authUserId,
              authUserName,
              authUserImage
            );
          }
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  sendCommentNeedNotification = (
    needId,
    recipientId,
    pushToken,
    authId,
    authName,
    authImage
  ) => {
    db.collection("notifications").add({
      timestamp: new Date().toISOString(),
      type: "commentNeed",
      needId,
      recipientId,
      senderId: authId,
      senderName: authName,
      senderImage: authImage,
      read: false,
    });
    if (pushToken) {
      let res = fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: pushToken,
          sound: "default",
          title: "New Comment",
          body: authName + " commented on one of your needs.",
          data: {
            type: "commentNeed",
            needId: needId,
            senderName: authName,
          },
        }),
      });
    }
  };

  sendCommentNotificationBatch = (
    needId,
    needUserName,
    recipientId,
    pushToken,
    authId,
    authName,
    authImage
  ) => {
    db.collection("notifications").add({
      timestamp: new Date().toISOString(),
      type: "commentThread",
      needId,
      needUserName,
      recipientId,
      senderId: authId,
      senderName: authName,
      senderImage: authImage,
      read: false,
    });
    if (pushToken) {
      let res = fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: pushToken,
          sound: "default",
          title: "New Comment",
          body: authName + " replied to a need you commented on.",
          data: {
            type: "commentThread",
            needId: needId,
            senderName: authName,
          },
        }),
      });
    }
  };
}

export default new FirePostData();
