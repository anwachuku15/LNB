import React from 'react'
import {
    Platform, 
    SafeAreaView,
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
import MessageIcon from '../../components/LNB/MessageIcon';
import { FontAwesome } from '@expo/vector-icons'

let themeColor
let text
const EventsScreen = props => {
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
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Back'
                        iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        onPress={() => {props.navigation.goBack()}}
                    />
                </HeaderButtons>
                <Text style={styles.headerTitle}>Events</Text>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        // ButtonElement={<MessageIcon/>}
                        iconName={Platform.OS==='android' ? 'md-more' : 'ios-more'}
                        title='more'
                        onPress={() => {}}
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


EventsScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Events'
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: themeColor
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingVertical: 12,
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


export default EventsScreen