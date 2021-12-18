import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  getOtherUser,
  follow,
  unfollow,
  getUsersFollowingRecs,
} from '../../redux/actions';

import { useIsFocused } from '@react-navigation/native';

function UsersFollowing(props) {
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState([]);
  const [isCurrentUser, setIsCurrentUser] = useState(null);
  const [userFollowing, setUserFollowing] = useState({});

  const isFocused = useIsFocused();

  useEffect(() => {
    const { currentUser } = props;
    const { userInfo, previous, userFollowing } = props.route.params;
    setUser(userInfo);
    if (previous === 'Profile') {
      setIsCurrentUser(true);
      setFollowing(props.following);
    } else if (previous === 'OtherUser') {
      setFollowing(userFollowing);
      setIsCurrentUser(false);
    }
    if (currentUser) {
      // if the user is signed in, create an object that keeps track of whether they are following any of the users on this list (of people followed by whoever's page we came from). If the page they came from is not the current user's page, create an object first that makes it easy to search (by id) whether the current user is following any other given user.
      let currentUserFollowing;
      if (previous === 'OtherUser') {
        currentUserFollowing = {};
        props.following.forEach((followed) => {
          currentUserFollowing[followed.id] = true;
        });
      }
      const followingYesOrNo = {};
      // followingYesOrNo[userId] is always equal to true if we're coming from the current user's profile, because userFollowing is the list of people they follow. If we're coming from OtherUser, we're checking if the current user follows the given user, and then setting followingYesOrNo to the same value (of true or false)
      userFollowing.forEach((followedUser) => {
        if (followedUser.id !== props.currentUser.id) {
          followingYesOrNo[followedUser.id] =
            previous === 'Profile'
              ? true
              : currentUserFollowing[followedUser.id]
              ? true
              : false;
        }
      });
      console.log('followingyn', followingYesOrNo);
      console.log('following', props.following);
      setUserFollowing(followingYesOrNo);
    }

    return async () => {
      try {
        setIsCurrentUser(null);
        setUser(null);
        setFollowing([]);
        setUserFollowing({});
        await getUsersFollowingRecs();
      } catch (err) {
        console.log(err);
      }
    };
  }, [props.route.params.userInfo, props.following, isFocused]);

  const changeFollow = async (userId) => {
    if (userFollowing[userId] === true) {
      if (props.following.length < 2) {
        await props.unfollow(userId);
        props.navigation.navigate('profile');
      } else {
        await props.unfollow(userId);
        const swap = { ...userFollowing, [userId]: false };
        setUserFollowing(swap);
      }
    } else {
      await props.follow(userId);
      const swap = { ...userFollowing, [userId]: true };
      setUserFollowing(swap);
    }
  };

  if (user === null || following.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.followedContainer}>
        {following.map((followed, index) => {
          return (
            <View key={index} style={styles.followedUserContainer}>
              <View>
                <TouchableOpacity
                  onPress={() =>
                    props.navigation.navigate("TV rec'er", {
                      uid: followed.id,
                    })
                  }
                >
                  <Text style={{ ...styles.text, color: 'blue' }}>
                    {followed.username}
                  </Text>
                </TouchableOpacity>
              </View>
              {props.currentUser ? (
                <View>
                  {userFollowing[followed.id] ? (
                    <TouchableOpacity
                      style={styles.followed}
                      onPress={() => changeFollow(followed.id)}
                    >
                      <Text style={styles.text}>Stop receiving recs</Text>
                    </TouchableOpacity>
                  ) : followed.id === props.currentUser.id ? null : (
                    <TouchableOpacity
                      style={styles.unfollowed}
                      onPress={() => changeFollow(followed.id)}
                    >
                      <Text style={styles.text}>Receive recs</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
            </View>
          );
        })}
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
  followedUserContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 5,
    marginLeft: 5,
  },
  followedContainer: {
    flexDirection: 'column',
    // justifyContent: 'space-around',
  },
  text: {
    fontSize: 18,
    margin: 5,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
    margin: 5,
    fontWeight: '500',
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#586BA4',
    marginTop: 5,
  },
  followed: {
    padding: 5,
    borderRadius: 10,
    marginHorizontal: 3,
    backgroundColor: 'lightblue',
    marginTop: 5,
    width: 180,
  },
  unfollowed: {
    padding: 5,
    borderRadius: 10,
    marginHorizontal: 3,
    backgroundColor: '#36C9C6',
    marginTop: 5,
    width: 180,
  },
});
const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  following: store.currentUser.following,
  otherUsers: store.allOtherUsers.usersInfo,
});
const mapDispatch = (dispatch) => {
  return {
    getOtherUser: (uid) => dispatch(getOtherUser(uid)),
    unfollow: (uid) => dispatch(unfollow(uid)),
    follow: (uid) => dispatch(follow(uid)),
    getUsersFollowingRecs: () => dispatch(getUsersFollowingRecs()),
  };
};
export default connect(mapStateToProps, mapDispatch)(UsersFollowing);
