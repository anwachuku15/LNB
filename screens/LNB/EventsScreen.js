import React, { useState, useCallback, useEffect } from "react";
import {
  Platform,
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Clipboard from "@react-native-community/clipboard";
// REDUX
import { useSelector, useDispatch } from "react-redux";
import Colors from "../../constants/Colors";
import { useColorScheme } from "react-native-appearance";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import HeaderButton from "../../components/UI/HeaderButton";
import MessageIcon from "../../components/LNB/MessageIcon";
import { FontAwesome } from "@expo/vector-icons";
import { fetchNeeds } from "../../redux/actions/postsActions";
import NeedPost from "../../components/LNB/NeedPost";

let themeColor;
let text;
const EventsScreen = (props) => {
  const dispatch = useDispatch();

  const colorScheme = useColorScheme();
  let text;
  if (colorScheme === "dark") {
    themeColor = "black";
    text = "white";
  } else {
    themeColor = "white";
    text = "black";
  }

  const userId = useSelector((state) => state.auth.userId);
  const eventPosts = useSelector((state) =>
    state.posts.allNeeds.filter((need) => need.postType === "event")
  );
  const authEvents = useSelector((state) =>
    state.posts.allNeeds.filter(
      (need) => need.uid === userId && need.postType === "event"
    )
  );
  const pinned = authEvents.find((post) => post.isPinned === true);

  const [isMounted, setIsMounted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState();

  const [showNeedActions, setShowNeedActions] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState();
  const [isDeletable, setIsDeletable] = useState(false);

  const loadData = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      await dispatch(fetchNeeds());
    } catch (err) {
      setError(err.message);
    }
    setIsRefreshing(false);
  }, [dispatch, setIsRefreshing, setError]);

  useEffect(() => {
    setShowNeedActions(true);
    setIsMounted(true);

    setIsLoading(true);
    if (isMounted) {
      loadData().then(() => {
        setIsLoading(false);
      });
    }
    return () => {
      setShowNeedActions(false);
      setIsMounted(false);
    };
  }, [dispatch, loadData, isMounted, showNeedActions]);

  // NAV LISTENER
  useEffect(() => {
    const willFocusSub = props.navigation.addListener("willFocus", loadData);
    return () => {
      willFocusSub.remove();
    };
  }, [loadData]);

  if (isMounted && error) {
    return (
      <View style={styles.spinner}>
        <Text>An error occured</Text>
        <Button title="try again" onPress={loadData} color={Colors.primary} />
      </View>
    );
  }

  if (isMounted && isLoading) {
    return (
      <View style={styles.spinner}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isMounted && !isLoading && eventPosts.length === 0) {
    return (
      <View style={styles.spinner}>
        <Text>No needs found.</Text>
      </View>
    );
  }

  // POST HANDLERS
  const deleteHandler = (needId) => {
    Alert.alert("Delete Need", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          setIsModalVisible(!isModalVisible);
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            deleteNeed(needId);
            setIsModalVisible(!isModalVisible);
            setIsRefreshing(true);
            loadData().then(() => {
              setIsRefreshing(false);
            });
          } catch (err) {
            alert(err);
            console.log(err);
          }
        },
      },
    ]);
  };

  const pinHandler = (needId, uid) => {
    Alert.alert(
      "Pin Need",
      "This will appear at the top of your profile and replace any previously pinned need. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            setIsModalVisible(!isModalVisible);
            setSelectedNeed();
          },
        },
        {
          text: "Pin",
          style: "default",
          onPress: async () => {
            setIsModalVisible(!isModalVisible);
            pinNeed(needId, uid);
          },
        },
      ]
    );
  };

  const unpinHandler = (needId) => {
    Alert.alert("Unpin Need", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          setIsModalVisible(!isModalVisible);
          setSelectedNeed();
        },
      },
      {
        text: "Unpin",
        style: "destructive",
        onPress: async () => {
          try {
            unpinNeed(needId);
            setIsModalVisible(!isModalVisible);
          } catch (err) {
            alert(err);
            console.log(err);
          }
        },
      },
    ]);
  };

  // NAVIGATION METHODS
  const navToPostDetail = (needId, postType) => {
    props.navigation.push("PostDetail", {
      needId: needId,
      from: "EventsScreen",
      postType: postType,
    });
  };

  const commentButtonHandler = (needId, userName) => {
    dispatch(getNeed(needId));
    props.navigation.navigate({
      routeName: "commentModal",
      params: {
        needId: needId,
        userName: userName,
      },
    });
  };

  const selectUserHandler = (userId, userName) => {
    props.navigation.navigate({
      routeName: "UserProfile",
      params: {
        userId: userId,
        name: userName,
        from: "EventsScreen",
      },
    });
  };

  const from = "EventsScreen";
  const renderItem = ({ item }) => (
    <NeedPost
      navigation={props.navigation}
      navToPostDetail={navToPostDetail}
      // from={from}
      item={item}
      pinned={pinned}
      pinHandler={pinHandler}
      unpinHandler={unpinHandler}
      selectUserHandler={selectUserHandler}
      isDeletable={isDeletable}
      setIsDeletable={setIsDeletable}
      selectedNeed={selectedNeed}
      setSelectedNeed={setSelectedNeed}
      isModalVisible={isModalVisible}
      setIsModalVisible={setIsModalVisible}
      deleteHandler={deleteHandler}
      commentButtonHandler={commentButtonHandler}
      showNeedActions={showNeedActions}
      setShowNeedActions={setShowNeedActions}
    />
  );

  return (
    <SafeAreaView style={styles.screen}>
      {/* <View style={styles.header}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Back'
                        iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        onPress={() => {props.navigation.goBack()}}
                    />
                </HeaderButtons>
                <Text style={styles.headerTitle}>Events</Text>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        // ButtonElement={<MessageIcon/>}
                        iconName={Platform.OS==='android' ? 'md-more' : 'ios-more'}
                        title='more'
                        onPress={() => {}}
                    />
                </HeaderButtons>
            </View> */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: Colors.socialdark }}>Under Construction</Text>
        <FontAwesome
          name="gears"
          size={40}
          style={{ marginTop: 10 }}
          color={Colors.primary}
        />
      </View>

      <FlatList
        //   ref={flatListRef}
        keyExtractor={(item, index) => index.toString()}
        data={eventPosts}
        onRefresh={loadData}
        refreshing={isRefreshing}
        style={styles.feed}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};

EventsScreen.navigationOptions = (navData) => {
  return {
    headerTitle: "Events",
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: themeColor,
  },
  spinner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: themeColor,
    borderBottomColor: Colors.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    color: Colors.primary,
    fontFamily: "open-sans-bold",
    fontSize: 17,
    fontWeight: "500",
  },
  feed: {
    marginTop: 5,
  },
});

export default EventsScreen;
