
import { Platform, TouchableOpacity, TouchableNativeFeedback } from 'react-native';

let TouchableCmp = TouchableOpacity
if (Platform.OS === 'android' && Platform.Version >= 21) {
    TouchableCmp = TouchableNativeFeedback
}

export default TouchableCmp