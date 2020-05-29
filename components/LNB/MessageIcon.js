import React, { useEffect, useState } from 'react'
import { Platform, View, StyleSheet } from 'react-native'
import { Badge, withBadge, Icon } from 'react-native-elements'
import { useColorScheme } from 'react-native-appearance'
import { useSelector, useDispatch } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'
import firebase from 'firebase'
import Colors from '../../constants/Colors'

const db = firebase.firestore()


const MessageIcon = props => {
    // CARD THEME
    const colorScheme = useColorScheme()
    let cardTheme
    if(colorScheme === 'dark') {
        cardTheme = 'rgb(36,36,38)'
    } else {
        cardTheme = 'white'
    }
    const dispatch = useDispatch()
    const uid = useSelector(state => state.auth.userId)
    const notifications = useSelector(state => state.auth.messageNotifications)
    
    // SET UNREAD NOTIFICATION COUNT WITH STATE
    let unread = notifications.filter(notification => notification.read === false)
    const BadgedIcon = withBadge(unread.length)(Icon)

    // SET UNREAD NOTIFICATION COUNT WITH FIRESTORE LISTENER
    const [unreadCount, setUnreadCount] = useState(0)

   
    // const BadgedIcon = withBadge(unreadCount)(Icon)

    return (
        <View>
            {/* {unreadCount > 0 ? (    */}
            {unread && unread.length > 0 ? (
                // <BadgedIcon
                //     type='ionicon'
                //     color={Colors.primary}
                //     name={Platform.OS==='android' ? 'md-chatboxes' : 'ios-chatboxes'}
                // />
                <View>
                    <Ionicons 
                        name={Platform.OS==='android' ? 'md-chatboxes' : 'ios-chatboxes'} 
                        size={23} 
                        color={Colors.primary}
                        style={{marginHorizontal:11}}
                    />
                    <Badge 
                        value={unread.length} 
                        badgeStyle={{backgroundColor:Colors.raspberry, borderColor:Colors.raspberry}}
                        containerStyle={{position: 'absolute', top: -4, right: 0}}
                    />
                </View>
            ) : (
                <Ionicons 
                    name={Platform.OS==='android' ? 'md-chatboxes' : 'ios-chatboxes'} 
                    size={23} 
                    color={Colors.primary}
                    style={{marginHorizontal:11}}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
})

export default MessageIcon
