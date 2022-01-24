import React, { useState, useEffect, useRef } from 'react'
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
import { Tabs } from 'react-native-collapsible-tab-view'

import { getSingleUserShow } from '../../redux/actions'
import { useIsFocused } from '@react-navigation/native'

function ViewShows(props) {
  const [userShows, setUserShows] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isCurrentUser, setIsCurrentUser] = useState(false)

  const isFocused = useIsFocused()

  useEffect(() => {
    const {
      currentUser,
      currentUserShows,
      toWatch,
      otherUserShows,
      seen,
      userToView,
    } = props
    if (currentUser !== null && currentUser.id === userToView.id) {
      setIsCurrentUser(true)
    }
    setUser(userToView)
    if (userToView) {
      const shows =
        currentUser === null
          ? otherUserShows
          : props.type === 'toWatch'
          ? toWatch
          : props.type === 'seen'
          ? seen
          : userToView.id === currentUser.id
          ? currentUserShows
          : userToView.id
          ? otherUserShows
          : null

      if (shows) {
        shows.sort(function (x, y) {
          return new Date(y.updatedAt) - new Date(x.updatedAt)
        })
        setUserShows(shows)
        setLoading(false)
      }
    }
    return () => {
      setUserShows(null)
      setUser(null)
      setLoading(true)
      setIsCurrentUser(false)
    }
  }, [props.type, isFocused, props.otherUserShows])

  const getUserShow = async (item) => {
    try {
      if (isCurrentUser) {
        return props.navigation.navigate('Show', {
          userInfo: user,
          singleShow: item,
        })
      } else {
        const userShow = await props.getSingleUserShow(user.id, item.show.id)
        if (userShow) {
          return props.navigation.navigate('Show', {
            userInfo: user,
            singleShow: userShow,
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  if (loading || !userShows) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  }

  return (
    <Tabs.FlatList
      numColumns={2}
      horizontal={false}
      data={userShows}
      renderItem={({ item }) => (
        <View style={styles.containerImage}>
          <TouchableOpacity onPress={() => getUserShow(item)}>
            <Image style={styles.image} source={{ uri: item.show.imageUrl }} />
          </TouchableOpacity>
        </View>
      )}
      keyExtractor={(item, index) => index.toString()}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  showsList: {
    flex: 1,
  },
  text: {
    textAlign: 'left',
    fontSize: 18,
  },
  containerImage: {
    flex: 1 / 2,
  },
  image: {
    flex: 1,
    aspectRatio: 2 / 3,
    // resizeMode: 'cover',
  },
})
const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  otherUser: store.otherUser.userInfo,
  currentUserShows: store.currentUser.userShows,
  otherUserShows: store.otherUser.userShows,
  toWatch: store.currentUser.toWatch,
  seen: store.currentUser.seen,
})
const mapDispatchToProps = (dispatch) => {
  return {
    getSingleUserShow: (uid, showId) =>
      dispatch(getSingleUserShow(uid, showId)),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ViewShows)
