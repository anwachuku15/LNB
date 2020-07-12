import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../redux/actions/authActions'

import { Platform, Dimensions, Vibration, StyleSheet, View, Button, SafeAreaView, Text, Animated, TouchableWithoutFeedback } from 'react-native'
import * as Haptics from 'expo-haptics'
import TouchableCmp from '../components/LNB/TouchableCmp'
import { createAppContainer, createSwitchNavigator, StackActions, SwitchActions, NavigationActions, getActiveChildNavigationOptions } from 'react-navigation'
import { createStackNavigator, Header, HeaderBackButton, TransitionPresets, TransitionSpecs, HeaderStyleInterpolators } from 'react-navigation-stack'

import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../components/UI/HeaderButton'

import { createDrawerNavigator } from 'react-navigation-drawer'
import { createMaterialTopTabNavigator, MaterialTopTabBar, createBottomTabNavigator, BottomTabBar } from 'react-navigation-tabs'

import { createSharedElementStackNavigator } from 'react-navigation-shared-element'

import Colors from '../constants/Colors'
import HomeScreen from '../screens/LNB/HomeScreen'
import { Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome, SimpleLineIcons, Feather, Entypo, AntDesign, FontAwesome5 } from '@expo/vector-icons'
import AuthScreen from '../screens/user/AuthScreen'
import LoadingScreen from '../screens/LoadingScreen'
import AnnouncementsScreen from '../screens/LNB/AnnouncementsScreen'
import ShopScreen from '../screens/LNB/ShopScreen'
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
import CreateAnnouncementScreen from '../screens/LNB/CreateAnnouncementScreen'
import DirectoryScreen from '../screens/LNB/DirectoryScreen'
import AnnouncementsIcon from '../components/LNB/AnnouncementsIcon'
import PostLikesScreen from '../screens/LNB/PostLikesScreen'
import NewMessageScreen from '../screens/LNB/NewMessageScreen'
import GroupChatScreen from '../screens/LNB/GroupChatScreen'
import CameraScreen from '../screens/LNB/CameraScreen'
import PostButtonTab from '../components/UI/PostTabButton'
import MenuAvatar from '../components/LNB/MenuAvatar'
import MessageIcon from '../components/LNB/MessageIcon'
import { useColorScheme } from 'react-native-appearance'
import { Alert } from 'react-native'
// import Animated, { Easing } from 'react-native-reanimated'

const SCREEN_WIDTH = Dimensions.get('window').width

export const defaultNavOptions = {
    headerTitleStyle: {
        fontFamily: 'open-sans-bold',
    },
    headerBackTitleStyle: {
        fontFamily: 'open-sans',
    },
    headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primary,
    headerBackTitleVisible: false,
}

export const defaultHeader = {
    headerTitleStyle: {
        fontFamily: 'open-sans-bold',
    },
    headerBackTitleStyle: {
        fontFamily: 'open-sans',
    },
    headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primary,
    headerBackTitleVisible: false,
    headerBackground: 'black'
}

const AdminStack = createStackNavigator({
    Admin: {
        screen: AdminScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            },
        }
    },
    CreateAnnouncement: {
        screen: CreateAnnouncementScreen,
    }
}, {
    headerMode: 'none',
    mode: 'modal'
})

const ThemedTopTabBar = props => {
    const scheme = useColorScheme()
    let theme, indicator
    if (scheme === 'dark') {
        theme = 'black'
        indicator = 'white'
    } else {
        theme = 'white'
        indicator = 'black'
    }
    return (
        <MaterialTopTabBar
            {...props}
            showLabel={true}
            activeTintColor={indicator}
            inactiveTintColor={Colors.placeholder}
            style={{backgroundColor: theme}}
            indicatorStyle={{backgroundColor:indicator}}
        />
    )
}

const ConnectionsSwipeTab = createMaterialTopTabNavigator({
    Directory: DirectoryScreen,
    Connections: ConnectionsScreen,
}, {
    initialRouteName: 'Connections',
    swipeEnabled: true,
    tabBarPosition: 'top',
    tabBarComponent: ThemedTopTabBar
})

ConnectionsSwipeTab.navigationOptions = ({navigation, screenProps}) => {
    const index = navigation.state.index
    const screens = navigation.state.routes
    const connections = navigation.state.routes[0].routeName
    const directory = navigation.state.routes[1].routeName
    const userName = navigation.state.routes[0].params.userName
    const background = screenProps.theme
    
    let headerTitle, headerLeft, gestureResponseDistance, headerStyle
    headerStyle = {
        backgroundColor: background === 'dark' ? 'black' : 'white',
        borderBottomWidth: 0
    }
    headerLeft = () => (
        <HeaderButtons HeaderButtonComponent={HeaderButton}>
            <Item
                title='Back'
                iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                onPress={() => {navigation.goBack()}}
            />
        </HeaderButtons>
    )

    if (index === 0) {
        headerTitle = 'LNB Directory'
        gestureResponseDistance = {
            horizontal: 300
        }
    } else if (index === 1) {
        headerTitle = userName
    }

    return {
        headerStyle,
        headerTitle,
        gestureResponseDistance,
        headerLeft
    }
}

const DirectorySwipeTab = createMaterialTopTabNavigator({
    Directory: DirectoryScreen,
    Connections: ConnectionsScreen
}, {
    swipeEnabled: true,
    tabBarPosition: 'top',
    tabBarComponent: ThemedTopTabBar
})


DirectorySwipeTab.navigationOptions = ({navigation, screenProps}) => {
    const index = navigation.state.index
    const userName = navigation.state.routes[0].params.userName
    const background = screenProps.theme

    let headerTitle, headerLeft, gestureResponseDistance, headerStyle
    headerStyle = {
        backgroundColor: background === 'dark' ? 'black' : 'white',
        borderBottomWidth: 0
    }
    headerLeft = () => (
        <HeaderButtons HeaderButtonComponent={HeaderButton}>
            <Item
                title='Back'
                iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                onPress={() => {navigation.goBack()}}
            />
        </HeaderButtons>
    )

    if (index === 0) {
        headerTitle = 'LNB Directory'
        gestureResponseDistance = {
            horizontal: 300
        }
    } else if (index === 1) {
        headerTitle = userName
    }

    return {
        headerStyle,
        headerTitle,
        gestureResponseDistance,
        headerLeft
    }
}




const screens = {
    PostDetail: {
        screen: PostDetailScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    PostLikes: {
        screen: PostLikesScreen,
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
            headerShown: false
        }
    },
    UserProfile: {
        screen: UserProfileScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            },
        }
    },
    UserProfilePicture: {
        screen: UserProfilePictureScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            },
            headerShown: false,
            cardStyle: {
                backgroundColor: 'rgba(0,0,0,0.5)'
            },
            transitionSpec: {
                open: TransitionSpecs.TransitionIOSSpec,
                close: TransitionSpecs.TransitionIOSSpec
            },
            cardStyleInterpolator: ({ current: { progress } }) => ({
                cardStyle: { opacity: progress }
            }),
            
        },
    },
    Connections: {
        screen: ConnectionsSwipeTab,
        navigationOptions: {
            headerTitleStyle: {
                fontFamily: 'open-sans-bold',
            },
            headerBackTitleStyle: {
                fontFamily: 'open-sans',
            },
            headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primary,
            headerBackTitleVisible: false,
        },
    },
    Directory: {
        screen: DirectorySwipeTab,
        navigationOptions: {
            headerTitleStyle: {
                fontFamily: 'open-sans-bold',
            },
            headerBackTitleStyle: {
                fontFamily: 'open-sans',
            },
            headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primary,
            headerBackTitleVisible: false,
        },
    },
    ConnectRequests: {
        screen: ConnectRequestsScreen,
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
            },
            // headerShown: false
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
        screen: AdminStack,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            },
            headerShown: false
        }
    },
}

const UserProfileStack = createSharedElementStackNavigator({
    UserProfile: UserProfileScreen,
    UserProfilePicture: UserProfilePictureScreen
}, {
    headerMode: 'screen'
})



const MainStack = createSharedElementStackNavigator({
    Home: HomeScreen,
    ...screens,
}, {
    headerMode: 'screen',
    defaultNavigationOptions: {

        headerTitleStyle: {
            fontFamily: 'open-sans-bold',
        },
        headerBackTitleStyle: {
            fontFamily: 'open-sans',
        },
        headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primary,
        headerBackTitleVisible: false,
        headerStyleInterpolator: HeaderStyleInterpolators.forFade
    },
}, {
    name: 'SharedStack', 
    debug: false
})

const HomeStack = createStackNavigator({
    MainStack: MainStack,
    Comment: {
        screen: CreateCommentScreen
    },
}, { 
    mode: 'modal',
    headerMode: 'none',
})

MainStack.navigationOptions = ({navigation}) => {
    let headerMode = 'float'
    if (navigation.state.routes.filter(route => route.routeName === 'UserProfile') > 0) {
        headerMode = 'screen'
    }

    return {
        headerMode
    }

}


const AnnouncementsStack = createStackNavigator({
    Announcements: {
        screen: AnnouncementsScreen,
        navigationOptions: {
            gestureResponseDistance: {
                horizontal: 300
            }
        }
    },
    ...screens
}, {
    defaultNavigationOptions: defaultNavOptions,
})


const NotificationsStack = createStackNavigator({
    Notifications: {
        screen: NotificationsScreen,
    },
    ...screens
}, {
    defaultNavigationOptions: defaultNavOptions
})

const ShopStack = createStackNavigator({
    Shop: {
        screen: ShopScreen
    },
    ...screens
}, {headerMode: 'none'})


const ThemedBottomBar = props => {
    const scheme = useColorScheme()
    let theme
    if (scheme === 'dark') {
        theme = Colors.darkHeader
    } else theme = Colors.lightHeader
    return (
        <BottomTabBar
            {...props}
            activeTintColor={Colors.primary}
            style={{backgroundColor: theme}}
            keyboardHidesTabBar={false}
            showLabel={false}
        />
    )
}


const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        bottom: 20,
        left: SCREEN_WIDTH*0.48
    },
    createButton: {
        // backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        width: 64,
        height: 64,
        borderRadius: 32,
        position: 'absolute',
        top: -60,
        // top: -100,
        // left: 130,
        // shadowColor: Colors.primary,
        // shadowRadius: 5,
        // shadowOffset: {height: 10},
        // shadowOpacity: 0.3,
        // borderWidth: 3,
        borderColor: 'white'
    },
    secondaryButton: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        borderRadius: 24,
        bottom: 20,
        left: SCREEN_WIDTH*0.48
    }
})


const createButtonSize = new Animated.Value(1)
const secondaryButtonSize = new Animated.Value(1)
const buttonMenuAnimation = new Animated.Value(0)
const buttonColorAnimation = new Animated.Value(0)

const toggleCreateMenu = () => {
    Animated.parallel([
        Animated.sequence([
            Animated.timing(createButtonSize, {
                toValue: 0.95,
                duration: 50
            }),
            Animated.timing(createButtonSize, {
                toValue: 1
            }),
        ]),
        Animated.spring(buttonMenuAnimation, {
            toValue: buttonMenuAnimation._value === 0 ? 1 : 0,
        }),
        Animated.timing(buttonColorAnimation, {
            toValue: buttonColorAnimation._value === 0 ? 1 : 0,
            duration: 50
        })
    ]).start()
    if (buttonMenuAnimation._value === 0) {
        Vibration.vibrate()
    }
}

const pressPost = () => {
    Animated.sequence([
        Animated.timing(createButtonSize, {
            toValue: 0.95,
            duration: 50
        }),
        Animated.timing(createButtonSize, {
            toValue: 1
        }),
    ]).start()
}

const selectOption = () => {
    Animated.sequence([
        Animated.timing(secondaryButtonSize, {
            toValue: 0.80,
            duration: 50
        }),
        Animated.parallel([
            Animated.sequence([
                Animated.timing(createButtonSize, {
                    toValue: 0.95,
                    duration: 50
                }),
                Animated.timing(createButtonSize, {
                    toValue: 1
                })
            ]),
            Animated.timing(secondaryButtonSize, {
                toValue: 1
            }),
            Animated.spring(buttonMenuAnimation, {
                toValue: buttonMenuAnimation._value === 0 ? 1 : 0,
            }),
            Animated.timing(buttonColorAnimation, {
                toValue: buttonColorAnimation._value === 0 ? 1 : 0,
                duration: 50
            })
        ])
    ]).start()
}

const interpolatePostButtonColor = buttonColorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.primary, Colors.placeholder]
})

const createButtonStyle = {
    transform: [{
        scale: createButtonSize,
    }],
    backgroundColor: interpolatePostButtonColor
}
const secondaryButtonStyle = {
    transform: [{
        scale: secondaryButtonSize
    }]
}



const rotation = {
    transform: [
        {
            rotate: buttonMenuAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '45deg']
            })
        }
    ]
}
const announcementX = buttonMenuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, -120]
})
const announcementY = buttonMenuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, -50]
})

const messageX = buttonMenuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, -100]
})
const messageY = buttonMenuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, -124]
})

const needX = buttonMenuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, -24]
})
const needY = buttonMenuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, -150],
})

const DirectoryTabButton = createMaterialTopTabNavigator({
    Directory: DirectoryScreen,
    Connections: ConnectionsScreen
}, {
    swipeEnabled: true,
    tabBarPosition: 'top',
    tabBarComponent: ThemedTopTabBar
})

const DirectoryStack = createStackNavigator({
    DirectoryTab: {
        screen: DirectoryTabButton,
    },
    ...screens
}, {
    defaultNavigationOptions: defaultNavOptions,
})
    
const BottomTabStackContainer = createStackNavigator({
    default: createBottomTabNavigator({
        Home: {
            screen: HomeStack,
            navigationOptions: {
                tabBarOnPress: ({navigation, defaultHandler}) => {
                    if (navigation.state.routes[0].index > 0) {
                        navigation.dispatch(StackActions.popToTop())
                    }
                    defaultHandler()
                },
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
                        // <AntDesign 
                        //     name='notification'
                        //     size={23} 
                        //     color={tabInfo.tintColor}
                        // />
                        <AnnouncementsIcon tabInfo={tabInfo} />
                    )
                },
                tabBarColor: Colors.secondaryColor,
                tabBarLabel: Platform.OS === 'android' 
                                ? <Text style={{fontFamily: 'open-sans-bold'}}>Announcements</Text>
                                : 'Announcements'
            }
        },
        CreateAnnouncement: {
            screen: CreateAnnouncementScreen,
            navigationOptions: {
                tabBarButtonComponent: () => {
                    return (
                        <View>
                            <TouchableWithoutFeedback onPress={navToEventsModal}>
                                <Animated.View style={{position: 'relative', left: announcementX, top: announcementY}}>
                                    <View style={{...secondaryPostButtonStyle, backgroundColor: 'rgba(237, 37, 78, 0.4)'}}>
                                        <MaterialCommunityIcons name='calendar-edit' size={24} color='white' />
                                    </View>
                                </Animated.View>
                            </TouchableWithoutFeedback>
                        </View>
                    )
                }
            }
        },
        CreateNeed: {
            screen: CreatePostScreen,
            navigationOptions: {
                tabBarButtonComponent: () => {
                    return (
                        <View>
                            <TouchableWithoutFeedback onPress={navToPostOption}>
                                <Animated.View style={{position: 'relative', left: needX, top: needY}}>
                                    <Animated.View style={[secondaryButtonStyle, {...secondaryPostButtonStyle, backgroundColor: Colors.primary}]}>
                                        <MaterialIcons name='create' size={24} color='white' />
                                    </Animated.View>
                                </Animated.View>
                            </TouchableWithoutFeedback>
                        </View>
                    )
                },
            }
        },
        CreateMessage: {
            screen: NewMessageScreen,
            navigationOptions: {
                tabBarButtonComponent: () => {
                    return (
                        <View>
                            <TouchableWithoutFeedback onPress={navToNewMessageScreen}>
                                <Animated.View style={{position: 'relative', left: messageX, top: messageY}}>
                                    <Animated.View style={[secondaryButtonStyle, {...secondaryPostButtonStyle, backgroundColor: Colors.blue}]}>
                                        <MaterialCommunityIcons name='message-plus' size={24} color='white' />
                                    </Animated.View>
                                </Animated.View>
                            </TouchableWithoutFeedback>
                        </View>
                    )
                }
            }
        },
        CreatePost: {
            screen: CreatePostScreen,
            navigationOptions: {
                tabBarButtonComponent: ({style}) => {
                    return (
                        <View style={postButtonStyle}>
                            <TouchableWithoutFeedback onPress={navToPostModal} onLongPress={toggleCreateMenu}>
                                <Animated.View style={[ createButtonStyle, {...styles.createButton, borderColor: Colors.primary, borderWidth: 2}]}>
                                    <Animated.View style={[rotation]}>
                                        <FontAwesome
                                            name='plus'
                                            size={24}
                                            color={'white'}
                                        />
                                    </Animated.View>
                                </Animated.View>
                            </TouchableWithoutFeedback>
                        </View>
                    )
                },
                tabBarColor: Colors.primaryColor,
                tabBarLabel: Platform.OS === 'android' 
                                ? <Text style={{fontFamily: 'open-sans-bold'}}>Post</Text>
                                : 'Post'
            },
        },
        
        Directory: {
            screen: createStackNavigator({
                DirectoryTab: {
                    screen: DirectoryTabButton,
                },
                ...screens,
            }, {
                defaultNavigationOptions: defaultNavOptions,
                navigationOptions: ({navigation}) => {
                    if (
                        navigation.isFocused() && (
                            navigation.state.index === 0 ||
                            navigation.state.routes[navigation.state.routes.length - 1].routeName === 'PostDetail'
                        )
                    ) {
                        postButtonStyle = {alignItems: 'center', bottom: -500, left: SCREEN_WIDTH*0.48}
                        secondaryPostButtonStyle = {
                            position: 'absolute', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            width: 48, 
                            height: 48, 
                            borderRadius: 24, 
                            bottom: -500, 
                            left: SCREEN_WIDTH*0.48
                        }
                    }
                }
            }),
            navigationOptions: {
                tabBarIcon: (tabInfo) => {
                    return (
                        <FontAwesome5
                            name='users'
                            size={23}
                            color={tabInfo.tintColor}
                        />
                    )
                },
            },
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
        Shop: {
            screen: ShopStack,
            navigationOptions: {
                tabBarIcon: (tabInfo) => {
                    return (
                        <Feather 
                            name='shopping-cart' 
                            size={23} 
                            color={tabInfo.tintColor}
                        />
                    )
                },
                tabBarColor: Colors.primaryColor,
                tabBarLabel: Platform.OS === 'android' 
                                ? <Text style={{fontFamily: 'open-sans-bold'}}>Shop</Text>
                                : 'Shop'
            }
        },
    }, {
        defaultNavigationOptions: {
            tabBarOnPress: ({navigation, defaultHandler}) => {
                if (navigation.state.key === 'Post') {
                    navigation.navigate('postModal')
                } else {
                    defaultHandler()
                }
            },
            
        },
        navigationOptions: ({navigation, theme, screenProps}) => {
            navToPostOption = () => {
                selectOption()
                navigation.navigate('postModal')
            }
            navToPostModal = () => {
                pressPost()
                if (buttonMenuAnimation._value === 0) {
                    setTimeout(() => {
                        navigation.navigate('postModal')
                    }, 250)
                } else {
                    toggleCreateMenu()
                }
            }
            navToEventsModal = () => {
                // navigation.navigate('announcementModal')
                Alert.alert('Coming Soon', 'Event planning coming soon...', [
                    {
                        text: 'Okay',
                        style: 'cancel',
                        onPress: () => toggleCreateMenu()
                    }
                ])
            }
            navToNewMessageScreen = () => {
                selectOption()
                navigation.navigate('newMessageModal')
            }
            background = screenProps.theme === 'dark' ? 'black' : 'black'
        },
        tabBarComponent: ThemedBottomBar,
    }),
    postModal: {
        screen: CreatePostScreen,
    },
    newMessageModal: {
        screen: NewMessageScreen,
    },
    announcementModal: {
        screen: CreateAnnouncementScreen,
    },
    cameraModal: {
        screen: CameraScreen,
    },
    commentModal: {
        screen: CreateCommentScreen
    },
    profilePicModal: {
        screen: UserProfilePictureScreen
    }
}, {
    mode: 'modal',
    headerMode: 'none',
})
let navToPostModal, navToPostOption, navToEventsModal, navToNewMessageScreen, navToMessages, background, navScreen
let postButtonStyle = {
        alignItems: 'center', 
        bottom: 20, 
        left: SCREEN_WIDTH * 0.48
    }
let secondaryPostButtonStyle = {
    position: 'absolute', 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    bottom: 0, 
    left: SCREEN_WIDTH*0.48
}




DirectoryTabButton.navigationOptions = ({navigation, screenProps}) => {
    const index = navigation.state.index
    const userName = screenProps.authUser.displayName
    const background = screenProps.theme
    
    let headerTitle, headerStyle
    const headerLeft = () => (
        <MenuAvatar toggleDrawer={() => navigation.toggleDrawer()} />
    )
    const headerRight = () => (
        <HeaderButtons HeaderButtonComponent={HeaderButton}>
            <Item
                ButtonElement={<MessageIcon/>}
                title='Messages'
                onPress={() => {
                    navigation.navigate('Messages')
                }}
            />
        </HeaderButtons>
    )
    headerStyle = {
        backgroundColor: background === 'dark' ? 'black' : 'white',
        borderBottomWidth: 0
    }
    if (index === 0) {
        headerTitle = 'LNB Directory'
    } else if (index === 1) {
        headerTitle = userName
    }
    return {
        headerStyle,
        headerLeft,
        headerRight,
        headerTitle,
    }
}


const MessagesStack = createStackNavigator({
    default: createStackNavigator({
        MessagesScreen: {
            screen: MessagesScreen,
        },
        NewMessageScreen: {
            screen: NewMessageScreen,
            navigationOptions: {
                gestureResponseDistance: {
                    horizontal: 300
                },
                headerShown: false
            }
        },
        GroupChatScreen: {
            screen: GroupChatScreen,
            navigationOptions: {
                gestureResponseDistance: {
                    horizontal: 300
                },
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
        UserProfile: {
            screen: UserProfileScreen,
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
        PostLikes: {
            screen: PostLikesScreen,
            navigationOptions: {
                gestureResponseDistance: {
                    horizontal: 300
                }
            }
        },
        Connections: {
            screen: ConnectionsSwipeTab,
            navigationOptions: {
                headerTitleStyle: {
                    fontFamily: 'open-sans-bold',
                },
                headerBackTitleStyle: {
                    fontFamily: 'open-sans',
                },
                headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primary,
                headerBackTitleVisible: false,
            },
        },
        Directory: {
            screen: DirectorySwipeTab,
            navigationOptions: {
                headerTitleStyle: {
                    fontFamily: 'open-sans-bold',
                },
                headerBackTitleStyle: {
                    fontFamily: 'open-sans',
                },
                headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primary,
                headerBackTitleVisible: false,
            },
        },
    }, {
        defaultNavigationOptions: defaultNavOptions
    }),
    Comment: CreateCommentScreen
}, {
    mode: 'modal',
    headerMode: 'none'
})

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


HomeStack.navigationOptions = ({navigation}) => {
    let tabBarVisible = true
    let headerMode = 'float'
    const routes = navigation.state.routes[0].routes
    const currentRouteName = routes[routes.length-1].routeName
    if (currentRouteName === 'UserProfilePicture') {
        tabBarVisible = false
    }
    if (navigation.isFocused() && currentRouteName === 'PostDetail') {
        postButtonStyle = {alignItems: 'center', bottom: -500, left: SCREEN_WIDTH*0.48}
        secondaryPostButtonStyle = {
            position: 'absolute', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 48, 
            height: 48, 
            borderRadius: 24, 
            bottom: -500, 
            left: SCREEN_WIDTH*0.48
        }
    } else {
        postButtonStyle = {alignItems: 'center', bottom: 20, left: SCREEN_WIDTH*0.48}
        secondaryPostButtonStyle = {
            position: 'absolute', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 48, 
            height: 48, 
            borderRadius: 24, 
            bottom: -30, 
            left: SCREEN_WIDTH*0.48
        }
    }

    return {
        tabBarVisible,
        headerMode
    }
}

AnnouncementsStack.navigationOptions = ({navigation}) => {
    const routes = navigation.state.routes
    const currentRouteName = routes[routes.length-1].routeName
    if (navigation.isFocused() && currentRouteName === 'PostDetail') {
        postButtonStyle = {alignItems: 'center', bottom: -500, left: SCREEN_WIDTH*0.48}
        secondaryPostButtonStyle = {
            position: 'absolute', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 48, 
            height: 48, 
            borderRadius: 24, 
            bottom: -500, 
            left: SCREEN_WIDTH*0.48
        }
    }
}

NotificationsStack.navigationOptions = ({navigation}) => {
    const routes = navigation.state.routes
    const currentRouteName = routes[routes.length-1].routeName
    if (navigation.isFocused() && currentRouteName === 'PostDetail') {
        postButtonStyle = {alignItems: 'center', bottom: -500, left: SCREEN_WIDTH*0.48}
        secondaryPostButtonStyle = {
            position: 'absolute', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 48, 
            height: 48, 
            borderRadius: 24, 
            bottom: -500, 
            left: SCREEN_WIDTH*0.48
        }
    }
}

// DirectoryStack.navigationOptions = ({navigation}) => {
//     console.log(navigation)
// }






// If current page is stacked on top of root tab screens or postModal is open

BottomTabStackContainer.navigationOptions = ({ navigation }) => {
    let drawerLockMode = 'unlocked'
    let tabBarVisible = false
    const tabStacks = navigation.state.routes[0].routes
    tabStacks.forEach(tab => {
        if (tab.routeName[0] !== 'C') {
            // console.log(tab)
        }
    })
    // console.log('---------\n')
    
    
    // console.log(navigation.state.routes[0].routes[6])


    // console.log('Directory Tab open')

    if (
        navigation.state.routes[0].routes[0]['index'] > 0 || 
        navigation.state.routes.length > 1 ||
        navigation.state.routes[0].routes[0].routes[0].routes.length > 1 ||
        (navigation.state.routes[0].routes[6].index === 0 && navigation.state.routes[0].routes[6].routes[0].index === 1)
    ) {
        drawerLockMode = 'locked-closed'
    }
    return {
        drawerLockMode,
        tabBarVisible
    }
}





// Disable swipe to Messages if the Drawer or Post Modal is open or if HomeStack is past home page
DrawerNav.navigationOptions = ({navigation}) => {
    
    let swipeEnabled = true
    const HomeStack = navigation.state.routes[0].routes[0].routes[0].routes[0]
    const AnnouncementsStack = navigation.state.routes[0].routes[0].routes[1]
    const DirectoryStack = navigation.state.routes[0].routes[0].routes[6]
    const NotificationsStack = navigation.state.routes[0].routes[0].routes[7]
    const ShopStack = navigation.state.routes[0].routes[0].routes[8]
    
    // console.log('Directory Stack Index: ' + DirectoryStack.index)
    // console.log('Directory or Connections: ' + DirectoryStack.routes[0].index)
    
    if (
        navigation.state.isDrawerOpen || 
        navigation.state.routes[0].routes.length > 1 || 
        HomeStack.index > 0 ||
        AnnouncementsStack.index > 0 ||
        NotificationsStack.index > 0 ||
        ShopStack.index > 0 ||
        DirectoryStack.index > 0
    ) {
        swipeEnabled = false
    } else {
        swipeEnabled = true
    }
    return {
        swipeEnabled
    }
}



// ---- MAIN NAVIGATION ---- //
const SwipeTabNavigator = createMaterialTopTabNavigator({
    Main: {
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