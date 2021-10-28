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
} from 'react-native';
import { getUserShows } from '../../redux/actions';

import firebase from 'firebase/app';
require('firebase/firestore');

import { useIsFocused } from '@react-navigation/native';

function Profile(props) {
  const [userShows, setUserShows] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    const { currentUser, shows } = props;
    getUserShows();
    if (props.route.params.uid === firebase.auth().currentUser.uid) {
      const uid = props.route.params.uid;
      setUser({ uid, ...currentUser });
      setUserShows(shows);
    } else {
      firebase
        .firestore()
        .collection('users')
        .doc(props.route.params.uid)
        .get()
        .then((userInfo) => {
          if (userInfo.exists) {
            const uid = props.route.params.uid;
            const data = userInfo.data();
            setUser({ uid, ...data });
          } else {
            console.log('That user does not exist');
          }
        });
      firebase
        .firestore()
        .collection('shows')
        .doc(props.route.params.uid)
        .collection('userShows')
        .orderBy('creation', 'asc')
        .get()
        .then((showsInfo) => {
          let shows = showsInfo.docs.map((doc) => {
            const data = doc.data();
            const id = doc.id;
            return { id, ...data };
          });
          setUserShows(shows);
        });
    }
    if (props.following.includes(props.route.params.uid)) {
      setFollowing(true);
    } else {
      setFollowing(false);
    }
    return () => {
      setUserShows([]);
      setUser(null);
      setFollowing(false);
    };
  }, [props.route.params.uid, props.following, isFocused]);

  const watch = () => {
    firebase
      .firestore()
      .collection('following')
      .doc(firebase.auth().currentUser.uid)
      .collection('userFollowing')
      .doc(props.route.params.uid)
      .set({});
  };
  const stopWatching = () => {
    firebase
      .firestore()
      .collection('following')
      .doc(firebase.auth().currentUser.uid)
      .collection('userFollowing')
      .doc(props.route.params.uid)
      .delete();
  };

  const logout = () => {
    firebase.auth().signOut();
  };

  if (user === null) {
    return <View />;
  }
  console.log('SHOWS', props.shows);

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        <Text style={styles.text}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.text}>{user.email}</Text>
        {props.route.params.uid !== firebase.auth().currentUser.uid ? (
          <View>
            {following ? (
              <Button
                title="stop receiving recs"
                onPress={() => stopWatching()}
              />
            ) : (
              <Button title="receive recs" onPress={() => watch()} />
            )}
          </View>
        ) : (
          <Button title="Logout" onPress={() => logout()} />
        )}
      </View>
      <View style={styles.containerGallery}>
        <FlatList
          numColumns={2}
          horizontal={false}
          data={userShows}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <TouchableOpacity
                onPress={() =>
                  props.navigation.navigate('SingleShow', {
                    uid: user.uid,
                    showId: item.id,
                  })
                }
                style={styles.catalogContainer}
              >
                <Image style={styles.image} source={{ uri: item.imageUrl }} />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  image: {
    flex: 1,
    aspectRatio: 1 / 1,
  },
  text: {
    textAlign: 'left',
    fontSize: 18,
  },
});
const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  shows: store.userState.shows,
  following: store.userState.following,
});
const mapDispatch = (dispatch) => {
  return {
    getUserShows: () => dispatch(getUserShows()),
  };
};
export default connect(mapStateToProps, mapDispatch)(Profile);
