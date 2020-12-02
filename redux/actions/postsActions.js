import config from "../../Firebase/Fire";
import firebase from "firebase";
// import '@firebase/firestore'
import FirePostData from "../../Firebase/FireRedux";
import moment from "moment";
import Need from "../../models/need-model";
import { db } from "../../Firebase/Fire";

export const CREATE_NEED = "CREATE_NEED";
export const CREATE_NEED_NOIMG = "CREATE_NEED_NOIMG";
export const DELETE_NEED = "DELETE_NEED";
export const SET_NEEDS = "SET_NEEDS";
export const SET_NEED = "SET_NEED";
export const SET_EVENT_POSTS = "SET_EVENT_POSTS";
export const LIKE_NEED = "LIKE_NEED";
export const UNLIKE_NEED = "UNLIKE_NEED";
export const CREATE_COMMENT = "CREATE_COMMENT";

export const fetchNeeds = () => {
  return async (dispatch, getState) => {
    const userId = getState().auth.userId;
    try {
      const loadedNeeds = await FirePostData.fetchNeeds();

      dispatch({
        type: SET_NEEDS,
        allNeeds: loadedNeeds,
        userNeeds: loadedNeeds.filter((need) => need.uid === userId),
      });
    } catch (err) {
      console.log(err);
    }
  };
};

export const fetchEventPosts = () => {
  return async (dispatch, getState) => {
    const userId = getState().auth.userId;
    try {
      const loadedEventPosts = await FirePostData.fetchEventPosts();

      dispatch({
        type: SET_EVENT_POSTS,
        eventPosts: loadedEventPosts,
      });
    } catch (err) {
      console.log(err);
    }
  };
};

// Consider drafts (published: false vs published: true, pubTimestamp)
export const createNeed = (userName, body, media, postType, taggedUsers) => {
  return async (dispatch, getState) => {
    const uid = getState().auth.userId;
    const userImage = getState().auth.credentials.imageUrl;
    let remoteUri, postId;

    const timestamp = moment(Date.now()).toISOString();
    if (media !== "") {
      if (media.uri) {
        remoteUri =
          media.type === "video"
            ? await FirePostData.uploadVideoAsyn(media.localUri)
            : await FirePostData.uploadPhotoAsyn(media.uri);
      } else {
        remoteUri = await FirePostData.uploadPhotoAsyn(media);
      }

      FirePostData.createNeedMedia(
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
      );

      dispatch({
        type: CREATE_NEED,
        postData: {
          id: postId,
          uid: uid,
          timestamp: timestamp,
          postType: postType,
          userName: userName,
          userImage: userImage,
          body: body,
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
        },
      });
    } else {
      FirePostData.createNeed(
        timestamp,
        postId,
        postType,
        uid,
        userImage,
        userName,
        body,
        taggedUsers
      );

      dispatch({
        type: CREATE_NEED,
        postData: {
          id: postId,
          uid: uid,
          timestamp: timestamp,
          postType: postType,
          userName: userName,
          userImage: userImage,
          body: body,
          commentCount: 0,
          likeCount: 0,
          taggedUsers: taggedUsers,
        },
      });
    }
  };
};

export const deleteNeed = (needId) => {
  db.doc(`/needs/${needId}`)
    .delete()
    .catch((err) => console.log(err));
};

export const createComment = (postId, body, localUri) => {
  return async (dispatch, getState) => {
    const uid = getState().auth.userId;
    const userName = getState().auth.credentials.displayName;
    const userImage = getState().auth.credentials.imageUrl;
    const needDocument = db.doc(`/needs/${postId}`);
    const authUserId = getState().auth.userId;
    const authUserName = getState().auth.credentials.displayName;
    const authUserImage = getState().auth.credentials.imageUrl;

    let imageUrl, commentId, needUserId;
    if (localUri !== undefined) {
      imageUrl = await FirePostData.uploadPhotoAsyn(localUri);
    } else {
      imageUrl = null;
    }

    const timestamp = moment(Date.now()).toISOString();
    const newComment = {
      timestamp,
      postId,
      uid,
      userName,
      userImage,
      body,
      imageUrl,
      commentCount: 0,
      likeCount: 0,
    };
    let needData;

    needDocument
      .get()
      .then((doc) => {
        if (doc.exists) {
          needData = doc.data();
          needData.id = doc.id;
          FirePostData.addComment(
            newComment,
            commentId,
            needData,
            postId,
            needUserId,
            authUserId,
            authUserName,
            authUserImage
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });

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
        likeCount: newComment.likeCount,
      },
    });
    dispatch(getNeed(postId));
  };
};

export const getNeed = (needId) => {
  return async (dispatch) => {
    try {
      const needData = await db.doc(`/needs/${needId}`).get();
      dispatch({
        type: SET_NEED,
        need: needData.data(),
      });
    } catch (err) {
      throw err;
    }
  };
};

export const likeNeed = (needId) => {
  // UNHANDLED PROMISE REJECTION
  return async (dispatch, getState) => {
    const userId = getState().auth.userId;
    const likeDocument = db
      .collection("likes")
      .where("uid", "==", userId)
      .where("needId", "==", needId)
      .limit(1);
    const needDocument = db.doc(`/needs/${needId}`);

    let needData;
    let needUserId;
    const authUserId = userId;
    const authUserName = getState().auth.credentials.displayName;
    const authUserImage = getState().auth.credentials.imageUrl;
    needDocument
      .get()
      .then((doc) => {
        if (doc.exists) {
          needData = doc.data();
          needData.id = doc.id;
          return likeDocument.get();
        } else {
          return res.status(404).json({ error: "Post does not exist" });
        }
      })
      .then((data) => {
        if (data.empty) {
          return db
            .collection("likes")
            .add({
              needId: needId,
              uid: authUserId,
              userName: authUserName,
              userImage: authUserImage,
              timestamp: new Date().toISOString(),
            })
            .then(() => {
              dispatch({
                type: LIKE_NEED,
                needData: needData,
              });
              needData.likeCount++;
              return needDocument.update({ likeCount: needData.likeCount });
            })
            .then(() => {
              db.doc(`/needs/${needId}`)
                .get()
                .then(async (doc) => {
                  needUserId = doc.data().uid;
                  if (needUserId !== authUserId) {
                    const pushToken = (
                      await db.doc(`/users/${needUserId}`).get()
                    ).data().pushToken;
                    if (pushToken) {
                      sendLikeNeedNotification(
                        needId,
                        needUserId,
                        pushToken,
                        authUserId,
                        authUserName,
                        authUserImage
                      );
                    }
                  }
                });
            });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };
};

const sendLikeNeedNotification = (
  needId,
  recipientId,
  pushToken,
  authId,
  authName,
  authImage
) => {
  db.collection("notifications").add({
    timestamp: new Date().toISOString(),
    type: "likeNeed",
    needId,
    recipientId,
    senderId: authId,
    senderName: authName,
    senderImage: authImage,
    read: false,
  });
  let res = fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: pushToken,
      sound: "default",
      title: "New Like",
      body: authName + " liked one of your needs.",
      data: {
        type: "likeNeed",
        needId: needId,
        senderName: authName,
      },
    }),
  });
};

export const unLikeNeed = (needId) => {
  return async (dispatch, getState) => {
    const likeDocument = db
      .collection("likes")
      .where("uid", "==", getState().auth.userId)
      .where("needId", "==", needId)
      .limit(1);
    const needDocument = db.doc(`/needs/${needId}`);

    let needData;
    needDocument
      .get()
      .then((doc) => {
        if (doc.exists) {
          needData = doc.data();
          needData.id = doc.id;
          return likeDocument.get();
        } else {
          return res.status(404).json({ error: "Post does not exist" });
        }
      })
      .then((data) => {
        if (data.empty) {
          return res.status(400).json({ error: "post not liked" });
        } else {
          return db
            .doc(`/likes/${data.docs[0].id}`)
            .delete()
            .then(() => {
              dispatch({
                type: UNLIKE_NEED,
                needData: needData,
              });
              needData.likeCount--;
              return needDocument.update({ likeCount: needData.likeCount });
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .then(async () => {
        db.collection("notifications")
          .where("needId", "==", needId)
          .where("senderId", "==", getState().auth.userId)
          .limit(1)
          .get()
          .then((data) => {
            db.doc(`/notifications/${data.docs[0].id}`).delete();
          });
      })
      .catch((err) => {
        console.error(err);
      });
  };
};
