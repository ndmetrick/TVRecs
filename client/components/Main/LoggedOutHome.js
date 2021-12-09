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

function LoggedOutHome(props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        This app is a lot more fun if you sign up for an account. If you have an
        account, you can follow other users to receive their recommendations,
        recommend TV shows (and tag them with descriptions), and save TV shows
        you want to remembet to watch to your private watch list (and more, as
        development continues).{'\n'}
        {'\n'}
        If you would prefer to play around with the app without making an
        account but would like to see the logged-in user experience, feel free
        to use the following guest account: {'\n'}
        {'\n'}username: tvRecsApp@gmail.com {'\n'}password: iloveTV! {'\n'}
        {'\n'}Just know that anything you save may be overwritten by another
        guest in the future.{'\n'}
        {'\n'}
        Do note that this app is currently in development and a temporary
        version of it is being deployed so that users can test and interact with
        it. But there are lots of known bugs, so just beware of that.{'\n'}
        {'\n'}
        If you've got ideas for tags I'm missing that I should add, or have
        other ideas, feel free to email me at ndmetrick@gmail.com.
      </Text>
      <View style={styles.button}>
        <Button
          title="Log in / Sign up"
          color="white"
          onPress={() => props.navigation.navigate('Login')}
        ></Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  separator: {
    marginVertical: 8,
    borderBottomColor: '#6F98AE',
    borderBottomWidth: 2,
  },

  text: {
    textAlign: 'left',
    fontSize: 16,
    margin: 5,
  },
  button: {
    textAlign: 'center',
    backgroundColor: '#4281A4',
    marginVertical: 8,
    marginBottom: 8,
    marginRight: 10,
    marginLeft: 10,
  },
});

export default LoggedOutHome;
