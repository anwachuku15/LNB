import React, { useCallback, useState } from 'react'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import * as cartActions from '../../redux/actions/cartActions'
import * as orderActions from '../../redux/actions/ordersActions'
// REACT-NATIVE
import { Platform, FlatList, Text, View, Image, StyleSheet, Button, ActivityIndicator, TouchableOpacity } from 'react-native'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import ProductItem from '../../components/shop/ProductItem'
import HeaderButton from '../../components/UI/HeaderButton'
import Colors from '../../constants/Colors'
import CartItem from '../../components/shop/CartItem'
import Card from '../../components/UI/Card'
import { useColorScheme } from 'react-native-appearance'

const CartScreen = props => {
    
    const [isLoading, setIsLoading] = useState(false)
    // const [error, setError] = useState()
    
    const dispatch = useDispatch()
    const cartTotalAmount = useSelector(state => state.cart.totalAmount)
    const cartItems = useSelector(state => {
        const cartArray = []
        for (const key in state.cart.items) {
            cartArray.push({
                productId: key,
                productTitle: state.cart.items[key].productTitle,
                productPrice: state.cart.items[key].productPrice,
                quantity: state.cart.items[key].quantity,
                sum: state.cart.items[key].sum
            })
        }
        return cartArray
    })

    const sendOrderHandler = async () => {
        setIsLoading(true)
        await dispatch(orderActions.addOrder(cartItems, cartTotalAmount))
        setIsLoading(false)
        props.navigation.navigate('ProductsOverview')
    }
    

    const scheme = useColorScheme()
    let disabled
    let enabled
    let text
    if(scheme === 'dark') {
        disabled = '#3A3A3A'
        enabled = Colors.primaryColor
        text = 'white'
    } else {
        disabled = '#CDCDCD'
        enabled = 'turquoise'
        text = 'black'
    }

    return (
        <View style={styles.screen}>
            <Card style={styles.summary}>
                <Text style={styles.summaryText}>
                    Total:  <Text style={styles.amount}>
                                ${Math.round((cartTotalAmount.toFixed(2) * 100) / 100).toFixed(2)}
                            </Text>
                </Text>
                {isLoading ? (
                    <ActivityIndicator size='small' color={Colors.primary} />
                ) : (
                    Platform.OS === 'android' ? (
                        <Button
                            title='Order Now'
                            color={enabled}
                            disabled={cartItems.length === 0}
                            onPress={sendOrderHandler}
                        />
                    ) : (
                        <TouchableOpacity
                            disabled={cartItems.length === 0}
                            onPress={sendOrderHandler}
                        >
                            <Text style={{...styles.iOSbutton, color: cartItems.length === 0 ? disabled : enabled}} >Order Now</Text>
                        </TouchableOpacity>
                    )
                )}
            </Card>
            <View style={{height:1, backgroundColor:'gray'}} />
            {cartItems.length === 0 ? (
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{color:'white'}}>Your cart is empty</Text>
                    </View>
                ) : (
                    <FlatList 
                        contentContainerStyle={{height: '100%', }}
                        data={cartItems}
                        keyExtractor={item => item.productId}
                        renderItem={itemData => (
                            <CartItem
                                deletable
                                quantity={itemData.item.quantity}
                                title={itemData.item.productTitle}
                                amount={itemData.item.sum}
                                onRemove={() => {
                                    dispatch(cartActions.removeOne(itemData.item.productId))
                                }}
                            />
                        )}
                    />
            )}
        </View>
    )
}

CartScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Direct',
        headerLeft: () => (
            <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item
                    title='Go Back'
                    iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                    onPress={() => {
                        navData.navigation.navigate({
                            routeName: 'Overview'
                        })
                    }}
                />
            </HeaderButtons>
        ),
    }
}

const styles = StyleSheet.create({
    screen: {
        margin: 20,
    },
    summary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        padding: 10,
    },
    summaryText: {
        fontFamily: 'open-sans-bold',
        fontSize: 18,
        color: Colors.primary,
    },
    amount: {
        color: Colors.orange,
    },
    iOSbutton: {
        fontSize: 18, 
        padding: 8, 
        textAlign: 'center'
    }
})

export default CartScreen