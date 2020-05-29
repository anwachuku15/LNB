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
import { fetchNeeds } from '../../redux/actions/postsActions'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

const db = firebase.firestore()

let SCREEN_WIDTH = Dimensions.get('window').width
let SCREEN_HEIGHT = Dimensions.get('window').height

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

    const [activeButton, setActiveButton] = useState(0)

    const [connect, setConnect] = useState(false)
    const [accept, setAccept] = useState(false)
    const [requested, setRequested] = useState(false)
    const [connected, setConnected] = useState(false)
    const [connections, setConnections] = useState(0)

    const dispatch = useDispatch()

    const userId = props.navigation.getParam('userId')
    const user = useSelector(state => state.auth.selectedUser)
    const authUser = useSelector(state => state.auth)
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
            willFocusSub.remove()
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
        
        connectionsSnapshot()
        acceptButton()
        connectedButton()
        requestedButton()

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
    return (
        <SafeAreaView style={styles.screen}>
            {user && (
            <View>
                <LinearGradient colors={[scheme==='dark' ? 'black' : 'white', Colors.primary]}>
                {/* HEADER */}
                    <View style={styles.header}>
                        <HeaderButtons HeaderButtonComponent={HeaderButton}>
                            <Item
                                title='Back'
                                iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                                onPress={() => {props.navigation.goBack()}}
                            />
                        </HeaderButtons>
                        <Text style={styles.headerTitle}>{user.credentials.displayName}</Text>
                        <HeaderButtons HeaderButtonComponent={HeaderButton}>
                            <Item
                                title='More'
                                iconName={authUser.userId === userId ? (Platform.OS==='android' ? 'md-settings' : 'ios-settings') : Platform.OS==='android' ? 'md-more' : 'ios-more'}
                                onPress={() => {authUser.userId === userId ? props.navigation.navigate('Settings') : {}}}
                            />
                        </HeaderButtons>
                    </View>
                
                {/* PROFILE HEADER */}
                {/* https://youtu.be/S-HVfH7BVIQ?t=2743 */}
                {/* SwipeTab under profile header with options: needs, bio/skillset, third option */}
                    <View style={styles2.imageContainer}>
                        <View>
                            <Image 
                                source={{uri: user.credentials.imageUrl}} 
                                style={{width:120, height:120, borderRadius: 60}}
                            />
                        </View>
                    </View>
                </LinearGradient>


                <View style={{paddingVertical: 10}}>
                    <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                        <TouchableCmp onPress={() => setActiveButton(0)}>
                            <Ionicons
                                name='ios-information-circle-outline'
                                color={activeButton === 0 ? Colors.primary : Colors.disabled}
                                size={24}
                            />
                        </TouchableCmp>
                        <TouchableCmp onPress={() => setActiveButton(1)}>
                            <Ionicons
                                name='ios-information-circle-outline'
                                color={activeButton === 1 ? Colors.primary : Colors.disabled}
                                size={24}
                            />
                        </TouchableCmp>
                        <TouchableCmp onPress={() => setActiveButton(2)}>
                            <Ionicons
                                name='ios-information-circle-outline'
                                color={activeButton === 2 ? Colors.primary : Colors.disabled}
                                size={24}
                            />
                        </TouchableCmp>
                        <TouchableCmp onPress={() => setActiveButton(3)}>
                            <Ionicons
                                name='ios-information-circle-outline'
                                color={activeButton === 3 ? Colors.primary : Colors.disabled}
                                size={24}
                            />
                        </TouchableCmp>
                    </View>
                </View>

                {/* USER NEEDS */}
                {!isLoading && userPosts.length === 0 ? (
                    <View style={{justifyContent:'center', alignItems:'center', paddingTop: 10}}>
                        <Text style={{color:Colors.placeholder}}>{user.credentials.displayName} hasn't posted any needs.</Text>
                    </View>
                ) : (
                    <FlatList
                        keyExtractor={(item, index) => index.toString()}
                        data={userPosts}
                        onRefresh={loadUser}
                        refreshing={isRefreshing}
                        style={styles.feed}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        renderItem={itemData => (
                            <TouchableCmp onPress={props.onSelect} useForeground>
                                <View style={styles.feedItem} key={itemData.item.id}>
                                    <TouchableCmp onPress={() => {}}>
                                        <Image source={{uri: itemData.item.userImage}} style={styles.postAvatar} />
                                    </TouchableCmp>
                                    <View style={{flex: 1}}>
                                        <View style={{flexDirection: 'row', justifyContent:'space-between', alignItems:'center'}}>
                                            <View>
                                                <Text style={styles.postName}>{itemData.item.userName}</Text>
                                                <Text style={styles.postTimestamp}>{moment(itemData.item.timestamp).fromNow()}</Text>
                                            </View>
                                            <Ionicons name='ios-more' size={24} color='#73788B'/>
                                        </View>
                                        <Text style={styles.post}>{itemData.item.body}</Text>
                                        {itemData.item.imageUrl ? (
                                            <Image source={{uri: itemData.item.imageUrl}} style={styles.postImage} resizeMode='cover'/>
                                        ) : (
                                            null
                                        )}
                                        <View style={{paddingTop: 15, width: '75%', flexDirection: 'row', justifyContent:'space-between', alignItems: 'center'}}>
                                            <MaterialCommunityIcons name='thumb-up-outline' size={24} color='#73788B' style={{marginRight: 16}} />
                                            <Ionicons name='ios-chatboxes' size={24} color='#73788B' style={{marginRight: 16}} />
                                        </View>
                                    </View>
                                </View>
                            </TouchableCmp>
                        )}
                    />
                    )}
            </View>
            )}
        </SafeAreaView>

            
    )
}



const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: themeColor,
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
    }
})

const styles2 = StyleSheet.create({
    imageContainer: {
        alignItems: 'center',
        paddingVertical: 40
    },
})

export default UserProfileScreen