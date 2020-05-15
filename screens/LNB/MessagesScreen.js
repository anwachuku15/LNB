import React, { useEffect, useState, useCallback } from 'react'
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    Button, 
    ScrollView,
    FlatList,
    TouchableNativeFeedback,
    TouchableOpacity
} from 'react-native'
import { ListItem } from 'react-native-elements'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import { getUser, markMessageNotificationsAsRead } from '../../redux/actions/authActions'

import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import firebase from 'firebase'
import moment from 'moment'

const db = firebase.firestore()
const messagesTimeConfig = {
    future: 'in %s',
    past: '%s',
    s: '%ds',
    ss: '%ds',
    m: '%dm',
    mm: '%dm',
    h: '%dh',
    hh: '%dh',
    d: '%dd',
    dd: '%dd',
    M: '%dmo',
    MM: '%dmo',
    y: '%dy',
    yy: '%dy'
}
moment.updateLocale('en', { relativeTime: messagesTimeConfig})
// https://stackoverflow.com/questions/55234064/momentjs-with-two-separate-fromnow-formats

let themeColor

const MessagesScreen = props => {
    
    const scheme = useColorScheme()
    let text
    let background
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
        background = 'black'
    } else {
        themeColor = 'black'
        text = 'black'
        background = 'white'
    }
    const dispatch = useDispatch()

    // const unreadThread = useSelector(state => state.auth.lastReadMessages.)

    const uid = useSelector(state => state.auth.userId)
    const [chats, setChats] = useState()
    const [isMounted, setIsMounted] = useState(true)

    const loadMessageNotifications = useCallback(async () => {
        try {
            await dispatch(markMessageNotificationsAsRead())
        } catch (err) {
            console.log(err)
        }
    }, [dispatch])

    const loadChats = useCallback(async () => {
        try {
            let userChats = []
            const allChats = await (await db.collection('chats').orderBy('lastMessageTimestamp', 'desc').get())
                                                                .docs
                                                                .forEach(doc => {
                                                                    if (doc.id.includes(uid)) {
                                                                        const messages = doc.data().messages
                                                                        const chatWithId = doc.id.replace(uid,'')
                                                                        const authUser = uid < chatWithId
                                                                                    ? 'user1'
                                                                                    : 'user2'
                                                                        const name = uid > chatWithId 
                                                                                    ? doc.data().users.user1.name
                                                                                    : doc.data().users.user2.name
                                                                        const userImage = uid > chatWithId 
                                                                                      ? doc.data().users.user1.userImage
                                                                                      : doc.data().users.user2.userImage
                                                                        if (doc.data().messageCount > 0) {
                                                                            userChats.push({
                                                                                chatWith: {
                                                                                    uid: chatWithId,
                                                                                    name: name,
                                                                                    image: userImage
                                                                                },
                                                                                lastMessageText: messages[messages.length-1].text,
                                                                                lastMessageSenderId: messages[messages.length-1].user._id,
                                                                                lastMessageTimestamp: doc.data().lastMessageTimestamp,
                                                                                lastRead: authUser === 'user1' ? doc.data().lastRead.user1.timestamp : doc.data().lastRead.user2.timestamp
                                                                            })
                                                                        }
                                                                    }
                                                                })
            // userChats.sort((a,b) => {
            //     a.lastMessageTimestamp > b.lastMessageTimestamp ? -1 : 1
            // })
            setChats(userChats)
        } catch (err) {
            console.log(err)
        }
        
    }, [setChats])

    useEffect(() => {
        const willFocusSub = props.navigation.addListener('willFocus', loadMessageNotifications)
        return () => {
            willFocusSub
        }
    }, [loadMessageNotifications])
    useEffect(() => {
        const willFocusSubscription = props.navigation.addListener('willFocus', loadChats)
        return () => {
            willFocusSubscription
        }
    }, [loadChats])

    useEffect(() => {
        setIsMounted(true)
        return (() => {
            setIsMounted(false)
            // console.log('MessageScreen Unmounted')
        })
    }, [])

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }

    const renderChat = ({item}) => (
        <TouchableCmp onPress={async () => {
            await dispatch(getUser(item.chatWith.uid));
            props.navigation.navigate({
                routeName: 'ChatScreen',
                params: {
                    selectedUserId: item.chatWith.uid
                }
            })
        }}>
            <ListItem
                // containerStyle={{backgroundColor:background}}
                containerStyle={{backgroundColor: item.lastRead < item.lastMessageTimestamp ? 'rgba(251, 188, 4, 0.4)' : background}}
                title={
                    <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                        <Text style={{color:text, fontSize: 16}}>{item.chatWith.name}</Text>
                        <Text style={{color:Colors.disabled, fontSize: 14, }}>{moment.utc(new Date(item.lastMessageTimestamp)).fromNow()}</Text>
                    </View>
                }
                subtitle={
                    <View style={styles.subtitleView}>
                        <Text style={{color:Colors.disabled}}>{item.lastMessageSenderId === uid ? `You: ${item.lastMessageText}` : item.lastMessageText}</Text>
                    </View>
                }
                leftAvatar={{source: {uri: item.chatWith.image}}}
                bottomDivider
            />
        </TouchableCmp>
    )

    return (
        (isMounted && 
            <View style={styles.screen}>

                <View style={styles.header}>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <HeaderButtons HeaderButtonComponent={HeaderButton}>
                            <Item
                                title='Direct'
                                iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                                onPress={() => {props.navigation.navigate({
                                    routeName: 'Drawer'
                                })}}
                            />
                        </HeaderButtons>
                    </View>
                    <Text style={styles.headerTitle}>Messages</Text>
                    <HeaderButtons HeaderButtonComponent={HeaderButton}>
                        <Item
                            title='Direct'
                            iconName={Platform.OS==='android' ? 'md-more' : 'ios-more'}
                            onPress={() => {}}
                        />
                    </HeaderButtons>
                </View>

                {chats && chats.length > 0 ? (
                    <FlatList
                        keyExtractor={(item, index) => index.toString()}
                        data={chats}
                        renderItem={renderChat}
                    />
                ) : (
                    <Text style={{color:text, alignSelf:'center'}}>No Messages</Text>
                )}
            </View>
        )
    )
}


MessagesScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Messages'
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center'
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingTop: 49,
        paddingBottom: 16,
        backgroundColor: themeColor,
        borderBottomColor: Colors.primary,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500'
    },
    subtitleView: {
        flexDirection: 'row'
    }
})


export default MessagesScreen