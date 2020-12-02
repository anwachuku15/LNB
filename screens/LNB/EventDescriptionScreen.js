import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const EventDescriptionScreen = (props) => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          props.navigation.push("EventReview", {
            eventType: "event type",
          });
        }}
      >
        <Text>EVENT DESCRIPTION</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EventDescriptionScreen;
