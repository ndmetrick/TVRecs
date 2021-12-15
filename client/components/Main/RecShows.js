import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Switch,
} from 'react-native';

import { getUserFollowing, getUsersFollowingRecs } from '../../redux/actions';
import OtherRecerModal from './OtherRecerModal';

import { connect } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

const RecShows = (props) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [recShows, setRecShows] = useState([]);
  const [filter, setFilter] = useState('default');
  const [multipleRecInfo, setMultipleRecInfo] = useState({});
  const [noUserShows, setNoUserShows] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    const getRecShows = async () => {
      try {
        if (props.allRecShows) {
          let shows = props.allRecShows;
          shows.sort(function (x, y) {
            return new Date(y.updatedAt) - new Date(x.updatedAt);
          });
          // if they toggled to only see shows not on their profile, remove shows that appear on their rec, watch, and seen lists
          if (noUserShows) {
            shows = shows.filter((recShow) => {
              return (
                !props.userShows.find(
                  (userShow) => userShow.show.imdbId === recShow.show.imdbId
                ) &&
                !props.toWatch.find(
                  (watchShow) => watchShow.show.imdbId === recShow.show.imdbId
                ) &&
                !props.seen.find(
                  (seenShow) => seenShow.show.imdbId === recShow.show.imdbId
                )
              );
            });
          }
          // we only want to see a show recommended once on the timeline, but we want to be able to see how many times it was recommended and by which other users
          let visibleShows = [];
          let recCounts = {};
          if (filter === 'default') {
            for (let recShow of shows) {
              const count = recCounts[recShow.show.imdbId];
              if (!count) {
                visibleShows.push(recShow);
                recCounts[recShow.show.imdbId] = {
                  num: 1,
                  recommenders: [
                    { name: recShow.user.username, id: recShow.user.id },
                  ],
                };
              } else {
                recCounts[recShow.show.imdbId].num++;
                recCounts[recShow.show.imdbId].recommenders.push({
                  name: recShow.user.username,
                  id: recShow.user.id,
                });
              }
            }
          }
          setRecShows(visibleShows);
          setMultipleRecInfo(recCounts);
          return () => {
            setRecShows([]);
          };
        }
      } catch (err) {
        console.log(err);
      }
    };
    getRecShows();
  }, [isFocused, props.following, props.allRecShows, filter, noUserShows]);

  const seeOtherRecers = (recInfo) => {
    setModalVisible(true);
    setSelectedItem(recInfo);
  };

  const toggleNoUserShows = () => {
    setNoUserShows((previousState) => !previousState);
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
      <View style={styles.toggleContainer}>
        {!noUserShows ? (
          <Text>Toggle to hide shows you've already saved to your profile</Text>
        ) : (
          <Text>
            Toggle to see include you've alreeady saved to your profile
          </Text>
        )}
        <Switch
          // trackColor={{ false: '#767577', true: '#81b0ff' }}
          // thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleNoUserShows}
          value={noUserShows}
        />
      </View>
      <View style={styles.containerGallery}>
        <FlatList
          numColumns={1}
          horizontal={false}
          data={recShows}
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
                {multipleRecInfo[item.show.imdbId].num > 1 ? (
                  <View>
                    <Text>Also rec'd by: </Text>
                    <TouchableOpacity
                      onPress={() =>
                        seeOtherRecers(
                          multipleRecInfo[item.show.imdbId].recommenders
                        )
                      }
                    >
                      <Text style={{ color: 'blue' }}>
                        {multipleRecInfo[item.show.imdbId].num > 2
                          ? `${
                              multipleRecInfo[item.show.imdbId].num - 1
                            } others you follow`
                          : `${
                              multipleRecInfo[item.show.imdbId].num - 1
                            } other person you follow`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <OtherRecerModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          selectedItem={selectedItem}
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
    marginBottom: 5,
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
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  toggleContainer: {
    padding: 10,
  },
});
const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  following: store.currentUser.following,
  allRecShows: store.currentUser.recShows,
  userShows: store.currentUser.userShows,
  toWatch: store.currentUser.toWatch,
  seen: store.currentUser.seen,
});

const mapDispatchToProps = (dispatch) => {
  return {
    getUserFollowing: () => dispatch(getUserFollowing()),
    getUsersFollowingRecs: () => dispatch(getUsersFollowingRecs()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RecShows);
