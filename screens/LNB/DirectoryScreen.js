import React, { useState, useRef, useEffect, useCallback } from 'react'
import { 
    Platform,
    View, 
    Text, 
    StyleSheet, 
    Image, 
    Button, 
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
    TextInput,
    FlatList,
    Alert
} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import { withNavigationFocus } from 'react-navigation'
import { ListItem } from 'react-native-elements'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import { connectReq, unrequest, confirmConnect, disconnect, declineConnect, getUser } from '../../redux/actions/authActions'

import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import { FontAwesome, Feather, MaterialIcons } from '@expo/vector-icons'
import TouchableCmp from '../../components/LNB/TouchableCmp'

import * as firebase from 'firebase'

import algoliasearch from 'algoliasearch'
import { appId, key, adminkey } from '../../secrets/algolia'
import { set } from 'react-native-reanimated'

const client = algoliasearch(appId, adminkey)
const index = client.initIndex('LNBmembers')
const connectionsIndex = client.initIndex('Connections')

const db = firebase.firestore()


const DirectoryScreen = props => {
    const scheme = useColorScheme()
    let text, background, searchBar
    if (scheme === 'dark') {
        text = 'white'
        background = 'black'
        searchBar = Colors.darkSearch
    } else {
        text = 'black'
        background = 'white'
        searchBar = Colors.lightSearch
    }

    const dispatch = useDispatch()

    const authId = useSelector(state => state.auth.userId)
    const authName = useSelector(state => state.auth.credentials.displayName)
    const userConnections = useSelector(state => state.auth.userConnections)
    const userConnectionIds = useSelector(state => state.auth.userConnectionIds)
    const outgoingRequests = useSelector(state => state.auth.outgoingRequests)
    const incomingRequests = useSelector(state => state.auth.pendingConnections)

    const [search, setSearch] = useState('')
    const [results, setResults] = useState([])
    const [isFocused, setIsFocused] = useState(false)

    const [connect, setConnect] = useState(false)
    const [accept, setAccept] = useState(false)
    const [requested, setRequested] = useState(false)
    const [connected, setConnected] = useState(false)

    const searchInput = useRef(null)
    
    let hits = []
    let searchResults = []

    const loadIndex = useCallback(async () => {
        index.setSettings({
            customRanking: [
                'asc(newData.name)'
            ],
            ranking: [
                'custom',
                'typo',
                'geo',
                'words',
                'filters',
                'proximity',
                'attribute',
                'exact'
            ]
        }).then(() => {
            index.browseObjects({
                query: '',
                batch: batch => {
                    hits = hits.concat(batch)
                }
            }).then(() => {
                hits.forEach(hit => {
                    searchResults.push(hit.newData)
                })
                setResults(searchResults)
            })
        }).catch(err => console.log(err))


    }, [])
    
    
    // useEffect(() => {
    //     const willFocusSub = props.navigation.addListener('willFocus', loadIndex)
    //     return () => {
    //         willFocusSub.remove()
    //     }
    // }, [loadIndex])

    useEffect(() => {
        if (props.navigation.isFocused) {
            loadIndex()
        }
    }, [loadIndex])


    const updateSearch = (text) => {
        setSearch(text)
        const query = text
        index.browseObjects({
            query: query.length > 0 ? query : '',
            batch: batch => {
                hits = hits.concat(batch)
            }
        }).then(() => {
            hits.forEach(hit => {
                searchResults.push(hit.newData)
                // console.log(hit.newData.name)
            })
            setResults(searchResults)
        }).catch(err => console.log(err))
    }

    const cancelSearch = () => {
        searchInput.current.blur()
    }

    const DismissKeyboard = ({ children }) => (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            {children}
        </TouchableWithoutFeedback>
    )

    const navToUserProfile = (id, userName) => {
        props.navigation.push(
            'UserProfile', {
                userId: id, 
                name: userName
        })
        setSearch('')
        
    }

    const disconnectHandler = (authId, selectedUserId, selectedUserName) => {
        Alert.alert('Disconnect', 'Are you sure you want to disconnect from ' + selectedUserName + '?', [
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

    

    const renderItem = ({item}) => (
        <TouchableCmp onPress={async () => {
            // await dispatch(getUser(item.uid))
            navToUserProfile(item.uid, item.name)
        }}>
            <ListItem
                containerStyle={{
                    backgroundColor:background,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                }}
                leftAvatar={{
                    source: {uri: item.imageUrl},
                    containerStyle: {
                        height: 64,
                        width: 64,
                        borderRadius: 32
                    },
                    rounded: true
                }}
                title={
                    <Text style={{color:text, fontSize: 16}}>{item.name}</Text>
                }
                subtitle={
                    <View style={{flexDirection:'column'}}>
                        {item.headline.length > 0 && 
                            <Text 
                                numberOfLines={1}
                                ellipsizeMode='tail'
                                style={{color:Colors.disabled, fontSize: 14}}
                            >
                                {item.headline}
                            </Text>
                        }
                        {item.location.length > 0 && <Text style={{color:Colors.disabled, fontSize:12}}>{item.location}</Text>}
                    </View>
                }
                rightElement={item.uid !== authId ? (
                    <View style={styles.buttonContainer}>
                        {userConnectionIds && !userConnectionIds.includes(item.uid) && !outgoingRequests.includes(item.uid) && !incomingRequests.includes(item.uid) && (
                            <TouchableCmp
                                style={styles.connectButton}
                                onPress={() => {
                                    dispatch(connectReq(authId, authName, item.uid))
                                }}
                            >
                                <Text style={styles.connectText}>Connect</Text>
                            </TouchableCmp>
                        )}
                        {outgoingRequests.includes(item.uid) && (
                            <TouchableCmp
                                style={styles.requestedButton}
                                onPress={() => {
                                    unrequestHandler(authId, item.uid)
                                }}
                            >
                                <Text style={styles.requestedText}>Requested</Text>
                            </TouchableCmp>
                        )}
                        {incomingRequests.includes(item.uid) && (
                            <View style={{flexDirection: 'column'}}>
                                <TouchableCmp
                                    style={styles.acceptButton}
                                    onPress={() => {
                                        dispatch(confirmConnect(authId, authName, item.uid, item.name))
                                    }}
                                >
                                    <Text style={styles.acceptText}>Accept</Text>
                                </TouchableCmp>
                                <TouchableCmp
                                    style={styles.declineButton}
                                    onPress={() => {
                                        dispatch(declineConnect(authId, authName, item.name))
                                    }}
                                >
                                    <Text style={styles.declineText}>Decline</Text>
                                </TouchableCmp>
                            </View>
                        )}
                        {userConnectionIds.includes(item.uid) && (
                            <TouchableCmp
                                style={styles.connectedButton}
                                onPress={() => {
                                    disconnectHandler(authId, item.uid, item.name)
                                }}
                            >
                                <Text style={styles.connectedText}>Connected</Text>
                            </TouchableCmp>
                        )}
                        <TouchableCmp
                            // style={userConnectionIds.includes(item.uid) ? styles.messageButton : styles.messageButtonOutline}
                            style={styles.messageButton}
                            onPress={async () => {
                                await dispatch(getUser(item.uid))
                                props.navigation.push(
                                    'ChatScreen',
                                    {
                                        selectedUserId: item.uid,
                                        userName: item.name,
                                        userImage: item.imageUrl
                                    }
                                )
                            }}
                        >
                            {/* <Text style={styles.messageText}>Message </Text> */}
                            <MaterialIcons
                                name='mail-outline'
                                color='white'
                                size={20}
                            />
                        </TouchableCmp>
                    </View>
                ) : (null)}
                // bottomDivider
            />
        </TouchableCmp>
    )

    const renderSearchBar = () => (
        <View style={{flexDirection:'row', paddingHorizontal: 10, marginTop: 10}}>
            <View style={{...styles.searchContainer, backgroundColor: searchBar, width: '100%', alignSelf: 'center'}}>
                <View style={{justifyContent:'center'}}>
                    <Feather
                        name='search'
                        size={14}
                        color={Colors.placeholder}
                    />
                </View>
                <TextInput
                    ref={searchInput}
                    autoFocus={false}
                    multiline={true}
                    numberOfLines={4} 
                    style={{flex:1, fontSize:16, color:text, marginLeft:7, marginRight:10, alignSelf:'center', paddingVertical:5}}
                    placeholder={'Search...'}
                    placeholderTextColor={Colors.placeholder}
                    onChangeText={text => {updateSearch(text)}}
                    value={search}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {search.length > 0 && (
                    <TouchableCmp
                        style={{justifyContent:'center'}}
                        onPress={() => {
                            setSearch('')
                            updateSearch('')
                        }}
                    >
                        <MaterialIcons
                            name='cancel'
                            size={16}
                            color={Colors.disabled}
                        />
                    </TouchableCmp>
                )}
            </View>
        </View>
    )

    return (
        <View style={styles.screen}>
            <View style={{flexDirection:'row', paddingHorizontal: 10, marginTop: 10}}>
                <View style={{...styles.searchContainer, backgroundColor: searchBar, width: '100%', alignSelf: 'center'}}>
                    <View style={{justifyContent:'center'}}>
                        <Feather
                            name='search'
                            size={14}
                            color={Colors.placeholder}
                        />
                    </View>
                    <TextInput
                        ref={searchInput}
                        autoFocus={false}
                        multiline={true}
                        numberOfLines={4} 
                        style={{flex:1, fontSize:16, color:text, marginLeft:7, marginRight:10, alignSelf:'center', paddingVertical:5}}
                        placeholder={'Search...'}
                        placeholderTextColor={Colors.placeholder}
                        onChangeText={text => {updateSearch(text)}}
                        value={search}
                        // onFocus={() => setIsFocused(true)}
                        // onBlur={() => setIsFocused(false)}
                    />
                    {search.length > 0 && (
                        <TouchableCmp
                            style={{justifyContent:'center'}}
                            onPress={() => {
                                setSearch('')
                                updateSearch('')
                            }}
                        >
                            <MaterialIcons
                                name='cancel'
                                size={20}
                                color={Colors.disabled}
                            />
                        </TouchableCmp>
                    )}
                </View>
            </View>
            <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={results}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            />
        </View>
    )
}


DirectoryScreen.navigationOptions = (navData) => {
    // console.log('DirectoryScreen ' + navData.navigation.isFocused())
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    buttonContainer: {
        // flex: 1,
        // flexDirection: 'row',
        justifyContent: 'space-between',
        width: '30%',
    },
    messageButton: {
        marginTop: 5,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems:'center',
        justifyContent: 'center',
        backgroundColor: Colors.blue,
        borderColor: Colors.blue,
        borderWidth: 1,
        borderRadius: 50,
        width: '60%',
        alignSelf: 'center'
    },
    messageButtonOutline: {
        marginTop: 5,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems:'center',
        justifyContent: 'center',
        borderColor: Colors.blue,
        borderWidth: 1,
        borderRadius: 50
    },
    messageText: {
        alignSelf:'center',
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
    },
    messageTextOutline: {
        alignSelf:'center',
        color: Colors.blue,
        fontSize: 12,
        fontWeight: 'bold'
    },
    connectButton: {
        // height: 24,
        paddingVertical: 8,
        marginVertical: 5,
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
        borderWidth: 1,
        borderRadius: 50,
    },
    connectText: {
        alignSelf:'center',
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
    },
    connectedButton: {
        // height: 24,
        paddingVertical: 8,
        marginVertical: 5,
        justifyContent: 'center',
        borderColor: Colors.primary,
        borderWidth: 1,
        borderRadius: 50,
    },
    connectedText: {
        alignSelf:'center',
        color: Colors.primary,
        fontSize: 12, 
        fontWeight: 'bold'
    },
    acceptButton: {
        // height: 24,
        paddingVertical: 5,
        marginVertical: 5,
        justifyContent: 'center',
        borderColor: Colors.green,
        borderWidth: 1,
        borderRadius: 50,
    },
    acceptText: {
        alignSelf:'center',
        color: Colors.green,
        fontSize: 12, 
        fontWeight: 'bold'
    },
    declineButton: {
        // height: 24,
        paddingVertical: 5,
        marginVertical: 5,
        justifyContent: 'center',
        borderColor: Colors.raspberry,
        borderWidth: 1,
        borderRadius: 50,
    },
    declineText: {
        alignSelf:'center',
        color: Colors.raspberry,
        fontSize: 12, 
        fontWeight: 'bold'
    },
    requestedButton: {
        // height: 24,
        paddingVertical: 5,
        marginVertical: 5,
        justifyContent: 'center',
        borderColor: Colors.disabled,
        borderWidth: 1,
        borderRadius: 50,
    },
    requestedText: {
        alignSelf:'center',
        color: Colors.disabled,
        fontSize: 12, 
        fontWeight: 'bold'
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
    searchContainer: {
        justifyContent: 'flex-end',
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        marginBottom: 2,
    },
})
export default withNavigationFocus(DirectoryScreen)