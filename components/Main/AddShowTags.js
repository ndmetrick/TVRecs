import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AddShowTags = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pick some tags to describe the show</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    marginHorizontal: 2,
  },
  text: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputText: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
  },
  button: {
    textAlign: 'center',
    backgroundColor: '#4281A4',
    marginVertical: 8,
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#6F98AE',
    borderBottomWidth: 2,
  },
});

export default AddShowTags;
