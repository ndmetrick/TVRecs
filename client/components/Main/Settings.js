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
import { getUserTags, changeUserTags } from '../../redux/actions';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import ViewShows from './ViewShows';
import { useIsFocused } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

function Settings(props) {
  // const isFocused = useIsFocused();
  // const [currentUser, setCurrentUser] = useState(null);
  // const [currentUserShows, setCurrentUserShows] = useState([]);

  // useEffect(() => {
  //   console.log('here we are in profile UE');
  //   setCurrentUser(props.currentUser);
  //   setCurrentUserShows(props.currentUserShows);
  // }, [isFocused]);
  const logout = () => {
    // firebase.auth().signOut();
    console.log('i have to figure logging out');
  };

  const { currentUser, currentUserShows } = props;
  if (currentUser === null) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        settings coming soon (how to filter your recs, what country you're
        watching in (currently everything is set to US), user tags, etc)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    marginRight: 10,
    marginLeft: 10,
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
  currentUserShows: store.currentUser.userShows,
  following: store.currentUser.following,
  userTags: store.currentUser.userTags,
});
const mapDispatch = (dispatch) => {
  return {
    getUserTags: (uid) => dispatch(getUserTags(uid)),
    changeUserTags: (tagIds) => dispatch(changeUserTags(tagIds)),
  };
};
export default connect(mapStateToProps, mapDispatch)(Settings);
