import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Alert,
  Platform,
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Button,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  SafeAreaView,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  Keyboard,
} from "react-native";
import { StackActions, NavigationActions } from "react-navigation";
import { ListItem } from "react-native-elements";

import {
  Ionicons,
  FontAwesome,
  FontAwesome5,
  SimpleLineIcons,
  AntDesign,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import CustomModal from "react-native-modal";
// REDUX
import { useSelector, useDispatch } from "react-redux";
import Colors from "../../constants/Colors";
import { useColorScheme } from "react-native-appearance";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import HeaderButton from "../../components/UI/HeaderButton";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { Camera } from "expo-camera";
import { Video } from "expo-av";
import VideoPlayer from "expo-video-player";
import prettyms from "pretty-ms";

import Fire from "../../Firebase/Firebase";
import { createNeed } from "../../redux/actions/postsActions";
import UserPermissions from "../../util/UserPermissions";
import TouchableCmp from "../../components/LNB/TouchableCmp";
import CameraModal from "../../components/LNB/CameraModal";
import Lightbox from "react-native-lightbox";

import moment from "moment";

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SCREEN_HEIGHT = Dimensions.get("screen").height;
const BASE_PADDING = 10;

const CreatePostScreen = (props) => {
  const scheme = useColorScheme();

  const userName = useSelector((state) => state.auth.credentials.displayName);
  const userImage = useSelector((state) => state.auth.credentials.imageUrl);
  const authId = useSelector((state) => state.auth.userId);

  const uri = props.navigation.getParam("uri");
  const existingBody = props.navigation.getParam("existingBody");

  const allUsers = useSelector((state) => state.auth.allUsers);

  const dispatch = useDispatch();

  let text, postOptionsBorderTopColor, postOptionsBackground, background;
  if (scheme === "dark") {
    text = "white";
    background = "black";
    postOptionsBackground = "black";
    postOptionsBorderTopColor = Colors.darkSearch;
  } else {
    text = "black";
    background = "white";
    postOptionsBackground = "white";
    postOptionsBorderTopColor = Colors.lightSearch;
  }

  const [isLoading, setIsLoading] = useState(false);
  const [body, setBody] = useState(existingBody ? existingBody : "");
  const [media, setMedia] = useState(uri ? uri : null);
  const [mediaAssets, setMediaAssets] = useState();
  const [mediaScroll, setMediaScroll] = useState(true);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [cameraView, setCameraView] = useState(Camera.Constants.Type.back);
  const [cameraFlashMode, setCameraFlashMode] = useState(
    Camera.Constants.FlashMode.off
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [postType, setPostType] = useState("need");
  const [placeholder, setPlaceholder] = useState("What do you need?");

  const [isMentioning, setIsMentioning] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [taggedUsers, setTaggedUsers] = useState([]);

  const searchInput = useRef(null);
  const textInput = useRef(null);

  const loadMediaAssets = useCallback(async () => {
    try {
      const photos = await MediaLibrary.getAssetsAsync({ mediaType: "photo" });
      const videos = await MediaLibrary.getAssetsAsync({ mediaType: "video" });
      // const screenshots = await MediaLibrary.getAssetsAsync({mediaSubtypes: ['screenshot']})

      let mediaAssets = [];
      if (photos.assets.length > 0) {
        let limit = photos.assets.length > 9 ? 10 : photos.assets.length;
        let i = 0;
        while (i < limit) {
          mediaAssets.push({
            uri: photos.assets[i].uri,
            mediaType: photos.assets[i].mediaType,
            height: photos.assets[i].height,
            width: photos.assets[i].width,
            creationTime: photos.assets[i].creationTime,
          });
          i++;
        }
      }
      if (videos.assets.length > 0) {
        let limit = videos.assets.length > 9 ? 10 : videos.assets.length;
        let i = 0;
        while (i < limit) {
          mediaAssets.push({
            id: videos.assets[i].id,
            uri: videos.assets[i].uri,
            localUri: await MediaLibrary.getAssetInfoAsync(videos.assets[i].id)
              .then((doc) => {
                return doc.localUri;
              })
              .catch((err) => console.log(err)),
            mediaType: videos.assets[i].mediaType,
            height: videos.assets[i].height,
            width: videos.assets[i].width,
            duration: videos.assets[i].duration,
            creationTime: videos.assets[i].creationTime,
          });
          i++;
        }
      }

      mediaAssets.sort((a, b) => (a.creationTime > b.creationTime ? -1 : 1));
      mediaAssets.splice(10);
      setMediaAssets(mediaAssets);
    } catch (err) {
      console.log(err);
    }
  }, [setMediaAssets]);

  useEffect(() => {
    loadMediaAssets().catch((err) => console.log(err));
    if (media !== null) {
      setMediaScroll(false);
    }
    return () => {
      loadMediaAssets;
    };
  }, [loadMediaAssets]);

  // useEffect(() => {
  //     getPhotoPermission()
  // }, [getPhotoPermission])

  const getPhotoPermission = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

      if (status != "granted") {
        alert("We need permission to access your camera roll");
      }
    }
  };

  const toggleCamera = async () => {
    if (Constants.platform.ios) {
      const { status } = await Camera.requestPermissionsAsync();
      if (status != "granted") {
        alert("We need permission to access your camera");
      } else {
        setIsCameraVisible(!isCameraVisible);
      }
    }
  };

  const pickMedia = async () => {
    UserPermissions.getCameraRollPermission();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // ImagePicker.MediaTypeOptions.Images & ImagePicker.MediaTypeOptions.Videos for Android
      allowsEditing: false,
      // aspect: [4,3],
    });

    if (!result.cancelled) {
      if (result.type === "video") {
        // MediaLibrary.getAssetInfoAsync()
        console.log(result.uri);
        setMedia({
          type: "video",
          uri: result.uri,
          localUri: result.uri,
          duration: result.duration,
          width: result.width,
          height: result.height,
        });
      } else if (result.type === "image")
        setMedia({
          type: "image",
          uri: result.uri,
          width: result.width,
          height: result.height,
        });
      setMediaScroll(false);
      // console.log(result)
    }
  };

  // KEEP FOR EDITING (TRIM/CROP)
  const pickImage = async () => {
    UserPermissions.getCameraPermission();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // ImagePicker.MediaTypeOptions.Images & ImagePicker.MediaTypeOptions.Videos for Android
      allowsEditing: false,
      // aspect: [4,3],
    });

    if (!result.cancelled) {
      setMedia({
        type: "image",
        uri: result.uri,
        width: result.width,
        height: result.height,
      });
      setMediaScroll(false);
    }
  };
  const pickVideo = async () => {
    UserPermissions.getCameraPermission();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos, // ImagePicker.MediaTypeOptions.Images & ImagePicker.MediaTypeOptions.Videos for Android
      allowsEditing: true,
      // videoExportPreset: 0
    });

    if (!result.cancelled) {
      setMedia({
        type: "video",
        uri: result.uri,
        duration: result.duration,
        width: result.width,
        height: result.height,
      });
      setMediaScroll(false);
    }
  };

  const useCamera = async () => {
    UserPermissions.getCameraRollPermission();
    UserPermissions.getUseCameraPermission();
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });
    if (!result.cancelled) {
      if (result.type === "image")
        setMedia({
          type: "image",
          uri: result.uri,
          width: result.width,
          height: result.height,
        });
      else if (result.type === "video")
        setMedia({
          type: "video",
          localUri: result.uri,
          uri: result.uri,
          duration: result.duration,
          width: result.width,
          height: result.height,
        });
    }
  };

  const handlePost = async (userName, body, media) => {
    // taggedUsers.forEach(user => {
    //     if (!body.includes(user.name)) {
    //         taggedUsers.splice(taggedUsers.indexOf(taggedUsers.find(tagged => tagged.uid === user.uid)), 1)
    //         setTaggedUsers(taggedUsers)
    //     }
    // })

    try {
      if (media) {
        await dispatch(
          createNeed(userName, body.trimEnd(), media, postType, taggedUsers)
        );
      } else {
        await dispatch(
          createNeed(userName, body.trimEnd(), "", postType, taggedUsers)
        );
      }
      setBody("");
      setMedia(null);
      props.navigation.goBack();
    } catch (err) {
      alert(err);
      console.log(err);
    }
  };

  const updateSearch = (text) => {
    setSearch(text);
    if (text.includes("  ") || text.includes(".")) {
      setIsMentioning(false);
    } else {
      const newResults = allUsers.filter((result) => {
        const resultData = `${result.name.toUpperCase()}`;
        const query = text.toUpperCase();

        return resultData.includes(query);
      });
      setResults(newResults);
    }
  };

  const cancelSearch = () => {
    searchInput.current.blur();
  };

  const tagUser = (uid, name) => {
    const text = textInput.current._getText();
    const index = text.lastIndexOf("@");
    const endIndex = text.trim().length;
    const newText = text.slice(0, index);
    setBody(newText + name);
    taggedUsers.push({
      uid,
      name,
    });
    setTaggedUsers(taggedUsers);
    setIsMentioning(false);
  };

  const renderItem = ({ item }) => (
    <TouchableCmp
      onPress={() => {
        tagUser(item.uid, item.name);
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
          rounded: true,
        }}
        title={<Text style={{ color: text, fontSize: 14 }}>{item.name}</Text>}
      />
    </TouchableCmp>
  );

  const memoizedItem = useMemo(() => {
    return renderItem;
  }, []);

  const navToCamera = StackActions.replace({
    routeName: "cameraModal",
    params: {
      body: body,
    },
  });

  const mediaItem = ({ item }) => {
    let duration;
    if (item.duration) {
      duration = prettyms(Math.round(item.duration) * 1000, {
        colonNotation: true,
      });
    }
    return (
      <TouchableCmp
        onPress={async () => {
          if (item.duration) {
            setMedia({
              type: "video",
              localUri: item.localUri,
              uri: item.uri,
              duration: item.duration,
              width: item.width,
              height: item.height,
            });
          } else
            setMedia({
              type: "image",
              uri: item.uri,
              width: item.width,
              height: item.height,
            });
          setMediaScroll(false);
          Keyboard.dismiss();
        }}
      >
        {item.duration ? (
          <ImageBackground
            source={{ uri: item.uri }}
            imageStyle={styles.videoImage}
            style={styles.videoAssetContainer}
          >
            <View
              style={{
                alignSelf: "flex-end",
                backgroundColor: "rgba(120, 120, 120, 0.5)",
                borderRadius: 5,
                padding: 2,
              }}
            >
              <Text style={{ color: "white", fontSize: 14 }}>{duration}</Text>
            </View>
          </ImageBackground>
        ) : (
          <Image
            source={{ uri: item.uri }}
            style={styles.mediaAssetContainer}
          />
        )}
      </TouchableCmp>
    );
  };

  return (
    <View style={{ ...styles.screen, backgroundColor: background }}>
      {/* HEADER */}
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Ionicons name="md-close" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableCmp
            onPress={() => setIsModalVisible(!isModalVisible)}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            {postType === "need" && (
              <Text style={{ color: text, fontFamily: "open-sans-bold" }}>
                Need
              </Text>
            )}
            {postType === "post" && (
              <Text style={{ color: text, fontFamily: "open-sans-bold" }}>
                Post
              </Text>
            )}
            {postType === "opportunity" && (
              <Text style={{ color: text, fontFamily: "open-sans-bold" }}>
                Opportunity
              </Text>
            )}
            {postType === "idea" && (
              <Text style={{ color: text, fontFamily: "open-sans-bold" }}>
                Idea
              </Text>
            )}
            {postType === "event" && (
              <Text style={{ color: text, fontFamily: "open-sans-bold" }}>
                Event
              </Text>
            )}
            <FontAwesome5
              name="chevron-down"
              size={12}
              color={"black"}
              style={{ marginLeft: 5 }}
            />
          </TouchableCmp>
          <TouchableOpacity
            onPress={() => handlePost(userName, body, media)}
            disabled={!body.trim().length && !media}
          >
            <Text
              style={{
                fontWeight: "500",
                color:
                  !body.trim().length && !media
                    ? Colors.disabled
                    : Colors.primary,
              }}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* POST TYPE MODAL */}
      <CustomModal
        isVisible={isModalVisible}
        swipeDirection="down"
        onSwipeCancel={() => setIsModalVisible(!isModalVisible)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={{ marginBottom: 0 }}
        isVisible={isModalVisible}
      >
        <View style={styles.modalView}>
          <View
            style={{
              ...styles.modal,
              backgroundColor:
                scheme === "dark" ? "rgba(20,20,20,0.92" : "white",
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

            <TouchableCmp
              style={styles.modalButton}
              onPress={() => {
                setIsModalVisible(!isModalVisible);
                setPostType("need");
                setPlaceholder("What do you need?");
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 5,
                }}
              >
                <FontAwesome
                  name="hand-paper-o"
                  color={Colors.primary}
                  size={28}
                  style={{ marginRight: 26 }}
                />
                <Text
                  style={{
                    ...styles.modalButtonText,
                    color: Colors.primary,
                  }}
                >
                  Share a Need
                </Text>
              </View>
            </TouchableCmp>

            <TouchableCmp
              style={styles.modalButton}
              onPress={() => {
                setIsModalVisible(!isModalVisible);
                setPostType("post");
                setPlaceholder("What's on your mind?");
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 5,
                }}
              >
                <MaterialCommunityIcons
                  name="pencil-plus"
                  color={Colors.blue}
                  size={28}
                  style={{ marginRight: 26 }}
                />
                <Text
                  style={{
                    ...styles.modalButtonText,
                    color: Colors.blue,
                  }}
                >
                  Share what's on your mind
                </Text>
              </View>
            </TouchableCmp>

            <TouchableCmp
              style={styles.modalButton}
              onPress={() => {
                setIsModalVisible(!isModalVisible);
                setPostType("opportunity");
                setPlaceholder("What's the opportunity?");
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 5,
                }}
              >
                <FontAwesome5
                  name="hands"
                  color={Colors.opportunityGreen}
                  size={28}
                  style={{ marginRight: 26 }}
                />
                <Text
                  style={{
                    ...styles.modalButtonText,
                    color: Colors.opportunityGreen,
                  }}
                >
                  Share an Opportunity
                </Text>
              </View>
            </TouchableCmp>
            <TouchableCmp
              style={styles.modalButton}
              onPress={() => {
                setIsModalVisible(!isModalVisible);
                setPostType("idea");
                setPlaceholder("What's your idea?");
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 5,
                }}
              >
                <FontAwesome5
                  name="lightbulb"
                  color={Colors.orange}
                  size={28}
                  style={{ marginRight: 26 }}
                />
                <Text
                  style={{
                    ...styles.modalButtonText,
                    color: Colors.orange,
                  }}
                >
                  Share an Idea
                </Text>
              </View>
            </TouchableCmp>
            <TouchableCmp
              style={styles.modalButton}
              onPress={() => {
                setIsModalVisible(!isModalVisible);
                setPostType("event");
                setPlaceholder("Share the event details.");
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 5,
                }}
              >
                <FontAwesome
                  name="calendar-plus-o"
                  color={Colors.eventRed}
                  size={28}
                  style={{ marginRight: 26 }}
                />
                <Text
                  style={{
                    ...styles.modalButtonText,
                    color: Colors.eventRed,
                  }}
                >
                  Share an Event
                </Text>
              </View>
            </TouchableCmp>
          </View>
        </View>
      </CustomModal>

      {/* POST AREA */}
      <ScrollView contentContainerStyle={{}} keyboardShouldPersistTaps="always">
        <View style={styles.inputContainer}>
          <Image source={{ uri: userImage }} style={styles.avatar} />
          <TextInput
            ref={textInput}
            autoFocus={true}
            multiline={true}
            numberOfLines={4}
            style={{ flex: 1, color: text, fontSize: 18 }}
            placeholder={placeholder}
            placeholderTextColor={Colors.placeholder}
            onChangeText={(text) => {
              // const index = text.lastIndexOf('@')
              // const end = text.length
              // if (!text.includes('@') || (text.charAt(index-1) !== ' ' && index !== 0)) {
              //     setIsMentioning(false)
              // }
              // if (text.length > 0 && index === text.length-1) {
              //     setIsMentioning(true)
              // }
              // if (isMentioning) {
              //     updateSearch(text.slice(index+1, end))
              // }
              setBody(text);
            }}
            value={body}
          />
        </View>

        <View
          style={{
            marginHorizontal: 32,
            marginTop: 10,
            marginBottom: 20,
            height: "80%",
            width: "80%",
            alignSelf: "center",
          }}
        >
          {media ? (
            media.type === "image" ? (
              <Lightbox
                backgroundColor="rgba(0, 0, 0, 0.8)"
                underlayColor={scheme === "dark" ? "black" : "white"}
                springConfig={{ tension: 15, friction: 7 }}
                renderHeader={(close) => (
                  <TouchableCmp onPress={close} style={styles.closeButton}>
                    <Ionicons name="ios-close" size={36} color="white" />
                  </TouchableCmp>
                )}
                renderContent={() => (
                  <Image
                    source={{ uri: media.uri }}
                    style={styles.lightboxImage}
                  />
                )}
              >
                <ImageBackground
                  source={{ uri: media.uri }}
                  imageStyle={{ borderRadius: 12 }}
                  resizeMethod="auto"
                  style={{
                    alignItems: "flex-end",
                    aspectRatio: media.width / media.height,
                  }}
                >
                  <TouchableCmp
                    style={styles.removeImageButton}
                    onPress={() => {
                      setMedia();
                      setMediaScroll(true);
                      textInput.current.focus();
                    }}
                  >
                    <Ionicons
                      name={
                        Platform.OS === "android" ? "md-close" : "ios-close"
                      }
                      color="white"
                      size={24}
                    />
                  </TouchableCmp>
                </ImageBackground>
              </Lightbox>
            ) : (
              <View style={{ flexDirection: "row" }}>
                <Video
                  source={{ uri: media.localUri }}
                  useNativeControls
                  rate={1.0}
                  volume={1.0}
                  isMuted={true}
                  style={{
                    aspectRatio: media.width / media.height,
                    width: "90%",
                    ...styles.video,
                  }}
                />
                <TouchableCmp
                  style={styles.removeVideoButton}
                  onPress={() => {
                    setMedia();
                    setMediaScroll(true);
                    textInput.current.focus();
                  }}
                >
                  {/* <Text style={{color:'white'}}>Remove video</Text> */}
                  <Ionicons
                    name={Platform.OS === "android" ? "md-close" : "ios-close"}
                    color="white"
                    size={24}
                  />
                </TouchableCmp>
              </View>
            )
          ) : null}
        </View>
      </ScrollView>

      {/* {isMentioning && <View style={{flex: 2, borderWidth: 1, borderColor: Colors.placeholder}}>
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={search.length === 0 ? allUsers : results}
                    renderItem={memoizedItem}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps='always'
                />
            </View>} */}

      {/* POST OPTIONS */}
      <KeyboardAvoidingView behavior="padding">
        {mediaAssets && mediaScroll && (
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={mediaAssets}
            keyboardShouldPersistTaps="always"
            renderItem={mediaItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListHeaderComponent={() => (
              <TouchableCmp
                // onPress={() => props.navigation.dispatch(navToCamera)}
                onPress={() => useCamera()}
                style={{
                  backgroundColor: background,
                  justifyContent: "center",
                  alignItems: "center",
                  ...styles.mediaAssetContainer,
                }}
              >
                <SimpleLineIcons
                  name="camera"
                  size={36}
                  color={Colors.primary}
                />
              </TouchableCmp>
            )}
            ListFooterComponent={() => (
              <TouchableCmp
                onPress={pickMedia}
                style={{
                  backgroundColor: background,
                  justifyContent: "center",
                  alignItems: "center",
                  ...styles.mediaAssetContainer,
                  marginRight: 10,
                }}
              >
                <FontAwesome name="image" size={36} color={Colors.primary} />
              </TouchableCmp>
            )}
          />
        )}
        <View
          style={{
            ...styles.postOptions,
            backgroundColor: postOptionsBackground,
            borderTopColor: postOptionsBorderTopColor,
          }}
        >
          {/* <TouchableOpacity 
                        style={styles.photo}
                        onPress={() => props.navigation.dispatch(navToCamera)}
                    >
                        <SimpleLineIcons 
                            name='camera' 
                            size={26} 
                            color={Colors.primary}
                        />
                    </TouchableOpacity> */}
          <TouchableOpacity style={styles.photo} onPress={pickMedia}>
            <FontAwesome name="image" size={26} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* <CameraModal 
                isCameraVisible={isCameraVisible}
                toggleCamera={toggleCamera}
                cameraView={cameraView}
                setCameraView={setCameraView}
                cameraFlashMode={cameraFlashMode}
                setCameraFlashMode={setCameraFlashMode}
            /> */}
    </View>
  );
};

CreatePostScreen.navigationOptions = (navData) => {
  return {
    headerTitle: "Create a Post",
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  videoImage: {
    // marginBottom: 10,
    // marginLeft: 10,
    width: 78,
    height: 78,
    borderRadius: 10,
    // borderWidth: 1,
    // borderColor: Colors.primary,
    justifyContent: "flex-end",
  },
  videoAssetContainer: {
    padding: 5,
    justifyContent: "flex-end",
    marginBottom: 10,
    marginLeft: 10,
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  mediaAssetContainer: {
    marginBottom: 10,
    marginLeft: 10,
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  modalView: {
    // flex: 1,
    // justifyContent: 'flex-end',
    alignItems: "center",
    marginTop: 500,
    marginBottom: 0,
  },
  cameraControls: {
    flex: 1,
    marginTop: SCREEN_HEIGHT * 0.08,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    // justifyContent: 'flex-end',
    // marginTop: 100,
  },
  cameraControlButton: {
    color: "white",
    backgroundColor: "rgba(40, 40, 40, 0.7)",
    borderRadius: 20,
    marginHorizontal: 18,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxImage: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.9,
    alignSelf: "center",
    borderRadius: 10,
    marginVertical: 10,
  },
  closeButton: {
    color: "white",
    backgroundColor: "rgba(40, 40, 40, 0.7)",
    borderRadius: 20,
    marginHorizontal: 18,
    marginVertical: 32,
    height: 40,
    width: 40,
    paddingTop: 2,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  removeImageButton: {
    alignItems: "center",
    marginRight: 7,
    marginTop: 7,
    backgroundColor: "rgba(0,0,0,0.7)",
    height: 24,
    width: 24,
    borderRadius: 12,
  },
  removeVideoButton: {
    width: "10%",
    marginLeft: 15,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    paddingHorizontal: 5,
    marginBottom: 3,
    backgroundColor: "rgba(100, 100, 100, 0.5)",
    borderRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inputContainer: {
    marginRight: 32,
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 5,
    flexDirection: "row",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  photo: {
    alignItems: "flex-end",
    marginHorizontal: 15,
  },
  image: {
    alignItems: "flex-end",
  },
  video: {
    borderRadius: 10,
    alignItems: "flex-end",
  },
  postOptions: {
    borderTopWidth: 0.5,
    paddingTop: 9,
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 25,
  },

  modalView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 0,
    // backgroundColor: 'rgba(0,0,0,0.8)'
  },

  modal: {
    width: Dimensions.get("screen").width,
    borderRadius: 20,
    paddingBottom: 50,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginBottom: 5,
  },
  modalButtonText: {
    // fontWeight: "bold",
    fontSize: 18,
    // textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default CreatePostScreen;
