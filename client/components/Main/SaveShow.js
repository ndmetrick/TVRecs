import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import { addShow, switchShow } from '../../redux/actions';

import { NavigationContainer } from '@react-navigation/native';

function SaveShow(props) {
  const { imageUrl, showName, description, imdbId, type, userShowId } =
    props.route.params || '';

  const [goBack, setGoBack] = useState(false);
  const [userShow, setUserShow] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saveShowData = async () => {
      const showData = {
        showName,
        description,
        imageUrl,
        imdbId,
      };
      if (userShowId) {
        console.log('i know i am switching and userShowId equals', userShowId);
        // setSwitching(true);
        const show = await props.switchShow(userShowId, description, type);
        setUserShow(show);
        setLoading(false);
      } else {
        const show = await props.addShow(showData, type);
        setUserShow(show);
        setLoading(false);
      }
    };
    saveShowData();
    // } else {
    //   setGoBack(true);
    // }
    return () => {
      setUserShow({});
      setLoading(true);
      setGoBack(false);
    };
  }, []);

  const switchShow = async () => {
    await props.switchShow(userShowId, description, type);

    // Alert.alert(
    //   'Show added',
    //   `${showName} was added to your rec'd shows and removed from your watch list`,
    //   {
    //     text: 'OK',
    //   }
    // );
    return props.navigation.navigate('Profile');
  };

  const image = { uri: imageUrl };

  if (goBack) {
    return (
      <View>
        <Text style={styles.text}>
          You've already added {showName} to your profile. If you'd like to edit
          your tags or description or switch the list it's on, go to your own
          page for {showName}.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => props.navigation.popToTop()}
          >
            <Text style={styles.buttonText}>Oops, go back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => props.navigation.navigate('Profile')}
          >
            <Text style={styles.buttonText}>Go to my profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    );
  }
  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.text}>{showName}</Text>

        {description ? (
          <View>
            <Text style={styles.text}>Description: {description}</Text>
          </View>
        ) : null}
        <Image
          source={image}
          style={{ height: 300, resizeMode: 'contain', margin: 5 }}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              props.navigation.navigate('Add/Change Tags', {
                userShow,
                previous: 'Show added',
              })
            }
          >
            <Text style={styles.buttonText}>Next: add descriptive tags</Text>
          </TouchableOpacity>
        </View>
        {/* DEAL WITH THIS FOR SWITCHED OPTIONS */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => props.navigation.navigate('Profile')}
          >
            <Text style={styles.buttonText}>Skip tags</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
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
  },
});

const mapStateToProps = (state) => ({
  recShows: state.currentUser.recShows,
  watchShows: state.currentUser.toWatch,
  seenShows: state.currentUser.seen,
  currentUser: state.currentUser.userInfo,
  currentUserShows: state.currentUser.userShows,
});

const mapDispatch = (dispatch) => {
  return {
    addShow: (showInfo, type) => dispatch(addShow(showInfo, type)),
    switchShow: (userShowId, description, newType) =>
      dispatch(switchShow(userShowId, description, newType)),
  };
};
export default connect(mapStateToProps, mapDispatch)(SaveShow);
