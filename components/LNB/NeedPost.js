import React, { useEffect, useCallback, useState } from 'react'
import { 
    Alert,
    View, 
    StyleSheet,
    Image,
    Text,
    Modal,
    TouchableHighlight,
    Dimensions
} from 'react-native'

import CustomModal from 'react-native-modal'
import { useSelector, useDispatch } from 'react-redux'
import { pinNeed, unpinNeed } from '../../redux/actions/authActions'
import { deleteNeed } from '../../redux/actions/postsActions'
import { connectReq, unrequest, confirmConnect, declineConnect, disconnect } from '../../redux/actions/authActions'
import NeedActions from './NeedActions'
import TouchableCmp from './TouchableCmp'
import Colors from '../../constants/Colors'
import { Ionicons, AntDesign, FontAwesome, SimpleLineIcons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native-appearance'
import Lightbox from 'react-native-lightbox'
import Hyperlink from 'react-native-hyperlink'
import moment from 'moment'

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 10

let themeColor, pinnedMargin
// const { Swipeable } = GestureHandler 

const NeedPost = props => {
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
        pinnedMargin = Colors.darkHeader
    } 
    if (scheme === 'light') {
        themeColor = 'white'
        text = 'black'
        pinnedMargin = Colors.lightHeader
    }
    const authUser = useSelector(state => state.auth.credentials)
    const authId = useSelector(state => state.auth.userId)
    const userConnections = useSelector(state => state.auth.userConnections)
    const userConnectionIds = useSelector(state => state.auth.userConnectionIds)
    const outgoingRequests = useSelector(state => state.auth.outgoingRequests)
    const incomingRequests = useSelector(state => state.auth.pendingConnections)

    const dispatch = useDispatch()

    const { 
        item,
        screen,
        pinned, 
        pinHandler,
        unpinHandler,
        selectUserHandler,
        selectedNeed,
        setSelectedNeed,
        isModalVisible,
        setIsModalVisible,
        deleteHandler,
        commentButtonHandler,
        navToPostDetail,
        showNeedActions,
    } = props

    

    const disconnectHandler = (authId, selectedUserId, selectedUserName) => {
        Alert.alert('Disconnect', 'Are you sure you want to disconnect with ' + selectedUserName + '?', [
            {
                text: 'No',
                style: 'cancel',
                onPress: () => {
                    setIsModalVisible(!isModalVisible)
                    setSelectedNeed()
                }
            },
            {
                text: 'Yes',
                style: 'destructive',
                onPress: () => {
                    dispatch(disconnect(authId, selectedUserId))
                    setIsModalVisible(!isModalVisible)
                }
            }
        ])
    }

    const [imageWidth, setImageWidth] = useState()
    const [imageHeight, setImageHeight] = useState()
    // useEffect(() => {
    
    //     if (item.imageUrl) {
    //         Image.getSize(item.imageUrl, (width, height) => {
    //             if (item.imageUrl) {
    //                 // console.log(width, height)
    //                 const fixedWidth = width > SCREEN_WIDTH ? width : width
    //                 const fixedHeight = height > 550 ? 550 : height
    //                 setImageWidth(width)
    //                 setImageHeight(height)
    //             }
    //         }, (error) => {
    //             console.log(error.message)
    //         })
    //     }
    // }, [])

    return (
        screen === 'UserProfile' && pinned && pinned.id === item.id ? (
            null
        ) : (
            <View 
                style={{
                    ...styles.feedItem, 
                    flexDirection: 'row',
                    borderBottomWidth: StyleSheet.hairlineWidth, 
                    borderBottomColor: Colors.placeholder,
                    flexDirection:'column', 
                    backgroundColor: themeColor
                }} 
                key={item.id}
            >
                
                <View style={{flexDirection: 'row'}}>

                <TouchableCmp 
                    onPress={() => selectUserHandler(item.uid, item.userName)}
                    style={{alignSelf:'flex-start'}}
                >
                    <Image source={{uri: item.userImage}} style={styles.avatar} />
                </TouchableCmp>

                <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row', justifyContent:'space-between', alignItems:'center'}}>
                        <View>
                            <TouchableCmp onPress={() => selectUserHandler(item.uid, item.userName)}>
                                <Text style={{...styles.name, ...{color:text}}}>
                                    {item.userName}
                                    <Text style={styles.timestamp}>  ·  {moment(item.timestamp).fromNow()}</Text>
                                </Text>
                            </TouchableCmp>
                        </View>
                        <TouchableCmp 
                            style={{marginRight: 5}}
                            onPress={() => {
                                setIsModalVisible(!isModalVisible)
                                setSelectedNeed({needId: item.id, uid: item.uid, userName: item.userName, likeCount: item.likeCount, commentCount: item.commentCount})
                                
                            }}
                        >
                            <Ionicons name='ios-more' size={24} color='#73788B'/>
                        </TouchableCmp>

                        <CustomModal
                            swipeDirection='down'
                            onSwipeCancel={() => setIsModalVisible(!isModalVisible)}
                            animationIn='slideInUp'
                            animationOut='slideOutDown'
                            style={{marginBottom: 0}}
                            isVisible={isModalVisible}
                            // animationType='slide' transparent={true} visible={isModalVisible}
                        >
                            <View style={styles.modalView}>
                                <View style={{...styles.modal, backgroundColor: scheme==='dark' ? '#141414' : 'white'}}>
                                    <View style={{
                                        alignSelf: 'center',
                                        marginTop: 7,
                                        marginBottom: 10,
                                        width: '10%', 
                                        borderRadius: 50, 
                                        height: 5,
                                        backgroundColor: scheme==='dark' ? Colors.darkSearch : Colors.lightSearch, 
                                    }}/>
                                    {userConnectionIds && selectedNeed &&
                                        selectedNeed.uid !== authId &&
                                        !userConnectionIds.includes(selectedNeed.uid) && 
                                        !outgoingRequests.includes(selectedNeed.uid) && 
                                        !incomingRequests.includes(selectedNeed.uid) && (
                                            <TouchableCmp
                                                style={styles.modalButton}
                                                onPress={() => {
                                                    dispatch(connectReq(authId, authName, selectedNeed.uid))
                                                }}
                                            >
                                                <View style={{flexDirection:'row', alignItems: 'center', marginLeft: 5}}>
                                                    <Ionicons
                                                        name='md-person-add' 
                                                        color={Colors.blue}
                                                        size={28} 
                                                        style={{marginRight: 26}}
                                                    />
                                                    <Text style={{...styles.modalButtonText, color: Colors.blue}}>Connect with {selectedNeed.userName}</Text>
                                                </View>
                                            </TouchableCmp>
                                        )
                                    }
                                    {userConnectionIds && selectedNeed && userConnectionIds.includes(selectedNeed.uid) && (
                                        <TouchableCmp
                                            style={styles.modalButton}
                                            onPress={() => {
                                                disconnectHandler(authId, selectedNeed.uid, selectedNeed.userName)
                                            }}
                                        >
                                            <View style={{flexDirection:'row', alignItems: 'center', marginLeft: 5}}>
                                                <SimpleLineIcons
                                                    name='user-unfollow'
                                                    color={Colors.disabled}
                                                    size={28}
                                                    style={{marginRight: 24}}
                                                />
                                                <Text style={{...styles.modalButtonText, color: scheme==='dark' ? Colors.placeholder : Colors.darkSearch}}>Disconnect with {selectedNeed.userName}</Text>
                                            </View>
                                        </TouchableCmp>
                                    )}
                                    {selectedNeed && selectedNeed.uid === authId && (
                                        <TouchableCmp
                                            style={styles.modalButton}
                                            onPress={() => {
                                                deleteHandler(selectedNeed.needId)
                                            }}
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
                                    )}

                                    
                                    
                                    {selectedNeed && selectedNeed.uid === authId &&
                                        <TouchableCmp
                                            style={{ ...styles.modalButton}}
                                            onPress={() => {
                                                if (pinned) {
                                                    selectedNeed.needId !== pinned.id ? 
                                                    pinHandler(selectedNeed.needId, selectedNeed.uid) : 
                                                    unpinHandler(selectedNeed.needId)
                                                } else {
                                                    pinHandler(selectedNeed.needId, selectedNeed.uid)
                                                }
                                            }}
                                        >
                                            <View style={{flexDirection:'row', alignItems: 'center'}}>
                                                <AntDesign
                                                    name='pushpino'
                                                    color={Colors.placeholder}
                                                    size={24}
                                                    style={{marginRight: 20}}
                                                />
                                                {!pinned || selectedNeed.needId !== pinned.id ? (
                                                    <Text style={{...styles.modalButtonText, color: scheme==='dark' ? 'white' : 'black'}}>Pin to profile</Text>
                                                ) : (
                                                    <Text style={{...styles.modalButtonText, color: scheme==='dark' ? 'white' : 'black'}}>Unpin from profile</Text>
                                                )}
                                            </View>
                                        </TouchableCmp>
                                    }

                                    {selectedNeed && screen !== 'UserProfile' &&
                                        <TouchableCmp
                                            style={{ ...styles.modalButton, }}
                                            onPress={() => {
                                                selectUserHandler(selectedNeed.uid, selectedNeed.userName)
                                                setIsModalVisible(!isModalVisible)
                                                setSelectedNeed()
                                            }}
                                        >
                                            {selectedNeed.uid !== authId ? (
                                                <View style={{flexDirection:'row', alignItems: 'center', marginLeft: 7}}>
                                                    <FontAwesome
                                                        name='user-o'
                                                        size={26}
                                                        color={Colors.primary}
                                                        style={{marginRight: 28}}
                                                    />
                                                    <Text style={{...styles.modalButtonText, color: Colors.primary}}>View Profile</Text>
                                                </View>
                                            ) : (
                                                <View style={{flexDirection:'row', alignItems: 'center', marginLeft: 5}}>
                                                    <FontAwesome
                                                        name='user-o'
                                                        size={24}
                                                        color={Colors.primary}
                                                        style={{marginRight: 18}}
                                                    />
                                                    <Text style={{...styles.modalButtonText, color: Colors.primary}}>View Profile</Text>
                                                </View>
                                            )}
                                        </TouchableCmp>
                                    }

                                    {selectedNeed && selectedNeed.uid !== authId && (selectedNeed.likeCount > 0 || selectedNeed.commentCount > 0) &&
                                        <View>
                                            {selectedNeed.commentCount > 0 && (
                                                <TouchableCmp
                                                    style={{ ...styles.modalButton, }}
                                                    onPress={() => {
                                                        props.navigation.navigate({
                                                            routeName: 'PostDetail',
                                                            params: {
                                                                needId: selectedNeed.needId,
                                                                from: 'HomeScreen'
                                                            }
                                                        })
                                                        setIsModalVisible(!isModalVisible)
                                                        setSelectedNeed()
                                                    }}
                                                >

                                                    <View style={{flexDirection:'row', alignItems: 'center', marginLeft: selectedNeed.uid !== authId ? 5 : 1, marginTop: selectedNeed.uid !== authId ? 0 : 2}}>
                                                        <MaterialIcons 
                                                            name='comment'
                                                            color={Colors.green} 
                                                            size={selectedNeed.uid !== authId ? 28 : 24} 
                                                            style={{marginRight: selectedNeed.uid !== authId ? 24 : 18}} 
                                                        />
                                                        <Text style={{...styles.modalButtonText, color: Colors.green}}>View Comments</Text>
                                                    </View>
                                                    
                                                </TouchableCmp>
                                            )}
                                            {selectedNeed.likeCount > 0 && (
                                                <TouchableCmp
                                                    style={{ ...styles.modalButton, }}
                                                    onPress={() => {
                                                        props.navigation.push('PostLikes', {
                                                            needId: selectedNeed.needId
                                                        })
                                                        setIsModalVisible(!isModalVisible)
                                                        setSelectedNeed()
                                                    }}
                                                >
                                                    <View style={{flexDirection:'row', alignItems: 'center', marginLeft: selectedNeed.uid !== authId ? 5 : 1, marginTop: selectedNeed.uid !== authId ? 0 : 2}}>
                                                        <MaterialCommunityIcons 
                                                            name='thumb-up'
                                                            color={Colors.pink} 
                                                            size={selectedNeed.uid !== authId ? 28 : 24} 
                                                            style={{marginRight: selectedNeed.uid !== authId ? 24 : 18}} 
                                                        />
                                                        <Text style={{...styles.modalButtonText, color: Colors.pink}}>View Likes</Text>
                                                    </View>
                                                </TouchableCmp>
                                            )}
                                        </View>
                                    }

                                    <TouchableCmp
                                        style={{marginTop: 10, backgroundColor: scheme==='dark' ? Colors.darkSearch : Colors.lightSearch, borderRadius: 20, padding: 12}}
                                        onPress={() => {
                                            setIsModalVisible(!isModalVisible)
                                            setSelectedNeed()
                                        }}
                                    >
                                        <Text style={{
                                            ...styles.modalButtonText, 
                                            fontWeight:'bold', 
                                            textAlign:'center', 
                                            color: scheme==='dark' ? 'white' : 'black'
                                        }}>
                                            Cancel
                                        </Text>
                                    </TouchableCmp>
                                </View>
                            </View>
                        </CustomModal>
                    </View>
                    
                    <Hyperlink
                        linkDefault={true}
                        linkStyle={{color:Colors.bluesea}}
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
                                <Image source={{uri: item.imageUrl}} style={styles.lightboxImage} resizeMode='contain'/>
                            )}
                        >
                            <Image
                                source={{uri: item.imageUrl}} 
                                // defaultSource
                                style={{...styles.postImage, borderColor: Colors.disabled}} 
                                resizeMethod='auto' 
                                resizeMode='cover'
                                height={300}
                                width={SCREEN_WIDTH * 0.75}
                                borderRadius={20}
                            />
                        </Lightbox>
                    ) : (
                        null
                    )}
                    {showNeedActions && item.id && (<NeedActions needId={item.id} leaveComment={() => commentButtonHandler(item.id, item.userName)}/>)}
                </View>
                </View>
            </View>
        )
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
    modalView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 22,
        marginBottom: 0
        // backgroundColor: 'rgba(0,0,0,0.8)'
    },
    modal: {
        width: Dimensions.get('window').width,
        borderRadius: 20,
        paddingBottom: 50,
        paddingHorizontal: 20,
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
        elevation: 2,
        marginBottom: 5,
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
        width: 36,
        height: 36,
        borderRadius: 18,
        marginLeft: 16
    },
    feed: {
        // marginHorizontal: 16
    },
    feedItem: {
        padding: 8,
        
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16
    },
    name: {
        fontSize: 15,
        fontWeight: '500'
    },
    timestamp: {
        fontSize: 14,
        color: '#C4C6CE',
        marginTop: 4
    },
    post: {
        marginTop: 5,
        marginRight: 14,
        fontSize: 14,
        lineHeight: 18
    },
    postImage: {
        borderWidth: 0.1,
        marginTop: 10,
        marginRight: 20
    },
    lightboxImage1: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT - BASE_PADDING,
        alignSelf: 'center',
        borderRadius: 5,
        marginVertical: 10
    },
    // closeButton: {
    //     color: 'white',
    //     paddingHorizontal: 18,
    //     paddingVertical: 32,
    //     textAlign: 'center',
    //     margin: 10,
    //     alignSelf: 'flex-start',
    // },
    lightboxImage: {
        width: SCREEN_WIDTH * 0.9,
        height: SCREEN_HEIGHT * 0.9,
        alignSelf: 'center',
        borderRadius: 5,
        marginVertical: 10
    },
    closeButton: {
        color: 'white',
        backgroundColor: 'rgba(40, 40, 40, 0.7)',
        borderRadius: 20,
        marginHorizontal: 18,
        marginVertical: 32,
        textAlign: 'center',
        margin: 10,
        alignSelf: 'flex-start',
        height: 40,
        width: 40,
        paddingTop: 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
})

export default NeedPost