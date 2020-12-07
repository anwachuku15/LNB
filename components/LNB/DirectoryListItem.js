import React from "react";
import {
  Platform,
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
// import CachedImage from '../../components/LNB/CachedImage'
import CachedImage from "./CachedImageCmp";
import { ListItem } from "react-native-elements";
import Colors from "../../constants/Colors";
import TouchableCmp from "./TouchableCmp";
import { MaterialIcons } from "@expo/vector-icons";

const DirectoryListItem = (props) => {
  const {
    item,
    authId,
    styles,
    navToUserProfile,
    text,
    background,
    userConnectionIds,
    outgoingRequests,
    incomingRequests,
    requestedUsers,
    connectedUsers,
    connectReqHandler,
    unrequestHandler,
    disconnectHandler,
    dispatch,
    getUser,
  } = props;

  return (
    <TouchableCmp
      onPress={async () => {
        await getUser(item.userId);
        navToUserProfile(item.userId, item.displayName);
      }}
    >
      <ListItem
        containerStyle={{
          backgroundColor: background,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
        leftAvatar={{
          source: { uri: item.imageUrl },
          containerStyle: {
            height: 64,
            width: 64,
            borderRadius: 32,
          },
          // ImageComponent: () => (
          //     <CachedImage
          //         source={{uri: item.imageUrl}}
          //         style={{height: 64, width: 64, borderRadius: 32}}
          //     />
          // ),
          rounded: true,
        }}
        title={
          <Text style={{ color: text, fontSize: 16 }}>{item.displayName}</Text>
        }
        subtitle={
          <View style={{ flexDirection: "column" }}>
            {item.headline.length > 0 && (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ color: Colors.disabled, fontSize: 14 }}
              >
                {item.headline}
              </Text>
            )}
            {item.location.length > 0 && (
              <Text style={{ color: Colors.disabled, fontSize: 12 }}>
                {item.location}
              </Text>
            )}
          </View>
        }
        rightElement={
          item.userId !== authId ? (
            <View style={styles.buttonContainer}>
              {userConnectionIds &&
                outgoingRequests &&
                incomingRequests &&
                !userConnectionIds.includes(item.userId) &&
                !incomingRequests.includes(item.userId) &&
                !outgoingRequests.includes(item.userId) &&
                !requestedUsers.includes(item.userId) && (
                  <TouchableCmp
                    style={styles.connectButton}
                    onPress={() => {
                      connectReqHandler(item);
                    }}
                  >
                    <Text style={styles.connectText}>Connect</Text>
                  </TouchableCmp>
                )}
              {(outgoingRequests.includes(item.userId) ||
                requestedUsers.includes(item.userId)) && (
                <TouchableCmp
                  style={styles.requestedButton}
                  onPress={() => {
                    unrequestHandler(authId, item.userId);
                  }}
                >
                  <Text style={styles.requestedText}>Requested</Text>
                </TouchableCmp>
              )}
              {incomingRequests.includes(item.userId) && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingHorizontal: 10,
                  }}
                >
                  <TouchableCmp
                    style={styles.declineButton}
                    onPress={() => props.navigation.navigate("ConnectRequests")}
                  >
                    {/* <Text style={styles.declineText}>Decline</Text> */}
                    <MaterialIcons
                      name="close"
                      size={18}
                      color={Colors.raspberry}
                    />
                  </TouchableCmp>

                  <TouchableCmp
                    style={styles.acceptButton}
                    onPress={() => props.navigation.navigate("ConnectRequests")}
                  >
                    {/* <Text style={styles.acceptText}>Accept</Text> */}
                    <MaterialIcons
                      name="check"
                      size={18}
                      color={Colors.green}
                    />
                  </TouchableCmp>
                </View>
              )}
              {(userConnectionIds.includes(item.userId) ||
                connectedUsers.includes(item.userId)) && (
                <TouchableCmp
                  style={styles.connectedButton}
                  onPress={() => {
                    disconnectHandler(authId, item.userId, item.displayName);
                  }}
                >
                  <Text style={styles.connectedText}>Connected</Text>
                </TouchableCmp>
              )}
              {/* <TouchableCmp
                style={styles.messageButton}
                onPress={async () => {
                  await dispatch(getUser(item.userId));
                  props.navigation.push("ChatScreen", {
                    selectedUserId: item.userId,
                    userName: item.displayName,
                    userImage: item.imageUrl,
                  });
                }}
              >
                <Text style={styles.messageText}>Message</Text>
              </TouchableCmp> */}
            </View>
          ) : null
        }
        // bottomDivider
      />
    </TouchableCmp>
  );
};

export default DirectoryListItem;
