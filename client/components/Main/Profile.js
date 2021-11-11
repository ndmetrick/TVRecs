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
  getCurrentUser,
  getUserShows,
  getOtherUser,
  follow,
  unfollow,
  getUserFollowing,
} from '../../redux/actions';

import { useIsFocused } from '@react-navigation/native';

function Profile(props) {
  const [userShows, setUserShows] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    const { currentUser, currentUserShows, otherUser } = props;
    if (props.route.params.uid === currentUser.id) {
      setUser(currentUser);
      setUserShows(currentUserShows);
    } else {
      getUserShows(props.route.params.uid);
      setUser(otherUser);
      setUserShows(props.otherUserShows);
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
  }, [props.route.params.uid, following, isFocused]);

  const follow = async () => {
    await follow();
    setFollowing(true);
  };
  const unfollow = async () => {
    await unfollow();
    setFollowing(false);
  };

  const logout = () => {
    // firebase.auth().signOut();
    console.log('i have to figure logging out');
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
        {props.route.params.uid !== props.currentUser.id ? (
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
  currentUser: store.userState.currentUser,
  otherUser: store.usersState.user,
  currentUserShows: store.userState.userShows,
  otherUserShows: store.usersState.shows,
  following: store.userState.following,
});
const mapDispatch = (dispatch) => {
  return {
    getUserShows: (uid) => dispatch(getUserShows(uid)),
    getCurrentUser: () => dispatch(getCurrentUser()),
    unfollow: (uid) => dispatch(unfollow(uid)),
    follow: (uid) => dispatch(follow(uid)),
    getUserFollowing: () => dispatch(getUserFollowing()),
  };
};
export default connect(mapStateToProps, mapDispatch)(Profile);
