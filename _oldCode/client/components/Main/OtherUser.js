import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'

import * as Tabs from 'react-native-collapsible-tab-view'
import {
  getUserShows,
  getOtherUser,
  follow,
  unfollow,
  getUsersFollowingRecs,
  getUserFollowing,
  getUserTags,
} from '../../redux/actions'

import UserTagsAndDescription from './UserTagsAndDescription'
import ViewShows from './ViewShows'
import ProfileHeader from './ProfileHeader'

function OtherUser(props) {
  const [userShows, setUserShows] = useState([])
  const [user, setUser] = useState(null)
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [userFollowing, setUserFollowing] = useState({})
  const [userTags, setUserTags] = useState(null)
  const [headerHeight, setHeaderHeight] = useState(100)

  useEffect(() => {
    console.log('i got in here to this other user')
    const { currentUser, currentUserShows } = props
    if (currentUser) {
      setLoggedIn(true)
      setHeaderHeight(150)
      console.log('i got here to this thing in otherUser')
    }
    const { uid } = props.route.params ?? {}

    const getUser = async () => {
      try {
        if (uid) {
          const otherUser = await props.getOtherUser(uid)
          const otherUserShows = await props.getUserShows(uid)
          const otherUserFollowing = await props.getUserFollowing(uid)
          const otherUserTags = await props.getUserTags(uid)
          if (otherUser) {
            setUser(otherUser)
          }
          if (otherUserShows) {
            setUserShows(otherUserShows)
          }
          if (otherUserFollowing) {
            setUserFollowing(otherUserFollowing)
          }
          if (otherUserTags) {
            setUserTags(otherUserTags)
          }
          if (
            props.following.filter((followed) => followed.id === uid).length
          ) {
            setFollowing(true)
            setLoading(false)
          } else {
            console.log('i know im not following')
            setFollowing(false)
            setLoading(false)
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    getUser()
    return () => {
      console.log('is this something?')
      setUserShows([])
      setUser(null)
      setFollowing(false)
      setUserFollowing({})
      setUserTags(null)
    }
  }, [props.route.params.uid, props.following])

  const follow = async () => {
    try {
      await props.follow(user.id)
      await props.getUsersFollowingRecs()
      setFollowing(true)
    } catch (err) {
      console.log(err)
    }
  }
  const unfollow = async () => {
    try {
      await props.unfollow(user.id)
      setFollowing(false)
    } catch (err) {
      console.log(err)
    }
  }

  const Header = () => (
    <ProfileHeader
      previous="OtherUser"
      userFollowing={userFollowing}
      user={user}
      loggedIn={loggedIn}
      following={following}
      navigation={props.navigation}
      follow={follow}
      unfollow={unfollow}
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

  if (loading === null || user === null || userTags === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  }
  const { uid } = props.route.params ? props.route.params : {}

  const firstTabName = `Recs (${props.otherUserShows.length})`

  return (
    <Tabs.Container
      renderHeader={Header}
      renderTabBar={TabBar}
      headerHeight={headerHeight}
      revealHeaderOnScroll={true}
    >
      <Tabs.Tab name={firstTabName}>
        <ViewShows
          userToView={user}
          type="recs"
          userShows={userShows}
          navigation={props.navigation}
        />
      </Tabs.Tab>
      <Tabs.Tab name="Tags/Bio">
        <UserTagsAndDescription
          user={user}
          // userTags={userTags}
          navigation={props.navigation}
        />
      </Tabs.Tab>
    </Tabs.Container>
  )
}

const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  otherUser: store.otherUser.userInfo,
  currentUserShows: store.currentUser.userShows,
  otherUserShows: store.otherUser.userShows,
  following: store.currentUser.following,
  otherUsers: store.allOtherUsers.usersInfo,
})
const mapDispatch = (dispatch) => {
  return {
    getOtherUser: (uid) => dispatch(getOtherUser(uid)),
    getUserShows: (uid) => dispatch(getUserShows(uid)),
    unfollow: (uid) => dispatch(unfollow(uid)),
    follow: (uid) => dispatch(follow(uid)),
    getUserFollowing: (uid) => dispatch(getUserFollowing(uid)),
    getUsersFollowingRecs: () => dispatch(getUsersFollowingRecs()),
    getUserTags: (uid) => dispatch(getUserTags(uid)),
  }
}
export default connect(mapStateToProps, mapDispatch)(OtherUser)
