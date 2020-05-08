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
import MessageIcon from '../../components/LNB/MessageIcon';

let themeColor
let text
const BulletinScreen = props => {
    const scheme = useColorScheme()

    const productId = props.navigation.getParam('productId')
    const selectedProduct = useSelector(state => state.products.availableProducts.find(prod => prod.id === productId))
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
        
        <View style={styles.screen}>
            <View style={styles.header}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Direct'
                        iconName={Platform.OS==='android' ? 'md-menu' : 'ios-menu'}
                        onPress={() => {props.navigation.toggleDrawer()}}
                    />
                </HeaderButtons>
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
                <Text style={{color:text}}>Bulletin</Text>
            </View>
        </View>
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
        backgroundColor: themeColor
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingTop: 49,
        paddingBottom: 16,
        backgroundColor: themeColor,
        borderBottomColor: Colors.primary,
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500'
    },
})


export default BulletinScreen