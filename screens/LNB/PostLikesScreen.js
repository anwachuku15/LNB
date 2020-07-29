import React, { useEffect, useState, useCallback, useMemo } from 'react'

// REDUX
import { useSelector, useDispatch } from 'react-redux'
import { connectReq, unrequest, confirmConnect, disconnect, declineConnect } from '../../redux/actions/authActions'

// REACT-NATIVE
import { 
    Platform,
    ScrollView, 
    TouchableOpacity, 
    TouchableNativeFeedback, 
    Text, 
    TextInput, 
    Button, 
    FlatList, 
    ActivityIndicator, 
    View, 
    StyleSheet, 
    Image, 
    SafeAreaView, 
    Dimensions,
    KeyboardAvoidingView 
} from 'react-native'
import TouchableCmp from '../../components/LNB/TouchableCmp'
import Clipboard from '@react-native-community/clipboard'
import { SharedElement } from 'react-navigation-shared-element'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { getNeed, likeNeed, unLikeNeed } from '../../redux/actions/postsActions'
import moment from 'moment'
import { Avatar, ListItem } from 'react-native-elements'
import * as ImagePicker from 'expo-image-picker'
import { createComment } from '../../redux/actions/postsActions'
import Lightbox from 'react-native-lightbox'
import Hyperlink from 'react-native-hyperlink'

import { db } from '../../Firebase/Fire'


const WINDOW_WIDTH = Dimensions.get('window').width
const WINDOW_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 10

let themeColor
let text
let background
const PostLikesScreen = props => {
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
        background = 'black'
    } 
    if (scheme === 'light') {
        themeColor = 'white'
        text = 'black'
        background = 'white'
    }

    const uid = useSelector(state => state.auth.userId)
    const needId = props.navigation.getParam('needId')
    const from = props.navigation.getParam('from')
    

    const need = useSelector(state => state.posts.allNeeds.find(need => need.id === needId))

    const userConnectionIds = useSelector(state => state.auth.userConnectionIds)
    const outgoingRequests = useSelector(state => state.auth.outgoingRequests)
    const incomingRequests = useSelector(state => state.auth.pendingConnections)


    const dispatch = useDispatch()

    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState()
    const [body, setBody] = useState('')
    const [image, setImage] = useState()
    const [likers, setLikers] = useState()
    

    const userLikes = useSelector(state => state.auth.likes)
    const [likeCount, setLikeCount] = useState(need.likeCount)
    const [commentCount, setCommentCount] = useState(need.commentCount)
    const [isLiked, setIsLiked] = useState(false)

    const loadLikers = useCallback(async () => {
        setError(null)
        setIsRefreshing(true)
        try {
            await dispatch(getNeed(needId))
            let postLikers = []
            const allLikes = await (await db.collection('likes').orderBy('timestamp', 'desc').get())
                                                                      .docs
                                                                      .forEach(doc => {
                                                                        if (doc.data().needId === needId) {
                                                                            postLikers.push({
                                                                                likeId: doc.id,
                                                                                ...doc.data()
                                                                            })
                                                                        }
                                                                      })
            setLikers(postLikers)
        } catch (err) {
            console.log(err)
            setError(err.message)
        }
        setIsRefreshing(false)
    }, [setLikers, setIsRefreshing, setError])

    useEffect(() => {
        let mounted = true
        setIsLoading(true)
        if (mounted) {
            loadLikers().then(() => {
                setIsLoading(false)
            })
        }
        return () => mounted = false
    }, [loadLikers])

    useEffect(() => {
        const setLikeIcon = db.collection('likes')
            .where('needId','==',needId)
            .where('uid', '==', uid)
            .onSnapshot(snapshot => {
                if (snapshot.empty) {
                    setIsLiked(false)
                } else {
                    setIsLiked(true)
                }
            })
        const needDataListener = db.doc(`/needs/${props.needId}`).onSnapshot(snapshot => {
            if (snapshot.exists) {
                setLikeCount(snapshot.data().likeCount)
                setCommentCount(snapshot.data().commentCount)
            }
        })

        return () => {
            setLikeIcon()
            needDataListener()
        }
    },[dispatch])

    if (error) {
        return (
            <View style={styles.spinner}>
                <Text>An error occured</Text>
                <Button title='try again' onPress={loadData} color={Colors.primary}/>
            </View>
        )
    }


    const selectUserHandler = (userId, userName) => {
        if (from === 'HomeScreen' || from === 'NotificationsScreen') {
            props.navigation.push(
                'UserProfile', {
                    userId: userId,
                    name: userName,
                    from: 'PostLikesScreen'
                }
            )
        } else if (from === 'UserProfileScreen') {
            if (need.uid === userId) {
                props.navigation.goBack()
            } else {
                props.navigation.push(
                    'UserProfile', {
                        userId: userId,
                        name: userName,
                        from: 'PostLikesScreen'
                    }
                ) 
            }
        } else {
            props.navigation.push(
                'UserProfile', {
                    userId: userId,
                    name: userName,
                    from: 'PostLikesScreen'
                }
            )
        }
    }

    


    


    const disconnectHandler = (authId, selectedUserId, selectedUserName) => {
        Alert.alert('Disconnect', 'Are you sure you want to disconnect from ' + selectedUserName + '?', [
            {
                text: 'No',
                style: 'cancel'
            },
            {
                text: 'Yes',
                style: 'destructive',
                onPress: () => {dispatch(disconnect(authId, selectedUserId))}
            }
        ])
    }

    const unrequestHandler = (authId, selectedUserId) => {
        Alert.alert('Remove Request', 'Are you sure you want to remove your pending request?', [
            {
                text: 'Keep',
                style: 'cancel'
            },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {dispatch(unrequest(authId, selectedUserId))}
            }
        ])
    }


    const renderItem = ({item}) => (
        <TouchableCmp onPress={() => {selectUserHandler(item.uid, item.userName)}}>
            <ListItem
                containerStyle={{
                    backgroundColor:background,
                    paddingHorizontal: 14,
                    paddingVertical: 5,

                }}
                leftAvatar={{
                    source: {uri: item.userImage},
                    containerStyle: {
                        height: 64,
                        width: 64,
                        borderRadius: 32
                    },
                    rounded: true
                }}
                title={
                    <Text style={{color:text, fontSize: 16}}>{item.userName}</Text>
                }
                rightElement={item.uid !== uid ? (
                    <View style={styles.buttonContainer}>
                        {userConnectionIds && !userConnectionIds.includes(item.uid) && !outgoingRequests.includes(item.uid) && !incomingRequests.includes(item.uid) && (
                            <TouchableCmp
                                style={styles.connectButton}
                                onPress={() => {
                                    dispatch(connectReq(uid, authName, item.uid))
                                }}
                            >
                                <Text style={styles.connectText}>Connect</Text>
                            </TouchableCmp>
                        )}
                        {outgoingRequests.includes(item.uid) && (
                            <TouchableCmp
                                style={styles.requestedButton}
                                onPress={() => {
                                    unrequestHandler(uid, item.uid)
                                }}
                            >
                                <Text style={styles.requestedText}>Requested</Text>
                            </TouchableCmp>
                        )}
                        {incomingRequests.includes(item.uid) && (
                            <View style={{flexDirection: 'column'}}>
                                <TouchableCmp
                                    style={styles.acceptButton}
                                    onPress={() => {
                                        dispatch(confirmConnect(uid, authName, item.uid, item.userName))
                                    }}
                                >
                                    <Text style={styles.acceptText}>Accept</Text>
                                </TouchableCmp>
                                <TouchableCmp
                                    style={styles.declineButton}
                                    onPress={() => {
                                        dispatch(declineConnect(uid, authName, item.userName))
                                    }}
                                >
                                    <Text style={styles.declineText}>Decline</Text>
                                </TouchableCmp>
                            </View>
                        )}
                        {userConnectionIds.includes(item.uid) && (
                            <TouchableCmp
                                style={styles.connectedButton}
                                onPress={() => {
                                    disconnectHandler(uid, item.uid, item.userName)
                                }}
                            >
                                <Text style={styles.connectedText}>Connected</Text>
                            </TouchableCmp>
                        )}
                    </View>
                ) : (null)}
                // bottomDivider
            />
        </TouchableCmp>
    )

    const renderLiker = ({item}) => (
        <TouchableCmp onPress={() => {}}>
            <View style={{...styles.commentView, ...{backgroundColor:background}}} key={item.commentId}>
                <TouchableCmp onPress={() => selectUserHandler(item.uid, item.userName)}>
                    <Image source={{uri: item.userImage}} style={styles.commentAvatar}/>
                </TouchableCmp>
                <View style={{flex: 1, backgroundColor: scheme === 'light' ? '#EEEEEE' : '#414141', padding:10, borderTopRightRadius: 15, borderBottomLeftRadius: 15, borderBottomRightRadius: 15}}>
                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                        <View>
                            <TouchableCmp onPress={() => selectUserHandler(item.uid, item.userName)}>
                                <Text style={{fontSize: 15, fontWeight:'600', color: scheme==='light' ? 'black' : 'white'}}>
                                    {item.userName}
                                    <Text style={styles.timestamp}>  ·  {moment(item.timestamp).fromNow()}</Text>
                                </Text>
                            </TouchableCmp>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableCmp>
    )

    
    return (
        <View style={styles.screen}>
            {/* HEADER */}
            {/* <View style={{...styles.header, ...{paddingBottom: senderName ? 1 : 16}}}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Back'
                        iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        onPress={() => {props.navigation.goBack()}}
                    />
                </HeaderButtons>
                {senderName ? (
                    <View style={{alignItems:'center'}}>
                        {type === 'likeNeed' && <Text style={{...styles.headerTitle, ...{textAlign:'center'}}}>Liked</Text>}
                        {type === 'commentNeed' && <Text style={{...styles.headerTitle, ...{textAlign:'center'}}}>New Comment</Text>}
                        {type === 'commentThread' && <Text style={{...styles.headerTitle, ...{textAlign:'center'}}}>New Comment</Text>}
                        <Text style={{color:Colors.disabled, fontFamily: 'open-sans', fontSize:12}}>by {senderName}</Text>
                    </View>
                ) : (
                    <Text style={styles.headerTitle}>Need Detail</Text>
                )}
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Direct'
                        iconName={Platform.OS==='android' ? 'md-more' : 'ios-more'}
                        onPress={() => {}}
                    />
                </HeaderButtons>
            </View> */}
            

            {/* Comments */}
            {isLoading && (
                <View style={styles.spinner}>
                    <ActivityIndicator 
                        size='large'
                        color={Colors.primary}
                    />
                </View>
            )}
            {!isLoading && likers.length > -1 ? (
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={likers}
                    renderItem={renderItem}
                    onRefresh={loadLikers}
                    refreshing={isRefreshing}
                />
            ) : (
                <View style={{alignSelf:'center', flex:1}}></View>
            )}

        </View>
    )
}

PostLikesScreen.navigationOptions = (navData) => {
    const background = navData.screenProps.theme
    return {
        headerLeft: () => (
            <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item
                    title='Back'
                    iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                    onPress={() => {navData.navigation.goBack()}}
                />
            </HeaderButtons>
        ),
        headerTitle: () => (
            <Text style={styles.headerTitle}>Liked by</Text>
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
            backgroundColor: background === 'dark' ? 'black' : 'white'
        },
        
    }
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
    screen: {
        flex: 1
    },
    buttonContainer: {
        justifyContent: 'center',
        width: '25%'
    },
    connectButton: {
        height: 24,
        marginVertical: 5,
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
        borderWidth: 1,
        borderRadius: 50
    },
    connectText: {
        alignSelf:'center',
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
    },
    connectedButton: {
        height: 24,
        marginVertical: 5,
        justifyContent: 'center',
        borderColor: Colors.primary,
        borderWidth: 1,
        borderRadius: 50
    },
    connectedText: {
        alignSelf:'center',
        color: Colors.primary,
        fontSize: 12, 
        fontWeight: 'bold'
    },
    acceptButton: {
        height: 24,
        marginVertical: 5,
        justifyContent: 'center',
        borderColor: Colors.green,
        borderWidth: 1,
        borderRadius: 50
    },
    acceptText: {
        alignSelf:'center',
        color: Colors.green,
        fontSize: 12, 
        fontWeight: 'bold'
    },
    declineButton: {
        height: 24,
        marginVertical: 5,
        justifyContent: 'center',
        borderColor: Colors.raspberry,
        borderWidth: 1,
        borderRadius: 50
    },
    declineText: {
        alignSelf:'center',
        color: Colors.raspberry,
        fontSize: 12, 
        fontWeight: 'bold'
    },
    requestedButton: {
        height: 24,
        marginVertical: 5,
        justifyContent: 'center',
        borderColor: Colors.disabled,
        borderWidth: 1,
        borderRadius: 50
    },
    requestedText: {
        alignSelf:'center',
        color: Colors.disabled,
        fontSize: 12, 
        fontWeight: 'bold'
    },

    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingTop: 47.5,
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
    feed: {
        // marginHorizontal: 16
    },
    feedItem: {
        borderRadius: 5,
        padding: 8,
        flexDirection: 'row',
        marginVertical: 5,
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
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10
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
        marginTop: 12,
        fontSize: 14,
    },
    postImage: {
        width: undefined,
        minHeight: 200,
        maxHeight: 300,
        borderRadius: 5,
        borderWidth: StyleSheet.hairlineWidth,
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

export default PostLikesScreen