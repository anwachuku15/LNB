import React, {useCallback, useState, useEffect} from 'react'
import { 
    Platform,
    Animated,
    SafeAreaView,
    View, 
    Text, 
    StyleSheet, 
    Image, 
    Button, 
    ScrollView,
    TouchableNativeFeedback,
    TouchableOpacity,
    FlatList
} from 'react-native'
import { ListItem } from 'react-native-elements'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import { getUser, markNotificationsAsRead, confirmConnect, declineConnect} from '../../redux/actions/authActions'

import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import MessageIcon from '../../components/LNB/MessageIcon'
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons'
import firebase from 'firebase'
import moment from 'moment'
import { LayoutAnimation } from 'react-native'
import MenuAvatar from '../../components/LNB/MenuAvatar'

const db = firebase.firestore()

let themeColor
let text
const NotificationsScreen = props => {

    const colorScheme = useColorScheme()
    let text
    let background
    if (colorScheme === 'dark') {
        themeColor = 'black'
        text = 'white'
        background = 'black'
    } else {
        themeColor = 'white'
        text = 'black'
        background = 'white'
    }

    const dispatch = useDispatch()

    const auth = useSelector(state => state.auth)
    const uid = useSelector(state => state.auth.userId)
    const authUser = useSelector(state => state.auth.credentials)
    
    // GET NOTIFICATIONS FROM STATE
    let notifications = useSelector(state => state.auth.notifications.sort((a,b) => a.timestamp > b.timestamp ? -1 : 1))
    const connectReqs = useSelector(state => state.auth.notifications.filter(notification => notification.type === 'connection request'))
    const connectReqIds = []
    connectReqs.forEach(req => {
        connectReqIds.push(req.senderId)
    })

    const [isAccepted, setIsAccepted] = useState(false)
    const [isDeclined, setIsDeclined] = useState(false)

    const loadNotifications = useCallback(async () => {
        try {
            await dispatch(markNotificationsAsRead())
            console.log(connectReqs)
        } catch (err) {
            console.log(err)
        }
    }, [dispatch])
    

    useEffect(() => {
        const willFocusSub = props.navigation.addListener('willFocus', loadNotifications)
        return () => {
            willFocusSub
        }
    }, [loadNotifications])



    // UNMOUNT
    useEffect(() => {
        loadNotifications()
    }, [dispatch, loadNotifications])

    const navToUserProfile = (id) => {
        props.navigation.navigate({
            routeName: 'UserProfile',
            params: {
                userId: id,

            }
        })
    }

    const navToNeed = (id, senderName) => {
        props.navigation.navigate({
            routeName: 'PostDetail',
            params: {
                needId: id,
                senderName
            }
        })
    }

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }

    const CustomLayout = {
        duration: 300,
        delete: {
            type: LayoutAnimation.Types.easeOut,
            property: LayoutAnimation.Properties.opacity
        }
    }
    
    const renderItem = ({item}) => (
        // <Animated.View>
            <TouchableCmp onPress={() => {
                item.type === 'new connection' && (navToUserProfile(item.senderId))
                item.type === 'likeNeed' && (navToNeed(item.needId, item.senderName))
                item.type === 'commentNeed' && (navToNeed(item.needId, item.senderName))
            }}>
                <ListItem
                    containerStyle={{backgroundColor:background, paddingLeft: 0}}
                    title={
                        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                            {item.type === 'new connection' && (
                                <View style={{flexDirection:'row', width: '90%'}} >
                                    <View style={{width: '20%', alignItems:'center', justifyContent:'center'}}>
                                        <Ionicons
                                            name='md-person-add' 
                                            size={23} 
                                            color={Colors.blue}
                                        />
                                    </View>
                                    <View style={{width: '80%'}}>
                                        <TouchableCmp 
                                            style={{alignSelf:'flex-start'}}
                                            onPress={() => {navToUserProfile(item.senderId)}}
                                        >
                                            <Image 
                                                source={{uri: item.senderImage}}
                                                style={styles.avatar}
                                            />
                                        </TouchableCmp>
                                        <Text style={{color:text, marginTop: 3}}>
                                            You are now connected with <Text style={{fontWeight:'500', color:Colors.primary}}>{item.senderName}.</Text>
                                        </Text>
                                    </View>
                                </View>
                            )}
                            {item.type === 'likeNeed' && (
                                <View style={{flexDirection:'row', width: '90%'}} >
                                    <View style={{width: '20%', alignItems:'center', justifyContent:'center'}}>
                                        <MaterialCommunityIcons
                                            name='thumb-up-outline' 
                                            size={23} 
                                            color={Colors.pink}
                                        />
                                    </View>
                                    <View style={{width: '80%'}}>
                                        <TouchableCmp 
                                            style={{alignSelf:'flex-start'}}
                                            onPress={() => {navToUserProfile(item.senderId)}}
                                        >
                                            <Image 
                                                source={{uri: item.senderImage}}
                                                style={styles.avatar}
                                            />
                                        </TouchableCmp>
                                        <Text style={{color:text, marginTop: 3}}>
                                            <Text style={{fontWeight:'500'}}>{item.senderName} </Text>
                                            liked one of your needs.
                                        </Text>
                                    </View>
                                </View>
                            )}
                            {item.type === 'commentNeed' && (
                                <View style={{flexDirection:'row', width:'90%'}}>
                                    <View style={{width:'20%', alignItems:'center', justifyContent:'center'}}>
                                        <MaterialCommunityIcons
                                            name='comment-text-outline'
                                            size={23}
                                            color={Colors.green}
                                        />
                                    </View>
                                    <View style={{width: '80%'}}>
                                        <TouchableCmp
                                            style={{alignSelf:'flex-start'}}
                                            onPress={() => {navToUserProfile(item.senderId)}}
                                        >
                                            <Image
                                                source={{uri: item.senderImage}}
                                                style={styles.avatar}
                                            />
                                        </TouchableCmp>
                                        <Text style={{color:text, marginTop: 3}}>
                                            <Text style={{fontWeight:'500'}}>{item.senderName} </Text>
                                            commented on one of your needs.
                                        </Text>
                                    </View>
                                </View>
                            )}
                            <Text style={{width: '10%', textAlign:'center', color:Colors.disabled, fontSize: 14}}>{moment.utc(new Date(item.timestamp)).fromNow()}</Text>
                        </View>
                    }
                    // subtitle='Content of what was liked or commented'
                    // leftAvatar=
                    bottomDivider
                />
            </TouchableCmp>
        // </View>
    )

    return (
        
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <MenuAvatar 
                    toggleDrawer={() => props.navigation.toggleDrawer()}
                />
                <Text style={styles.headerTitle}>Notifications</Text>
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
            
            {notifications && notifications.length > 0 ? (
                <FlatList
                    keyExtractor={(item,index) => index.toString()}
                    data={notifications}
                    renderItem={renderItem}
                />
            ) : (
                <View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
                    <Text style={{color:text}}>No Notifications</Text>
                </View>
                )}
            
        </SafeAreaView>

            
    )
}


NotificationsScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Notifications'
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingVertical: 10.6,
        backgroundColor: themeColor,
        borderBottomColor: Colors.primary,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    header2: {
        // borderBottomWidth: 0.5,
        // shadowColor: Colors.primary,
        // shadowOffset: {height: 5},
        // shadowRadius: 15,
        // shadowOpacity: 0.26,
        // zIndex: 10
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
    connectReqText: {
        fontWeight: '500',
        color:Colors.primary, 
        marginTop: 3,
        fontSize: 14
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16
    },
    viewProfileButton: {
        width: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        borderColor: Colors.blue,
        borderWidth: 1,
        borderRadius: 50,
        padding: 5,
        marginTop: 5
    },
    acceptButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        height: 24,
        borderColor: Colors.green,
        borderWidth: 1,
        borderRadius: 50,
    },
    acceptButtonText: {
        fontSize: 12,
        color: Colors.green
    },
    declineButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        height: 24,
        borderColor: Colors.raspberry,
        borderWidth: 1,
        borderRadius: 50
    },
    declineButtonText: {
        fontSize: 12,
        color: Colors.raspberry
    },
})
export default NotificationsScreen