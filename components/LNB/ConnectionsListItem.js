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
import CachedImage from './CachedImageCmp'
import { ListItem } from 'react-native-elements'
import Colors from '../../constants/Colors'
import TouchableCmp from './TouchableCmp'
import { MaterialIcons } from '@expo/vector-icons'


const ConnectionsListItem = props => {

    const { 
        item,
        styles,
        navToUserProfile,
        text,
        background,
        dispatch,
        getUser
    } = props


    return (
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
                                )
                            }}
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
}

export default ConnectionsListItem