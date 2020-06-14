import React from 'react'
import { 
    View, 
    StyleSheet,
    Image,
    Text,
    Modal,
    TouchableHighlight,
    Dimensions
} from 'react-native'
import { useSelector } from 'react-redux'
import NeedActions from './NeedActions'
import TouchableCmp from './TouchableCmp'
import Colors from '../../constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native-appearance'
import Lightbox from 'react-native-lightbox'
import Hyperlink from 'react-native-hyperlink'
import moment from 'moment'

const WINDOW_WIDTH = Dimensions.get('window').width
const WINDOW_HEIGHT = Dimensions.get('window').height
const BASE_PADDING = 10

let themeColor

const NeedPost = props => {
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
    } 
    if (scheme === 'light') {
        themeColor = 'white'
        text = 'black'
    }
    const authUser = useSelector(state => state.auth.credentials)
    const authId = useSelector(state => state.auth.userId)

    const { 
        item, 
        selectUserHandler,
        isDeletable,
        setIsDeletable,
        selectedNeed,
        setSelectedNeed,
        isModalVisible,
        setIsModalVisible,
        deleteHandler,
        commentButtonHandler,
        showNeedActions,
        // setShowNeedActions
    } = props

    return (
        <View style={{...styles.feedItem, ...{backgroundColor: themeColor}}} key={item.id}>
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
                    <TouchableCmp onPress={() => {
                        item.uid === authId ? setIsDeletable(true) : setIsDeletable(false)
                        setIsModalVisible(!isModalVisible)
                        setSelectedNeed(item.id)
                    }}>
                        <Ionicons name='ios-more' size={24} color='#73788B'/>
                    </TouchableCmp>
                    <Modal
                        animationType='slide'
                        transparent={true}
                        visible={isModalVisible}
                        onDismiss={() => {}}
                    >
                        <View style={styles.modalView}>
                            <View style={styles.modal}>
                                <Text style={styles.modalText}>Coming soon...</Text>
                                <TouchableHighlight
                                    style={{ ...styles.modalButton, backgroundColor: "#2196F3" }}
                                    onPress={() => {
                                        setIsModalVisible(!isModalVisible);
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>Hide Modal</Text>
                                </TouchableHighlight>
                                {isDeletable && (
                                    <TouchableHighlight
                                        style={{ ...styles.modalButton, marginTop: 5, backgroundColor: Colors.redcrayola }}
                                        onPress={() => {deleteHandler(selectedNeed)}}
                                    >
                                        <Text style={styles.modalButtonText}>Delete</Text>
                                    </TouchableHighlight>
                                )}
                            </View>
                        </View>
                    </Modal>
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
                {showNeedActions && item.id && (<NeedActions needId={item.id} leaveComment={() => commentButtonHandler(item.id, item.userName)}/>)}
            </View>
        </View>
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
        // backgroundColor: 'rgba(0,0,0,0.8)'
    },
    modal: {
        width: Dimensions.get('window').width,
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
    feedItem: {
        backgroundColor: '#FFF',
        padding: 8,
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.placeholder
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
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
        fontSize: 14,
        lineHeight: 18
    },
    postImage: {
        width: undefined,
        minHeight: 200,
        maxHeight: 300,
        borderRadius: 5,
        borderWidth: 0.1,
        marginTop: 10,
        marginRight: 20
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

export default NeedPost