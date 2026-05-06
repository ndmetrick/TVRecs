import SelectShow, { ShowImagePlaceholder } from '@/components/SelectShow';
import StreamingAndPurchase from '@/components/StreamingAndPurchase';
import { useAppData } from '@/lib/AppContext';
import { SourcePage, UserShowToSave, UserShowType } from '@/lib/types';
import { useIsFocused } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
	Alert,
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { ActivityIndicator } from 'react-native-paper';
import { skipTagsAndSaveShowData } from '../../lib/utils';

const profileShowOptions = [
	{
		label: 'Recommend it',
		value: UserShowType.REC,
	},
	{
		label: 'Save it to my Watch list to remind me to watch it later',
		value: UserShowType.WATCH,
	},
	{
		label: 'Filter it out of recs I see in my main feed',
		value: UserShowType.SEEN,
	},
	{
		label: 'Nothing',
		value: 'none',
	},
];
const AddShow = () => {
	const { addToType } = useLocalSearchParams<{ addToType?: string }>();

	const [showName, setShowName] = useState('');
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [tmdbId, setTmdbId] = useState('');
	// const [type, setType] = useState(null);
	// const [streaming, setStreaming] = useState('')
	// const [purchase, setPurchase] = useState('')
	const [streamingAndPurchase, setStreamingAndPurchase] = useState(false);
	const [showAdded, setShowAdded] = useState(false);
	const [saving, setSaving] = useState(false);
	const [profileShowDropdownOpen, setProfileShowDropdownOpen] = useState(false);
	const [showType, setShowType] = useState<string | null>(null);
	const [imageError, setImageError] = useState(false);

	const [profileShowDropdownOptions, setProfileShowDropdownOptions] = useState<
		{
			label: string;
			value: string;
		}[]
	>(profileShowOptions);
	const [userHasShow, setUserHasShow] = useState<UserShowType | null>(null);
	const { userShows, toWatch, seen, currentUser, refetchUserShows } =
		useAppData();

	const isFocused = useIsFocused();

	useEffect(() => {
		if (currentUser) {
			setProfileShowDropdownOptions(profileShowOptions);
		}

		return () => {
			setShowName('');
			setImageUrl(null);
			setShowAdded(false);
			setTmdbId('');
			// setStreaming('')
			// setPurchase('')
			setStreamingAndPurchase(false);
			setShowType(null);
			setUserHasShow(null);
			setProfileShowDropdownOpen(false);
			setImageError(false);
			setSaving(false);
		};
	}, [currentUser, isFocused]);

	useEffect(() => {
		if (addToType) {
			setShowType(addToType);
		}
	}, [addToType]);

	const addThisShow = (
		name: string,
		url: string,
		id: string | number,
		added: boolean,
	) => {
		console.log('ADD SHOW');
		setShowName(name);
		setImageUrl(url);
		const stringId = String(id);
		setTmdbId(stringId);
		console.log('TMDB', id);
		// setStreaming(streaming)
		// setPurchase(purchase)
		setShowAdded(added);

		const hasShow = toWatch.find(
			(watchShow) => stringId === watchShow.show.tmdb_id,
		)
			? UserShowType.WATCH
			: userShows.find((userShow) => stringId === userShow.show.tmdb_id)
				? UserShowType.REC
				: seen.find((seenShow) => stringId === seenShow.show.tmdb_id)
					? UserShowType.SEEN
					: null;
		setUserHasShow(hasShow);
	};

	const image = imageUrl ? { uri: imageUrl } : null;

	return (
		<View style={styles.container}>
			{saving && (
				<Modal transparent animationType='none' statusBarTranslucent>
					<View style={styles.savingOverlay}>
						<ActivityIndicator size='large' color='white' />
					</View>
				</Modal>
			)}
			<ScrollView
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps='handled'
			>
				<SelectShow handleShow={addThisShow} sourcePage={SourcePage.ADD_SHOW} />
				<View>
					{showAdded ? (
						<View>
							<Text style={styles.boldText}>{showName}</Text>
							{image ? (
								<Image
									source={image}
									style={{
										height: 300,
										resizeMode: 'contain',
										margin: 5,
										marginBottom: 15,
									}}
									onError={() => setImageError(true)}
								/>
							) : (
								<ShowImagePlaceholder name={showName} style={styles.image} />
							)}

							{showType !== null &&
							showType !== 'none' ? null : !streamingAndPurchase ? (
								<View style={{ ...styles.buttonContainer, marginBottom: 10 }}>
									<TouchableOpacity
										style={styles.button}
										onPress={() => setStreamingAndPurchase(true)}
									>
										<Text style={styles.buttonText}>
											Show overview and options for streaming and purchase
										</Text>
									</TouchableOpacity>
								</View>
							) : (
								<View>
									<View style={styles.buttonContainer}>
										<TouchableOpacity
											style={styles.button}
											onPress={() => setStreamingAndPurchase(false)}
										>
											<Text style={styles.buttonText}>
												Hide overview and options for streaming and purchase
											</Text>
										</TouchableOpacity>
									</View>
									<StreamingAndPurchase showId={tmdbId} />
								</View>
							)}

							<View style={{ flexDirection: 'column' }}>
								{userHasShow ? (
									<View>
										<Text
											style={{
												...styles.text,
												textAlign: 'left',
												marginLeft: 10,
											}}
										>
											{`This show is already on your ${userHasShow} list. If you'd like to change that, navigate to the show on your profile to see all the options.`}
										</Text>
										<View style={styles.buttonContainer}>
											<TouchableOpacity
												style={styles.button}
												onPress={() =>
													router.push({ pathname: '/currentUser' })
												}
											>
												<Text style={styles.buttonText}>
													Take me to my profile
												</Text>
											</TouchableOpacity>
										</View>
									</View>
								) : (
									<View
										style={{
											marginLeft: 15,
											marginRight: 15,
										}}
									>
										<DropDownPicker
											open={profileShowDropdownOpen}
											value={showType}
											items={profileShowDropdownOptions}
											setOpen={setProfileShowDropdownOpen}
											setValue={setShowType}
											setItems={setProfileShowDropdownOptions}
											listMode='SCROLLVIEW'
											dropDownDirection='TOP'
											itemKey='label'
											labelStyle={{
												flexWrap: 'wrap',
												fontSize: 15,
												margin: 15,
												marginLeft: 10,
											}}
											style={{
												borderRadius: 25,
											}}
											placeholder='What do you want to do with this show?'
										/>

										{showType === 'none' || showType === null ? null : (
											<>
												<Text style={styles.showTypeText}>
													{showType === UserShowType.REC
														? 'Recommend'
														: showType === UserShowType.WATCH
															? 'Save'
															: 'Filter out'}{' '}
													{showName}
												</Text>
												<View style={styles.buttonContainer}>
													<TouchableOpacity
														style={styles.goToTagsButton}
														onPress={() => {
															const showData: UserShowToSave = {
																name: showName,
																image_url: imageUrl,
																tmdb_id: tmdbId,
																// streaming,
																// purchase,
																type: showType as UserShowType,
															};
															router.push({
																pathname: '/addShowTags',
																params: {
																	showToSaveString: JSON.stringify(showData),
																	previousString: SourcePage.ADD_SHOW,
																},
															});
														}}
													>
														<Text style={styles.buttonText}>
															Add description and tags
														</Text>
													</TouchableOpacity>
												</View>
												<View style={styles.buttonContainer}>
													<TouchableOpacity
														style={styles.skipAndSaveButton}
														onPress={() => {
															if (currentUser) {
																setSaving(true);
																const showData: UserShowToSave = {
																	name: showName,
																	image_url: imageUrl,
																	tmdb_id: tmdbId,
																	// streaming,
																	// purchase,
																	type: showType as UserShowType,
																};
																skipTagsAndSaveShowData(
																	showData,
																	SourcePage.ADD_SHOW,
																	currentUser!.id,
																	refetchUserShows,
																	null,
																	setSaving,
																	false,
																);
															} else {
																Alert.alert(
																	'Sign up or log in to enable this feature',
																	'',
																	[{ text: 'OK' }],
																);
															}
														}}
													>
														<Text style={styles.skipButtonText}>
															Skip description/tags and
															{showType === UserShowType.REC
																? ' recommend '
																: showType === UserShowType.WATCH
																	? ' save '
																	: ' filter out '}
															{showType === UserShowType.WATCH
																? 'to my Watch List'
																: null}
														</Text>
													</TouchableOpacity>
												</View>
											</>
										)}
									</View>
								)}
							</View>
						</View>
					) : null}
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginTop: 15,
		flex: 1,
		marginHorizontal: 2,
		marginBottom: 30,
	},
	optionContainer: {
		flex: 1,
		justifyContent: 'space-between',
		marginRight: 10,
		marginLeft: 10,
	},
	text: {
		margin: 5,
		textAlign: 'center',
		fontSize: 20,
	},
	boldText: {
		margin: 5,
		textAlign: 'center',
		fontSize: 20,
		fontWeight: 'bold',
	},
	inputText: {
		margin: 10,
		textAlign: 'left',
		fontSize: 20,
	},
	optionsText: {
		marginRight: 10,
		marginLeft: 10,
		fontSize: 15,
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
	},
	button: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#340068',
		marginTop: 5,
	},
	addPosterButton: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		marginTop: 5,
		backgroundColor: '#324376',
	},
	box: {
		backgroundColor: 'white',
		borderWidth: 2,
		borderColor: '#324376',
		marginBottom: 2,
		marginTop: 2,
		padding: 2,
	},
	removePosterButton: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		marginTop: 5,
		backgroundColor: '#636A7D',
	},
	image: {
		flex: 1,
		aspectRatio: 2 / 3,
	},
	goToTagsButton: {
		backgroundColor: '#4056F4',
		padding: 8,
		borderRadius: 40,
		marginHorizontal: 3,
		marginTop: 5,
		marginBottom: 20,
	},
	skipAndSaveButton: {
		borderWidth: 2,
		borderColor: '#6B5E8C',
		backgroundColor: 'transparent',
		padding: 8,
		borderRadius: 40,
		marginHorizontal: 3,
		marginTop: 5,
		marginBottom: 20,
	},
	skipButtonText: {
		color: '#340068',
	},
	disabledSkipButtonText: {
		color: '#777',
	},
	showTypeText: {
		fontSize: 20,
		fontWeight: '600',
		textAlign: 'center',
		marginTop: 10,
		marginBottom: 10,
		marginHorizontal: 15,
		color: '#340068',
	},
	savingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.4)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 999,
	},
});

export default AddShow;
