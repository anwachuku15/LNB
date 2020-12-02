import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const EventDetailsScreen = (props) => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          props.navigation.push("EventLocation", {
            eventType: "event type",
          });
        }}
      >
        <Text>EVENT DETAILS</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EventDetailsScreen;
