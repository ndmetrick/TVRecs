import CountryPicker, {
	Country,
	CountryCode,
} from '@realtril/react-native-country-picker-modal';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
	onValueChange: (country: Country) => void;
}

export default function PickCountry(props: Props) {
	const [countryCode, setCountryCode] = useState<CountryCode>('US');

	const withCountryNameButton = true;
	const withFlag = true;
	const withEmoji = false;
	const withFilter = true;
	const withAlphaFilter = true;
	const withCallingCode = false;
	const onSelect = (country: Country) => {
		setCountryCode(country.cca2 as CountryCode);
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
				// containerStyle={{ borderWidth: 2, width: '100%' }}
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
