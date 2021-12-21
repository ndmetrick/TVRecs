import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { connect } from 'react-redux';
import { getAPIKey } from '../../redux/actions';
import PickCountry from './PickCountry';

function StreamingAndPurchase(props) {
  const [country, setCountry] = useState('US');
  const [streaming, setStreaming] = useState(null);
  const [purchase, setPurchase] = useState(null);
  const [changeCountry, setChangeCountry] = useState(false);

  useEffect(() => {
    if (props.currentUser) {
      setCountry(props.currentUser.country);
    }
    const getWatchProviders = async (showId) => {
      try {
        const tmdbKey = await props.getAPIKey('tmdb');
        const APIString = `https://api.themoviedb.org/3/tv/${showId}/watch/providers?api_key=${tmdbKey}`;
        const watchProviders = await axios.get(APIString);
        if (watchProviders) {
          const providers = watchProviders.data.results[country || 'US'];
          const streamingInfo = getStreaming(providers);
          const purchaseInfo = getPurchase(providers);
          setStreaming(streamingInfo);
          setPurchase(purchaseInfo);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getWatchProviders(props.showId);
  }, [props.currentUser, country]);

  const getStreaming = (watchProviders) => {
    const stream = watchProviders ? watchProviders.flatrate : null;
    let streamingInfo = '';
    if (stream) {
      const streamingOptions =
        stream && stream.map((option) => option.provider_name).join(', ');
      if (streamingOptions) {
        streamingInfo = streamingOptions;
      }
    }
    return streamingInfo;
  };

  const getPurchase = (watchProviders) => {
    const buy = watchProviders ? watchProviders.buy : null;
    let purchaseInfo = '';
    if (buy) {
      const purchaseOptions =
        buy && buy.map((option) => option.provider_name).join(', ');
      if (purchaseOptions) {
        purchaseInfo = purchaseOptions;
      }
    }
    return purchaseInfo;
  };

  if (purchase === null || streaming === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    );
  }

  const getCountry = (country) => {
    setCountry(country.cca2);
    setChangeCountry(false);
  };

  return (
    <View style={styles.container}>
      {!props.currentUser && !changeCountry && country === 'US' ? (
        <View>
          <Text style={styles.text}>
            This app has been set to search the US by default. If you would like
            to change the location to a different country to search for
            streaming and purchase options, click "Change country".
          </Text>
        </View>
      ) : null}
      {!props.currentUser ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setChangeCountry(true)}
          >
            <Text style={styles.buttonText}>Choose new country</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {changeCountry ? (
        <View style={styles.buttonContainer}>
          <PickCountry onValueChange={getCountry} />
        </View>
      ) : null}
      {streaming ? (
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>
            {country} streaming options:{' '}
          </Text>
          {streaming}
        </Text>
      ) : (
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>
            {country} streaming options:{' '}
          </Text>
          Currently none that we're aware of
        </Text>
      )}
      {purchase ? (
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>
            {country} purchase options:{' '}
          </Text>
          {purchase}
        </Text>
      ) : (
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>
            {country} purchase options:{' '}
          </Text>
          Currently none that we're aware of
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    margin: 10,
    fontSize: 16,
    textAlign: 'left',
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
});

const mapDispatch = (dispatch) => {
  return {
    getAPIKey: (api) => dispatch(getAPIKey(api)),
  };
};

export default connect(null, mapDispatch)(StreamingAndPurchase);
