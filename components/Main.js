import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import firebase from 'firebase/app';
import { getUser, clearData } from '../redux/actions';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import FriendShows from './Main/FriendShows';
import Search from './Main/Search';
import Profile from './Main/Profile';

const Tab = createMaterialBottomTabNavigator();

const EmptyScreen = () => {
  return null;
};

export const Main = (props) => {
  useEffect(() => {
    props.clearData();
    props.getUser();
  }, []);

  return (
    <Tab.Navigator initialRouteName="Feed" labeled={false}>
      <Tab.Screen
        name="FriendShows"
        component={FriendShows}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="AddShowContainer"
        component={EmptyScreen}
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
        navigation={props.navigation}
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
            navigation.navigate('Profile', {
              uid: firebase.auth().currentUser.uid,
            });
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
};

const mapState = (state) => {
  return {
    user: state.userState.currentUser,
  };
};

const mapDispatch = (dispatch) => {
  return {
    getUser: () => dispatch(getUser()),
    clearData: () => dispatch(clearData()),
  };
};

export default connect(mapState, mapDispatch)(Main);
