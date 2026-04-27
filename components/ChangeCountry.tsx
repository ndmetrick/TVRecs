import { useAppData } from '@/lib/AppContext';
import { Country } from '@realtril/react-native-country-picker-modal';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PickCountry from './PickCountry';

interface Props {
	setCountryCode: React.Dispatch<React.SetStateAction<string>>;
	saveCountry: boolean;
	setSaveCountry: React.Dispatch<React.SetStateAction<boolean>>;
	countryCode: string;
	saveNewCountry: () => Promise<void>;
}

const ChangeCountry = (props: Props) => {
	const {
		setCountryCode,
		countryCode,
		setSaveCountry,
		saveCountry,
		saveNewCountry,
	} = props;
	// const [country, setCountry] = useState<
	// 	string | TranslationLanguageCodeMap | null
	// >(null);
	const [changeCountry, setChangeCountry] = useState(false);
	const { currentUser } = useAppData();

	const getCountry = (country: Country) => {
		// setCountry(country.name);
		setCountryCode(country.cca2);
		setChangeCountry(false);
		setSaveCountry(true);
	};

	return (
		<View>
			{!changeCountry && !saveCountry ? (
				<Text style={styles.text}>
					{`Your country is currently set to ${countryCode}. That means that when you search for a show, or add a show to your watch list or recommendation list, the purchase and streaming options provided will be for that country. Log in or sign up to choose your country.`}
				</Text>
			) : null}
			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={styles.button}
					onPress={() => setChangeCountry(true)}
				>
					<Text style={styles.buttonText}>
						{currentUser ? 'Choose new country' : 'Log in / Sign up'}
					</Text>
				</TouchableOpacity>
			</View>
			{changeCountry ? (
				<View style={styles.buttonContainer}>
					<PickCountry onValueChange={getCountry} />
				</View>
			) : null}
			{saveCountry ? (
				<View>
					<Text style={styles.text}>
						{`Would you like to change your country to {countryCode}? If yes, click on "Save country to profile" below.`}
					</Text>
					<View style={styles.buttonContainer}>
						<TouchableOpacity style={styles.button} onPress={saveNewCountry}>
							<Text style={styles.buttonText}>Save country to profile</Text>
						</TouchableOpacity>
					</View>
				</View>
			) : null}
		</View>
	);
};

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
});

export default ChangeCountry;
