import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  authenticate,
  getAuthenticatedUser,
} from "../redux/actions/authActions";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
  AsyncStorage,
  MaskedViewIOS,
  Animated,
} from "react-native";
import Colors from "../constants/Colors";
import jwtDecode from "jwt-decode";
import { saveDataToStorage } from "../redux/actions/authActions";
import { useColorScheme } from "react-native-appearance";

import * as firebase from "firebase";
import { db } from "../Firebase/Fire";

const LoadingScreen = (props) => {
  const scheme = useColorScheme();
  let background, text;
  if (scheme === "dark") {
    background = "#1B1B1B";
    text = "white";
  } else {
    background = "white";
    text = "black";
  }
  // const [loadingProgress, setLoadingProgress] = useState(new Animated.Value(0))
  // const [animationDone, setAnimationDone] = useState(false)

  const dispatch = useDispatch();

  useEffect(() => {
    // console.log('LOADING')
    const tryLogin = async () => {
      firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
          // let token, userId, expDate
          // console.log(user.uid)
          const authData = await AsyncStorage.getItem("authData");
          if (authData) {
            const transformedData = JSON.parse(authData);
            const { token, userId } = transformedData;
            dispatch(authenticate(token, userId));
          } else {
            const token = await user.getIdToken();
            const userId = user.uid;
            const expDate = new Date(jwtDecode(token).exp * 1000);
            saveDataToStorage(token, userId, expDate);
          }
          setTimeout(() => {
            db.doc(`/users/${user.uid}`)
              .get()
              .then((userDoc) => {
                if (userDoc.exists) {
                  const {
                    isNewUser,
                    userId,
                    email,
                    displayName,
                    headline,
                    imageUrl,
                    location,
                    bio,
                    website,
                    connections,
                    pendingConnections,
                    outgoingRequests,
                    messages,
                    isAdmin,
                    lastReadAnnouncements,
                  } = userDoc.data();
                  dispatch(
                    getAuthenticatedUser(
                      isNewUser,
                      userId,
                      email,
                      displayName,
                      headline,
                      imageUrl,
                      location,
                      bio,
                      website,
                      connections,
                      pendingConnections,
                      outgoingRequests,
                      messages,
                      isAdmin,
                      lastReadAnnouncements
                    )
                  );
                  if (isNewUser) {
                    props.navigation.navigate({
                      routeName: "ChooseProfilePicture",
                      params: {
                        authPic: imageUrl,
                      },
                    });
                  } else {
                    // TODO: CONSIDER FETCHING NECESSARY DATA HERE BEFORE NAVIGATING TO THE APP
                    props.navigation.navigate("App");
                  }
                } else {
                  console.log("userDoc DOES NOT EXIST YET");
                  props.navigation.navigate("Intro");
                }
              });
          }, 1000);

          /* 
                        THIS CHECKS IF USER IS IN APP DATABASE. 
                        TEMPORARILY COMMENTED OUT FOR NOW 
                        SO NAVIGATION DOESN'T INTERFERE WITH 
                        SOCIAL AUTH IN AuthScreen.js
                        
                        
                    */
        } else {
          props.navigation.navigate("Intro");
        }
        return;
      });
    };

    tryLogin();
  }, [dispatch]);

  // TODO: ADD FIREBASE LISTENERS FROM AUTH ACTIONS (authActions.js:464)
  //   useEffect(() => {}, []);

  return (
    <View style={{ ...styles.screen, backgroundColor: background }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  // const colorLayer = animationDone ? null : <View style={[StyleSheet.absoluteFill, {backgroundColor: Colors.placeholder}]} />
  // const themeColorLayer = <View style={[StyleSheet.absoluteFill, {backgroundColor: background}]} />

  // useEffect(() => {
  //     Animated.timing(loadingProgress, {
  //         toValue: 100,
  //         duration: 1000,
  //         useNativeDriver: true,
  //         delay: 800
  //     }).start(() => {
  //         setAnimationDone(true)
  //     })
  // },[])

  // return (
  //     <View style={styles.screen}>
  //         {colorLayer}
  //         <MaskedViewIOS
  //             style={{flex: 1}}
  //             maskElement={
  //                 <View style={styles.screen}>
  //                     <Animated.Image
  //                         source={require('../assets/lnb.png')}
  //                         style={[{
  //                             width: 1000,
  //                             transform: [{
  //                                 scale: loadingProgress.interpolate({
  //                                     inputRange: [0, 15, 100],
  //                                     outputRange: [0.1, 0.06, 16]
  //                                 })
  //                             }]
  //                         }]}
  //                         resizeMode='contain'
  //                     />
  //                 </View>
  //             }>
  //             {themeColorLayer}
  //             <Animated.View style={{
  //                 ...styles.screen,
  //                 opacity: loadingProgress.interpolate({
  //                     inputRange: [0, 25, 50],
  //                     outputRange: [0, 0, 1],
  //                     extrapolate: 'clamp'
  //                 })
  //             }}>
  //                 <Image source={require('../assets/lnb.png')} style={{width: 300}} resizeMode='contain'/>
  //             </Animated.View>
  //         </MaskedViewIOS>
  //     </View>
  // )
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingScreen;
