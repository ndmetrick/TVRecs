import { useAppData } from '@/lib/AppContext';
import { showErrorToast } from '@/lib/toast';
import { TMDBWatchProviderResults } from '@/lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import axios from 'axios';
import { getName } from 'country-list';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Image,
	Linking,
	StyleSheet,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from 'react-native';
import PickCountry from './PickCountry';

interface Props {
	showId: string;
}

const COUNTRY_NOTICE_KEY = 'hasSeenCountryNotice';

const StreamingAndPurchase = (props: Props) => {
	const [streaming, setStreaming] = useState<string | null>(null);
	const [purchase, setPurchase] = useState<string | null>(null);
	const [changeCountry, setChangeCountry] = useState(false);
	const [overview, setOverview] = useState<string | null>(null);
	const { currentUser, addToWatchProviders, watchProviders } = useAppData();
	const { showId } = props;
	const [country, setCountry] = useState(currentUser?.country ?? 'US');
	const isDark = useColorScheme() === 'dark';
	const styles = makeStyles(isDark);
	const [showCountryNotice, setShowCountryNotice] = useState(false);

	useEffect(() => {
		const checkIfSeenNotice = async () => {
			const seen = await AsyncStorage.getItem(COUNTRY_NOTICE_KEY);
			if (!seen) setShowCountryNotice(true);
		};
		checkIfSeenNotice();
	}, []);

	const dismissNotice = async () => {
		await AsyncStorage.setItem(COUNTRY_NOTICE_KEY, 'true');
		setShowCountryNotice(false);
	};

	useEffect(() => {
		if (currentUser?.country) {
			setCountry(currentUser.country);
		}
		const getWatchProviders = async (showId: string) => {
			try {
				console.log('getWatchProviders', showId);
				const tmdbKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;
				const APIString = `https://api.themoviedb.org/3/tv/${showId}?api_key=${tmdbKey}&append_to_response=watch/providers`;
				const showInfo = await axios.get(APIString);
				if (showInfo) {
					console.log('I am about to get watchproviders', country);
					const watchProviders =
						showInfo.data['watch/providers'].results[country || 'US'];
					const streamingContainer = getStreaming(watchProviders);
					console.log('streaming', streamingContainer);
					const purchaseInfo = getPurchase(watchProviders);
					setOverview(showInfo.data.overview);
					setStreaming(streamingContainer.string);
					setPurchase(purchaseInfo);
					const info = {
						overview: showInfo.data.overview,
						streaming: streamingContainer,
						purchase: purchaseInfo,
						date: new Date(),
					};
					addToWatchProviders(showId, info);
				}
			} catch (err) {
				console.log(`Error getting watch providers: ${err}`);
				showErrorToast('Error getting streaming and purchase info');
				Sentry.captureException(err, {
					tags: { location: 'streamingAndPurchase' },
				});
			}
		};
		// if the watch provider info is already on state and it was updated less than a week ago:
		if (
			watchProviders[showId] &&
			(new Date().getTime() - watchProviders[showId].date.getTime()) /
				(1000 * 60 * 60 * 24) <
				7
		) {
			setStreaming(watchProviders[showId].streaming.string);
			setPurchase(watchProviders[showId].purchase);
			setOverview(watchProviders[showId].overview);
		} else {
			getWatchProviders(showId);
		}
	}, [currentUser, country, watchProviders, showId, addToWatchProviders]);

	const getStreaming = (watchProviders: TMDBWatchProviderResults) => {
		const stream = watchProviders ? watchProviders.flatrate : null;
		let streamingContainer;
		console.log('stream', stream);
		if (stream) {
			const streamingInfo =
				stream && stream.map((option) => option.provider_name);
			if (streamingInfo) {
				const string = streamingInfo.join(', ');
				const options: Record<string, boolean> = {};
				streamingInfo.forEach((streamer) => {
					options[streamer] = true;
				});
				streamingContainer = { string, options };
			}
		}
		if (!streamingContainer) {
			const string = '';
			const options = {};
			streamingContainer = { string, options };
		}
		return streamingContainer;
	};

	const getPurchase = (watchProviders: TMDBWatchProviderResults) => {
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
				<ActivityIndicator size='large' color='#5500dc' />
			</View>
		);
	}

	const getCountry = (country: string) => {
		setCountry(country);
		setChangeCountry(false);
	};

	return (
		<View>
			{!currentUser && !changeCountry && country === 'US' ? (
				<View>
					<Text style={styles.text}>
						{`This app has been set to search the US by default. If you would like to change the location to a different country to search for streaming and purchase options, click "Change country".`}
					</Text>
				</View>
			) : null}
			{!currentUser ? (
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
			<View style={styles.poweredBy}>
				<Text style={styles.poweredByText}>Streaming & purchase info via </Text>
				<TouchableOpacity
					onPress={() => Linking.openURL('https://www.justwatch.com')}
				>
					<Image
						source={require('@/assets/images/justwatch-logo.png')}
						style={styles.justwatchLogoSmall}
						resizeMode='contain'
					/>
				</TouchableOpacity>
			</View>
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
					{"Currently none that we're aware of"}
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
					{"Currently none that we're aware of"}
				</Text>
			)}
			{showCountryNotice && (
				<TouchableOpacity onPress={dismissNotice} style={styles.countryNotice}>
					<Text style={styles.countryNoticeText}>
						Showing results for {getName(country) ?? country}. Tap to dismiss —
						change country in Settings.
					</Text>
				</TouchableOpacity>
			)}
			{overview ? (
				<Text selectable={true} style={styles.text}>
					<Text selectable={true} style={{ fontWeight: 'bold' }}>
						Official overview:{' '}
					</Text>
					{overview}
				</Text>
			) : (
				<Text style={styles.text}>
					<Text style={{ fontWeight: 'bold' }}>Official overview: </Text>
					None available
				</Text>
			)}
		</View>
	);
};

const makeStyles = (isDark: boolean) =>
	StyleSheet.create({
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
		poweredBy: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			paddingHorizontal: 10,
			paddingTop: 4,
			paddingBottom: 4,
		},
		poweredByText: {
			fontSize: 12,
			color: isDark ? '#aaaaaa' : '#888',
		},
		justwatchLogoSmall: {
			width: 60,
			height: 20,
		},
		countryNotice: {
			paddingHorizontal: 10,
			paddingBottom: 8,
		},
		countryNoticeText: {
			fontSize: 12,
			color: isDark ? '#aaaaaa' : '#888',
			textAlign: 'center',
			fontStyle: 'italic',
		},
	});

export default StreamingAndPurchase;
