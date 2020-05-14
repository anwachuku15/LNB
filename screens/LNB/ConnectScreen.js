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
import {  markConnectNotificationsAsRead } from '../../redux/actions/authActions'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import MessageIcon from '../../components/LNB/MessageIcon'
import { FontAwesome } from '@expo/vector-icons'
import firebase from 'firebase'
import moment from 'moment'


let themeColor
let text
const ConnectScreen = props => {
    const scheme = useColorScheme()
    const [search, setSearch] = useState('')
    const dispatch = useDispatch()
    const pendingConnections = useSelector(state => state.auth.pendingConnections)
    let notifications = useSelector(state => state.auth.connectNotifications.filter(notification => notification.type === 'connection request'))
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
        <TouchableCmp onPress={async () => {
            // await dispatch(getUser(item.senderId))
        }}>
            <ListItem
                containerStyle={{backgroundColor:background, paddingLeft: 0}}
                title={
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
                                    LayoutAnimation.configureNext(CustomLayout)
                                }}
                            >
                                <Text style={styles.declineButtonText}>Decline</Text>
                            </TouchableCmp>
                        </View>
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
        
            <View style={{...styles.screen, ...{backgroundColor: 'lightgray'}}}>
                <View style={{...styles.header, ...{backgroundColor: themeColor}}}>
                    <HeaderButtons HeaderButtonComponent={HeaderButton}>
                        <Item
                            title='Direct'
                            iconName={Platform.OS==='android' ? 'md-menu' : 'ios-menu'}
                            onPress={() => {props.navigation.toggleDrawer()}}
                        />
                    </HeaderButtons>
                    <Text style={styles.headerTitle}>Connect</Text>
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
                <DismissKeyboard>
                    <View>
                        <TextInput
                            onChangeText={updateSearch}
                            value={search}
                            placeholder='Search'
                        />
                        {notifications && notifications.length > 0 && (
                            <FlatList
                                style={styles.requests}
                                keyExtractor={(item,index) => index.toString()}
                                data={notifications}
                                renderItem={renderItem}
                            />
                        )}
                    </View>
                </DismissKeyboard>
            </View>
        
    )
}


ConnectScreen.navigationOptions = (navData) => {
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
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500'
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
export default ConnectScreen