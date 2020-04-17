import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useColorScheme } from 'react-native-appearance'


const Card = props => {
    // CARD THEME
    const colorScheme = useColorScheme()
    let cardTheme
    if(colorScheme === 'dark') {
        cardTheme = 'rgb(36,36,38)'
    } else {
        cardTheme = 'white'
    }
    return (
        <View style={{...styles.card, ...{backgroundColor:cardTheme}, ...props.style}}>
            {props.children}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        shadowColor: 'black',
        shadowOpacity: 0.26,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 8,
        elevation: 5,
        borderRadius: 10,
        // backgroundColor: 'white',
    }
})

export default Card
