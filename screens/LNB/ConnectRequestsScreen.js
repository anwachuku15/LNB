import React, { useEffect, useCallback, useState } from 'react'
import { 
    Platform,
    TouchableOpacity,
    TouchableNativeFeedback,
    View, 
    Text, 
    StyleSheet, 
    Image, 
    Button, 
    ScrollView,
    FlatList,
    LayoutAnimation,
    TouchableWithoutFeedback,
    Keyboard,
    TextInput
} from 'react-native'
import { ListItem } from 'react-native-elements'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import {  markConnectNotificationsAsRead, confirmConnect, declineConnect } from '../../redux/actions/authActions'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import Placeholder from '../../components/UI/HeaderButtonPlaceholder'
import MessageIcon from '../../components/LNB/MessageIcon'
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons'
import firebase from 'firebase'
import moment from 'moment'


let themeColor
let text
const ConnectRequestsScreen = props => {
    const scheme = useColorScheme()
    const [query, setQuery] = useState('')
    const dispatch = useDispatch()

    const auth = useSelector(state => state.auth)
    const uid = useSelector(state => state.auth.userId)

    const pendingConnections = useSelector(state => state.auth.pendingConnections)
    let notifications = useSelector(state => state.auth.connectNotifications.filter(notification => (notification.type === 'connection request' || notification.type === 'new connection')))
    notifications = notifications.sort((a,b) => a.timestamp > b.timestamp ? -1 : 1)
    


    
    const readNotifications = useCallback(async () => {
        try {
            await dispatch(markConnectNotificationsAsRead())
        } catch (err) {
            console.log(err)
        }
    }, [dispatch])
    
    useEffect(() => {
        const willFocusSub = props.navigation.addListener('willFocus', readNotifications)
        return () => {
            willFocusSub
        }
    }, [readNotifications])
    
    useEffect(() => {
        readNotifications()
        console.log(notifications)
    }, [dispatch, readNotifications])
    

    const navToUserProfile = (id) => {
        props.navigation.navigate({
            routeName: 'UserProfile',
            params: {
                userId: id,
            }
        })
    }

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


    const CustomLayout = {
        duration: 300,
        delete: {
            type: LayoutAnimation.Types.easeOut,
            property: LayoutAnimation.Properties.opacity
        }
    }

    const updateSearch = (text) => {
        setSearch(text)
    }

    const DismissKeyboard = ({ children }) => (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            {children}
        </TouchableWithoutFeedback>
    )
    
    const renderItem = ({item}) => (
        <TouchableCmp onPress={() => {navToUserProfile(item.senderId)}}>
            <ListItem
                containerStyle={{backgroundColor:background, paddingLeft: 0}}
                title={
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        {item.type === 'connection request' && (
                            <View style={{flexDirection:'row', width: '90%'}} >
                                <View style={{width: '20%', alignItems:'center', justifyContent:'center'}}>
                                    <FontAwesome
                                        name='handshake-o' 
                                        size={23} 
                                        color={Colors.blue}
                                    />
                                </View>
                                <View style={{width: '50%'}}> 
                                    <View style={{}}>  
                                        <Image 
                                            source={{uri: item.senderImage}}
                                            style={styles.avatar}
                                        />
                                        <Text style={styles.connectReqText}>
                                            {item.senderName}
                                        </Text>
                                        <Text style={{color:Colors.disabled}}>
                                            {item.senderHeadline}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'column', width: '30%', justifyContent: 'space-between', paddingVertical:12}}>
                                    <TouchableCmp 
                                        style={styles.acceptButton} 
                                        onPress={() => {
                                            dispatch(confirmConnect(uid, auth.credentials.displayName, item.senderId, item.senderName))
                                        }}
                                    >
                                        <Text style={styles.acceptButtonText}>Accept</Text>
                                    </TouchableCmp>
                                    <TouchableCmp 
                                        style={styles.declineButton}
                                        onPress={() => {
                                            dispatch(declineConnect(uid, item.senderId, item.senderName))
                                            // LayoutAnimation.configureNext(CustomLayout)
                                        }}
                                    >
                                        <Text style={styles.declineButtonText}>Decline</Text>
                                    </TouchableCmp>
                                </View>
                            </View>
                        )}
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
                                        <Text style={{fontWeight:'500', color:Colors.primary}}>{item.senderName} </Text>
                                        accepted your connect request.
                                    </Text>
                                </View>
                            </View>
                        )}
                        <Text style={{width: '10%',color:Colors.disabled, fontSize: 14, }}>{moment.utc(new Date(item.timestamp)).fromNow()}</Text>
                    </View>
                }
                bottomDivider
            />
        </TouchableCmp>
    )

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }
    return (
        <View style={{...styles.screen, ...{backgroundColor: ''}}}>
            <View style={{...styles.header, ...{backgroundColor: themeColor}}}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Back'
                        iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        onPress={() => {props.navigation.goBack()}}
                    />
                </HeaderButtons>
                <Text style={styles.headerTitle}>Requests</Text>
                <HeaderButtons HeaderButtonComponent={Placeholder}>
                    <Item
                        title='More'
                        iconName='md-more'
                    />
                </HeaderButtons>
            </View>
            {notifications && notifications.length > 0 && (
                <FlatList
                    style={styles.requests}
                    keyExtractor={(item,index) => index.toString()}
                    data={notifications}
                    renderItem={renderItem}
                />
            )}
        </View>
    )
}


ConnectRequestsScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Needs'
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
        paddingTop: 49,
        paddingBottom: 16,
        borderBottomColor: Colors.primary,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500'
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
    requestsContainer: {
        height: 40,
        borderColor: Colors.blue,
        borderWidth: StyleSheet.hairlineWidth,
        flexDirection:'row', 
        paddingHorizontal:20, 
        alignItems:'center', 
        justifyContent:'space-between'
    },
    requestCountContainer: {
        justifyContent:'center',
        alignItems: 'center',
        paddingHorizontal: 5,
        marginLeft: 10,
        backgroundColor: Colors.blue,
        minWidth: 20,
        height: 20,
        borderRadius: 10
    },
    requestCount: {
        color:'white',
        fontSize: 14
    },
    requests: {
        marginVertical: 3,
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
export default ConnectRequestsScreen