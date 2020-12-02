import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const EventTypeScreen = (props) => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          props.navigation.push("EventDetails", {
            eventType: "event type",
          });
        }}
      >
        <Text>EVENT TYPE</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EventTypeScreen;
