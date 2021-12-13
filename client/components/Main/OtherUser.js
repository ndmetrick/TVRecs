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
  getUserShows,
  getOtherUser,
  follow,
  unfollow,
  getUsersFollowingRecs,
} from '../../redux/actions';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import ViewShows from './ViewShows';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

// import { useIsFocused } from '@react-navigation/native';

function OtherUser(props) {
  const [userShows, setUserShows] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  // const isFocused = useIsFocused();

  useEffect(() => {
    const { currentUser, currentUserShows } = props;
    if (currentUser) {
      setLoggedIn(true);
      console.log('i got here to this thing in otherUser');
    }
    const { uid } = props.route.params ?? {};

    const getUser = async () => {
      try {
        if (uid) {
          console.log('another user', uid);
          const otherUser = await props.getOtherUser(uid);
          const otherUserShows = await props.getUserShows(uid);
          setUser(otherUser);
          setUserShows(otherUserShows);
          if (
            props.following.filter((followed) => followed.id === uid).length
          ) {
            // if (props.following.includes(uid)) {
            console.log('i got in here', props.following);
            setFollowing(true);
            setLoading(false);
          } else {
            console.log('i know im not following');
            setFollowing(false);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    getUser();
    return () => {
      console.log('is this something?');
      setUserShows([]);
      setUser(null);
      setFollowing(false);
    };
  }, [props.route.params.uid, props.following]);

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

  if (loading || user === null) {
    console.log('this is where I am');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    );
  }

  const { uid } = props.route.params ? props.route.params : {};

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        {/* <Text style={styles.text}>
          {user.firstName} {user.lastName}
        </Text> */}
        <Text style={styles.text}>{user.username}</Text>
        {/* <Text style={styles.text}>
          Receiving recs from {props.following.length} people
        </Text> */}
        {/* Add in who is following */}
        <Text style={styles.text}>Recommending {userShows.length} shows</Text>
        <View>
          {following ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => unfollow()}
              >
                <Text style={styles.buttonText}>stop receiving recs</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => follow()}>
                <Text style={styles.buttonText}>receive recs</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <Tab.Navigator
        initialRouteName="Feed"
        screenOptions={{
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#F8F8F8',
          tabBarLabelStyle: {
            textAlign: 'center',
          },
          tabBarIndicatorStyle: {
            borderBottomColor: '#21A179',
            borderBottomWidth: 2,
          },
          tabBarStyle: {
            backgroundColor: '#586BA4',
          },
        }}
      >
        <Tab.Screen
          name="Recs"
          component={ViewShows}
          initialParams={{ userToView: user, type: 'recs', userShows }}
          options={{
            tabBarLabel: 'Recs',
          }}
        />
      </Tab.Navigator>
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
  containerImage: {
    flex: 1 / 2,
  },
  text: {
    textAlign: 'left',
    fontSize: 18,
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
});
const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  otherUser: store.otherUser.userInfo,
  currentUserShows: store.currentUser.userShows,
  otherUserShows: store.otherUser.userShows,

  following: store.currentUser.following,
  otherUsers: store.allOtherUsers.usersInfo,
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
export default connect(mapStateToProps, mapDispatch)(OtherUser);
