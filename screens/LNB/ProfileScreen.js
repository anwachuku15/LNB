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

let themeColor
let text
const ProfileScreen = props => {
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
    } 
    if (scheme === 'light') {
        themeColor = 'white'
        text = 'black'
    }

    const productId = props.navigation.getParam('productId')
    const selectedProduct = useSelector(state => state.products.availableProducts.find(prod => prod.id === productId))
    const dispatch = useDispatch()
    
    return (
        
        <View style={styles.screen}>
            <View style={styles.header}>
                    <HeaderButtons HeaderButtonComponent={HeaderButton}>
                        <Item
                            title='Direct'
                            iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                            onPress={() => {props.navigation.goBack()}}
                            // onPress={() => {
                            //     dispatch(logout)
                            //     props.navigation.navigate('Auth')
                            // }}
                        />
                    </HeaderButtons>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <HeaderButtons HeaderButtonComponent={HeaderButton}>
                        <Item
                            title='Direct'
                            iconName={Platform.OS==='android' ? 'md-chatboxes' : 'ios-chatboxes'}
                            onPress={() => {
                                props.navigation.navigate('Messages')
                            }}
                        />
                    </HeaderButtons>
            </View>
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <Text style={{color:text}}>Profile</Text>
            </View>
        </View>

            
    )
}


ProfileScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Profile'
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: themeColor,
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


export default ProfileScreen