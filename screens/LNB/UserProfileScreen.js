import React, { useEffect, useState, useCallback } from 'react'
import { 
    AppState,
    Platform,
    SafeAreaView,
    TouchableOpacity,
    View, 
    Text, 
    StyleSheet, 
    Image, 
    Button, 
    ScrollView,
    FlatList,
    ActivityIndicator,
    Alert,
    TouchableWithoutFeedback,
    Animated,
    Dimensions
} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import { withNavigationFocus } from 'react-navigation'
import { LinearGradient } from 'expo-linear-gradient'
import { SharedElement } from 'react-navigation-shared-element'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { Ionicons } from '@expo/vector-icons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import TouchableCmp from '../../components/LNB/TouchableCmp'
import * as firebase from 'firebase'
import { logout, getUser, connectReq, unrequest, disconnect, confirmConnect, setLikes } from '../../redux/actions/authActions'
import moment from 'moment'
import { fetchNeeds, getNeed } from '../../redux/actions/postsActions'
import * as Linking from 'expo-linking'
import Lightbox from 'react-native-lightbox'
import Hyperlink from 'react-native-hyperlink'

import NeedPost from '../../components/LNB/NeedPost'

const db = firebase.firestore()

let SCREEN_WIDTH = Dimensions.get('window').width
let SCREEN_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 10

let themeColor
let text
const UserProfileScreen = props => {
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
    } 
    if (scheme === 'light') {
        themeColor = 'white'
        text = 'black'
    }

    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState()

    
    const [connect, setConnect] = useState(false)
    const [accept, setAccept] = useState(false)
    const [requested, setRequested] = useState(false)
    const [connected, setConnected] = useState(false)
    const [connections, setConnections] = useState(0)

    const [isDeletable, setIsDeletable] = useState(false)
    const [selectedNeed, setSelectedNeed] = useState()
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [showNeedActions, setShowNeedActions] = useState(true)

    const dispatch = useDispatch()

    const userId = props.navigation.getParam('userId')
    const user = useSelector(state => state.auth.selectedUser)
    const authUser = useSelector(state => state.auth)
    const authId = useSelector(state => state.auth.userId)
    const authName = useSelector(state => state.auth.credentials.displayName)
    const userPosts = useSelector(state => state.posts.allNeeds.filter(need => need.uid === userId))
    const pendingConnections = useSelector(state => state.auth.pendingConnections)
    // console.log(pendingConnections)
    const loadUser = useCallback(async () => {
        setError(null)
        setIsRefreshing(true)
        try {
            await dispatch(getUser(userId))
            dispatch(fetchNeeds())
            dispatch(setLikes())
        } catch (err) {
            console.log(err)
            setError(err.message)
        }
        setIsRefreshing(false)
    }, [dispatch, setIsLoading, setError])
    
    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus', loadUser
        )
        return () => {
            willFocusSub
        }
    }, [dispatch, loadUser])

    
    useEffect(() => {
        setIsLoading(true)
        loadUser().then(() => {
            setIsLoading(false)
        })
        const connectionsSnapshot = db.doc(`/users/${userId}`).onSnapshot(snapshot => {
            const currentConnections = snapshot.data().connections
            setConnections(currentConnections)
        })

        const acceptButton = db.doc(`/users/${authUser.userId}`).onSnapshot(snapshot => {
            const authPendings = snapshot.data().pendingConnections
            if (authPendings.indexOf(userId) > -1) {
                setAccept(true)
            } else {
                setAccept(false)
            }
        })
        const requestedButton = db.doc(`/users/${userId}`).onSnapshot(snapshot => {
            const selectedUserPendings = snapshot.data().pendingConnections
            if(selectedUserPendings.indexOf(authUser.userId) > -1) {
                // setConnectButton(false)
                setRequested(true)
            } else {
                setRequested(false)
            }
        })
        const connectedButton = authUser.userId < userId ? db.doc(`/connections/${authUser.userId+userId}`)
                                                            .onSnapshot(snapshot => {
                                                                if (snapshot.exists) {
                                                                    setConnected(true)
                                                                    setAccept(false)
                                                                    setRequested(false)
                                                                } else {
                                                                    setConnected(false)
                                                                }
                                                            })
                                                        : db.doc(`/connections/${userId+authUser.userId}`)
                                                            .onSnapshot(snapshot => {
                                                                if (snapshot.exists) {
                                                                    setConnected(true)
                                                                    setAccept(false)
                                                                    setRequested(false)
                                                                } else {
                                                                    setConnected(false)
                                                                }
                                                            })
        
        connectionsSnapshot
        acceptButton
        connectedButton
        requestedButton

        return () => {
            loadUser
        }
    }, [dispatch, loadUser])
    
    

    const disconnectHandler = (authId, selectedUserId) => {
        Alert.alert('Disconnect', 'Are you sure you want to disconnect from ' + user.credentials.displayName + '?', [
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

    const handleOpenLink = (link) => {
        Linking.openURL(link)
    }


    if (error) {
        return (
            <View style={styles.spinner}>
                <Text>An error occured</Text>
                <Button title='try again' onPress={() => {}} color={Colors.primary}/>
            </View>
        )
    }
    if (isLoading) {
        return (
            <View style={styles.spinner}>
                <ActivityIndicator 
                    size='large'
                    color={Colors.primary}
                />
            </View>
        )
    }


    let websiteIcon
    if (user) {    
        websiteIcon =   <View>
                            {user.credentials.website.includes('linkedin.com') && (
                                <TouchableCmp onPress={() => handleOpenLink(user.credentials.website)} style={{}}>
                                    <MaterialCommunityIcons 
                                        name='linkedin-box' 
                                        size={24}
                                        color='#2867B2'
                                    />
                                </TouchableCmp>
                            )}
                            {user.credentials.website.includes('instagram.com') && (
                                <TouchableCmp onPress={() => handleOpenLink(user.credentials.website)} style={{}}>
                                    <MaterialCommunityIcons 
                                        name='instagram' 
                                        size={24}
                                        color='#C13584'
                                    />
                                </TouchableCmp>
                            )}
                        </View>
    }


    const EditProfileButton = () => (
        <TouchableCmp onPress={() => {props.navigation.navigate('EditProfile')}} style={{...styles.editProfileButton, ...{borderColor: Colors.green}}}>
            <View key={userId}>
                <Text style={{color:Colors.green, fontSize:12, alignSelf:'center'}}>Edit Profile</Text>
            </View>
        </TouchableCmp>
    )

    const selectUserHandler = (userId, userName) => {
        if (userId !== user.credentials.userId) {
            props.navigation.push(
                'UserProfile', {
                    userId: userId,
                    name: userName,
                    from: 'UserProfileScreen'
                }
            )
        }
    }

    const deleteHandler = (needId) => {
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

    const commentButtonHandler = (needId, userName) => {
        dispatch(getNeed(needId))
        props.navigation.navigate({
            routeName: 'Comment',
            params: {
                needId: needId,
                userName: userName
            }
        })
    }

    const renderItem = ({item}) => (
        <TouchableCmp onPress={() => {
            props.navigation.push(
                'PostDetail', {
                    needId: item.id,
                    from: 'UserProfileScreen'
                }
            )
        }} useForeground>
            <NeedPost 
                item={item} 
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
        </TouchableCmp>
    )

    return (
        <SafeAreaView style={styles.screen}>
            {user && (
            <View style={styles.screen}>
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={userPosts}
                    onRefresh={loadUser}
                    refreshing={isRefreshing}
                    style={styles.feed}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={{flex:1, justifyContent:'center', alignItems:'center', paddingTop: 10}}>
                            <Text style={{color:Colors.placeholder}}>{user.credentials.displayName} hasn't posted any needs.</Text>
                        </View>
                    )}
                    renderItem={renderItem}
                    ListHeaderComponent={() => (
                        <View style={{borderBottomColor:'#C3C5CD', borderBottomWidth:1, paddingVertical:5}}>
                            <View style={{paddingHorizontal:20, alignItems:'flex-start', flexDirection:'row'}}>
                                
                                <View style={{flexDirection:'column', width:'40%'}}>
                                    <TouchableWithoutFeedback onPress={() => {
                                        props.navigation.navigate({
                                            routeName: 'UserProfilePicture',
                                            params: {
                                                profilePic: user.credentials.imageUrl,
                                                userId: userId
                                            } 
                                        })
                                    }}>
                                        <View style={styles.avatarContainer}>
                                            <Lightbox
                                                // backgroundColor='rgba(0, 0, 0, 0.8)'
                                                backgroundColor={scheme==='dark' ? Colors.darkHeader : Colors.lightHeader}
                                                underlayColor='rgba(255, 255, 255, 0.1)'
                                                springConfig={{tension: 15, friction: 7}}
                                                // activeProps={{
                                                //     style: {
                                                //         width: Dimensions.get('window').width, 
                                                //         height: Dimensions.get('window').height,
                                                //         borderRadius: 20
                                                //     },
                                                //     resizeMode: 'contain'
                                                // }}
                                                renderHeader={(close) => (
                                                    <TouchableCmp 
                                                        onPress={close}
                                                        style={styles.closeButton}
                                                    >
                                                        <Ionicons 
                                                            name='ios-close'
                                                            size={36}
                                                            color={Colors.placeholder}
                                                        />
                                                    </TouchableCmp >
                                                )}
                                                renderContent={() => (
                                                    <Image 
                                                        source={{uri: user.credentials.imageUrl}}
                                                        style={{
                                                            alignSelf: 'center',
                                                            width: SCREEN_WIDTH - 20, 
                                                            height: SCREEN_WIDTH - 20,
                                                            borderRadius: (SCREEN_WIDTH - 20) /2,
                                                        }}
                                                    />
                                                )}
                                            >
                                                <Image style={styles.avatar} source={{uri: user.credentials.imageUrl}}/>
                                            </Lightbox>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <Text style={{...styles.name, ...{color:text}}}>{user.credentials.displayName}</Text>
                                    <Text style={styles.infoTitle}>{user.credentials.headline}</Text>
                                    {userId !== authUser.userId ? (
                                        <View>
                                            {websiteIcon}
                                            <View>
                                                {accept && (
                                                    <TouchableCmp 
                                                        onPress={() => {
                                                            dispatch(confirmConnect(authUser.userId, authName, userId, user.credentials.displayName))
                                                            setAccept(false)
                                                        }} 
                                                        style={{...styles.connectButton, ...{borderColor: Colors.green}}}>
                                                        <Text style={{color:Colors.green, fontSize:14, alignSelf:'center'}}>Accept</Text>
                                                    </TouchableCmp>
                                                )}
                                                {requested && (
                                                    <TouchableCmp onPress={() => {unrequestHandler(authUser.userId, userId)}} style={{...styles.connectButton, ...{borderColor: Colors.disabled}}}>
                                                        <Text style={{color:Colors.disabled, fontSize:14, alignSelf:'center'}}>Requested</Text>
                                                    </TouchableCmp>
                                                )}
                                                {/* {user.pendingConnections.indexOf(authUser.userId) === -1 && !accept && ( */}
                                                {!connected && !requested && !accept && ( 
                                                    <TouchableCmp 
                                                        style={{...styles.connectButton, ...{borderColor: Colors.bluesea}}}
                                                        onPress={() => {
                                                            dispatch(connectReq(authUser.userId, authName, userId))
                                                            setRequested(true)
                                                        }} 
                                                    >
                                                        <Text style={{color:Colors.bluesea, fontSize:14, alignSelf:'center'}}>Connect</Text>
                                                    </TouchableCmp>
                                                )}
                                                {connected && (
                                                    <TouchableCmp onPress={() => {disconnectHandler(authUser.userId, userId)}} style={{...styles.connectButton, ...{borderColor: Colors.primary}}}>
                                                        <Text style={{color:Colors.primary, fontSize:14, alignSelf:'center'}}>Connected</Text>
                                                    </TouchableCmp>
                                                )}
                                                <View>
                                                    <TouchableCmp
                                                        onPress={() => {
                                                            props.navigation.navigate({
                                                                routeName: 'ChatScreen',
                                                                params: {
                                                                    selectedUserId: userId,
                                                                    userName: user.credentials.displayName,
                                                                    userImage: user.credentials.imageUrl
                                                                }
                                                            }
                                                        )}}
                                                        style={{...styles.connectButton, ...{borderColor: Colors.blue}}}
                                                    >
                                                        <Text style={{color:Colors.blue, fontSize:14, alignSelf:'center'}}>Message</Text>
                                                    </TouchableCmp>
                                                </View>
                                            </View>
                                        </View>
                                    ) : (
                                        websiteIcon
                                    )}
                                </View>

                                <View style={{width:'60%', alignSelf:'flex-start', flex: 1}}>
                                    {authUser.userId === userId && <EditProfileButton key={userId}/>}
                                    <View style={{flex: 3}}>
                                        <Text style={styles.infoTitle}>Bio</Text>
                                        <Text style={{color:text}}>{user.credentials.bio}</Text>
                                    </View>
                                    <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', }}>
                                        <View style={{alignItems:'center'}}>
                                            <Text style={styles.infoValue}>{userPosts.length}</Text>
                                            <Text style={styles.infoTitle}>{userPosts.length === 1 ? 'Need' : 'Needs'}</Text>
                                        </View>
                                        <View style={{alignItems:'center'}}>
                                            <TouchableCmp
                                                style={{alignItems:'center'}} 
                                                onPress={() => {
                                                    props.navigation.push(
                                                        'Connections', {
                                                            userId: userId,
                                                            userName: user.credentials.displayName
                                                        }
                                                    )
                                                }}
                                            >
                                                <Text style={styles.infoValue}>{connections}</Text>
                                                <Text style={styles.infoTitle}>{connections === 1 ? 'Connection' : 'Connections'}</Text>
                                            </TouchableCmp>
                                        </View>
                                        <View style={{alignItems:'center'}}>
                                            <Text style={styles.infoValue}>{user.credentials.location}</Text>
                                            <Text style={styles.infoTitle}>Location</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            
                        </View>
                    )}
                />
            </View>
            )}
        </SafeAreaView>
    )
}

UserProfileScreen.navigationOptions = (navData) => {
    const background = navData.screenProps.theme
    const userId = navData.navigation.getParam('userId')
    const uid = firebase.auth().currentUser.uid
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
        headerTitle: navData.navigation.getParam('name'),
        headerRight: () => (
            <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item
                    title='More'
                    iconName={uid === userId ? (Platform.OS==='android' ? 'md-settings' : 'ios-settings') : Platform.OS==='android' ? 'md-more' : 'ios-more'}
                    onPress={() => {uid === userId ? navData.navigation.navigate('Settings') : {}}}
                />
            </HeaderButtons>
        ),
        headerStyle: {
            backgroundColor: background === 'dark' ? 'black' : 'white',
            borderBottomColor: Colors.primary
        },
    }
}



const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    spinner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
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
        fontWeight: '500'
    },
    editProfileButton: {
        justifyContent: 'center',
        padding: 4,
        borderWidth: 1,
        borderRadius: 50
    },
    avatarContainer: {
        shadowColor: '#151734',
        shadowRadius: 30,
        shadowOpacity: 0.2,
        elevation: 10
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 68
    },
    name: {
        marginTop: 6,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'open-sans-bold'
    },
    connectButton: {
        height: 24,
        width: '75%',
        marginVertical: 5,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 50
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 32,
        marginVertical: 24
    },
    info: {
        flex: 1,
        alignItems: 'center',
    },
    infoValue: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '500'
    },
    infoTitle: {
        color: '#C3C5CD',
        fontSize: 11,
        fontWeight: '500',
        marginTop: 4
    },
    feed: {
        // flexGrow: 1
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
    postAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 16
    },
    postName: {
        fontSize: 15,
        fontWeight: '500',
        color: "#454D65",
    },
    postTimestamp: {
        fontSize: 11,
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


export default UserProfileScreen