import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'

class UserPermissions {
    getCameraPermission = async () => {
        if (Constants.platform.ios) {
            const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)
            
            if (status != 'granted') {
                alert('We need permssion to access your cameral roll')
            }
        }
    }
}

export default new UserPermissions()