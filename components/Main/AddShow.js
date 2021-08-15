import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Image } from 'react-native';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import AddShowTags from './AddShowTags';
import SaveShow from './SaveShow';

import firebase from 'firebase/app';
require('firebase/firestore');

export default function AddShow({ navigation }) {
  const [showInput, setShowInput] = useState('');
  const [showName, setShowName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [streaming, setStreaming] = useState('');
  const [purchase, setPurchase] = useState('');
  const [showOptions, setShowOptions] = useState(null);
  const [added, setAdded] = useState(false);
  const key = 'e7eaca48bd580f966d3d14526c3ddff0';

  // https://api.themoviedb.org/4/search/tv?api_key=e7eaca48bd580f966d3d14526c3ddff0&query=we+are+lady+parts

  // 100351;

  // https://api.themoviedb.org/3/tv/70493?api_key=e7eaca48bd580f966d3d14526c3ddff0&language=en-US&append_to_response=watch%2Fproviders,images

  const findShowOptions = async () => {
    try {
      console.log('i got here');
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
        setShowName(show.name);
        const getShow = `https://api.themoviedb.org/3/tv/${show.id}?api_key=${key}&language=en-US&append_to_response=watch%2Fproviders`;
        const thisShow = await axios.get(getShow);
        setStreamingAndPurchase(thisShow.data);
        const imageShowText = `http://www.omdbapi.com/?t=${titleString}&apikey=aa03da30`;
        const imageShow = await axios.get(imageShowText);
        const poster = imageShow.data.Poster;
        console.log('got poster: ', poster, imageShow.data.Poster);
        setImageUrl(poster);
        setAdded(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const setStreamingAndPurchase = (data) => {
    const stream = data['watch/providers'].results.US.flatrate;
    // console.log(data);
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

  const getShowData = async (id) => {
    try {
      const getShow = `https://api.themoviedb.org/3/tv/${id}?api_key=${key}&language=en-US&append_to_response=watch%2Fproviders`;
      const { data } = await axios.get(getShow);
      setShowName(data.name);
      setShowInput(data.name);
      setStreamingAndPurchase(data);
      setShowOptions(null);
      const imageShowText = `http://www.omdbapi.com/?t=${data.name}&apikey=aa03da30`;
      const imageShow = await axios.get(imageShowText);
      const poster = imageShow.data.Poster;
      console.log('got poster: ', poster);
      setImageUrl(poster);
      setAdded(true);
    } catch (e) {
      console.error(e);
    }
  };

  const resetPage = () => {
    setShowInput('');
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setShowInput('');
      setShowName('');
      setDescription('');
      setShowOptions(null);
      setImageUrl('');
      setStreaming('');
      setPurchase('');
      setAdded('');
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text>What show do you want to add?</Text>
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

      <View style={styles.separator} />

      <TextInput
        placeholder="Write your own description of the show. . ."
        style={styles.inputText}
        onChangeText={(description) => setDescription(description)}
      />
      {added ? <AddShowTags /> : null}

      <Button
        title="Save"
        onPress={() =>
          navigation.navigate('SaveShow', {
            showName,
            description,
            imageUrl,
            streaming,
            purchase,
          })
        }
      ></Button>
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
  button: {
    textAlign: 'center',
    backgroundColor: '#4281A4',
    marginVertical: 8,
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#6F98AE',
    borderBottomWidth: 2,
  },
});
