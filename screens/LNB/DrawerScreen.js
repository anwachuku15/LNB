import React from 'react'
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
import { useSelector } from 'react-redux'


let text
const DrawerScreen = props => {
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        text = 'white'
    } else {
        text = 'black'
    }

    const user = useSelector(state => state.auth)

    return (
        <View style={styles.container}>
            <View style={styles.top}>
              <TouchableOpacity onPress={() => props.navigation.navigate('Profile')}>
                <Image 
                    source={{uri: user.credentials.imageUrl}}
                    style={styles.photo}
                />
                <Text style={{...styles.userName, ...{color:text}}}>{user.credentials.displayName}</Text>
                {/* <Text style={{...styles.userHandle, ...{color:text}}}>Andrew Nwachuku</Text> */}
              </TouchableOpacity>
                <View>
                    <TouchableOpacity onPress={() => props.navigation.navigate('Profile')}>
                      <Text style={{...styles.viewProfile, ...{color:text}}}>View Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => props.navigation.navigate('Settings')}>
                      <Text style={{...styles.settings, ...{color:text}}}>Settings</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView>
                <TouchableOpacity 
                    onPress={() => {
                        props.navigation.navigate('Profile')
                    }}
                    style={{...styles.list, ...styles.firstList}}
                >
                    <View>
                        <FontAwesome
                            style={styles.icon}
                            name='user-o'
                            size={20}
                            color='rgb(136, 153, 166)'
                        />
                        {/* <MaterialIcons
                            style={styles.icon}
                            name='person'
                            size={20}
                            color='rgb(136, 153, 166)'
                        /> */}
                        <Text style={{...styles.text, ...{color:text}}}> Profile </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{}} style={styles.list}>
                    <View>
                        <Ionicons style={styles.icon} name='ios-calendar' size={20} color='rgb(136, 153, 166)' />
                        <Text style={{...styles.text, ...{color:text}}}> Events </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.list}>
                    <View>
                    <FontAwesome
                        style={styles.icon}
                        name='bookmark-o'
                        size={20}
                        color="rgb(136, 153, 166)"/>
                    <Text onPress={() => props.navigation.navigate('Profile')} style={{...styles.text, ...{color:text}}}> Bookmarks </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                    styles.list, {
                    borderBottomWidth: 0.3,
                    borderBottomColor: 'black'
                    }
                ]}>
                    <View>
                    <Ionicons
                        style={styles.icon}
                        name='md-analytics'
                        size={20}
                        color="rgb(136, 153, 166)"/>
                    <Text onPress={() => props.navigation.navigate('Profile')} style={{...styles.text, ...{color:text}}}> Moments </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.list}>
                    <View>
                        <MaterialCommunityIcons
                            style={styles.icon}
                            name="arrow-top-right"
                            size={20}
                            color="rgb(136, 153, 166)"/>
                        <Text onPress={() => props.navigation.navigate('Profile')} style={{...styles.text, ...{color:text}}}> Twitter Ads </Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
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
    settings:{
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
      borderTopColor: 'black'
    },
    icon:{
      position: "absolute",
      left: 20,
      top: 10
    }
  })
  
export default DrawerScreen