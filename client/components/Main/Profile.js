import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import {
  getUserShows,
  getOtherUser,
  getUsersFollowingRecs,
  logout,
} from '../../redux/actions';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ViewShows from './ViewShows';
import { useIsFocused } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

function Profile(props) {
  const [userFollowing, setUserFollowing] = useState({});

  useEffect(() => {
    if (props.currentUser) {
      setUserFollowing(props.following);
    }
  }, [props.currentUser]);

  // const isFocused = useIsFocused();
  // const [currentUser, setCurrentUser] = useState(null);
  // const [currentUserShows, setCurrentUserShows] = useState([]);

  // useEffect(() => {

  //   setCurrentUser(props.currentUser);
  //   setCurrentUserShows(props.currentUserShows);
  // }, [isFocused]);
  const logout = async () => {
    try {
      await AuthSession.dismiss();
      await props.logout();
      return props.navigation.navigate('AddShow');
    } catch (e) {
      console.log(e);
    }
  };

  const { currentUser, currentUserShows } = props;
  if (currentUser === null) {
    return <View />;
  }

  currentUserShows.forEach((show) =>
    show.tags.forEach((tag) => console.log(tag.name))
  );
  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        {/* <Text style={styles.text}>
          {user.firstName} {user.lastName}
        </Text> */}
        {/* <Text style={styles.text}>{currentUser.username}</Text> */}
        {userFollowing.length > 0 ? (
          <View>
            <TouchableOpacity
              onPress={() =>
                props.navigation.navigate('UsersFollowing', {
                  previous: 'Profile',
                  userInfo: props.currentUser,
                  userFollowing: userFollowing,
                })
              }
            >
              <Text style={styles.text}>
                Receiving recs from{' '}
                <Text style={{ color: 'blue' }}>{props.following.length}</Text>{' '}
                {props.following.length === 1 ? 'person' : 'people'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.text}>
              Receiving recs from {userFollowing.length} people
            </Text>
          </View>
        )}
        {/* Add in who is following */}
        <Text style={styles.text}>
          You are recommending {currentUserShows.length}{' '}
          {currentUserShows.length === 1 ? 'show' : 'shows'}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={logout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
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
            borderBottomWidth: 7,
          },
          tabBarStyle: {
            backgroundColor: '#586BA4',
          },
        }}
      >
        <Tab.Screen
          name="Recs"
          component={ViewShows}
          initialParams={{ userToView: currentUser, type: 'recs' }}
          options={{
            tabBarLabel: 'Recs',
          }}
        />
        <Tab.Screen
          name="To Watch"
          component={ViewShows}
          initialParams={{ userToView: currentUser, type: 'toWatch' }}
          options={{
            tabBarLabel: 'To Watch',
          }}
        />
        <Tab.Screen
          name="Seen"
          component={ViewShows}
          initialParams={{ userToView: currentUser, type: 'seen' }}
          options={{
            tabBarLabel: 'Seen',
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
    getUsersFollowingRecs: () => dispatch(getUsersFollowingRecs()),
    logout: () => dispatch(logout()),
  };
};
export default connect(mapStateToProps, mapDispatch)(Profile);
