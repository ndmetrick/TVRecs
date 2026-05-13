import { useAppData } from '@/lib/AppContext';
import { getName } from 'country-list';
import React, { useState } from 'react';
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from 'react-native';
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

	const [changeCountry, setChangeCountry] = useState(false);
	const { currentUser } = useAppData();
	const isDark = useColorScheme() === 'dark';
	const styles = makeStyles(isDark);

	const getCountry = (country: string) => {
		console.log('country', country);
		// setCountry(country.name);
		setCountryCode(country);
		setChangeCountry(false);
		setSaveCountry(true);
	};

	const getCountryName = (code: string) => {
		if (code === 'US') return 'the United States';
		return getName(code) ?? code;
	};

	return (
		<View>
			{!changeCountry && !saveCountry ? (
				<Text style={styles.text}>
					Your country is currently set to{' '}
					{getCountryName(countryCode) ?? countryCode}. That means that when you
					search for a show, or add a show to your watch list or recommendation
					list, the purchase and streaming options provided will be for that
					country. Log in or sign up to choose your country.
				</Text>
			) : null}
			<View style={styles.buttonContainer}>
				{!changeCountry && (
					<TouchableOpacity
						style={saveCountry ? '' : styles.button}
						onPress={() => {
							setChangeCountry(true);
							if (saveCountry) setSaveCountry(false);
						}}
					>
						<Text
							style={
								saveCountry
									? {
											color: isDark ? '#340068' : '#340068',
											textDecorationLine: 'underline',
										}
									: styles.buttonText
							}
						>
							{currentUser ? 'Choose new country' : 'Log in / Sign up'}
						</Text>
					</TouchableOpacity>
				)}
			</View>
			{changeCountry ? (
				<View style={styles.buttonContainer}>
					<PickCountry onValueChange={getCountry} initialCode={countryCode} />
				</View>
			) : null}
			{saveCountry ? (
				<View>
					<Text style={styles.text}>
						Would you like to change your country to{' '}
						{getCountryName(countryCode) ?? countryCode}? If yes, click on
						&quot;Save country to profile&quot; below.
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

const makeStyles = (isDark: boolean) =>
	StyleSheet.create({
		buttonText: {
			textAlign: 'center',
			fontSize: 18,
			margin: 5,
			fontWeight: '500',
			color: isDark ? '#cccccc' : 'white',
		},
		text: {
			marginLeft: 15,
			textAlign: 'left',
			fontSize: 18,
			color: isDark ? '#cccccc' : '#222',
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
