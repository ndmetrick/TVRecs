import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import PickCountry from './PickCountry';
import { logout, changeCountry } from '../../redux/actions';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as AuthSession from 'expo-auth-session';

import ViewShows from './ViewShows';

function Settings(props) {
  const [countryCode, setCountryCode] = useState(null);
  const [country, setCountry] = useState(null);
  const [changeCountry, setChangeCountry] = useState(false);
  const [saveCountry, setSaveCountry] = useState(false);
  const { currentUser, currentUserShows } = props;
  const isFocused = useIsFocused();

  useEffect(() => {
    if (props.currentUser) {
      setCountryCode(props.currentUser.country);
    }
    return () => {
      setCountry(null);
      setChangeCountry(false);
      setSaveCountry(false);
    };
  }, [props.currentUser, isFocused]);

  if (props.currentUser === null) {
    return <View />;
  }

  const logout = async () => {
    try {
      await AuthSession.dismiss();
      await props.logout();
      return props.navigation.navigate('AddShow');
    } catch (e) {
      console.log(e);
    }
  };

  const getCountry = (country) => {
    setCountry(country.name);
    setCountryCode(country.cca2);
    setChangeCountry(false);
    setSaveCountry(true);
  };

  const saveNewCountry = async () => {
    await props.changeCountry(countryCode);
    setSaveCountry(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.text}>
          settings coming soon (how to filter your recs, what country you're
          watching in (currently everything is set to US), user tags, etc).
          {'\n'}
        </Text>
        {!changeCountry && !saveCountry ? (
          <Text style={styles.text}>
            Your country is currently set to {countryCode}. That means that when
            you search for a show, or add a show to your watch list or
            recommendation list, the purchase and streaming options provided
            will be for that country. You can change your country setting at any
            time by clicking the "Choose new country" button below.
          </Text>
        ) : null}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setChangeCountry(true)}
          >
            <Text style={styles.buttonText}>Choose new country</Text>
          </TouchableOpacity>
        </View>
        {changeCountry ? (
          <View style={styles.buttonContainer}>
            <PickCountry onValueChange={getCountry} />
          </View>
        ) : null}
        {saveCountry ? (
          <View>
            <Text style={styles.text}>
              Would you like to change your country to {countryCode}? If yes,
              click on "Save country to profile" below.
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={saveNewCountry}>
                <Text style={styles.buttonText}>Save country to profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
  },
  containerInfo: {
    margin: 5,
    padding: 5,
  },
  text: {
    textAlign: 'left',
    fontSize: 18,
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

const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  otherUser: store.otherUser.userInfo,
  currentUserShows: store.currentUser.userShows,
  otherUserShows: store.otherUser.userShows,
  following: store.currentUser.following,
  otherUsers: store.allOtherUsers.usersInfo,
});
const mapDispatch = (dispatch) => {
  return {
    logout: () => dispatch(logout()),
    changeCountry: (countryCode) => dispatch(changeCountry(countryCode)),
  };
};
export default connect(mapStateToProps, mapDispatch)(Settings);
