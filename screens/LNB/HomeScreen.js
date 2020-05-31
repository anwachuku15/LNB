import React, { useEffect, useState, useCallback, useRef } from 'react'
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
import { FlatList, NavigationActions } from 'react-navigation'

import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
// import '@firebase/firestore'
import { fetchNeeds, getNeed } from '../../redux/actions/postsActions'
import moment from 'moment'
import NeedActions from '../../components/LNB/NeedActions'
import { setLikes } from '../../redux/actions/authActions';
import { deleteNeed } from '../../redux/actions/postsActions'
import MessageIcon from '../../components/LNB/MessageIcon';
import MenuAvatar from '../../components/LNB/MenuAvatar'
import Lightbox from 'react-native-lightbox'
import Hyperlink from 'react-native-hyperlink'

const db = firebase.firestore()

const WINDOW_WIDTH = Dimensions.get('window').width
const WINDOW_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 10

let themeColor
let text

const HomeScreen = props => {
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
        }
        setAppState(nextAppState)
    }
    // PUSH NOTIFICATIONS
    useEffect(() => {
        registerForPushNotificationsAsync()
        const notificationsSub = Notifications.addListener(handleNotification)
        return () => {
            // registerForPushNotificationsAsync.remove()
            notificationsSub && Notifications.removeListener()
        }
    }, [registerForPushNotificationsAsync])

    const handleNotification = async notification => {
        // Vibration.vibrate()
        const { origin, data } = notification
        const { type, needId, senderName } = data
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
            }
        } else if (origin === 'received') {
            console.log(origin)
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
                // console.log(token);
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

    const flatListRef = useRef()
    const toTop = () => {
        flatListRef.current.scrollToOffset({animated: true, offset: 0})
    }
    
    const dispatch = useDispatch()
    const loadData = useCallback(async () => {
        setError(null)
        setIsRefreshing(true)
        try {
            await dispatch(fetchNeeds())
            dispatch(setLikes())
        } catch (err){
            console.log('here it is')
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
    }, [dispatch, loadData, isMounted, showNeedActions, isMounted])

    // NAV LISTENER
    useEffect(() => {
        const willFocusSub = props.navigation.addListener('willFocus', loadData)
        const willBlurSub = props.navigation.addListener('willBlur', loadData)
        // Clean up listener when function re-runs https://reactjs.org/docs/hooks-effect.html
        return () => {
            willFocusSub
            willBlurSub
        }
    }, [loadData])
    
    


    const selectUserHandler = (userId) => {
        props.navigation.navigate({
            routeName: 'UserProfile',
            params: {
                userId: userId
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
        console.log('not loading')
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
        console.log(needId)
        Alert.alert('Delete', 'Are you sure?', [
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

    const commentButtonHandler = (needId) => {
        dispatch(getNeed(needId))
        props.navigation.navigate({
            routeName: 'Comment',
            params: {
                needId: needId
            }
        })
    }



    const renderItem = ({item}) => (
        <TouchableCmp onPress={() => {
            props.navigation.navigate({
                routeName: 'PostDetail',
                params: {
                    needId: item.id
                }
            })
        }} useForeground>
            <View style={{...styles.feedItem, ...{backgroundColor: themeColor}}} key={item.id}>
                <TouchableCmp 
                    onPress={() => selectUserHandler(item.uid)}
                    style={{alignSelf:'flex-start'}}
                >
                    <Image source={{uri: item.userImage}} style={styles.avatar} />
                </TouchableCmp>
                <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row', justifyContent:'space-between', alignItems:'center'}}>
                        <View>
                            <TouchableCmp onPress={() => selectUserHandler(item.uid)}>
                                <Text style={{...styles.name, ...{color:text}}}>
                                    {item.userName}
                                    <Text style={styles.timestamp}>  ·  {moment(item.timestamp).fromNow()}</Text>
                                </Text>
                            </TouchableCmp>
                        </View>
                        <TouchableCmp onPress={() => {
                            item.uid === userId ? setIsDeletable(true) : setIsDeletable(false)
                            setIsModalVisible(!isModalVisible)
                            setSelectedNeed(item.id)
                        }}>
                            <Ionicons name='ios-more' size={24} color='#73788B'/>
                        </TouchableCmp>
                        <Modal
                            animationType='slide'
                            transparent={true}
                            visible={isModalVisible}
                            onDismiss={() => {}}
                        >
                            <View style={styles.modalView}>
                                <View style={styles.modal}>
                                    <Text style={styles.modalText}>Coming soon...</Text>
                                    <TouchableHighlight
                                        style={{ ...styles.modalButton, backgroundColor: "#2196F3" }}
                                        onPress={() => {
                                            setIsModalVisible(!isModalVisible);
                                        }}
                                    >
                                        <Text style={styles.modalButtonText}>Hide Modal</Text>
                                    </TouchableHighlight>
                                    {isDeletable && (
                                        <TouchableHighlight
                                            style={{ ...styles.modalButton, marginTop: 5, backgroundColor: Colors.redcrayola }}
                                            onPress={() => {deleteHandler(selectedNeed)}}
                                        >
                                            <Text style={styles.modalButtonText}>Delete</Text>
                                        </TouchableHighlight>
                                    )}
                                </View>
                            </View>
                        </Modal>
                    </View>
                    <Hyperlink
                        linkDefault={true}
                        linkStyle={{color:Colors.bluesea}}
                    >
                        <Text style={{...styles.post, ...{color:text}}}>{item.body}</Text>
                    </Hyperlink>
                    {item.imageUrl ? (
                        <Lightbox
                            backgroundColor='rgba(0, 0, 0, 0.8)'
                            underlayColor={themeColor}
                            springConfig={{tension: 15, friction: 7}}
                            renderHeader={(close) => (
                                <TouchableCmp 
                                    onPress={close}
                                    style={styles.closeButton}
                                >
                                    <Ionicons 
                                        name='ios-close'
                                        size={36}
                                        color='white'
                                    />
                                </TouchableCmp >
                            )}
                            renderContent={() => (
                                <Image source={{uri: item.imageUrl}} style={styles.lightboxImage} resizeMode='contain' />
                            )}
                        >
                            <Image 
                                source={{uri: item.imageUrl}} 
                                style={{...styles.postImage, ...{borderColor:Colors.disabled}}} 
                                resizeMethod='auto' 
                            />
                        </Lightbox>
                    ) : (
                        null
                    )}
                    {showNeedActions && item.id && (<NeedActions needId={item.id} leaveComment={() => commentButtonHandler(item.id)}/>)}
                </View>
            </View>
        </TouchableCmp>
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
                {/* HEADER */}
                <TouchableWithoutFeedback onPress={toTop}>
                    <View style={styles.header}>
                        {/* <HeaderButtons HeaderButtonComponent={HeaderButton}>
                            <Item
                                title='Menu'
                                iconName={Platform.OS==='android' ? 'md-menu' : 'ios-menu'}
                                onPress={() => {props.navigation.toggleDrawer()}}
                            />
                        </HeaderButtons> */}
                        <MenuAvatar 
                            toggleDrawer={() => props.navigation.toggleDrawer()}
                        />
                        <View>
                            <Image 
                                source={require('../../assets/lnb.png')} 
                                resizeMode='contain' 
                                style={{width:38, height:38}}
                            />
                        </View>
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
                </TouchableWithoutFeedback>

                {/* NEED POSTS */}
                
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



const styles = StyleSheet.create({
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

export default HomeScreen