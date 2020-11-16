import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import * as MediaLibrary from "expo-media-library";

class UserPermissions {
  getCameraRollPermission = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

      if (status != "granted") {
        alert("We need permssion to access your camera roll");
      }
    }
  };

  getUseCameraPermission = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);

      if (status != "granted") {
        alert("We need permission to access your camera");
      }
    }
  };

  // getAudioPermission = async () => {
  //     if (Constants.platform.ios) {
  //         const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING)

  //     }
  // }

  getMediaLibraryPermission = async () => {
    if (Constants.platform.ios) {
      const { status } = await MediaLibrary.getPermissionsAsync();
      if (status != "granted") {
        alert("We cannot save this to your library without your permission");
      }
    }
  };

  // MEDIA LIBRARY METHODS FOR THE FUTURE...
  // saveToLibaryAsync(localUri)
}

export default new UserPermissions();
