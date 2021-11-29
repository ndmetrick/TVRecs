import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';

import {
  addShow,
  getUserFollowing,
  getUsersFollowingRecs,
} from '../../redux/actions';

import { connect } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

const RecShows = (props) => {
  const [userShows, setUserShows] = useState([]);

  const isFocused = useIsFocused();

  useEffect(() => {
    const getRecShows = async () => {
      try {
        console.log('i got to recshows and this is them', props.recShows);
        if (props.recShows) {
          console.log('i got inside here');
          const shows = props.recShows;
          shows.sort(function (x, y) {
            return y.createdAt - x.createdAt;
          });
          setUserShows(shows);
          console.log('shows', shows);
          return () => {
            setUserShows([]);
          };
        }
      } catch (err) {
        console.log(err);
      }
    };
    getRecShows();
  }, [isFocused, props.following, props.recShows]);

  const addShow = async (showName, imageUrl, streaming, purchase) => {
    await props.addShow(showName, imageUrl, streaming, purchase);
    Alert.alert('Show added', `${showName} was added to your shows`, {
      text: 'OK',
    });
  };

  if (props.following.length === 0) {
    return (
      <View>
        <Text style={styles.text}>
          Recommendations will come your way as soon as you ask to receive some
          recs!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerGallery}>
        <FlatList
          numColumns={1}
          horizontal={false}
          data={userShows}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <TouchableOpacity
                onPress={() =>
                  props.navigation.navigate('SingleShow', {
                    userInfo: item.user,
                    userShow: item,
                  })
                }
                style={styles.catalogContainer}
              >
                <Image
                  source={{ uri: item.show.imageUrl }}
                  style={styles.image}
                />
              </TouchableOpacity>
              <View>
                <Text style={{ fontWeight: 'bold' }}>{item.show.showName}</Text>
                <View style={styles.rowContainer}>
                  <Text>Rec'er: </Text>
                  <TouchableOpacity
                    onPress={() =>
                      props.navigation.navigate('Profile', {
                        uid: item.user.id,
                      })
                    }
                  >
                    <Text
                      style={{ color: 'blue' }}
                    >{`${item.user.username}`}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {item.show.streaming ? (
                <Text>Streams on: {item.show.streaming}</Text>
              ) : null}
              {item.show.purchase ? (
                <Text>Available to buy on: {item.show.purchase}</Text>
              ) : null}
              {props.showList.some(
                (showName) => showName === item.show.showName
              ) ? null : (
                <View>
                  {/* <Button
                  title="Add show to your recs"
                  onPress={() => addShow(item.showName, item.imageUrl, item.streaming, item.purchase)}
                /> */}
                  {/* <Button
                    title="Add show"
                    onPress={() =>
                      // addShow(
                      //   item.show.showName,
                      //   item.show.imageUrl,
                      //   item.show.streaming,
                      //   item.show.purchase
                      // )
                    } */}
                  {/* /> */}
                </View>
              )}
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
  },
  containerInfo: {
    margin: 20,
  },
  containerGallery: {
    flex: 1,
  },
  containerImage: {
    flex: 1 / 3,
  },
  image: {
    flex: 1,
    aspectRatio: 1 / 1,
  },
  text: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
  },
});
const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  following: store.currentUser.following,
  recShows: store.currentUser.recShows,
  userShows: store.currentUser.shows,
  showList: store.currentUser.showList,
});

const mapDispatchToProps = (dispatch) => {
  return {
    addShow: (showName, imageUrl, streaming, purchase) =>
      dispatch(addShow(showName, imageUrl, streaming, purchase)),
    getUserFollowing: () => dispatch(getUserFollowing()),
    getUsersFollowingRecs: () => dispatch(getUsersFollowingRecs()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RecShows);
