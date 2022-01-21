import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native'
import axios from 'axios'
import { connect } from 'react-redux'
import { getAPIKey, addToWatchProviders } from '../../redux/actions'
import PickCountry from './PickCountry'

function StreamingAndPurchase(props) {
  const [country, setCountry] = useState('US')
  const [streaming, setStreaming] = useState(null)
  const [purchase, setPurchase] = useState(null)
  const [changeCountry, setChangeCountry] = useState(false)
  const [overview, setOverview] = useState(null)

  useEffect(() => {
    if (props.currentUser) {
      setCountry(props.currentUser.country)
    }
    const getWatchProviders = async (showId) => {
      try {
        const tmdbKey = await props.getAPIKey('tmdb')
        const APIString = `https://api.themoviedb.org/3/tv/${showId}?api_key=${tmdbKey}&append_to_response=watch/providers`
        const showInfo = await axios.get(APIString)
        if (showInfo) {
          const watchProviders =
            showInfo.data['watch/providers'].results[country || 'US']
          const streamingContainer = getStreaming(watchProviders)
          const purchaseInfo = getPurchase(watchProviders)
          setOverview(showInfo.data.overview)
          setStreaming(streamingContainer.string)
          setPurchase(purchaseInfo)
          const info = {
            overview: showInfo.data.overview,
            streaming: streamingContainer,
            purchase: purchaseInfo,
            date: new Date(),
          }
          props.addToWatchProviders({ imdbId: props.showId, info })
        }
      } catch (err) {
        console.log(err)
      }
    }
    // if the watch provider info is already on state and it was updated less than a week ago:
    if (
      props.watchProviders[props.showId] &&
      (new Date() - props.watchProviders[props.showId].date) /
        (1000 * 60 * 60 * 24) <
        7
    ) {
      setStreaming(props.watchProviders[props.showId].streaming.string)
      setPurchase(props.watchProviders[props.showId].purchase)
      setOverview(props.watchProviders[props.showId].overview)
    } else {
      getWatchProviders(props.showId)
    }
  }, [props.currentUser, country])

  console.log('here it is', props.watchProviders)

  console.log('watch providers in streaming and purchase', props.watchProviders)

  const getStreaming = (watchProviders) => {
    const stream = watchProviders ? watchProviders.flatrate : null
    let streamingContainer
    let streaming
    if (stream) {
      const streamingInfo =
        stream && stream.map((option) => option.provider_name)
      if (streamingInfo) {
        const string = streamingInfo.join(', ')
        const options = {}
        streamingInfo.forEach((streamer) => {
          options[streamer] = true
        })
        streamingContainer = { string, options }
      }
    }
    return streamingContainer
  }

  const getPurchase = (watchProviders) => {
    const buy = watchProviders ? watchProviders.buy : null
    let purchaseInfo = ''
    if (buy) {
      const purchaseOptions =
        buy && buy.map((option) => option.provider_name).join(', ')
      if (purchaseOptions) {
        purchaseInfo = purchaseOptions
      }
    }
    return purchaseInfo
  }

  if (purchase === null || streaming === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  }

  const getCountry = (country) => {
    setCountry(country.cca2)
    setChangeCountry(false)
  }

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
      {overview ? (
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>Official overview: </Text>
          {overview}
        </Text>
      ) : (
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>Official overview: </Text>
          None available
        </Text>
      )}
    </View>
  )
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
    backgroundColor: '#340068',
    marginTop: 5,
  },
})

const mapState = (store) => ({
  watchProviders: store.currentUser.watchProviders,
})

const mapDispatch = (dispatch) => {
  return {
    getAPIKey: (api) => dispatch(getAPIKey(api)),
    addToWatchProviders: (watchInfo) =>
      dispatch(addToWatchProviders(watchInfo)),
  }
}

export default connect(mapState, mapDispatch)(StreamingAndPurchase)
