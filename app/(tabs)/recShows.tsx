import OtherRecerModal from '@/components/OtherRecerModal';
import RecsHeader from '@/components/RecsHeader';
import { ShowImagePlaceholder } from '@/components/SelectShow';
import { useFirstRender } from '@/hooks/useFirstRender';
import { useAppData } from '@/lib/AppContext';
import {
	AppliedShowFilters,
	RecCount,
	Recommender,
	SourcePage,
	UserShow,
} from '@/lib/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useScrollToTop } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Image,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const RecShows = () => {
	const [selectedItem, setSelectedItem] = useState<Recommender[] | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [recShows, setRecShows] = useState<UserShow[]>([]);
	const [filtersApplied, setFiltersApplied] = useState<boolean>(false);
	const [multipleRecInfo, setMultipleRecInfo] = useState<
		Record<number, RecCount>
	>({});
	// const [loadedCount, setLoadedCount] = useState(0);
	const [noUserShows, setNoUserShows] = useState(false);
	const [loading, setLoading] = useState(true);
	const [filterOpen, setFilterOpen] = useState(false);
	const [showsLength, setShowsLength] = useState(0);
	const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
	const [refreshing, setRefreshing] = useState(false);

	// applied filters — what actually affects the list
	const [appliedFilters, setAppliedFilters] = useState<AppliedShowFilters>({});
	const router = useRouter();

	useEffect(() => {
		setShowsLength(recShows.length);
	}, [recShows.length]);

	const {
		filteredFollowingRecs,
		following,
		followingMap,
		userShows,
		toWatch,
		seen,
		currentUser,
		tvTags,
		warningTags,
		loading: appLoading,
		refetchAll,
	} = useAppData();

	const firstRender = useFirstRender();
	const ref = useRef(null);

	const cancelFilters = () => {
		setAppliedFilters({});
	};

	const filteredRecs = useMemo(() => {
		let shows = filteredFollowingRecs;
		if (appliedFilters.hasTags) {
			shows = shows.filter((show) => show.tags.length > 0);
		}
		if (appliedFilters.hasDescription) {
			shows = shows.filter((show) => !!show.description);
		}
		if (appliedFilters.hasTagIds?.length) {
			shows = shows.filter((show) =>
				appliedFilters.hasTagIds?.every((id) =>
					show.tags.some((t) => t.id === id),
				),
			);
		}
		// does not have warning tags filtered out
		if (appliedFilters.notHasTagIds?.length) {
			shows = shows.filter((show) =>
				appliedFilters.notHasTagIds?.every(
					(id) => !show.tags.some((t) => t.id === id),
				),
			);
		}
		// if (appliedFilters.descriptionString) {
		// 	shows = shows.filter((show) =>
		// 		show.description?.includes(appliedFilters.descriptionString as string),
		// 	);
		// }
		setFiltersApplied(!!Object.keys(appliedFilters).length);
		return shows;
	}, [filteredFollowingRecs, appliedFilters]);

	useEffect(() => {
		setLoading(true);
		let shows = filtersApplied ? filteredRecs : filteredFollowingRecs;

		shows.sort(function (x, y) {
			return (
				new Date(y.updated_at).getTime() - new Date(x.updated_at).getTime()
			);
		});

		let visibleShows = [];
		const recCounts: Record<number, RecCount> = {};
		let loaded = 0;

		for (let recShow of filteredRecs) {
			const count = recCounts[recShow.show_id];
			if (!count) {
				// if the show is on the user's profile, in recs or to watch (filter out has already been filtered out on the back end), we want to save that info and have words ready to add to the note below the show. If the show is on their profile and they've checked that they don't want to see any shows on their profile, we shouldn't add it to visible shows.
				const myProfile = userShows.find(
					(userShow) => userShow.show.id === recShow.show_id,
				)
					? 'and you'
					: toWatch.find((watchShow) => watchShow.show.id === recShow.show_id)
						? 'and on your To Watch list'
						: null;
				if (noUserShows && myProfile !== null) {
					recCounts[recShow.show_id] = {
						num: 1,
						recommenders: [
							{
								userId: recShow.user_id,
								recShow,
							},
						],
						myProfile: myProfile,
					};
				} else {
					visibleShows.push(recShow);
					recCounts[recShow.show_id] = {
						num: 1,
						recommenders: [{ userId: recShow.user_id, recShow }],
						myProfile: myProfile,
					};
					loaded += 1;
				}
				// if this isn't the first instance of this show we've seen, don't load it to visible shows, but save the information about it so we can add it to multipleRecInfo, which keeps track of all the recommendations they want to see, including the other extras -- shows recommended multiple times by different people they follow.
			} else {
				recCounts[recShow.show_id].num++;
				recCounts[recShow.show_id].recommenders.push({
					userId: recShow.user_id,
					recShow,
				});
				loaded += 1;
			}
			if (loaded === shows.length) {
				setLoading(false);
			}
		}
		if (appliedFilters.minRecs) {
			visibleShows = visibleShows.filter(
				(s) => recCounts[s.show_id]?.num > (appliedFilters.minRecs as number),
			);
		}
		setRecShows(visibleShows);
		setMultipleRecInfo(recCounts);

		setLoading(false);

		return () => {
			setRecShows([]);
			setMultipleRecInfo({});
		};
	}, [
		filtersApplied,
		filteredFollowingRecs,
		noUserShows,
		firstRender,
		currentUser,
		userShows,
		toWatch,
		seen,
		filteredRecs,
		appliedFilters.minRecs,
	]);

	useScrollToTop(ref);

	const seeOtherRecers = (recInfo: Recommender[]) => {
		setModalVisible(true);
		setSelectedItem(recInfo);
	};

	const toggleNoUserShows = () => {
		setNoUserShows((previousState) => !previousState);
	};

	const flatlist = useMemo(() => {
		const onRefresh = async () => {
			setRefreshing(true);
			await refetchAll();
			setRefreshing(false);
		};
		const handleShowPress = async (show: UserShow) => {
			const user = followingMap[show.user_id];
			router.push({
				pathname: '/singleShow',
				params: {
					userShowString: JSON.stringify(show),
					userString: JSON.stringify(user),
				},
			});
		};

		if (loading || appLoading) {
			return (
				<View
					style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
				>
					<ActivityIndicator size='large' color='#5500dc' />
				</View>
			);
		}

		if (!currentUser) {
			return (
				<View style={styles.emptyState}>
					<MaterialCommunityIcons
						name='account-search'
						size={48}
						color='#9BC1BC'
					/>
					<Text style={styles.emptyStateText}>
						Create an account and follow some users to see their recommendations
						here
					</Text>
					<TouchableOpacity onPress={() => router.push('/login')}>
						<Text style={styles.emptyStateLink}>Sign up or log in →</Text>
					</TouchableOpacity>
				</View>
			);
		}

		if (!following.length || !filteredFollowingRecs.length) {
			return (
				<View style={styles.emptyState}>
					<MaterialCommunityIcons
						name='account-search'
						size={48}
						color='#9BC1BC'
					/>
					<Text style={styles.emptyStateText}>
						Recommendations will come your way as soon as you follow some{' '}
						{following.length ? 'more' : 'other'}
						users!
					</Text>
					<TouchableOpacity onPress={() => router.push('/(tabs)/searchUsers')}>
						<Text style={styles.emptyStateLink}>Find users to follow →</Text>
					</TouchableOpacity>
				</View>
			);
		}

		if (!recShows.length && Object.keys(appliedFilters).length) {
			return (
				<View style={styles.emptyState}>
					<MaterialCommunityIcons
						name='filter-off-outline'
						size={48}
						color='#9BC1BC'
					/>
					<Text style={styles.emptyStateText}>
						Unfortunately you have no recommended shows matching those filters
					</Text>
				</View>
			);
		}
		return (
			<FlatList
				numColumns={1}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor='#340068'
					/>
				}
				horizontal={false}
				data={recShows}
				style={{ flex: 1 }}
				renderItem={({ item }) => (
					<View style={styles.containerImage}>
						<TouchableOpacity
							onPress={() => handleShowPress(item)}
							// style={styles.catalogContainer}
						>
							{item.show.image_url && !imageErrors[item.show.id] ? (
								<Image
									source={{ uri: item.show.image_url }}
									style={styles.image}
									onError={() =>
										setImageErrors((prev) => ({
											...prev,
											[item.show.id]: true,
										}))
									}
								/>
							) : (
								<ShowImagePlaceholder
									name={item.show.name}
									style={styles.image}
								/>
							)}
						</TouchableOpacity>
						<View>
							{multipleRecInfo[item.show_id].num < 2 ? (
								<View>
									<Text style={{ fontWeight: 'bold' }}>{item.show.name}</Text>
									<View style={styles.rowContainer}>
										<Text>Recommended by </Text>
										<TouchableOpacity
											onPress={() => {
												console.log('navigate to user', item.user_id);
												router.push({
													pathname: '/otherUser',
													params: { uid: item.user_id },
												});
											}}
										>
											<Text style={{ color: 'blue' }}>
												{`${followingMap[item.user_id]?.username}`}
												<Text style={{ color: 'black' }}>
													{filtersApplied ? ` with these filters applied` : ''}{' '}
													{multipleRecInfo[item.show_id].myProfile}
												</Text>
											</Text>
										</TouchableOpacity>
									</View>
								</View>
							) : (
								<View>
									<Text style={{ fontWeight: 'bold' }}>{item.show.name}</Text>
									<View style={styles.rowContainer}>
										<Text>Recommended by </Text>
										<TouchableOpacity
											onPress={() =>
												seeOtherRecers(
													multipleRecInfo[item.show_id].recommenders,
												)
											}
										>
											<Text style={{ color: 'blue' }}>
												{`${
													multipleRecInfo[item.show_id].num
												} people you follow ${
													filtersApplied ? `with these filters applied` : ''
												}`}
												<Text style={{ color: 'black' }}>
													{multipleRecInfo[item.show_id].myProfile}
												</Text>
											</Text>
										</TouchableOpacity>
									</View>
								</View>
							)}
						</View>
					</View>
				)}
				keyExtractor={(item, index) => index.toString()}
			/>
		);
	}, [
		loading,
		appLoading,
		currentUser,
		following.length,
		filteredFollowingRecs.length,
		recShows,
		appliedFilters,
		refreshing,
		refetchAll,
		followingMap,
		router,
		imageErrors,
		multipleRecInfo,
		filtersApplied,
	]);

	if (loading || appLoading) {
		console.log('i got in here to loading', loading);
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' color='#5500dc' />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<RecsHeader
				noUserShows={noUserShows}
				toggleNoUserShows={toggleNoUserShows}
				cancelFilters={cancelFilters}
				appliedFilters={appliedFilters}
				setAppliedFilters={setAppliedFilters}
				filterOpen={filterOpen}
				setFilterOpen={setFilterOpen}
				showsLength={showsLength}
				sourcePage={SourcePage.REC_SHOWS}
			/>
			{/* <View style={styles.tabSwitcher}>
				<TouchableOpacity
					onPress={() => setActiveTab('recs')}
					style={[
						styles.tabButton,
						activeTab === 'recs' && styles.tabButtonActive,
					]}
				>
					<Text style={styles.tabButtonText}>{recsTabName}</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setActiveTab('filters')}
					style={[
						styles.tabButton,
						activeTab === 'filters' && styles.tabButtonActive,
					]}
				>
					<Text style={styles.tabButtonText}>Filters</Text>
				</TouchableOpacity>
			</View> */}
			{/* {activeTab === 'recs' ? ( */}
			<View style={styles.containerGallery}>
				{flatlist}
				{selectedItem && (
					<OtherRecerModal
						modalVisible={modalVisible}
						setModalVisible={setModalVisible}
						selectedItem={selectedItem}
						previous={SourcePage.REC_SHOWS}
					/>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	rowContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	containerInfo: {
		margin: 20,
	},
	containerGallery: {
		flex: 1,
	},
	containerImage: {
		flex: 1 / 3,
		marginBottom: 5,
	},
	image: {
		// flex: 1,
		aspectRatio: 2 / 3,
	},
	text: {
		margin: 5,
		textAlign: 'center',
		fontSize: 20,
	},
	button: {
		padding: 5,
		borderRadius: 15,
		marginHorizontal: 3,
		backgroundColor: '#340068',
		marginTop: 5,
	},
	toggleContainer: {
		padding: 10,
	},
	buttonText: {
		textAlign: 'center',
		fontSize: 16,
		margin: 5,
		fontWeight: '500',
		color: 'white',
	},
	filterWord: {
		padding: 3,
		borderRadius: 25,
		marginHorizontal: 3,
		backgroundColor: '#36C9C6',
		marginTop: 3,
	},
	filterText: { fontSize: 13.5, fontWeight: '400', textAlign: 'center' },
	filterDisplay: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 2,
	},
	header: {
		paddingTop: 7,
		backgroundColor: '#340068',
	},
	tabSwitcher: {
		flexDirection: 'row',
		backgroundColor: '#340068',
	},
	tabButton: {
		flex: 1,
		padding: 10,
		alignItems: 'center',
		opacity: 0.8,
	},
	tabButtonActive: {
		borderBottomWidth: 6,
		borderBottomColor: '#36C9C6',
		opacity: 1,
	},
	tabButtonText: {
		color: 'white',
		fontWeight: '500',
		fontSize: 14,
	},
	panelContainer: {
		backgroundColor: '#f9f9f9',
		padding: 14,
	},
	panelActionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 12,
	},
	panelClearButton: {
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	panelClearText: {
		fontSize: 13,
		color: '#888',
	},
	panelApplyButton: {
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 999,
		backgroundColor: '#340068',
	},
	panelApplyText: {
		fontSize: 13,
		color: 'white',
	},
	panelLabel: {
		fontSize: 13,
		color: '#666',
		marginBottom: 10,
	},
	emptyState: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 40,
		gap: 12,
	},
	emptyStateText: {
		fontSize: 16,
		color: '#888',
		textAlign: 'center',
		lineHeight: 24,
	},
	emptyStateLink: {
		fontSize: 16,
		color: '#4056F4',
		fontWeight: '500',
	},
});

export default RecShows;
