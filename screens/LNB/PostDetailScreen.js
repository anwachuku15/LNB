import React, { useEffect, useState, useCallback, useMemo } from 'react'
import firebase from 'firebase'
// import '@firebase/firestore'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
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
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
} from 'react-native'
import { Video } from 'expo-av'

import { withNavigationFocus } from 'react-navigation'
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

const SCREEN_WIDTH = Dimensions.get('window').width


const db = firebase.firestore()

const WINDOW_WIDTH = Dimensions.get('window').width
const WINDOW_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 10

let themeColor
let text
let background
const PostDetailScreen = props => {
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
    const senderName = props.navigation.getParam('senderName')
    const type = props.navigation.getParam('type')

    const need = useSelector(state => state.posts.allNeeds.find(need => need.id === needId))
    const dispatch = useDispatch()

    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState()
    const [body, setBody] = useState('')
    const [image, setImage] = useState()
    const [comments, setComments] = useState()

    const userLikes = useSelector(state => state.auth.likes)
    const [likeCount, setLikeCount] = useState()
    const [commentCount, setCommentCount] = useState()
    const [isLiked, setIsLiked] = useState(false)


    const commentAvatar = (item) => {
        return (
            <Avatar
                source={{ uri: item.userImage }}
            />
        )
    }

    // ChatScreen.js:88
    const loadComments = useCallback(async () => {
        setError(null)
        setIsRefreshing(true)
        try {
            await dispatch(getNeed(needId))
            let postComments = []
            const allComments = await (await db.collection('comments').orderBy('timestamp', 'asc').get())
                                                                      .docs
                                                                      .forEach(doc => {
                                                                        if (doc.data().postId === needId) {
                                                                            postComments.push({
                                                                                commentId: doc.id,
                                                                                ...doc.data()
                                                                            })
                                                                        }
                                                                      })
            setComments(postComments)
            setLikeCount(need.likeCount)
            setCommentCount(need.commentCount)
        } catch (err) {
            console.log(err)
            setError(err.message)
        }
        setIsRefreshing(false)
    }, [setComments, setIsRefreshing, setError])

    

    useEffect(() => {
        let mounted = true
        setIsLoading(true)
        if (mounted) {
            loadComments().then(() => {
                setIsLoading(false)
            })
        }
        return () => {
            mounted = false 
        }
    }, [loadComments])

    useEffect(() => {
        const setLikeIcon = db.collection('likes')
            .where('needId', '==', needId)
            .where('uid', '==', uid)
            .onSnapshot(snapshot => {
                if (snapshot.empty) {
                    setIsLiked(false)
                } else {
                    setIsLiked(true)
                }
            })
        const needDataListener = db.doc(`/needs/${needId}`).onSnapshot(snapshot => {
            if (snapshot.exists) {
                setLikeCount(snapshot.data().likeCount)
                setCommentCount(snapshot.data().commentCount)
            }
        })
        return () => {
            needDataListener()
            setLikeIcon()
        }
    },[dispatch])

    if (error) {
        return (
            <View style={styles.spinner}>
                <Text>An error occured</Text>
                <Button title='try again' onPress={loadComments} color={Colors.primary}/>
            </View>
        )
    }

    if (!need) {
        return (
            <View style={styles.spinner}>
                <Text>This post might have been deleted</Text>
            </View>
        )
    }


    const selectUserHandler = (userId, userName) => {
        if (from === 'HomeScreen' || from === 'NotificationsScreen') {
            props.navigation.push(
                'UserProfile', {
                    userId: userId,
                    name: userName,
                    from: 'PostDetailScreen'
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
                        from: 'PostDetailScreen'
                    }
                ) 
            }
        } else {
            props.navigation.push(
                'UserProfile', {
                    userId: userId,
                    name: userName,
                    from: 'PostDetailScreen'
                }
            )
        }
    }

    const navToLikes = () => {
        props.navigation.push('PostLikes', {
            needId: needId
        })
    }

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

    const handlePost = async () => {
        
        try {
            setIsLoading(true)
            await dispatch(createComment(needId, body, image))
            setBody('')
            setImage()
            loadComments().then(() => {
                setIsLoading(false)
            })
        } catch (err) {
            alert(err)
            console.log(err)
        }
    }


    const renderComment = ({item}) => (
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
                    <Hyperlink
                        linkDefault={true}
                        linkStyle={{color:Colors.blue}}
                    >
                        <Text style={{marginTop:12, fontSize: 14, color: scheme === 'light' ? 'black' : 'white'}}>{item.body}</Text>
                    </Hyperlink>
                </View>
            </View>
        </TouchableCmp>
    )

    // const renderUser = 

    const likeHandler = () => {
        dispatch(likeNeed(needId))
    }
    const unlikeHandler = () => {
        dispatch(unLikeNeed(needId))
    }

    const MemoizedAvatar = useMemo(() => {
        return <Image source={{uri: need.userImage}} style={styles.avatar} />
    }, [])

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }

    
    return (
        <View style={{backgroundColor: background, ...styles.screen}}>
            {/* Comments */}
            {isLoading && (
                <View style={styles.spinner}>
                    <ActivityIndicator 
                        size='large'
                        color={Colors.primary}
                    />
                </View>
            )}
            {!isLoading && comments.length > -1 ? (
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={comments}
                    renderItem={renderComment}
                    onRefresh={loadComments}
                    refreshing={isRefreshing}
                    ListEmptyComponent={() => (
                        <View style={{flex:1, justifyContent:'center', alignItems:'center', paddingTop: 10}}>
                            <Text style={{color:Colors.placeholder}}>Be the first to comment on {need.userName}'s need!</Text>
                        </View>
                    )}
                    ListHeaderComponent={() => (
                        <View style={{...styles.feedItem, ...{backgroundColor: scheme==='dark' ? Colors.darkSearch : 'white'}}}>
                            <TouchableCmp 
                                onPress={() => selectUserHandler(need.uid, need.userName)}
                                style={{alignSelf:'flex-start'}}
                            >
                                <Image source={{uri: need.userImage, cache: 'force-cache'}} style={styles.avatar} />
                                {/* {MemoizedAvatar} */}
                            </TouchableCmp>
                            <View style={{flex: 1}}>
                                <View style={{flexDirection: 'row', justifyContent:'space-between', alignItems:'center'}}>
                                    <View>
                                        <TouchableCmp onPress={() => selectUserHandler(need.uid, need.userName)}>
                                            <Text style={{...styles.name, ...{color:Colors.primary}}}>
                                                {need.userName}
                                                <Text style={styles.timestamp}>  ·  {moment(need.timestamp).fromNow()}</Text>
                                            </Text>
                                        </TouchableCmp>
                                    </View>
                                    <Ionicons name='ios-more' size={24} color='#73788B'/>
                                </View>
                                <Hyperlink
                                    linkDefault={true}
                                    linkStyle={{color:Colors.bluesea}}
                                >
                                    {/* <Text selectable style={{...styles.post, ...{color:text}}}>{need.body}</Text> */}
                                    <TextInput 
                                        multiline 
                                        scrollEnabled={false} 
                                        editable={false} 
                                        style={{...styles.post, color:text}}
                                    >{need.body}</TextInput>
                                </Hyperlink>
                                {need.imageUrl ? (
                                    <Image source={{uri: need.imageUrl}} style={styles.postImage} resizeMode='cover'/>
                                ) : (
                                    null
                                )}
                                {need.media ? (
                                    need.media.type === 'image' ? (
                                        <Image source={{uri: need.media.uri}} style={styles.postImage} resizeMode='cover'/>
                                    ) : (
                                        <TouchableWithoutFeedback>
                                            <Video
                                                source={{uri: need.media.uri}}
                                                useNativeControls
                                                rate={1.0}
                                                volume={1.0}
                                                isMuted={true}
                                                style={{...styles.postVideo}}
                                                resizeMode='cover'
                                            />
                                        </TouchableWithoutFeedback>
                                    )
                                ) : (
                                    null
                                )}
                                <View style={{paddingTop: 15, width: '75%', flexDirection: 'row', justifyContent:'space-between', alignItems: 'center'}}>
                                    <TouchableCmp onPress={() => {}}>
                                        <View style={{flexDirection:'row'}}>
                                            <MaterialIcons name='comment' size={24} color={Colors.green} style={{}} />
                                            {/* {commentCount > 0 && <Text style={{color:Colors.disabled, alignSelf:'center', marginLeft: 7}}>{commentCount}</Text>} */}
                                        </View>
                                    </TouchableCmp>
                                    <TouchableCmp onPress={isLiked ? unlikeHandler : likeHandler}>
                                        <View style={{flexDirection:'row'}}>
                                            <MaterialCommunityIcons name={isLiked ? 'thumb-up' : 'thumb-up-outline'} size={24} color={Colors.pink} style={{marginRight: 7}} />
                                            {need && need.likeCount > 0 && (
                                                <TouchableCmp 
                                                    style={{flexDirection:'row'}}
                                                    onPress={() => navToLikes()}
                                                >
                                                    <Text style={{color:text, fontWeight: 'bold', alignSelf:'center'}}>{likeCount}</Text>
                                                    {need && need.likeCount === 1 ? ( 
                                                        <Text style={{color:Colors.disabled, alignSelf:'center'}}> like</Text>
                                                    ) : (
                                                        <Text style={{color:Colors.disabled, alignSelf:'center'}}> likes</Text>
                                                    )}
                                                </TouchableCmp>
                                            )}
                                        </View>
                                    </TouchableCmp>
                                    
                                </View>
                            </View>
                        </View>
                    )}
                />
            ) : (
                <View style={{alignSelf:'center', flex:1}}></View>
            )}

            <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={Platform.select({ios: 85, android:500})}>
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', paddingLeft: 20, paddingRight:20}}>
                    <View style={styles.inputContainer}>
                        {/* <TouchableCmp onPress={pickImage} style={{justifyContent:'center', alignItems:'center', backgroundColor:Colors.primary, padding:0, borderRadius:20, width:30, height:30}}>
                            <Ionicons name='md-camera' size={20} color='white'/>
                        </TouchableCmp> */}
                        <TextInput
                            autoFocus={false}
                            multiline={true}
                            numberOfLines={4} 
                            style={{flex:1, color:text, marginHorizontal:10, alignSelf:'center', paddingTop:0, fontSize: 15}}
                            placeholder={'Leave a reply'}
                            placeholderTextColor={'#838383'}
                            onChangeText={text => {setBody(text)}}
                            value={body}
                        />
                    </View>
                    <TouchableCmp onPress={handlePost} disabled={!body.trim().length}>
                        <Ionicons 
                            name='md-send' 
                            size={24} 
                            color={!body.trim().length ? Colors.disabled : Colors.primary}
                        />
                    </TouchableCmp>
                </View>
            </KeyboardAvoidingView>

        </View>
    )
}

PostDetailScreen.navigationOptions = (navData) => {
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
        // headerRight: () => (
        //     <HeaderButtons HeaderButtonComponent={HeaderButton}>
        //         <Item
        //             ButtonElement={<MessageIcon/>}
        //             title='Messages'
        //             onPress={() => {
        //                 props.navigation.navigate('Messages')
        //             }}
        //         />
        //     </HeaderButtons>
        // ),
        headerTitle: () => (
            <Text style={styles.headerTitle}>Need</Text>
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
    likeInfo: {
        paddingTop: 5,
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.disabled
    },
    commentView: {
        padding: 10,
        flexDirection: 'row'
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
        // marginTop: 12,
        marginTop: 5,
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
    postVideo: {
        borderRadius: 10,
        alignItems: 'flex-end',
        height: 400,
        width: SCREEN_WIDTH * 0.75
    },
})

export default PostDetailScreen