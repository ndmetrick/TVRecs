import * as AuthSession from 'expo-auth-session';
import { connect } from 'react-redux';
import jwtDecode from 'jwt-decode';
import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import { Alert, Button, Platform, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Main from './client/components/Main';
import AddShowTags from './client/components/Main/AddShowTags';
import SaveShow from './client/components/Main/SaveShow';
import AddShow from './client/components/Main/AddShow';
import OtherUser from './client/components/Main/OtherUser';
import SingleShow from './client/components/Main/SingleShow';
import MainLoggedOut from './client/components/MainLoggedOut';
import Login from './client/components/auth/Login';

const Start = (props) => {
  const Stack = createStackNavigator();

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (props.currentUser) {
      setUser(props.currentUser);
    }
  }, [props.currentUser]);

  return (
    <>
      {user ? (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Main">
            <Stack.Screen
              name="Main"
              component={Main}
              option={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddShowTags"
              component={AddShowTags}
              navigation={props.navigation}
            />
            <Stack.Screen
              name="SaveShow"
              component={SaveShow}
              navigation={props.navigation}
            />
            <Stack.Screen
              name="SingleShow"
              component={SingleShow}
              navigation={props.navigation}
            />
            <Stack.Screen
              name="OtherUser"
              component={OtherUser}
              navigation={props.navigation}
            />
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="MainLoggedOut">
            <Stack.Screen
              name="MainLoggedOut"
              component={MainLoggedOut}
              option={{ headerShown: false }}
            />
            <Stack.Screen
              name="SingleShow"
              component={SingleShow}
              navigation={props.navigation}
            />
            <Stack.Screen
              name="OtherUser"
              component={OtherUser}
              navigation={props.navigation}
            />
            <Stack.Screen
              name="Login"
              component={Login}
              navigation={props.navigation}
            />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
});

const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
});

export default connect(mapStateToProps)(Start);
