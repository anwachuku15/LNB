import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import {NavigationActions, DrawerActions} from 'react-navigation'
import { useColorScheme } from 'react-native-appearance'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Colors from '../../constants/Colors'
import { useSelector, useDispatch } from 'react-redux'
import { setNotifications } from '../../redux/actions/authActions'

import firebase from 'firebase'
const db = firebase.firestore()


let text
const DrawerScreen = props => {
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        text = 'white'
    } else {
        text = 'black'
    }
    const uid = useSelector(state => state.auth.userId)
    const user = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const [isMounted, setIsMounted] = useState(true)
    useEffect(() => {
      setIsMounted(true)
      return () => {
        setIsMounted(false)
        console.log('Drawer Is Unmounted')
      }
    }, [])
  
    return (
      (isMounted && 
        <View style={styles.container}>
            <View style={styles.top}>
              <TouchableOpacity 
                onPress={() => 
                  props.navigation.navigate({
                    routeName: 'UserProfile',
                    params: {
                      userId: firebase.auth().currentUser.uid
                    }
                  })
                }
              >
                <Image 
                    source={{uri: user.credentials.imageUrl}}
                    style={styles.photo}
                />
                <Text style={{...styles.userName, ...{color:text}}}>{user.credentials.displayName}</Text>
                {/* <Text style={{...styles.userHandle, ...{color:text}}}>Andrew Nwachuku</Text> */}
              </TouchableOpacity>
                <View>
                    <TouchableOpacity 
                      onPress={() => 
                        props.navigation.navigate({
                          routeName: 'UserProfile',
                          params: {
                            userId: firebase.auth().currentUser.uid
                          }
                        })
                      }
                    >
                      <Text style={{...styles.viewProfile, ...{color:Colors.primary}}}>View Profile</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity onPress={() => props.navigation.navigate('EditProfile')}>
                      <Text style={{...styles.editProfile, ...{color:Colors.primary}}}>Edit Profile</Text>
                    </TouchableOpacity> */}
                </View>
            </View>

            <ScrollView>
                <TouchableOpacity 
                  onPress={() => 
                    props.navigation.navigate({
                      routeName: 'UserProfile',
                      params: {
                        userId: firebase.auth().currentUser.uid
                      }
                    })
                  }
                  style={{...styles.list, ...styles.firstList}}
                >
                  <View>
                      <FontAwesome
                          style={styles.icon}
                          name='user-o'
                          size={20}
                          color='rgb(136, 153, 166)'
                      />
                      <Text style={{...styles.text, ...{color:text}}}> Profile </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{
                  props.navigation.navigate({
                    routeName: 'Events'
                  })
                }} style={styles.list}>
                    <View>
                        <Ionicons style={styles.icon} name='ios-calendar' size={20} color='rgb(136, 153, 166)' />
                        <Text style={{...styles.text, ...{color:text}}}> Events </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.list} 
                  onPress={() => {}}
                >
                    <View>
                    <MaterialIcons
                        style={styles.icon}
                        name='group'
                        size={23}
                        color="rgb(136, 153, 166)"/>
                    <Text style={{...styles.text, ...{color:Colors.socialdark}}}> Network </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {}}
                  style={[
                  styles.list, {
                  borderBottomWidth: 0.3,
                  borderBottomColor: 'black'
                  }]}
                >
                    <View>
                      <Ionicons
                          style={styles.icon}
                          name='md-analytics'
                          size={20}
                          color="rgb(136, 153, 166)"/>
                      <Text style={{...styles.text, ...{color:Colors.socialdark}}}> Trending </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.list} 
                  onPress={() => {
                    props.navigation.navigate('Settings')
                  }}
                >
                    <View>
                        <Ionicons
                            style={styles.icon}
                            name="ios-cog"
                            size={23}
                            color="rgb(136, 153, 166)"/>
                        <Text style={{...styles.text, ...{color:text}}}> Settings </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.list} 
                  onPress={() => {
                    props.navigation.navigate('Developer')
                  }}
                >
                    <View>
                        <MaterialIcons
                            style={styles.icon}
                            name="developer-board"
                            size={23}
                            color={Colors.redcrayola}/>
                        <Text style={{...styles.text, ...{color:Colors.redcrayola}}}> Dev Notes </Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
      )
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    //   backgroundColor: 'rgb(27, 42, 51)',
    //   backgroundColor: Colors.blacksmoke,
      paddingTop: 10
    },
    list: {
      padding: 10,
      height: 60,
      borderColor: 'red',
      borderWidth: 0
    },
    text: {
      position: "absolute",
      left: "24%",
      top: 10,
    //   color: "white",
    //   color: 'rgb(136, 153, 166)',
      fontSize: 16
    },
    top:{
      paddingBottom: 40,
      paddingLeft: 30,
      marginBottom:10
    },
    photo: {
      width: 50,
      height: 50,
      borderRadius: 30,
      marginTop: 20
    },
    userName:{
      marginTop: 15,
      color: "white",
      fontWeight: "bold"
    },
    userHandle:{
      marginTop: 15,
      color: "rgb(136, 153, 166)",
      fontWeight: "300"
    },
    viewProfile:{
      color: "white",
      position: 'absolute',
      left: 0,
      top: 10,
      // fontWeight: 'bold'
    },
    editProfile:{
      color: "white",
      position: 'absolute',
      right: 30,
      top: 10,
      // fontWeight: "bold"
    },
    followingText:{
      color: "rgb(136, 153, 166)",
      fontWeight: "300"
    },
    followersText:{
      color: "rgb(136, 153, 166)",
      fontWeight: "300"
    },
    firstList:{
      marginTop: 0,
      borderTopWidth: 0.3,
      borderTopColor: 'black',
      height: 60,
      borderTopWidth: 0.3,
      // borderTopColor: 'black'
    },
    icon:{
      position: "absolute",
      left: 20,
      top: 10
    }
  })
  
export default DrawerScreen