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
import { fetchConnections, getUser } from '../../redux/actions/authActions'
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
    
    const dispatch = useDispatch()
    
    const auth = useSelector(state => state.auth)
    const userId = props.navigation.getParam('userId')
    const userName = props.navigation.getParam('userName')
    const userConnections = useSelector(state => state.auth.userConnections)

    
    const [search, setSearch] = useState('')
    const [results, setResults] = useState([])

    const searchInput = useRef(null)
    

    const updateSearch = (text) => {
        setSearch(text)
        const newResults = userConnections.filter(result => {
            const resultData = `${result.name.toUpperCase()}`
            const query = text.toUpperCase()

            return resultData.includes(query)
        })
        setResults(newResults)
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
                rightElement={
                    <View style={styles.buttonContainer}>
                        <TouchableCmp
                            style={styles.messageButton}
                            onPress={async () => {
                                await dispatch(getUser(item.uid))
                                props.navigation.push(
                                    'ChatScreen', {
                                        selectedUserId: item.uid,
                                        userName: item.name,
                                        userImage: item.imageUrl
                                    }
                            )}}
                        >
                            <Text style={styles.messageText}>Message </Text>
                            <MaterialIcons
                                name='mail-outline'
                                color='white'
                                size={20}
                            />
                        </TouchableCmp>
                    </View>
                }
            />
        </TouchableCmp>
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
                    />
                    {search.length > 0 && (
                        <TouchableCmp
                            style={{justifyContent:'center'}}
                            onPress={() => {
                                setSearch('')
                                // updateSearch('')
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
            {userConnections && userConnections.length === 0 && (
                <Text style={{color:Colors.placeholder, alignSelf: 'center', marginTop: 10}}>
                    {userId === auth.userId ? 'You have no connections' : `${userName} has no connections`}
                </Text>
            )}
            {userConnections && userConnections.length > 0 &&(
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={search.length > 0 ? results : userConnections}
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
    buttonContainer: {
        // flex: 1,
        // flexDirection: 'row',
        justifyContent: 'space-between',
        width: '30%',
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
    messageButton: {
        marginTop: 5,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems:'center',
        justifyContent: 'center',
        backgroundColor: Colors.blue,
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