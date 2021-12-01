import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import {
  getCurrentUser,
  clearData,
  getUserShows,
  getUserFollowing,
  getTags,
  getUsersFollowingRecs,
  getAllOtherUsers,
  getUserShowsToWatch,
} from '../redux/actions';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import RecShows from './Main/RecShows';
import Search from './Main/Search';
import Profile from './Main/Profile';
import AddShow from './Main/AddShow';

const Tab = createMaterialBottomTabNavigator();

const EmptyScreen = () => {
  return null;
};

export class Main extends Component {
  componentDidMount() {
    this.props.clearData();
    this.props.getCurrentUser();
    this.props.getUserFollowing();
    this.props.getUserShows();
    this.props.getUsersFollowingRecs();
    this.props.getAllOtherUsers();
    this.props.getUserShowsToWatch();
  }

  render() {
    const { user } = this.props;

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
        {/* <Tab.Screen
          name="AddShowContainer"
          component={EmptyScreen}
          listeners={({ navigation }) => ({
            tabPress: (event) => {
              event.preventDefault();
              navigation.navigate('AddShow', {
                navigation: this.props.navigation,
              });
            },
          })}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="plus-box" color={color} size={26} />
            ),
          }}
        /> */}

        <Tab.Screen
          name="AddScreen"
          component={AddShow}
          navigation={this.props.navigation}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="plus-box" color={color} size={26} />
            ),
          }}
        />

        {/* <Tab.Screen
        name="AddShow"
        component={AddShow}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            event.preventDefault();
            navigation.navigate('AddShow');
          },
        })}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-box" color={color} size={26} />
          ),
        }}
      /> */}
        <Tab.Screen
          name="Search"
          component={Search}
          navigation={this.props.navigation}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="magnify" color={color} size={26} />
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
      </Tab.Navigator>
    );
  }
}

const mapState = (state) => {
  return {
    user: state.currentUser.userInfo,
    following: state.currentUser.following,
    recShows: state.currentUser.recShows,
    usersFollowingLoaded: state.currentUser.usersFollowingLoaded,
    userShows: state.currentUser.shows,
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
    // getTags: () => dispatch(getTags()),
    getUserShowsToWatch: () => dispatch(getUserShowsToWatch()),
  };
};

export default connect(mapState, mapDispatch)(Main);
