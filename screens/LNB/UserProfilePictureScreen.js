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
    TouchableNativeFeedback, 
    Dimensions
} from 'react-native'
import { SharedElement } from 'react-navigation-shared-element'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import HeaderClose from '../../components/UI/HeaderClose'
import MessageIcon from '../../components/LNB/MessageIcon';
import { EvilIcons } from '@expo/vector-icons'
import MenuAvatar from '../../components/LNB/MenuAvatar'
import TouchableCmp from '../../components/LNB/TouchableCmp'

const SCREEN_WIDTH = Dimensions.get('screen').width
const SCREEN_HEIGHT = Dimensions.get('screen').height


let themeColor
let text
const UserProfilePictureScreen = props => {
    const scheme = useColorScheme()

    const user = props.navigation.getParam('user')
    const uri = props.navigation.getParam('uri')
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
            {/* <View style={styles.header}>
                <TouchableCmp onPress={() => props.navigation.goBack()}>
                    <EvilIcons
                        name='close-o'
                        size={36}
                        color={Colors.disabled}
                    />
                </TouchableCmp>
            </View> */}
            <View style={{flex:1, marginTop: SCREEN_HEIGHT/6}}>
                <SharedElement id={uri}>
                    <Image style={styles.avatar} source={{uri: uri}}/>
                </SharedElement>
                {/* <Text style={styles.bio}>{user.bio}</Text> */}
            </View>
        </SafeAreaView>
    )
}


UserProfilePictureScreen.sharedElements = (navigation, otherNavigation, showing) => {
    const uri = navigation.getParam('uri')
    return [{
        id: uri,
        animation: 'move',
    }]
}

UserProfilePictureScreen.navigationOptions = (navData) => {
    return {
        headerLeft: () => (
            <HeaderButtons HeaderButtonComponent={HeaderClose}>
                <Item
                    title='Back'
                    iconName='close-o'
                    onPress={() => {navData.navigation.goBack()}}
                />
            </HeaderButtons>
        ),
        headerTitle: '',
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.socialdark
    },
    avatar: {
        alignSelf: 'center',
        width: SCREEN_WIDTH - 20, 
        height: SCREEN_WIDTH - 20,
        borderRadius: (SCREEN_WIDTH - 20) / 2,
    },
    bio: {
        color: 'white', 
        marginHorizontal: 20, 
        alignSelf:'center', 
        marginTop: 10, 
        fontFamily: 'poppins'
    },
})


export default UserProfilePictureScreen