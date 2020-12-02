import React, { useRef } from "react";
import { withNavigation } from "react-navigation";
import {
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import {
  FontAwesome,
  FontAwesome5,
  Feather,
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import TouchableCmp from "../LNB/TouchableCmp";
import { useColorScheme } from "react-native-appearance";
import Colors from "../../constants/Colors";

/* 
MaterialCommunityIcons
    calendar-edit 
    account-edit
    square-edit-outline
    message-plus
MaterialIcons
    edit
    create
FontAwesome5
    user-edit
*/
const PostTabButton = (props) => {
  const scheme = useColorScheme();
  let icon, icon2, createButtonColor;
  if (scheme === "dark") {
    icon = "white";
    icon2 = "black";
    createButtonColor = Colors.darkHeader;
  } else {
    icon = "black";
    icon2 = "white";
    createButtonColor = Colors.lightHeader;
  }

  const createButtonSize = new Animated.Value(1);
  const animation = new Animated.Value(0);

  const toggleCreateMenu = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(createButtonSize, {
          toValue: 0.97,
          duration: 50,
        }),
        Animated.timing(createButtonSize, {
          toValue: 1,
        }),
      ]),
      Animated.spring(animation, {
        toValue: animation._value === 0 ? 1 : 0,
      }),
    ]).start();
  };

  const navToPostModal = () => {
    toggleCreateMenu();
    // console.log(props)
  };

  const createButtonStyle = {
    transform: [
      {
        scale: createButtonSize,
      },
    ],
  };

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "45deg"],
        }),
      },
    ],
  };

  const announcementX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, -100],
  });
  const announcementY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, -100],
  });

  const needX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, -24],
  });
  const needY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, -150],
  });

  const messageX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, 52],
  });
  const messageY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, -100],
  });
  return (
    <TouchableWithoutFeedback onPress={toggleCreateMenu}>
      <View style={styles.button}>
        <Animated.View
          style={{
            position: "absolute",
            left: announcementX,
            top: announcementY,
          }}
        >
          <View
            style={{
              ...styles.secondaryButton,
              backgroundColor: Colors.redcrayola,
            }}
          >
            <MaterialCommunityIcons
              name="calendar-edit"
              size={24}
              color="white"
            />
            {/* <AntDesign name='notification' size={24} color='white' /> */}
          </View>
        </Animated.View>
        <TouchableWithoutFeedback onPress={navToPostModal}>
          <Animated.View
            style={{ position: "absolute", left: needX, top: needY }}
          >
            <View
              style={{
                ...styles.secondaryButton,
                backgroundColor: Colors.primary,
              }}
            >
              <MaterialIcons name="create" size={24} color="white" />
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
        <Animated.View
          style={{ position: "absolute", left: messageX, top: messageY }}
        >
          <View
            style={{ ...styles.secondaryButton, backgroundColor: Colors.blue }}
          >
            <MaterialCommunityIcons
              name="message-plus"
              size={24}
              color="white"
            />
          </View>
        </Animated.View>
        <Animated.View
          style={[
            {
              ...styles.createButton,
              backgroundColor: createButtonColor,
              borderColor: Colors.primary,
              borderWidth: 2,
            },
            createButtonStyle,
          ]}
        >
          <Animated.View style={[rotation]}>
            <FontAwesome name="plus" size={24} color={Colors.primary} />
          </Animated.View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    // position: 'absolute',
    alignItems: "center",
    // bottom: -10,
  },
  createButton: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    position: "absolute",
    top: -60,
    // top: -100,
    // left: 130,
    // shadowColor: Colors.primary,
    // shadowRadius: 5,
    // shadowOffset: {height: 10},
    // shadowOpacity: 0.3,
    // borderWidth: 3,
    borderColor: "white",
  },
  secondaryButton: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});

export default PostTabButton;
