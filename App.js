import Fire from './Firebase/Fire'
import React, { useEffect } from 'react';
import { AppearanceProvider, useColorScheme } from 'react-native-appearance'
import { StatusBar, } from 'react-native'
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
    'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf')
  })

  if(!fontsLoaded) {
    return <AppLoading />
  } else {
    return (
      <AppearanceProvider>
        <Provider store={store}>
            <NavContainer theme={colorScheme}/>
        </Provider>
      </AppearanceProvider>
    )
  }
}

