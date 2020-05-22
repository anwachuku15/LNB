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
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import MessageIcon from '../../components/LNB/MessageIcon';
import { FontAwesome } from '@expo/vector-icons'
import MenuAvatar from '../../components/LNB/MenuAvatar'

let themeColor
let text
const BulletinScreen = props => {
    const scheme = useColorScheme()

    const authUser = useSelector(state => state.auth.credentials)
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
    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }
    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <View>
                    <MenuAvatar 
                        toggleDrawer={() => props.navigation.toggleDrawer()}
                    />
                </View>
                <Text style={styles.headerTitle}>Bulletin</Text>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        ButtonElement={<MessageIcon/>}
                        title='Messages'
                        onPress={() => {
                            props.navigation.navigate('Messages')
                        }}
                    />
                </HeaderButtons>
            </View>
            <View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
                <Text style={{color:Colors.socialdark}}>Under Construction</Text>
                <FontAwesome name='gears' size={40} style={{marginTop: 10}} color={Colors.primary} />
            </View>
        </SafeAreaView>
    )
}


BulletinScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Bulletin'
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingVertical: 10.6,
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
})


export default BulletinScreen