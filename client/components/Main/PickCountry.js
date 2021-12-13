import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';

export default function PickCountry(props) {
  const [countryCode, setCountryCode] = useState('US');
  const withCountryNameButton = true;
  const withFlag = true;
  const withEmoji = false;
  const withFilter = true;
  const withAlphaFilter = true;
  const withCallingCode = false;
  const onSelect = (country) => {
    setCountryCode(country.cca2);
    props.onValueChange(country);
  };
  return (
    <View style={styles.container}>
      <CountryPicker
        {...{
          countryCode,
          withFilter,
          withFlag,
          withCountryNameButton,
          withAlphaFilter,
          withCallingCode,
          withEmoji,
          onSelect,
        }}
        visible={true}
        containerStyle={{ borderWidth: 2, width: '100%' }}
      />
      {/* <Entypo name="chevron-small-down" size={24} color="gray" /> */}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'gray',
    width: '90%',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textStyle: {
    margin: 10,
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pickerStyle: {
    width: '100%',
    color: '#344953',
  },
});
