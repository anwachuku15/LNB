import React, { useEffect, useCallback, useState } from 'react'
import { 
    Alert,
    View, 
    StyleSheet,
    Image,
    Text,
    Modal,
    TouchableHighlight,
    Dimensions,
    TouchableWithoutFeedback,
} from 'react-native'
import { Video } from 'expo-av'

import * as Linking from 'expo-linking'
import CustomModal from 'react-native-modal'
import { useSelector, useDispatch } from 'react-redux'
import { pinNeed, unpinNeed } from '../../redux/actions/authActions'
import { deleteNeed } from '../../redux/actions/postsActions'
import { connectReq, unrequest, confirmConnect, declineConnect, disconnect } from '../../redux/actions/authActions'
import NeedActions from './NeedActions'
import TouchableCmp from './TouchableCmp'
import TaggedUserText from './TaggedUserText'
import Colors from '../../constants/Colors'
import { Ionicons, AntDesign, FontAwesome, SimpleLineIcons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native-appearance'
import Lightbox from 'react-native-lightbox'
import Hyperlink from 'react-native-hyperlink'
import ParsedText from 'react-native-parsed-text'
import moment from 'moment'

let themeColor, text
const UserProfilePictureModal = props => {
    const scheme = useColorScheme()
    if (scheme==='dark') {
        themeColor = 'black'
        text = 'white'
    } else {
        themeColor = 'white'
        text = 'black'
    }

    const [isPictureVisible, setIsPictureVisible] = useState(false)
    const { styles, user, } = props
    return (
        <View>
            <View style={styles.avatarContainer}>
                <TouchableWithoutFeedback onPress={() => setIsPictureVisible(!isPictureVisible)}>
                    <View id={user.imageUrl}>
                        <Image style={styles.avatar} source={{uri: user.imageUrl, cache: 'force-cache'}}/>
                    </View>
                </TouchableWithoutFeedback>
            </View>

            {isPictureVisible && <CustomModal
                swipeDirection='down'
                onSwipeCancel={() => setIsPictureVisible(!isPictureVisible)}
                animationIn='slideInUp'
                animationOut='slideOutDown'
                style={{marginBottom: 0}}
                isVisible={isPictureVisible}
                // animationType='slide'
                // transparent={true}
                // visible={isPictureVisible}
            >
                <View style={styles.pictureModalView}>
                    <View style={{...styles.pictureModal, backgroundColor: scheme==='dark' ? Colors.darkModal : 'white'}}>
                        <Text>Hello</Text>
                    </View>
                </View>
            </CustomModal>}
        </View>
    )
}

export default UserProfilePictureModal