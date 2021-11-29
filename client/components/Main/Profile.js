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
import {
  getUserShows,
  getOtherUser,
  follow,
  unfollow,
  getAllOtherUsers,
  getUsersFollowingRecs,
} from '../../redux/actions';

import { useIsFocused } from '@react-navigation/native';

function Profile(props) {
  const [userShows, setUserShows] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    const { currentUser, currentUserShows } = props;
    const { uid } = props.route.params ?? {};
    console.log(
      'props in useEffect',
      props.whatIsUp,
      'following',
      props.following
    );

    const getUser = async () => {
      try {
        if (uid === currentUser.id) {
          setUser(currentUser);
          setUserShows(currentUserShows);
        } else if (uid) {
          console.log('another user', uid);
          const otherUser = await props.getOtherUser(uid);
          const otherUserShows = await props.getUserShows(uid);
          setUser(otherUser);
          setUserShows(otherUserShows);
          console.log('here is who i am following', props.following);
          if (
            props.following.filter((followed) => followed.id === uid).length
          ) {
            // if (props.following.includes(uid)) {
            console.log('i got in here', props.following);
            setFollowing(true);
          } else {
            console.log('i know im not following');
            setFollowing(false);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    getUser();
    return () => {
      setUserShows([]);
      setUser(null);
      setFollowing(false);
    };
  }, [props.route.params.uid, props.following, isFocused]);

  const follow = async () => {
    try {
      await props.follow(user.id);
      await props.getUsersFollowingRecs();
      setFollowing(true);
    } catch (err) {
      console.log(err);
    }
  };
  const unfollow = async () => {
    try {
      await props.unfollow(user.id);
      setFollowing(false);
    } catch (err) {
      console.log(err);
    }
  };

  const logout = () => {
    // firebase.auth().signOut();
    console.log('i have to figure logging out');
  };

  if (user === null) {
    console.log('this is where I am');
    return <View />;
  }

  const { uid } = props.route.params ? props.route.params : {};
  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        {/* <Text style={styles.text}>
          {user.firstName} {user.lastName}
        </Text> */}
        <Text style={styles.text}>{user.username}</Text>
        {user.id !== props.currentUser.id ? (
          <View>
            {following ? (
              <Button title="stop receiving recs" onPress={() => unfollow()} />
            ) : (
              <Button title="receive recs" onPress={() => follow()} />
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
                    userInfo: user,
                    userShow: item,
                  })
                }
                style={styles.catalogContainer}
              >
                <Image
                  style={styles.image}
                  source={{ uri: item.show.imageUrl }}
                />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
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
  currentUser: store.currentUser.userInfo,
  otherUser: store.otherUser.userInfo,
  currentUserShows: store.currentUser.userShows,
  otherUserShows: store.otherUser.userShows,
  following: store.currentUser.following,
  otherUsers: store.allOtherUsers.usersInfo,
  whatIsUp: store.otherUser,
});
const mapDispatch = (dispatch) => {
  return {
    getOtherUser: (uid) => dispatch(getOtherUser(uid)),
    getUserShows: (uid) => dispatch(getUserShows(uid)),
    unfollow: (uid) => dispatch(unfollow(uid)),
    follow: (uid) => dispatch(follow(uid)),
    getUsersFollowingRecs: () => dispatch(getUsersFollowingRecs()),
  };
};
export default connect(mapStateToProps, mapDispatch)(Profile);
