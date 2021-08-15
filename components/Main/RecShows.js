import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, Button } from 'react-native';

import firebase from 'firebase';
require('firebase/firestore');
import { connect } from 'react-redux';

const RecShows = (props) => {
  const [shows, setShows] = useState([]);

  useEffect(() => {
    console.log('following', props.usersFollowingLoaded, props.following);
    if (
      props.usersFollowingLoaded === props.following.length &&
      props.following.length !== 0
    ) {
      props.recShows.sort(function (x, y) {
        return x.creation - y.creation;
      });
      setShows(props.recShows);
    }
    console.log('Shows', shows);
  }, [props.usersFollowingLoaded, props.recShows]);

  const addShow = (showName, imageUrl, streaming, purchase) => {
    firebase
      .firestore()
      .collection('shows')
      .doc(firebase.auth().currentUser.uid)
      .collection('userShows')
      .add({
        showName,
        imageUrl,
        streaming,
        purchase,
        creation: firebase.firestore.FieldValue.serverTimestamp(),
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerGallery}>
        <FlatList
          numColumns={1}
          horizontal={false}
          data={shows}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <Text>{item.showName}</Text>
              <Image style={styles.image} source={{ uri: item.imageUrl }} />
              <Text style={styles.container}>
                Rec'er:
                {item.user.firstName} {item.user.lastName}
              </Text>
              {item.streaming ? (
                <Text>Streams on: {item.streaming}</Text>
              ) : null}
              {item.purchase ? (
                <Text>You can also purchase episodes via: {item.purchase}</Text>
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
});
const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  following: store.userState.following,
  recShows: store.usersState.recShows,
  usersFollowingLoaded: store.usersState.usersFollowingLoaded,
  userShows: store.userState.shows,
});
export default connect(mapStateToProps, null)(RecShows);
