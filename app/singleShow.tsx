import { supabase } from '@/lib/supabase';
import * as Sentry from '@sentry/react-native';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from 'react-native';

import AppDropdownPicker from '@/components/AppDropdownPicker';
import OtherRecerModal from '@/components/OtherRecerModal';
import SaveShowModal from '@/components/SaveShowModal';
import { ShowImagePlaceholder } from '@/components/SelectShow';
import StreamingAndPurchase from '@/components/StreamingAndPurchase';
import { useAppData } from '@/lib/AppContext';
import { deleteUserShow } from '@/lib/api';
import { showErrorToast } from '@/lib/toast';
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
import { skipTagsAndSaveShowData } from '../lib/utils';

const SingleShow = () => {
	const { userShowString, userString } = useLocalSearchParams();
	const isDark = useColorScheme() === 'dark';
	const styles = makeStyles(isDark);

	const [user, setUser] = useState<UserProfile | null>(null);
	const [type, setType] = useState<UserShowType | null>(null);
	const [warningTags, setWarningTags] = useState<Tag[]>([]);
	const [tvTags, setTVTags] = useState<Tag[]>([]);
	const [isCurrentUser, setIsCurrentUser] = useState(false);
	const [userHasShow, setUserHasShow] = useState<UserShowType | null>(null);
	const [streamingAndPurchase, setStreamingAndPurchase] = useState(false);
	const [profileShowDropdownOpen, setProfileShowDropdownOpen] = useState(false);
	const [profileShowDropdownValue, setProfileShowDropdownValue] = useState<
		string | null
	>(null);
	const [loading, setLoading] = useState(true);
	const [profileShowDropdownOptions, setProfileShowDropdownOptions] = useState<
		{ label: string; value: string }[]
	>([]);
	const {
		currentUser,
		userShows,
		toWatch,
		seen,
		filteredFollowingRecs,
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
	const [singleShow, setSingleShow] = useState<UserShow | null>(null);
	const [userToView, setUserToView] = useState<UserProfile | null>(null);
	const [imageError, setImageError] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!userShowString || !userString) return;
		const userShow: UserShow = JSON.parse(userShowString as string);
		const viewUser: UserProfile = JSON.parse(userString as string);
		setSingleShow(userShow);
		setUserToView(viewUser);
		//profileShowOptions is the list of dropdown menu options for what the user can do with the show (delete it from their profile, add it to their profile in different places, etc)

		if (currentUser === null && viewUser !== null) {
			console.log('i got in here');
			setUser(viewUser);
			// setCountry(userInfo.country)
		} else {
			if (viewUser.id === currentUser?.id) {
				// if the current user is the same as the person who's page this is (it's their own profile page):
				setUser(currentUser);
				setIsCurrentUser(true);
				const profileShowOptions = [
					{ label: 'Delete it', value: 'delete' },
					{ label: 'Add or edit description/tags', value: 'tags' },
				];
				// If this show is already on the user's profile, depending on where it is, different options to move it will be added to the dropdown menu options.
				const otherDropdownOptions = userShows.find(
					(currentUserShow) => currentUserShow.show.id === userShow.show.id,
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
					: toWatch.find((watchShow) => watchShow.show.id === userShow.show.id)
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
				setProfileShowDropdownOptions(profileShowOptions);
			} else {
				setUser(viewUser);

				const hasShow = userShows.find(
					(currentUserShow) => currentUserShow.show.id === userShow.show.id,
				)
					? UserShowType.REC
					: toWatch.find((watchShow) => watchShow.show.id === userShow.show.id)
						? UserShowType.WATCH
						: seen.find((seenShow) => seenShow.show.id === userShow.show.id)
							? UserShowType.SEEN
							: null;
				if (hasShow) {
					setUserHasShow(hasShow);
				} else {
					setProfileShowDropdownOptions([
						{ label: 'Recommend it', value: UserShowType.REC },
						{
							label: 'Save it to my Watch list to remind me to watch it later',
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
			const myProfile = userShows.find((us) => us.show.id === userShow.show_id)
				? 'and you'
				: toWatch.find((watchShow) => watchShow.show.id === userShow.show_id)
					? 'and on your To Watch list'
					: null;
			const showId = userShow.show_id;
			let recCounts: Record<number, RecCount> = {};
			recCounts[showId] = {
				num: 1,
				recommenders: [{ userId: userShow.user_id, recShow: userShow }],
				myProfile,
			};

			filteredFollowingRecs.forEach((recShow) => {
				if (
					recShow.show_id === showId &&
					recShow.user_id !== userShow.user_id
				) {
					recCounts[showId].num++;
					recCounts[showId].recommenders.push({
						userId: recShow.user_id,
						recShow,
					});
				}
			});
			setMultipleRecInfo(recCounts);
		}
		const warnings = userShow.tags.filter((tag) => {
			return tag.type === 'warning';
		});
		const tv = userShow.tags.filter((tag) => {
			return tag.type === 'tv' || tag.type === 'unassigned';
		});
		setTVTags(tv);
		setWarningTags(warnings);
		setType(userShow.type);
		setLoading(false);
		return () => {
			console.log('RETURN');
			setStreamingAndPurchase(false);
			setUser(null);
			setType(null);
			setWarningTags([]);
			setTVTags([]);
			setIsCurrentUser(false);
			setMultipleRecInfo({});
			setModalVisible(false);
			setSaveShowModalVisible(false);
			setUserHasShow(null);
			setProfileShowDropdownValue(null);
			setLoading(true);
			setImageError(false);
		};
	}, [
		userShowString,
		isFocused,
		currentUser,
		userString,
		userShows,
		toWatch,
		seen,
		filteredFollowingRecs,
	]);

	const cancelSave = () => {
		setStreamingAndPurchase(false);
		setType(null);
		setProfileShowDropdownValue(null);
		setSaveShowModalVisible(false);
	};

	const deleteShow = async () => {
		if (!singleShow) return;
		setSaving(true);
		try {
			await deleteUserShow(supabase, singleShow.id);
			router.back();
			await refetchUserShows();
		} catch (err) {
			console.error(`Error deleting this show: ${err}`);
			showErrorToast('Error deleting and updating your account. Try again.');
			Sentry.captureException(err, {
				tags: { location: 'singleShow' },
			});
		} finally {
			setSaving(false);
		}
	};

	const chooseWhatToDoWithShow = (value: any) => {
		if (!singleShow) {
			return;
		}
		if (value === 'delete') {
			return Alert.alert('Are you sure you want to delete this show?', '', [
				{ text: 'Yes', onPress: () => deleteShow() },
				{
					text: 'Cancel',
				},
			]);
		}
		if (value === 'tags') {
			return router.push({
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
			});
		}
		if (
			value === UserShowType.REC ||
			value === UserShowType.WATCH ||
			value === UserShowType.SEEN
		) {
			setType(value);
			setSaveShowModalVisible(true);
		}
	};

	if (!singleShow || (!isCurrentUser && !userToView))
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' color='#5500dc' />
			</View>
		);

	const saveSingleShow = (keepCurrentTagsAndDesc: boolean) => {
		if (!currentUser) {
			router.push({ pathname: '/login' });
		} else {
			console.log('SAVE SINGLE SHOW');
			setSaving(true);
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
				setSaving,
				keepCurrentTagsAndDesc,
			);
		}
	};

	const goToAddTags = (keepCurrentTagsAndDesc: boolean) => {
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

	if (loading || !user) {
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
								<Text style={styles.recText}>
									{type === 'rec'
										? ' recommendation:'
										: type === 'watch'
											? ' show to watch:'
											: ' show to filter out'}{' '}
								</Text>
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
											pathname: '/otherUser',
											params: {
												uid: user.id,
												userString: JSON.stringify(user),
											},
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
				contentContainerStyle={{ paddingBottom: 30 }}
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
				<View style={{ gap: 8 }}>
					{singleShow.show.image_url && !imageError ? (
						<Image
							style={styles.image}
							source={{ uri: singleShow.show.image_url }}
							onError={() => setImageError(true)}
						/>
					) : (
						<ShowImagePlaceholder
							name={singleShow.show.name}
							style={styles.image}
						/>
					)}
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
						profileShowDropdownValue !== 'none' ? null : (
							<TouchableOpacity
								style={[
									styles.streamingPill,
									streamingAndPurchase && styles.streamingPillActive,
								]}
								onPress={() => setStreamingAndPurchase(!streamingAndPurchase)}
							>
								<Text style={[styles.streamingPillText]}>
									{streamingAndPurchase
										? 'Hide streaming & overview ↑'
										: 'Streaming & overview ↓'}
								</Text>
							</TouchableOpacity>
						)}
						{streamingAndPurchase && singleShow.show.tmdb_id ? (
							<StreamingAndPurchase showId={singleShow.show.tmdb_id} />
						) : null}
						{isCurrentUser ? (
							<View
								style={{
									margin: 15,
								}}
							>
								<AppDropdownPicker
									labelStyle={{
										flexWrap: 'wrap',
										fontSize: 15,
										margin: 15,
										marginLeft: 10,
									}}
									open={profileShowDropdownOpen}
									value={profileShowDropdownValue}
									items={profileShowDropdownOptions}
									setOpen={setProfileShowDropdownOpen}
									setValue={setProfileShowDropdownValue}
									onChangeValue={(value) => {
										if (value) chooseWhatToDoWithShow(value);
									}}
									setItems={setProfileShowDropdownOptions}
									listItemContainerStyle={{
										height: 'auto',
										minHeight: 44,
										paddingVertical: 10,
										paddingHorizontal: 16,
									}}
									listItemLabelStyle={{
										flexWrap: 'wrap',
										fontSize: 15,
										lineHeight: 20,
									}}
									listMode='SCROLLVIEW'
									dropDownDirection='TOP'
									itemKey='label'
									placeholder='What do you want to do with this show?'
								/>
								{/* {profileShowDropdownValue === 'delete' ? (
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
								) : null} */}
							</View>
						) : (
							<View>
								{/* If the user isn't logged in or this show (identified by its tmdbId) is in any of the current user's lists of shows, don't show them the buttons to add the show to one of their lists. */}
								{userHasShow ? null : (
									<View>
										<View style={{ marginRight: 15, marginLeft: 15 }}>
											<AppDropdownPicker
												open={profileShowDropdownOpen}
												value={profileShowDropdownValue}
												items={profileShowDropdownOptions}
												setOpen={setProfileShowDropdownOpen}
												setValue={setProfileShowDropdownValue}
												setItems={setProfileShowDropdownOptions}
												onChangeValue={(value) => {
													if (value) chooseWhatToDoWithShow(value);
												}}
												labelStyle={{
													flexWrap: 'wrap',
													fontSize: 15,
													margin: 15,
													marginLeft: 10,
												}}
												style={{
													borderRadius: 25,
												}}
												listMode='SCROLLVIEW'
												dropDownDirection='TOP'
												itemKey='label'
												placeholder='What do you want to do with this show?'
											/>
										</View>
										{/* {profileShowDropdownValue === null ||
										profileShowDropdownValue === 'none' ? null : (
											<View style={styles.buttonContainer}>
												<TouchableOpacity
													style={styles.saveButton}
													onPress={() => setSaveShowModalVisible(true)}
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
										)} */}
									</View>
								)}
							</View>
						)}
					</View>
				</View>
			</ScrollView>
			{saving && (
				<Modal transparent animationType='none' statusBarTranslucent>
					<View style={styles.savingOverlay}>
						<ActivityIndicator size='large' color='white' />
					</View>
				</Modal>
			)}
			{(isCurrentUser || userToView?.username) && (
				<SaveShowModal
					modalVisible={saveShowModalVisible}
					setModalVisible={setSaveShowModalVisible}
					isOwnShow={isCurrentUser}
					onSaveAsIs={saveSingleShow}
					onGoToEdit={goToAddTags}
					username={!isCurrentUser ? userToView!.username : null}
					showHasTagsOrDescription={
						!!(singleShow.description || singleShow.tags.length)
					}
					cancelSave={cancelSave}
				/>
			)}
		</View>
	);
};

const makeStyles = (isDark: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isDark ? '#aaaaaa' : '#f5f5f5',
		},
		extra: {
			marginBottom: 25,
			marginHorizontal: 15,
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
			color: isDark ? '#dddddd' : 'white',
		},
		recText: {
			fontWeight: '500',
			fontSize: 20,
			letterSpacing: 0.25,
			marginBottom: 4,
			marginTop: 4,
			marginRight: 4,
			color: isDark ? '#cccccc' : 'white',
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
			color: isDark ? '#cccccc' : 'white',
		},
		buttonContainer: {
			flexDirection: 'row',
			justifyContent: 'center',
		},
		button: {
			padding: 10,
			borderRadius: 25,
			marginHorizontal: 3,
			backgroundColor: '#340068',
			marginTop: 5,
			marginLeft: 5,
			marginRight: 10,
		},
		savingOverlay: {
			...StyleSheet.absoluteFillObject,
			backgroundColor: 'rgba(0,0,0,0.4)',
			justifyContent: 'center',
			alignItems: 'center',
			zIndex: 999,
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
		streamingPill: {
			alignSelf: 'center',
			paddingVertical: 8,
			paddingHorizontal: 18,
			borderRadius: 999,
			backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#340068',
			marginVertical: 10,
		},
		streamingPillActive: {
			backgroundColor: '#7B5DB5',
		},
		streamingPillText: {
			fontSize: 15,
			fontWeight: '500',
			color: isDark ? 'rgba(255,255,255,0.7)' : 'white',
		},
	});

export default SingleShow;
