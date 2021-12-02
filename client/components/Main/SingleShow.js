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

  // const [following, setFollowing] = useState(false);

  useEffect(() => {
    const { currentUser } = props;
    const { userShow, userInfo } = props.route.params;

    if (userInfo.id === currentUser.id) {
      setUser(currentUser);
    } else {
      setUser(userInfo);
    }
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
            <Text style={styles.text}>Description: {userShow.description}</Text>
          ) : null}
          {userShow.show.streaming ? (
            <Text style={styles.text}>
              Streaming options: {userShow.show.streaming}
            </Text>
          ) : null}
          {userShow.show.purchase ? (
            <Text style={styles.text}>
              Purchase options: {userShow.show.purchase}
            </Text>
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
