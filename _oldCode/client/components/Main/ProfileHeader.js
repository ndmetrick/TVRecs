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

import ViewShows from './ViewShows'
import { useIsFocused } from '@react-navigation/native'

const Tab = createMaterialTopTabNavigator()
const Stack = createStackNavigator()

function ProfileHeader(props) {
  const [userFollowing, setUserFollowing] = useState(null)
  const [user, setUser] = useState(null)
  const [previous, setPrevious] = useState(null)

  console.log('props in header', props)

  useEffect(() => {
    if (props.previous) {
      setUserFollowing(props.userFollowing)
      setUser(props.user)
      setPrevious(props.previous)
      console.log('following is what here', props.following)
    }
    return () => {
      setUserFollowing(null)
      setUser(null)
      setPrevious(null)
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
      <View style={styles.topContainerInfo}>
        {previous === 'CurrentUser' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: 10 }}>
            <View style={styles.usernameButton}>
              <Text style={styles.usernameText}>Your</Text>
            </View>
            <View style={styles.recButton}>
              <Text style={styles.recText}> profile</Text>
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
      </View>

      <View style={styles.bottomContainerInfo}>
        {userFollowing.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <View style={styles.invisibleButton}>
              <Text
                style={{
                  ...styles.recText,
                  marginLeft: 4,
                  marginRight: 0,
                  color: 'black',
                }}
              >
                {previous === 'OtherUser'
                  ? `${user.username} follows`
                  : 'You follow'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                props.navigation.navigate('UsersFollowing', {
                  previous,
                  userInfo: user,
                  userFollowing: userFollowing,
                })
              }
              style={styles.followNumButton}
            >
              <Text style={styles.followNumText}>
                {' '}
                {props.userFollowing.length}{' '}
              </Text>
            </TouchableOpacity>
            <View style={styles.invisibleButton}>
              <Text style={{ ...styles.recText, color: 'black' }}>
                {props.userFollowing.length === 1 ? 'person' : 'people'}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <Text style={{ ...styles.text, textAlign: 'left' }}>
              {previous === 'OtherUser'
                ? `${user.username} doesn't `
                : `You don't `}
              follow anyone
            </Text>
          </View>
        )}
        {previous === 'CurrentUser' || !props.loggedIn ? null : (
          <View>
            {props.following ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => props.unfollow()}
                >
                  <Text style={styles.buttonText}>stop following</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => props.follow()}
                >
                  <Text style={styles.buttonText}>follow {user.username}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContainerInfo: {
    padding: 5,
    backgroundColor: '#340068',
    alignItems: 'center',
  },
  bottomContainerInfo: {
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    backgroundColor: '#E9ECEF',
    // justifyContent: 'space-between',
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
    fontWeight: '500',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
    margin: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  button: {
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 3,
    // backgroundColor: '#36C9C6',
    marginBottom: 5,
    marginLeft: 8,
  },
  usernameButton: {
    borderRadius: 25,
    elevation: 3,
    backgroundColor: '#4056F4',
  },
  followNumButton: {
    marginTop: 5,
    borderRadius: 50,
    elevation: 3,
    backgroundColor: '#4056F4',
    marginBottom: 5,
  },
  recButton: {
    borderRadius: 25,
    backgroundColor: '#340068',
  },
  invisibleButton: {
    margin: 5,
    borderRadius: 25,
    backgroundColor: '#E9ECEF',
  },
  usernameText: {
    fontWeight: '500',
    fontSize: 20,
    letterSpacing: 0.25,
    margin: 4,
    color: 'white',
  },
  followNumText: {
    fontWeight: '500',
    fontSize: 20,
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
