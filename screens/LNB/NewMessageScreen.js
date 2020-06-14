import React, { useEffect, useCallback, useRef, useState } from 'react'
import { 
    Platform,
    SafeAreaView,
    View, 
    Text, 
    StyleSheet, 
    Image, 
    Button,  
    ScrollView,
    FlatList,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native'
import { CheckBox, ListItem } from 'react-native-elements'
import firebase from 'firebase'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import TouchableCmp from '../../components/LNB/TouchableCmp'

import algoliasearch from 'algoliasearch'
import { appId, key, adminkey } from '../../secrets/algolia'

const client = algoliasearch(appId, adminkey)
const index = client.initIndex('LNBmembers')

const db = firebase.firestore()



const NewMessageScreen = props => {
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

    const [search, setSearch] = useState('')
    const [results, setResults] = useState([])
    const [isFocused, setIsFocused] = useState(false)

    const [chatMembers, setChatMembers] = useState([])
    const [chatMembersIds, setChatMembersIds] = useState([])
    const [selected, setSelected] = useState(false)

    const dispatch = useDispatch()


    const searchInput = useRef(null)
    let flatListRef = useRef()
    const toEnd = () => {
        // onEndReached - https://reactnative.dev/docs/flatlist#onendreached
        flatListRef.current.scrollToEnd()
    }
    
    let hits = []
    let searchResults = []
    let members = []
    
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
            })
            setResults(searchResults)
        }).catch(err => console.log(err))
    }

    const addMember = (userId, userName, userImage) => {
        const newMember = {
            userId: userId,
            userName: userName,
            userImage: userImage
        }
        members.push(newMember)
        chatMembers.push(newMember)
        setChatMembers(chatMembers)

        chatMembersIds.push(userId)
        setChatMembersIds(chatMembersIds)

        setSelected(!selected)
        toEnd()
    }
    

    const removeMember = (userId, userName, userImage) => {
        const member = {
            userId: userId,
            userName: userName,
            userImage: userImage
        }
        chatMembers.splice(chatMembers.indexOf(chatMembers.find(member => member.userId === userId)), 1)
        setChatMembers(chatMembers)

        chatMembersIds.splice(chatMembersIds.indexOf(userId), 1)
        setChatMembersIds(chatMembersIds)

        setSelected(!selected)
    }


    const cancelSearch = () => {
        searchInput.current.blur()
    }

    const DismissKeyboard = ({ children }) => (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            {children}
        </TouchableWithoutFeedback>
    )

    
    

    const renderItem = ({item}) => (
        item.uid !== firebase.auth().currentUser.uid &&
        <TouchableWithoutFeedback
            onPress={() => {
                if (chatMembersIds.includes(item.uid)) {
                    removeMember(item.uid, item.name, item.imageUrl)
                } else {
                    addMember(item.uid, item.name, item.imageUrl)
                }
            }}
        >
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
                rightElement={
                    chatMembersIds.includes(item.uid) ? (
                        <MaterialIcons
                            name='radio-button-checked'
                            color={Colors.blue}
                            size={24}
                            style={styles.checkbox}
                        />
                    ) : (
                        <MaterialIcons
                            name='radio-button-unchecked'
                            color={Colors.placeholder}
                            size={24}
                            style={styles.checkbox}
                        />
                    )
                }
            />
        </TouchableWithoutFeedback>
    )

    const renderChatMember = ({item}) => (
        <TouchableCmp
            style={styles.memberCmp}
        >
            <Text style={styles.memberText}>{item.userName}</Text>
        </TouchableCmp>
    )

    return (
        <View style={styles.screen}>
            <View style={{flexDirection:'column', paddingHorizontal: 10, marginTop: 10}}>
                <View style={{flexDirection:'column'}}>
                    <Text style={{color:text, fontWeight:'bold', fontSize:16}}>To</Text>
                    {chatMembers.length === 0 && 
                        <View
                            style={{...styles.placeholderCmp, backgroundColor:background, borderColor:background}}
                        >
                            <Text style={{...styles.memberTextPlaceholder, color:background}}>Placeholder</Text>
                        </View>
                    }
                    <FlatList
                        ref={flatListRef}
                        horizontal
                        keyExtractor={(item, index) => index.toString()}
                        data={chatMembers}
                        extraData={selected}
                        renderItem={renderChatMember}
                        showsHorizontalScrollIndicator={false}

                    />
                </View>
                <View style={{...styles.searchContainer, width: '100%', alignSelf: 'center'}}>
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




NewMessageScreen.navigationOptions = (navData) => {
    const background = navData.screenProps.theme
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
        headerTitle: 'New Message',
        headerTitleStyle: {
            fontFamily: 'open-sans-bold',
        },
        headerBackTitleStyle: {
            fontFamily: 'open-sans',
        },
        headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primary,
        headerBackTitleVisible: false,
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
    checkbox: {
        width: '10%'
    },
    placeholderCmp: {
        alignItems:'center',
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        margin: 5,
        padding: 5,
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 50,
    },
    memberCmp: {
        alignItems:'center',
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        margin: 5,
        padding: 5,
        flexDirection: 'row',
        backgroundColor: Colors.blue,
        borderColor: Colors.blue,
        borderWidth: 1,
        borderRadius: 50,
    },
    memberTextPlaceholder: {
        alignSelf:'center',
        fontSize: 12,
        fontWeight: 'bold'
    },
    memberText: {
        alignSelf:'center',
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
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
        borderBottomColor: Colors.primary,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500',
    },
    subtitleView: {
        flexDirection: 'row'
    },
    searchContainer: {
        justifyContent: 'flex-end',
        flexDirection: 'row',
        paddingHorizontal: 5,
        marginBottom:10,
        borderWidth: 1,
        borderColor: Colors.placeholder,
        borderRadius: 50
    },
})
export default NewMessageScreen