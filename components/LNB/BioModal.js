import React, { useEffect, useCallback, useState } from "react";
import {
  Alert,
  View,
  StyleSheet,
  Image,
  Text,
  Modal,
  TouchableHighlight,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { useDispatch } from "react-redux";
import { getUser } from "../../redux/actions/authActions";
import { Video } from "expo-av";

import CustomModal from "react-native-modal";

import TouchableCmp from "./TouchableCmp";
import Colors from "../../constants/Colors";
import { useColorScheme } from "react-native-appearance";
import Lightbox from "react-native-lightbox";
import Hyperlink from "react-native-hyperlink";
import moment from "moment";

let themeColor, text;
const BioModal = (props) => {
  const scheme = useColorScheme();
  if (scheme === "dark") {
    themeColor = "black";
    text = "white";
  } else {
    themeColor = "white";
    text = "black";
  }

  const [isBioVisible, setIsBioVisible] = useState(false);
  const dispatch = useDispatch();
  const { styles, user } = props;
  return (
    <View>
      <TouchableCmp
        style={styles.bioButton}
        onPress={() => setIsBioVisible(!isBioVisible)}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>About Me</Text>
      </TouchableCmp>

      {isBioVisible && (
        <CustomModal
          swipeDirection="down"
          onSwipeCancel={() => setIsBioVisible(!isBioVisible)}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          style={{ marginBottom: 0 }}
          isVisible={isBioVisible}
          // animationType='slide'
          // transparent={true}
          // visible={isBioVisible}
        >
          <View style={styles.modalView}>
            <View
              style={{
                ...styles.modal,
                backgroundColor: scheme === "dark" ? Colors.darkModal : "white",
              }}
            >
              <View
                style={{
                  alignSelf: "center",
                  marginTop: 7,
                  marginBottom: 10,
                  width: "10%",
                  borderRadius: 50,
                  height: 5,
                  backgroundColor:
                    scheme === "dark" ? Colors.darkSearch : Colors.lightSearch,
                }}
              />
              <View style={{ margin: 10, alignItems: "flex-start" }}>
                <Text
                  style={{
                    color: Colors.primary,
                    fontSize: 24,
                    marginBottom: 5,
                    fontFamily: "poppinsBold",
                    // alignSelf: "center",
                  }}
                >
                  {user.displayName}
                </Text>
                <Text
                  style={{
                    color: Colors.green,
                    fontSize: 18,
                    fontFamily: "poppins",
                  }}
                >
                  About me
                </Text>
                <Text
                  style={{
                    color: text,
                    fontSize: 16,
                    marginBottom: 10,
                    textAlign: "flex-start",
                  }}
                >
                  {user.bio}
                </Text>

                <Text
                  style={{
                    color: Colors.green,
                    fontSize: 18,
                    fontFamily: "poppins",
                  }}
                >
                  Contact
                </Text>
                <TouchableCmp
                  onPress={async () => {
                    await dispatch(getUser(user.userId));
                    props.navigation.push("ChatScreen", {
                      selectedUserId: user.userId,
                      userName: user.displayName,
                      userImage: user.imageUrl,
                    });
                  }}
                  style={{
                    backgroundColor: Colors.blue,
                    borderRadius: 5,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 16 }}>Message</Text>
                </TouchableCmp>
                {/* <Text style={{color:text, fontSize: 16}}>{user.email}</Text> */}
              </View>
              <TouchableCmp
                style={{
                  marginTop: 10,
                  backgroundColor:
                    scheme === "dark" ? Colors.darkSearch : Colors.lightSearch,
                  borderRadius: 20,
                  padding: 12,
                }}
                onPress={() => {
                  setIsBioVisible(!isBioVisible);
                }}
              >
                <Text
                  style={{
                    ...styles.modalButtonText,
                    fontWeight: "bold",
                    textAlign: "center",
                    color: scheme === "dark" ? "white" : "black",
                  }}
                >
                  Dismiss
                </Text>
              </TouchableCmp>
            </View>
          </View>
        </CustomModal>
      )}
    </View>
  );
};

export default BioModal;
