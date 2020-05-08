import React, {useCallback, useState, useEffect} from 'react'
import { 
    Platform,
    View, 
    Text, 
    StyleSheet, 
    Image, 
    Button, 
    ScrollView,
    TouchableNativeFeedback,
    TouchableOpacity,
    FlatList
} from 'react-native'
import { ListItem } from 'react-native-elements'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import { getUser, setNotifications, markNotificationsAsRead } from '../../redux/actions/authActions'

import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import MessageIcon from '../../components/LNB/MessageIcon'
import firebase from 'firebase'
import moment from 'moment'

const db = firebase.firestore()

let themeColor
let text
const NotificationsScreen = props => {

    const colorScheme = useColorScheme()
    let text
    let background
    if (colorScheme === 'dark') {
        themeColor = 'black'
        text = 'white'
        background = 'black'
    } else {
        themeColor = 'white'
        text = 'black'
        background = 'white'
    }

    const dispatch = useDispatch()

    const uid = firebase.auth().currentUser.uid

    // GET NOTIFICATIONS FROM STATE
    const notifications = useSelector(state => state.auth.notifications.sort((a,b) => a.timestamp > b.timestamp ? -1 : 1))

    const loadNotifications = useCallback(async () => {
        try {
            await dispatch(markNotificationsAsRead())
        } catch (err) {
            console.log(err)
        }
    }, [dispatch])
    

    useEffect(() => {
        const willFocusSub = props.navigation.addListener('willFocus', loadNotifications)
        
        return () => {
            willFocusSub
        }
    }, [loadNotifications])

    // UNMOUNT
    useEffect(() => {
        loadNotifications()
    }, [dispatch, loadNotifications])

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }
    
    const renderItem = ({item}) => (
        <TouchableCmp onPress={async () => {
            // await dispatch(getUser(item.senderId))
        }}>
            <ListItem
                containerStyle={{backgroundColor:background}}
                title={
                    <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                        {item.type === 'connection request' && (<Text style={{color:text, fontSize: 14}}>{item.senderName} wants to connect with you.</Text>)}
                        {item.type === 'new connection' && (<Text style={{color:text, fontSize: 14}}>{item.senderName} accepted your connect request.</Text>)}
                        {item.type === 'likeNeed' && (<Text style={{color:text, fontSize: 14}}>{item.senderName} liked your need post.</Text>)}
                        {item.type === 'commentNeed' && (<Text style={{color:text, fontSize: 14}}>{item.senderName} replied to your need post.</Text>)}
                            <Text style={{color:Colors.disabled, fontSize: 14, }}>{moment.utc(new Date(item.timestamp)).fromNow()}</Text>
                    </View>
                }
                // subtitle='Content of what was liked or commented'
                // leftAvatar=
                bottomDivider
            />
        </TouchableCmp>
    )

    return (
        
        <View style={styles.screen}>
            <View style={styles.header}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Direct'
                        iconName={Platform.OS==='android' ? 'md-menu' : 'ios-menu'}
                        onPress={() => {props.navigation.toggleDrawer()}}
                    />
                </HeaderButtons>
                <Text style={styles.headerTitle}>Notifications</Text>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        ButtonElement={<MessageIcon/>}
                        title='Messages'
                        onPress={() => {
                            props.navigation.navigate('Messages')
                        }}
                    />
                </HeaderButtons>
            </View>
            
            {notifications && notifications.length > 0 ? (
                <FlatList
                    keyExtractor={(item,index) => index.toString()}
                    data={notifications}
                    renderItem={renderItem}
                />
            ) : (
                <View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
                    <Text style={{color:text}}>No Notifications</Text>
                </View>
                )}
            
        </View>

            
    )
}


NotificationsScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Notifications'
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingTop: 49,
        paddingBottom: 16,
        backgroundColor: themeColor,
        borderBottomColor: Colors.primary,
    },
    header2: {
        // borderBottomWidth: 0.5,
        // shadowColor: Colors.primary,
        // shadowOffset: {height: 5},
        // shadowRadius: 15,
        // shadowOpacity: 0.26,
        // zIndex: 10
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500'
    },
})
export default NotificationsScreen