import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

import OtherRecerModal from '@/components/OtherRecerModal';
import SaveShowModal from '@/components/SaveShowModal';
import StreamingAndPurchase from '@/components/StreamingAndPurchase';
import { useAppData } from '@/lib/AppContext';
import { deleteUserShow } from '@/lib/api';
import {
	RecCount,
	SourcePage,
	Tag,
	UserProfile,
	UserShow,
	UserShowToSave,
	UserShowType,
} from '@/lib/types';
import { useIsFocused } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { skipTagsAndSaveShowData } from './utils';

const SingleShow = () => {
	const { userShowString, userString } = useLocalSearchParams();
	const singleShow: UserShow = JSON.parse(userShowString as string);
	const userToView: UserProfile = JSON.parse(userString as string);

	const [user, setUser] = useState<UserProfile | null>(null);
	const [type, setType] = useState<UserShowType | null>(null);
	const [warningTags, setWarningTags] = useState<Tag[]>([]);
	const [tvTags, setTVTags] = useState<Tag[]>([]);
	const [isCurrentUser, setIsCurrentUser] = useState(false);
	const [userHasShow, setUserHasShow] = useState<UserShowType | null>(null);
	const [streamingAndPurchase, setStreamingAndPurchase] = useState(false);
	const [profileShowDropdownOpen, setProfileShowDropdownOpen] = useState(false);
	const [profileShowDropdownValue, setProfileShowDropdownValue] =
		useState(null);
	const [loading, setLoading] = useState(true);
	const [profileShowDropdownOptions, setProfileShowDropdownOptions] = useState<
		{ label: string; value: string }[]
	>([]);
	const {
		currentUser,
		userShows,
		toWatch,
		seen,
		refetchFollowingRecs,
		followingRecs,
		refetchUserShows,
	} = useAppData();
	const [saveShowModalVisible, setSaveShowModalVisible] = useState(false);

	const isFocused = useIsFocused();

	// const [following, setFollowing] = useState(false);
	// multipleRecInfo counts how many other people you follow recommend a given show that this user recommends
	const [multipleRecInfo, setMultipleRecInfo] = useState<
		Record<number, RecCount>
	>({});
	const [modalVisible, setModalVisible] = useState(false);

	const saveSingleShow = (keepCurrentTagsAndDesc: boolean) => {
		if (!currentUser) {
			router.push({ pathname: '/login' });
		} else {
			const showToSave: UserShowToSave = {
				name: singleShow.show.name,
				tmdb_id: singleShow.show.tmdb_id,
				image_url: singleShow.show.image_url,
				tags: singleShow.tags,
				description: singleShow.description,
				type: type ?? UserShowType.REC,
			};
			const currentUserShow = isCurrentUser ? singleShow : null;
			skipTagsAndSaveShowData(
				showToSave,
				SourcePage.SINGLE_SHOW,
				currentUser.id,
				refetchUserShows,
				currentUserShow,
				keepCurrentTagsAndDesc,
				refetchFollowingRecs,
			);
		}
	};

	const goToAddTags = (keepCurrentTagsAndDesc: boolean) => {
		if (!currentUser) {
			router.push({ pathname: '/login' });
		} else {
			const showToSave: UserShowToSave = {
				tags: keepCurrentTagsAndDesc ? singleShow.tags : [],
				description: keepCurrentTagsAndDesc ? singleShow.description : null,
				name: singleShow.show.name,
				tmdb_id: singleShow.show.tmdb_id,
				image_url: singleShow.show.image_url,
				type: type ?? UserShowType.REC,
			};
			const params = isCurrentUser
				? {
						showToSaveString: JSON.stringify(showToSave),
						previousPage: SourcePage.SINGLE_SHOW,
						currentShowString: JSON.stringify(singleShow),
					}
				: {
						showToSaveString: JSON.stringify(showToSave),
						previousString: SourcePage.SINGLE_SHOW,
					};
			router.push({
				pathname: '/addShowTags',
				params,
			});

			// MATCH ABOVE!
		}
	};

	useEffect(() => {
		//profileShowOptions is the list of dropdown menu options for what the user can do with the show (delete it from their profile, add it to their profile in different places, etc)

		if (currentUser === null && userToView !== null) {
			console.log('i got in here');
			setUser(userToView);
			// setCountry(userInfo.country)
		} else {
			if (currentUser) {
				if (userToView.id === currentUser.id) {
					// if the current user is the same as the person who's page this is (it's their own profile page):
					setUser(currentUser);
					setIsCurrentUser(true);
					const profileShowOptions = [
						{ label: 'Delete it', value: 'delete' },
						{ label: 'Add or edit description/tags', value: 'tags' },
					];
					// If this show is already on the user's profile, depending on where it is, different options to move it will be added to the dropdown menu options.
					const otherDropdownOptions = userShows.find(
						(currentUserShow) => currentUserShow.show.id === singleShow.show.id,
					)
						? [
								{
									label:
										'Move it to my Watch list to remind me to watch it later',
									value: UserShowType.WATCH,
								},
								{
									label: 'Move it to my Filter Out list',
									value: UserShowType.SEEN,
								},
								{ label: 'Nothing', value: 'none' },
							]
						: toWatch.find(
									(watchShow) => watchShow.show.id === singleShow.show.id,
							  )
							? [
									{ label: 'Recommend it', value: UserShowType.REC },
									{
										label: 'Move it to my Filter Out list',
										value: UserShowType.SEEN,
									},
									{ label: 'Nothing', value: 'none' },
								]
							: [
									{ label: 'Recommend it', value: UserShowType.REC },

									{
										label:
											'Move it to my Watch list to remind me to watch it later',
										value: UserShowType.WATCH,
									},
									{ label: 'Nothing', value: 'none' },
								];
					otherDropdownOptions.forEach((option) => {
						profileShowOptions.push(option);
					});
					console.log('profileshowoptions', profileShowOptions);
					setProfileShowDropdownOptions(profileShowOptions);
				} else {
					setUser(userToView);
					if (currentUser) {
						const hasShow = userShows.find(
							(currentUserShow) =>
								currentUserShow.show.id === singleShow.show.id,
						)
							? UserShowType.REC
							: toWatch.find(
										(watchShow) => watchShow.show.id === singleShow.show.id,
								  )
								? UserShowType.WATCH
								: seen.find(
											(seenShow) => seenShow.show.id === singleShow.show.id,
									  )
									? UserShowType.SEEN
									: null;
						if (hasShow) {
							setUserHasShow(hasShow);
						} else {
							setProfileShowDropdownOptions([
								{ label: 'Recommend it', value: UserShowType.REC },
								{
									label:
										'Save it to my Watch list to remind me to watch it later',
									value: UserShowType.WATCH,
								},
								{
									label: 'Filter it out of recs I see in my main feed',
									value: UserShowType.SEEN,
								},
								{ label: 'Nothing', value: 'none' },
							]);
						}
					}
				}
				const myProfile = userShows.find(
					(userShow) => userShow.show.id === singleShow.show_id,
				)
					? 'and you'
					: toWatch.find(
								(watchShow) => watchShow.show.id === singleShow.show_id,
						  )
						? 'and on your To Watch list'
						: null;
				const showId = singleShow.show_id;
				let recCounts: Record<number, RecCount> = {};
				recCounts[showId] = {
					num: 1,
					recommenders: [{ userId: singleShow.user_id, recShow: singleShow }],
					myProfile,
				};

				followingRecs.forEach((recShow) => {
					if (recShow.show_id === showId) {
						recCounts[showId].num++;
						recCounts[showId].recommenders.push({
							userId: recShow.user_id,
							recShow,
						});
					}
				});
				setMultipleRecInfo(recCounts);
			}
		}
		const warnings = singleShow.tags.filter((tag) => {
			return tag.type === 'warning';
		});
		const tv = singleShow.tags.filter((tag) => {
			return tag.type === 'tv' || tag.type === 'unassigned';
		});
		setTVTags(tv);
		setWarningTags(warnings);
		setType(singleShow.type);
		setLoading(false);
		return () => {
			setStreamingAndPurchase(false);
			setUser(null);
			setType(null);
			setWarningTags([]);
			setTVTags([]);
			setIsCurrentUser(false);
			setMultipleRecInfo({});
			setModalVisible(false);
			setUserHasShow(null);
			setProfileShowDropdownValue(null);
			setLoading(true);
		};
	}, [
		userToView,
		type,
		isFocused,
		currentUser,
		singleShow,
		userShows,
		toWatch,
		seen,
		followingRecs,
	]);

	const deleteShow = async () => {
		try {
			if (singleShow.type === UserShowType.SEEN) {
				const deleted = await deleteUserShow(supabase, singleShow.id);
				// because seen/to-filter shows are automatically removed from shows recommended to the user, we need to get recShows again if we succeed in deleting the show from the seen list
				if (deleted) {
					await refetchFollowingRecs();
					router.back();
				}
			} else {
				await deleteUserShow(supabase, singleShow.id);
				router.back();
			}
		} catch (err) {
			console.error(err);
		}
	};

	const displayTags = (tags: Tag[]) => {
		return tags.map((tag, key) => {
			const tagStyle =
				tag.type === 'warning' ? styles.warningTag : styles.tvTag;
			return (
				<View key={key} style={tagStyle}>
					<Text style={styles.tagText}>{tag.name}</Text>
				</View>
			);
		});
	};

	if (user === null || loading || Object.keys(multipleRecInfo).length === 0) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' color='#5500dc' />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.containerInfo}>
				<View style={{ flex: 1, alignItems: 'center' }}>
					{isCurrentUser ? (
						<View
							style={{ flexDirection: 'row', flexWrap: 'wrap', margin: 10 }}
						>
							<View style={styles.usernameButton}>
								<Text
									onPress={() => router.push({ pathname: '/currentUser' })}
									style={styles.usernameText}
								>
									Your
								</Text>
							</View>
							<View style={styles.recButton}>
								<Text style={styles.recText}> recommendation:</Text>
							</View>
						</View>
					) : (
						<View
							style={{ flexDirection: 'row', flexWrap: 'wrap', margin: 10 }}
						>
							<View style={styles.usernameButton}>
								<Text
									onPress={() =>
										router.push({
											pathname: '/followedUserScreen',
											params: { uid: user.id },
										})
									}
									style={styles.usernameText}
								>
									{user.username}
								</Text>
							</View>
							<View style={styles.recButton}>
								<Text style={styles.recText}>{"'s recommendation:"}</Text>
							</View>
						</View>
					)}
				</View>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ flexGrow: 1 }}
			>
				{!currentUser ? null : multipleRecInfo[singleShow.show.id].num < 2 ? (
					<Text
						style={{
							fontSize: 16,
							margin: 10,
							textAlign: 'left',
						}}
					>
						{userHasShow === UserShowType.REC
							? 'You also recommend this show'
							: userHasShow === UserShowType.WATCH
								? 'This show is on your To Watch list'
								: userHasShow === UserShowType.SEEN
									? 'This show is on your Filter Out list'
									: null}
					</Text>
				) : (
					<View
						style={{
							margin: 10,
							flexDirection: 'row',
							flexWrap: 'wrap',
						}}
					>
						<Text style={{ fontSize: 16 }}>Also recommended by </Text>
						<TouchableOpacity onPress={() => setModalVisible(true)}>
							<Text style={{ color: 'blue', fontSize: 16, textAlign: 'left' }}>
								{`${multipleRecInfo[singleShow.show.id].num - 1}`}{' '}
								{multipleRecInfo[singleShow.show.id].num > 2 && isCurrentUser
									? 'people you follow'
									: multipleRecInfo[singleShow.show.id].num > 2 &&
										  !isCurrentUser
										? 'other people you follow'
										: multipleRecInfo[singleShow.show.id].num < 3 &&
											  isCurrentUser
											? 'person you follow'
											: 'other person you follow'}
							</Text>
						</TouchableOpacity>
						<Text style={{ color: 'black', fontSize: 16 }}>
							{userHasShow === UserShowType.REC
								? 'and you'
								: userHasShow === UserShowType.WATCH
									? 'and on your To Watch list'
									: userHasShow === UserShowType.SEEN
										? 'and on your Filter Out list'
										: null}
						</Text>
						<OtherRecerModal
							modalVisible={modalVisible}
							setModalVisible={setModalVisible}
							selectedItem={multipleRecInfo[singleShow.show.id].recommenders}
							previous={SourcePage.SINGLE_SHOW}
						/>
					</View>
				)}
				<View>
					<Image
						style={styles.image}
						source={{ uri: singleShow.show.image_url }}
					/>
					<Text
						style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 18 }}
					>
						{singleShow.show.name}
					</Text>

					<View style={styles.extra}>
						{singleShow.description ? (
							<Text style={styles.text}>
								<Text style={{ fontWeight: 'bold' }}>Description: </Text>
								{singleShow.description}
							</Text>
						) : null}
						{singleShow.tags.length ? (
							<View>
								{tvTags.length ? (
									<View>
										{isCurrentUser ? (
											<Text style={{ ...styles.text, fontWeight: 'bold' }}>
												My tags:
											</Text>
										) : (
											<Text style={styles.text}>
												I think these tags describe some important things about
												the show and its themes:
											</Text>
										)}
										<View style={[styles.cardContent, styles.tagsContent]}>
											{displayTags(tvTags)}
										</View>
									</View>
								) : null}

								{warningTags.length ? (
									<View>
										{isCurrentUser ? null : (
											<Text style={styles.text}>
												There is some content in this show I think potential
												viewers should be warned about:
											</Text>
										)}
										<View style={[styles.cardContent, styles.tagsContent]}>
											{displayTags(warningTags)}
										</View>
									</View>
								) : null}
							</View>
						) : null}
						{profileShowDropdownValue !== null &&
						profileShowDropdownValue !==
							'none' ? null : !streamingAndPurchase ? (
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
								{singleShow.show.tmdb_id ? (
									<StreamingAndPurchase showId={singleShow.show.tmdb_id} />
								) : null}
							</View>
						)}
						{isCurrentUser ? (
							<View
								style={{
									marginLeft: 15,
									marginRight: 15,
								}}
							>
								<DropDownPicker
									style={{ borderRadius: 25 }}
									open={profileShowDropdownOpen}
									value={profileShowDropdownValue}
									items={profileShowDropdownOptions}
									setOpen={setProfileShowDropdownOpen}
									setValue={setProfileShowDropdownValue}
									setItems={setProfileShowDropdownOptions}
									listMode='SCROLLVIEW'
									dropDownDirection='TOP'
									itemKey='label'
									placeholder='What do you want to do with this show?'
								/>
								{profileShowDropdownValue === 'delete' ? (
									<View style={styles.buttonContainer}>
										<TouchableOpacity
											style={styles.saveButton}
											onPress={() =>
												Alert.alert(
													'Are you sure you want to delete this show?',
													'',
													[
														{ text: 'Yes', onPress: () => deleteShow() },
														{
															text: 'Cancel',
														},
													],
												)
											}
										>
											<Text style={styles.buttonText}>
												Delete{' '}
												<Text style={styles.showName}>
													{singleShow.show.name}
												</Text>
											</Text>
										</TouchableOpacity>
									</View>
								) : profileShowDropdownValue === 'tags' ? (
									<View style={styles.buttonContainer}>
										<TouchableOpacity
											style={styles.saveButton}
											onPress={() =>
												router.push({
													pathname: '/addShowTags',
													params: {
														currentShowString: JSON.stringify(singleShow),
														previousString: SourcePage.SINGLE_SHOW,
														showToSaveString: JSON.stringify({
															tags: singleShow.tags,
															description: singleShow.description,
															name: singleShow.show.name,
															tmdb_id: singleShow.show.tmdb_id,
															image_url: singleShow.show.image_url,
															type: type ?? UserShowType.REC,
														}),
													},
												})
											}
										>
											<Text style={styles.buttonText}>
												Go to description/tags for{' '}
												<Text style={styles.showName}>
													{singleShow.show.name}
												</Text>
											</Text>
										</TouchableOpacity>
									</View>
								) : profileShowDropdownValue === UserShowType.REC ||
								  profileShowDropdownValue === UserShowType.WATCH ||
								  profileShowDropdownValue === UserShowType.SEEN ? (
									<View style={styles.buttonContainer}>
										<TouchableOpacity
											style={styles.saveButton}
											onPress={() => setModalVisible(true)}
										>
											<Text style={styles.buttonText}>
												Switch{' '}
												<Text style={styles.showName}>
													{singleShow.show.name}{' '}
												</Text>{' '}
												{profileShowDropdownValue === UserShowType.REC
													? 'to recommended'
													: profileShowDropdownValue === UserShowType.WATCH
														? 'to To Watch'
														: 'to Filter Out'}
											</Text>
										</TouchableOpacity>
									</View>
								) : null}
							</View>
						) : (
							<View>
								{/* If the user isn't logged in or this show (identified by its tmdbId) is in any of the current user's lists of shows, don't show them the buttons to add the show to one of their lists. */}
								{currentUser === null || userHasShow ? null : (
									<View>
										<View style={{ marginRight: 15, marginLeft: 15 }}>
											<DropDownPicker
												style={{ borderRadius: 25 }}
												open={profileShowDropdownOpen}
												value={profileShowDropdownValue}
												items={profileShowDropdownOptions}
												setOpen={setProfileShowDropdownOpen}
												setValue={setProfileShowDropdownValue}
												setItems={setProfileShowDropdownOptions}
												listMode='SCROLLVIEW'
												dropDownDirection='TOP'
												itemKey='label'
												placeholder='What do you want to do with this show?'
											/>
										</View>
										{profileShowDropdownValue === null ||
										profileShowDropdownValue === 'none' ? null : (
											<View style={styles.buttonContainer}>
												<TouchableOpacity
													style={styles.saveButton}
													onPress={() => setModalVisible(true)}
												>
													<Text style={styles.buttonText}>
														{profileShowDropdownValue === UserShowType.REC
															? 'Recommend '
															: profileShowDropdownValue === UserShowType.WATCH
																? 'Save '
																: 'Filter Out '}
														<Text style={styles.showName}>
															{singleShow.show.name}{' '}
														</Text>{' '}
														{profileShowDropdownValue === UserShowType.WATCH
															? 'to my Watch List'
															: null}
													</Text>
												</TouchableOpacity>
											</View>
										)}
									</View>
								)}
							</View>
						)}
					</View>
					{currentUser === null ? (
						<View style={styles.buttonContainer}>
							<TouchableOpacity
								style={styles.button}
								onPress={() =>
									router.push({
										pathname: '/login',
									})
								}
							>
								<Text style={styles.buttonText}>Log in / Sign up</Text>
							</TouchableOpacity>
						</View>
					) : null}
				</View>
			</ScrollView>
			<SaveShowModal
				modalVisible={saveShowModalVisible}
				setModalVisible={setSaveShowModalVisible}
				isOwnShow={isCurrentUser}
				onSaveAsIs={saveSingleShow}
				onGoToEdit={goToAddTags}
				username={!isCurrentUser ? userToView.username : null}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginBottom: 30,
		backgroundColor: '#EBECF0',
	},
	extra: {
		marginBottom: 25,
		marginLeft: 15,
	},
	containerInfo: {
		flexDirection: 'row',
		padding: 5,
		backgroundColor: '#340068',
		alignItems: 'center',
	},
	backButton: {
		padding: 8,
	},
	headingText: {
		fontWeight: '500',
		fontSize: 20,
		margin: 10,
	},
	usernameButton: {
		borderRadius: 25,
		elevation: 3,
		backgroundColor: '#4056F4',
	},
	recButton: {
		borderRadius: 25,
		backgroundColor: '#340068',
	},
	usernameText: {
		fontWeight: '500',
		fontSize: 20,
		letterSpacing: 0.25,
		margin: 4,
		color: 'white',
	},
	recText: {
		fontWeight: '500',
		fontSize: 20,
		letterSpacing: 0.25,
		marginBottom: 4,
		marginTop: 4,
		marginRight: 4,
		color: 'white',
	},
	showsList: {
		flex: 1,
	},
	image: {
		aspectRatio: 1,
		resizeMode: 'contain',
	},
	text: {
		textAlign: 'left',
		fontSize: 18,
		margin: 10,
	},
	cardContent: {
		flexDirection: 'row',
		marginLeft: 10,
	},
	tagsContent: {
		flexWrap: 'wrap',
		marginBottom: 10,
	},
	tvTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#36C9C6',
		marginTop: 5,
	},
	warningTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#ED6A5A',
		marginTop: 5,
	},
	tagText: {
		fontSize: 13.5,
		fontWeight: '500',
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
		marginLeft: 5,
		marginRight: 5,
	},
	saveButton: {
		backgroundColor: '#4056F4',
		padding: 8,
		borderRadius: 40,
		marginHorizontal: 3,
		marginTop: 5,
		marginBottom: 20,
	},
	showName: {
		color: '#ED6A5A',
	},
});

export default SingleShow;
