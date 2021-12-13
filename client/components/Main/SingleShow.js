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
    };
  }, [props.route.params.userInfo, type, isFocused]);

  const addShow = async (userShow, currentType) => {
    try {
      // if the type variable is being changed (i.e. the show is moving from to-watch to recommended),
      if (currentType !== 'rec' && currentType !== 'watch') {
        await props.switchShow(currentType, userShow.description);
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
      <ScrollView>
        <Image style={styles.image} source={{ uri: userShow.show.imageUrl }} />
        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 18 }}>
          {userShow.show.name}
        </Text>

        <View style={styles.extra}>
          {userShow.description ? (
            <View>
              <Text style={{ fontWeight: 'bold' }}>Description: </Text>
              <Text style={styles.text}>{userShow.description}</Text>
            </View>
          ) : null}
          {!streamingAndPurchase && props.currentUser ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
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
                  style={styles.button}
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
            <View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    Alert.alert(
                      'About to delete show',
                      'Are you sure you want to delete this show?',
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
                        'About to remove show',
                        "About to remove show from your watch list and add to rec'd shows. Do you want to save current description and tags?",
                        [
                          {
                            text: 'Yes',
                            onPress: () => addShow(userShow, userShow.id),
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
                        ]
                      )
                    }
                  >
                    <Text style={styles.buttonText}>Recommend show</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ) : null}

          {props.showList.includes(userShow.show.name) ||
          props.watchList.includes(userShow.show.name) ||
          props.currentUser === null ? null : (
            <View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    Alert.alert(
                      'Rec show choices',
                      "Do you want to add description/tags now? You can choose YES to add them now, NO to rec the show and add them later, or Cancel to continue without rec'ing this show",
                      [
                        {
                          text: 'YES',
                          onPress: () =>
                            props.navigation.navigate('AddShow', {
                              userShow,
                              type: 'rec',
                            }),
                        },
                        {
                          text: 'NO',
                          onPress: () => addShow(userShow, 'rec'),
                        },
                        {
                          text: 'Cancel',
                        },
                      ]
                    )
                  }
                >
                  <Text style={styles.buttonText}>Recommend show</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    Alert.alert(
                      'Add show to watch list choices',
                      `Do you want to keep ${user.username}'s description and tags? You can choose YES to keep them, NO to write your own, or Cancel to continue without saving this show to your watch list`,
                      [
                        {
                          text: 'YES',
                          onPress: () => addShow(userShow, 'watch'),
                        },
                        {
                          text: 'NO',
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
                  <Text style={styles.buttonText}>Add show to watch list</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '500',
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
  showList: store.currentUser.showList,
  watchList: store.currentUser.watchList,
  following: store.currentUser.following,
});

const mapDispatch = (dispatch) => {
  return {
    addShow: (showInfo, type) => dispatch(addShow(showInfo, type)),
    deleteShow: (showId) => dispatch(deleteShow(showId)),
    switchShow: (userShowId, description) =>
      dispatch(switchShow(userShowId, description)),
  };
};

export default connect(mapState, mapDispatch)(SingleShow);
