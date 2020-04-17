import React, { useEffect, useState, useCallback } from 'react'
import firebase from 'firebase'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import ProductItem from '../../components/shop/ProductItem'
import * as cartActions from '../../redux/actions/cartActions'
import { fetchProducts } from '../../redux/actions/productsActions'
import { logout, getUserData } from '../../redux/actions/authActions'
// import {  } from '../../redux/action/authActions'
// REACT-NATIVE
import { Platform, TouchableOpacity, Text, Button, FlatList, ActivityIndicator, View, StyleSheet, Image, SafeAreaView } from 'react-native'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { Ionicons } from '@expo/vector-icons'
import Card from '../../components/LNB/Card'
import { db } from '../../Firebase/Fire'
import '@firebase/firestore'
import Fire from '../../Firebase/Firebase'

let themeColor
let text

const HomeScreen = props => {
    
    // console.log(Fire.shared.uid()
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
    } 
    if (scheme === 'light') {
        themeColor = 'white'
        text = 'black'
    }
    


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

    const user = useSelector(state => state.auth)

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
        // Clean up listener when function re-runs https://reactjs.org/docs/hooks-effect.html
        return () => {
            willFocusSub.remove()
        }
    }, [loadProducts])

    useEffect(() => {
        setIsLoading(true)
        loadProducts().then(() => {
            setIsLoading(false)
        })
        // return () => {
        //     loadProducts.remove()
        // }
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

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }
    
    const renderPost = (item) => {
        return (
            
            // <Card style={styles.feedItem}>
            //     <View style={styles.touchable}>
                    <TouchableCmp onPress={props.onSelect} useForeground>
                        <View style={styles.feedItem}>
                            <Image source={{uri: item.item.imageUrl}} style={styles.avatar} />
                            <View style={{flex: 1}}>
                                <View style={{flexDirection: 'row', justifyContent:'space-between', alignItems:'center'}}>
                                    <View>
                                        <Text style={styles.name}>{item.item.title}</Text>
                                        <Text style={styles.timestamp}>{item.item.price}</Text>
                                    </View>
                                    <Ionicons name='ios-more' size={24} color='#73788B'/>
                                </View>
                                <Text style={styles.post}>{item.item.description}</Text>
                                {/* <Image source={{uri: item.item.imageUrl}} style={styles.postImage} resizeMode='cover' /> */}
                                <Image source={{uri: user.credentials.imageUrl}} style={styles.postImage} resizeMode='cover'/>
                                <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
                                    <Ionicons name='ios-heart-empty' size={24} color='#73788B' style={{marginRight: 16}} />
                                    <Ionicons name='ios-chatboxes' size={24} color='#73788B' style={{marginRight: 16}} />
                                </View>
                            </View>
                        </View>
                    </TouchableCmp>
            //     </View>
            // </Card>
        )
    }
    return (
        
        <View style={styles.screen}>
            <View style={styles.header}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Direct'
                        iconName={Platform.OS==='android' ? 'md-menu' : 'ios-menu'}
                        onPress={() => {props.navigation.toggleDrawer()}}
                        // onPress={() => {
                            //     dispatch(logout)
                            //     props.navigation.navigate('Auth')
                            // }}
                            />
                </HeaderButtons>
                <Text style={styles.headerTitle}>Feed</Text>
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


            <FlatList
                onRefresh={loadProducts}
                refreshing={isRefreshing}
                style={styles.feed}
                data={products}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                renderItem={itemData => renderPost(itemData)}
            />
        
            {/* <FlatList
                onRefresh={loadProducts}
                refreshing={isRefreshing}
                style={styles.feed}
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
            /> */}
        </View>
    )
}

// HomeScreen.navigationOptions = (navData) => {
//     return {
//         headerTitle: 'All Products',
//         headerLeft: () => (
//             <HeaderButtons HeaderButtonComponent={HeaderButton}>
//                 <Item
//                     title='Menu'
//                     iconName={Platform.OS==='android' ? 'md-menu' : 'ios-menu'}
//                     onPress={() => {
//                         navData.navigation.toggleDrawer()
//                     }}
//                 />
//             </HeaderButtons>
//         ),
//         headerRight: () => (
//             <HeaderButtons HeaderButtonComponent={HeaderButton}>
//                 <Item
//                     title='Direct'
//                     iconName={Platform.OS==='android' ? 'md-chatboxes' : 'ios-chatboxes'}
//                     onPress={() => {
//                         navData.navigation.navigate({
//                             routeName: 'Cart',
//                         })
//                     }}
//                 />
//             </HeaderButtons>
//         )
//     }
// }


const styles = StyleSheet.create({
    touchable: {
        overflow: 'hidden',
        borderRadius: 10,
    },
    spinner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
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
    feed: {
        // marginHorizontal: 16
    },
    feedItem: {
        backgroundColor: '#FFF',
        borderRadius: 5,
        padding: 8,
        flexDirection: 'row',
        marginVertical: 5,
        backgroundColor: 'white',
        shadowColor: 'black',
        shadowOpacity: 0.26,
        shadowOffset: {width: 0, height: 2},
        // shadowRadius: 8,
        elevation: 5,
        // borderRadius: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 16
    },
    name: {
        fontSize: 15,
        fontWeight: '500',
        color: "#454D65",
    },
    timestamp: {
        fontSize: 11,
        color: '#C4C6CE',
        marginTop: 4
    },
    post: {
        marginTop: 16,
        fontSize: 14,
        color: '#838899'
    },
    postImage: {
        width: undefined,
        height: 150,
        borderRadius: 5,
        marginVertical: 16
    }
})

export default HomeScreen