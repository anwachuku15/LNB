// import Fire from './Firebase/Fire'
import React, { useEffect, useState } from 'react';
import { AppearanceProvider, useColorScheme } from 'react-native-appearance'
import { StatusBar } from 'react-native'
import { Provider } from 'react-redux'
import store from './redux/store';
import { useFonts } from '@use-expo/font'
import { AppLoading } from 'expo'
import { enableScreens } from 'react-native-screens'

import Colors from './constants/Colors'

import NavContainer from './navigation/NavContainer'


enableScreens()


export default function App() {
  

  const colorScheme = useColorScheme()
  if(colorScheme === 'dark') {
      StatusBar.setBarStyle('light-content')
  } else {
      StatusBar.setBarStyle('dark-content')
  }

  
  let [fontsLoaded] = useFonts({
    'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
    'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
    'poppins': require('./assets/fonts/Poppins/Poppins-Regular.ttf'),
    'poppinsItalic': require('./assets/fonts/Poppins/Poppins-Italic.ttf'),
    'poppinsBold': require('./assets/fonts/Poppins/Poppins-Bold.ttf'),
  })

  const [isMounted, setIsMounted] = useState(true)
  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
      // console.log('App Unmounted')
    }
  })

  if(!fontsLoaded) {
    return <AppLoading />
  } else {
    return (
      isMounted && (
        <AppearanceProvider>
            <Provider store={store}>
                <NavContainer theme={colorScheme}/>
            </Provider>
        </AppearanceProvider>
      )
    )
  }
}

