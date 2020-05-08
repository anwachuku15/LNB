import React, { useEffect, useState, useCallback } from 'react'
import firebase from 'firebase'
// import '@firebase/firestore'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
// REACT-NATIVE
import { Platform, ScrollView, TouchableOpacity, TouchableNativeFeedback, Text, Button, FlatList, ActivityIndicator, View, StyleSheet, Image, SafeAreaView } from 'react-native'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { fetchNeeds, likeNeed } from '../../redux/actions/postsActions'
import moment from 'moment'
import NeedActions from '../../components/LNB/NeedActions'
import { setLikes } from '../../redux/actions/authActions';
import { ListItem } from 'react-native-elements'

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

    const needId = props.navigation.getParam('needId')
    const need = useSelector(state => state.posts.allNeeds.find(need => need.id === needId))
    const dispatch = useDispatch()

    const [comments, setComments] = useState()
    const loadComments = useCallback(async () => {
        try {
            let postComments = []
            const allComments = await (await db.collection('comments').orderBy('timestamp', 'desc').get())
                                                                      .docs
                                                                      .forEach(doc => {
                                                                        if (doc.data().postId === needId) {
                                                                            postComments.push(doc.data())
                                                                        } else {
                                                                            console.log('nothing')
                                                                        }
                                                                      })
            setComments(postComments)
        } catch (err) {
            console.log(err)
        }
    }, [setComments])

    useEffect(() => {
        loadComments()
    }, [loadComments])

    


    const selectUserHandler = (userId) => {
        props.navigation.navigate({
            routeName: 'UserProfile',
            params: {
                userId: userId
            }
        })
    }

    const commentButtonHandler = () => {
        props.navigation.navigate('Comment')
    }

    const renderComment = ({item}) => (
        <TouchableCmp onPress={() => {}}>
            <ListItem 
                containerStyle={{backgroundColor: background}}
                title={
                    <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                        <Text style={{color:'#454D65', fontSize: 16}}>{item.userName}</Text>
                        <Text style={{color:Colors.disabled, fontSize: 14}}>{moment(item.timestamp).fromNow()}</Text>
                    </View>
                }
                subtitle={
                    <View style={{flexDirection:'row'}}>
                        <Text style={{color: text}}>{item.body}</Text>
                    </View>
                }
                leftAvatar={{source: {uri: item.userImage}}}
                bottomDivider
                topDivider
            />
        </TouchableCmp>
    )

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }
    return (
        <View>
            {/* HEADER */}
            <View style={styles.header}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Back'
                        iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        onPress={() => {props.navigation.goBack()}}
                    />
                </HeaderButtons>
                <Text style={styles.headerTitle}>Need Detail</Text>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Direct'
                        iconName={Platform.OS==='android' ? 'md-chatboxes' : 'ios-chatboxes'}
                        onPress={() => {
                            props.navigation.navigate('Messages')
                        }}
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
                    <NeedActions needId={need.id} leaveComment={commentButtonHandler}/>
                </View>
            </View>

            {/* Comments */}
            {comments && comments.length > 0 ? (
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={comments}
                    renderItem={renderComment}
                />
            ): (
                <Text style={{color:text, alignSelf:'center'}}>No Comments</Text>
            )}
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
        flex: 1,
        backgroundColor: themeColor
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingTop: 49,
        paddingBottom: 16,
        backgroundColor: themeColor,
        borderBottomColor: Colors.primary,
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

export default PostDetailScreen