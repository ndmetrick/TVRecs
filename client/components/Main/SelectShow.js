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
import { getAPIKey } from '../../redux/actions'
import { useIsFocused } from '@react-navigation/native'

const SelectShow = (props) => {
  const [showInput, setShowInput] = useState('')
  const [showOptions, setShowOptions] = useState(null)
  const [added, setAdded] = useState(false)
  const [showPosterPreview, setShowPosterPreview] = useState(false)
  const [OMDBKey, setOMDBKey] = useState(null)
  const [TMDBKey, setTMDBKey] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const isFocused = useIsFocused

  useEffect(() => {
    const getAPIKeys = async () => {
      try {
        const oKey = await props.getAPIKey('omdb')
        const tKey = await props.getAPIKey('tmdb')
        setOMDBKey(oKey)
        setTMDBKey(tKey)
      } catch (e) {
        console.log(e)
      }
    }
    if (!TMDBKey) {
      getAPIKeys()
    }

    if (props.showAdded === false) {
      setShowInput('')
      setShowOptions(null)
      setAdded(false)
      setShowPosterPreview(false)
      setNotFound(false)
    }
  }, [props.showAdded])

  const findShowOptions = async () => {
    try {
      if (!showInput.length) {
        Alert.alert('No show entered', 'Please enter some text to search', {
          text: 'OK',
        })
      } else {
        const titleString = showInput.split(' ').join('+')
        const getShowOptions = `https://api.themoviedb.org/4/search/tv?api_key=${TMDBKey}&query=${titleString}`

        const { data } = await axios.get(getShowOptions)
        if (!data.results.length) {
          setNotFound(true)
          return
        }
        if (data.results.length > 1) {
          const showList = data.results.map((show, index) => {
            return {
              index: index,
              year: show.first_air_date,
              name: show.name,
              id: show.id,
              poster: show.poster_path,
              overview: show.overview,
            }
          })
          setShowOptions(showList)
        } else {
          const show = data.results[0]
          if (show.poster_path) {
            const image =
              'https://image.tmdb.org/t/p/original' + show.poster_path
            props.handleShow(show.name, image, show.id, true)
            setAdded(true)
          } else {
            const imageShowText = `http://www.omdbapi.com/?t=${titleString}&apikey=${OMDBKey}`
            const imageShow = await axios.get(imageShowText)
            let poster = imageShow.data.Poster
            if (!poster || poster === 'N/A') {
              console.log('i got into this one')
              poster = 'https://i.postimg.cc/Y2TP5SLv/missing-Poster-Icon.png'
            }
            props.handleShow(show.name, poster, show.id, true)
            setAdded(true)
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const viewPoster = () => {
    setShowPosterPreview(!showPosterPreview)
  }

  const chooseNewShow = () => {
    setAdded(false)
    setShowInput('')
    setShowOptions('')
    props.handleShow('', '', '', false)
  }

  const getShowData = async (id) => {
    try {
      const getShow = `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDBKey}&language=en-US&append_to_response=watch%2Fproviders`
      const { data } = await axios.get(getShow)
      setShowInput(data.name)
      setShowOptions(null)
      if (data.poster_path) {
        console.log('actually made it up here')
        const image = 'https://image.tmdb.org/t/p/original' + data.poster_path
        props.handleShow(data.name, image, id, true)
        setAdded(true)
      } else {
        console.log('nope, here i am')
        const imageShowText = `http://www.omdbapi.com/?t=${data.name}&apikey=${OMDBKey}`
        const imageShow = await axios.get(imageShowText)
        // console.log('this is the image', imageShow)
        let poster = imageShow.data.Poster
        if (!poster || poster === 'N/A') {
          console.log('i got in here')
          poster = 'https://i.postimg.cc/Y2TP5SLv/missing-Poster-Icon.png'
          props.handleShow(data.name, poster, id, true)
          setAdded(true)
        } else {
          props.handleShow(data.name, poster, id, true)
          setAdded(true)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!added ? (
          <View style={{ flex: 1 }}>
            <Text style={styles.boldText}>Search shows</Text>

            {showOptions ? (
              <View style={{ flex: 1 }}>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={chooseNewShow}
                  >
                    <Text style={styles.buttonText}>
                      Search for a different show
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* The show posters take up a lot of space, so the default is not to show them, but users can decide to turn them on or back off */}
                {!showPosterPreview ? (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.addPosterButton}
                      onPress={() => viewPoster()}
                    >
                      <Text style={styles.buttonText}>
                        Click to see show posters
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.removePosterButton}
                      onPress={() => viewPoster()}
                    >
                      <Text style={styles.buttonText}>
                        Click to hide posters
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginLeft: 10,
                    marginRight: 10,
                  }}
                >
                  Is one of these the show you're looking for? (Click inside the
                  box to choose the show)
                </Text>
                <View style={styles.optionContainer}>
                  {showOptions.map((item, index) => {
                    return (
                      <View style={styles.box} key={index}>
                        <TouchableOpacity onPress={() => getShowData(item.id)}>
                          <View>
                            <Text style={styles.optionsText}>
                              <Text style={{ fontWeight: 'bold' }}>
                                Show title:
                              </Text>{' '}
                              {item.name}
                            </Text>
                            {item.year ? (
                              <Text style={styles.optionsText}>
                                <Text style={{ fontWeight: 'bold' }}>
                                  First began airing in:
                                </Text>{' '}
                                {item.year.slice(0, 4)}
                              </Text>
                            ) : (
                              <Text style={styles.optionsText}>
                                <Text style={{ fontWeight: 'bold' }}>
                                  No air date available
                                </Text>
                              </Text>
                            )}
                            {item.overview ? (
                              <Text style={styles.optionsText}>
                                <Text style={{ fontWeight: 'bold' }}>
                                  Overview:
                                </Text>{' '}
                                {item.overview}
                              </Text>
                            ) : (
                              <Text style={styles.optionsText}>
                                <Text style={{ fontWeight: 'bold' }}>
                                  No overview available
                                </Text>
                              </Text>
                            )}
                          </View>
                          {/* If the user chose to view poster previews, they'll go here if they were found */}
                          {showPosterPreview ? (
                            <View>
                              {item.poster ? (
                                <View>
                                  <Image
                                    source={{
                                      uri:
                                        'https://image.tmdb.org/t/p/original' +
                                        item.poster,
                                    }}
                                    style={styles.image}
                                  />
                                </View>
                              ) : (
                                <View>
                                  <Text style={{ fontWeight: 'bold' }}>
                                    No preview poster available for this show
                                  </Text>
                                </View>
                              )}
                            </View>
                          ) : null}
                        </TouchableOpacity>
                      </View>
                    )
                  })}
                </View>
              </View>
            ) : (
              <View>
                <TextInput
                  style={styles.inputText}
                  label="Enter show title"
                  onChangeText={(showInput) => setShowInput(showInput)}
                  mode="outlined"
                  outlineColor="#340068"
                  activeOutlineColor="#340068"
                  value={showInput}
                  onFocus={() => setNotFound(false)}
                />
                <View
                  style={
                    props.previous === 'Search'
                      ? { flex: 1, alignItems: 'flex-end' }
                      : styles.buttonContainer
                  }
                >
                  <TouchableOpacity
                    style={
                      props.previous === 'Search'
                        ? styles.searchPageButton
                        : styles.button
                    }
                    onPress={findShowOptions}
                  >
                    {props.previous === 'Search' ? (
                      <Text style={styles.buttonText}>Filter by show</Text>
                    ) : (
                      <Text style={styles.buttonText}>Find show</Text>
                    )}
                  </TouchableOpacity>
                </View>
                {!notFound ? null : (
                  <View>
                    <Text style={{ ...styles.text, textAlign: 'left' }}>
                      I'm so sorry. We can't find that TV show in the database.
                      Check to see if there's a spelling error and try again.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          <View>
            <View
              style={
                props.previous === 'Search'
                  ? { flex: 1, alignItems: 'flex-end' }
                  : styles.buttonContainer
              }
            >
              <TouchableOpacity
                style={
                  props.previous === 'Search'
                    ? styles.searchPageButton
                    : styles.button
                }
                onPress={chooseNewShow}
              >
                <Text style={styles.buttonText}>
                  Search for a different show
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View></View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    flex: 1,
    marginHorizontal: 2,
    marginBottom: 10,
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
  searchPageButton: {
    padding: 5,
    borderRadius: 15,
    marginHorizontal: 3,
    backgroundColor: '#340068',
    marginRight: 10,
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

export default connect(mapStateToProps, mapDispatchToProps)(SelectShow)
