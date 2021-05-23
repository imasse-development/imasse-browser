import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, Keyboard, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import Searchbar from './Searchbar.js'

import colors from '../config/colors.js'

export default function Toolbar({
  seachbarFocused,
  searchbarRef,
  webviewRef,
  ...props
}) {
  return (
    <>
      <View style={styles.container}>
        <Searchbar searchbarRef={searchbarRef} {...props} />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg_white,
    height: 60,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: colors.separator,
    zIndex: 2
  },
  btn: {
    padding: 10
  }
})
