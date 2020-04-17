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

import * as cartActions from '../../redux/actions/cartActions'

const ProductDetailScreen = props => {
    const scheme = useColorScheme()

    const productId = props.navigation.getParam('productId')
    const selectedProduct = useSelector(state => state.products.availableProducts.find(prod => prod.id === productId))
    const dispatch = useDispatch()
    
    return (
        <ScrollView>
            <Image style={styles.image} source={{uri: selectedProduct.imageUrl}}/>

            <View style={styles.buttons}>
                <Button 
                    title='Add to Cart' 
                    color={Colors.primary} 
                    onPress={() => {dispatch(cartActions.addToCart(selectedProduct))}} 
                />
            </View>

            <Text style={styles.price}>${selectedProduct.price.toFixed(2)}</Text>
            <Text style={styles.description}>{selectedProduct.description}</Text>
        </ScrollView>
    )
}

ProductDetailScreen.navigationOptions = navData => {
    return {
        headerTitle: navData.navigation.getParam('productTitle'),
        headerLeft: () => {
            return (
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Go Back'
                        iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        onPress={() => {
                            navData.navigation.navigate({
                                routeName: 'ProductCartTab'
                            })
                        }}
                    />
                </HeaderButtons>
            )
        }
    }
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 300
    },
    buttons: {
        marginVertical: 10,
        alignItems: 'center'
    },
    price: {
        fontSize: 20,
        color: Colors.gunmetal,
        textAlign: 'center',
        marginVertical: 20,
        fontFamily: 'open-sans-bold'
    },
    description: {
        fontSize: 14,
        marginVertical: 20,
        marginHorizontal: 20,
        textAlign: 'center',
        fontFamily: 'open-sans'
    },
})

export default ProductDetailScreen