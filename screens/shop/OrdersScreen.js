import React, { useEffect, useState } from 'react'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import {fetchOrders} from '../../redux/actions/ordersActions'
// NATIVE
import { View, Text, FlatList, StyleSheet, Platform, ActivityIndicator } from 'react-native'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import OrderItem from '../../components/shop/OrderItem'
import Colors from '../../constants/Colors'
import {useColorScheme} from 'react-native-appearance'


const OrdersScreen = props => {
    const scheme = useColorScheme()
    let text
    if (scheme === 'dark') {
        text = 'white'
        button = Colors.primary
    } else {
        text = 'black'
        button = '#F4A850'
    }
    const [isLoading, setIsLoading] = useState(false)
    

    const orders = useSelector(state => {
        const descendingOrders = state.orders.orders
        return descendingOrders.sort((a, b) => 
            a.date > b.date ? -1 : 1
        )
    })
    const dispatch = useDispatch()

    // add error handling
    useEffect(() => {
        setIsLoading(true)
        dispatch(fetchOrders()).then(() => {
            setIsLoading(false)
        })
    }, [dispatch])

    if (isLoading) {
        return (
            <View style={styles.spinner}>
                <ActivityIndicator size='large' color={Colors.primary} />
            </View>
        )
    }

    
    
    

    if (orders.length === 0) {
        return (
            <View style={{flex: 1, justifyContent:'center', alignItems:'center'}}>
                <Text style={{color:text, marginBottom:500}}>You haven't placed any orders yet.</Text>
            </View>
        )
    }

    return (
        <FlatList
            data={orders}
            keyExtractor={item => item.id}
            renderItem={itemData => (
                <OrderItem 
                    amount={itemData.item.totalAmount} 
                    price={itemData.item.price}
                    date={itemData.item.readableDate}
                    items={itemData.item.items}
                /> 
            )}
        />
    )
}

OrdersScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Your Orders',
        headerLeft: () => (
            <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item
                    title='Menu'
                    iconName={Platform.OS==='android' ? 'md-menu' : 'ios-menu'}
                    onPress={() => {
                        navData.navigation.toggleDrawer()
                    }}
                />
            </HeaderButtons>
        ),
        headerRight: () => (
            <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item
                    title='Direct'
                    iconName={Platform.OS==='android' ? 'md-chatboxes' : 'ios-chatboxes'}
                    onPress={() => {
                        navData.navigation.navigate({
                            routeName: 'Cart',
                        })
                    }}
                />
            </HeaderButtons>
        )
    }
}

const styles = StyleSheet.create({
    spinner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default OrdersScreen