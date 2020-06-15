import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react'
import {
    StyleSheet,
    View, 
    Text, 
    TextInput,
    Modal
} from 'react-native'
import TouchableCmp from './TouchableCmp'
import Colors from '../../constants/Colors'

    
const renderGroupChatMember = props => {
    const [memberColor, setMemberColor] = useState(Colors.blue)
    const deleteMember = (userId, userName, userImage) => {
        if (memberColor === Colors.blue) {
            setMemberColor(Colors.raspberry)
        } else {
            removeMember()
            // setMemberColor(Colors.blue)
        }
    }

    const { item, index } = props
    return (
        <TouchableCmp
            style={{...styles.memberCmp, backgroundColor: memberColor, borderColor: memberColor}}
            onPress={() => 
                deleteMember(item.userId, item.userName, item.userImage)
            }
        >
            <Text style={styles.memberText}>{item.userName}</Text>
        </TouchableCmp>
    )
}

    
export default renderGroupChatMember