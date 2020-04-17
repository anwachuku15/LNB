import React from 'react'
import { useDispatch } from 'react-redux'
import { logout } from '../redux/actions/authActions'

import { Platform, View, Button, SafeAreaView } from 'react-native'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { createStackNavigator, } from 'react-navigation-stack'
import { createDrawerNavigator, DrawerNavigatorItems,} from 'react-navigation-drawer'
import { createMaterialTopTabNavigator, createBottomTabNavigator } from 'react-navigation-tabs'
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs'

import Animated, { Easing } from 'react-native-reanimated';

import Colors from '../constants/Colors'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../components/UI/HeaderButton'

import ProductsOverviewScreen from '../screens/shop/ProductsOverviewScreen'
import ProductDetailScreen from '../screens/shop/ProductDetailScreen'
import UserProductsScreen from '../screens/user/UserProductsScreen'
import CartScreen from '../screens/shop/CartScreen'
import OrdersScreen from '../screens/shop/OrdersScreen'
import EditProductScreen from '../screens/user/EditProductScreen'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import AuthScreen from '../screens/user/AuthScreen'
import LoadingScreen from '../screens/LoadingScreen'
import DirectoryScreen from '../screens/LNB/DirectoryScreen'
import NeedsFeedScreen from '../screens/LNB/NeedsFeedScreen'
import CreatePostScreen from '../screens/LNB/CreatePostScreen'
import NotificationsScreen from '../screens/LNB/NotificationsScreen'

const defaultNavOptions = {
    // headerStyle: {
    //     backgroundColor: Platform.OS === 'android' ? Colors.primary : ''
    // },
    headerTitleStyle: {
        fontFamily: 'open-sans-bold',
    },
    headerBackTitleStyle: {
        fontFamily: 'open-sans',
    },
    headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primary,
    headerBackTitleVisible: false
}

// ---- SCREENS ---- //
const ProductsOverview = createStackNavigator({
    Overview: {
        screen: ProductsOverviewScreen,
    }
}, {
    defaultNavigationOptions: defaultNavOptions,
    navigationOptions: {
        drawerIcon: drawerConfig => (
            <Ionicons
                name={Platform.OS==='android' ? 'md-menu' : 'ios-menu'}
                size={23}
                color={drawerConfig.tintColor}
            />
        )
    },
})

const Cart = createStackNavigator({
    Cart: {
        screen: CartScreen,
    }
}, {
    defaultNavigationOptions: defaultNavOptions
})

const Details = createStackNavigator({
    ProductDetails: {
        screen: ProductDetailScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 500
            },
        }
    }
}, {
    defaultNavigationOptions: defaultNavOptions
})

const OrdersNavigator = createStackNavigator({
       Orders: {
           screen: OrdersScreen,
       } 
    }, {
    navigationOptions: {
        drawerIcon: drawerConfig => (
            <Ionicons
                name={Platform.OS==='android' ? 'md-list' : 'ios-list'}
                size={23}
                color={drawerConfig.tintColor}
            />
        )
    },
    defaultNavigationOptions: defaultNavOptions
})

const AdminNavigator = createStackNavigator({
    UserProducts: {
        screen: UserProductsScreen,
    },
    EditProduct: {
        screen: EditProductScreen
    }
    }, {
    navigationOptions: {
        drawerIcon: drawerConfig => (
            <Ionicons
                name={Platform.OS==='android' ? 'md-create' : 'ios-create'}
                size={23}
                color={drawerConfig.tintColor}
            />
        )
    },
    defaultNavigationOptions: defaultNavOptions
})

const AuthNavigator = createStackNavigator({
    Auth: AuthScreen
}, {
    defaultNavigationOptions: defaultNavOptions
})

const Directory = createStackNavigator({
    Directory: {
        screen: DirectoryScreen
    }
}, {
    defaultNavigationOptions: defaultNavOptions
})

const CreatePost = createStackNavigator({
    CreatePost: {
        screen: CreatePostScreen,
    }
}, {
    mode: 'modal',
    defaultNavigationOptions: defaultNavOptions
})

const Notifications = createStackNavigator({
    Notifications: {
        screen: NotificationsScreen
    }
}, {
    defaultNavigationOptions: defaultNavOptions
})

const NeedsFeed = createStackNavigator({
    NeedsFeed: {
        screen: NeedsFeedScreen
    }
}, {
    defaultNavigationOptions: defaultNavOptions
})


// ----- NAVIGATIONS ----- //
const ProductsAndDrawer = createDrawerNavigator({
    Products: {
        screen: ProductsOverview
    },
    Orders: OrdersNavigator,
    Admin: AdminNavigator
}, {
    edgeWidth: 300, 
    contentOptions: {
        activeTintColor: Colors.primary,
    },
    navigationOptions: {
        drawerIcon: drawerConfig => (
            <Ionicons
                name={Platform.OS==='android' ? 'md-chatboxes' : 'ios-chatboxes'}
                size={23}
                color={drawerConfig.tintColor}
            />
        )
    },
    contentComponent: props => {
        const dispatch = useDispatch()
        return (
            <View style={{flex:1, paddingTop:20}}>
                <SafeAreaView forceInset={{top:'always', horizontal:'never'}}>
                    {/* Profile pic & navToProfile */}
                    <DrawerNavigatorItems {...props} />
                    <Button 
                        title='Logout' 
                        color={Colors.primary}
                        onPress={() => {
                            dispatch(logout)
                            props.navigation.navigate('Auth')
                        }}
                    />
                </SafeAreaView>
            </View>
        )
    }
})

// ----- BOTTOM TABS ----- //
const tabScreenConfig = {
    Home: {
        screen: ProductsAndDrawer,
        navigationOptions: {
            tabBarIcon: (tabInfo) => {
                return (
                    <Ionicons 
                        name='ios-home' 
                        size={25} 
                        color={tabInfo.tintColor}
                    />
                )
            },
            tabBarColor: Colors.primaryColor,
            tabBarLabel: Platform.OS === 'android' 
                            ? <Text style={{fontFamily: 'open-sans-bold'}}>Home</Text>
                            : 'Home'
        }
    },
    Directory: {
        screen: Directory,
        navigationOptions: {
            tabBarLabel: 'Directory',
            tabBarIcon: (tabInfo) => {
                return (
                    <Ionicons 
                        name={Platform.OS ==='android' ? 'md-people' : 'ios-people'}
                        size={25} 
                        color={tabInfo.tintColor}
                    />
                )
            },
            tabBarColor: Colors.secondaryColor,
            tabBarLabel: Platform.OS === 'android' 
                            ? <Text style={{fontFamily: 'open-sans-bold'}}>Directory</Text>
                            : 'Directory'
        }
    },
    Post: {
        screen: CreatePost,
        navigationOptions: {
            tabBarIcon: (tabInfo) => {
                return (
                    <Ionicons 
                        name={Platform.OS==='android' ? 'md-add-circle-outline' : 'ios-add-circle-outline'} 
                        size={25} 
                        color={tabInfo.tintColor}
                    />
                )
            },
            tabBarColor: Colors.primaryColor,
            tabBarLabel: Platform.OS === 'android' 
                            ? <Text style={{fontFamily: 'open-sans-bold'}}>Post</Text>
                            : 'Post'
        }
    },
    Notifications: {
        screen: Notifications,
        navigationOptions: {
            tabBarIcon: (tabInfo) => {
                return (
                    <Ionicons 
                        name={Platform.OS==='android' ? 'md-notifications-outline' : 'ios-notifications-outline'} 
                        size={25} 
                        color={tabInfo.tintColor}
                    />
                )
            },
            tabBarColor: Colors.primaryColor,
            tabBarLabel: Platform.OS === 'android' 
                            ? <Text style={{fontFamily: 'open-sans-bold'}}>Notifications</Text>
                            : 'Notifications'
        }
    },
    NeedsFeed: {
        screen: NeedsFeed,
        navigationOptions: {
            tabBarIcon: (tabInfo) => {
                return (
                    <FontAwesome 
                        name='handshake-o' 
                        size={25} 
                        color={tabInfo.tintColor}
                    />
                )
            },
            tabBarColor: Colors.primaryColor,
            tabBarLabel: Platform.OS === 'android' 
                            ? <Text style={{fontFamily: 'open-sans-bold'}}>Connect</Text>
                            : 'Connect'
        }
    }
}

const BottomTabNavigator = Platform.OS === 'android' 
        ? createMaterialBottomTabNavigator(
            tabScreenConfig, {
            activeColor: 'white',
            barStyle: {
                backgroundColor: Colors.primary
            },
            shifting: true,
        }) 
        : createBottomTabNavigator(
            tabScreenConfig, {
            initialRouteName: 'Home',
            tabBarOptions: {
                labelStyle: {
                    fontFamily: 'open-sans-bold'
                },
                tabStyle: {
                    // height: 20
                },
                activeTintColor: Colors.primary,
            }
        })
// ----- BOTTOM TABS ----- //

const BottomStack = createStackNavigator({
    Overview: {
        screen: BottomTabNavigator,
        navigationOptions: {
            tabBarOnPress: ({navigation, defaultHandler}) => {
                if (navigation.state.key === 'postModal') {
                    navigation.navigate('postModal')
                    
                } else {
                    defaultHandler()
                }
                console.log('key: ' + navigation.state.key)
            }
        }
    },
    postModal: {
        screen: CreatePost
    }
}, {
    mode: 'modal',
    headerMode: "none"
})



const NewTabs = createMaterialTopTabNavigator({
    Overview: {
        // screen: BottomStack
        screen: BottomTabNavigator
    },
    Cart: {
        screen: Cart,
        navigationOptions: {
            swipeEnabled: true,
        }
    }
}, {
    swipeDistanceThreshold: 500,
    tabBarOptions: {
        style: {height:0}
    }
})

const NewTabAndDetails = createStackNavigator({
    ProductCartTab: {
        screen: NewTabs,
        navigationOptions: {
            headerStyle: {height: 0}
        }
    },
    ProductDetails: {
        screen: Details,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 500
            },
        },
    },
}, {
    headerMode: 'none',
    navigationOptions: {
        drawerIcon: drawerConfig => (
            <Ionicons
                name={Platform.OS==='android' ? 'md-cart' : 'ios-add'}
                size={23}
                color={drawerConfig.tintColor}
            />
        ),
    },
    defaultNavigationOptions: defaultNavOptions,
})

const NewProductsToCartNavigator = createMaterialTopTabNavigator({
    Home: {
        screen: NewTabAndDetails,
    }
}, {
    initialRouteName: 'Home',
    swipeEnabled: true,
    swipeDistanceThreshold: 500,
    tabBarPosition: 'top',
    tabBarOptions: {
        showLabel: true,
        showIcon: false,
        style: { height: 0}
    },
    navigationOptions: {
        drawerIcon: drawerConfig => (
            <Ionicons
                name={Platform.OS==='android' ? 'md-chatboxes' : 'ios-chatboxes'}
                size={23}
                color={drawerConfig.tintColor}
            />
        )
    },
})


// ----- SWITCH ----- //
const MainNavigator = createSwitchNavigator({
    Loading: LoadingScreen,
    Auth: AuthNavigator,
    Shop: NewProductsToCartNavigator,
})

export default createAppContainer(MainNavigator)