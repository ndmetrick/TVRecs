import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
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
  const key = 'e7eaca48bd580f966d3d14526c3ddff0';
  const isFocused = useIsFocused();

  // https://api.themoviedb.org/4/search/tv?api_key=e7eaca48bd580f966d3d14526c3ddff0&query=we+are+lady+parts
  // 100351;
  // https://api.themoviedb.org/3/tv/70493?api_key=e7eaca48bd580f966d3d14526c3ddff0&language=en-US&append_to_response=watch%2Fproviders,images

  useEffect(() => {
    // if the user got here by adding an existing show from their own watch list or from someone else's rec list
    // console.log('props in addShow', props);
    if (props.previous.length > 1) {
      if (props.previous[1].name === 'SingleShow') {
        const { userShow, toWatch, userShowId } =
          props.previous[0].state.routes[1].params;
        console.log('toWatch', toWatch);
        console.log('userShowId', userShowId);
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
        };
      }
    }
  }, [props.navigation, isFocused]);

  const findShowOptions = async () => {
    try {
      const titleString = showInput.split(' ').join('+');
      const getShowOptions = `https://api.themoviedb.org/4/search/tv?api_key=${key}&query=${titleString}`;
      const { data } = await axios.get(getShowOptions);
      if (data.results.length > 1) {
        const showList = data.results.map((show) => {
          return {
            label: show.name,
            value: show.id,
          };
        });
        setShowOptions(showList);
      } else {
        const show = data.results[0];
        setImdbId(show.id);
        setShowName(show.name);
        const getShow = `https://api.themoviedb.org/3/tv/${show.id}?api_key=${key}&language=en-US&append_to_response=watch%2Fproviders`;
        const thisShow = await axios.get(getShow);
        setStreamingAndPurchase(thisShow.data);
        const imageShowText = `http://www.omdbapi.com/?t=${titleString}&apikey=aa03da30`;
        const imageShow = await axios.get(imageShowText);
        const poster = imageShow.data.Poster;
        setImageUrl(poster);
        setAdded(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const setStreamingAndPurchase = (data) => {
    const stream = data['watch/providers'].results.US.flatrate;
    const buy = data['watch/providers'].results.US.buy;
    const streamingOptions =
      stream && stream.map((option) => option.provider_name).join(', ');
    const purchaseOptions =
      buy && buy.map((option) => option.provider_name).join(', ');
    if (streamingOptions) {
      setStreaming(streamingOptions);
    }
    if (purchaseOptions) {
      setPurchase(purchaseOptions);
    }
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
      const imageShowText = `http://www.omdbapi.com/?t=${data.name}&apikey=aa03da30`;
      const imageShow = await axios.get(imageShowText);
      const poster = imageShow.data.Poster;
      setImageUrl(poster);
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
        <View>
          <Text style={styles.text}>What show do you want to add?</Text>
          <TextInput
            style={styles.inputText}
            placeholder="Show Title"
            onChangeText={(showInput) => setShowInput(showInput)}
            value={showInput}
          />

          {showOptions ? (
            <View>
              <RNPickerSelect
                onValueChange={(value) => getShowData(value)}
                items={showOptions}
                style={{
                  fontSize: 26,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  borderWidth: 1,
                  borderColor: 'blue',
                  borderRadius: 4,
                  color: 'black',
                  paddingRight: 30,
                  placeholder: 26,
                }}
              />
            </View>
          ) : null}

          <View style={styles.button}>
            <Button
              color="white"
              onPress={findShowOptions}
              title="Add show"
              backgroundColor="seagreen"
            ></Button>
          </View>
        </View>
      ) : null}
      {!fromSingleShow ? (
        <View style={styles.button}>
          <Button
            color="white"
            onPress={chooseNewShow}
            title="Choose a new show"
          ></Button>
        </View>
      ) : null}
      <ScrollView>
        {added ? (
          <View>
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
              {purchase ? (
                <View>
                  <Text style={styles.text}>
                    Streaming options: {streaming}
                  </Text>
                  <View style={styles.separator} />
                </View>
              ) : null}
              {streaming ? (
                <View>
                  <Text style={styles.text}>Purchase options: {purchase}</Text>
                  <View style={styles.separator} />
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
      </ScrollView>
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
