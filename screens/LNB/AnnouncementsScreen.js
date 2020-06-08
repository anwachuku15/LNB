import React from 'react'
import { 
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
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import MessageIcon from '../../components/LNB/MessageIcon';
import { FontAwesome, Ionicons } from '@expo/vector-icons'
import MenuAvatar from '../../components/LNB/MenuAvatar'
import TouchableCmp from '../../components/LNB/TouchableCmp'
import Lightbox from 'react-native-lightbox'
import Hyperlink from 'react-native-hyperlink'
import moment from 'moment'

const WINDOW_WIDTH = Dimensions.get('window').width
const WINDOW_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 10

let themeColor
let text
let background
const AnnouncementsScreen = props => {
    

    const authUser = useSelector(state => state.auth.credentials)
    let announcements = useSelector(state => state.admin.announcements.sort((a,b) => a.timestamp > b.timestamp ? -1 : 1))
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

    const selectUserHandler = (userId, name) => {
        props.navigation.navigate({
            routeName: 'UserProfile',
            params: {
                userId: userId,
                name: name,
            }
        })
    }



    const renderItem = ({item}) => (
        <TouchableCmp>
            <View style={{...styles.announcementItem, backgroundColor: scheme==='dark' ? Colors.primaryDark : Colors.primaryLight}} key={item.id}>
                <View style={{flexDirection:'row'}}>
                    <TouchableCmp
                        onPress={() => selectUserHandler(item.uid, item.admin)}
                        style={{alignSelf:'flex-start'}}
                    >
                        <Image source={{uri: item.adminImage}} style={styles.avatar} />
                    </TouchableCmp>
                    
                    <TouchableCmp onPress={() => selectUserHandler(item.uid, item.admin)}>
                        <Text style={{...styles.name, ...{color:text}}}>
                            {item.admin}
                            <Text style={{...styles.timestamp, color: scheme==='dark' ? Colors.timestamp : Colors.placeholder}}>  ·  {moment(item.timestamp).fromNow()}</Text>
                        </Text>
                        <Text style={{...styles.headline, color: scheme==='dark' ? Colors.timestamp : Colors.disabled}}>{item.adminHeadline}</Text>
                    </TouchableCmp>
                </View>

                <View style={{flex: 1}}>
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

    return (
        <SafeAreaView style={styles.screen}>

            {announcements && announcements.length > 0 ? (
                <FlatList
                    keyExtractor={(item,index) => index.toString()}
                    data={announcements}
                    renderItem={renderItem}
                />
            ) : (
                <View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
                    <Text style={{color:Colors.socialdark}}>Under Construction</Text>
                    <FontAwesome name='gears' size={40} style={{marginTop: 10}} color={Colors.primary} />
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
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22
    },
    modal: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
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
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    modalButtonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
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
        // backgroundColor: '#FFF',
        margin: 10,
        padding: 8,
        flexDirection: 'column',
        borderRadius: 10
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
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
    post: {
        margin: 20,
        fontSize: 18,
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
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT - BASE_PADDING,
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
})


export default AnnouncementsScreen