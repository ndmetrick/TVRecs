import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import AddShowTags from './AddShowTags';
import SaveShow from './SaveShow';
import { useIsFocused } from '@react-navigation/native';

export default function AddShow(props) {
  const [showInput, setShowInput] = useState('');
  const [showName, setShowName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imdbId, setImdbId] = useState('');
  const [streaming, setStreaming] = useState('');
  const [purchase, setPurchase] = useState('');
  const [showOptions, setShowOptions] = useState(null);
  const [added, setAdded] = useState(false);
  const [toWatch, setToWatch] = useState(null);
  const [fromSingleShow, setFromSingleShow] = useState(false);
  const [userShowId, setUserShowId] = useState(null);
  const [showPosterPreview, setShowPosterPreview] = useState(false);
  const key = 'e7eaca48bd580f966d3d14526c3ddff0';
  const isFocused = useIsFocused();

  // https://api.themoviedb.org/4/search/tv?api_key=e7eaca48bd580f966d3d14526c3ddff0&query=we+are+lady+parts
  // 100351;
  // https://api.themoviedb.org/3/tv/70493?api_key=e7eaca48bd580f966d3d14526c3ddff0&language=en-US&append_to_response=watch%2Fproviders,images

  useEffect(() => {
    // if the user got here by adding an existing show from their own watch list or from someone else's rec list
    if (props.previous.length > 1) {
      if (props.previous[1].name === 'SingleShow') {
        const { userShow, toWatch, userShowId } =
          props.previous[0].state.routes[1].params;
        setShowName(userShow.show.name);
        setImageUrl(userShow.show.imageUrl);
        setImdbId(userShow.show.imdbId);
        setStreaming(userShow.show.streaming);
        setPurchase(userShow.show.purchase);
        setToWatch(toWatch);
        setAdded(true);
        setFromSingleShow(true);
        if (userShowId) {
          setUserShowId(userShowId);
        }
      }
    }
    return () => {
      setShowInput('');
      setShowName('');
      setDescription('');
      setShowOptions(null);
      setImageUrl('');
      setStreaming('');
      setPurchase('');
      setAdded('');
      setToWatch(null);
      setFromSingleShow(false);
      setShowPosterPreview(false);
    };
  }, [props.navigation, isFocused]);

  const findShowOptions = async () => {
    try {
      const titleString = showInput.split(' ').join('+');
      const getShowOptions = `https://api.themoviedb.org/4/search/tv?api_key=${key}&query=${titleString}`;
      const { data } = await axios.get(getShowOptions);
      if (!data.results.length) {
        return (
          <View>
            <Text>
              I'm so sorry. We can't find that TV show in the database. Check to
              see if there's a spelling error and try again.
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
        const getShow = `https://api.themoviedb.org/3/tv/${show.id}?api_key=${key}&language=en-US&append_to_response=watch%2Fproviders`;
        const watchProviders = await axios.get(getShow);
        if (watchProviders) {
          setStreamingAndPurchase(watchProviders.data);
        }
        if (show.poster_path) {
          setImageUrl('https://image.tmdb.org/t/p/original' + show.poster_path);
        } else {
          const imageShowText = `http://www.omdbapi.com/?t=${titleString}&apikey=aa03da30`;
          const imageShow = await axios.get(imageShowText);
          const poster = imageShow.data.Poster;
          if (!poster) {
            console.log('I need a plan here');
          }
          setImageUrl(poster);
        }

        setAdded(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const setStreamingAndPurchase = (data) => {
    // FIGURE THIS OUTqq      `
    const stream = data['watch/providers'].results.US.flatrate;
    const buy = data['watch/providers'].results.US.buy;
    if (stream) {
      const streamingOptions =
        stream && stream.map((option) => option.provider_name).join(', ');
      if (streamingOptions) {
        setStreaming(streamingOptions);
      }
    }
    if (purchase) {
      const purchaseOptions =
        buy && buy.map((option) => option.provider_name).join(', ');
      if (purchaseOptions) {
        setPurchase(purchaseOptions);
      }
    }
  };

  const viewPoster = () => {
    setShowPosterPreview(!showPosterPreview);
  };

  const chooseNewShow = () => {
    setAdded(false);
    setShowInput('');
    setShowName('');
    setDescription('');
    setImageUrl('');
    setImdbId('');
    setStreaming('');
    setPurchase('');
    setShowOptions('');
  };

  const getShowData = async (id) => {
    try {
      const getShow = `https://api.themoviedb.org/3/tv/${id}?api_key=${key}&language=en-US&append_to_response=watch%2Fproviders`;
      const { data } = await axios.get(getShow);
      setShowName(data.name);
      setShowInput(data.name);
      setStreamingAndPurchase(data);
      setShowOptions(null);
      setImdbId(id);
      if (data.poster_path) {
        setImageUrl('https://image.tmdb.org/t/p/original' + data.poster_path);
      } else {
        const imageShowText = `http://www.omdbapi.com/?t=${data.name}&apikey=aa03da30`;
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
      {!added ? (
        <View style={{ flex: 1 }}>
          <View>
            <Text style={styles.text}>What show do you want to add?</Text>
            <TextInput
              style={styles.inputText}
              placeholder="Show Title"
              onChangeText={(showInput) => setShowInput(showInput)}
              value={showInput}
            />
          </View>
          {showOptions ? (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18 }}>
                Is one of these the show you're looking for? Click anywhere in
                the show area to select it or click "Search for a different
                show" to try your search again.
              </Text>
              <View style={styles.button}>
                <Button
                  color="white"
                  onPress={chooseNewShow}
                  title="Search for a different show"
                ></Button>
              </View>
              {/* The show posters take up a lot of space, so the default is not to show them, but users can decide to turn them on or back off */}
              {!showPosterPreview ? (
                <View style={styles.button}>
                  <Button
                    color="white"
                    onPress={() => viewPoster()}
                    title="Click to see show posters"
                    backgroundColor="seagreen"
                  ></Button>
                </View>
              ) : (
                <View style={styles.button}>
                  <Button
                    color="white"
                    onPress={() => viewPoster()}
                    title="Click to hide posters"
                    backgroundColor="seagreen"
                  ></Button>
                </View>
              )}
              <FlatList
                horizontal={false}
                data={showOptions}
                renderItem={({ item }) => (
                  <View style={styles.containerImage}>
                    <View style={styles.separator} />
                    <Text style={{ fontWeight: 'bold' }}></Text>
                    <TouchableOpacity
                      onPress={() => getShowData(item.id)}
                      style={styles.catalogContainer}
                    >
                      <View>
                        <Text>
                          <Text style={{ fontWeight: 'bold' }}>
                            Show title:
                          </Text>{' '}
                          {item.name}
                        </Text>
                        {item.year ? (
                          <View>
                            <Text>
                              <Text style={{ fontWeight: 'bold' }}>
                                First began airing in:
                              </Text>{' '}
                              {item.year.slice(0, 4)}
                            </Text>
                          </View>
                        ) : (
                          <View>
                            <Text style={{ fontWeight: 'bold' }}>
                              No air date available
                            </Text>
                          </View>
                        )}
                        {item.overview ? (
                          <View>
                            <Text>
                              <Text style={{ fontWeight: 'bold' }}>
                                Overview:
                              </Text>{' '}
                              {item.overview}
                            </Text>
                          </View>
                        ) : (
                          <View>
                            <Text style={{ fontWeight: 'bold' }}>
                              No overview available
                            </Text>
                          </View>
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
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          ) : (
            <View style={styles.button}>
              <Button
                color="white"
                onPress={findShowOptions}
                title="Find show"
                backgroundColor="seagreen"
              ></Button>
            </View>
          )}
        </View>
      ) : (
        <View>
          {!fromSingleShow ? (
            <View style={styles.button}>
              <Button
                color="white"
                onPress={chooseNewShow}
                title="Search for a different show"
              ></Button>
            </View>
          ) : null}
        </View>
      )}
      <View>
        {added ? (
          <ScrollView>
            <View>
              <TextInput
                placeholder="Write your own description of the show. . ."
                style={styles.inputText}
                onChangeText={(description) => setDescription(description)}
              />

              <Text style={styles.text}>{showName}</Text>
              <View style={styles.separator} />
              <Image
                source={image}
                style={{ height: 300, resizeMode: 'contain', margin: 5 }}
              />
              <View style={{ flexDirection: 'row' }}>
                {/* if we're getting here by searching for the show, toWatch will be null. If we got here because we were looking at an instance of a userShow (our own or someone else's) it will be set to true (we're adding it to toWatch), or false (we're adding it to recs); depending on how it's set, we want to show the appropriate button options */}
                {toWatch === true ? null : (
                  <View style={styles.saveButton}>
                    <Button
                      style={styles.saveButton}
                      title="Rec show"
                      color="white"
                      onPress={() =>
                        props.navigation.navigate('SaveShow', {
                          showName,
                          description,
                          imageUrl,
                          streaming,
                          purchase,
                          imdbId,
                          toWatch: false,
                          userShowId,
                        })
                      }
                    ></Button>
                  </View>
                )}
                {toWatch === null || toWatch === true ? (
                  <View style={styles.saveButton}>
                    <Button
                      title="Save show to watch list"
                      color="white"
                      onPress={() =>
                        props.navigation.navigate('SaveShow', {
                          showName,
                          description,
                          imageUrl,
                          streaming,
                          purchase,
                          imdbId,
                          toWatch: true,
                        })
                      }
                    ></Button>
                  </View>
                ) : null}
              </View>
              {streaming ? (
                <View>
                  <Text style={styles.text}>
                    Streaming options: {streaming}
                  </Text>
                  <View style={styles.separator} />
                </View>
              ) : null}
              {purchase ? (
                <View>
                  <Text style={styles.text}>Purchase options: {purchase}</Text>
                  <View style={styles.separator} />
                </View>
              ) : null}
            </View>
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
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
    marginBottom: 8,
    marginRight: 10,
    marginLeft: 10,
  },
  image: {
    flex: 1,
    aspectRatio: 2 / 3,
  },
  saveButton: {
    textAlign: 'center',
    backgroundColor: 'seagreen',
    marginVertical: 8,
    marginBottom: 8,
    marginRight: 10,
    marginLeft: 10,
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#6F98AE',
    borderBottomWidth: 2,
  },
});
