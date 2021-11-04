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

import { addShow } from '../../redux/actions';

import { connect } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

// const isFocused = useIsFocused();

const RecShows = (props) => {
  const [shows, setShows] = useState([]);

  useEffect(() => {
    if (
      props.usersFollowingLoaded === props.following.length &&
      props.following.length !== 0
    ) {
      props.recShows.sort(function (x, y) {
        return x.creation - y.creation;
      });
      setShows(props.recShows);
    }
    return () => {
      setShows([]);
    };
  }, [props.usersFollowingLoaded, props.recShows]);

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
          data={shows}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <TouchableOpacity
                onPress={() =>
                  props.navigation.navigate('SingleShow', {
                    uid: item.user.uid,
                    showId: item.id,
                  })
                }
                style={styles.catalogContainer}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
              </TouchableOpacity>
              <View>
                <Text style={{ fontWeight: 'bold' }}>{item.showName}</Text>
                <View style={styles.rowContainer}>
                  <Text>Rec'er: </Text>
                  <TouchableOpacity
                    onPress={() =>
                      props.navigation.navigate('Profile', {
                        uid: item.user.uid,
                      })
                    }
                  >
                    <Text
                      style={{ color: 'blue' }}
                    >{`${item.user.firstName} ${item.user.lastName}`}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {item.streaming ? (
                <Text>Streams on: {item.streaming}</Text>
              ) : null}
              {item.purchase ? (
                <Text>Available to buy on: {item.purchase}</Text>
              ) : null}
              {props.userShows.some(
                (show) => show.showName === item.showName
              ) ? null : (
                <View>
                  {/* <Button
                  title="Add show to your recs"
                  onPress={() => addShow(item.showName, item.imageUrl, item.streaming, item.purchase)}
                /> */}
                  <Button
                    title="Add show"
                    onPress={() =>
                      addShow(
                        item.showName,
                        item.imageUrl,
                        item.streaming,
                        item.purchase
                      )
                    }
                  />
                </View>
              )}
            </View>
          )}
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
  currentUser: store.userState.currentUser,
  following: store.userState.following,
  recShows: store.usersState.recShows,
  usersFollowingLoaded: store.usersState.usersFollowingLoaded,
  userShows: store.userState.shows,
});

const mapDispatchToProps = (dispatch) => {
  return {
    addShow: (showName, imageUrl, streaming, purchase) =>
      dispatch(addShow(showName, imageUrl, streaming, purchase)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RecShows);
