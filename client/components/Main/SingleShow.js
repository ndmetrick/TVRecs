import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  FlatList,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { addShow, deleteShow, switchShow } from '../../redux/actions';

function SingleShow(props) {
  const [userShow, setUserShow] = useState({});
  const [user, setUser] = useState(null);
  const [toWatch, setToWatch] = useState(null);
  const [warningTags, setWarningTags] = useState([]);
  const [tvTags, setTVTags] = useState([]);

  // const [following, setFollowing] = useState(false);

  useEffect(() => {
    const { currentUser } = props;
    const { userShow, userInfo } = props.route.params;

    if (userInfo.id === currentUser.id) {
      setUser(currentUser);
    } else {
      setUser(userInfo);
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
    setToWatch(userShow.toWatch);
  }, [props.route.params.userInfo, toWatch]);

  const addShow = async (userShow, currentToWatch) => {
    // if the toWatch variable is being changed (i.e. the show is moving from to-watch to recommended),
    if (typeof currentToWatch !== 'boolean') {
      await props.switchShow(currentToWatch, userShow.description);
      Alert.alert(
        'Show added',
        `${userShow.show.name} was added to your rec'd shows and removed from your watch list`,
        {
          text: 'OK',
        }
      );
      setToWatch(false);
      return props.navigation.goBack();
    } else {
      const showData = {
        showName: userShow.show.name,
        streaming: userShow.show.streaming,
        purchase: userShow.show.purchase,
        imageUrl: userShow.show.imageUrl,
        imdbId: userShow.show.imdbId,
      };
      if (currentToWatch === true) {
        showData.description = userShow.description;
      } else {
        showData.description = '';
      }
      await props.addShow(showData, currentToWatch);
      Alert.alert(
        'Show added',
        `${userShow.show.name} was added to your ${
          currentToWatch === false ? "rec'd shows" : 'watch list'
        }`,
        {
          text: 'OK',
        }
      );
      // WE JUST WANT TO GO BACK ACTUALLY
      // return props.navigation.navigate('OtherUser', {
      //   uid: user.id,
      //   changedState: true,
      // });
      return props.navigation.goBack();
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
      return (
        <View key={key} style={styles.btnColor}>
          <Text>{tag.name}</Text>
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

      <View style={styles.separator} />
      <ScrollView contentContainerStyle={{ flex: 1 }}>
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

          {userShow.tags.length ? (
            <View>
              {tvTags.length ? (
                <View>
                  <Text style={styles.text}>
                    I think these tags describe some important things about the
                    show and its themes:
                  </Text>
                  <View style={[styles.cardContent, styles.tagsContent]}>
                    {displayTags(tvTags)}
                  </View>
                </View>
              ) : null}

              {warningTags.length ? (
                <View>
                  <Text style={styles.text}>
                    I would describe this show as:
                  </Text>
                  <View style={[styles.cardContent, styles.tagsContent]}>
                    {displayTags(warningTags)}
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          {userShow.show.streaming ? (
            <View>
              <Text style={{ fontWeight: 'bold' }}>Streaming options: </Text>
              <Text style={styles.text}>{userShow.show.streaming}</Text>
            </View>
          ) : null}
          {userShow.show.purchase ? (
            <View>
              <Text style={{ fontWeight: 'bold' }}>Purchase options:</Text>
              <Text style={styles.text}>{userShow.show.purchase}</Text>
            </View>
          ) : null}

          {user.id === props.currentUser.id ? (
            <View>
              <View>
                <Button
                  title="Delete show"
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
                />
              </View>
              <View>
                <Button
                  title="Add/change tags"
                  onPress={() =>
                    props.navigation.navigate('AddShowTags', { userShow })
                  }
                />
              </View>
              {/* If the show is currently in the watch list, give the user the option to switch it to a recommended show */}
              {toWatch === true ? (
                <View>
                  <Button
                    title="Rec show"
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
                                toWatch: false,
                                userShowId: userShow.id,
                              }),
                          },
                          {
                            text: 'Cancel',
                          },
                        ]
                      )
                    }
                  />
                </View>
              ) : null}
            </View>
          ) : null}

          {props.showList.includes(userShow.show.name) ||
          props.watchList.includes(userShow.show.name) ? null : (
            <View>
              <Button
                title="Rec show"
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
                            toWatch: false,
                          }),
                      },
                      {
                        text: 'NO',
                        onPress: () => addShow(userShow, false),
                      },
                      {
                        text: 'Cancel',
                      },
                    ]
                  )
                }
              />
              <Button
                title="Add show to watch list"
                onPress={() =>
                  Alert.alert(
                    'Add show to watch list choices',
                    `Do you want to keep ${user.username}'s description and tags? You can choose YES to keep them, NO to write your own, or Cancel to continue without saving this show to your watch list`,
                    [
                      {
                        text: 'YES',
                        onPress: () => addShow(userShow, true),
                      },
                      {
                        text: 'NO',
                        onPress: () =>
                          props.navigation.navigate('AddShow', {
                            userShow,
                            toWatch: true,
                          }),
                      },
                      {
                        text: 'Cancel',
                      },
                    ]
                  )
                }
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  extra: {
    marginBottom: 25,
    marginLeft: 15,
  },
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
  containerImage: {
    flex: 1 / 2,
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#6F98AE',
    borderBottomWidth: 2,
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'left',
    fontSize: 18,
  },
  cardContent: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  tagsContent: {
    marginTop: 10,
    flexWrap: 'wrap',
  },
  btnColor: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: 'lightgreen',
    marginTop: 5,
  },
  // tagGroup: {
  //   marginTop: 16,
  //   marginHorizontal: 10,
  //   marginBottom: 8,
  // },

  // controller: {
  //   borderTopColor: '#ddd',
  //   borderTopWidth: 0.8,
  //   paddingTop: 10,
  //   marginHorizontal: 12,
  // },
  // modeSwitcher: {
  //   height: 30,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginBottom: 8,
  // },
  // modeText: {
  //   color: '#333',
  //   fontSize: 18,
  // },

  // tagStyle: {
  //   marginTop: 4,
  //   marginHorizontal: 8,
  //   backgroundColor: '#FF3F00',
  //   borderWidth: 0,
  //   marginRight: 12,
  //   paddingHorizontal: 24,
  //   paddingVertical: 8,
  // },

  // textStyle: {
  //   color: 'black',
  //   fontSize: 14,
  //   fontWeight: 'bold',
  // },
  // buttonContainer: {
  //   height: 30,
  //   alignSelf: 'center',
  //   marginRight: 8,
  // },
  // buttonText: {
  //   color: '#FF7F11',
  //   fontSize: 16,
  // },
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
    addShow: (showInfo, toWatch) => dispatch(addShow(showInfo, toWatch)),
    deleteShow: (showId) => dispatch(deleteShow(showId)),
    switchShow: (userShowId, description) =>
      dispatch(switchShow(userShowId, description)),
  };
};

export default connect(mapState, mapDispatch)(SingleShow);
