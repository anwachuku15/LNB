import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/actions/authActions";

import {
  Platform,
  Dimensions,
  Image,
  Vibration,
  StyleSheet,
  View,
  Button,
  SafeAreaView,
  Text,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import CustomModal from "react-native-modal";
import * as Haptics from "expo-haptics";
import TouchableCmp from "../components/LNB/TouchableCmp";
import {
  createAppContainer,
  createSwitchNavigator,
  StackActions,
  SwitchActions,
  NavigationActions,
  getActiveChildNavigationOptions,
} from "react-navigation";
import {
  createStackNavigator,
  Header,
  HeaderBackButton,
  TransitionPresets,
  TransitionSpecs,
  HeaderStyleInterpolators,
} from "react-navigation-stack";

import { HeaderButtons, Item } from "react-navigation-header-buttons";
import HeaderButton from "../components/UI/HeaderButton";

import { createDrawerNavigator } from "react-navigation-drawer";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBar,
  createBottomTabNavigator,
  BottomTabBar,
} from "react-navigation-tabs";

import { createSharedElementStackNavigator } from "react-navigation-shared-element";

import Colors from "../constants/Colors";
import HomeScreen from "../screens/LNB/HomeScreen";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome,
  SimpleLineIcons,
  Feather,
  Entypo,
  AntDesign,
  FontAwesome5,
} from "@expo/vector-icons";
import IntroScreen from "../screens/user/IntroScreen";
import EmailScreen from "../screens/user/EmailScreen";
import DisplayNameScreen from "../screens/user/DisplayNameScreen";
import PasswordScreen from "../screens/user/PasswordScreen";
import CreateHeadlineScreen from "../screens/user/CreateHeadlineScreen";
import CreateBioScreen from "../screens/user/CreateBioScreen";
import ChooseProfilePictureScreen from "../screens/Onboarding/ChooseProfilePictureScreen";
import RegisterScreen from "../screens/user/RegisterScreen";
import AuthScreen from "../screens/user/AuthScreen";
import LoadingScreen from "../screens/LoadingScreen";
import AnnouncementsScreen from "../screens/LNB/AnnouncementsScreen";
import ShopScreen from "../screens/LNB/ShopScreen";
import CreatePostScreen from "../screens/LNB/CreatePostScreen";
import NotificationsScreen from "../screens/LNB/NotificationsScreen";
import MessagesScreen from "../screens/LNB/MessagesScreen";
import SettingsScreen from "../screens/LNB/SettingsScreen";
import DrawerScreen from "../screens/LNB/DrawerScreen";
import EditProfileScreen from "../screens/LNB/EditProfileScreen";
import UserProfileScreen from "../screens/LNB/UserProfileScreen";
import CreateCommentScreen from "../screens/LNB/CreateCommentScreen";
import ChatScreen from "../screens/LNB/ChatScreen";
import NotificationIcon from "../components/LNB/NotificationIcon";
import PostDetailScreen from "../screens/LNB/PostDetailScreen";
import EventsScreen from "../screens/LNB/EventsScreen";
import AdminScreen from "../screens/LNB/AdminScreen";
import ConnectionsScreen from "../screens/LNB/ConnectionsScreen";
import ConnectRequestsScreen from "../screens/LNB/ConnectRequestsScreen";
import UserProfilePictureScreen from "../screens/LNB/UserProfilePictureScreen";
import CreateAnnouncementScreen from "../screens/LNB/CreateAnnouncementScreen";
import DirectoryScreen from "../screens/LNB/DirectoryScreen";
import AnnouncementsIcon from "../components/LNB/AnnouncementsIcon";
import PostLikesScreen from "../screens/LNB/PostLikesScreen";
import NewMessageScreen from "../screens/LNB/NewMessageScreen";
import GroupChatScreen from "../screens/LNB/GroupChatScreen";
import CameraScreen from "../screens/LNB/CameraScreen";

import WelcomeScreen from "../screens/Onboarding/WelcomeScreen";

import PostButtonTab from "../components/UI/PostTabButton";
import MenuAvatar from "../components/LNB/MenuAvatar";
import MessageIcon from "../components/LNB/MessageIcon";
import { useColorScheme } from "react-native-appearance";
import { Alert } from "react-native";
import EnterLocationScreen from "../screens/user/EnterLocationScreen";
// import Animated, { Easing } from 'react-native-reanimated'

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SCREEN_HEIGHT = Dimensions.get("screen").height;
export const defaultNavOptions = {
  headerTitleStyle: {
    fontFamily: "open-sans-bold",
  },
  headerBackTitleStyle: {
    fontFamily: "open-sans",
  },
  headerTintColor: Platform.OS === "android" ? "white" : Colors.primary,
  headerBackTitleVisible: false,
};

export const defaultHeader = {
  headerTitleStyle: {
    fontFamily: "open-sans-bold",
  },
  headerBackTitleStyle: {
    fontFamily: "open-sans",
  },
  headerTintColor: Platform.OS === "android" ? "white" : Colors.primary,
  headerBackTitleVisible: false,
  headerBackground: "black",
};

const AdminStack = createStackNavigator(
  {
    Admin: {
      screen: AdminScreen,
      navigationOptions: {
        gestureResponseDistance: {
          horizontal: 300,
        },
      },
    },
    CreateAnnouncement: {
      screen: CreateAnnouncementScreen,
    },
  },
  {
    headerMode: "none",
    mode: "modal",
  }
);

const ThemedTopTabBar = (props) => {
  const scheme = useColorScheme();
  let theme, indicator;
  if (scheme === "dark") {
    theme = "black";
    indicator = "white";
  } else {
    theme = "white";
    indicator = "black";
  }
  return (
    <MaterialTopTabBar
      {...props}
      showLabel={true}
      activeTintColor={indicator}
      inactiveTintColor={Colors.placeholder}
      style={{ backgroundColor: theme }}
      indicatorStyle={{ backgroundColor: indicator }}
    />
  );
};

const ConnectionsSwipeTab = createMaterialTopTabNavigator(
  {
    Directory: DirectoryScreen,
    Connections: ConnectionsScreen,
  },
  {
    initialRouteName: "Connections",
    swipeEnabled: true,
    tabBarPosition: "top",
    tabBarComponent: ThemedTopTabBar,
  }
);

ConnectionsSwipeTab.navigationOptions = ({ navigation, screenProps }) => {
  const index = navigation.state.index;
  const screens = navigation.state.routes;
  const connections = navigation.state.routes[0].routeName;
  const directory = navigation.state.routes[1].routeName;
  const userName = navigation.state.routes[0].params.userName;
  const background = screenProps.theme;

  let headerTitle, headerLeft, gestureResponseDistance, headerStyle;
  headerStyle = {
    backgroundColor: background === "dark" ? "black" : "white",
    borderBottomWidth: 0,
  };
  headerLeft = () => (
    <HeaderButtons HeaderButtonComponent={HeaderButton}>
      <Item
        title="Back"
        iconName={
          Platform.OS === "android" ? "md-arrow-back" : "ios-arrow-back"
        }
        onPress={() => {
          navigation.goBack();
        }}
      />
    </HeaderButtons>
  );

  if (index === 0) {
    headerTitle = "LNB Directory";
    gestureResponseDistance = {
      horizontal: 300,
    };
  } else if (index === 1) {
    headerTitle = userName;
  }

  return {
    headerStyle,
    headerTitle,
    gestureResponseDistance,
    headerLeft,
  };
};

const DirectorySwipeTab = createMaterialTopTabNavigator(
  {
    Directory: DirectoryScreen,
    Connections: ConnectionsScreen,
  },
  {
    swipeEnabled: true,
    tabBarPosition: "top",
    tabBarComponent: ThemedTopTabBar,
  }
);

DirectorySwipeTab.navigationOptions = ({ navigation, screenProps }) => {
  const index = navigation.state.index;
  const userName = navigation.state.routes[0].params.userName;
  const background = screenProps.theme;

  let headerTitle, headerLeft, gestureResponseDistance, headerStyle;
  headerStyle = {
    backgroundColor: background === "dark" ? "black" : "white",
    borderBottomWidth: 0,
  };
  headerLeft = () => (
    <HeaderButtons HeaderButtonComponent={HeaderButton}>
      <Item
        title="Back"
        iconName={
          Platform.OS === "android" ? "md-arrow-back" : "ios-arrow-back"
        }
        onPress={() => {
          navigation.goBack();
        }}
      />
    </HeaderButtons>
  );

  if (index === 0) {
    headerTitle = "LNB Directory";
    gestureResponseDistance = {
      horizontal: 300,
    };
  } else if (index === 1) {
    headerTitle = userName;
  }

  return {
    headerStyle,
    headerTitle,
    gestureResponseDistance,
    headerLeft,
  };
};

const screens = {
  PostDetail: {
    screen: PostDetailScreen,
    navigationOptions: {
      gestureResponseDistance: {
        horizontal: 300,
      },
    },
  },
  PostLikes: {
    screen: PostLikesScreen,
    navigationOptions: {
      gestureResponseDistance: {
        horizontal: 300,
      },
    },
  },
  EditProfile: {
    screen: EditProfileScreen,
    navigationOptions: {
      gestureResponseDistance: {
        horizontal: 300,
      },
      headerShown: false,
    },
  },
  UserProfile: {
    screen: UserProfileScreen,
    navigationOptions: {
      gestureResponseDistance: {
        horizontal: 300,
      },
    },
  },
  UserProfilePicture: {
    screen: UserProfilePictureScreen,
    navigationOptions: {
      gestureResponseDistance: {
        horizontal: 300,
      },
      headerShown: true,
      cardStyleInterpolator: ({ current: { progress } }) => ({
        cardStyle: { opacity: progress },
      }),
      headerStyle: {
        backgroundColor: Colors.socialdark,
        shadowColor: "transparent",
      },
    },
  },
  Connections: {
    screen: ConnectionsSwipeTab,
    navigationOptions: {
      headerTitleStyle: {
        fontFamily: "open-sans-bold",
      },
      headerBackTitleStyle: {
        fontFamily: "open-sans",
      },
      headerTintColor: Platform.OS === "android" ? "white" : Colors.primary,
      headerBackTitleVisible: false,
    },
  },
  Directory: {
    screen: DirectorySwipeTab,
    navigationOptions: {
      headerTitleStyle: {
        fontFamily: "open-sans-bold",
      },
      headerBackTitleStyle: {
        fontFamily: "open-sans",
      },
      headerTintColor: Platform.OS === "android" ? "white" : Colors.primary,
      headerBackTitleVisible: false,
    },
  },
  ConnectRequests: {
    screen: ConnectRequestsScreen,
    navigationOptions: {
      gestureResponseDistance: {
        horizontal: 300,
      },
    },
  },
  ChatScreen: {
    screen: ChatScreen,
    navigationOptions: {
      gestureResponseDistance: {
        horizontal: 300,
      },
      // headerShown: false
    },
  },
  Settings: {
    screen: SettingsScreen,
    navigationOptions: {
      gestureResponseDistance: {
        horizontal: 300,
      },
    },
  },
  Events: {
    screen: EventsScreen,
    navigationOptions: {
      gestureResponseDistance: {
        horizontal: 300,
      },
    },
  },
  Admin: {
    screen: AdminStack,
    navigationOptions: {
      gestureResponseDistance: {
        horizontal: 300,
      },
      headerShown: false,
    },
  },
};

const UserProfileStack = createSharedElementStackNavigator(
  {
    UserProfile: UserProfileScreen,
    UserProfilePicture: UserProfilePictureScreen,
  },
  {
    headerMode: "screen",
  }
);

const MainStack = createSharedElementStackNavigator(
  {
    Home: HomeScreen,
    ...screens,
  },
  {
    defaultNavigationOptions: {
      headerTitleStyle: {
        fontFamily: "open-sans-bold",
      },
      headerBackTitleStyle: {
        fontFamily: "open-sans",
      },
      headerTintColor: Platform.OS === "android" ? "white" : Colors.primary,
      headerBackTitleVisible: false,
    },
  },
  {
    name: "SharedStack",
    debug: false,
  }
);

const forFade = ({ current, next }) => {
  const opacity = Animated.add(
    current.progress,
    next ? next.progress : 0
  ).interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0],
  });
  return {
    leftButtonStyle: { opacity },
    rightButtonStyle: { opacity },
    titleStyle: { opacity },
    backgroundStyle: { opacity },
  };
};
const HomeStack = createStackNavigator(
  {
    MainStack: {
      screen: MainStack,
    },
    Comment: {
      screen: CreateCommentScreen,
    },
  },
  {
    mode: "modal",
    headerMode: "none",
  }
);

const AnnouncementsStack = createSharedElementStackNavigator(
  {
    Announcements: {
      screen: AnnouncementsScreen,
      navigationOptions: {
        gestureResponseDistance: {
          horizontal: 300,
        },
      },
    },
    ...screens,
  },
  {
    defaultNavigationOptions: defaultNavOptions,
  }
);

const NotificationsStack = createSharedElementStackNavigator(
  {
    Notifications: {
      screen: NotificationsScreen,
    },
    ...screens,
  },
  {
    defaultNavigationOptions: defaultNavOptions,
  }
);

const ShopStack = createSharedElementStackNavigator(
  {
    Shop: {
      screen: ShopScreen,
    },
    ...screens,
  },
  { headerMode: "none" }
);

const ThemedBottomBar = (props) => {
  console.log(props.navigation._childrenNavigation.CreatePost);
  const scheme = useColorScheme();
  let theme;
  if (scheme === "dark") {
    theme = Colors.darkHeader;
  } else theme = Colors.lightHeader;

  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <BottomTabBar
      {...props}
      activeTintColor={Colors.primary}
      activeTintColor={
        isUserProfilePicture ? Colors.socialdark : Colors.primary
      }
      inactiveTintColor={isUserProfilePicture ? Colors.socialdark : "#8e8e93"}
      style={{
        backgroundColor: isUserProfilePicture ? Colors.socialdark : theme,
        borderTopColor: isUserProfilePicture ? Colors.socialdark : theme,
        // bottom: isUserProfilePicture && -500
      }}
      keyboardHidesTabBar={false}
      showLabel={false}
    />
  );
};

const createButtonSize = new Animated.Value(1);
const secondaryButtonSize = new Animated.Value(1);
const buttonMenuAnimation = new Animated.Value(0);
const buttonColorAnimation = new Animated.Value(0);

let isMenuOpen = false;
const toggleCreateMenu = () => {
  Animated.parallel([
    Animated.sequence([
      Animated.timing(createButtonSize, {
        toValue: createButtonSize._value === 1 ? 0 : 1,
        duration: 10,
      }),
      Animated.timing(createButtonSize, {
        toValue: createButtonSize._value === 0 ? 1 : 0,
      }),
    ]),
    Animated.spring(buttonMenuAnimation, {
      toValue: buttonMenuAnimation._value === 0 ? 1 : 0,
    }),
    Animated.timing(buttonColorAnimation, {
      toValue: buttonColorAnimation._value === 0 ? 1 : 0,
      duration: 50,
    }),
  ]).start();
  Haptics.impactAsync("medium");
};

const onPressIn = () => {};
const pressPost = () => {
  Animated.timing(createButtonSize, {
    toValue: 0.9,
    duration: 50,
  }).start();
};

const selectOption = () => {
  Animated.sequence([
    Animated.timing(secondaryButtonSize, {
      toValue: 0.8,
      duration: 50,
    }),
    Animated.parallel([
      Animated.sequence([
        Animated.timing(createButtonSize, {
          toValue: 0.95,
          duration: 50,
        }),
        Animated.timing(createButtonSize, {
          toValue: 1,
        }),
      ]),
      Animated.timing(secondaryButtonSize, {
        toValue: 1,
      }),
      Animated.spring(buttonMenuAnimation, {
        toValue: buttonMenuAnimation._value === 0 ? 1 : 0,
      }),
      Animated.timing(buttonColorAnimation, {
        toValue: buttonColorAnimation._value === 0 ? 1 : 0,
        duration: 50,
      }),
    ]),
  ]).start();
};

const interpolatePostButtonColor = buttonColorAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [Colors.primary, Colors.placeholder],
});

const createButtonStyle = {
  transform: [
    {
      scale: createButtonSize,
    },
  ],
  backgroundColor: interpolatePostButtonColor,
};
const secondaryButtonStyle = {
  transform: [
    {
      scale: secondaryButtonSize,
    },
  ],
};

const rotation = {
  transform: [
    {
      rotate: buttonMenuAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "45deg"],
      }),
    },
  ],
};
const announcementX = buttonMenuAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [SCREEN_WIDTH * 0.415, SCREEN_WIDTH * 0.1],
});
let announcementY = buttonMenuAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [-70, -70],
});

const messageX = buttonMenuAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [SCREEN_WIDTH * 0.415, SCREEN_WIDTH * 0.21],
});
let messageY = buttonMenuAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [-70, -144],
});

const exitX = buttonMenuAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [SCREEN_WIDTH * 0.415, SCREEN_WIDTH * 0.415],
});
let exitY = buttonMenuAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [-70, -70],
});

const needX = buttonMenuAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [SCREEN_WIDTH * 0.415, SCREEN_WIDTH * 0.415],
});
let needY = buttonMenuAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [-70, -190],
});

const DirectoryTabButton = createMaterialTopTabNavigator(
  {
    Directory: DirectoryScreen,
    Connections: ConnectionsScreen,
  },
  {
    swipeEnabled: true,
    tabBarPosition: "top",
    tabBarComponent: ThemedTopTabBar,
  }
);

DirectoryTabButton.navigationOptions = ({ navigation, screenProps }) => {
  const index = navigation.state.index;
  // const userName = screenProps.authUser.displayName
  const background = screenProps.theme;

  let headerTitle, headerStyle;
  const headerLeft = () => (
    <MenuAvatar toggleDrawer={() => navigation.toggleDrawer()} />
  );
  const headerRight = () => (
    <HeaderButtons HeaderButtonComponent={HeaderButton}>
      <Item
        ButtonElement={<MessageIcon />}
        title="Messages"
        onPress={() => {
          navigation.navigate("Messages");
        }}
      />
    </HeaderButtons>
  );
  headerStyle = {
    backgroundColor: background === "dark" ? "black" : "white",
    borderBottomWidth: 0,
  };
  headerTitle = "LNB Directory";
  // if (index === 0) {
  //     headerTitle = 'LNB Directory'
  // } else if (index === 1) {
  //     headerTitle = userName
  // }
  return {
    headerStyle,
    headerLeft,
    headerRight,
    headerTitle,
  };
};

const BottomTabStackContainer = createStackNavigator(
  {
    default: createBottomTabNavigator(
      {
        Home: {
          screen: HomeStack,
          navigationOptions: {
            // tabBarOnPress: ({navigation, defaultHandler}) => {
            //     if (navigation.state.routes[0].index > 0) {
            //         navigation.dispatch(StackActions.popToTop())
            //     }
            //     defaultHandler()
            // },
            tabBarOnPress: ({ navigation, defaultHandler }) => {
              if (isUserProfilePicture) {
                null;
              } else {
                defaultHandler();
              }
            },
            tabBarIcon: (tabInfo) => {
              return (
                <Feather name="home" size={23} color={tabInfo.tintColor} />
              );
            },
            tabBarColor: Colors.primaryColor,
            tabBarLabel:
              Platform.OS === "android" ? (
                <Text style={{ fontFamily: "open-sans-bold" }}>Home</Text>
              ) : (
                "Home"
              ),
          },
        },
        Announcements: {
          screen: AnnouncementsStack,
          navigationOptions: {
            tabBarOnPress: ({ navigation, defaultHandler }) => {
              if (isUserProfilePicture) {
                null;
              } else {
                defaultHandler();
              }
            },
            tabBarLabel: "Announcements",
            tabBarIcon: (tabInfo) => {
              return (
                // <AntDesign
                //     name='notification'
                //     size={23}
                //     color={tabInfo.tintColor}
                // />
                <AnnouncementsIcon tabInfo={tabInfo} />
              );
            },
            tabBarColor: Colors.secondaryColor,
            tabBarLabel:
              Platform.OS === "android" ? (
                <Text style={{ fontFamily: "open-sans-bold" }}>
                  Announcements
                </Text>
              ) : (
                "Announcements"
              ),
          },
        },
        CreateAnnouncement: {
          screen: CreateAnnouncementScreen,
          navigationOptions: {
            tabBarButtonComponent: () => {
              return null;
              // <View>
              //   <TouchableWithoutFeedback onPress={navToEventsModal}>
              //     <Animated.View
              //       style={[
              //         secondaryButtonStyle,
              //         {
              //           ...secondaryPostButtonStyle,
              //           backgroundColor: "rgba(237, 37, 78, 0.4)",
              //           position: "absolute",
              //           left: announcementX,
              //           top: announcementY,
              //         },
              //       ]}
              //     >
              //       <MaterialCommunityIcons
              //         name="calendar-edit"
              //         size={24}
              //         color="white"
              //       />
              //     </Animated.View>
              //   </TouchableWithoutFeedback>
              // </View>
            },
          },
        },
        CreateNeed: {
          screen: CreatePostScreen,
          navigationOptions: {
            tabBarButtonComponent: () => {
              return null;
              // <View>
              //   <TouchableWithoutFeedback onPress={navToPostOption}>
              //     <Animated.View
              //       style={[
              //         secondaryButtonStyle,
              //         {
              //           ...secondaryPostButtonStyle,
              //           backgroundColor: Colors.primary,
              //           position: "absolute",
              //           left: needX,
              //           top: needY,
              //         },
              //       ]}
              //     >
              //       <MaterialIcons name="create" size={24} color="white" />
              //     </Animated.View>
              //   </TouchableWithoutFeedback>
              // </View>
            },
          },
        },
        CreateMessage: {
          screen: NewMessageScreen,
          navigationOptions: {
            tabBarButtonComponent: () => {
              return null;
              // <View>
              //   <TouchableWithoutFeedback onPress={navToNewMessageScreen}>
              //     <Animated.View
              //       style={[
              //         secondaryButtonStyle,
              //         {
              //           ...secondaryPostButtonStyle,
              //           backgroundColor: Colors.blue,
              //           position: "absolute",
              //           left: messageX,
              //           top: messageY,
              //         },
              //       ]}
              //     >
              //       <MaterialCommunityIcons
              //         name="message-plus"
              //         size={24}
              //         color="white"
              //       />
              //     </Animated.View>
              //   </TouchableWithoutFeedback>
              // </View>
            },
          },
        },
        CreatePost: {
          screen: CreatePostScreen,
          navigationOptions: {
            tabBarOnPress: ({ navigation, defaultHandler }) => {
              if (isUserProfilePicture) {
                null;
              } else {
                defaultHandler();
              }
            },
            tabBarButtonComponent: ({ style }) => {
              const [isMenuOpen, setIsMenuOpen] = useState(false);
              return (
                <>
                  <View
                    style={{
                      shadowColor: "black",
                      shadowRadius: 5,
                      shadowOffset: { height: 5 },
                      shadowOpacity: 0.3,
                      ...postButtonStyle,
                    }}
                  >
                    <TouchableWithoutFeedback
                      onPressIn={pressPost}
                      onPressOut={navToPostModal}
                      onLongPress={() => {
                        setIsMenuOpen(!isMenuOpen);
                        toggleCreateMenu();
                      }}
                    >
                      <Animated.View
                        style={[
                          createButtonStyle,
                          {
                            ...styles.createButton,
                            borderColor: Colors.primary,
                            borderWidth: 2,
                          },
                        ]}
                      >
                        <Animated.View style={[rotation]}>
                          {/* <FontAwesome name='plus' size={24} color={'white'}/> */}
                          <MaterialCommunityIcons
                            name="pencil-plus"
                            size={30}
                            color={"white"}
                            style={{ marginLeft: 5, marginTop: 3 }}
                          />
                        </Animated.View>
                      </Animated.View>
                    </TouchableWithoutFeedback>
                  </View>
                  <CustomModal
                    isVisible={isMenuOpen}
                    backdropColor="black"
                    backdropOpacity={0.8}
                    backdropTransitionInTiming={100}
                    backdropTransitionOutTiming={100}
                    onBackdropPress={() => {
                      setIsMenuOpen(!isMenuOpen);
                      toggleCreateMenu();
                    }}
                    animationIn="fadeIn"
                    animationOut="fadeOut"
                    style={{ marginBottom: 0 }}
                    // presentationStyle
                  >
                    <View
                      style={{
                        // flex: 1,
                        justifyContent: "flex-end",
                        alignItems: "center",
                        marginTop: 22,
                        marginBottom: 0,
                        backgroundColor: "transparent",
                        width: SCREEN_WIDTH * 0.4,
                        height: 200,
                        position: "absolute",
                        bottom: 80,
                        right: SCREEN_WIDTH * 0.01,
                      }}
                    >
                      <View
                        style={{
                          width: SCREEN_WIDTH / 1.5,
                        }}
                      >
                        {/* <TouchableWithoutFeedback
                          onPress={() => {
                            setIsMenuOpen(!isMenuOpen);
                          }}
                        >
                          <MaterialCommunityIcons
                            name="pencil-plus"
                            size={30}
                            color={"white"}
                            style={{ marginLeft: 5, marginTop: 3 }}
                          />
                        </TouchableWithoutFeedback> */}
                        <TouchableWithoutFeedback
                          onPress={() => {
                            setIsMenuOpen(!isMenuOpen);
                            toggleCreateMenu();
                            navToPostOption();
                          }}
                          style={{ backgroundColor: "blue" }}
                        >
                          <Animated.View
                            style={[
                              secondaryButtonStyle,
                              {
                                ...secondaryPostButtonStyle,
                                backgroundColor: Colors.primary,
                                position: "absolute",
                                left: needX,
                                top: needY,
                              },
                            ]}
                          >
                            <MaterialIcons
                              name="create"
                              size={24}
                              color="white"
                            />
                          </Animated.View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback
                          onPress={() => {
                            setIsMenuOpen(!isMenuOpen);
                            toggleCreateMenu();
                          }}
                        >
                          <Animated.View
                            style={[
                              secondaryButtonStyle,
                              {
                                ...secondaryPostButtonStyle,
                                backgroundColor: Colors.primaryDark,
                                position: "absolute",
                                left: exitX,
                                top: exitY,
                              },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name="close"
                              size={24}
                              color="white"
                            />
                          </Animated.View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback
                          onPress={() => {
                            setIsMenuOpen(!isMenuOpen);
                            toggleCreateMenu();
                            navToNewMessageScreen();
                          }}
                        >
                          <Animated.View
                            style={[
                              secondaryButtonStyle,
                              {
                                ...secondaryPostButtonStyle,
                                backgroundColor: Colors.blue,
                                position: "absolute",
                                left: messageX,
                                top: messageY,
                              },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name="message-plus"
                              size={24}
                              color="white"
                            />
                          </Animated.View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback
                          onPress={() => {
                            Alert.alert(
                              "Coming Soon",
                              "Event planning coming soon...",
                              [
                                {
                                  text: "Okay",
                                  style: "cancel",
                                  onPress: () => {
                                    setIsMenuOpen(!isMenuOpen);
                                    toggleCreateMenu();
                                  },
                                },
                              ]
                            );
                          }}
                        >
                          <Animated.View
                            style={[
                              secondaryButtonStyle,
                              {
                                ...secondaryPostButtonStyle,
                                backgroundColor: "rgba(237, 37, 78, 0.4)",
                                position: "absolute",
                                left: announcementX,
                                top: announcementY,
                              },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name="calendar-edit"
                              size={24}
                              color="white"
                            />
                          </Animated.View>
                        </TouchableWithoutFeedback>
                      </View>
                    </View>
                  </CustomModal>
                </>
              );
            },
            tabBarColor: Colors.primaryColor,
            tabBarLabel:
              Platform.OS === "android" ? (
                <Text style={{ fontFamily: "open-sans-bold" }}>Post</Text>
              ) : (
                "Post"
              ),
          },
        },
        Directory: {
          screen: createSharedElementStackNavigator(
            {
              DirectoryTab: {
                screen: DirectoryTabButton,
              },
              ...screens,
            },
            {
              defaultNavigationOptions: defaultNavOptions,
              navigationOptions: ({ navigation }) => {
                const currentRouteName =
                  navigation.state.routes[navigation.state.routes.length - 1]
                    .routeName;
                if (
                  navigation.isFocused() &&
                  (navigation.state.index === 0 ||
                    currentRouteName === "PostDetail" ||
                    currentRouteName === "UserProfilePicture")
                ) {
                  postButtonStyle = {
                    alignItems: "center",
                    bottom: -500,
                    left: SCREEN_WIDTH * 0.48,
                  };
                  needY = 500;
                  messageY = 500;
                  announcementY = 500;
                }
                if (
                  navigation.isFocused() &&
                  currentRouteName === "UserProfilePicture"
                ) {
                  isUserProfilePicture = true;
                  return {
                    isUserProfilePicture,
                  };
                }
              },
            }
          ),
          navigationOptions: {
            tabBarOnPress: ({ navigation, defaultHandler }) => {
              if (isUserProfilePicture) {
                null;
              } else {
                defaultHandler();
              }
            },
            tabBarIcon: (tabInfo) => {
              return (
                <FontAwesome5
                  name="users"
                  size={23}
                  color={tabInfo.tintColor}
                />
              );
            },
          },
        },
        Notifications: {
          screen: NotificationsStack,
          navigationOptions: {
            tabBarIcon: (tabInfo) => {
              return <NotificationIcon tabInfo={tabInfo} />;
            },
            tabBarColor: Colors.primaryColor,
            tabBarLabel:
              Platform.OS === "android" ? (
                <Text style={{ fontFamily: "open-sans-bold" }}>
                  Notifications
                </Text>
              ) : (
                "Notifications"
              ),
          },
        },
        Shop: {
          screen: ShopStack,
          navigationOptions: {
            tabBarOnPress: ({ navigation, defaultHandler }) => {
              if (isUserProfilePicture) {
                null;
              } else {
                defaultHandler();
              }
            },
            tabBarIcon: (tabInfo) => {
              return (
                <Feather
                  name="shopping-cart"
                  size={23}
                  color={tabInfo.tintColor}
                />
              );
            },
            tabBarColor: Colors.primaryColor,
            tabBarLabel:
              Platform.OS === "android" ? (
                <Text style={{ fontFamily: "open-sans-bold" }}>Shop</Text>
              ) : (
                "Shop"
              ),
          },
        },
      },
      {
        tabBarComponent: ThemedBottomBar,
        // lazy: true,
        defaultNavigationOptions: {
          tabBarOnPress: ({ navigation, defaultHandler }) => {
            if (navigation.state.key === "Post") {
              navigation.navigate("postModal");
            } else {
              defaultHandler();
            }
          },
        },
        navigationOptions: ({ navigation, theme, screenProps }) => {
          navToPostOption = () => {
            selectOption();
            setTimeout(() => {
              navigation.navigate("postModal");
            }, 250);
          };
          navToPostModal = () => {
            if (buttonMenuAnimation._value === 0) {
              Animated.timing(createButtonSize, {
                toValue: 1,
                duration: 50,
              }).start();
              setTimeout(() => {
                navigation.navigate("postModal");
              }, 250);
            } else if (buttonMenuAnimation._value === 1) {
              isMenuOpen = !isMenuOpen;
              console.log(isMenuOpen);
              toggleCreateMenu();
            }
          };
          navToEventsModal = () => {
            // navigation.navigate('announcementModal')
            Alert.alert("Coming Soon", "Event planning coming soon...", [
              {
                text: "Okay",
                style: "cancel",
                onPress: () => toggleCreateMenu(),
              },
            ]);
          };
          navToNewMessageScreen = () => {
            selectOption();
            setTimeout(() => {
              navigation.navigate("newMessageModal");
            }, 250);
          };
          background = screenProps.theme === "dark" ? "black" : "black";
        },
      }
    ),
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
      screen: CreateCommentScreen,
    },
    profilePicModal: {
      screen: UserProfilePictureScreen,
    },
    editProfileModal: {
      screen: EditProfileScreen,
    },
  },
  {
    mode: "modal",
    headerMode: "none",
  }
);
let navToPostModal,
  navToPostOption,
  navToEventsModal,
  navToNewMessageScreen,
  navToMessages,
  background,
  navScreen;
let isUserProfilePicture = false;
let postButtonStyle = {
  alignItems: "center",
  bottom: 80,
  left: SCREEN_WIDTH * 0.48,
};
let secondaryPostButtonStyle = {
  position: "relative",
  alignItems: "center",
  justifyContent: "center",
  width: 48,
  height: 48,
  borderRadius: 24,
  // bottom: 0,
  // left: SCREEN_WIDTH * 0.48,
};

let secondaryPostButtonStyle1 = {
  position: "absolute",
  alignItems: "center",
  justifyContent: "center",
  width: 48,
  height: 48,
  borderRadius: 24,
  bottom: 0,
  left: SCREEN_WIDTH * 0.48,
};
const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    bottom: 20,
    left: SCREEN_WIDTH * 0.48,
  },
  createButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    position: "absolute",
    borderColor: "white",
  },
  secondaryButton: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
    bottom: 20,
    left: SCREEN_WIDTH * 0.48,
  },
});

const MessagesStack = createStackNavigator(
  {
    default: createStackNavigator(
      {
        MessagesScreen: {
          screen: MessagesScreen,
        },
        NewMessageScreen: {
          screen: NewMessageScreen,
          navigationOptions: {
            gestureResponseDistance: {
              horizontal: 300,
            },
            headerShown: false,
          },
        },
        GroupChatScreen: {
          screen: GroupChatScreen,
          navigationOptions: {
            gestureResponseDistance: {
              horizontal: 300,
            },
          },
        },
        ChatScreen: {
          screen: ChatScreen,
          navigationOptions: {
            gestureResponseDistance: {
              horizontal: 300,
            },
          },
        },
        UserProfile: {
          screen: UserProfileScreen,
          navigationOptions: {
            gestureResponseDistance: {
              horizontal: 300,
            },
          },
        },
        PostDetail: {
          screen: PostDetailScreen,
          navigationOptions: {
            gestureResponseDistance: {
              horizontal: 300,
            },
          },
        },
        PostLikes: {
          screen: PostLikesScreen,
          navigationOptions: {
            gestureResponseDistance: {
              horizontal: 300,
            },
          },
        },
        Connections: {
          screen: ConnectionsSwipeTab,
          navigationOptions: {
            headerTitleStyle: {
              fontFamily: "open-sans-bold",
            },
            headerBackTitleStyle: {
              fontFamily: "open-sans",
            },
            headerTintColor:
              Platform.OS === "android" ? "white" : Colors.primary,
            headerBackTitleVisible: false,
          },
        },
        Directory: {
          screen: DirectorySwipeTab,
          navigationOptions: {
            headerTitleStyle: {
              fontFamily: "open-sans-bold",
            },
            headerBackTitleStyle: {
              fontFamily: "open-sans",
            },
            headerTintColor:
              Platform.OS === "android" ? "white" : Colors.primary,
            headerBackTitleVisible: false,
          },
        },
      },
      {
        defaultNavigationOptions: defaultNavOptions,
      }
    ),
    Comment: CreateCommentScreen,
  },
  {
    mode: "modal",
    headerMode: "none",
  }
);

const DrawerNav = createDrawerNavigator(
  {
    Main: {
      screen: BottomTabStackContainer,
    },
  },
  {
    edgeWidth: 200,
    drawerWidth: 320,
    contentOptions: {
      activeTintColor: Colors.primary,
    },
    contentComponent: (props) => {
      const dispatch = useDispatch();
      return (
        <View style={{ flex: 1, paddingTop: 20 }}>
          <DrawerScreen navigation={props.navigation} />
          <SafeAreaView forceInset={{ top: "always", horizontal: "never" }}>
            <Button
              title="Logout"
              color={Colors.primary}
              onPress={() => {
                dispatch(logout());
                props.navigation.navigate("Auth");
              }}
            />
          </SafeAreaView>
        </View>
      );
    },
  }
);

MainStack.navigationOptions = ({ navigation }) => {
  const routes = navigation.state.routes;
  const currentRouteName = routes[routes.length - 1].routeName;

  if (navigation.isFocused() && currentRouteName === "UserProfilePicture") {
    // console.log(currentRouteName)
    isUserProfilePicture = true;
  } else {
    isUserProfilePicture = false;
  }
};

HomeStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  const routes = navigation.state.routes[0].routes;
  const currentRouteName = routes[routes.length - 1].routeName;

  if (
    navigation.isFocused() &&
    (currentRouteName === "PostDetail" ||
      currentRouteName === "UserProfilePicture" ||
      currentRouteName === "ChatScreen" ||
      currentRouteName === "GroupChatScreen")
  ) {
    postButtonStyle = {
      alignItems: "center",
      bottom: -500,
      left: SCREEN_WIDTH * 0.48,
    };
    needY = 500;
    announcementY = 500;
    messageY = 500;
    isUserProfilePicture = true;
  } else {
    postButtonStyle = {
      alignItems: "center",
      bottom: 80,
      left: SCREEN_WIDTH * 0.48,
    };
    needY = buttonMenuAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-70, -190],
    });
    announcementY = buttonMenuAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-70, -70],
    });
    messageY = buttonMenuAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-70, -144],
    });
  }
  if (navigation.isFocused() && currentRouteName === "UserProfilePicture") {
    isUserProfilePicture = true;
  } else {
    isUserProfilePicture = false;
  }
};

AnnouncementsStack.navigationOptions = ({ navigation }) => {
  const routes = navigation.state.routes;
  const currentRouteName = routes[routes.length - 1].routeName;

  if (
    navigation.isFocused() &&
    (currentRouteName === "PostDetail" ||
      currentRouteName === "UserProfilePicture" ||
      currentRouteName === "ChatScreen" ||
      currentRouteName === "GroupChatScreen")
  ) {
    postButtonStyle = {
      alignItems: "center",
      bottom: -500,
      left: SCREEN_WIDTH * 0.48,
    };
    needY = 500;
    announcementY = 500;
    messageY = 500;
  }

  let tabBarVisible = true;
  if (currentRouteName === "UserProfilePicture") {
    tabBarVisible = false;
  }
  if (navigation.isFocused() && currentRouteName === "UserProfilePicture") {
    isUserProfilePicture = true;
    return {
      isUserProfilePicture,
    };
  } else {
    return (isUserProfilePicture = false);
  }
};

NotificationsStack.navigationOptions = ({ navigation }) => {
  const routes = navigation.state.routes;
  const currentRouteName = routes[routes.length - 1].routeName;
  if (
    navigation.isFocused() &&
    (currentRouteName === "PostDetail" ||
      currentRouteName === "UserProfilePicture" ||
      currentRouteName === "ChatScreen" ||
      currentRouteName === "GroupChatScreen")
  ) {
    postButtonStyle = {
      alignItems: "center",
      bottom: -500,
      left: SCREEN_WIDTH * 0.48,
    };
    needY = 500;
    announcementY = 500;
    messageY = 500;
  }

  let tabBarVisible = true;
  if (currentRouteName === "UserProfilePicture") {
    tabBarVisible = false;
  }
  if (navigation.isFocused() && currentRouteName === "UserProfilePicture") {
    isUserProfilePicture = true;
  }
};

BottomTabStackContainer.navigationOptions = ({ navigation }) => {
  let drawerLockMode = "unlocked";
  let tabBarVisible = false;
  const homeStack = navigation.state.routes[0].routes[0].routes[0];
  const announcementsStack = navigation.state.routes[0].routes[1];
  const directoryStack = navigation.state.routes[0].routes[6];
  const notificationsStack = navigation.state.routes[0].routes[7];
  const shopStack = navigation.state.routes[0].routes[8];
  if (
    navigation.state.routes[0].routes[0]["index"] > 0 ||
    navigation.state.routes.length > 1 ||
    navigation.state.routes[0].routes[0].routes[0].routes.length > 1 ||
    (navigation.state.routes[0].routes[6].index === 0 &&
      navigation.state.routes[0].routes[6].routes[0].index === 1) ||
    homeStack.routes[homeStack.routes.length - 1].routeName ===
      "UserProfilePicture" ||
    announcementsStack.routes[announcementsStack.routes.length - 1]
      .routeName === "UserProfilePicture" ||
    directoryStack.routes[directoryStack.routes.length - 1].routeName ===
      "UserProfilePicture" ||
    notificationsStack.routes[notificationsStack.routes.length - 1]
      .routeName === "UserProfilePicture" ||
    shopStack.routes[shopStack.routes.length - 1].routeName ===
      "UserProfilePicture"
  ) {
    drawerLockMode = "locked-closed";
  }
  return {
    drawerLockMode,
    tabBarVisible,
  };
};

DrawerNav.navigationOptions = ({ navigation }) => {
  let swipeEnabled = true;
  const HomeStack = navigation.state.routes[0].routes[0].routes[0].routes[0];
  const AnnouncementsStack = navigation.state.routes[0].routes[0].routes[1];
  const DirectoryStack = navigation.state.routes[0].routes[0].routes[6];
  const NotificationsStack = navigation.state.routes[0].routes[0].routes[7];
  const ShopStack = navigation.state.routes[0].routes[0].routes[8];

  if (
    navigation.state.isDrawerOpen ||
    navigation.state.routes[0].routes.length > 1 ||
    HomeStack.index > 0 ||
    AnnouncementsStack.index > 0 ||
    NotificationsStack.index > 0 ||
    ShopStack.index > 0 ||
    DirectoryStack.index > 0
  ) {
    swipeEnabled = false;
  } else {
    swipeEnabled = true;
  }
  return {
    swipeEnabled,
  };
};

// ---- MAIN NAVIGATION ---- //
const SwipeTabNavigator = createMaterialTopTabNavigator(
  {
    Main: {
      screen: DrawerNav,
    },
    Messages: {
      screen: MessagesStack,
    },
  },
  {
    tabBarOptions: {
      style: { height: 0 },
    },
  }
);

MessagesStack.navigationOptions = ({ navigation }) => {
  let swipeEnabled = true;
  if (navigation.state.index > 0) {
    swipeEnabled = false;
  }
  return {
    swipeEnabled,
  };
};

export const authOnboardingNavOptions = {
  headerTitleStyle: {
    fontFamily: "open-sans-bold",
  },
  headerBackTitleStyle: {
    fontFamily: "open-sans",
  },
  headerTintColor: Platform.OS === "android" ? "white" : Colors.primary,
  headerBackTitleVisible: false,
  headerTransparent: true,
  headerStyle: {
    borderBottomWidth: 20,
    borderBottomColor: "transparent",
    // backgroundColor: '#1B1B1B',
  },
  headerTitle: "",
  // headerTitle: () => (
  //     <TouchableCmp
  //         onPress={() => {}}
  //         activeOpacity={Platform.OS === 'ios' ? 0.6 : null}
  //     >
  //         <View style={{width: SCREEN_WIDTH * 0.60, alignItems: 'center'}}>
  //             <Image
  //                 source={require('../assets/lnb.png')}
  //                 resizeMode='contain'
  //                 style={{width:38, height:38}}
  //             />
  //         </View>
  //     </TouchableCmp>
  // )
};
const AuthNavigator = createStackNavigator(
  {
    Intro: {
      screen: IntroScreen,
    },
    Auth: {
      screen: AuthScreen,
      navigationOptions: {
        // gestureResponseDistance: 400
      },
    },
    SignUp: {
      screen: EmailScreen,
    },
    DisplayName: {
      screen: DisplayNameScreen,
    },
    Password: {
      screen: PasswordScreen,
    },
  },
  {
    defaultNavigationOptions: authOnboardingNavOptions,
  }
);

const OnboardingNavigator = createStackNavigator(
  {
    ChooseProfilePicture: ChooseProfilePictureScreen,
    CreateHeadline: CreateHeadlineScreen,
    CreateBio: CreateBioScreen,
    EnterLocation: EnterLocationScreen,
  },
  {
    defaultNavigationOptions: authOnboardingNavOptions,
  }
);

// ----- SWITCH ----- //
const AppNavigator = createSwitchNavigator({
  Loading: LoadingScreen,
  AuthNav: AuthNavigator,
  Onboarding: OnboardingNavigator,
  App: SwipeTabNavigator,
});

export default createAppContainer(AppNavigator);
