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

    
    const authUser = useSelector(state => state.auth)
    const uid = authUser.userId
    const chatMembers = props.navigation.getParam('chatMembers')
    const groupName = props.navigation.getParam('groupName')
    
    const dispatch = useDispatch()
    
    const [body, setBody] = useState('')
    const [image, setImage] = useState()
    
    useEffect(() => {
        chatMembers.push({
            userid: uid,
            userName: authUser.credentials.displayName,
            userImage: authUser.credentials.imageUrl
        })
        console.log(chatMembers)
        // const createChat = async () => {
        //     // if (!(await groupchat doc where all users from param doesn't exist, createChat))
            
        // }
        // createChat()
    }, [])


    // const [messages, setMessages] = useState([])
    // useEffect(() => { // synchronous issue leads to TypeError (can't read snapshot fast enough)
    //     const updateChat = db.doc(`/chats/${chatId}`).onSnapshot(snapshot => {
    //         if (snapshot) {
    //             const thread = snapshot.data().messages
    //             setMessages(thread.reverse())
    //         } else {
    //             console.log('snapshot not accounted for yet')
    //         }
    //     })
    //     return () => {
    //         updateChat()
    //     }
    // }, [])

    

    // UNMOUNT!!!!!
    // let readTimestamp 
    // useEffect(() => {
    //     return () => {
    //         readTimestamp = new Date().toISOString()
    //         dispatch(setLastReadMessage(chatId, selectedUserId, readTimestamp))
    //     }
    // }, [readTimestamp])

    

    // const sendMessage = async (body) => {
    //     const message = {
    //         _id: messageIdGenerator(),
    //         text: body,
    //         timestamp: new Date().toISOString(),
    //         user: {
    //             _id: uid,
    //             name: authUser.credentials.displayName,
    //             userImage: authUser.credentials.imageUrl,
    //         },
    //     }
    //     db.doc(`/chats/${chatId}`).update({
    //         messages: firestore.FieldValue.arrayUnion(message),
    //         lastMessageTimestamp: message.timestamp,
    //         messageCount: firestore.FieldValue.increment(1)
    //     }).catch(err => console.log(err))

    //     const pushToken = (await db.doc(`/users/${user.credentials.userId}`).get()).data().pushToken
    //     if (pushToken) {
    //         const authName = authUser.credentials.displayName
    //         const authImage = authUser.credentials.imageUrl
    //         const selectedUserId = user.credentials.userId
    //         sendMessageNotification(uid, authName, authImage, message.text, selectedUserId, pushToken)
    //     }
    //     setBody('')
    // }


    // const sendMessageNotification = (authId, authName, authImage, message, selectedUserId, pushToken) => {
    //     db.collection('notifications').add({
    //         timestamp: new Date().toISOString(),
    //         type: 'message',
    //         recipientId: selectedUserId,
    //         senderId: authId,
    //         read: false
    //     })
    //     let res = fetch('https://exp.host/--/api/v2/push/send', {
    //         method: 'POST',
    //         headers: {
    //             Accept: 'application/json',
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             to: pushToken,
    //             sound: 'default',
    //             title: authName,
    //             body: message,
    //             data: {
    //                 type: 'message',
    //                 selectedUserId: authId,
    //                 senderName: authName,
    //                 senderImage: authImage
    //             }
    //         })
    //     })
    // }

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

    // const messageIdGenerator = () => {
    //     return Math.random().toString(36)
    // }
    
    // const navToUserProfile = (id) => {
    //     props.navigation.navigate({
    //         routeName: 'UserProfile',
    //         params: {
    //             userId: id,
    //             name: user.credentials.displayName,
    //             from: 'GroupChatScreen'
    //         }
    //     })
    // }

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

            <View style={styles.header}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Direct'
                        iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        onPress={() => {props.navigation.goBack()}}
                    />
                </HeaderButtons>
                <Text style={styles.headerTitle}>{groupName}</Text>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Settings'
                        iconName={Platform.OS==='android' ? 'md-more' : 'ios-more'}
                        onPress={() => {}} // nav to group chat settings
                    />
                </HeaderButtons>
            </View>
            
        </SafeAreaView>
    )
}


GroupChatScreen.navigationOptions = (navData) => {
    const background = navData.screenProps.theme
    return {
        headerShown: false,
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