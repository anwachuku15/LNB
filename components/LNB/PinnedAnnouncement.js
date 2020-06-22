import React, { useEffect, useState, useCallback } from 'react'
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
import { withNavigationFocus } from 'react-navigation'
import Clipboard from '@react-native-community/clipboard'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import { readAnnouncements, setAnnouncements } from '../../redux/actions/authActions'
import { deleteAnnouncement, pinAnnouncement } from '../../redux/actions/adminActions'

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

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 10

let themeColor, text, background
const PinnedAnnouncement = props => {
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
    
    const { 
        pinned, 
        authUser,
        selectUserHandler, 
        announcementOptions, 
        deleteHandler, 
        pinHandler, 
        isVisible, 
        setIsVisible, 
        selectedItem, 
        setSelectedItem 
    } = props

    return (    
        <TouchableCmp onPress={() => {}}>
            <View style={{...styles.announcementItem, backgroundColor: scheme==='dark' ? Colors.primaryDark : Colors.primaryLight}} key={pinned.id}>
                <TouchableCmp
                    onPress={() => selectUserHandler(pinned.uid, pinned.admin)}
                    style={{alignSelf:'flex-start'}}
                >
                    <Image source={{uri: pinned.adminImage, cache: 'force-cache'}} style={styles.avatar} />
                </TouchableCmp>

                <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row', justifyContent:'flex-end', marginBottom: 5}}>
                        <AntDesign
                            name='pushpino'
                            color={scheme === 'dark' ? Colors.lightSearch : Colors.placeholder}
                            size={14}
                            style={{marginRight: 6}}
                        />
                        <Text style={{color: scheme === 'dark' ? Colors.lightSearch : Colors.placeholder}}>Pinned Announcement</Text>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                        <TouchableCmp onPress={() => selectUserHandler(pinned.uid, pinned.admin)} style={{marginBottom: 5}}>
                            <Text style={{...styles.name, ...{color:text}}}>
                                {pinned.admin}
                                <Text style={{...styles.timestamp, color: scheme==='dark' ? Colors.timestamp : Colors.placeholder}}>  ·  {moment(pinned.timestamp).fromNow()}</Text>
                            </Text>
                            <Text style={{...styles.headline, color: scheme==='dark' ? Colors.timestamp : Colors.disabled}}>{pinned.adminHeadline}</Text>
                        </TouchableCmp>

                        {authUser.isAdmin && (
                            <View>
                                <TouchableCmp onPress={() => announcementOptions(pinned.id)} style={{marginRight: 5}}>
                                    <Ionicons
                                        name={Platform.OS==='android' ? 'md-more' : 'ios-more'}
                                        size={24}
                                        color={Colors.disabled}
                                    />
                                </TouchableCmp>
                            </View>
                        )}


                    </View>

                    {pinned.subject && (
                        <Text style={styles.subject}>{pinned.subject}</Text>
                    )}

                    <Hyperlink
                        linkDefault={true}
                        linkStyle={{color: scheme==='dark' ? Colors.bluesea : Colors.blue}}
                    >
                        <Text style={{...styles.post, ...{color:text}}}>{pinned.body}</Text>
                    </Hyperlink>
                    {pinned.imageUrl ? (
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
                                <Image source={{uri: pinned.imageUrl}} style={styles.lightboxImage} resizeMode='contain' />
                            )}
                        >
                            <Image 
                                source={{uri: pinned.imageUrl}} 
                                style={{...styles.postImage, ...{borderColor:Colors.disabled}}} 
                                resizeMethod='auto' 
                            />
                        </Lightbox>
                    ) : (
                        null
                    )}
                    {/* {showNeedActions && pinned.id && (<NeedActions needId={pinned.id} leaveComment={() => commentButtonHandler(pinned.id)}/>)} */}
                </View>
            </View>
        </TouchableCmp>
    )
}

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
        margin: 10,
        padding: 8,
        borderRadius: 10,
        paddingBottom: 20
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
    subject: {
        fontSize: 18,
        fontWeight: '500',
        fontFamily: 'poppinsBold',
        color: 'black',
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
        paddingVertical: 35,
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


export default PinnedAnnouncement