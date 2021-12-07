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
      <Text>This worked</Text>
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
    fontSize: 18,
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
