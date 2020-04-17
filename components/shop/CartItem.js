import React from 'react'

// REACT NATIVE
import { Platform, View, Text, StyleSheet, TouchableOpacity, } from 'react-native'
import { useColorScheme } from 'react-native-appearance'
import { Ionicons } from '@expo/vector-icons'
import Colors from '../../constants/Colors'

const CartItem = props => {
    const scheme = useColorScheme()
    let text
    if (scheme === 'dark') {
        text = 'white'
    } else {
        text = 'black'
    }
    return (
        <View style={styles.cartItem}>
            <View style={styles.itemData}>
                <Text style={styles.quantity}>({props.quantity})   </Text>
                <Text style={{...styles.title, ...{color:text}}}>{props.title}</Text>
            </View>
            <View style={styles.itemData}>
                <Text style={styles.amount}>${props.amount.toFixed(2)}</Text>
                {props.deletable && <TouchableOpacity onPress={props.onRemove} style={styles.delete}>
                    <Ionicons
                        name={Platform.OS==='android' ? 'md-trash' : 'ios-trash'}
                        size={23}
                        color='red'
                    />
                </TouchableOpacity>}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    cartItem: {
        // padding: 2,
        // backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 5,
        marginVertical: 5
    },
    itemData: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantity:{
        fontFamily: 'open-sans',
        color: Colors.coral,
        fontSize: 13,
        marginLeft: 5
    },
    title:{
        fontFamily: 'open-sans',
        fontSize: 12
    },
    amount:{
        fontFamily: 'open-sans',
        fontSize: 16,
        color: Colors.orange
    },
    delete:{
        marginLeft: 30
    },
})

export default CartItem