import React, { useEffect, useCallback, useState } from 'react'
import { 
    Platform,
    SafeAreaView,
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
import Clipboard from '@react-native-community/clipboard'
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
    
    let connectNotifications = useSelector(state => state.auth.notifications.filter(notification => (notification.type === 'connection request')))
    connectNotifications = connectNotifications.sort((a,b) => a.timestamp > b.timestamp ? -1 : 1)


    
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
    }, [dispatch, readNotifications])
    

    const navToUserProfile = (id, name) => {
        props.navigation.navigate({
            routeName: 'UserProfile',
            params: {
                userId: id,
                name: name,
                from: 'ConnectRequestsScreen'
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
        <TouchableCmp onPress={() => {navToUserProfile(item.senderId, item.senderName)}}>
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
        <SafeAreaView style={{...styles.screen, ...{backgroundColor: ''}}}>
            {connectNotifications && connectNotifications.length > 0 && (
                <FlatList
                    style={styles.requests}
                    keyExtractor={(item,index) => index.toString()}
                    data={connectNotifications}
                    renderItem={renderItem}
                />
            )}
        </SafeAreaView>
    )
}


ConnectRequestsScreen.navigationOptions = (navData) => {
    const background = navData.screenProps.theme
    const isFocused = navData.navigation.isFocused()
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
        headerTitle: 'Connect Requests',
        headerStyle: {
            backgroundColor: background === 'dark' ? 'black' : 'white',
            borderBottomColor: Colors.primary
        },
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
        paddingVertical: 12,
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