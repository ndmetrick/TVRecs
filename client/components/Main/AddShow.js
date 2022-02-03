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
import DropDownPicker from 'react-native-dropdown-picker'
import StreamingAndPurchase from './StreamingAndPurchase'
import { getAPIKey } from '../../redux/actions'
import { useIsFocused } from '@react-navigation/native'
import SelectShow from './SelectShow'

const profileShowOptions = [
  { label: 'Recommend it', value: 'rec' },
  {
    label: 'Save it to my Watch list to remind me to watch it later',
    value: 'watch',
  },
  { label: 'Filter it out of recs I see in my main feed', value: 'seen' },
  { label: 'Nothing', value: 'none' },
]
const AddShow = (props) => {
  const [showName, setShowName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imdbId, setImdbId] = useState('')
  const [type, setType] = useState(null)
  // const [streaming, setStreaming] = useState('')
  // const [purchase, setPurchase] = useState('')
  const [streamingAndPurchase, setStreamingAndPurchase] = useState(false)
  const [showAdded, setShowAdded] = useState(false)

  const [profileShowDropdownOpen, setProfileShowDropdownOpen] = useState(false)
  const [profileShowDropdownValue, setProfileShowDropdownValue] = useState(null)
  const [profileShowDropdownOptions, setProfileShowDropdownOptions] =
    useState(null)
  const [userHasShow, setUserHasShow] = useState(null)

  const isFocused = useIsFocused()

  useEffect(() => {
    if (props.currentUser) {
      setProfileShowDropdownOptions(profileShowOptions)
    }

    return () => {
      setShowName('')
      setImageUrl('')
      setShowAdded(false)
      setImdbId('')
      // setStreaming('')
      // setPurchase('')
      setStreamingAndPurchase(false)
      setProfileShowDropdownValue(null)
      setUserHasShow(null)
    }
  }, [isFocused])

  const addShow = (
    showName,
    imageUrl,
    imdbId,
    showAdded
    // streaming,
    // purchase
  ) => {
    console.log('image here', imageUrl, showName)
    setShowName(showName)
    setImageUrl(imageUrl)
    setImdbId(imdbId)
    // setStreaming(streaming)
    // setPurchase(purchase)
    setShowAdded(showAdded)
    const hasShow = props.watchShows.find(
      (watchShow) => imdbId == watchShow.show.imdbId
    )
      ? 'Watch'
      : props.userShows.find((userShow) => imdbId == userShow.show.imdbId)
      ? 'Recs'
      : props.seenShows.find((seenShow) => imdbId == seenShow.show.imdbId)
      ? 'Filter Out'
      : null
    setUserHasShow(hasShow)
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
                style={{
                  height: 300,
                  resizeMode: 'contain',
                  margin: 5,
                  marginBottom: 10,
                }}
              />

              {profileShowDropdownValue !== null &&
              profileShowDropdownValue !==
                'none' ? null : !streamingAndPurchase ? (
                <View style={{ ...styles.buttonContainer, marginBottom: 10 }}>
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
                {userHasShow ? (
                  <View>
                    <Text
                      style={{
                        ...styles.text,
                        textAlign: 'left',
                        marginLeft: 10,
                      }}
                    >
                      This show is already on your {userHasShow} list. If you'd
                      like to change that, navigate to the show on your profile
                      to see all the options.
                    </Text>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => props.navigation.navigate('CurrentUser')}
                      >
                        <Text style={styles.buttonText}>
                          Take me to my profile
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : props.currentUser ? (
                  <View
                    style={{
                      marginLeft: 15,
                      marginRight: 15,
                    }}
                  >
                    <DropDownPicker
                      style={{ borderRadius: 25 }}
                      open={profileShowDropdownOpen}
                      value={profileShowDropdownValue}
                      items={profileShowDropdownOptions}
                      setOpen={setProfileShowDropdownOpen}
                      setValue={setProfileShowDropdownValue}
                      setItems={setProfileShowDropdownOptions}
                      listMode="SCROLLVIEW"
                      dropDownDirection="TOP"
                      itemKey="label"
                      placeholder="What do you want to do with this show?"
                    />

                    {profileShowDropdownValue === 'none' ||
                    profileShowDropdownValue === null ? null : (
                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          style={styles.saveButton}
                          onPress={() =>
                            props.navigation.navigate('Save show', {
                              showData: {
                                showName,
                                imageUrl,
                                imdbId,
                                streaming,
                                purchase,
                                type: profileShowDropdownValue,
                              },
                              previous: 'AddShow',
                            })
                          }
                        >
                          <Text style={styles.buttonText}>
                            {profileShowDropdownValue === 'rec'
                              ? 'Recommend '
                              : profileShowDropdownValue === 'watch'
                              ? 'Save '
                              : 'Filter Out '}
                            <Text style={styles.showName}>{showName} </Text>{' '}
                            {profileShowDropdownValue === 'watch'
                              ? 'to my Watch List'
                              : null}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (
                  <View>
                    <Text style={styles.text}>
                      Log in or Sign up to recommend this show or add it to your
                      Watch list
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
                )}
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
    backgroundColor: '#4056F4',
    padding: 8,
    borderRadius: 40,
    marginHorizontal: 3,
    marginTop: 5,
    marginBottom: 20,
  },
  showName: {
    color: '#9BC1BC',
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
