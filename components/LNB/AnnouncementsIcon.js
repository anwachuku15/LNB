import React, { useEffect, useState } from 'react'
import { Platform, View, StyleSheet } from 'react-native'
import { Badge, withBadge, Icon } from 'react-native-elements'
import { useColorScheme } from 'react-native-appearance'
import { useSelector, useDispatch } from 'react-redux'
import { AntDesign } from '@expo/vector-icons'
import firebase from 'firebase'
import { db } from '../../Firebase/Fire'
import Colors from '../../constants/Colors'





const AnnouncementsIcon = props => {
    // CARD THEME
    const colorScheme = useColorScheme()
    let cardTheme
    if(colorScheme === 'dark') {
        cardTheme = 'rgb(36,36,38)'
    } else {
        cardTheme = 'white'
    }
    const lastRead = useSelector(state => state.auth.lastReadAnnouncements)
    const announcements = useSelector(state => state.admin.announcements.sort((a,b) => a.timestamp > b.timestamp ? -1 : 1))


    if (announcements.length > 0) {
        return (
            <View>
                {lastRead < announcements[0].timestamp ? (
                    <View>
                        <AntDesign 
                            name='notification'
                            size={23} 
                            color={props.tabInfo.tintColor}
                        />
                        <Badge
                            containerStyle={{position: 'absolute', top: 0, right: -1}}
                            badgeStyle={{backgroundColor:Colors.raspberry, borderColor:Colors.raspberry}}
                        />
                    </View>
                ) : (
                    <AntDesign 
                        name='notification'
                        size={23} 
                        color={props.tabInfo.tintColor}
                    />
                )}
            </View>
        )
    } else {
        return (
            <AntDesign 
                name='notification'
                size={23} 
                color={props.tabInfo.tintColor}
            />
        )
    }
}

const styles = StyleSheet.create({
})

export default AnnouncementsIcon
