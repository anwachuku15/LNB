import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { 
    Alert,
    Platform,
    Dimensions,
    View, 
    Text, 
    FlatList,
    StyleSheet, 
    Image, 
    SafeAreaView,
    Modal,
    Button, 
    ScrollView,
    TouchableOpacity,
    TouchableNativeFeedback,
    TouchableHighlight
} from 'react-native'
import CustomModal from 'react-native-modal'
import { withNavigationFocus } from 'react-navigation'
import Clipboard from '@react-native-community/clipboard'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import { readAnnouncements, setAnnouncements } from '../../redux/actions/authActions'
import { deleteAnnouncement, pinAnnouncement, unpinAnnouncement } from '../../redux/actions/adminActions'

import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import MessageIcon from '../../components/LNB/MessageIcon';
import { FontAwesome, Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons'
import MenuAvatar from '../../components/LNB/MenuAvatar'
import TouchableCmp from '../../components/LNB/TouchableCmp'
import Lightbox from 'react-native-lightbox'
import Hyperlink from 'react-native-hyperlink'
import moment from 'moment'
import PinnedAnnouncement from '../../components/LNB/PinnedAnnouncement'

// import firebase from 'firebase'
// const db = firebase.firestore()

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 10

let themeColor
let text
let background
const AnnouncementsScreen = props => {
    

    const authUser = useSelector(state => state.auth.credentials)
    const uid = useSelector(state => state.auth.userId)
    let announcements = useSelector(state => state.admin.announcements.sort((a,b) => a.timestamp > b.timestamp ? -1 : 1))
    let pinned = useSelector(state => state.admin.announcements.find(announcement => announcement.isPinned === true))
    
    const [error, setError] = useState()

    const dispatch = useDispatch()
    
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
        background = 'black'
    } else {
        themeColor = 'white'
        text = 'black'
        background = 'white'
    }

    const [isVisible, setIsVisible] = useState(false)

    const loadAnnouncements = useCallback(async () => {
        try {
            await dispatch(readAnnouncements())
        } catch (err) {
            console.log(err)
            setError(err.message)
        }
    }, [dispatch]) 

    useEffect(() => {
        const didBlurSub = props.navigation.addListener('didBlur', loadAnnouncements)
        return () => {
            didBlurSub.remove()
        }
    }, [loadAnnouncements])

    
    const selectUserHandler = (userId, name) => {
        props.navigation.navigate({
            routeName: 'UserProfile',
            params: {
                userId: userId,
                name: name,
            }
        })
    }

    const [selectedItem, setSelectedItem] = useState()

    const deleteHandler = (id) => {
        console.log(id)
        Alert.alert('Delete Announcement', 'Are you sure you want to delete this announcement?', [
            {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                    setIsVisible(!isVisible)
                    setSelectedItem()
                }
            },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await dispatch(deleteAnnouncement(id))
                        setIsVisible(!isVisible)
                        // setIsRefreshing(true)
                        // loadData().then(() => {
                        //     setIsRefreshing(false)
                        // })
                    } catch (err) {
                        alert(err)
                        console.log(err)
                    }
                    
                }
            }
        ])
    }

    const pinHandler = (id) => {
        Alert.alert('Pin Announcement', 'This will appear at the top of the announcement feed and replace any previously pinned announcement. Are you sure?', [
            {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                    setIsVisible(!isVisible)
                    setSelectedItem()
                }
            },
            {
                text: 'Pin',
                style: 'default',
                onPress: async () => {
                    try {
                        await dispatch(pinAnnouncement(id))
                        setIsVisible(!isVisible)
                        // setIsRefreshing(true)
                        // loadData().then(() => {
                        //     setIsRefreshing(false)
                        // })
                    } catch (err) {
                        alert(err)
                        console.log(err)
                    }
                    
                }
            }
        ])
    }

    const unpinHandler = (id) => {
        Alert.alert('Unpin Announcement', 'Are you sure?', [
            {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                    setIsVisible(!isVisible)
                    setSelectedItem()
                }
            },
            {
                text: 'Unpin',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await dispatch(unpinAnnouncement(id))
                        setIsVisible(!isVisible)
                        // setIsRefreshing(true)
                        // loadData().then(() => {
                        //     setIsRefreshing(false)
                        // })
                    } catch (err) {
                        alert(err)
                        console.log(err)
                    }
                    
                }
            }
        ])
    }



    const announcementOptions = (id) => {
        setIsVisible(!isVisible)
        setSelectedItem(id)
        console.log(id)
    }

    const renderItem = ({item}) => (
        item !== pinned &&
        <TouchableCmp onPress={() => {}}>
            <View style={{...styles.announcementItem, backgroundColor: scheme==='dark' ? 'black' : 'white'}} key={item.id}>
                <TouchableCmp
                    onPress={() => selectUserHandler(item.uid, item.admin)}
                    style={{alignSelf:'flex-start'}}
                >
                    <Image source={{uri: item.adminImage}} style={styles.avatar} />
                </TouchableCmp>

                <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                        <TouchableCmp onPress={() => selectUserHandler(item.uid, item.admin)} style={{marginBottom: 5}}>
                            <Text style={{...styles.name, ...{color:text}}}>
                                {item.admin}
                                <Text style={{...styles.timestamp, color: scheme==='dark' ? Colors.timestamp : Colors.placeholder}}>  ·  {moment(item.timestamp).fromNow()}</Text>
                            </Text>
                            <Text style={{...styles.headline, color: scheme==='dark' ? Colors.timestamp : Colors.disabled}}>{item.adminHeadline}</Text>
                        </TouchableCmp>

                        {authUser.isAdmin && (
                            <View>
                                <TouchableCmp onPress={() => announcementOptions(item.id)} style={{marginRight: 5}}>
                                    <Ionicons
                                        name={Platform.OS==='android' ? 'md-more' : 'ios-more'}
                                        size={24}
                                        color={Colors.disabled}
                                    />
                                </TouchableCmp>

                                <CustomModal
                                    swipeDirection='down'
                                    onSwipeCancel={() => setIsVisible(!isVisible)}
                                    animationIn='slideInUp'
                                    animationOut='slideOutDown'
                                    style={{marginBottom: 0}}
                                    isVisible={isVisible}
                                    // animationType='slide'
                                    // transparent={true}
                                    // visible={isVisible}
                                    // onDismiss={() => {}}
                                >
                                    <View style={styles.modalView}>
                                        <View style={{...styles.modal, backgroundColor: scheme==='dark' ? Colors.darkHeader : 'white'}}>
                                            <TouchableCmp
                                                style={{ ...styles.modalButton }}
                                                onPress={() => deleteHandler(selectedItem)}
                                            >
                                                <View style={{flexDirection:'row', alignItems: 'center', marginLeft: 5}}>
                                                    <Ionicons
                                                        name={Platform.OS==='android' ? 'md-trash' : 'ios-trash'}
                                                        color={Colors.redcrayola}
                                                        size={28}
                                                        style={{marginRight: 24}}
                                                    />
                                                    <Text style={{...styles.modalButtonText, color: Colors.redcrayola}}>Delete</Text>
                                                </View>
                                            </TouchableCmp>
                                            <TouchableCmp
                                                style={{ ...styles.modalButton, marginTop: 5, }}
                                                onPress={() => {
                                                    if (pinned) {
                                                        selectedItem !== pinned.id ? pinHandler(selectedItem) : unpinHandler(selectedItem)
                                                    } else pinHandler(selectedItem)
                                                }}
                                            >
                                                <View style={{flexDirection:'row', alignItems: 'center'}}>
                                                    <AntDesign
                                                        name='pushpino'
                                                        color={Colors.placeholder}
                                                        size={24}
                                                        style={{marginRight: 20}}
                                                    />
                                                    {!pinned || selectedItem !== pinned.id ? (
                                                        <Text style={{...styles.modalButtonText, color: scheme==='dark' ? 'white' : 'black'}}>Pin Announcement</Text>
                                                    ) : (
                                                        <Text style={{...styles.modalButtonText, color: scheme==='dark' ? 'white' : 'black'}}>Unpin Announcement</Text>
                                                    )}
                                                </View>
                                            </TouchableCmp>

                                            <TouchableCmp
                                                style={{marginTop: 5, backgroundColor: scheme==='dark' ? Colors.darkSearch : Colors.lightSearch, borderRadius: 20, padding: 12}}
                                                onPress={() => {
                                                    setIsVisible(!isVisible)
                                                    setSelectedItem()
                                                }}
                                            >
                                                <Text style={{...styles.modalButtonText, fontWeight:'bold', textAlign:'center', color: scheme==='dark' ? 'white' : 'black'}}>Cancel</Text>
                                            </TouchableCmp>
                                        </View>
                                    </View>
                                </CustomModal>
                            </View>
                        )}


                    </View>

                    {item.subject && (
                        <Text style={{...styles.subject, color:text}}>{item.subject}</Text>
                    )}

                    <Hyperlink
                        linkDefault={true}
                        linkStyle={{color: scheme==='dark' ? Colors.bluesea : Colors.blue}}
                    >
                        <Text style={{...styles.post, ...{color:text}}}>{item.body}</Text>
                    </Hyperlink>
                    {item.imageUrl ? (
                        <Lightbox
                            backgroundColor='rgba(0, 0, 0, 0.8)'
                            underlayColor={themeColor}
                            springConfig={{tension: 15, friction: 7}}
                            renderHeader={(close) => (
                                <TouchableCmp 
                                    onPress={close}
                                    style={styles.closeButton}
                                >
                                    <Ionicons 
                                        name='ios-close'
                                        size={36}
                                        color='white'
                                    />
                                </TouchableCmp >
                            )}
                            renderContent={() => (
                                <Image source={{uri: item.imageUrl}} style={styles.lightboxImage} resizeMode='contain' />
                            )}
                        >
                            <Image 
                                source={{uri: item.imageUrl}} 
                                style={{...styles.postImage, ...{borderColor:Colors.disabled}}} 
                                resizeMethod='auto' 
                            />
                        </Lightbox>
                    ) : (
                        null
                    )}
                    {/* {showNeedActions && item.id && (<NeedActions needId={item.id} leaveComment={() => commentButtonHandler(item.id)}/>)} */}
                </View>
            </View>
        </TouchableCmp>
    )

    if (error) {
        return (
            <View style={styles.spinner}>
                <Text>An error occured</Text>
                <Button title='try again' onPress={() => {}} color={Colors.primary}/>
            </View>
        )
    }

    const memoPinnedImages = useMemo(() => {
        return (
            <PinnedAnnouncement
                pinned={pinned}
                authUser={authUser}
                selectUserHandler={selectUserHandler}
                announcementOptions={announcementOptions}
                deleteHandler={deleteHandler}
                pinHandler={pinHandler} 
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
            />
        )
    }, [selectUserHandler, announcementOptions, deleteHandler, pinHandler, isVisible, setIsVisible, selectedItem, setSelectedItem])

    return (
        <SafeAreaView style={styles.screen}>

            {announcements && announcements.length > 0 ? (
                <FlatList
                    keyExtractor={(item,index) => index.toString()}
                    data={announcements}
                    renderItem={renderItem}
                    // ListHeaderComponent={pinned && memoPinnedImages}
                    ListHeaderComponent={pinned && (
                        <PinnedAnnouncement
                            pinned={pinned}
                            authUser={authUser}
                            selectUserHandler={selectUserHandler}
                            announcementOptions={announcementOptions}
                            deleteHandler={deleteHandler}
                            pinHandler={pinHandler} 
                            isVisible={isVisible}
                            setIsVisible={setIsVisible}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                        />
                    )}
                />
            ) : (
                <View style={styles.spinner}>
                    <Text>An error occured</Text>
                    <Button title='try again' onPress={() => {}} color={Colors.primary}/>
                </View>
            )}
        </SafeAreaView>
    )
}


AnnouncementsScreen.navigationOptions = (navData) => {
    const background = navData.screenProps.theme
    const isFocused = navData.navigation.isFocused()
    return {
        headerLeft: () => (
            isFocused && <MenuAvatar toggleDrawer={() => navData.navigation.toggleDrawer()} />
        ),
        headerRight: () => (
            <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item
                    ButtonElement={<MessageIcon/>}
                    title='Messages'
                    onPress={() => {
                        navData.navigation.navigate('Messages')
                    }}
                />
            </HeaderButtons>
        ),
        headerTitle: 'Announcements',
        headerStyle: {
            backgroundColor: background === 'dark' ? 'black' : 'white',
            borderBottomColor: Colors.primary
        },
    }
}

// const styles = StyleSheet.create({
//     screen: {
//         flex: 1,
//     },
//     header: {
//         flexDirection:'row',
//         justifyContent:'space-between',
//         alignItems: 'center',
//         paddingVertical: 10.6,
//         backgroundColor: themeColor,
//         borderBottomColor: Colors.primary,
//         borderBottomWidth: StyleSheet.hairlineWidth
//     },
//     headerTitle: {
//         color: Colors.primary,
//         fontFamily: 'open-sans-bold',
//         fontSize: 17,
//         fontWeight: '500'
//     },
//     menuAvatar: {
//         width: 28,
//         height: 28,
//         borderRadius: 14,
//         marginLeft: 16
//     },
// })

const styles = StyleSheet.create({
    touchable: {
        overflow: 'hidden',
        borderRadius: 10,
    },
    spinner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    screen: {
        flex: 1
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingVertical: 5.6,
        // paddingTop: 44,
        // paddingBottom: 7,
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
    menuAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginLeft: 16
    },
    feed: {
        // marginHorizontal: 16
    },
    announcementItem: {
        flexDirection: 'row',
        // margin: 10,
        padding: 8,
        borderRadius: 10,
        // borderWidth: 1,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.placeholder,
        paddingBottom: 20,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16
    },
    name: {
        fontSize: 20,
        fontWeight: '500'
    },
    timestamp: {
        fontSize: 14,
        marginTop: 4
    },
    headline: {
        fontSize: 16,
        marginTop: 4
    },
    subject: {
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'poppinsBold',
        marginTop: 10
    },
    post: {
        marginTop: 5,
        fontSize: 16,
        lineHeight: 22
    },
    postImage: {
        width: undefined,
        minHeight: 200,
        maxHeight: 300,
        borderRadius: 5,
        borderWidth: 0.1,
        marginTop: 10,
        // marginRight: 20
    },
    lightboxImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT - BASE_PADDING,
        borderRadius: 5,
        marginVertical: 10
    },
    closeButton: {
        color: 'white',
        paddingHorizontal: 18,
        paddingVertical: 32,
        textAlign: 'center',
        margin: 10,
        alignSelf: 'flex-start',
    },
    modalView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 22,
        // backgroundColor: 'rgba(0,0,0,0.8)'
    },
    modal: {
        width: Dimensions.get('window').width,
        borderRadius: 20,
        paddingTop: 30,
        paddingBottom: 50,
        paddingHorizontal: 20,
        // alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    modalButton: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    modalButtonText: {
        // fontWeight: "bold",
        fontSize: 18,
        // textAlign: "center",
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
    },
})


export default withNavigationFocus(AnnouncementsScreen)