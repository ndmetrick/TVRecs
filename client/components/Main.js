import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import {
  getCurrentUser,
  clearData,
  getUserShows,
  getUserFollowing,
  getUserTags,
  getUsersFollowingRecs,
  getAllOtherUsers,
  getUserShowsToWatch,
  getAllTags,
} from '../redux/actions';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import RecShows from './Main/RecShows';
import Search from './Main/Search';
import Profile from './Main/Profile';
import AddShow from './Main/AddShow';
import Settings from './Main/Settings';

const Tab = createMaterialBottomTabNavigator();

function Main(props) {
  useEffect(() => {
    props.clearData();
    props.getCurrentUser();
    props.getUserFollowing();
    props.getUserShows();
    props.getUsersFollowingRecs();
    props.getAllOtherUsers();
    props.getUserShowsToWatch();
    props.getUserTags();
    props.getAllTags();
  }, []);

  const { user } = props;

  return (
    <Tab.Navigator initialRouteName="Feed" labeled={false}>
      <Tab.Screen
        name="RecShows"
        component={RecShows}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
        }}
      />

      <Tab.Screen
        name="AddShow"
        children={() => (
          <AddShow
            previous={props.navigation.getState().routes}
            navigation={props.navigation}
          />
        )}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name="television-classic"
              color={color}
              size={26}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        navigation={props.navigation}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person-add" color={color} size={26} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            event.preventDefault();
            navigation.navigate('Profile');
          },
        })}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle"
              color={color}
              size={26}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        navigation={props.navigation}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
// }

const mapState = (state) => {
  return {
    user: state.currentUser.userInfo,
  };
};

const mapDispatch = (dispatch) => {
  return {
    getCurrentUser: () => dispatch(getCurrentUser()),
    clearData: () => dispatch(clearData()),
    getUserShows: () => dispatch(getUserShows()),
    getUserFollowing: () => dispatch(getUserFollowing()),
    getUsersFollowingRecs: () => dispatch(getUsersFollowingRecs()),
    getAllOtherUsers: () => dispatch(getAllOtherUsers()),
    getUserTags: () => dispatch(getUserTags()),
    getUserShowsToWatch: () => dispatch(getUserShowsToWatch()),
    getAllTags: () => dispatch(getAllTags()),
  };
};

export default connect(mapState, mapDispatch)(Main);
