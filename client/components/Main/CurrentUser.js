import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'

import ViewShows from './ViewShows'
import ProfileHeader from './ProfileHeader'

import * as Tabs from 'react-native-collapsible-tab-view'

function CurrentUser(props) {
  const [headerHeight, setHeaderHeight] = useState(100)

  const Header = () => (
    <ProfileHeader
      // style={styles.header}
      previous="CurrentUser"
      userFollowing={props.following}
      user={props.currentUser}
      navigation={props.navigation}
    />
  )

  const TabBar = (props) => {
    return (
      <Tabs.MaterialTabBar
        {...props}
        activeColor="white"
        inactiveColor="white"
        backgroundColor="#340068"
        inactiveOpacity={0.8}
        style={{ backgroundColor: '#340068' }}
        indicatorStyle={{ height: 6, backgroundColor: '#36C9C6' }}
      />
    )
  }

  const { currentUser, currentUserShows } = props
  if (currentUser === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  }

  const recsTabName = `Recs (${props.currentUserShows.length})`
  const toWatchTabName = `To Watch (${props.toWatch.length})`
  const seenTabName = `Seen (${props.seen.length})`

  return (
    <Tabs.Container
      renderHeader={Header}
      renderTabBar={TabBar}
      headerHeight={headerHeight}
      revealHeaderOnScroll={true}
    >
      <Tabs.Tab name={recsTabName}>
        <ViewShows
          userToView={currentUser}
          type={'recs'}
          userShows={currentUserShows}
          navigation={props.navigation}
        />
      </Tabs.Tab>
      <Tabs.Tab name={toWatchTabName}>
        <ViewShows
          userToView={currentUser}
          type={'toWatch'}
          navigation={props.navigation}
        />
      </Tabs.Tab>
      <Tabs.Tab name={seenTabName}>
        <ViewShows
          userToView={currentUser}
          type={'seen'}
          navigation={props.navigation}
        />
      </Tabs.Tab>
    </Tabs.Container>
  )
}

const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  currentUserShows: store.currentUser.userShows,
  following: store.currentUser.following,
  toWatch: store.currentUser.toWatch,
  seen: store.currentUser.seen,
})

export default connect(mapStateToProps)(CurrentUser)
