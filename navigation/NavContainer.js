import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { NavigationActions } from 'react-navigation'
import MainNavigator from './MainNavigator'
import AltNavigator from './AltNavigator'
import LNBNavigator from './LNBNavigator'
import { useColorScheme } from 'react-native-appearance'
import { StatusBar } from 'react-native'
import { enableScreens } from 'react-native-screens'


enableScreens()

const NavContainer = props => {
    const colorScheme = useColorScheme()
    if(colorScheme === 'dark') {
        StatusBar.setBarStyle('light-content')
    } else {
        StatusBar.setBarStyle('dark-content')
    }

    const navRef = useRef()
    const isAuth = useSelector(state => !!state.auth.token)

    // access Navigation properties outside of navigator with useRef
    useEffect(() => {
        if (!isAuth) {
            navRef.current.dispatch(
                NavigationActions.navigate({
                    routeName: 'Auth'
                })
            )
        }
    }, [isAuth])
    
    return (
        // <MainNavigator theme={props.theme} ref={navRef}/>
        // <AltNavigator theme={props.theme} ref={navRef}/>
        <LNBNavigator theme={props.theme} ref={navRef}/>
    )
}

export default NavContainer