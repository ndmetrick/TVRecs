import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import {
  addShow,
  deleteShow,
  switchShow,
  getAPIKey,
  getOtherUser,
  getSingleUserShow,
} from '../../redux/actions'
import StreamingAndPurchase from './StreamingAndPurchase'
import OtherRecerModal from './OtherRecerModal'

import { useIsFocused } from '@react-navigation/native'

function SingleShow(props) {
  const [userShow, setUserShow] = useState({})
  const [user, setUser] = useState(null)
  const [type, setType] = useState(null)
  const [warningTags, setWarningTags] = useState([])
  const [tvTags, setTVTags] = useState([])
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const [country, setCountry] = useState(null)
  const [streamingAndPurchase, setStreamingAndPurchase] = useState(false)

  const isFocused = useIsFocused()

  // const [following, setFollowing] = useState(false);
  // multipleRecInfo counts how many other people you follow recommend a given show that this user recommends
  const [multipleRecInfo, setMultipleRecInfo] = useState({})
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    const { currentUser } = props
    const { singleShow, userInfo } = props.route.params

    if (currentUser === null && userInfo !== null) {
      console.log('i got in here')
      setUser(userInfo)
      // setCountry(userInfo.country)
    } else {
      if (userInfo !== null) {
        console.log('userInfo', userInfo)
        if (userInfo.id === currentUser.id) {
          setUser(currentUser)
          setIsCurrentUser(true)
          setCountry(userInfo.country)
        } else {
          setUser(userInfo)
          setCountry(currentUser.country)
        }
        const showId = singleShow.show.id
        let recCounts = {}
        recCounts[showId] = {
          num: 1,
          recommenders: [{ name: userInfo.username, recShow: singleShow }],
        }

        props.recShows.forEach((recShow) => {
          if (
            recShow.showId == showId &&
            recShow.username !== userInfo.username
          ) {
            recCounts[showId].num++
            recCounts[showId].recommenders.push({
              name: recShow.username,
              recShow,
            })
          }
        })
        setMultipleRecInfo(recCounts)
      }
    }
    const warnings = singleShow.tags.filter((tag) => {
      return tag.type === 'warning'
    })
    const tv = singleShow.tags.filter((tag) => {
      return tag.type === 'tv' || tag.type === 'unassigned'
    })
    setTVTags(tv)
    setWarningTags(warnings)
    setUserShow(singleShow)
    setType(singleShow.type)
    return () => {
      setStreamingAndPurchase(false)
      setUserShow({})
      setUser(null)
      setType(null)
      setWarningTags([])
      setTVTags([])
      setIsCurrentUser(false)
      setCountry(null)
      setMultipleRecInfo({})
      setModalVisible(false)
    }
  }, [props.route.params.userInfo, type, isFocused])

  const deleteShow = async () => {
    try {
      await props.deleteShow(userShow.show.id)
      return props.navigation.goBack()
    } catch (err) {
      console.error(err)
    }
  }

  const displayTags = (tags) => {
    return tags.map((tag, key) => {
      const tagStyle = tag.type === 'warning' ? styles.warningTag : styles.tvTag
      return (
        <View key={key} style={tagStyle}>
          <Text style={styles.tagText}>{tag.name}</Text>
        </View>
      )
    })
  }

  if (user === null || multipleRecInfo.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        {isCurrentUser ? (
          <Text style={styles.text}>{user.username}</Text>
        ) : (
          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate("TV rec'er", {
                uid: user.id,
              })
            }
          >
            <Text style={styles.text}>{user.username}</Text>
          </TouchableOpacity>
        )}
      </View>
      {!props.currentUser ||
      multipleRecInfo[userShow.show.id].num < 2 ? null : (
        <View>
          <Text>Also recommended by:</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={{ color: 'blue' }}>
              {`${multipleRecInfo[userShow.show.id].num - 1}`}{' '}
              {multipleRecInfo[userShow.show.id].num > 2 && isCurrentUser
                ? 'people you follow'
                : multipleRecInfo[userShow.show.id].num > 2 && !isCurrentUser
                ? 'other people you follow'
                : multipleRecInfo[userShow.show.id].num < 3 && isCurrentUser
                ? 'person you follow'
                : 'other person you follow'}
            </Text>
          </TouchableOpacity>
          <OtherRecerModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            selectedItem={multipleRecInfo[userShow.show.id].recommenders}
            navigation={props.navigation}
            previous="SingleShow"
            getSingleUserShow={props.getSingleUserShow}
          />
        </View>
      )}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Image
            style={styles.image}
            source={{ uri: userShow.show.imageUrl }}
          />
          <Text
            style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 18 }}
          >
            {userShow.show.name}
          </Text>

          <View style={styles.extra}>
            {userShow.description ? (
              <Text style={styles.text}>
                <Text style={{ fontWeight: 'bold' }}>Description: </Text>
                {userShow.description}
              </Text>
            ) : null}
            {userShow.tags.length ? (
              <View>
                {tvTags.length ? (
                  <View>
                    {isCurrentUser ? (
                      <Text style={{ ...styles.text, fontWeight: 'bold' }}>
                        My tags:
                      </Text>
                    ) : (
                      <Text style={styles.text}>
                        I think these tags describe some important things about
                        the show and its themes:
                      </Text>
                    )}
                    <View style={[styles.cardContent, styles.tagsContent]}>
                      {displayTags(tvTags)}
                    </View>
                  </View>
                ) : null}

                {warningTags.length ? (
                  <View>
                    {isCurrentUser ? null : (
                      <Text style={styles.text}>
                        There is some content in this show I think potential
                        viewers should be warned about:
                      </Text>
                    )}
                    <View style={[styles.cardContent, styles.tagsContent]}>
                      {displayTags(warningTags)}
                    </View>
                  </View>
                ) : null}
              </View>
            ) : null}
            {!streamingAndPurchase ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={{ ...styles.button, marginBottom: 15 }}
                  onPress={() => setStreamingAndPurchase(true)}
                >
                  <Text style={styles.buttonText}>
                    Show overview and options for streaming and purchase
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={{ ...styles.button, marginBottom: 15 }}
                    onPress={() => setStreamingAndPurchase(false)}
                  >
                    <Text style={styles.buttonText}>
                      Hide overview and options for streaming and purchase
                    </Text>
                  </TouchableOpacity>
                </View>
                <StreamingAndPurchase
                  showId={userShow.show.imdbId}
                  currentUser={props.currentUser}
                />
              </View>
            )}
            {isCurrentUser ? (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() =>
                      Alert.alert(
                        'Are you sure you want to delete this show?',
                        '',
                        [
                          { text: 'Yes', onPress: () => deleteShow() },
                          {
                            text: 'Cancel',
                          },
                        ]
                      )
                    }
                  >
                    <Text style={styles.buttonText}>Delete show</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() =>
                      props.navigation.navigate('Add/Change Tags', {
                        userShow,
                        previous: 'Show',
                      })
                    }
                  >
                    <Text style={styles.buttonText}>Add/change tags</Text>
                  </TouchableOpacity>
                </View>
                {/* If the show is currently in the watch list, give the user the option to switch it to a recommended show */}
                {type === 'watch' ? (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() =>
                        Alert.alert(
                          `Save your current description and tags?`,
                          '',
                          [
                            {
                              text: 'Yes',
                              onPress: () =>
                                props.navigation.navigate('Save show', {
                                  showData: {
                                    userShow,
                                    type: 'rec',
                                    keep: true,
                                  },
                                  previous: 'SingleShow',
                                  fromCurrentUserShow: true,
                                }),
                            },
                            {
                              text: 'No',
                              onPress: () =>
                                props.navigation.navigate('Save show', {
                                  showData: {
                                    userShow,
                                    type: 'rec',
                                    keep: false,
                                  },
                                  previous: 'SingleShow',
                                  fromCurrentUserShow: true,
                                }),
                            },
                            {
                              text: 'Cancel',
                            },
                          ]
                        )
                      }
                    >
                      <Text style={styles.buttonText}>
                        Switch to recommended
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                {/* If the show is currently in the watch list, give the user the option to switch it to a seen show */}
                {type === 'watch' ? (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() =>
                        Alert.alert(
                          `Save your current description and tags?`,
                          '',
                          [
                            {
                              text: 'Yes',
                              onPress: () =>
                                props.navigation.navigate('Save show', {
                                  showData: {
                                    userShow,
                                    type: 'seen',
                                    keep: true,
                                  },
                                  previous: 'SingleShow',
                                  fromCurrentUserShow: true,
                                }),
                            },
                            {
                              text: 'No',
                              onPress: () =>
                                props.navigation.navigate('Save show', {
                                  showData: {
                                    userShow,
                                    type: 'seen',
                                    keep: false,
                                  },
                                  previous: 'SingleShow',
                                  fromCurrentUserShow: true,
                                }),
                            },
                            {
                              text: 'Cancel',
                            },
                          ]
                        )
                      }
                    >
                      <Text style={styles.buttonText}>Switch to seen list</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ) : (
              <View>
                {/* If the user isn't logged in or this show (identified by its imdbId) is in any of the current user's lists of shows, don't show them the buttons to add the show to one of their lists. */}
                {props.currentUser === null ||
                props.currentUserShows.find(
                  (currentUserShow) =>
                    currentUserShow.show.id === userShow.show.id
                ) ||
                props.watchShows.find(
                  (watchShow) => watchShow.show.id === userShow.show.id
                ) ||
                props.seenShows.find(
                  (seenShow) => seenShow.show.id === userShow.show.id
                ) ? null : (
                  <View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() =>
                          Alert.alert(
                            `Save this user's description and tags?`,
                            '',
                            [
                              {
                                text: 'Yes',
                                onPress: () =>
                                  props.navigation.navigate('Save show', {
                                    showData: {
                                      showName: userShow.show.name,
                                      imageUrl: userShow.show.imageUrl,
                                      imdbId: userShow.show.imdbId,
                                      description: userShow.description,
                                      tags: userShow.tags,
                                      type: 'rec',
                                      keep: true,
                                    },
                                    previous: 'SingleShow',
                                    fromCurrentUserShow: false,
                                  }),
                              },
                              {
                                text: 'No',
                                onPress: () =>
                                  props.navigation.navigate('Save show', {
                                    showData: {
                                      showName: userShow.show.name,
                                      imageUrl: userShow.show.imageUrl,
                                      imdbId: userShow.show.imdbId,
                                      type: 'rec',
                                      keep: false,
                                    },
                                    previous: 'SingleShow',
                                    fromCurrentUserShow: false,
                                  }),
                              },
                              {
                                text: 'Cancel',
                              },
                            ]
                          )
                        }
                      >
                        <Text style={styles.buttonText}>Recommend</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() =>
                          Alert.alert(
                            `Save this user's description and tags?`,
                            '',
                            [
                              {
                                text: 'Yes',
                                onPress: () =>
                                  props.navigation.navigate('Save show', {
                                    showData: {
                                      showName: userShow.show.name,
                                      imageUrl: userShow.show.imageUrl,
                                      imdbId: userShow.show.imdbId,
                                      description: userShow.description,
                                      tags: userShow.tags,
                                      type: 'watch',
                                      keep: true,
                                    },
                                    previous: 'SingleShow',
                                    fromCurrentUserShow: false,
                                  }),
                              },
                              {
                                text: 'No',
                                onPress: () =>
                                  props.navigation.navigate('Save show', {
                                    showData: {
                                      showName: userShow.show.name,
                                      imageUrl: userShow.show.imageUrl,
                                      imdbId: userShow.show.imdbId,
                                      type: 'watch',
                                      keep: false,
                                    },
                                    previous: 'SingleShow',
                                    fromCurrentUserShow: false,
                                  }),
                              },
                              {
                                text: 'Cancel',
                              },
                            ]
                          )
                        }
                      >
                        <Text style={styles.buttonText}>Add to watch list</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() =>
                          Alert.alert(
                            `Save this user's description and tags?`,
                            '',
                            [
                              {
                                text: 'Yes',
                                onPress: () =>
                                  props.navigation.navigate('Save show', {
                                    showData: {
                                      showName: userShow.show.name,
                                      imageUrl: userShow.show.imageUrl,
                                      imdbId: userShow.show.imdbId,
                                      description: userShow.description,
                                      tags: userShow.tags,
                                      type: 'seen',
                                      keep: true,
                                    },
                                    previous: 'SingleShow',
                                    fromCurrentUserShow: false,
                                  }),
                              },
                              {
                                text: 'No',
                                onPress: () =>
                                  props.navigation.navigate('Save show', {
                                    showData: {
                                      showName: userShow.show.name,
                                      imageUrl: userShow.show.imageUrl,
                                      imdbId: userShow.show.imdbId,
                                      type: 'seen',
                                      keep: false,
                                    },
                                    previous: 'SingleShow',
                                    fromCurrentUserShow: false,
                                  }),
                              },
                              {
                                text: 'Cancel',
                              },
                            ]
                          )
                        }
                      >
                        <Text style={styles.buttonText}>Add to seen list</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
          {props.currentUser === null ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => props.navigation.navigate('Login')}
              >
                <Text style={styles.buttonText}>Log in / Sign up</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
  },
  // extra: {
  //   marginBottom: 25,
  //   marginLeft: 15,
  // },
  containerInfo: {
    margin: 5,
    padding: 5,
    borderStyle: 'solid',
    borderColor: 'blue',
    borderWidth: 2,
  },
  showsList: {
    flex: 1,
  },
  image: {
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'left',
    fontSize: 18,
    margin: 10,
  },
  cardContent: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  tagsContent: {
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tvTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#21A179',
    marginTop: 5,
  },
  warningTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#E24E1B',
    marginTop: 5,
  },
  tagText: {
    fontSize: 13.5,
    fontWeight: '500',
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
    backgroundColor: '#586BA4',
    marginTop: 5,
  },
})
const mapState = (store) => ({
  currentUser: store.currentUser.userInfo,
  currentUserShows: store.currentUser.userShows,
  watchShows: store.currentUser.toWatch,
  seenShows: store.currentUser.seen,
  following: store.currentUser.following,
  recShows: store.currentUser.recShows,
})

const mapDispatch = (dispatch) => {
  return {
    addShow: (showInfo, type) => dispatch(addShow(showInfo, type)),
    deleteShow: (showId) => dispatch(deleteShow(showId)),
    switchShow: (userShowId, newType) =>
      dispatch(switchShow(userShowId, newType)),
    getOtherUser: (userId) => dispatch(getOtherUser(userId)),
    getSingleUserShow: (uid, showId) =>
      dispatch(getSingleUserShow(uid, showId)),
  }
}

export default connect(mapState, mapDispatch)(SingleShow)
