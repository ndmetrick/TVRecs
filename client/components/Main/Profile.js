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
  // const isFocused = useIsFocused();
  // const [currentUser, setCurrentUser] = useState(null);
  // const [currentUserShows, setCurrentUserShows] = useState([]);

  // useEffect(() => {
  //   console.log('here we are in profile UE');
  //   setCurrentUser(props.currentUser);
  //   setCurrentUserShows(props.currentUserShows);
  // }, [isFocused]);
  const logout = async () => {
    try {
      await AuthSession.dismiss();
      await props.logout();
      console.log('current user in Profile', props.currentUser);
      return props.navigation.navigate('AddShow');
    } catch (e) {
      console.log(e);
    }
  };

  const { currentUser, currentUserShows } = props;
  if (currentUser === null) {
    return <View />;
  }

  console.log('here we are in profile');
  currentUserShows.forEach((show) =>
    show.tags.forEach((tag) => console.log(tag.name))
  );
  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        {/* <Text style={styles.text}>
          {user.firstName} {user.lastName}
        </Text> */}
        <Text style={styles.text}>{currentUser.username}</Text>
        <Text style={styles.text}>
          Receiving recs from {props.following.length}{' '}
          {props.following.length === 1 ? 'person' : 'people'}
        </Text>
        {/* Add in who is following */}
        <Text style={styles.text}>
          Recommending {currentUserShows.length}{' '}
          {currentUserShows.length === 1 ? 'show' : 'shows'}
        </Text>
        <Button title="Logout" onPress={logout} />
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
            borderBottomWidth: 7,
          },
          tabBarStyle: {
            backgroundColor: '#633689',
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
    getUsersFollowingRecs: () => dispatch(getUsersFollowingRecs()),
    logout: () => dispatch(logout()),
  };
};
export default connect(mapStateToProps, mapDispatch)(Profile);
