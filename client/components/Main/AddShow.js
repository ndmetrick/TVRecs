import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { TextInput } from 'react-native-paper'
import axios from 'axios'
import StreamingAndPurchase from './StreamingAndPurchase'
import { getAPIKey } from '../../redux/actions'
import { useIsFocused } from '@react-navigation/native'
import SelectShow from './SelectShow'

const AddShow = (props) => {
  const [showName, setShowName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imdbId, setImdbId] = useState('')
  const [type, setType] = useState(null)
  const [streamingAndPurchase, setStreamingAndPurchase] = useState(false)
  const [showAdded, setShowAdded] = useState(false)

  const isFocused = useIsFocused()

  useEffect(() => {
    return () => {
      setShowName('')
      setImageUrl('')
      setShowAdded(false)
      setImdbId('')
      setStreamingAndPurchase(false)
    }
  }, [isFocused])

  const addShow = (showName, imageUrl, imdbId, showAdded) => {
    setShowName(showName)
    setImageUrl(imageUrl)
    setImdbId(imdbId)
    setShowAdded(showAdded)
  }

  const image = { uri: imageUrl }
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SelectShow
          handleShow={addShow}
          showAdded={showAdded}
          previous="AddShow"
        />
        <View>
          {showAdded ? (
            <View>
              <Text style={styles.boldText}>{showName}</Text>
              <Image
                source={image}
                style={{ height: 300, resizeMode: 'contain', margin: 5 }}
              />

              {!streamingAndPurchase ? (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => setStreamingAndPurchase(true)}
                  >
                    <Text style={styles.buttonText}>
                      Show overview and options for streaming and purchase
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => setStreamingAndPurchase(false)}
                    >
                      <Text style={styles.buttonText}>
                        Hide overview and options for streaming and purchase
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <StreamingAndPurchase
                    showId={imdbId}
                    currentUser={props.currentUser}
                  />
                </View>
              )}

              <View style={{ flexDirection: 'column' }}>
                {props.currentUser === null ||
                props.watchShows.find(
                  (watchShow) => imdbId == watchShow.show.imdbId
                ) ||
                props.userShows.find(
                  (userShow) => imdbId == userShow.show.imdbId
                ) ||
                props.seenShows.find(
                  (seenShow) => imdbId == seenShow.show.imdbId
                ) ? null : (
                  <View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() =>
                          props.navigation.navigate('Save show', {
                            showData: {
                              showName,
                              imageUrl,
                              imdbId,
                              type: 'rec',
                            },
                            previous: 'AddShow',
                          })
                        }
                      >
                        <Text style={styles.buttonText}>Recommend show</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() =>
                          props.navigation.navigate('Save show', {
                            showData: {
                              showName,
                              imageUrl,
                              imdbId,
                              type: 'watch',
                            },
                            previous: 'AddShow',
                          })
                        }
                      >
                        <Text style={styles.buttonText}>
                          Save show to watch list
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() =>
                          props.navigation.navigate('Save show', {
                            showData: {
                              showName,
                              imageUrl,
                              imdbId,
                              type: 'seen',
                            },
                            previous: 'AddShow',
                          })
                        }
                      >
                        <Text style={styles.buttonText}>
                          Save show to seen list
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {props.watchShows.find((watchShow) => {
                  return imdbId == watchShow.show.imdbId
                }) ? (
                  <View>
                    <Text style={styles.text}>
                      This show is already on your watch list. If you'd like to
                      switch it to Recommended or Seen, go to your profile,
                      click on your Watch list, and open the show to make that
                      change.
                    </Text>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => props.navigation.navigate('Profile')}
                      >
                        <Text style={styles.buttonText}>
                          Take me to my profile
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
                {props.currentUser === null ? (
                  <View>
                    <Text style={styles.text}>
                      Log in or Sign up to recommend this show or add it to your
                      watch list
                    </Text>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => props.navigation.navigate('Login')}
                      >
                        <Text style={styles.buttonText}>Log in / Sign up</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    flex: 1,
    // justifyContent: 'center',
    marginHorizontal: 2,
    marginBottom: 30,
  },
  optionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginRight: 10,
    marginLeft: 10,
  },
  text: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
  },
  boldText: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputText: {
    margin: 10,
    textAlign: 'center',
    fontSize: 20,
  },
  optionsText: {
    marginRight: 10,
    marginLeft: 10,
    fontSize: 15,
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
    backgroundColor: '#340068',
    marginTop: 5,
  },
  addPosterButton: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    marginTop: 5,
    backgroundColor: '#324376',
  },
  box: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#324376',
    marginBottom: 2,
    marginTop: 2,
    padding: 2,
  },
  removePosterButton: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    marginTop: 5,
    backgroundColor: '#636A7D',
  },
  image: {
    flex: 1,
    aspectRatio: 2 / 3,
  },
  saveButton: {
    backgroundColor: '#0C7489',
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    marginTop: 5,
  },
})
const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  userShows: store.currentUser.userShows,
  seenShows: store.currentUser.seen,
  watchShows: store.currentUser.toWatch,
})

const mapDispatchToProps = (dispatch) => {
  return {
    getAPIKey: (API) => dispatch(getAPIKey(API)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddShow)
