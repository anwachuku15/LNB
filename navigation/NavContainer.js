import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { NavigationActions } from 'react-navigation'
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
    const posts = useSelector(state => state.posts.allNeeds)
    const userPosts = useSelector(state => state.posts.userNeeds)
    const need = useSelector(state => state.posts.need)
    const [mounted, setMounted] = useState(true)

    // access Navigation properties outside of navigator with useRef
    useEffect(() => {
        setMounted(true)
        if (!isAuth) {
            navRef.current.dispatch(
                NavigationActions.navigate({
                    routeName: 'Auth'
                })
            )
        }
        return () => {
            setMounted(false)
        }
    }, [isAuth, mounted])
    
    return (
        mounted && <LNBNavigator theme={props.theme} ref={navRef}/>
    )
}

export default NavContainer