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
    Keyboard,
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
import { InputToolbar, Actions, Composer, Send } from 'react-native-gifted-chat'
import firebase, { firestore } from 'firebase'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import moment from 'moment'
import Hyperlink from 'react-native-hyperlink'
import TouchableCmp from '../../components/LNB/TouchableCmp'
const db = firebase.firestore()

let themeColor
let text
let background
const ChatScreen = props => {
    const scheme = useColorScheme()
    const colorScheme = useColorScheme()
    let text
    if (colorScheme === 'dark') {
        themeColor = 'black'
        text = 'white'
        background = 'black'
    } else {
        themeColor = 'white'
        text = 'black'
        background = 'white'
    }

    
    const authUser = useSelector(state => state.auth)
    const uid = authUser.userId
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
                    id: chatId,
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
                    lastRead: {
                        user1: {
                            timestamp: user1 === uid ? new Date().toISOString() : null,
                            uid: user1,
                        },
                        user2: {
                            timestamp: user2 === uid ? new Date().toISOString() : null,
                            uid: user2
                        }
                    },
                    lastMessageTimestamp: null,
                    messageCount: 0,
                    messages: []
                }).catch(err => console.log(err))
            }
        }
        createChat()
    }, [])

    // const [chatData, setChatData] = useState()
    const [messages, setMessages] = useState([])
    useEffect(() => {
        const updateChat = db.doc(`/chats/${chatId}`).onSnapshot(snapshot => {
            if (snapshot.exists) {
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

    

    const sendMessage = async (body) => {
        const message = {
            _id: messageIdGenerator(),
            text: body,
            timestamp: new Date().toISOString(),
            user: {
                _id: uid,
                name: authUser.credentials.displayName,
                userImage: authUser.credentials.imageUrl,
            },
        }
        db.doc(`/chats/${chatId}`).update({
            messages: firestore.FieldValue.arrayUnion(message),
            lastMessageTimestamp: message.timestamp,
            messageCount: firestore.FieldValue.increment(1)
        }).catch(err => console.log(err))

        const pushToken = (await db.doc(`/users/${user.credentials.userId}`).get()).data().pushToken
        if (pushToken) {
            const authName = authUser.credentials.displayName
            const authImage = authUser.credentials.imageUrl
            const selectedUserId = user.credentials.userId
            sendMessageNotification(uid, authName, authImage, message.text, selectedUserId, pushToken)
        }
        setBody('')
    }


    const sendMessageNotification = (authId, authName, authImage, message, selectedUserId, pushToken) => {
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
                body: message,
                data: {
                    type: 'message',
                    selectedUserId: authId,
                    senderName: authName,
                    senderImage: authImage
                }
            })
        })
    }
    const sendMessageWithImg = async () => {}
    const pickImage = async () => {
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
    
    const navToUserProfile = (id) => {
        props.navigation.navigate({
            routeName: 'UserProfile',
            params: {
                userId: id,
                name: user.credentials.displayName,
                from: 'ChatScreen'
            }
        })
    }

    const heartLike = () => (
        <View style={{...styles.rightHeartLike, backgroundColor: Colors.primaryLight, borderColor: scheme === 'dark' ? 'black' : 'white'}}>
            <TouchableCmp>
                <Ionicons 
                    name={Platform.OS==='android' ? 'md-heart' : 'ios-heart'} 
                    size={15} 
                    color={Colors.raspberry}
                />
            </TouchableCmp>
        </View>
    )

    const renderMessage = ({item}) => (
        item.user._id === uid ? (
            <View style={{...styles.rightMessageView, ...{backgroundColor:background}}} key={item._id}>
                <View style={{alignSelf: 'flex-start', backgroundColor: scheme==='light' ? 'white' : 'black', padding:10, borderTopRightRadius: 15, borderTopLeftRadius: 15, borderBottomLeftRadius: 15, borderWidth: 1, borderColor: Colors.primary}}>
                    <Hyperlink
                        linkDefault={true}
                        linkStyle={{color:Colors.blue}}
                    >
                        <Text selectable style={{fontSize: 16, color: scheme === 'light' ? 'black' : 'white'}}>{item.text}</Text>
                    </Hyperlink>
                </View>
            </View>
        ) : (
            <View style={{...styles.leftMessageView, ...{backgroundColor:background}}} key={item._id}>
                <TouchableCmp onPress={() => navToUserProfile(item.user._id)}>
                    <Image source={{uri: item.user.userImage}} style={styles.leftMessageAvatar}/>
                </TouchableCmp>
                <View style={{backgroundColor: scheme === 'light' ? '#EEEEEE' : '#414141', padding:10, borderTopRightRadius: 15, borderTopLeftRadius: 15, borderBottomRightRadius: 15}}>
                    <Hyperlink
                        linkDefault={true}
                        linkStyle={{color:Colors.blue}}
                    >
                        <Text selectable style={{fontSize: 16, color: scheme === 'light' ? 'black' : 'white'}}>{item.text}</Text>
                    </Hyperlink>
                </View>
            </View>
        )
    )


    

    return (
        <SafeAreaView style={styles.screen}>
            
            <FlatList
                contentContainerStyle={styles.messages}
                keyExtractor={(item,index) => index.toString()}
                data={messages}
                renderItem={renderMessage}
                keyboardDismissMode={Platform.OS==='ios' ? 'interactive' : 'on-drag'}
                inverted
            />
            <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={Platform.select({ios: 85, android:500})}>
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', paddingLeft: 20, paddingRight:20}}>
                    <View style={styles.inputContainer}>
                        {/* <TouchableCmp 
                            onPress={pickImage}
                            disabled
                            style={{justifyContent:'center', alignItems:'center', backgroundColor:Colors.pink, padding:0, borderRadius:20, width:30, height:30}}
                        >
                            <Ionicons name='md-camera' size={20} color='white'/>
                        </TouchableCmp> */}
                        <TextInput
                            autoFocus={false}
                            multiline={true}
                            numberOfLines={4} 
                            style={{flex:1, color:text, marginHorizontal:10, alignSelf:'center', paddingTop:0, fontSize: 16}}
                            placeholder={'Message...'}
                            placeholderTextColor={'#838383'}
                            onChangeText={text => {setBody(text)}}
                            value={body}
                        />
                    </View>
                    <TouchableCmp onPress={() => sendMessage(body)} disabled={!body.trim().length}>
                        <Ionicons 
                            name={Platform.OS === 'ios' ? 'ios-send' : 'md-send'} 
                            size={26} 
                            color={!body.trim().length ? Colors.disabled : Colors.blue}
                        />
                    </TouchableCmp>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}


ChatScreen.navigationOptions = (navData) => {
    const background = navData.screenProps.theme
    const selectedUserId = navData.navigation.getParam('selectedUserId')
    const userName = navData.navigation.getParam('userName')
    const userImage = navData.navigation.getParam('userImage')
    return {
        headerLeft: () => (
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Direct'
                        iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        onPress={() => {navData.navigation.goBack()}}
                    />
                </HeaderButtons>
                <TouchableCmp
                    onPress={() => {navData.navigation.navigate({
                        routeName: 'UserProfile',
                        params: {
                            userId: selectedUserId,
                            name: userName
                        }
                    })}}
                    style={{flexDirection:'row'}}
                >
                    <Image style={styles.headerAvatar} source={{uri: userImage}}/>
                    <Text style={styles.headerTitle}>{userName}</Text>
                </TouchableCmp>

            </View>
        ),
        headerStyle: {
            backgroundColor: background === 'dark' ? 'black' : 'white',
            borderBottomColor: Colors.primary
        },
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    rightHeartLike: {
        justifyContent: 'center',
        alignItems: 'center',
        position:'relative',
        right: 15, 
        bottom: -10,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        paddingTop: 2
    },
    messages: {
        justifyContent: 'flex-start'
    },
    leftMessageView: {
        padding: 10,
        flexDirection: 'row',
        maxWidth: '80%',
        alignItems: 'flex-end'
    },
    leftMessageAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10
    },
    rightMessageView: {
        padding: 10,
        flexDirection: 'row-reverse',
        alignSelf:'flex-end',
        maxWidth: '80%',
        alignItems: 'flex-end'
    },
    rightMessageAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginLeft: 10
    },
    timestamp: {
        fontSize: 14,
        color: '#C4C6CE',
        marginTop: 4
    },
    inputContainer: {
        margin: 10,
        paddingHorizontal: 5,
        paddingVertical: 10,
        borderColor: Colors.primary,
        borderWidth: 1,
        borderRadius: 20,
        justifyContent: 'flex-end',
        flexDirection: 'row'
    },

    sendContainer: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4
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
        borderBottomWidth: StyleSheet.hairlineWidth
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