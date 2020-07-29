import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native'
import { Badge, } from 'react-native-elements'
import Clipboard from '@react-native-community/clipboard'
import {NavigationActions, DrawerActions} from 'react-navigation'
import { useColorScheme } from 'react-native-appearance'

import { MaterialCommunityIcons, Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons'
import Colors from '../../constants/Colors'
import { useSelector, useDispatch } from 'react-redux'
import { setNotifications } from '../../redux/actions/authActions'
import { LinearGradient } from 'expo-linear-gradient'

import { db } from '../../Firebase/Fire'

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height

let text, themeColor
const DrawerScreen = props => {
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        text = 'white'
        themeColor = 'black'
    } else {
        text = 'black'
        themeColor = 'white'
    }
    const uid = useSelector(state => state.auth.userId)
    const user = useSelector(state => state.auth)
    const isAdmin = useSelector(state => state.auth.credentials.isAdmin)

    const dispatch = useDispatch()
    const [isMounted, setIsMounted] = useState(true)
    const [admin, setAdmin] = useState(false)

    
    useEffect(() => {
      setAdmin(isAdmin)
    }, [])

    useEffect(() => {
      setIsMounted(true)
      return () => {
        setIsMounted(false)
        // console.log('Drawer Is Unmounted')
      }
    }, [])
  
    return (
      (isMounted && 
        <View style={styles.container}>
            <View style={styles.top}>
              {/* <ImageBackground
                  source={{uri: user.credentials.imageUrl, cache: 'force-cache'}}
                  style={[
                      StyleSheet.absoluteFill, {
                          width: '100%',
                          height: '100%',
                          opacity: 0.4,
                      },
                  ]}
                  blurRadius={10}
              >
                  <LinearGradient 
                      colors={['transparent', themeColor,]} 
                      style={{position: 'absolute', left: 0, right: 0, top: 0, height: '100%' }}
                  />
              </ImageBackground> */}
                <TouchableOpacity 
                  onPress={() => 
                    props.navigation.navigate({
                      routeName: 'UserProfile',
                      params: {
                        userId: uid,
                        name: user.credentials.displayName
                      }
                    })
                  }
                >
                  <Image 
                      source={{uri: user.credentials.imageUrl}}
                      style={{alignSelf: 'center', marginRight: 30, ...styles.photo}}
                  />
                  <Text style={{...styles.userName, color:text, alignSelf: 'center', marginRight: 30}}>{user.credentials.displayName}</Text>
                </TouchableOpacity>
                <View>
                    <TouchableOpacity 
                      onPress={() => 
                        props.navigation.navigate({
                          routeName: 'UserProfile',
                          params: {
                            userId: uid,
                            name: user.credentials.displayName
                          }
                        })
                      }
                    >
                      <Text style={{...styles.viewProfile, ...{color:Colors.blue}}}>View Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => props.navigation.navigate('editProfileModal')}>
                      <Text style={{...styles.editProfile, ...{color:Colors.green}}}>
                        {/* {(user.credentials.headline !== '') || (user.credentials.bio !== '') || (user.credentials.location !== '') ? 
                          'Complete Profile' : 'Edit Profile'
                        } */}
                        Update Profile
                      </Text>
                    </TouchableOpacity>
                    {((user.credentials.headline === '') || (user.credentials.location === '') || (user.credentials.website === '')) && 
                      <Badge 
                          Component={() => (
                              <FontAwesome
                                  name='exclamation-triangle'
                                  size={14}
                                  color={Colors.red}
                              />
                          )}
                          containerStyle={{position: 'absolute', right: 20}}
                      />
                    }
                </View>
            </View>

            <ScrollView>
                <TouchableOpacity 
                  onPress={() => 
                    props.navigation.navigate({
                      routeName: 'UserProfile',
                      params: {
                        userId: uid,
                        name: user.credentials.displayName
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
                          color={Colors.primary}
                      />
                      <Text style={{...styles.text, ...{color:text}}}> Profile </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{
                  // props.navigation.navigate({
                  //   routeName: 'Events'
                  // })
                }} style={styles.list}>
                    <View>
                        <Ionicons style={styles.icon} name='ios-calendar' size={20} color={Colors.disabled} />
                        <Text style={{...styles.text, ...{color:Colors.socialdark}}}> Events </Text>
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
                          color={Colors.disabled}/>
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
                            color={Colors.primary}/>
                        <Text style={{...styles.text, ...{color:text}}}> Settings </Text>
                    </View>
                </TouchableOpacity>
                {admin &&
                  <TouchableOpacity 
                    style={styles.list} 
                    onPress={() => {
                      props.navigation.navigate('Admin')
                    }}
                  >
                      <View>
                          <MaterialCommunityIcons
                              style={styles.icon}
                              name="account-badge-outline"
                              size={23}
                              color={Colors.redcrayola}
                            />
                          <Text style={{...styles.text, ...{color:Colors.redcrayola}}}> Admin </Text>
                      </View>
                  </TouchableOpacity>
                }
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
      width: 100,
      height: 100,
      borderRadius: 30,
      marginTop: 20
    },
    userName:{
      marginTop: 15,
      marginBottom: 10,
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