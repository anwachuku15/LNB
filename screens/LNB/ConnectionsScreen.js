import React from 'react'
import { 
    Platform,
    View, 
    Text, 
    StyleSheet, 
    Image, 
    Button, 
    ScrollView 
} from 'react-native'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import { FontAwesome } from '@expo/vector-icons'

let themeColor
let text
const ConnectionsScreen = props => {
    const scheme = useColorScheme()
    let text
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
    } else {
        themeColor = 'white'
        text = 'black'
    }

    const dispatch = useDispatch()
    
    const userId = props.navigation.getParam('userId')
    const userName = props.navigation.getParam('userName')
    const auth = useSelector(state => state.auth)
    


    return (
        
        <View style={styles.screen}>
            <View style={styles.header}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Back'
                        iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        onPress={() => {props.navigation.goBack()}}
                    />
                </HeaderButtons>
                <Text style={styles.headerTitle}>{userName}</Text>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Direct'
                        iconName={Platform.OS==='android' ? 'md-more' : 'ios-more'}
                        onPress={() => {}}
                    />
                </HeaderButtons>
            </View>
            <View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
                <Text style={{color:Colors.socialdark}}>Under Construction</Text>
                <FontAwesome name='gears' size={40} style={{marginTop: 10}} color={Colors.primary} />
            </View>
        </View>

            
    )
}


ConnectionsScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Connections'
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
        paddingTop: 49,
        paddingBottom: 16,
        backgroundColor: themeColor,
        borderBottomColor: Colors.primary,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    header2: {
        // borderBottomWidth: 0.5,
        // shadowColor: Colors.primary,
        // shadowOffset: {height: 5},
        // shadowRadius: 15,
        // shadowOpacity: 0.26,
        // zIndex: 10
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500'
    },
})
export default ConnectionsScreen