import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
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
        if (props.recShows) {
          const shows = props.recShows;
          shows.sort(function (x, y) {
            return new Date(y.updatedAt) - new Date(x.updatedAt);
          });
          setUserShows(shows);
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
                  props.navigation.navigate('Show', {
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
                <Text style={{ fontWeight: 'bold' }}>{item.show.name}</Text>
                <View style={styles.rowContainer}>
                  <Text>Rec'er: </Text>
                  <TouchableOpacity
                    onPress={() =>
                      props.navigation.navigate("TV rec'er", {
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
    aspectRatio: 2 / 3,
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
    getUserFollowing: () => dispatch(getUserFollowing()),
    getUsersFollowingRecs: () => dispatch(getUsersFollowingRecs()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RecShows);
