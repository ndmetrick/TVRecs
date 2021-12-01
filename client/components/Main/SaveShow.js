import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  Image,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';
import { getCurrentUser, addShow, switchShow } from '../../redux/actions';

import { NavigationContainer } from '@react-navigation/native';

function SaveShow(props) {
  const {
    imageUrl,
    showName,
    streaming,
    purchase,
    description,
    imdbId,
    toWatch,
  } = props.route.params || '';

  const [goBack, setGoBack] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const saveShowData = async () => {
      const showData = {
        showName,
        description,
        streaming,
        purchase,
        imageUrl,
        imdbId,
      };
      if (typeof toWatch !== 'boolean') {
        console.log('i know i am switching and toWatch equals', typeof toWatch);
        setSwitching(true);
      } else {
        await props.addShow(showData, toWatch);
      }
    };
    if (!props.userShows.includes(showName)) {
      saveShowData();
    } else {
      setGoBack(true);
    }
    // RETURN CLEAR HERE?
  }, []);

  const switchShow = async (userShowId, description, showName) => {
    await props.switchShow(userShowId, description);
    Alert.alert(
      'Show added',
      `${showName} was added to your rec'd shows and removed from your watch list`,
      {
        text: 'OK',
      }
    );
    return props.navigation.navigate('Profile');
  };

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
          <Text style={styles.text}>Streaming options: {streaming}</Text>
          <View style={styles.separator} />
        </View>
      ) : null}
      {streaming ? (
        <View>
          <Text style={styles.text}>Purchase options: {purchase}</Text>
          <View style={styles.separator} />
        </View>
      ) : null}
      <Image
        source={image}
        style={{ height: 300, resizeMode: 'contain', margin: 5 }}
      />
      <Button
        title="Next: add descriptive tags"
        onPress={() => props.navigation.navigate('AddShowTags', { showName })}
      />
      {/* DEAL WITH THIS FOR SWITCHED OPTIONS */}
      <Button
        title="Skip tags"
        onPress={
          switching === true
            ? () => switchShow(toWatch, description, showName)
            : () => props.navigation.navigate('Profile')
        }
      />
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
  userShows: state.currentUser.showList,
  currentUser: state.currentUser.userInfo,
});

const mapDispatch = (dispatch) => {
  return {
    addShow: (showInfo, toWatch) => dispatch(addShow(showInfo, toWatch)),
    switchShow: (userShowId, description) =>
      dispatch(switchShow(userShowId, description)),
  };
};
export default connect(mapStateToProps, mapDispatch)(SaveShow);
