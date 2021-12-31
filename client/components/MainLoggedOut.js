import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { clearData, getAllOtherUsers, getAllTags } from '../redux/actions';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Search from './Main/Search';
import AddShow from './Main/AddShow';
import LoggedOutHome from './Main/LoggedOutHome';

const Tab = createMaterialBottomTabNavigator();

function MainLoggedOut(props) {
  useEffect(() => {
    props.clearData();
    props.getAllOtherUsers();
    props.getAllTags();
  }, []);

  return (
    <Tab.Navigator initialRouteName="Home" labeled={false}>
      <Tab.Screen
        name="LoggedOutHome"
        component={LoggedOutHome}
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
    </Tab.Navigator>
  );
}
// }

const mapDispatch = (dispatch) => {
  return {
    clearData: () => dispatch(clearData()),
    getAllOtherUsers: () => dispatch(getAllOtherUsers()),
    getAllTags: () => dispatch(getAllTags()),
  };
};

export default connect(null, mapDispatch)(MainLoggedOut);
