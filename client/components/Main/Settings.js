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
import UserTagsAndDescription from './UserTagsAndDescription';
import FAQ from './FAQ';

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

  const displayTags = (tags) => {
    return tags.map((tag, key) => {
      return (
        <View key={key} style={styles.userTags}>
          <Text style={styles.tagText}>{tag.name}</Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.text}>
          settings coming soon (how to filter your recs, what country you're
          watching in (currently everything is set to US), user tags, etc).
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => props.navigation.navigate('FAQ')}
          >
            <Text style={styles.buttonText}>Click to see app instructions</Text>
          </TouchableOpacity>
        </View>
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

        <View>
          <Text style={styles.text}>
            Just as you can add tags and descriptions to a TV show, you can add
            them to your own profile. Other users looking at your profile will
            see these tags and description along with all the shows you're
            recommending. These will give others a view into what kinds of shows
            you like and why, and will help them decide if your recommendations
            might be a good match for them. People you don't know will also be
            able to search for you based on these tags (for instance if they
            want to receive recommendations from others who also like TV shows
            with the 'town comes together' theme or they also like really silly
            shows.
          </Text>
          <UserTagsAndDescription previous="Settings" />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => props.navigation.navigate('User Tags')}
            >
              <Text style={styles.buttonText}>
                Add/change user tags and description
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    marginRight: 10,
    marginLeft: 10,
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
    margin: 10,
  },
  button: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#586BA4',
    marginTop: 5,
  },
  cardContent: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  tagsContent: {
    marginTop: 10,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  userTags: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#36C9C6',
    marginTop: 5,
  },
  tagText: {
    fontSize: 13.5,
    fontWeight: '500',
  },
});

const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  otherUser: store.otherUser.userInfo,
  currentUserShows: store.currentUser.userShows,
  otherUserShows: store.otherUser.userShows,
  following: store.currentUser.following,
  otherUsers: store.allOtherUsers.usersInfo,
  userTags: store.currentUser.userTags,
});
const mapDispatch = (dispatch) => {
  return {
    logout: () => dispatch(logout()),
    changeCountry: (countryCode) => dispatch(changeCountry(countryCode)),
  };
};
export default connect(mapStateToProps, mapDispatch)(Settings);
