import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const EventLocationScreen = (props) => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          props.navigation.push("EventDescription", {
            eventType: "event type",
          });
        }}
      >
        <Text>EVENT LOCATION</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EventLocationScreen;
