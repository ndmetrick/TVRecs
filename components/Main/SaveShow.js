import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Image, Button, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import firebase from 'firebase';
import { NavigationContainer } from '@react-navigation/native';
require('firebase/firestore');

function SaveShow(props) {
  const { imageUrl, showName, streaming, purchase, description, navigation } =
    props.route.params || '';

  const [goBack, setGoBack] = useState(false);

  useEffect(() => {
    const saveShowData = async () => {
      await firebase
        .firestore()
        .collection('shows')
        .doc(firebase.auth().currentUser.uid)
        .collection('userShows')
        .add({
          showName,
          description,
          streaming,
          purchase,
          imageUrl,
          creation: firebase.firestore.FieldValue.serverTimestamp(),
        });
    };
    if (!props.userShows.includes(showName)) {
      saveShowData();
    } else {
      setGoBack(true);
    }
  }, []);

  console.log('here and', imageUrl);
  const image = { uri: imageUrl };

  if (goBack) {
    return (
      <View>
        <Text style={styles.text}>You've already added that show.</Text>
        <Button title="Go back" onPress={() => props.navigation.popToTop()} />
      </View>
    );
  }
  return (
    <View>
      <Text style={styles.text}>{showName}</Text>
      <View style={styles.separator} />
      {description ? (
        <View>
          <Text style={styles.text}>Description: {description}</Text>
          <View style={styles.separator} />
        </View>
      ) : null}
      {purchase ? (
        <View>
          <Text style={styles.text}>Purchase options: {purchase}</Text>
          <View style={styles.separator} />
        </View>
      ) : null}
      {streaming ? (
        <View>
          <Text style={styles.text}>Streaming options: {streaming}</Text>
          <View style={styles.separator} />
        </View>
      ) : null}
      <Image
        source={image}
        style={{ height: 300, resizeMode: 'contain', margin: 5 }}
      />
      <Button
        title="Next: add descriptive tags"
        onPress={() => navigation.navigate('AddShowTags')}
      />
      <Button title="Skip tags" onPress={() => props.navigation.popToTop()} />
    </View>
  );
}

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

const mapStateToProps = (state) => ({
  userShows: state.userState.showList,
});
export default connect(mapStateToProps, null)(SaveShow);
