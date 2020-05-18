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
    FlatList, 
    ActivityIndicator, 
    View, 
    StyleSheet, 
    Image, 
    SafeAreaView,
    UIManager
} from 'react-native'
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
import MessageIcon from '../../components/LNB/MessageIcon';
import MenuAvatar from '../../components/LNB/MenuAvatar'

const db = firebase.firestore()

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
        // return () => {
        //     registerForPushNotificationsAsync.remove()
        // }
    }, [registerForPushNotificationsAsync])
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

        return () => {
            setShowNeedActions(false)
            setIsMounted(false)
            // console.log('HomeScreen unmounted - loadData')
        }
    }, [isMounted, showNeedActions, isMounted])

    // NAV LISTENER
    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus',
            loadData
        )
        // Clean up listener when function re-runs https://reactjs.org/docs/hooks-effect.html
        return () => {
            willFocusSub
        }
    }, [loadData])

    useEffect(() => {
        setIsLoading(true)
        loadData().then(() => {
            setIsLoading(false)
        })
        return () => {
            loadData()
        }
    }, [dispatch, loadData])
    


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
                </View>
            </View>
        </Modal>
    )
   

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
                        {/* <View>
                            <TouchableCmp onPress={() => props.navigation.toggleDrawer()}>
                                <Image source={{uri: authUser.imageUrl}} style={styles.menuAvatar} />
                            </TouchableCmp>
                        </View> */}
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
                
                <FlatList
                    ref={flatListRef}
                    keyExtractor={(item, index) => index.toString()}
                    data={needs}
                    onRefresh={loadData}
                    refreshing={isRefreshing}
                    style={styles.feed}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={itemData => (
                        <TouchableCmp onPress={() => {
                            props.navigation.navigate({
                                routeName: 'PostDetail',
                                params: {
                                    needId: itemData.item.id
                                }
                            })
                        }} useForeground>
                            <View style={styles.feedItem} key={itemData.item.id}>
                                <TouchableCmp onPress={() => selectUserHandler(itemData.item.uid)}>
                                    <Image source={{uri: itemData.item.userImage}} style={styles.avatar} />
                                </TouchableCmp>
                                <View style={{flex: 1}}>
                                    <View style={{flexDirection: 'row', justifyContent:'space-between', alignItems:'center'}}>
                                        <View>
                                            <TouchableCmp onPress={() => selectUserHandler(itemData.item.uid)}>
                                                <Text style={styles.name}>
                                                    {itemData.item.userName}
                                                    <Text style={styles.timestamp}>  ·  {moment(itemData.item.timestamp).fromNow()}</Text>
                                                </Text>
                                            </TouchableCmp>
                                        </View>
                                        <TouchableCmp onPress={() => {
                                            console.log(itemData.item.id)
                                            setIsModalVisible(!isModalVisible)
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
                                                    <Text style={styles.modalText}>what</Text>
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
                                    <Text style={styles.post}>{itemData.item.body}</Text>
                                    {itemData.item.imageUrl ? (
                                        <Image source={{uri: itemData.item.imageUrl}} style={styles.postImage} resizeMode='cover'/>
                                    ) : (
                                        null
                                    )}
                                    {showNeedActions && itemData.item.id && (<NeedActions needId={itemData.item.id} leaveComment={() => commentButtonHandler(itemData.item.id)}/>)}
                                </View>
                            </View>
                        </TouchableCmp>
                    )}
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
        borderRadius: 5,
        padding: 8,
        flexDirection: 'row',
        marginVertical: 5,
        backgroundColor: 'white',
        shadowColor: 'black',
        shadowOpacity: 0.26,
        shadowOffset: {width: 0, height: 2},
        // shadowRadius: 8,
        elevation: 5,
        // borderRadius: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 16
    },
    name: {
        fontSize: 15,
        fontWeight: '500',
        color: "#454D65",
    },
    timestamp: {
        fontSize: 14,
        color: '#C4C6CE',
        marginTop: 4
    },
    post: {
        marginTop: 16,
        fontSize: 14,
        color: '#838899'
    },
    postImage: {
        width: undefined,
        height: 150,
        borderRadius: 5,
        marginVertical: 16
    }
})

export default HomeScreen