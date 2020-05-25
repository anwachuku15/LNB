import React, { useReducer, useEffect } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import Colors from '../../constants/Colors'

import { Appearance, useColorScheme } from 'react-native-appearance'
Appearance.getColorScheme()

let text

const INPUT_CHANGE = 'INPUT_CHANGE'
const INPUT_BLUR = 'INPUT_BLUR'


const inputReducer = (state, action) => {
    switch (action.type) {
        case INPUT_CHANGE:
            return {
                ...state,
                value: action.value,
                isValid: action.isValid
            }
        case INPUT_BLUR:
            return {
                ...state,
                touched: true
            }
        default:
            return state
    }
}

const Input = props => {
    const scheme = useColorScheme()
    if(scheme === 'dark') {
        text = 'white'
    } else {
        text = 'black'
    }

    const [inputState, dispatch] = useReducer(inputReducer, {
        value: props.initialValue ? props.initialValue : '',
        isValid: props.initiallyValid,
        touched: false
    })

    const { onInputChange, id } = props

    useEffect(() => {
        if (inputState.touched) {
            onInputChange(id, inputState.value, inputState.isValid)
        }
    }, [inputState, onInputChange, id])

    const lostFocusHandler = () => {
        dispatch({
            type: INPUT_BLUR
        })
    }
    
    const textChangeHandler = text => {
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let isValid = true;
        let enteredpassword
        let enteredheadline
        if (props.required && text.trim().length === 0) {
            isValid = false;
        }
        if (props.email && !emailRegex.test(text.toLowerCase())) {
            isValid = false;
        }
        if (props.password) {
            enteredpassword = text
        }
        if (props.headline) {
            enteredheadline = text
        }
        if (props.min != null && +text < props.min) {
            isValid = false;
        }
        if (props.max != null && +text > props.max) {
            isValid = false;
        }
        if (props.minLength != null && text.length < props.minLength) {
            isValid = false;
        }
        dispatch({
            type: INPUT_CHANGE,
            value: text,
            isValid: isValid
        })
    }

    const colorScheme = useColorScheme()
    let text
    if(colorScheme === 'dark') {
        text = 'white'
    } else {
        text = 'black'
    }

    return (
        <View style={props.label ? styles.formControl : styles.formControl2}>
            {props.label && <Text style={styles.label}>{props.label}</Text>}
            <TextInput
                {...props}
                style={{ ...styles.input, ...{color: text}}}
                value={inputState.value}
                onChangeText={textChangeHandler}
                onBlur={lostFocusHandler}
                maxLength={150}
            />
            {!inputState.isValid && inputState.touched && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{props.errorText}</Text>
                </View>
            )}
        </View>
    )
    
}



const styles = StyleSheet.create({
    formControl: {
        width: '100%',
    },
    formControl2: {
        width: '100%',
        marginVertical: 10
    },
    label: {
        color: '#8A8F9E',
        marginBottom: 5,
        marginTop: 15,
        fontSize: 10,
        textTransform: 'uppercase'
    },
    input: {
        paddingHorizontal: 2,
        paddingVertical: 5,
        borderBottomColor: Colors.primary,
        color: 'red',
        borderBottomWidth: StyleSheet.hairlineWidth,
        // marginTop: 10
    },
    errorContainer:{
        marginVertical: 5
    },
    errorText:{
        fontFamily: 'open-sans',
        color: 'red',
        fontSize: 12
    },
})


export default Input