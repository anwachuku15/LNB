import React, { } from 'react'
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
    Alert
} from 'react-native'
// import CachedImage from '../../components/LNB/CachedImage'
import CachedImage from '../../components/LNB/CachedImageCmp'
import { ListItem } from 'react-native-elements'
import Colors from '../../constants/Colors'
import TouchableCmp from './TouchableCmp'
import { MaterialIcons } from '@expo/vector-icons'


const UserListItem = props => {

    const { 
        item, 
        authId,
        styles,
        navToUserProfile,
        text,
        background,
        userConnectionIds,
        outgoingRequests,
        incomingRequests,
        requestedUsers,
        connectedUsers,
        connectReqHandler,
        unrequestHandler,
        disconnectHandler,
        dispatch,
        getUser
    } = props


    return (
        <TouchableCmp onPress={() => {
            navToUserProfile(item.uid, item.name)
        }}>
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
                    // ImageComponent: () => (
                    //     <CachedImage
                    //         source={{uri: item.imageUrl}}
                    //         style={{height: 64, width: 64, borderRadius: 32}}
                    //     />
                    // ),
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
                rightElement={item.uid !== authId ? (
                    <View style={styles.buttonContainer}>
                        {userConnectionIds && outgoingRequests && incomingRequests &&
                        !userConnectionIds.includes(item.uid) && 
                        !incomingRequests.includes(item.uid) && 
                        !requestedUsers.includes(item.uid) && (
                            <TouchableCmp
                                style={styles.connectButton}
                                onPress={() => {
                                    connectReqHandler(item)
                                }}
                            >
                                <Text style={styles.connectText}>Connect</Text>
                            </TouchableCmp>
                        )}
                        {(outgoingRequests.includes(item.uid) || requestedUsers.includes(item.uid)) && (
                            <TouchableCmp
                                style={styles.requestedButton}
                                onPress={() => {
                                    unrequestHandler(authId, item.uid)
                                }}
                            >
                                <Text style={styles.requestedText}>Requested</Text>
                            </TouchableCmp>
                        )}
                        {incomingRequests.includes(item.uid) && (
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10}}>
                                <TouchableCmp
                                    style={styles.declineButton}
                                    onPress={() => props.navigation.navigate('ConnectRequests')}
                                >
                                    {/* <Text style={styles.declineText}>Decline</Text> */}
                                    <MaterialIcons
                                        name='close'
                                        size={18}
                                        color={Colors.raspberry}
                                    />
                                </TouchableCmp>

                                <TouchableCmp
                                    style={styles.acceptButton}
                                    onPress={() => props.navigation.navigate('ConnectRequests')}
                                >
                                    {/* <Text style={styles.acceptText}>Accept</Text> */}
                                    <MaterialIcons
                                        name='check'
                                        size={18}
                                        color={Colors.green}
                                    />
                                </TouchableCmp>
                            </View>
                        )}
                        {(userConnectionIds.includes(item.uid) || connectedUsers.includes(item.uid)) && (
                            <TouchableCmp
                                style={styles.connectedButton}
                                onPress={() => {
                                    disconnectHandler(authId, item.uid, item.name)
                                }}
                            >
                                <Text style={styles.connectedText}>Connected</Text>
                            </TouchableCmp>
                        )}
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
                                )
                            }}
                        >
                            <Text style={styles.messageText}>Message</Text>
                            
                        </TouchableCmp>
                    </View>
                ) : (null)}
                // bottomDivider
            />
        </TouchableCmp>
    )
}

export default UserListItem