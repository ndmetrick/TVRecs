import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

function FAQ(props) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.text}>
        There are three ways to save shows to your profile in TV Recs. You can
        save shows to your Recs list, to your Watch list, or to your Seen list.
        Your Recs list is for shows you want to recommend to other users, and is
        the only list that other users will be able to see. Your Watch list is
        for shows you haven't seen yet and want to remember to watch later (if
        you see a friend recommending a show and want to check it out, add it to
        your Watch list so you won't forget what it's called). Your Seen list is
        for shows you've seen but don't necessarily want to recommend to others,
        for whatever reason. One reason you might want to add shows to that list
        is so you can avoid seeing them on your main feed (you can filter out
        the shows saved to your profile if you'd prefer to only see new
        recommendations).{'\n'}
        {'\n'}
        You can add a description and tags (or not) to shows in any list. You
        can also easily transfer shows from your Watch list to your Seen list or
        your Recs list.{'\n'}
        {'\n'}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => props.navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Log in / Sign up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
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
    marginBottom: 10,
  },
});

export default FAQ;
