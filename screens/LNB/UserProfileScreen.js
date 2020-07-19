import React, { useEffect, useLayoutEffect, useState, useCallback, useMemo } from 'react'
import { 
    AppState,
    Platform,
    SafeAreaView,
    TouchableOpacity,
    View, 
    Text, 
    StyleSheet, 
    Image, 
    ImageBackground,
    Button, 
    ScrollView,
    FlatList,
    ActivityIndicator,
    Alert,
    TouchableWithoutFeedback,
    Animated,
    Dimensions,
    MaskedViewIOS,
    NavigatorIOS as Navigator,
} from 'react-native'
// import { SharedElement, SharedElementTransition, nodeFromRef } from 'react-native-shared-element'
import { SharedElement } from 'react-navigation-shared-element';
import { Badge, } from 'react-native-elements'
import CustomModal from 'react-native-modal'
import Clipboard from '@react-native-community/clipboard'
import { withNavigationFocus } from 'react-navigation'
import { LinearGradient } from 'expo-linear-gradient'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import { pinNeed, unpinNeed } from '../../redux/actions/authActions'
import { logout, getUser, connectReq, unrequest, disconnect, confirmConnect, declineConnect } from '../../redux/actions/authActions'
import { fetchNeeds, getNeed, deleteNeed } from '../../redux/actions/postsActions'

import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { Ionicons, MaterialIcons, AntDesign, FontAwesome, SimpleLineIcons, MaterialCommunityIcons, Entypo, } from '@expo/vector-icons'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import TouchableCmp from '../../components/LNB/TouchableCmp'
import BioModal from '../../components/LNB/BioModal'
import * as firebase from 'firebase'
import moment from 'moment'
import * as Linking from 'expo-linking'
import Lightbox from 'react-native-lightbox'
import Hyperlink from 'react-native-hyperlink'
import PinnedNeed from '../../components/LNB/PinnedNeed'

import NeedPost from '../../components/LNB/NeedPost'
import UserProfilePictureModal from '../../components/LNB/UserProfilePictureModal';

const db = firebase.firestore()

let SCREEN_WIDTH = Dimensions.get('window').width
let SCREEN_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 10

let themeColor
let text, pinnedMargin

// TODO: MEMOIZE IMAGES for create/delete post state updates
const UserProfileScreen = props => {
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
        pinnedMargin = '#1B1B1B'
    } 
    if (scheme === 'light') {
        themeColor = 'white'
        text = 'black'
        pinnedMargin = Colors.lightHeader
    }

    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState()

    const [isMounted, setIsMounted] = useState(true)
    
    const [connect, setConnect] = useState(false)
    const [accept, setAccept] = useState(false)
    const [requested, setRequested] = useState(false)
    const [connected, setConnected] = useState(false)
    const [connections, setConnections] = useState(0)

    const [isDeletable, setIsDeletable] = useState(false)
    const [selectedNeed, setSelectedNeed] = useState()
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [showNeedActions, setShowNeedActions] = useState(true)
    const [isBioVisible, setIsBioVisible] = useState(false)

    const dispatch = useDispatch()

    const userId = props.navigation.getParam('userId')
    const user = useSelector(state => state.auth.allUsers.find(user => user.userId === userId))
    // const user = useSelector(state => state.auth.selectedUser)
    const authUser = useSelector(state => state.auth)
    const authId = useSelector(state => state.auth.userId)
    const authName = useSelector(state => state.auth.credentials.displayName)
    const userPosts = useSelector(state => state.posts.allNeeds.filter(need => need.uid === userId))
    const pinned = userPosts.find(post => post.isPinned === true)

    const userConnections = useSelector(state => state.auth.userConnections)
    const userConnectionIds = useSelector(state => state.auth.userConnectionIds)
    const outgoingRequests = useSelector(state => state.auth.outgoingRequests)
    const incomingRequests = useSelector(state => state.auth.pendingConnections)

    const [pinnedNeed, setPinnedNeed] = useState(pinned)
    const screen = 'UserProfile'

    const pendingConnections = useSelector(state => state.auth.pendingConnections)
    
    const loadUser = useCallback(async () => {
        setError(null)
        setIsRefreshing(true)
        try {
            dispatch(getUser(userId))
        } catch (err) {
            console.log(err)
            setError(err.message)
        }
        setIsRefreshing(false)
    }, [dispatch, setIsLoading, setError])

    const loadNeeds = useCallback(async () => {
        setError(null)
        setIsRefreshing(true)
        try {
            dispatch(fetchNeeds())
        } catch (err) {
            console.log(err)
            setError(err.message)
        }
        setIsRefreshing(false)
    }, [dispatch, setIsRefreshing, setError])

    useEffect(() => {
        const willFocusSub = props.navigation.addListener('willFocus', loadNeeds)

        return () => {
            willFocusSub.remove()
        }
    }, [loadNeeds])


    const navToPostDetail = (needId) => {
        props.navigation.push(
            'PostDetail',
            {
                needId: needId,
                from: 'UserProfile'
            }
        )
    }

    const from = 'UserProfile'

    const memoizedPinnedNeed = useMemo(() => {
        return (
            <PinnedNeed
                navToPostDetail={navToPostDetail}
                pinned={pinned}
                loadUser={loadUser}
                unpinHandler={unpinHandler}
                selectUserHandler={selectUserHandler}
                selectedNeed={selectedNeed}
                setSelectedNeed={setSelectedNeed}
                isModalVisible={isModalVisible}
                setIsModalVisible={setIsModalVisible}
                // deleteHandler={deleteHandler}
                commentButtonHandler={commentButtonHandler}
                showNeedActions={showNeedActions}
            />
        )
    }, [pinned, isRefreshing])
    
    const disconnectHandler = (authId, selectedUserId) => {
        Alert.alert('Disconnect', 'Are you sure you want to disconnect from ' + user.displayName + '?', [
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
                onPress: () => {
                    dispatch(unrequest(authId, selectedUserId))
                }
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



    const selectUserHandler = (userId, userName) => {
        if (userId !== user.userId) {
            props.navigation.push('UserProfile', {
                    userId: userId,
                    name: userName,
                    from: 'UserProfileScreen'
                }
            )
        }
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
                    
                    pinNeed(needId, uid)
                    await setPinnedNeed(pinned)
                    setIsModalVisible(!isModalVisible)
                    loadUser().catch(err => console.log(err))
                    // setTimeout(() => {
                        
                    // }, 500) 
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
                        await setPinnedNeed(pinned)
                        setTimeout(() => {
                            loadUser().catch(err => console.log(err))
                        }, 500) 
                    } catch (err) {
                        alert(err)
                        console.log(err)
                    }
                    
                }
            }
        ])
    }

    
    

    const renderItem = ({item}) => (
            <NeedPost 
                item={item} 
                navToPostDetail={navToPostDetail}
                navigation={props.navigation}
                from={from}
                screen={screen}
                pinned={pinned}
                loadUser={loadUser}
                loadNeeds={loadNeeds}
                pinHandler={pinHandler}
                unpinHandler={unpinHandler}
                selectUserHandler={selectUserHandler}
                isDeletable={isDeletable}
                setIsDeletable={setIsDeletable}
                selectedNeed={selectedNeed}
                setSelectedNeed={setSelectedNeed}
                // isModalVisible={isModalVisible}
                // setIsModalVisible={setIsModalVisible}
                // deleteHandler={deleteHandler}
                commentButtonHandler={commentButtonHandler}
                showNeedActions={showNeedActions}
                setShowNeedActions={setShowNeedActions}
            />
    )


    const WebsiteIcon = () => (
        <View>
            {user.website.includes('linkedin.com') && (
                <TouchableCmp onPress={() => handleOpenLink(user.website)} style={{justifyContent: 'center'}}>
                    <MaterialCommunityIcons 
                        name='linkedin-box' 
                        size={24}
                        color='#2867B2'
                    />
                </TouchableCmp>
            )}
            {user.website.includes('instagram.com') && (
                <TouchableCmp onPress={() => handleOpenLink(user.website)} style={{justifyContent: 'center'}}>
                    <MaterialCommunityIcons 
                        name='instagram' 
                        size={24}
                        color='#C13584'
                    />
                </TouchableCmp>
            )}
            {!user.website.includes('linkedin.com') && !user.website.includes('instagram.com') && (
                <TouchableCmp onPress={() => handleOpenLink(user.website)} style={{justifyContent: 'center'}}>
                    <Ionicons 
                        name='md-link' 
                        size={24}
                        color={Colors.blue}
                    />
                </TouchableCmp>
            )}
        </View>
    )
    




    const EditProfileButton = () => (
        <View style={{alignSelf:'center'}}>
            <TouchableCmp 
                onPress={() => {props.navigation.navigate('editProfileModal')}} 
                style={{
                    ...styles.editProfileButton, 
                    marginBottom: 15, 
                    backgroundColor: themeColor, 
                    borderWidth: 0.5, 
                    borderColor: scheme==='dark' ? Colors.placeholder : Colors.disabled}}
            >
                <View key={userId}>
                    <Text style={{color:text, fontSize:12, fontWeight: 'bold', alignSelf:'center'}}>Edit Profile</Text>
                </View>
            </TouchableCmp>
            {((user.headline === '') || (user.location === '') || (user.website === '')) && 
                <Badge 
                    Component={() => (
                        <FontAwesome
                            name='exclamation-circle'
                            size={16}
                            color={Colors.redcrayola}
                        />
                    )}
                    containerStyle={{position: 'absolute', right: 0}}
                />
            }
            {/* {((user.headline === '') || (user.location === '') || (user.website === '')) && 
                <Text style={{color:Colors.redcrayola, alignSelf:'center', fontSize: 12, marginBottom: 15}}>Your profile is incomplete!</Text>
            } */}
        </View>
    )
    
    const toggleBioModal = () => {
        setIsBioVisible(!isBioVisible)
    }

    
    
    const LightboxView = ({navigator}) => (
        <Lightbox
            navigator={navigator}
            backgroundColor={scheme==='dark' ? Colors.darkHeader : Colors.lightHeader}
            underlayColor='rgba(255, 255, 255, 0.1)'
            springConfig={{tension: 10, friction: 7,}}
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
                    source={{uri: user.imageUrl, cache: 'force-cache'}}
                    style={{
                        alignSelf: 'center',
                        width: SCREEN_WIDTH - 20, 
                        height: SCREEN_WIDTH - 20,
                        borderRadius: (SCREEN_WIDTH - 20) /2,
                    }}
                />
            )}
        >
            <Image style={styles.avatar} source={{uri: user.imageUrl, cache: 'force-cache'}}/>
        </Lightbox>
    )


    return (
        // isMounted &&
        <SafeAreaView style={styles.screen}>
            {user.imageUrl && (
                <View style={styles.screen}>

                        
                        <ImageBackground
                            source={{uri: user.imageUrl, cache: 'force-cache'}}
                            style={[
                                StyleSheet.absoluteFill, {
                                    width: SCREEN_WIDTH,
                                    height: SCREEN_HEIGHT * 0.5,
                                    opacity: 0.4,
                                },
                            ]}
                            blurRadius={10}
                        >
                            <LinearGradient 
                                colors={[themeColor, 'transparent', themeColor,]} 
                                style={{position: 'absolute', left: 0, right: 0, top: 0, height: SCREEN_HEIGHT * 0.5}}
                            />
                        </ImageBackground>

                    <FlatList
                        keyExtractor={(item, index) => index.toString()}
                        data={userPosts}
                        onRefresh={loadUser}
                        refreshing={isRefreshing}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View style={{flex:1, justifyContent:'center', alignItems:'center', paddingTop: 10}}>
                                <Text style={{color:Colors.placeholder}}>{user.displayName} hasn't posted any needs.</Text>
                            </View>
                        )}
                        renderItem={renderItem}
                        ListHeaderComponent={() => (
                            <View>
                                {/* #C3C5CD */}
                                <View style={!pinned && {borderBottomColor:Colors.placeholder, borderBottomWidth:StyleSheet.hairlineWidth, paddingVertical:5}}>
                                
                                    <View style={{paddingHorizontal:20, paddingTop: 10, paddingBottom: 0, justifyContent:'center'}}>

                                        {/* AVATAR, HEADER, LOCATION */}
                                        <View style={{alignItems: 'center', marginBottom: 10}}>
                                            {/* <UserProfilePictureModal styles={styles} user={user} navigation={props.navigation} /> */}
                                            <View style={styles.avatarContainer}>
                                                <TouchableWithoutFeedback onPress={() => props.navigation.push('UserProfilePicture', {uri: user.imageUrl, user: user})}>
                                                    <SharedElement id={user.imageUrl}>
                                                        <Image style={styles.avatar} source={{uri: user.imageUrl, cache: 'force-cache'}}/>
                                                    </SharedElement>
                                                </TouchableWithoutFeedback>
                                            </View>
                                            <View style={{flexDirection: 'row', marginTop: 5}}>
                                                <Text style={{...styles.name, ...{color:text}}}>{user.displayName}</Text>
                                                {user.website.length > 3 && (
                                                    <View style={{flexDirection: 'row'}}>
                                                        <Text style={{alignSelf:'center', marginHorizontal: 5, color: Colors.placeholder}}>|</Text>
                                                        <WebsiteIcon />
                                                    </View>
                                                )}
                                            </View>
                                            {/* {authUser.userId === userId && <EditProfileButton key={userId}/>} */}
                                            <Text style={{...styles.infoTitle, marginTop: 5, color: scheme==='dark' ? Colors.disabled : Colors.darkSearch}}>{user.headline}</Text>
                                            {user.location !== '' && <View style={{flexDirection: 'row', justifyContent:'center', alignItems: 'center', marginTop: 5}}>
                                                <Entypo
                                                    name='location-pin'
                                                    size={12}
                                                    color={Colors.redcrayola}
                                                    style={{marginRight: 3, }}
                                                />
                                                <Text style={{...styles.infoTitle, color: scheme==='dark' ? Colors.disabled : Colors.darkSearch}}>{user.location}</Text>
                                            </View>}
                                            
                                            <BioModal user={user} styles={styles} navigation={props.navigation}/>
                                        </View>



                                        {/* STATS */}
                                        <View style={{flex:1, flexDirection:'row', justifyContent:'space-around', marginBottom: 15 }}>
                                            <View style={{alignItems:'center'}}>
                                                <Text style={{...styles.infoValue, color: scheme==='dark' ? Colors.disabled : Colors.darkSearch}}>{userPosts.length}</Text>
                                                <Text style={{...styles.infoTitle, fontWeight: 'bold', color: scheme==='dark' ? Colors.disabled : Colors.darkSearch}}>{userPosts.length === 1 ? 'Post' : 'Posts'}</Text>
                                            </View>
                                            <View style={{alignItems:'center'}}>
                                                <TouchableCmp
                                                    style={{alignItems:'center'}} 
                                                    onPress={() => {
                                                        props.navigation.push(
                                                            'Connections', {
                                                                userId: userId,
                                                                userName: user.displayName
                                                            }
                                                        )
                                                    }}
                                                >
                                                    <Text style={{...styles.infoValue, color: scheme==='dark' ? Colors.disabled : Colors.darkSearch}}>{user.connections}</Text>
                                                    <Text style={{...styles.infoTitle, fontWeight: 'bold', color: scheme==='dark' ? Colors.disabled : Colors.darkSearch}}>{user.connections === 1 ? 'Connection' : 'Connections'}</Text>
                                                </TouchableCmp>
                                            </View>
                                        </View>


                                        {/* BUTTONS */}
                                        {userId !== authUser.userId && (
                                            <View>
                                                <View style={{flexDirection:'row', justifyContent:'space-between', paddingTop: 8, paddingBottom: accept ? 0 : 15}}>
                                                    
                                                    {outgoingRequests.includes(user.userId) && (
                                                        <TouchableCmp onPress={() => {unrequestHandler(authUser.userId, userId)}} style={{...styles.connectButton, borderColor: Colors.placeholder, }}>
                                                            <Text style={{color:Colors.placeholder, fontSize:14, fontWeight:'bold', alignSelf:'center'}}>Requested</Text>
                                                        </TouchableCmp>
                                                    )}
                                                    {/* {user.pendingConnections.indexOf(authUser.userId) === -1 && !accept && ( */}
                                                    {userConnectionIds && outgoingRequests && incomingRequests &&
                                                    !userConnectionIds.includes(user.userId) && 
                                                    !incomingRequests.includes(user.userId) && 
                                                    !outgoingRequests.includes(user.userId) && (
                                                        <TouchableCmp 
                                                            style={{...styles.connectButton,  backgroundColor: Colors.primary, borderColor: Colors.primary}}
                                                            onPress={async () => {
                                                                await dispatch(connectReq(authUser.userId, authName, userId))
                                                                setRequested(true)
                                                            }} 
                                                        >
                                                            <Text style={{color:'white', fontSize:14, fontWeight: 'bold', alignSelf:'center'}}>Connect</Text>
                                                        </TouchableCmp>
                                                    )}
                                                    {userConnectionIds.includes(user.userId) && (
                                                        <TouchableCmp onPress={() => {disconnectHandler(authUser.userId, userId)}} style={{...styles.connectButton, borderColor: Colors.primary, backgroundColor: 'white'}}>
                                                            <Text style={{color:Colors.primary, fontSize:14, fontWeight: 'bold', alignSelf:'center'}}>Connected</Text>
                                                        </TouchableCmp>
                                                    )}

                                                    <TouchableCmp
                                                        onPress={async () => {
                                                            await dispatch(getUser(user.userId))
                                                            props.navigation.push(
                                                                'ChatScreen',
                                                                {
                                                                    selectedUserId: user.userId,
                                                                    userName: user.displayName,
                                                                    userImage: user.imageUrl
                                                                }
                                                            )
                                                        }}
                                                        style={{...styles.messageButton, backgroundColor: Colors.blue, borderColor: Colors.blue}}
                                                    >
                                                        <Text style={{color:'white', fontSize:14, fontWeight: 'bold', alignSelf:'center'}}>Message</Text>
                                                    </TouchableCmp>
                                                </View>
                                                {incomingRequests.includes(user.userId) && (
                                                    // dispatch(declineConnect(authUser.userId, userId, user.displayName))
                                                    // dispatch(confirmConnect(authUser.userId, authName, userId, user.displayName))
                                                    <Text style={{width: '40%', paddingBottom: 15, fontSize: 12, color: scheme==='dark' ? Colors.disabled : Colors.darkSearch}}>
                                                        {user.displayName} has requested to connect with you.
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                        {userId === authUser.userId && (
                                            <EditProfileButton />
                                        )}
                                        

                                    </View>
                                {/* PINNED NEED */}
                                    {pinned && (
                                        <View style={{}}>
                                            <PinnedNeed
                                                navToPostDetail={navToPostDetail}
                                                pinned={pinned}
                                                loadUser={loadUser}
                                                unpinHandler={unpinHandler}
                                                selectUserHandler={selectUserHandler}
                                                selectedNeed={selectedNeed}
                                                setSelectedNeed={setSelectedNeed}
                                                isModalVisible={isModalVisible}
                                                setIsModalVisible={setIsModalVisible}
                                                // deleteHandler={deleteHandler}
                                                commentButtonHandler={commentButtonHandler}
                                                showNeedActions={showNeedActions}
                                            />
                                            <View style={{borderWidth:StyleSheet.hairlineWidth, borderColor: Colors.placeholder, }}></View>
                                            <View style={{
                                                borderBottomWidth: pinned ? 15 : StyleSheet.hairlineWidth, 
                                                borderBottomColor: pinned ? pinnedMargin : Colors.placeholder,
                                            }}></View>
                                            <View style={{borderWidth:StyleSheet.hairlineWidth, borderColor: Colors.placeholder, }}></View>
                                        </View>
                                    )}
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
        },
        // headerTintColor: background === 'dark' ? 'white' : 'black'
        // headerMode: 'screen'
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
    pictureModalView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 22,
        marginBottom: 0,
        // backgroundColor: 'rgba(0,0,0,0.8)'
    },
    pictureModal: {
        width: Dimensions.get('window').width,
        borderRadius: 20,
        paddingBottom: 50,
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    modalView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 22,
        marginBottom: 0,
        // backgroundColor: 'rgba(0,0,0,0.8)'
    },
    modal: {
        width: Dimensions.get('window').width,
        borderRadius: 20,
        paddingBottom: 50,
        paddingHorizontal: 20,
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
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginBottom: 5,
    },
    modalButtonText: {
        // fontWeight: "bold",
        fontSize: 18,
        // textAlign: "center",
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
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
    avatarContainer: {
        shadowColor: '#151734',
        shadowRadius: 30,
        shadowOpacity: 0.2,
        elevation: 10
    },
    avatar: {
        width: 200,
        height: 200,
        borderRadius: 100
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'open-sans-bold'
    },
    editProfileButton: {
        paddingVertical: 10,
        paddingHorizontal: 30,
        width: '40%',
        marginVertical: 5,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 10, 
        alignSelf: 'center'
    },
    bioButton: {
        alignSelf: 'center',
        borderColor: Colors.green,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        width: '30%',
        marginTop: 10,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 10
    },
    connectButton: {
        paddingVertical: 10,
        width: '40%',
        marginVertical: 5,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 10
    },
    respondButton: {
        paddingVertical: 10,
        width: '43%',
        marginVertical: 5,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 10
    },
    messageButton: {
        paddingVertical: 10,
        width: '40%',
        marginVertical: 5,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 10
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
        fontSize: 18,
        fontWeight: 'bold'
    },
    infoTitle: {
        fontSize: 11,
        fontWeight: '500',
        // marginTop: 4
    },
    feed: {
        // flexGrow: 1
        // backgroundColor: 'white'
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