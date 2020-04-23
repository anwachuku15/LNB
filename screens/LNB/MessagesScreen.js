import React from 'react'
import { 
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
// import { messaging } from 'firebase'


const MessagesScreen = props => {
    const scheme = useColorScheme()

    const dispatch = useDispatch()
    
    // const send = messaging

    const colorScheme = useColorScheme()
    let text
    let priceColor
    if (colorScheme === 'dark') {
        text = 'white'
    } else {
        text = 'black'
    }
    return (
        
        <View style={styles.screen}>
            <Text style={{color:text}}>Messages</Text>
        </View>

            
    )
}


MessagesScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Messages'
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})


export default MessagesScreen