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
import { getUser, setLastReadGroupMessage } from '../../redux/actions/authActions'
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
const GroupChatScreen = props => {
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

    
    const auth = useSelector(state => state.auth)
    const groupChatMembers = props.navigation.getParam('groupChatMembers')
    const memberIds = props.navigation.getParam('memberIds')
    const groupChatName = props.navigation.getParam('groupChatName')
    const groupChatId = props.navigation.getParam('groupChatId')
    const createdBy = props.navigation.getParam('createdBy')

    // DISPLAY ERRORS

    const dispatch = useDispatch()
    
    const [body, setBody] = useState('')
    const [image, setImage] = useState()
    
    useEffect(() => {
        const createGroupChat = async () => {
            if (!(await db.doc(`chats/${groupChatId}`).get()).exists) {
                let users = {}
                let lastRead = {}
                let memberIds = []
                groupChatMembers.forEach(member => {
                    let num = groupChatMembers.indexOf(member)
                    memberIds.push(member.uid)
                    
                    const key = 'user' + num.toString()
                    const userMap = {
                        name: member.name,
                        uid: member.uid,
                        userImage: member.userImage
                    }
                    const lastReadMap = {
                        timestamp: null,
                        uid: member.uid
                    }
                    users[key] = userMap
                    lastRead[key] = lastReadMap
                })

                db.doc(`chats/${groupChatId}`).set({
                    createdAt: new Date().toISOString(),
                    createdBy: createdBy,
                    id: groupChatId,
                    groupChatName: groupChatName,
                    memberIds: memberIds,
                    users: users,
                    messages: [],
                    messageCount: 0,
                    lastMessageTimestamp: null,
                    lastRead: lastRead
                }).then(() => {
                    groupChatMembers.forEach(member => {
                        db.doc(`/users/${member.uid}`).update({
                            groupChats: firestore.FieldValue.arrayUnion(groupChatId)
                        }).catch(err => console.log(err))
                    })
                }).catch(err => console.log(err))
            }
        }
        createGroupChat()
    }, [])



    const [messages, setMessages] = useState([])
    useEffect(() => {
        const updateChat = db.doc(`/chats/${groupChatId}`).onSnapshot(snapshot => {
            if (snapshot.exists) {
                const thread = snapshot.data().messages
                setMessages(thread.reverse())
            }
        })
        return () => {
            updateChat()
        }
    }, [])

    let readTimestamp 
    useEffect(() => {
        return () => {
            readTimestamp = new Date().toISOString()
            dispatch(setLastReadGroupMessage(groupChatId, readTimestamp))
        }
    }, [readTimestamp])
    


    
    const messageIdGenerator = () => {return Math.random().toString(36)}

    const sendMessage = async (body) => {
        const message = {
            _id: messageIdGenerator(),
            text: body,
            timestamp: new Date().toISOString(),
            user: {
                _id: auth.userId,
                name: auth.credentials.displayName,
                userImage: auth.credentials.imageUrl,
            },
        }
        db.doc(`/chats/${groupChatId}`).update({
            messages: firestore.FieldValue.arrayUnion(message),
            lastMessageTimestamp: message.timestamp,
            messageCount: firestore.FieldValue.increment(1)
        }).catch(err => console.log(err))
        
        if (groupChatMembers) {
            groupChatMembers.forEach(async member => {
                if (member.uid !== auth.userId) {
                    const pushToken = (await db.doc(`/users/${member.uid}`).get()).data().pushToken
                    if (pushToken) {
                        const authName = auth.credentials.displayName
                        const authImage = auth.credentials.imageUrl
                        const selectedUserId = member.uid
                        sendGroupMessageNotification(auth.userId, authName, authImage, groupChatName, message.text, selectedUserId, pushToken)
                    }
                }
            })
        } else {
            memberIds.forEach(async uid => {
                if (uid !== auth.userId) {
                    const pushToken = (await db.doc(`/users/${uid}`).get()).data().pushToken
                    if (pushToken) {
                        const authName = auth.credentials.displayName
                        const authImage = auth.credentials.imageUrl
                        const selectedUserId = uid
                        sendGroupMessageNotification(auth.userId, authName, authImage, groupChatName, message.text, selectedUserId, pushToken)
                    }
                }
            })
        }
        
        setBody('')
    }

    const sendGroupMessageNotification = (senderId, senderName, senderImage, groupChatName, message, recipientId, pushToken) => {
        db.collection('notifications').add({
            timestamp: new Date().toISOString(),
            type: 'groupMessage',
            recipientId: recipientId,
            senderId: senderId,
            read: false,
            groupChatId: groupChatId,
            groupChatName: groupChatName
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
                title: groupChatName,
                body: senderName + ': ' + message,
                data: {
                    type: 'groupMessage',
                    groupChatName: groupChatName,
                    groupChatId: groupChatId,
                }
            })
        })
    }

    // const sendMessageWithImg = async () => {}
    // const pickImage = async () => {
    //     let result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         allowsEditing: true,
    //         aspect: [4,3]
    //     })

    //     if(!result.cancelled) {
    //         setImage(result.uri)
    //     }
    // }

    const navToUserProfile = (id, name) => {
        props.navigation.navigate({
            routeName: 'UserProfile',
            params: {
                userId: id,
                name: name,
                from: 'GroupChatScreen'
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
        item.user._id === auth.userId ? (
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
                <View style={{flexDirection:'column'}}>
                    <Text style={{color:Colors.disabled, fontSize: 12, marginBottom: 5, marginLeft: 5}}>{item.user.name}</Text>
                    <View style={{backgroundColor: scheme === 'light' ? '#EEEEEE' : '#414141', padding:10, borderTopRightRadius: 15, borderTopLeftRadius: 15, borderBottomRightRadius: 15}}>
                        <Hyperlink
                            linkDefault={true}
                            linkStyle={{color:Colors.blue}}
                        >
                            <Text selectable style={{fontSize: 16, color: scheme === 'light' ? 'black' : 'white'}}>{item.text}</Text>
                        </Hyperlink>
                    </View>
                </View>
            </View>
        )
    )


    

    return (
        <SafeAreaView style={{backgroundColor: background, ...styles.screen}}>

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


GroupChatScreen.navigationOptions = (navData) => {
    const background = navData.screenProps.theme
    const groupChatName = navData.navigation.getParam('groupChatName')
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
                    {/* <Image style={styles.headerAvatar} source={{uri: userImage}}/> */}
                    <Text style={styles.headerTitle}>{groupChatName}</Text>
                </TouchableCmp>
            </View>
        ),
        headerTitle: () => {
            <View></View>
        },
        headerRight: () => {
            <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item
                    title='Direct'
                    iconName={Platform.OS==='android' ? 'md-more' : 'ios-more'}
                    onPress={() => {}}
                />
            </HeaderButtons>
        },
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
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500',
    },
    headerAvatar: {
        width: 24,
        height: 24,
        borderRadius: 18,
        marginRight: 10
    },
    chatButton: {
        marginRight: 10,
    },
    chatButtonText: {
        color: Colors.blue, 
        fontSize: 16, 
        fontWeight: 'bold'
    },
    chatButtonTextDisabled: {
        color: Colors.disabled, 
        fontSize: 16, 
        fontWeight: 'bold'
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
    textForm: {
        // width: '100%'
    }
})

export default GroupChatScreen