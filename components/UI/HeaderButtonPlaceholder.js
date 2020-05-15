import React from 'react'
import { Platform } from 'react-native'
import { HeaderButton } from 'react-navigation-header-buttons'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native-appearance'

import Colors from '../../constants/Colors'

const HeaderButtonPlaceholder = props => {
    const scheme = useColorScheme()
    return (
        <HeaderButton 
            {...props} 
            IconComponent={Ionicons} 
            iconSize={23} 
            color={scheme==='dark' ? 'black' : 'white'}
        />
    )
}

export default HeaderButtonPlaceholder