import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native'
import { useIsFocused } from '@react-navigation/native'

import {
  logout,
  changeCountry,
  changeUsername,
  deleteAccount,
} from '../../redux/actions'
import { createStackNavigator } from '@react-navigation/stack'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import * as AuthSession from 'expo-auth-session'
import UserTagsAndDescription from './UserTagsAndDescription'
import UpdateAccount from './UpdateAccount'
import ChangeCountry from './ChangeCountry'
import {
  MaterialIcons,
  MaterialCommunityIcons,
} from 'react-native-vector-icons'

function Settings(props) {
  const [countryCode, setCountryCode] = useState(null)
  const [saveCountry, setSaveCountry] = useState(false)
  const { currentUser, currentUserShows } = props

  const [countryOpen, setCountryOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [usernameOpen, setUsernameOpen] = useState(false)
  const [deleteUserOpen, setDeleteUserOpen] = useState(false)

  const isFocused = useIsFocused()

  useEffect(() => {
    if (props.currentUser) {
      setCountryCode(props.currentUser.country)
    }
    return () => {
      setTagsOpen(false)
      setUsernameOpen(false)
      setDeleteUserOpen(false)
      setCountryOpen(false)
    }
  }, [props.currentUser, isFocused])

  if (props.currentUser === null) {
    return <View />
  }

  const logout = async () => {
    try {
      await AuthSession.dismiss()
      await props.logout()
      return props.navigation.navigate('AddShow')
    } catch (e) {
      console.log(e)
    }
  }

  const saveNewCountry = async () => {
    await props.changeCountry(countryCode)
    setSaveCountry(false)
  }

  const displayTags = (tags) => {
    return tags.map((tag, key) => {
      return (
        <View key={key} style={styles.userTags}>
          <Text style={styles.tagText}>{tag.name}</Text>
        </View>
      )
    })
  }

  return (
    <View style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={{ ...styles.buttonText, textAlign: 'center' }}>
          Settings
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => props.navigation.navigate('FAQ')}
          >
            <Text style={styles.buttonText}>User guide</Text>
          </TouchableOpacity>
        </View>
        {!countryOpen ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCountryOpen(true)}
            >
              <Text style={styles.buttonText}>
                Change country{' '}
                <MaterialCommunityIcons name="chevron-down" size={18} />
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCountryOpen(false)}
            >
              <Text style={styles.buttonText}>
                Change country{' '}
                <MaterialCommunityIcons name="chevron-up" size={18} />
              </Text>
            </TouchableOpacity>
            <ChangeCountry
              setCountryCode={setCountryCode}
              saveCountry={saveCountry}
              setSaveCountry={setSaveCountry}
              countryCode={countryCode}
              saveNewCountry={saveNewCountry}
            />
          </View>
        )}
        {!tagsOpen ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setTagsOpen(true)}
            >
              <Text style={styles.buttonText}>
                User tags and TV bio{' '}
                <MaterialCommunityIcons name="chevron-down" size={18} />
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setTagsOpen(false)}
            >
              <Text style={styles.buttonText}>
                User tags and TV bio{' '}
                <MaterialCommunityIcons name="chevron-up" size={18} />
              </Text>
            </TouchableOpacity>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.text}>
                Just as you can add tags and descriptions to a TV show, you can
                add them to your own profile. Other users looking at your
                profile will see these tags and description along with all the
                shows you're recommending. These will give others a view into
                what kinds of shows you like and why, and will help them decide
                if your recommendations might be a good match for them. People
                you don't know will also be able to search for you based on
                these tags (for instance if they want to receive recommendations
                from others who also like TV shows with the 'town comes
                together' theme or they also like really silly shows.
              </Text>
              <UserTagsAndDescription
                style={{ marginTop: 10 }}
                previous="Settings"
              />

              <View style={{ ...styles.buttonContainer, alignItems: 'center' }}>
                <TouchableOpacity
                  style={styles.centerButton}
                  onPress={() => props.navigation.navigate('User Tags')}
                >
                  <Text style={{ ...styles.buttonText, color: 'white' }}>
                    Add/change user tags and tv bio
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        {!usernameOpen ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setUsernameOpen(true)}
            >
              <Text style={styles.buttonText}>
                Change username{' '}
                <MaterialCommunityIcons name="chevron-down" size={18} />
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setUsernameOpen(false)}
            >
              <Text style={styles.buttonText}>
                Change username{' '}
                <MaterialCommunityIcons name="chevron-up" size={18} />
              </Text>
            </TouchableOpacity>
            <UpdateAccount updateAccount="username" />
          </View>
        )}
        {!deleteUserOpen ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setDeleteUserOpen(true)}
            >
              <Text style={styles.buttonText}>
                Delete Account{' '}
                <MaterialCommunityIcons name="chevron-down" size={18} />
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setDeleteUserOpen(false)}
            >
              <Text style={styles.buttonText}>
                Delete Account{' '}
                <MaterialCommunityIcons name="chevron-up" size={18} />
              </Text>
            </TouchableOpacity>
            <UpdateAccount updateAccount="delete" />
          </View>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={logout}>
            <Text style={styles.buttonText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            ...styles.buttonContainer,
            marginTop: 20,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                'https://www.termsfeed.com/live/3d7fd044-566e-4e51-9fd7-aa561f45932a'
              )
            }
          >
            <Text style={{ ...styles.text, margin: 5, color: 'blue' }}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    marginRight: 10,
    marginLeft: 10,
    flexDirection: 'column',
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
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    margin: 5,
  },
  centerButton: {
    padding: 5,
    borderRadius: 10,
    marginHorizontal: 3,
    backgroundColor: '#340068',
    marginTop: 2,
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
    backgroundColor: '#008DD5',
    marginTop: 5,
  },
  tagText: {
    fontSize: 13.5,
    fontWeight: '500',
  },
})

const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  userTags: store.currentUser.userTags,
})
const mapDispatch = (dispatch) => {
  return {
    logout: () => dispatch(logout()),
    changeCountry: (countryCode) => dispatch(changeCountry(countryCode)),
  }
}
export default connect(mapStateToProps, mapDispatch)(Settings)
