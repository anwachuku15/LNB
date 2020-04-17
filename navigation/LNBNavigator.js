import React from 'react'
import { useDispatch } from 'react-redux'
import { logout } from '../redux/actions/authActions'

import { Platform, View, Button, SafeAreaView, StyleSheet, Image, Text, ScrollView, TouchableOpacity} from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { createStackNavigator, } from 'react-navigation-stack'
import { createDrawerNavigator, DrawerNavigatorItems,} from 'react-navigation-drawer'
import { createMaterialTopTabNavigator, createBottomTabNavigator } from 'react-navigation-tabs'
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs'

import Animated, { Easing } from 'react-native-reanimated';

import Colors from '../constants/Colors'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../components/UI/HeaderButton'

import HomeScreen from '../screens/LNB/HomeScreen'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import AuthScreen from '../screens/user/AuthScreen'
import LoadingScreen from '../screens/LoadingScreen'
import DirectoryScreen from '../screens/LNB/DirectoryScreen'
import NeedsFeedScreen from '../screens/LNB/NeedsFeedScreen'
import CreatePostScreen from '../screens/LNB/CreatePostScreen'
import NotificationsScreen from '../screens/LNB/NotificationsScreen'
import MessagesScreen from '../screens/LNB/MessagesScreen'
import ProfileScreen from '../screens/LNB/ProfileScreen'
import SettingsScreen from '../screens/LNB/SettingsScreen'
import DrawerScreen from '../screens/LNB/DrawerScreen'
import ProductDetailScreen from '../screens/shop/ProductDetailScreen'

export const defaultNavOptions = {
    headerTitleStyle: {
        fontFamily: 'open-sans-bold',
    },
    headerBackTitleStyle: {
        fontFamily: 'open-sans',
    },
    headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primary,
    headerBackTitleVisible: false
}

const HomeStack = createStackNavigator({
    Home: {
        screen: HomeScreen
    },
    Profile: {
        screen: ProfileScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    Settings: {
        screen: SettingsScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
}, {headerMode:'none'})

const DirectoryStack = createStackNavigator({
    Directory: {
        screen: DirectoryScreen,
    },
    Profile: {
        screen: ProfileScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    }
}, {headerMode:'none'})

const NotificationsStack = createStackNavigator({
    Notifications: {
        screen: NotificationsScreen,
    },
    Profile: {
        screen: ProfileScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    }
}, {headerMode:'none'})

const NeedsFeedStack = createStackNavigator({
    NeedsFeed: {
        screen: NeedsFeedScreen,
    },
    Profile: {
        screen: ProfileScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    }
}, {headerMode:'none'})

const BottomTabStackContainer = createStackNavigator({
    default: createBottomTabNavigator({
        Home: {
            screen: HomeStack,
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
            screen: DirectoryStack,
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
            screen: CreatePostScreen,
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
            screen: NotificationsStack,
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
            screen: NeedsFeedStack,
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
    }, {
        defaultNavigationOptions: {
            tabBarOnPress: ({navigation, defaultHandler}) => {
                if (navigation.state.key === 'Post') {
                    navigation.navigate('postModal')
                } else {
                    defaultHandler()
                }
            }
        },
        tabBarOptions: {
            activeTintColor: Colors.primary
        }
    }),
    postModal: {
        screen: CreatePostScreen
    },
}, {
    mode: 'modal',
    headerMode: 'none',
})


const MessagesStack = createStackNavigator({
    Messages: {
        screen: MessagesScreen
    }
}, {
    defaultNavigationOptions: defaultNavOptions
})



const DrawerNav = createDrawerNavigator({
    Main: {
        screen: BottomTabStackContainer,
    },
}, {
    edgeWidth: 400,
    drawerWidth: 320,
    contentOptions: {
        activeTintColor: Colors.primary
    },
    contentComponent: (props) => {
        const dispatch = useDispatch()
        return (
            <View style={{flex:1, paddingTop:20}}>
                <DrawerScreen navigation={props.navigation}/>
                <SafeAreaView forceInset={{top:'always', horizontal:'never'}}>
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


// If current page is stacked on top of root tab screens or postModal is open
BottomTabStackContainer.navigationOptions = ({navigation}) => {
    let drawerLockMode = 'unlocked'
    if (navigation.state.routes[0].routes[0]['index'] > 0 || navigation.state.routes.length > 1) {
        drawerLockMode = 'locked-closed'
    }
    return {
        drawerLockMode
    }
}

// Disable swipe to Messages if the Drawer or Post Modal is open
DrawerNav.navigationOptions = ({navigation}) => {
    let swipeEnabled = true
    if (navigation.state.isDrawerOpen || navigation.state.routes[0].routes.length > 1) {
        swipeEnabled = false
    } else {
        swipeEnabled = true
    }
    return {
        swipeEnabled
    }
}


const SwipeTabNavigator = createMaterialTopTabNavigator({
    Drawer: {
        screen: DrawerNav
    },
    Messages: {
        screen: MessagesStack
    }
}, {
    tabBarOptions: {
        style: {height: 0}
    }
})


const AuthNavigator = createStackNavigator({
    Auth: AuthScreen
}, {
    defaultNavigationOptions: defaultNavOptions
})

// ----- SWITCH ----- //
const MainNavigator = createSwitchNavigator({
    Loading: LoadingScreen,
    Auth: AuthNavigator,
    App: SwipeTabNavigator
})



export default createAppContainer(MainNavigator)