import React, { useEffect, useState, useCallback, useRef } from 'react'
import { 
    View,
    SafeAreaView, 
    Text, 
    TextInput,
    StyleSheet, 
    Image, 
    Button, 
    Modal,
    ScrollView,
    FlatList,
    TouchableHighlight,
    TouchableNativeFeedback,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native'
import { ListItem } from 'react-native-elements'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import { getUser, markMessageNotificationsAsRead } from '../../redux/actions/authActions'

import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import firebase from 'firebase'
import moment from 'moment'
import algoliasearch from 'algoliasearch/lite'
import { appId, key } from '../../secrets/algolia'
import * as FileSystem from 'expo-file-system'
import shorthash from 'shorthash'

const client = algoliasearch(appId, key)
const index = client.initIndex('LNBmembers')


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
    const [isLoading, setIsLoading] = useState(true)
    const [isMounted, setIsMounted] = useState(true)
    const [search, setSearch] = useState('')
    const [results, setResults] = useState([])
    const [isFocused, setIsFocused] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)

    const searchInput = useRef(null)

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


    let searchResults = []
    const updateSearch = (text) => {
        setSearch(text)
        const query = text
        if (query.trim().length === 0) {setResults([])}

        if (query.trim().length > 0) {
            index.search(query, {
                attributesToRetrieve: ['newData'],
                hitsPerPage: 10
            }).then(({ hits }) => {
                hits.forEach(hit => {
                    searchResults.push(hit.newData)
                })
                setResults(searchResults)
            })
        }
    }

    const cancelSearch = () => {
        searchInput.current.blur()
    }

    const DismissKeyboard = ({ children }) => (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            {children}
        </TouchableWithoutFeedback>
    )

    const renderResult = ({item}) => (
        item.uid !== uid &&
        <TouchableCmp 
            onPress={async () => {
                await dispatch(getUser(item.uid))
                props.navigation.navigate({
                    routeName: 'ChatScreen',
                    params: {
                        selectedUserId: item.uid
                    }
                })
            }}
        >
            <ListItem
                containerStyle={{backgroundColor:background}}
                leftAvatar={{source: {uri: item.imageUrl}}}
                title={
                    <Text style={{color:text, fontSize: 16}}>{item.name}</Text>
                }
                subtitle={
                    <Text style={{color:Colors.disabled}}>
                        {item.headline}{'\n'}<Text style={{fontSize:12}}>{item.location}</Text>
                    </Text>
                }
                bottomDivider
            />
        </TouchableCmp>
    )

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
            <SafeAreaView style={styles.screen}>

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
                            onPress={() => {setIsModalVisible(!isModalVisible)}}
                        />
                    </HeaderButtons>
                    <Modal
                        animationType='slide'
                        transparent={true}
                        visible={isModalVisible}
                        onDismiss={() => {}}
                    >
                        <View style={styles.modalView}>
                            <View style={styles.modal}>
                                <Text style={styles.modalText}>Nothing to see here just yet...</Text>
                                <TouchableHighlight
                                    style={{ ...styles.modalButton, backgroundColor: "#2196F3" }}
                                    onPress={() => {
                                        setIsModalVisible(!isModalVisible);
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>Hide Modal</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </Modal>
                </View>

                <View style={{...styles.searchContainer, ...{marginHorizontal: 15, marginTop:10, alignSelf: 'center'}}}>
                    <View style={{justifyContent:'center'}}>
                        <Feather
                            name='search'
                            size={14}
                            color={Colors.placeholder}
                        />
                    </View>
                    <TextInput
                        ref={searchInput}
                        autoFocus={false}
                        multiline={true}
                        numberOfLines={4} 
                        style={{flex:1, fontSize:16, color:text, marginLeft:7, marginRight:10, alignSelf:'center', paddingVertical:4}}
                        placeholder={'Search...'}
                        placeholderTextColor={Colors.placeholder}
                        onChangeText={text => {updateSearch(text)}}
                        value={search}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                    {search.length > 0 && (
                        <TouchableCmp
                            style={{justifyContent:'center'}}
                            onPress={() => {
                                setSearch('')
                                setResults([])
                            }}
                        >
                            <MaterialIcons
                                name='cancel'
                                size={16}
                                color={Colors.disabled}
                            />
                        </TouchableCmp>
                    )}
                </View>
                {!isFocused && search.length === 0 && chats && chats.length > 0 && (
                    <DismissKeyboard>
                        <FlatList
                            keyExtractor={(item, index) => index.toString()}
                            data={chats}
                            renderItem={renderChat}
                        />
                    </DismissKeyboard>
                )}
                {!isFocused && chats && chats.length === 0 && (
                    <View style={{flex:1, alignItems:'center', marginTop:30}}>
                        <Text style={{color:Colors.placeholder}}>No messages</Text>
                    </View>
                )}
                {search.length > 0 && (
                    <FlatList
                        keyExtractor={(item, index) => index.toString()}
                        data={results}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        renderItem={renderResult}
                    />
                )}
                {isFocused && search.length === 0 && (
                    <DismissKeyboard>
                        <View style={{flex:1, alignItems:'center', paddingTop:10}}>
                            <Text style={{color:Colors.placeholder}}>Search for someone you'd like to message</Text>
                        </View>
                    </DismissKeyboard>
                )}
            </SafeAreaView>
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
        paddingVertical: 12,
        backgroundColor: themeColor,
        borderBottomColor: Colors.primary,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500',
    },
    subtitleView: {
        flexDirection: 'row'
    },
    searchContainer: {
        justifyContent: 'flex-end',
        flexDirection: 'row',
        paddingHorizontal: 5,
        borderColor: Colors.primary,
        borderWidth: 1,
        borderRadius: 20,
        marginBottom:10,
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22
    },
    modal: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    modalButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    modalButtonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
})


export default MessagesScreen