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
    KeyboardAvoidingView 
} from 'react-native'
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
const db = firebase.firestore()

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
    const senderName = props.navigation.getParam('senderName')

    const need = useSelector(state => state.posts.allNeeds.find(need => need.id === needId))
    const dispatch = useDispatch()

    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState()
    const [body, setBody] = useState('')
    const [image, setImage] = useState()
    const [comments, setComments] = useState()

    const userLikes = useSelector(state => state.auth.likes)
    const [likeCount, setLikeCount] = useState(need.likeCount)
    const [commentCount, setCommentCount] = useState(need.commentCount)
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
        return () => mounted = false
    }, [loadComments])

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

        return () => {
            setLikeIcon
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


    const selectUserHandler = (userId) => {
        props.navigation.navigate({
            routeName: 'UserProfile',
            params: {
                userId: userId
            }
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


    const commentButtonHandler = () => {
        props.navigation.navigate('Comment')
    }

    const renderComment = ({item}) => (
        <TouchableCmp onPress={() => {}}>
            <View style={{...styles.commentView, ...{backgroundColor:background}}} key={item.commentId}>
                <Image source={{uri: item.userImage}} style={styles.commentAvatar}/>
                <View style={{flex: 1, backgroundColor: scheme === 'light' ? '#EEEEEE' : '#414141', padding:10, borderTopRightRadius: 15, borderBottomLeftRadius: 15, borderBottomRightRadius: 15}}>
                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                        <View>
                            <TouchableCmp onPress={() => {}}>
                                <Text style={{fontSize: 15, fontWeight:'600', color: scheme==='light' ? 'black' : 'white'}}>
                                    {item.userName}
                                    <Text style={styles.timestamp}>  ·  {moment(item.timestamp).fromNow()}</Text>
                                </Text>
                            </TouchableCmp>
                        </View>
                    </View>
                    <Text style={{marginTop:12, fontSize: 14, color: scheme === 'light' ? 'black' : 'white'}}>{item.body}</Text>
                </View>
            </View>
        </TouchableCmp>
    )

    const likeHandler = () => {
        dispatch(likeNeed(needId))
    }
    const unlikeHandler = () => {
        dispatch(unLikeNeed(needId))
    }

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }

    
    return (
        <View style={styles.screen}>
            {/* HEADER */}
            <View style={{...styles.header, ...{paddingBottom: senderName ? 1 : 16}}}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Back'
                        iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        onPress={() => {props.navigation.goBack()}}
                    />
                </HeaderButtons>
                {senderName ? (
                    <View>
                        <Text style={{...styles.headerTitle, ...{textAlign:'center'}}}>Liked</Text>
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
            </View>
            
            <View style={styles.feedItem}>
                <TouchableCmp onPress={() => selectUserHandler(need.uid)}>
                    <Image source={{uri: need.userImage}} style={styles.avatar} />
                </TouchableCmp>
                <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row', justifyContent:'space-between', alignItems:'center'}}>
                        <View>
                            <TouchableCmp onPress={() => selectUserHandler(need.uid)}>
                                <Text style={styles.name}>
                                    {need.userName}
                                    <Text style={styles.timestamp}>  ·  {moment(need.timestamp).fromNow()}</Text>
                                </Text>
                            </TouchableCmp>
                        </View>
                        <Ionicons name='ios-more' size={24} color='#73788B'/>
                    </View>
                    <Text style={styles.post}>{need.body}</Text>
                    {need.imageUrl ? (
                        <Image source={{uri: need.imageUrl}} style={styles.postImage} resizeMode='cover'/>
                    ) : (
                        null
                    )}
                    {/* <NeedActions needId={need.id} leaveComment={commentButtonHandler}/> */}
                    <View style={{paddingTop: 15, width: '75%', flexDirection: 'row', justifyContent:'space-between', alignItems: 'center'}}>
                        <TouchableCmp onPress={isLiked ? unlikeHandler : likeHandler}>
                            <View style={{flexDirection:'row'}}>
                                <MaterialCommunityIcons name={isLiked ? 'thumb-up' : 'thumb-up-outline'} size={24} color={Colors.primary} style={{marginRight: 7}} />
                                {/* {likeCount > 0 && <Text style={{color:Colors.disabled, alignSelf:'center'}}>{likeCount}</Text>} */}
                            </View>
                        </TouchableCmp>
                        <TouchableCmp onPress={() => {}}>
                            <View style={{flexDirection:'row'}}>
                                <MaterialIcons name='comment' size={24} color={Colors.primary} style={{}} />
                                {/* {commentCount > 0 && <Text style={{color:Colors.disabled, alignSelf:'center', marginLeft: 7}}>{commentCount}</Text>} */}
                            </View>
                        </TouchableCmp>
                    </View>
                </View>
            </View>

            {/* Comments */}
            {isLoading && (
                <View style={styles.spinner}>
                    <ActivityIndicator 
                        size='large'
                        color={Colors.primary}
                    />
                </View>
            )}
            {!isLoading && comments.length > 0 ? (
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={comments}
                    renderItem={renderComment}
                    onRefresh={loadComments}
                    refreshing={isRefreshing}
                />
            ) : (
                <View style={{alignSelf:'center', flex:1}}></View>
            )}

            <KeyboardAvoidingView behavior='padding'>
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', paddingLeft: 20, paddingRight:20}}>
                    <View style={styles.inputContainer}>
                        <TouchableCmp onPress={pickImage} style={{justifyContent:'center', alignItems:'center', backgroundColor:Colors.primary, padding:0, borderRadius:20, width:30, height:30}}>
                            <Ionicons name='md-camera' size={20} color='white'/>
                        </TouchableCmp>
                        <TextInput
                            autoFocus={false}
                            multiline={true}
                            numberOfLines={4} 
                            style={{flex:1, color:text, marginHorizontal:10, alignSelf:'center', paddingTop:0}}
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

PostDetailScreen.navigationOptions = navData => {
    return {
        headerTitle: navData.navigation.getParam('productTitle'),
        headerLeft: () => {
            return (
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Go Back'
                        iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        onPress={() => {
                            navData.navigation.navigate({
                                routeName: 'ProductCartTab'
                            })
                        }}
                    />
                </HeaderButtons>
            )
        }
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
    commentView: {
        padding: 10,
        flexDirection: 'row'
    },
    inputContainer: {
        margin: 10,
        paddingHorizontal: 5,
        paddingVertical: 5,
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
        paddingTop: 49,
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
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10
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
        marginTop: 12,
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

export default PostDetailScreen