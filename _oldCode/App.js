import React, { useState, useEffect } from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './client/redux/reducers'
import thunk from 'redux-thunk'
import Start from './Start'
import { Asset } from 'expo-asset'
import AppLoading from 'expo-app-loading'
import { Image, Text, View } from 'react-native'

function cacheImages(images) {
  return images.map((image) => {
    if (typeof image === 'string') {
      return Image.prefetch(image)
    } else {
      return Asset.fromModule(image).downloadAsync()
    }
  })
}

// function cacheFonts(fonts) {
//   return fonts.map(font => Font.loadAsync(font));
// }

const App = () => {
  const store = createStore(rootReducer, applyMiddleware(thunk))
  const [isReady, setIsReady] = useState(false)

  const loadAssetsAsync = async () => {
    const imageAssets = cacheImages([
      'https://i.postimg.cc/NjTL22vB/temp-Logo2.jpg',
      require('./assets/tempTVRecsLogo.png'),
    ])

    await Promise.all([...imageAssets])
  }

  if (!isReady) {
    return (
      <AppLoading
        startAsync={loadAssetsAsync}
        onFinish={() => setIsReady(true)}
        onError={console.warn}
      />
    )
  }

  return (
    <Provider store={store}>
      <Start />
    </Provider>
  )
}

export default App
