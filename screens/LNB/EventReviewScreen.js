import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const EventReviewScreen = (props) => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          props.navigation.push("EventType", {
            eventType: "event type",
          });
        }}
      >
        <Text>EVENT REVIEW</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EventReviewScreen;
