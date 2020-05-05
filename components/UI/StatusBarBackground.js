import React from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { useColorScheme } from 'react-native-appearance'

const StatusBarBackground = () => {
    const colorScheme = useColorScheme()
    if(colorScheme === 'dark') {
        StatusBar.setBarStyle('light-content')
    } else {
        StatusBar.setBarStyle('dark-content')
    }
    return (
        <View style={[styles.statusBarBackground]} />
    )
}

// https://stackoverflow.com/questions/42599850/how-to-prevent-layout-from-overlapping-with-ios-status-bar
