import React, { useState, useRef, useEffect, useCallback, useReducer } from 'react'
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
    ActivityIndicator
} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import { withNavigationFocus } from 'react-navigation'
import { ListItem } from 'react-native-elements'
// REDUX
import { fetchConnections } from '../../redux/actions/authActions'
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import { FontAwesome, Feather, MaterialIcons } from '@expo/vector-icons'
import TouchableCmp from '../../components/LNB/TouchableCmp'


import algoliasearch from 'algoliasearch'
import { appId, key, adminkey } from '../../secrets/algolia'

// const client = algoliasearch(appId, key)
const client = algoliasearch(appId, adminkey)
const connectionsIndex = client.initIndex('Connections')
const index = client.initIndex('LNBmembers')

let themeColor

const ConnectionsScreen = props => {
    const scheme = useColorScheme()
    let text, background, searchBar
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
        background = 'black'
        searchBar = Colors.darkSearch
    } else {
        themeColor = 'white'
        text = 'black'
        background = 'white'
        searchBar = Colors.lightSearch
    }
    
    const auth = useSelector(state => state.auth)
    const userId = props.navigation.getParam('userId')
    const userName = props.navigation.getParam('userName')

    
    const dispatch = useDispatch()
    const [search, setSearch] = useState('')
    const [results, setResults] = useState([])
    // const [userConnections, setAllConnections] = useState([])
    const [connections, setConnections] = useState([])
    const [isMounted, setIsMounted] = useState(true)
    const [isFocused, setIsFocused] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const searchInput = useRef(null)
    
    let hits = []
    let connectionHits = []
    let searchResults = []

    const userConnections = useSelector(state => state.auth.userConnections)

    const loadConnections = useCallback(async () => {
        try {
            await dispatch(fetchConnections(userId))
        } catch (err) {
            console.log(err)
        }
    }, [dispatch])

    

    useEffect(() => {
        setIsMounted(true)
        setIsLoading(true)
        if (isMounted) {
            loadConnections().then(() => {
                setIsLoading(false)
            })
        }
        
        return () => {
            setIsMounted(false)
            loadConnections()
        }
    }, [dispatch, loadConnections, isMounted])

    const updateSearch = (text) => {
        setSearch(text)
        if (text === '') {
            setResults(userConnections)
        } else {
            const newResults = userConnections.filter(result => {
                const resultData = `${result.name.toUpperCase()}`
                const query = text.toUpperCase()
    
                return resultData.includes(query)
            })
            setResults(newResults)
        }
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
        props.navigation.push('UserProfile', {
            userId: id, 
            name: userName
        })
        setSearch('')
        
    }

    const renderItem = ({item}) => (
        <TouchableCmp onPress={() => {navToUserProfile(item.uid, item.name)}}>
            <ListItem
                containerStyle={{
                    backgroundColor:background,
                    paddingHorizontal: 14,
                    paddingVertical: 5,

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
                // rightElement={
                //     <TouchableCmp
                //         onPress={() => {}}
                //         style={{...styles.connectButton, borderColor: Colors.primary}}
                //     >
                //         <Text style={{...styles.connectText, color:Colors.primary}}>Connected</Text>
                //     </TouchableCmp>
                // }
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
                    // onFocus={() => setIsFocused(true)}
                    onBlur={cancelSearch()}
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
                                size={20}
                                color={Colors.disabled}
                            />
                        </TouchableCmp>
                    )}
                </View>
            </View>
            {isLoading && (
                <View style={styles.spinner}>
                    <ActivityIndicator 
                        size='large'
                        color={Colors.primary}
                    />
                </View>
            )}
            {userConnections && userConnections.length === 0 && (
                <Text style={{color:Colors.placeholder, alignSelf: 'center', marginTop: 10}}>
                    {userId === auth.userId ? 'You have no connections' : `${userName} has no connections`}
                </Text>
            )}
            {!isLoading && userConnections && userConnections.length > 0 &&(
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={isFocused ? results : userConnections}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                />
            )}
        </View>
    )
}


ConnectionsScreen.navigationOptions = (navData) => {
    const background = navData.screenProps.theme
    return {
        headerStyle: {
            backgroundColor: background === 'dark' ? 'black' : 'white'
        }
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    spinner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    connectButton: {
        height: 24,
        width: '25%',
        marginVertical: 5,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 50
    },
    connectText: {
        alignSelf:'center',
        fontSize: 12, 
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingTop: 49,
        paddingBottom: 16,
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
    searchContainer: {
        justifyContent: 'flex-end',
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        marginBottom: 2,
    },
})
export default ConnectionsScreen