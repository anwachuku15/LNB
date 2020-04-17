import React, { useEffect, useState, useCallback } from 'react'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import ProductItem from '../../components/shop/ProductItem'
import * as cartActions from '../../redux/actions/cartActions'
import { fetchProducts } from '../../redux/actions/productsActions'
// REACT-NATIVE
import { Platform, Text, Button, FlatList, ActivityIndicator, View, StyleSheet } from 'react-native'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'


const ProductsOverviewScreen = props => {

    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState()
    // const products = useSelector(state => state.products.availableProducts)
    const products = useSelector(state => {
        const descending = state.products.availableProducts
        return descending.sort((a, b) => 
            a.id > b.id ? -1 : 1
        )
    })
    
    const dispatch = useDispatch()
    
    const loadProducts = useCallback(async () => {
        setError(null)
        setIsRefreshing(true)
        try {
            await dispatch(fetchProducts())
        } catch (err){
            setError(err.message)
        }
        setIsRefreshing(false)
    },[dispatch, setIsLoading, setError])

    // NAV LISTENER
    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus', 
            loadProducts
        )
        return () => {
            willFocusSub.remove()
        }
    }, [loadProducts])

    useEffect(() => {
        setIsLoading(true)
        loadProducts().then(() => {
            setIsLoading(false)
            
        })
    }, [dispatch, loadProducts])

    if (error) {
        return (
            <View style={styles.spinner}>
                <Text>An error occured</Text>
                <Button title='try again' onPress={loadProducts} color={Colors.primary}/>
            </View>
        )
    }
    if (isLoading) {
        return (
            <View style={styles.spinner}>
                <ActivityIndicator 
                    size='large'
                    color={Colors.primary}
                />
            </View>
        )
    }

    if (!isLoading && products.length === 0) {
        return (
            <View style={styles.spinner}>
                <Text>No products found.</Text>
            </View>
        )
    }


    const selectItemHandler = (id, title) => {
        props.navigation.navigate({
            routeName: 'ProductDetails',
            params: {
                productId: id,
                productTitle: title
            }
        })
    }

    const storedAuthData = async () => {
        const storage = await AsyncStorage.getItem('authData')
        // console.log(storage) 
    }
    return (
        <FlatList
            onRefresh={loadProducts}
            refreshing={isRefreshing}
            data={products}
            renderItem={itemData => (
                <ProductItem 
                    image={itemData.item.imageUrl} 
                    title={itemData.item.title}
                    price={itemData.item.price}
                    onSelect={() => {
                        selectItemHandler(itemData.item.id, itemData.item.title)
                    }}
                >
                    <Button 
                        title='View Details' 
                        onPress={() => {
                            selectItemHandler(itemData.item.id, itemData.item.title)
                        }}
                        color={Colors.coral}
                    />
                    <Button 
                        title='Add to Cart' 
                        onPress={() => {
                            dispatch(cartActions.addToCart(itemData.item))
                        }}
                        color={Colors.primary}
                    />
                </ProductItem>
            )}
        />
    )
}

ProductsOverviewScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'All Products',
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

export default ProductsOverviewScreen