import React from 'react'
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    SafeAreaView,
    Button, 
    ScrollView,
    TouchableOpacity,
    TouchableNativeFeedback
} from 'react-native'
import { SharedElement } from 'react-navigation-shared-element'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import MessageIcon from '../../components/LNB/MessageIcon';
import { EvilIcons } from '@expo/vector-icons'
import MenuAvatar from '../../components/LNB/MenuAvatar'
import TouchableCmp from '../../components/LNB/TouchableCmp'

let themeColor
let text
const UserProfilePictureScreen = props => {
    const scheme = useColorScheme()

    const authUser = useSelector(state => state.auth.credentials)
    const profilePic = props.navigation.getParam('profilePic')
    const userId = props.navigation.getParam('userId')
    const dispatch = useDispatch()
    
    const colorScheme = useColorScheme()
    let text
    if (colorScheme === 'dark') {
        themeColor = 'black'
        text = 'white'
    } else {
        themeColor = 'white'
        text = 'black'
    }
    
    return (
        
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <TouchableCmp onPress={() => props.navigation.goBack()}>
                    <EvilIcons 
                        name='close-o'
                        size={36}
                        color={Colors.disabled}
                    />
                </TouchableCmp>
            </View>
            <View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
                <SharedElement id={userId}>
                    <Image style={styles.avatar} source={{uri: profilePic}}/>
                </SharedElement>
            </View>
        </SafeAreaView>
    )
}


UserProfilePictureScreen.sharedElements = (navigation) => {
    const profilePic = navigation.getParam('profilePic')
    const userId = props.navigation.getParam('userId')
    return profilePic
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flexDirection:'row',
        alignItems: 'center',
        paddingVertical: 10.6,
        marginLeft: 10,
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
    avatar: {
        width: 300,
        height: 300,
        borderRadius: 204
    },
})


export default UserProfilePictureScreen