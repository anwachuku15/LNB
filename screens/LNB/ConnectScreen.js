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
import MessageIcon from '../../components/LNB/MessageIcon'
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons'
import firebase from 'firebase'
import moment from 'moment'
import algoliasearch from 'algoliasearch/lite'
import { appId, key } from '../../secrets/algolia'
import { set } from 'react-native-reanimated'

const client = algoliasearch(appId, key)
const index = client.initIndex('LNBmembers')

let themeColor
let text
const ConnectScreen = props => {
    const scheme = useColorScheme()
    const [search, setSearch] = useState('')
    const [results, setResults] = useState([])
    const dispatch = useDispatch()

    const auth = useSelector(state => state.auth)
    const uid = useSelector(state => state.auth.userId)
    const authUser = useSelector(state => state.auth.credentials)

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
        const read = readNotifications()
        // console.log(notifications)
        return () => {
            read
        }
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

    let searchResults = []
    const updateSearch = (text) => {
        setSearch(text)
        const query = text
        if (query.trim().length === 0) {setResults([])}
        if (query.trim().length > 0) {
            index.search(query, {
                attributesToRetrieve: ['newData'],
                hitsPerPage: 10
            }).then(({ hits }) => {
                hits.forEach(hit => {
                    searchResults.push(hit.newData)
                })
                setResults(searchResults)
            })
        }
        
    }
    
    const renderItem = ({item}) => (
        <TouchableCmp onPress={() => {navToUserProfile(item.uid)}}>
            <ListItem
                containerStyle={{backgroundColor:background}}
                leftAvatar={{source: {uri: item.imageUrl}}}
                title={
                    <Text style={{color:text, fontSize: 16}}>{item.name}</Text>
                }
                subtitle={
                    <Text style={{color:Colors.disabled}}>
                        {item.headline}{'\n'}<Text style={{fontSize:12}}>{item.location}</Text>
                    </Text>
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
                <View style={{...styles.header, ...{backgroundColor: scheme==='dark' ? 'black' : 'white'}}}>
                    <View>
                        <TouchableCmp onPress={() => props.navigation.toggleDrawer()}>
                            <Image source={{uri: authUser.imageUrl}} style={styles.menuAvatar} />
                        </TouchableCmp>
                    </View>
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
                <View style={{...styles.inputContainer, ...{backgroundColor:background}}}>
                    <TextInput
                        autoFocus={false}
                        multiline={true}
                        numberOfLines={4} 
                        style={{flex:1, fontSize:16, color:text, marginHorizontal:10, alignSelf:'center', paddingVertical:5}}
                        placeholder={'Search...'}
                        placeholderTextColor={'#838383'}
                        onChangeText={text => {updateSearch(text)}}
                        value={search}
                    />
                </View>
                {notifications.length > 0 && (
                    <TouchableCmp
                        onPress={() => {
                            props.navigation.navigate('ConnectRequests')
                        }}
                    >
                        <View style={styles.requestsContainer}>
                            <View style={{flexDirection:'row'}}>
                                <Text style={{color:Colors.blue, fontWeight:'bold', alignSelf:'center'}}>
                                    Requests
                                </Text>
                                <View style={styles.requestCountContainer}>
                                    <Text style={styles.requestCount}>{notifications.length}</Text>
                                </View>
                            </View>
                            <MaterialIcons
                                name='navigate-next'
                                color={Colors.blue}
                                size={24}
                            />
                        </View>
                    </TouchableCmp>
                )}
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={results}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderItem}
                />
                    
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
        // backgroundColor:'red'
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingTop: 49,
        paddingBottom: 12,
        borderBottomColor: Colors.primary,
        borderBottomWidth: StyleSheet.hairlineWidth
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
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
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
export default ConnectScreen