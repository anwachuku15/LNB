import React, { useEffect, useState, useCallback, useRef, createRef } from 'react'
import firebase from 'firebase'
// EXPO
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
// REDUX
import { useSelector, useDispatch } from 'react-redux'
// REACT-NATIVE
import { 
    LayoutAnimation,
    AppState, 
    Platform, 
    Modal, 
    TouchableOpacity, 
    TouchableNativeFeedback, 
    TouchableHighlight,
    TouchableWithoutFeedback,
    Text, 
    Button, 
    ActivityIndicator,
    Alert, 
    View, 
    StyleSheet, 
    Image, 
    SafeAreaView,
    Dimensions,
    UIManager,
    Vibration
} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import { FlatList, withNavigationFocus } from 'react-navigation'

import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
// import '@firebase/firestore'
import { fetchNeeds, getNeed } from '../../redux/actions/postsActions'
import NeedPost from '../../components/LNB/NeedPost'
import { getUser, pinNeed, unpinNeed } from '../../redux/actions/authActions';
import { deleteNeed } from '../../redux/actions/postsActions'
import MessageIcon from '../../components/LNB/MessageIcon';
import MenuAvatar from '../../components/LNB/MenuAvatar'
import Animated from 'react-native-reanimated';
import TouchableCmp from '../../components/LNB/TouchableCmp';

const db = firebase.firestore()

const WINDOW_WIDTH = Dimensions.get('window').width
const WINDOW_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 10

let themeColor
let text
let flatListRef
const HomeScreen = props => {
    // let uid = firebase.auth().currentUser.uid

    
// TODO: MEMOIZE IMAGES for create/delete post state updates


    const scheme = useColorScheme()
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
    } 
    if (scheme === 'light') {
        themeColor = 'white'
        text = 'black'
    }
    // APP SETTINGS
    const [appState, setAppState] = useState(AppState.currentState)
    useEffect(() => {
        AppState.addEventListener('change', _handleAppStateChange)
        return () => {
            AppState.removeEventListener('change', _handleAppStateChange)
        }
    },[])



    const _handleAppStateChange = nextAppState => {
        if ((appState === 'inactive' || 'background') && nextAppState === 'active') {
            console.log('App has come to the foreground')
            // db.doc(`users/${authUser.userId}`).set(
            //     {isOnline: true},
            //     {merge: true}
            // ).catch(err => console.log(err))
        }
        if ((appState === 'active' || 'foreground') && nextAppState === 'inactive') {
            console.log('App is in the background')
            // db.doc(`users/${authUser.userId}`).set(
            //     {isOnline: false},
            //     {merge: true}
            // ).catch(err => console.log(err))
        }
        setAppState(nextAppState)
    }

    // PUSH NOTIFICATIONS
    useEffect(() => {
        registerForPushNotificationsAsync()
        const notificationsSub = Notifications.addListener(handleNotification)
        return () => {
            // registerForPushNotificationsAsync.remove()
            notificationsSub // && Notifications.removeListener()
        }
    }, [registerForPushNotificationsAsync])

    const handleNotification = async notification => {
        const { origin, data, remote } = notification
        const { type, needId, senderName, senderImage, selectedUserId, groupChatName, groupChatId } = data
        if (origin === 'selected') {
            if (type === 'likeNeed' || type === 'commentNeed' || type === 'commentThread') {
                props.navigation.navigate('Notifications')
                props.navigation.navigate({
                    routeName: 'PostDetail',
                    params: {
                        needId,
                        senderName,
                        type
                    }
                })
            } else if (type === 'message') {
                await dispatch(getUser(selectedUserId))
                props.navigation.navigate('Messages')
                props.navigation.navigate({
                    routeName: 'ChatScreen',
                    params: {
                        selectedUserId: selectedUserId,
                        userName: senderName,
                        userImage: senderImage,
                    }
                })

            } else if (type === 'groupMessage') {
                props.navigation.navigate('Messages')
                props.navigation.navigate({
                    routeName: 'GroupChatScreen',
                    params: {
                        groupChatName: groupChatName,
                        groupChatId: groupChatId
                    }
                })

            } else if (type === 'connection request') {
                props.navigation.navigate('Notifications')
                props.navigation.navigate('ConnectRequests')

            } else if (type === 'new connection') {
                props.navigation.navigate('Notifications')

            } else if (type === 'announcement') {
                props.navigation.navigate('Announcements')
            }
        } else if (origin === 'received' && type === 'announcement') {
            Vibration.cancel()
            props.navigation.navigate('Announcements')
        }

    }
    
    const registerForPushNotificationsAsync = async () => {
        if (Constants.isDevice) {
            const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
            let finalStatus = status;
            if (status !== 'granted') {
                const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            try {
                let token = await Notifications.getExpoPushTokenAsync();
                db.doc(`/users/${userId}`)
                    .set(
                        {pushToken: token},
                        {merge: true}
                    )

            } catch (err) {
                console.log('error: ' + err)
            }
        } else {
            // alert('Must use physical device for Push Notifications');
        }

        // ANDROID --> FIREBASE?
        if (Platform.OS === 'android') {
            Notifications.createChannelAndroidAsync('default', {
                name: 'default',
                sound: true,
                priority: 'max',
                vibrate: [0, 250, 250, 250],
            });
        }
    };

    // SCREEN SETTINGS/UI/FUNCTIONS
    const [isMounted, setIsMounted] = useState(true)
    const [showNeedActions, setShowNeedActions] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState()
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [selectedNeed, setSelectedNeed] = useState()
    const [isDeletable, setIsDeletable] = useState(false)

    const authUser = useSelector(state => state.auth.credentials)
    const userId = useSelector(state => state.auth.userId)
    const needs = useSelector(state => state.posts.allNeeds)
    const authPosts = useSelector(state => state.posts.allNeeds.filter(need => need.uid === userId))
    const pinned = authPosts.find(post => post.isPinned === true)
    
    const dispatch = useDispatch()
    const loadData = useCallback(async () => {
        setError(null)
        setIsRefreshing(true)
        try {
            await dispatch(fetchNeeds())
        } catch (err){
            console.log(err)
            setError(err.message)
        }
        setIsRefreshing(false)
    },[dispatch, setIsRefreshing, setError])

    useEffect(() => {
        setShowNeedActions(true)
        setIsMounted(true)

        setIsLoading(true)
        if (isMounted) {
            loadData().then(() => {
                setIsLoading(false)
            })
        }
        return () => {
            setShowNeedActions(false)
            setIsMounted(false)
        }
    }, [dispatch, loadData, isMounted, showNeedActions])

    // NAV LISTENER
    useEffect(() => {
        const willFocusSub = props.navigation.addListener('willFocus', loadData)
        // const willBlurSub = props.navigation.addListener('willBlur', loadData)
        // Clean up listener when function re-runs https://reactjs.org/docs/hooks-effect.html
        return () => {
            willFocusSub.remove()
            // willBlurSub
        }
    }, [loadData])
    
    


    const selectUserHandler = (userId, userName) => {
        props.navigation.navigate({
            routeName: 'UserProfile',
            params: {
                userId: userId,
                name: userName,
                from: 'HomeScreen'
            }
        })
    }


    if (isMounted && error) {
        return (
            <View style={styles.spinner}>
                <Text>An error occured</Text>
                <Button title='try again' onPress={loadData} color={Colors.primary}/>
            </View>
        )
    }

    if (isMounted && isLoading) {
        return (
            <View style={styles.spinner}>
                <ActivityIndicator 
                    size='large'
                    color={Colors.primary}
                />
            </View>
        )
    }

    if (isMounted && !isLoading && needs.length === 0) {
        return (
            <View style={styles.spinner}>
                <Text>No needs found.</Text>
            </View>
        )
    }

    const optionsModal = (item) => (
        <Modal
            animationType='slide'
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => console.log('modal closed')}
        >
            <View style={styles.modalView}>
                <View style={styles.modal}>
                    <Text style={styles.modalText}>{item.id}</Text>
                    <TouchableHighlight
                        style={{ ...styles.modalButton, backgroundColor: "#2196F3" }}
                        onPress={() => {
                            setIsModalVisible(!isModalVisible);
                        }}
                    >
                        <Text style={styles.modalButtonText}>Hide Modal</Text>
                    </TouchableHighlight>
                    {item.uid === userId && (
                        <TouchableHighlight
                        style={{ ...styles.modalButton, backgroundColor: Colors.redcrayola }}
                        onPress={() => {
                            setIsModalVisible(!isModalVisible);
                        }}
                        >
                            <Text style={styles.modalButtonText}>Delete</Text>
                        </TouchableHighlight>
                    )}

                </View>
            </View>
        </Modal>
    )
   
    const deleteHandler = (needId) => {
        Alert.alert('Delete Need', 'Are you sure?', [
            {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                    setIsModalVisible(!isModalVisible)
                }
            },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        deleteNeed(needId)
                        setIsModalVisible(!isModalVisible)
                        setIsRefreshing(true)
                        loadData().then(() => {
                            setIsRefreshing(false)
                        })
                    } catch (err) {
                        alert(err)
                        console.log(err)
                    }
                    
                }
            }
        ])
    }

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }

    const commentButtonHandler = (needId, userName) => {
        dispatch(getNeed(needId))
        props.navigation.navigate({
            routeName: 'commentModal',
            params: {
                needId: needId,
                userName: userName
            }
        })
    }

    const pinHandler = (needId, uid) => {
        Alert.alert('Pin Need', 'This will appear at the top of your profile and replace any previously pinned need. Are you sure?', [
            {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                    setIsModalVisible(!isModalVisible)
                    setSelectedNeed()
                }
            },
            {
                text: 'Pin',
                style: 'default',
                onPress: async () => {
                    
                    setIsModalVisible(!isModalVisible)
                    pinNeed(needId, uid)
                }
            }
        ])
    }

    const unpinHandler = (needId) => {
        Alert.alert('Unpin Need', 'Are you sure?', [
            {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                    setIsModalVisible(!isModalVisible)
                    setSelectedNeed()
                }
            },
            {
                text: 'Unpin',
                style: 'destructive',
                onPress: async () => {
                    try {
                        unpinNeed(needId)
                        setIsModalVisible(!isModalVisible)
                    } catch (err) {
                        alert(err)
                        console.log(err)
                    }
                    
                }
            }
        ])
    }

    const navToPostDetail = (needId) => {
        props.navigation.push(
            'PostDetail',
            {
                needId: needId,
                from: 'HomeScreen'
            }
        )
    }

    const from = 'HomeScreen'
    
    
    const renderItem = ({item}) => (
        <NeedPost 
            navigation={props.navigation}
            navToPostDetail={navToPostDetail}
            from={from}
            item={item} 
            pinned={pinned}
            pinHandler={pinHandler}
            unpinHandler={unpinHandler}
            selectUserHandler={selectUserHandler}
            isDeletable={isDeletable}
            setIsDeletable={setIsDeletable}
            selectedNeed={selectedNeed}
            setSelectedNeed={setSelectedNeed}
            isModalVisible={isModalVisible}
            setIsModalVisible={setIsModalVisible}
            deleteHandler={deleteHandler}
            commentButtonHandler={commentButtonHandler}
            showNeedActions={showNeedActions}
            setShowNeedActions={setShowNeedActions}
        />
    )
    
    
    // if(Platform.OS === 'android') {
    //     if (UIManager.setLayoutAnimationEnabledExperimental) {
    //         UIManager.setLayoutAnimationEnabledExperimental(true)
    //     }
    // }
    // LayoutAnimation.easeInEaseOut();
    // LayoutAnimation.Types.easeIn
    return (
        isMounted && (
            <SafeAreaView style={styles.screen}>
                {/* Large list, slow to update - make sure renderItem function follows best practices: PureComponent, shouldComponentUpdate, etc */}
                <FlatList
                    ref={flatListRef}
                    keyExtractor={(item, index) => index.toString()}
                    data={needs}
                    onRefresh={loadData}
                    refreshing={isRefreshing}
                    style={styles.feed}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderItem}
                />
            </SafeAreaView>
        )
    )
}

const TouchableHeader = () => {
    flatListRef = useRef()
    const toTop = () => {
        flatListRef.current.scrollToOffset({animated: true, offset: 0})
    }
    return (
        <TouchableCmp onPress={toTop} activeOpacity={Platform.OS === 'ios' ? 0.6 : null}>
            <View style={{width: WINDOW_WIDTH * 0.60, alignItems: 'center'}}>
                <Image 
                    source={require('../../assets/lnb.png')} 
                    resizeMode='contain' 
                    style={{width:38, height:38}}
                />
            </View>
        </TouchableCmp>
    )
}

HomeScreen.navigationOptions = (navData) => {
    const background = navData.screenProps.theme
    const isFocused = navData.navigation.isFocused()
    // console.log(background)
    return {
        headerLeft: () => (
            <MenuAvatar toggleDrawer={() => navData.navigation.toggleDrawer()} />
        ),
        headerRight: () => (
            <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item
                    ButtonElement={<MessageIcon/>}
                    title='Messages'
                    onPress={() => {
                        navData.navigation.navigate('Messages')
                    }}
                />
            </HeaderButtons>
        ),
        headerTitle: () => (
            <TouchableHeader />
        ),
        headerTitleStyle: {
            fontFamily: 'open-sans-bold',
        },
        headerBackTitleStyle: {
            fontFamily: 'open-sans',
        },
        headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primary,
        headerBackTitleVisible: false,
        headerStyle: {
            backgroundColor: background === 'dark' ? 'black' : 'white',
            
        },
    }
}

const styles = StyleSheet.create({
    inAppNotification: {
        position: 'absolute',
        marginTop: 50,
        marginHorizontal: 10,
        paddingHorizontal: 10,
        paddingVertical: 30,
        left: 0,
        top: 0,
        right: 0,
        backgroundColor: 'gray'
    },
    inAppNotificationText: {
        color: 'white'
    },
    touchable: {
        overflow: 'hidden',
        borderRadius: 10,
    },
    spinner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
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
    screen: {
        flex: 1
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingVertical: 5.6,
        // paddingTop: 44,
        // paddingBottom: 7,
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
    menuAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginLeft: 16
    },
    feed: {
        // marginHorizontal: 16
    },
    feedItem: {
        backgroundColor: '#FFF',
        padding: 8,
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.placeholder
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 16
    },
    name: {
        fontSize: 15,
        fontWeight: '500'
    },
    timestamp: {
        fontSize: 14,
        color: '#C4C6CE',
        marginTop: 4
    },
    post: {
        marginTop: 5,
        fontSize: 14,
        lineHeight: 18
    },
    postImage: {
        width: undefined,
        minHeight: 200,
        maxHeight: 300,
        borderRadius: 5,
        borderWidth: 0.1,
        marginTop: 10,
        marginRight: 20
    },
    lightboxImage: {
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT - BASE_PADDING,
        borderRadius: 5,
        marginVertical: 10
    },
    closeButton: {
        color: 'white',
        paddingHorizontal: 18,
        paddingVertical: 32,
        textAlign: 'center',
        margin: 10,
        alignSelf: 'flex-start',
    },
})

export default withNavigationFocus(HomeScreen)