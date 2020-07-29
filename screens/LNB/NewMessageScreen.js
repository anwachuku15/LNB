import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react'
import { 
    Platform,
    SafeAreaView,
    View, 
    Text, 
    StyleSheet,
    FlatList,
    TextInput,
    Keyboard,
    KeyboardEvent,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native'
import CustomModal from 'react-native-modal'
import Dialog from 'react-native-dialog'
import { CheckBox, ListItem, Overlay } from 'react-native-elements'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import { getUser } from '../../redux/actions/authActions'


import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import TouchableCmp from '../../components/LNB/TouchableCmp'
import NameGroupChatModal from '../../components/LNB/NameGroupChatModal'
import algoliasearch from 'algoliasearch'
import { appId, key, adminkey } from '../../secrets/algolia'

const client = algoliasearch(appId, adminkey)
const index = client.initIndex('LNBmembers')

import firebase from 'firebase'
import { db } from '../../Firebase/Fire'

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height

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
    const [isVisible, setIsVisible] = useState(false)
    const [groupName, setGroupName] = useState('')

    const [chatMembers, setChatMembers] = useState([])
    const [chatMembersIds, setChatMembersIds] = useState([])
    const [selected, setSelected] = useState(false)

    const auth = useSelector(state => state.auth)
    const allUsers = useSelector(state => state.auth.allUsers)

    const dispatch = useDispatch()


    const searchInput = useRef(null)
    let flatListRef = useRef()
    const toEnd = () => {
        // onEndReached - https://reactnative.dev/docs/flatlist#onendreached
        flatListRef.current.scrollToEnd()
    }
   
    const updateSearch = (text) => {
        setSearch(text)
        const newResults = allUsers.filter(result => {
            const resultData = `${result.displayName.toUpperCase()}`
            const query = text.toUpperCase()

            return resultData.includes(query)
        })
        setResults(newResults)
    }

    const addMember = (userId, userName, userImage) => {
        const newMember = {
            uid: userId,
            name: userName,
            userImage: userImage
        }
        chatMembers.push(newMember)
        setChatMembers(chatMembers)

        chatMembersIds.push(userId)
        setChatMembersIds(chatMembersIds)

        setSelected(!selected)
        toEnd()
    }
    

    const removeMember = (userId, userName, userImage) => {
        const member = {
            uid: userId,
            name: userName,
            userImage: userImage
        }
        chatMembers.splice(chatMembers.indexOf(chatMembers.find(member => member.uid === userId)), 1)
        setChatMembers(chatMembers)

        chatMembersIds.splice(chatMembersIds.indexOf(userId), 1)
        setChatMembersIds(chatMembersIds)

        setSelected(!selected)
    }


    
    

    const renderItem = ({item}) => (
        item.userId !== firebase.auth().currentUser.uid &&
        <TouchableWithoutFeedback
            onPress={() => {
                if (chatMembersIds.includes(item.userId)) {
                    removeMember(item.userId, item.displayName, item.imageUrl)
                } else {
                    addMember(item.userId, item.displayName, item.imageUrl)
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
                    <Text style={{color:text, fontSize: 16}}>{item.displayName}</Text>
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
                    chatMembersIds.includes(item.userId) ? (
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

    const [memberColor, setMemberColor] = useState(Colors.blue)
    const deleteMember = (item, index, userId, userName, userImage) => {
        if (memberColor === Colors.blue) {
            setMemberColor(Colors.raspberry)
        } else {
            removeMember()
            setMemberColor(Colors.blue)
        }
    }
    const renderChatMember = ({item, index}) => (
        <TouchableCmp
            style={{...styles.memberCmp, backgroundColor: memberColor, borderColor: memberColor}}
            onPress={() => {
                // deleteMember(item, index, item.userId, item.userName, item.userImage)
            }}
        >
            <Text style={styles.memberText}>{item.name}</Text>
        </TouchableCmp>
    )

    const navToChatScreen = async (userId, userName, userImage) => {
        await dispatch(getUser(userId))
        props.navigation.navigate({
            routeName: 'ChatScreen',
            params: {
                selectedUserId: userId,
                userName: userName,
                userImage: userImage
            }
        })
        setChatMembers([])
        setChatMembersIds([])
        setGroupName('')
        setSearch('')
        updateSearch('')
    }

    const idGenerator = () => {return Math.random().toString(36).replace('.', '-') + Math.random().toString(36).replace('.', '-')}

    const navToGroupChatScreen = (groupChatMembers, groupName) => {
        toggleModal()
        props.navigation.navigate({
            routeName: 'GroupChatScreen',
            params: {
                groupChatMembers: groupChatMembers.concat({uid: auth.userId, name: auth.credentials.displayName, userImage: auth.credentials.imageUrl}),
                groupChatName: groupName,
                groupChatId: groupName.replace(/\s+/g, '') + idGenerator(),
                createdBy: {
                    uid: auth.userId,
                    name: auth.credentials.displayName,
                    userImage: auth.credentials.imageUrl
                },
            }
        })

        
        setChatMembers([])
        setChatMembersIds([])
        setGroupName('')
        setSearch('')
        updateSearch('')
    }



    
    const toggleModal = () => {
        setIsVisible(!isVisible)
    }
    const cancel = () => {
        toggleModal()
        setGroupName('')
    }

    

   

    

    // let groupNameValue
    const updateGroupName = (text) => {
        // groupNameValue = text
        setGroupName(text)
    }

    return (
        <View style={{...styles.screen, backgroundColor: background}}>
            <SafeAreaView>
                <View style={styles.header}>
                    {/* <HeaderButtons HeaderButtonComponent={HeaderButton}>
                        <Item
                            title='Direct'
                            iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                            onPress={() => {props.navigation.goBack()}}
                        />
                    </HeaderButtons> */}
                    <TouchableCmp style={styles.cancelButton} onPress={() => {props.navigation.goBack()}}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableCmp>
                    <Text style={styles.headerTitle}>New Message</Text>
                    {chatMembers.length > 0 ? (
                        <TouchableCmp 
                            style={styles.chatButton}
                            onPress={
                                chatMembers.length === 1
                                ? () => navToChatScreen(chatMembers[0].uid, chatMembers[0].name, chatMembers[0].userImage)
                                : () => toggleModal()
                            }
                        >
                            <Text style={styles.chatButtonText}>Chat</Text>
                        </TouchableCmp>
                    ) : (
                        <View style={styles.chatButton}>
                            <Text style={styles.chatButtonTextDisabled}>Chat</Text>
                        </View>
                    )}
                </View>
        
                <NameGroupChatModal
                    isVisible={isVisible}
                    chatMembers={chatMembers}
                    groupName={groupName}
                    updateGroupName={updateGroupName}
                    navToGroupChatScreen={navToGroupChatScreen}
                    cancel={cancel}
                />

                <View style={{flexDirection:'column', paddingHorizontal: 10, marginTop: 10}}>
                    <View style={{flexDirection:'column'}}>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={{color:text, fontWeight:'bold', fontSize:16}}>To: </Text>
                            {chatMembers.length > 1 && (<Text style={{color:Colors.blue, fontWeight:'bold', fontSize:15}}>({chatMembers.length} people)</Text>)}
                        </View>
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
                            // keyboardShouldPersistTaps='always'
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
            </SafeAreaView>
            <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={search.length === 0 ? allUsers : results}
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
        headerRight: () => (
            <Text style={{color: Colors.blue}}>Chat</Text>
        ),
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
    modal: {
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white', 
        // borderTopLeftRadius: 8,
        // borderTopRightRadius: 8,
        borderRadius: 8,
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 20
    },
    createButton: {
        // flex: 1,
        width: '40%',
        padding: 10,
        borderRadius: 50,
    },
    createText: {
        color: 'white',
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500',
    },
    cancelButton: {
        marginLeft: 10,
    },
    cancelText: {
        color: Colors.raspberry,
        fontSize: 16,
        fontWeight: '500',
        alignSelf: 'center'
    },
    chatButton: {
        marginRight: 10,
    },
    chatButtonText: {
        color: Colors.blue, 
        fontSize: 16, 
        fontWeight: 'bold'
    },
    chatButtonTextDisabled: {
        color: Colors.disabled, 
        fontSize: 16, 
        fontWeight: 'bold'
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
        padding: 10,
        flexDirection: 'row',
        // backgroundColor: Colors.blue,
        // borderColor: Colors.blue,
        borderWidth: 1,
        borderRadius: 50,
    },
    memberCmpDelete: {
        alignItems:'center',
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        margin: 5,
        padding: 10,
        flexDirection: 'row',
        backgroundColor: Colors.raspberry,
        borderColor: Colors.raspberry,
        borderWidth: 1,
        borderRadius: 50,
    },
    memberTextPlaceholder: {
        alignSelf:'center',
        fontSize: 14,
        fontWeight: 'bold'
    },
    memberText: {
        alignSelf:'center',
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold'
    },
    spinner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    subtitleView: {
        flexDirection: 'row'
    },
    searchContainer: {
        justifyContent: 'flex-end',
        flexDirection: 'row',
        paddingHorizontal: 5,
        marginTop: 5,
        marginBottom:10,
        borderWidth: 1,
        borderColor: Colors.disabled,
        borderRadius: 50
    },
})
export default NewMessageScreen