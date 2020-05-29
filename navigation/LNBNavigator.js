import React from 'react'
import { useDispatch } from 'react-redux'
import { logout } from '../redux/actions/authActions'

import { Platform, View, Button, SafeAreaView, Text } from 'react-native'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import { createDrawerNavigator } from 'react-navigation-drawer'
import { createMaterialTopTabNavigator, createBottomTabNavigator } from 'react-navigation-tabs'

import { createSharedElementStackNavigator } from 'react-navigation-shared-element'

import Colors from '../constants/Colors'

import HomeScreen from '../screens/LNB/HomeScreen'
import { Ionicons, FontAwesome, SimpleLineIcons, Feather, Entypo, AntDesign } from '@expo/vector-icons'
import AuthScreen from '../screens/user/AuthScreen'
import LoadingScreen from '../screens/LoadingScreen'
import AnnouncementsScreen from '../screens/LNB/AnnouncementsScreen'
import ConnectScreen from '../screens/LNB/ConnectScreen'
import CreatePostScreen from '../screens/LNB/CreatePostScreen'
import NotificationsScreen from '../screens/LNB/NotificationsScreen'
import MessagesScreen from '../screens/LNB/MessagesScreen'
import SettingsScreen from '../screens/LNB/SettingsScreen'
import DrawerScreen from '../screens/LNB/DrawerScreen'
import EditProfileScreen from '../screens/LNB/EditProfileScreen'
import UserProfileScreen from '../screens/LNB/UserProfileScreen'
import CreateCommentScreen from '../screens/LNB/CreateCommentScreen'
import ChatScreen from '../screens/LNB/ChatScreen'
import NotificationIcon from '../components/LNB/NotificationIcon'
import PostDetailScreen from '../screens/LNB/PostDetailScreen'
import EventsScreen from '../screens/LNB/EventsScreen'
import AdminScreen from '../screens/LNB/AdminScreen'
import ConnectionsScreen from '../screens/LNB/ConnectionsScreen'
import ConnectRequestsScreen from '../screens/LNB/ConnectRequestsScreen'
import UserProfilePictureScreen from '../screens/LNB/UserProfilePictureScreen'
// import ConnectIcon from '../components/LNB/ConnectIcon'

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
    PostDetail: {
        screen: PostDetailScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    EditProfile: {
        screen: EditProfileScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            },
            
        }
    },
    UserProfile: {
        screen: UserProfileScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    UserProfilePicture: {
        screen: UserProfilePictureScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    // sharedUserProfile: createSharedElementStackNavigator({
    //     UserProfile: {
    //         screen: UserProfileScreen,
    //         navigationOptions: {
    //             gestureResponseDistance: {
    //                 horizontal: 300
    //             }
    //         }
    //     },
    //     UserProfilePicture: {
    //         screen: UserProfilePictureScreen,
    //         navigationOptions: {
    //             gestureResponseDistance: {
    //                 horizontal: 300
    //             }
    //         }
    //     },
    // }, {
    //     headerMode: 'none',
    //     initialRouteName: 'UserProfile',
    //     defaultNavigationOptions: {
    //         cardStyle: {
    //             backgroundColor: 'transparent'
    //         }
    //     }
    // }),
    Connections: {
        screen: ConnectionsScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    ChatScreen: {
        screen: ChatScreen,
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
    Events: {
        screen: EventsScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    Admin: {
        screen: AdminScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    Comment: {
        screen: CreateCommentScreen
    }
}, {
    headerMode:'none',
})




const AnnouncementsStack = createStackNavigator({
    Announcements: {
        screen: AnnouncementsScreen,
    },
    UserProfile: {
        screen: UserProfileScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    UserProfilePicture: {
        screen: UserProfilePictureScreen,
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
    Events: {
        screen: EventsScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    Admin: {
        screen: AdminScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
}, {headerMode:'none'})

const NotificationsStack = createStackNavigator({
    Notifications: {
        screen: NotificationsScreen,
    },
    UserProfile: {
        screen: UserProfileScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    UserProfilePicture: {
        screen: UserProfilePictureScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    PostDetail: {
        screen: PostDetailScreen,
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
    Events: {
        screen: EventsScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    Admin: {
        screen: AdminScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
}, {headerMode:'none'})

const ConnectStack = createStackNavigator({
    Connect: {
        screen: ConnectScreen
    },
    UserProfile: {
        screen: UserProfileScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    UserProfilePicture: {
        screen: UserProfilePictureScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    ConnectRequests: {
        screen: ConnectRequestsScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    Connections: {
        screen: ConnectionsScreen,
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
    Events: {
        screen: EventsScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    Admin: {
        screen: AdminScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
}, {headerMode: 'none'})

const BottomTabStackContainer = createStackNavigator({
    default: createBottomTabNavigator({
        Home: {
            screen: HomeStack,
            navigationOptions: {
                tabBarIcon: (tabInfo) => {
                    return (
                        <Feather 
                            name='home' 
                            size={23} 
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
        Announcements: {
            screen: AnnouncementsStack,
            navigationOptions: {
                tabBarLabel: 'Announcements',
                tabBarIcon: (tabInfo) => {
                    return (
                        <AntDesign 
                            name='notification'
                            size={23} 
                            color={tabInfo.tintColor}
                        />
                    )
                },
                tabBarColor: Colors.secondaryColor,
                tabBarLabel: Platform.OS === 'android' 
                                ? <Text style={{fontFamily: 'open-sans-bold'}}>Announcements</Text>
                                : 'Announcements'
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
                        <NotificationIcon tabInfo={tabInfo} />
                    )
                },
                tabBarColor: Colors.primaryColor,
                tabBarLabel: Platform.OS === 'android' 
                                ? <Text style={{fontFamily: 'open-sans-bold'}}>Notifications</Text>
                                : 'Notifications'
            }
        },
        Connect: {
            screen: ConnectStack,
            navigationOptions: {
                tabBarIcon: (tabInfo) => {
                    return (
                        <FontAwesome 
                            name='handshake-o' 
                            size={23} 
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
            activeTintColor: Colors.primary,
            keyboardHidesTabBar: false,
            showLabel: false
        }
    }),
    postModal: {
        screen: CreatePostScreen
    },
}, {
    mode: 'modal',
    headerMode: 'none',
})

const SwipeableUserProfile = createMaterialTopTabNavigator({
    Main: UserProfileScreen,
    Picture: UserProfilePictureScreen
}, {
    swipeEnabled: true,
    tabBarOptions: {
        style: {display: 'none'}
    }
})

const MessagesStack = createStackNavigator({
    MessagesScreen: {
        screen: MessagesScreen,
    },
    ChatScreen: {
        screen: ChatScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    UserProfile: {
        screen: UserProfileScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    }
}, {headerMode: 'none'})

const DrawerNav = createDrawerNavigator({
    Main: {
        screen: BottomTabStackContainer,
    },
}, {
    edgeWidth: 200,
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
                            dispatch(logout())
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

// Disable swipe to Messages if the Drawer or Post Modal is open or if HomeStack is past home page
DrawerNav.navigationOptions = ({navigation}) => {
    let swipeEnabled = true
    const HomeStack = navigation.state.routes[0].routes[0].routes[0]
    const AnnouncementsStack = navigation.state.routes[0].routes[0].routes[1]
    const NotificationsStack = navigation.state.routes[0].routes[0].routes[3]
    const ConnectStack = navigation.state.routes[0].routes[0].routes[4]
    
    if (
        navigation.state.isDrawerOpen || 
        navigation.state.routes[0].routes.length > 1 || 
        HomeStack.index > 0 ||
        AnnouncementsStack.index > 0 ||
        NotificationsStack.index > 0 ||
        ConnectStack.index > 0
    ) {
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
        style: {height: 0},
    }
})

MessagesStack.navigationOptions = ({navigation}) => {
    let swipeEnabled = true
    if (navigation.state.index > 0) {
        swipeEnabled = false
    }
    return {
        swipeEnabled
    }
}


const AuthNavigator = createStackNavigator({
    Auth: AuthScreen
}, {
    defaultNavigationOptions: defaultNavOptions
})

// ----- SWITCH ----- //
const AppNavigator = createSwitchNavigator({
    Loading: LoadingScreen,
    Auth: AuthNavigator,
    App: SwipeTabNavigator
})



export default createAppContainer(AppNavigator)