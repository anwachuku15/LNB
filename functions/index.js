/* eslint-disable consistent-return */
/* eslint-disable promise/always-return */
const functions = require('firebase-functions');
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

// exports.onUserImageChange = functions
//   .firestore
//   .document('/users/')
