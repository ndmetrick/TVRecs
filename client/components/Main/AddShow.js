import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import StreamingAndPurchase from './StreamingAndPurchase';
import { getAPIKey } from '../../redux/actions';
import { useIsFocused } from '@react-navigation/native';

const AddShow = (props) => {
  const [showInput, setShowInput] = useState('');
  const [showName, setShowName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imdbId, setImdbId] = useState('');
  const [showOptions, setShowOptions] = useState(null);
  const [added, setAdded] = useState(false);
  const [type, setType] = useState(null);
  const [userShowId, setUserShowId] = useState(null);
  const [showPosterPreview, setShowPosterPreview] = useState(false);
  const [OMDBKey, setOMDBKey] = useState(null);
  const [TMDBKey, setTMDBKey] = useState(null);
  const [streamingAndPurchase, setStreamingAndPurchase] = useState(false);
  // const [watchShow, setWatchShow] = useState(null)

  const isFocused = useIsFocused();

  useEffect(() => {
    const getAPIKeys = async () => {
      try {
        const oKey = await props.getAPIKey('omdb');
        const tKey = await props.getAPIKey('tmdb');
        setOMDBKey(oKey);
        setTMDBKey(tKey);
      } catch (e) {
        console.log(e);
      }
    };
    getAPIKeys();
    // if the user got here by adding an existing show from their own watch or seen list or from someone else's rec list
    return () => {
      setShowInput('');
      setShowName('');
      setShowOptions(null);
      setImageUrl('');
      setAdded('');
      setType(null);
      setShowPosterPreview(false);
      setStreamingAndPurchase(false);
    };
  }, [props.navigation, isFocused]);

  const findShowOptions = async () => {
    try {
      if (!showInput.length) {
        Alert.alert('No show entered', 'Please enter some text to search', {
          text: 'OK',
        });
      } else {
        const titleString = showInput.split(' ').join('+');
        const getShowOptions = `https://api.themoviedb.org/4/search/tv?api_key=${TMDBKey}&query=${titleString}`;
        const { data } = await axios.get(getShowOptions);
        if (!data.results.length) {
          return (
            <View>
              <Text>
                I'm so sorry. We can't find that TV show in the database. Check
                to see if there's a spelling error and try again.
              </Text>
            </View>
          );
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
            };
          });
          setShowOptions(showList);
        } else {
          const show = data.results[0];
          setImdbId(show.id);
          setShowName(show.name);
          if (show.poster_path) {
            setImageUrl(
              'https://image.tmdb.org/t/p/original' + show.poster_path
            );
          } else {
            const imageShowText = `http://www.omdbapi.com/?t=${titleString}&apikey=${OMDBKey}`;
            const imageShow = await axios.get(imageShowText);
            const poster = imageShow.data.Poster;
            if (!poster) {
              console.log('I need a plan here');
            }
            setImageUrl(poster);
          }
          setAdded(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const viewPoster = () => {
    setShowPosterPreview(!showPosterPreview);
  };

  const chooseNewShow = () => {
    setAdded(false);
    setShowInput('');
    setShowName('');
    setImageUrl('');
    setImdbId('');
    setShowOptions('');
  };

  const getShowData = async (id) => {
    try {
      const getShow = `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDBKey}&language=en-US&append_to_response=watch%2Fproviders`;
      const { data } = await axios.get(getShow);
      setShowName(data.name);
      setShowInput(data.name);
      setShowOptions(null);
      setImdbId(id);
      if (data.poster_path) {
        setImageUrl('https://image.tmdb.org/t/p/original' + data.poster_path);
      } else {
        const imageShowText = `http://www.omdbapi.com/?t=${data.name}&apikey=${OMDBKey}`;
        const imageShow = await axios.get(imageShowText);
        const poster = imageShow.data.Poster;
        setImageUrl(poster);
      }
      setAdded(true);
    } catch (e) {
      console.error(e);
    }
  };

  const resetPage = () => {
    setShowInput('');
  };

  const image = { uri: imageUrl };
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!added ? (
          <View style={{ flex: 1 }}>
            <Text style={styles.boldText}>What show do you want to add?</Text>

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
                    );
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
                  outlineColor="#586BA4"
                  activeOutlineColor="#586BA4"
                  value={showInput}
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={findShowOptions}
                  >
                    <Text style={styles.buttonText}>Find show</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={chooseNewShow}>
                <Text style={styles.buttonText}>
                  Search for a different show
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View>
          {added ? (
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
                      Show streaming and purchase options
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
                        Hide streaming and purchase options
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
                  return imdbId == watchShow.show.imdbId;
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
  );
};

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
    backgroundColor: '#586BA4',
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
});
const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  userShows: store.currentUser.userShows,
  seenShows: store.currentUser.seen,
  watchShows: store.currentUser.toWatch,
});

const mapDispatchToProps = (dispatch) => {
  return {
    getAPIKey: (API) => dispatch(getAPIKey(API)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddShow);
