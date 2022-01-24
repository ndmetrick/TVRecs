import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native'
import * as AuthSession from 'expo-auth-session'
import {
  getUserShows,
  getOtherUser,
  getUsersFollowingRecs,
  logout,
} from '../../redux/actions'
import { createStackNavigator } from '@react-navigation/stack'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import AsyncStorage from '@react-native-async-storage/async-storage'

import ViewShows from './ViewShows'
import { useIsFocused } from '@react-navigation/native'

const Tab = createMaterialTopTabNavigator()
const Stack = createStackNavigator()

function ProfileHeader(props) {
  const [userFollowing, setUserFollowing] = useState(null)
  const [user, setUser] = useState(null)
  const [previous, setPrevious] = useState(null)
  const [following, setFollowing] = useState(null)

  console.log('props in header', props)

  useEffect(() => {
    if (props.previous) {
      setUserFollowing(props.userFollowing)
      setUser(props.user)
      setPrevious(props.previous)
      if ((props.previous = 'OtherUser')) {
        setFollowing(props.following)
      }
    }
    return () => {
      setUserFollowing(null)
      setUser(null)
      setPrevious(null)
      setFollowing(false)
    }
  }, [props.user])

  if (userFollowing === null || user === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        {previous === 'CurrentUser' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: 10 }}>
            <View style={styles.usernameButton}>
              <Text style={styles.usernameText}>Your </Text>
            </View>
            <View style={styles.recButton}>
              <Text style={styles.recText}>profile</Text>
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: 10 }}>
            <View style={styles.usernameButton}>
              <Text style={styles.usernameText}>{user.username}</Text>
            </View>
            <View style={styles.recButton}>
              <Text style={styles.recText}>'s profile</Text>
            </View>
          </View>
        )}

        <View>
          {userFollowing.length > 0 ? (
            <View>
              <TouchableOpacity
                onPress={() =>
                  props.navigation.navigate('UsersFollowing', {
                    previous,
                    userInfo: user,
                    userFollowing: userFollowing,
                  })
                }
              >
                <Text style={{ ...styles.text, textAlign: 'left' }}>
                  {previous === 'OtherUser'
                    ? `${user.username} follows `
                    : 'You follow '}
                  <Text style={{ color: '#008DD5', fontWeight: 'bold' }}>
                    {props.following.length}
                  </Text>{' '}
                  {props.following.length === 1 ? 'person' : 'people'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.text}>
                {previous === 'OtherUser'
                  ? `${user.username} doesn't `
                  : `You don't`}{' '}
                follow anyone
              </Text>
            </View>
          )}
          {previous !== 'OtherUser' && isLoggedIn ? null : (
            <View>
              {following ? (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => unfollow()}
                  >
                    <Text style={styles.buttonText}>unfollow</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => follow()}
                  >
                    <Text style={styles.buttonText}>follow</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerInfo: {
    padding: 5,
    backgroundColor: '#340068',
    alignItems: 'center',
  },
  headingText: {
    fontWeight: '500',
    fontSize: 20,
    margin: 10,
  },
  text: {
    textAlign: 'left',
    fontSize: 18,
    marginLeft: 5,
    color: 'white',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
    margin: 5,
    fontWeight: '500',
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#4056F4',
    marginTop: 5,
    marginBottom: 5,
  },
  usernameButton: {
    borderRadius: 25,
    elevation: 3,
    backgroundColor: '#4056F4',
  },

  recButton: {
    borderRadius: 25,
    backgroundColor: '#340068',
  },
  usernameText: {
    fontWeight: '500',
    fontSize: 20,
    letterSpacing: 0.25,
    margin: 4,
    color: 'white',
  },
  recText: {
    fontWeight: '500',
    fontSize: 20,
    letterSpacing: 0.25,
    marginBottom: 4,
    marginTop: 4,
    marginRight: 4,
    color: 'white',
  },
})
const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  otherUser: store.otherUser.userInfo,
  currentUserShows: store.currentUser.userShows,
  otherUserShows: store.otherUser.userShows,
  following: store.currentUser.following,
  otherUsers: store.allOtherUsers.usersInfo,
  toWatch: store.currentUser.toWatch,
  seen: store.currentUser.seen,
})
const mapDispatch = (dispatch) => {
  return {
    getOtherUser: (uid) => dispatch(getOtherUser(uid)),
    getUserShows: (uid) => dispatch(getUserShows(uid)),
    getUsersFollowingRecs: () => dispatch(getUsersFollowingRecs()),
    logout: () => dispatch(logout()),
  }
}
export default connect(mapStateToProps, mapDispatch)(ProfileHeader)
