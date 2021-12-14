import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  addShow,
  deleteShow,
  switchShow,
  getAPIKey,
} from '../../redux/actions';
import StreamingAndPurchase from './StreamingAndPurchase';

import { useIsFocused } from '@react-navigation/native';

function SingleShow(props) {
  const [userShow, setUserShow] = useState({});
  const [user, setUser] = useState(null);
  const [type, setType] = useState(null);
  const [warningTags, setWarningTags] = useState([]);
  const [tvTags, setTVTags] = useState([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [country, setCountry] = useState(null);
  const [streamingAndPurchase, setStreamingAndPurchase] = useState(false);

  const isFocused = useIsFocused();

  // const [following, setFollowing] = useState(false);

  useEffect(() => {
    const { currentUser } = props;
    const { userShow, userInfo } = props.route.params;

    if (currentUser === null && userInfo !== null) {
      setUser(userInfo);
      setCountry(userInfo.country);
    } else {
      if (userInfo.id === currentUser.id) {
        setUser(currentUser);
        setIsCurrentUser(true);
        setCountry(userInfo.country);
      } else {
        setUser(userInfo);
        setCountry(userInfo.country);
      }
    }
    const warnings = userShow.tags.filter((tag) => {
      return tag.type === 'warning';
    });
    const tv = userShow.tags.filter((tag) => {
      return tag.type === 'tv' || tag.type === 'unassigned';
    });
    setTVTags(tv);
    setWarningTags(warnings);
    setUserShow(userShow);
    setType(userShow.type);
    return () => {
      setStreamingAndPurchase(false);
      setUserShow({});
      setUser(null);
      setType(null);
      setWarningTags([]);
      setTVTags([]);
      setIsCurrentUser(false);
      setCountry(null);
    };
  }, [props.route.params.userInfo, type, isFocused]);

  // console.log('current', props.currentUser);
  // console.log(
  //   'bool',
  //   props.currentUserShows
  //     .concat(props.watchShows)
  //     .concat(props.seenShows)
  //     .find((currentUserShow) => {
  //       return currentUserShow.show.imdbId === userShow.show.imdbId;
  //     })
  // );

  const addShow = async (userShow, currentType, userShowId) => {
    try {
      // if the type variable is being changed (i.e. the show is moving from to-watch to recommended),
      if (userShowId) {
        console.log('i got in here and userShowId is:', userShowId);
        await props.switchShow(userShowId, userShow.description, currentType);
        // Alert.alert(
        //   'Show added',
        //   `${userShow.show.name} was added to your rec'd shows and removed from your watch list`,
        //   {
        //     text: 'OK',
        //   }
        // );
        setType('rec');
        return props.navigation.goBack();
      } else {
        const showData = {
          showName: userShow.show.name,
          imageUrl: userShow.show.imageUrl,
          imdbId: userShow.show.imdbId,
        };
        if (currentType === 'watch') {
          showData.description = userShow.description;
        } else {
          showData.description = '';
        }
        await props.addShow(showData, currentType);
        // Alert.alert(
        //   'Show added',
        //   `${userShow.show.name} was added to your ${
        //     currentType === 'rec' ? "rec'd shows" : 'watch list'
        //   }`,
        //   {
        //     text: 'OK',
        //   }
        // );
        // WE JUST WANT TO GO BACK ACTUALLY
        // return props.navigation.navigate('OtherUser', {
        //   uid: user.id,
        //   changedState: true,
        // });
        return props.navigation.goBack();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteShow = async () => {
    try {
      await props.deleteShow(userShow.show.id);
      // return props.navigation.navigate('Profile', {
      //   changedState: true,
      // });
      return props.navigation.goBack();
    } catch (err) {
      console.error(err);
    }
  };

  const displayTags = (tags) => {
    return tags.map((tag, key) => {
      const tagStyle =
        tag.type === 'warning' ? styles.warningTag : styles.tvTag;
      return (
        <View key={key} style={tagStyle}>
          <Text style={styles.tagText}>{tag.name}</Text>
        </View>
      );
    });
  };

  if (user === null) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        {/* <Text style={styles.text}>
          {user.firstName} {user.lastName}
        </Text> */}
        <Text style={styles.text}>{user.username}</Text>
      </View>
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
            {!streamingAndPurchase && props.currentUser ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={{ ...styles.button, marginBottom: 15 }}
                  onPress={() => setStreamingAndPurchase(true)}
                >
                  <Text style={styles.buttonText}>
                    Show streaming and purchase options
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
                      Hide streaming and purchase options
                    </Text>
                  </TouchableOpacity>
                </View>
                <StreamingAndPurchase
                  showId={userShow.show.imdbId}
                  currentUser={props.currentUser}
                />
              </View>
            )}
            {userShow.tags.length ? (
              <View>
                {tvTags.length ? (
                  <View>
                    {isCurrentUser ? null : (
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
                        Alert.alert('Save current description and tags?', '', [
                          {
                            text: 'Save description/tags',
                            onPress: () =>
                              addShow(userShow, 'rec', userShow.id),
                          },
                          {
                            // if we're switching, we will need the userShow id on the back end
                            text: 'Change descripion and/or tags',
                            onPress: () =>
                              props.navigation.navigate('AddShow', {
                                userShow,
                                type: 'rec',
                                userShowId: userShow.id,
                              }),
                          },
                          {
                            text: 'Cancel',
                          },
                        ])
                      }
                    >
                      <Text style={styles.buttonText}>Recommend</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                {/* If the show is currently in the watch list, give the user the option to switch it to a seen show */}
                {type === 'watch' ? (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() =>
                        Alert.alert('Save current description/tags?', '', [
                          {
                            text: 'Save description/tags',
                            onPress: () =>
                              addShow(userShow, 'rec', userShow.id),
                          },
                          {
                            // if we're switching, we will need the userShow id on the back end
                            text: 'Write new description and/or tags',
                            onPress: () =>
                              props.navigation.navigate('AddShow', {
                                userShow,
                                type: 'rec',
                                userShowId: userShow.id,
                              }),
                          },
                          {
                            text: 'Cancel',
                          },
                        ])
                      }
                    >
                      <Text style={styles.buttonText}>Add to seen list</Text>
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
                    currentUserShow.show.imdbId === userShow.show.imdbId
                ) ||
                props.watchShows.find(
                  (watchShow) => watchShow.show.imdbId === userShow.show.imdbId
                ) ||
                props.seenShows.find(
                  (seenShow) => seenShow.show.imdbId === userShow.show.imdbId
                ) ? null : (
                  <View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() =>
                          Alert.alert('Add description/tags now?', '', [
                            {
                              text: 'Add tags',
                              onPress: () =>
                                props.navigation.navigate('AddShow', {
                                  userShow,
                                  type: 'Skip',
                                }),
                            },
                            {
                              text: 'Skip tags',
                              onPress: () => addShow(userShow, 'rec'),
                            },
                            {
                              text: 'Cancel',
                            },
                          ])
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
                            `Keep this user's description/tags?`,
                            '',
                            [
                              {
                                text: 'Yes',
                                onPress: () => addShow(userShow, 'watch'),
                              },
                              {
                                text: 'Write my own',
                                onPress: () =>
                                  props.navigation.navigate('AddShow', {
                                    userShow,
                                    type: 'watch',
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
                            `keep this user's description/tags?`,
                            '',
                            [
                              {
                                text: 'Yes',
                                onPress: () => addShow(userShow, 'seen'),
                              },
                              {
                                // if we're switching, we will need the userShow id on the back end
                                text: 'Write my own',
                                onPress: () =>
                                  props.navigation.navigate('AddShow', {
                                    userShow,
                                    type: 'seen',
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
  );
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
  separator: {
    marginVertical: 8,
    borderBottomColor: '#6F98AE',
    borderBottomWidth: 2,
  },
  image: {
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'left',
    fontSize: 16,
    margin: 10,
  },
  cardContent: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  tagsContent: {
    marginTop: 10,
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
});
const mapState = (store) => ({
  currentUser: store.currentUser.userInfo,
  currentUserShows: store.currentUser.userShows,
  watchShows: store.currentUser.toWatch,
  seenShows: store.currentUser.seen,
  following: store.currentUser.following,
});

const mapDispatch = (dispatch) => {
  return {
    addShow: (showInfo, type) => dispatch(addShow(showInfo, type)),
    deleteShow: (showId) => dispatch(deleteShow(showId)),
    switchShow: (userShowId, description, newType, tags) =>
      dispatch(switchShow(userShowId, description, newType, tags)),
  };
};

export default connect(mapState, mapDispatch)(SingleShow);
