import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import PickCountry from './PickCountry'

function ChangeCountry(props) {
  const [country, setCountry] = useState(null)
  const [changeCountry, setChangeCountry] = useState(false)

  const getCountry = (country) => {
    setCountry(country.name)
    props.setCountryCode(country.cca2)
    setChangeCountry(false)
    props.setSaveCountry(true)
  }

  return (
    <View>
      {!changeCountry && !props.saveCountry ? (
        <Text style={styles.text}>
          Your country is currently set to {props.countryCode}. That means that
          when you search for a show, or add a show to your watch list or
          recommendation list, the purchase and streaming options provided will
          be for that country. You can change your country setting at any time
          by clicking the button below.
        </Text>
      ) : null}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setChangeCountry(true)}
        >
          <Text style={styles.buttonText}>Choose new country</Text>
        </TouchableOpacity>
      </View>
      {changeCountry ? (
        <View style={styles.buttonContainer}>
          <PickCountry onValueChange={getCountry} />
        </View>
      ) : null}
      {props.saveCountry ? (
        <View>
          <Text style={styles.text}>
            Would you like to change your country to {props.countryCode}? If
            yes, click on "Save country to profile" below.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={props.saveNewCountry}
            >
              <Text style={styles.buttonText}>Save country to profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
    margin: 5,
    fontWeight: '500',
    color: 'white',
  },
  text: {
    marginLeft: 15,
    textAlign: 'left',
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 8,
  },
  button: {
    padding: 5,
    borderRadius: 10,
    marginHorizontal: 3,
    backgroundColor: '#340068',
    marginTop: 2,
  },
})

export default ChangeCountry
