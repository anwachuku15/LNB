// import Fire from './Firebase/Fire'
import React, { useEffect, useState } from 'react';
import { AppearanceProvider, useColorScheme } from 'react-native-appearance'
import { StatusBar } from 'react-native'
import { Provider } from 'react-redux'
import store from './redux/store';
import { useFonts } from '@use-expo/font'
// import { NotoSansJP_500Medium } from '@expo-google-fonts/noto-sans-jp'
import { Montserrat_500Medium_Italic } from '@expo-google-fonts/montserrat'
import { MPLUSRounded1c_400Regular, MPLUSRounded1c_500Medium, MPLUSRounded1c_300Light } from '@expo-google-fonts/m-plus-rounded-1c'
import { AppLoading } from 'expo'
import { enableScreens } from 'react-native-screens'

import Colors from './constants/Colors'

import NavContainer from './navigation/NavContainer'

console.disableYellowBox = true


enableScreens()


export default function App() {
  

  const colorScheme = useColorScheme()
  let headerBackground
  if (colorScheme === 'dark') {
    StatusBar.setBarStyle('light-content')
    headerBackground = '#1B1B1B'
  } else {
    StatusBar.setBarStyle('dark-content')
    headerBackground = 'white'
  }

  let [fontsLoaded] = useFonts({
    'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
    'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
    'poppins': require('./assets/fonts/Poppins/Poppins-Regular.ttf'),
    'poppinsItalic': require('./assets/fonts/Poppins/Poppins-Italic.ttf'),
    'poppinsBold': require('./assets/fonts/Poppins/Poppins-Bold.ttf'),
    'NotoSansJP_500Medium': require('./assets/fonts/Noto_Sans_JP/NotoSansJP-Medium.otf'),
    Montserrat_500Medium_Italic,
    MPLUSRounded1c_400Regular,
    MPLUSRounded1c_500Medium,
    MPLUSRounded1c_300Light,
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

