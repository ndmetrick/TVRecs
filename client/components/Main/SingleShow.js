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
  Alert,
} from 'react-native';
import {
  getUserSingleShow,
  getUsersSingleShow,
  getUserShows,
} from '../../redux/actions';

import firebase from 'firebase/app';
require('firebase/firestore');

function SingleShow(props) {
  const [show, setShow] = useState({});
  const [user, setUser] = useState(null);

  // const [following, setFollowing] = useState(false);

  useEffect(() => {
    console.log('insideUseEffect', props.route.params.showId);
    const getSingleShow = async () => {
      try {
        const { currentUser, shows } = props;
        const { showId, uid } = props.route.params;

        if (uid === firebase.auth().currentUser.uid) {
          setUser(currentUser);
          await props.getUserSingleShow(showId);
          setShow(props.show);
        } else {
          await props.getUsersSingleShow(uid, showId);
          setShow(props.show);
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
        }
        return () => {
          setShow({});
        };
      } catch (e) {
        console.error(e);
      }
    };
    getSingleShow();
  }, [props.route.params.uid]);

  const addShow = async (showName, imageUrl, streaming, purchase) => {
    await firebase
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
    Alert.alert('Show added', `${showName} was added to your shows`, {
      text: 'OK',
    });
    return props.navigation.navigate('Profile', {
      uid: props.route.params.uid,
      changedState: true,
    });
  };

  const deleteShow = async () => {
    await firebase
      .firestore()
      .collection('shows')
      .doc(firebase.auth().currentUser.uid)
      .collection('userShows')
      .doc(props.route.params.showId)
      .delete();
    await getUserShows();
    return props.navigation.navigate('Profile', {
      uid: props.route.params.uid,
      changedState: true,
    });
  };

  if (user === null) {
    return <View />;
  }

  console.log('SHOW IN SINGLE', props.show);
  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        <Text style={styles.text}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.text}>{user.email}</Text>
      </View>

      <View style={styles.separator} />

      <Image style={styles.image} source={{ uri: props.show.imageUrl }} />
      <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 18 }}>
        {props.show.showName}
      </Text>
      <View style={styles.extra}>
        {props.show.description ? (
          <Text style={styles.text}>Description: {props.show.description}</Text>
        ) : null}
        {props.show.streaming ? (
          <Text style={styles.text}>
            Streaming options: {props.show.streaming}
          </Text>
        ) : null}
        {props.show.purchase ? (
          <Text style={styles.text}>
            Purchase options: {props.show.purchase}
          </Text>
        ) : null}

        {props.route.params.uid === firebase.auth().currentUser.uid ? (
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
        ) : null}

        {props.showList.includes(props.show.showName) ? null : (
          <View>
            <Button
              title="Add show"
              onPress={() =>
                addShow(
                  show.showName,
                  show.imageUrl,
                  show.streaming,
                  show.purchase
                )
              }
            />
          </View>
        )}
      </View>
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
  currentUser: store.userState.currentUser,
  userShows: store.userState.shows,
  showList: store.userState.showList,
  following: store.userState.following,
  show: store.singleShowState,
});

const mapDispatch = (dispatch) => {
  return {
    getUserSingleShow: (showId) => dispatch(getUserSingleShow(showId)),
    getUsersSingleShow: (uid, showId) =>
      dispatch(getUsersSingleShow(uid, showId)),
    getUserShows: () => dispatch(getUserShows()),
  };
};

export default connect(mapState, mapDispatch)(SingleShow);
