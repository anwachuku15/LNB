import React from 'react'
import { 
    View, 
    Text, 
    StyleSheet,
    Image, 
    Button, 
    ScrollView 
} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import Placeholder from '../../components/UI/HeaderButtonPlaceholder'
import MessageIcon from '../../components/LNB/MessageIcon'
import { CheckBox } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons'
import TouchableCmp from '../../components/LNB/TouchableCmp'
// import LinearGradient from 'react-native-linear-gradient'

let themeColor
let text

const AdminScreen = props => {
    const scheme = useColorScheme()

    const dispatch = useDispatch()
    
    const CheckMark = () => (
        <Ionicons
            name='ios-checkmark-circle'
            size={16}
            color={Colors.blue}
        />
    )

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
        
        <View style={styles.screen}>
            <View style={styles.header}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Direct'
                        iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        onPress={() => {props.navigation.pop()}}
                    />
                </HeaderButtons>
                <Text style={styles.headerTitle}>Admin</Text>
                <HeaderButtons HeaderButtonComponent={Placeholder}>
                    <Item
                        title='Messages'
                        iconName='md-more'
                    />
                </HeaderButtons>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{paddingRight:10}}>
                <TouchableCmp 
                    style={{...styles.adminButton, backgroundColor:Colors.primaryColor}}
                    onPress={() => {
                        props.navigation.navigate('CreateAnnouncement')
                    }}
                >
                    <Text style={{color:'white', fontWeight:'bold', fontSize: 18}}>Make Announcement</Text>
                </TouchableCmp>
            </ScrollView>
        </View>

            
    )
}


AdminScreen.navigationOptions = (navData) => {
    const background = navData.screenProps.theme
    return {
        // headerLeft: () => (
        //     <HeaderButtons HeaderButtonComponent={HeaderButton}>
        //         <Item
        //             title='Back'
        //             iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
        //             onPress={() => {navData.navigation.pop()}}
        //         />
        //     </HeaderButtons>
        // ),
        // headerTitle: 'Admin',
        // headerTitleStyle: {
        //     fontFamily: 'open-sans-bold',
        // },
        // headerBackTitleStyle: {
        //     fontFamily: 'open-sans',
        // },
        // headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primary,
        // headerBackTitleVisible: false,
        // headerStyle: {
        //     backgroundColor: background === 'dark' ? 'black' : 'white'
        // },
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    adminButton: {
        justifyContent: 'center',
        alignSelf:'flex-start',
        marginLeft: 10,
        marginTop: 10,
        padding: 10,
        borderRadius: 10

    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingTop: 49,
        paddingBottom: 16,
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
})
export default AdminScreen