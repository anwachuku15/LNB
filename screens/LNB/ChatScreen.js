import React, { useState, useEffect, useCallback } from 'react'
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    Button, 
    ScrollView,
    TouchableOpacity,
    TouchableNativeFeedback,
    TextInput,
    SafeAreaView,
    KeyboardAvoidingView,
    FlatList,
    Platform
} from 'react-native'
// REDUX
import { getUser, setLastReadMessage } from '../../redux/actions/authActions'
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import { GiftedChat } from 'react-native-gifted-chat'
import firebase, { firestore } from 'firebase'
import { Ionicons } from '@expo/vector-icons'
import moment from 'moment'
const db = firebase.firestore()

let themeColor
let text
const ChatScreen = props => {
    const scheme = useColorScheme()
    const colorScheme = useColorScheme()
    let text
    if (colorScheme === 'dark') {
        themeColor = 'black'
        text = 'white'
    } else {
        themeColor = 'white'
        text = 'black'
    }

    const uid = firebase.auth().currentUser.uid
    const authUser = useSelector(state => state.auth)
    const user = useSelector(state => state.auth.selectedUser)
    const selectedUserId = props.navigation.getParam('selectedUserId')
    const chatId = uid < user.credentials.userId ? 
                   uid+user.credentials.userId : 
                   user.credentials.userId+uid
    const user1 = uid < user.credentials.userId ? uid : user.credentials.userId
    const user2 = uid > user.credentials.userId ? uid : user.credentials.userId
    
    const dispatch = useDispatch()
    
    const [body, setBody] = useState('')
    const [image, setImage] = useState()
    
    
    useEffect(() => {
        const createChat = async () => {
            if (!(await db.doc(`chats/${chatId}`).get()).exists) {
                db.collection('chats').doc(`${chatId}`).set({
                    createdAt: new Date().toISOString(),
                    users: {
                        user1: {
                            uid: user1,
                            name: user1 === uid ? authUser.credentials.displayName : user.credentials.displayName,
                            userImage: user1 === uid ? authUser.credentials.imageUrl : user.credentials.imageUrl
                        },
                        user2: {
                            uid: user2,
                            name: user2 === uid ? authUser.credentials.displayName : user.credentials.displayName,
                            userImage: user2 === uid ? authUser.credentials.imageUrl : user.credentials.imageUrl
                        }
                    },
                    lastMessageTimestamp: null,
                    messageCount: 0,
                    messages: []
                })
            }
        }
        createChat()
    }, [])

    // const [chatData, setChatData] = useState()
    const [messages, setMessages] = useState([])
    useEffect(() => {
        const updateChat = db.doc(`/chats/${chatId}`).onSnapshot(snapshot => {
            if (snapshot.data()) {
                const thread = snapshot.data().messages
                setMessages(thread.reverse())
            }
        })
        return () => {
            updateChat()
        }
    }, [])

    // UNMOUNT!!!!!
    let readTimestamp 
    useEffect(() => {
        return () => {
            readTimestamp = new Date().toISOString()
            dispatch(setLastReadMessage(chatId, selectedUserId, readTimestamp))
        }
    }, [readTimestamp])

    

    const sendMessage = async (chatId, content) => {
        const messageData = {
            uid: firebase.auth().currentUser.uid,
            userImage: authUser.credentials.imageUrl,
            content: content,
            timestamp: new Date().toISOString()
        }
        await db.collection('chats').doc(chatId).update({
            messages: firestore.FieldValue.arrayUnion(messageData)
        })
        const pushToken = (await db.doc(`/users/${user.credentials.userId}`).get()).data().pushToken
        if (pushToken) {
            sendMessageNotification(firebase.auth().currentUser.uid, authUser.credentials.displayName, content, user.credentials.userId, pushToken)
        }
        setBody('')
    }

    const chatUser = {
        name: authUser.credentials.displayName,
        _id: firebase.auth().currentUser.uid,
        userImage: authUser.credentials.imageUrl
    }
    const send = messages => {
        messages.forEach(async item => {
            const message = {
                _id: item._id,
                text: item.text,
                timestamp: new Date().toISOString(),
                user: item.user
            }
            db.doc(`/chats/${chatId}`).update({
                messages: firestore.FieldValue.arrayUnion(message),
                lastMessageTimestamp: message.timestamp,
                messageCount: firestore.FieldValue.increment(1)
            })
            const pushToken = (await db.doc(`/users/${user.credentials.userId}`).get()).data().pushToken
            if (pushToken) {
                sendMessageNotification(chatUser._id, chatUser.name, message.text, user.credentials.userId, pushToken)
            }
        })
    }

    const parse = message => {
        const {user, text, timestamp} = message.val()
        const {_id} = message
        const createdAt = timestamp

        return { 
            _id,
            createdAt,
            text,
            user
        }
    }
   

    const sendMessageNotification = (authId, authName, message, selectedUserId, pushToken) => {
        db.collection('notifications').add({
            timestamp: new Date().toISOString(),
            type: 'message',
            recipientId: selectedUserId,
            senderId: authId,
            read: false
        })
        let res = fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: pushToken,
                sound: 'default',
                title: authName,
                body: message
            })
        })
    }
    const sendMessageWithImg = async () => {}
    const pickImage = async () => {
        if (Constants.platform.ios) {
            const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)

            if(status != 'granted') {
                alert('We need permission to access your camera roll')
            }
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4,3]
        })

        if(!result.cancelled) {
            setImage(result.uri)
        }
    }

    const messageIdGenerator = () => {
        return Math.random().toString(36)
    }
    

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }
    
    return (
        
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <HeaderButtons HeaderButtonComponent={HeaderButton}>
                        <Item
                            title='Direct'
                            iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                            onPress={() => {props.navigation.goBack()}}
                        />
                    </HeaderButtons>
                        <TouchableCmp
                            onPress={() => {props.navigation.navigate({
                                routeName: 'UserProfile',
                                params: {
                                    userId: user.credentials.userId
                                }
                            })}}
                            style={{flexDirection:'row'}}
                        >
                            <Image style={styles.headerAvatar} source={{uri: user.credentials.imageUrl}}/>
                            <Text style={styles.headerTitle}>{user.credentials.displayName}</Text>
                        </TouchableCmp>
                </View>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Direct'
                        iconName={Platform.OS==='android' ? 'md-more' : 'ios-more'}
                        onPress={() => {}}
                    />
                </HeaderButtons>
            </View>
            

            {/* <KeyboardAvoidingView
                style={{flex:1}}
                behavior='padding'
                keyboardVerticalOffset={Platform.select({
                    ios: () => 0,
                    android: () => 100
                })()}
            > */}
            <GiftedChat
                messageIdGenerator={messageIdGenerator}
                messages={messages}
                onSend={send}
                user={chatUser}
                
            />
            {/* </KeyboardAvoidingView> */}


            {/* <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={chatData}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                renderItem={itemData => {

                }}
            />
            
            <View style={{flexDirection:'row'}}>
                <TouchableCmp style={styles.addImg} onPress={() => {}}>
                    <Ionicons name='ios-camera' size={32} color={'#838383'}/>
                </TouchableCmp>
                <View style={styles.textFormContainer}>
                    <TextInput
                        style={styles.textForm}
                        placeholder={'Your message'}
                        onChangeText={text => {setBody(text)}}
                        value={body}
                    />
                </View>
                {body.trim().length > 0 ? (
                    <TouchableCmp 
                        // style={{flex:1}}
                        style={{width:'15%', justifyContent:'center', alignItems:'center'}}
                        onPress={() => sendMessage(chatId, body)}
                    >
                        <Ionicons name='md-send' size={24} color={Colors.blue}/>
                    </TouchableCmp>
                ) : (
                    <TouchableCmp style={{width:'15%', justifyContent:'center', alignItems:'center'}} disabled>
                        <Ionicons name='md-send' size={24} color={'#838383'}/>
                    </TouchableCmp>
                )}
            </View> */}


        </SafeAreaView>
    )
}


ChatScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Chat',
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    addImg: {
        // marginHorizontal: 5,
        width: '15%',
        alignItems:'center'
    },
    textFormContainer: {
        width: '70%',
        padding: 3,
        flexDirection: 'row',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 10
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        // paddingTop: 49,
        // paddingBottom: 16,
        // paddingHorizontal: 32,
        paddingVertical: 12,
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
    headerAvatar: {
        width: 24,
        height: 24,
        borderRadius: 18,
        marginRight: 10
    },
    textForm: {
        // width: '100%'
    }
})
export default ChatScreen