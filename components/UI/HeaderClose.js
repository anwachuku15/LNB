import React from 'react'
import { Platform } from 'react-native'
import { HeaderButton } from 'react-navigation-header-buttons'
import { EvilIcons } from '@expo/vector-icons'

import Colors from '../../constants/Colors'

const CustomHeaderButton = props => {
    return (
        <HeaderButton 
            {...props} 
            IconComponent={EvilIcons} 
            iconSize={36} 
            color={Colors.disabled}
        />
    )
}

export default CustomHeaderButton