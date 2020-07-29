// import React, { useEffect, useState } from 'react'
// import { Platform, View, StyleSheet } from 'react-native'
// import { Badge, withBadge, Icon } from 'react-native-elements'
// import { useColorScheme } from 'react-native-appearance'
// import { useSelector, useDispatch } from 'react-redux'
// import { Ionicons, FontAwesome } from '@expo/vector-icons'
// import firebase from 'firebase'
// import Colors from '../../constants/Colors'
// import { db } from '../../Firebase/Fire'




// const ConnectIcon = props => {
//     // CARD THEME
//     const colorScheme = useColorScheme()
//     let cardTheme
//     if(colorScheme === 'dark') {
//         cardTheme = 'rgb(36,36,38)'
//     } else {
//         cardTheme = 'white'
//     }
//     const dispatch = useDispatch()
//     const uid = useSelector(state => state.auth.userId)
//     let notifications = useSelector(state => state.auth.connectNotifications.filter(notification => notification.type === 'new connection'))




//     return (
//         <View>
//             {/* {unreadCount > 0 ? (    */}
//             {notifications && notifications.length > 0 ? (
//                 <View>
//                     <FontAwesome 
//                         name='handshake-o' 
//                         size={23} 
//                         color={props.tabInfo.tintColor}
//                     />
//                     <Badge
//                         containerStyle={{position: 'absolute', top: 0, right: -1}}
//                         badgeStyle={{backgroundColor:Colors.blue, borderColor:Colors.raspberry}}
//                     />
//                 </View>
//             ) : (
//                 <Ionicons 
//                     name='handshake-o' 
//                     size={23} 
//                     color={props.tabInfo.tintColor}
//                 />
//             )}
//         </View>
//     )
// }

// const styles = StyleSheet.create({
// })

// export default ConnectIcon
