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

  // const isFocused = useIsFocused();

  useEffect(() => {
    const { currentUser, currentUserShows } = props;
    const { uid } = props.route.params ?? {};

    const getUser = async () => {
      try {
        if (uid) {
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
        {/* <Text style={styles.text}>
          Receiving recs from {props.following.length} people
        </Text> */}
        {/* Add in who is following */}
        <Text style={styles.text}>Recommending {userShows.length} shows</Text>
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
            borderBottomColor: '#87B56A',
            borderBottomWidth: 2,
          },
          tabBarStyle: {
            backgroundColor: '#633689',
          },
        }}
      >
        <Tab.Screen
          name="Recs"
          component={ViewShows}
          initialParams={{ user, type: 'recs', userShows }}
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
