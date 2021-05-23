import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, BackHandler, View, Share, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

import Toolbar from './components/Toolbar.js'
import Frame from './components/Frame.js'
import Nav from './components/Nav.js'

import { useStoredState } from './lib/storage.js'
import { formatQuery, getBaseUrl, getDisplayStr } from './lib/url.js'
import { alert, lightHaptics, successHaptics } from './lib/alert.js'

import colors from './config/colors.js'

export default function App() {
  // App
  const [isFirstLaunch, setIsFirstLaunch] = useStoredState(
    '@isFirstLaunch',
    true
  )
  const launched = () => {
    if (isFirstLaunch) setIsFirstLaunch(false)
  }
  // WebView
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('https://www.imasse.com')
  // Searchbar
  const [currentSearchbar, setCurrentSearchbar] = useState('')
  const [seachbarFocused, setSeachbarFocused] = useState(true)

  const webviewRef = useRef(null)
  const searchbarRef = useRef(null)

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (canGoBack && !seachbarFocused) {
          webviewRef.current.goBack()
          return true
        }
        return false
      }
    )
    return () => backHandler.remove()
  }, [canGoBack])
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <StatusBar
          style="dark"
          translucent={false} // Android
          backgroundColor={colors.bg_white}
        />
        <Toolbar
          {...{
            currentSearchbar,
            seachbarFocused,
            searchbarRef,
            webviewRef
          }}
          handleChangeText={setCurrentSearchbar}
          handleSubmit={({ nativeEvent: { text } }) => {
            launched()
            setCurrentUrl(formatQuery(text))
            successHaptics()
          }}
          handleFocus={() => {
            setSeachbarFocused(true)
            lightHaptics()
          }}
          handleBlur={() => {
            setSeachbarFocused(false)
            setCurrentSearchbar(isFirstLaunch ? '' : getDisplayStr(currentUrl)) // restore currentUrl if not submitted, but keep blank if displaying into page
          }}
        />
        <Frame
          {...{ currentUrl, webviewRef, isFirstLaunch }}
          handleStateChange={(navState) => {
            setCanGoBack(navState.canGoBack)
            setCanGoForward(navState.canGoForward)
            if (navState.url === 'about:blank') {
              return // do not chnage currentUrl to about:blank
            }
            setCurrentUrl(navState.url) // prevent text update when textinput is in focus
            if (!seachbarFocused)
              setCurrentSearchbar(getDisplayStr(navState.url))
          }}
          handleRequest={(request) => {
            // prevent links from opening apps
            if (
              [
                'instagram',
                'twitter',
                'facebook',
                'youtube',
                'linkedin'
              ].reduce((acc, val) => request.url.includes(val) || acc, false) &&
              request.navigationType === 'click'
            ) {
              setCurrentUrl(request.url)
              return false
            }
            return true
          }}
        />
        <Nav
          {...{ canGoBack, canGoForward }}
          handleGoBack={() => {
            if (webviewRef.current) webviewRef.current.goBack()
            lightHaptics()
          }}
          handleGoForward={() => {
            if (webviewRef.current) webviewRef.current.goForward()
            lightHaptics()
          }}
          handleShare={async () => {
            lightHaptics()
            try {
              await Share.share({
                url: currentUrl,
              })
            } catch (error) {
              Alert.alert(error.message)
            }
          }}
          handleReload={() => {
            if (isFirstLaunch) return
            webviewRef.current.reload()
            lightHaptics()
          }}
          handleCite={() => {
            const newURL = 'https://www.imasse.com/?cite=' + currentUrl;
            const redirectTo = 'window.location = "' + newURL + '"';
            webviewRef.current.injectJavaScript(redirectTo)
            lightHaptics()
          }}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg_white
  }
})
