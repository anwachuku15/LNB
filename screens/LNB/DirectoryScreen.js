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
    FlatList
} from 'react-native'
import { withNavigationFocus } from 'react-navigation'
import { ListItem } from 'react-native-elements'
// REDUX
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
const index = client.initIndex('LNBmembers')
const connectionsIndex = client.initIndex('Connections')

let themeColor
let text, background
const DirectoryScreen = props => {
    const scheme = useColorScheme()
    let text
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
        background = 'black'
    } else {
        themeColor = 'white'
        text = 'black'
        background = 'white'
    }
    
    const [search, setSearch] = useState('')
    const [results, setResults] = useState([])
    const [isFocused, setIsFocused] = useState(false)
    const searchInput = useRef(null)
    
    let hits = []
    let searchResults = []

    const loadIndex = useCallback(async () => {
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
        }).catch(err => console.log(err))
    }, [])
    
    
    useEffect(() => {
        const willFocusSub = props.navigation.addListener('willFocus', loadIndex)
        // console.log(props.navigation.state)
        return () => {
            willFocusSub
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
        props.navigation.push('UserProfile', {
            userId: id, 
            name: userName
        })
        setSearch('')
        
    }

    const renderItem = ({item}) => (
        <TouchableCmp onPress={() => {navToUserProfile(item.uid, item.name)}}>
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
    return (
        
        <View style={styles.screen}>
            <View style={{flexDirection:'row', paddingHorizontal: 10, marginTop: 10}}>
                <View style={{...styles.searchContainer, width: isFocused ? '85%' : '100%', alignSelf: 'center'}}>
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
                        style={{flex:1, fontSize:14, color:text, marginLeft:7, marginRight:10, alignSelf:'center', paddingVertical:4}}
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
                {isFocused ? (
                    <TouchableCmp 
                        onPress={() => {
                            cancelSearch()
                            updateSearch('')
                        }}
                        style={{width:'15%', alignItems:'center', alignSelf:'center', justifyContent:'center'}}
                    >
                        <Text style={{color: Colors.primary}}>Cancel</Text>
                    </TouchableCmp>
                ) : (
                    null
                )}
            </View>
            {/* {!isFocused && (
                <View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
                    <Text style={{color:Colors.socialdark}}>Under Construction</Text>
                    <Text style={{color:Colors.socialdark, fontSize: 12, marginTop:5}}>You can still search though :)</Text>
                    <FontAwesome name='gears' size={40} style={{marginTop: 10}} color={Colors.primary} />
                </View>
            )} */}
            {/* {isFocused && search.length === 0 && (
                <DismissKeyboard>
                    <View style={{flex: 1, alignItems:'center', paddingTop: 10}}>
                        <Text style={{color:Colors.placeholder}}>Search for someone you'd like to connect with</Text>
                    </View>
                </DismissKeyboard>
            )} */}
            {/* {search.length > 0 && ( */}
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={results}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                />
            {/* )} */}
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
        paddingHorizontal: 5,
        borderColor: Colors.primary,
        borderWidth: 1,
        borderRadius: 10,
    },
})
export default DirectoryScreen