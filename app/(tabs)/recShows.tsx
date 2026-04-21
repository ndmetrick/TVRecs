import { useFirstRender } from '@/hooks/useFirstRender';
import { useAppData } from '@/lib/AppContext';
import { FollowingRec, RecCount, UserShow } from '@/lib/types';
import { useIsFocused, useScrollToTop } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Image,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const RecShows = () => {
	const [selectedItem, setSelectedItem] = useState(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [recShows, setRecShows] = useState<UserShow[]>([]);
	const [filter, setFilter] = useState(null);
	const [multipleRecInfo, setMultipleRecInfo] = useState<
		Record<number, RecCount>
	>({});
	const [loadedCount, setLoadedCount] = useState(0);
	const [noUserShows, setNoUserShows] = useState(false);
	// const [matchingRecs, setMatchingRecs] = useState(null)
	const [advancedSearch, setAdvancedSearch] = useState(false);
	const [loading, setLoading] = useState(true);
	const [headerHeight, setHeaderHeight] = useState(80);
	const [filterTabName, setFilterTabName] = useState('Filters(0)');
	const [showNum, setShowNum] = useState(0);
	const [recsTabName, setRecsTabName] = useState<string | null>(null);
	// const [renderItem, setRenderItem] = useState(null)
	const {
		followingRecs,
		following,
		followingMap,
		userShows,
		toWatch,
		seen,
		currentUser,
	} = useAppData();
	const [activeTab, setActiveTab] = useState<'recs' | 'filters'>('recs');

	const isFocused = useIsFocused();
	const firstRender = useFirstRender();
	const ref = useRef(null);

	const handleShowPress = (rec: FollowingRec) => {
		router.push({ pathname: '/show', params: { usershow_id: rec.id } });
	};

	const cancelFilters = () => {
		setFilter(null);
		setFilterTabName('Filters(0)');
		setAdvancedSearch(false);
	};

	// const displayFilters = () => {
	//     const filterWords = []
	//     const tagFilter =
	//       filter['chooseTags'] || filter['chooseAnyTags']
	//         ? 'chosen tags'
	//         : filter['nonZeroTags']
	//         ? 'has tags'
	//         : filter['nonZeroDescription']
	//         ? 'has description'
	//         : filter['tagsOrDescription']
	//         ? 'tags or description'
	//         : filter['descriptionValue']
	//         ? 'word in description'
	//         : null
	//     if (tagFilter) {
	//       filterWords.push(tagFilter)
	//     }
	//     if (filter['chooseStreamers']) {
	//       filterWords.push('chosen streamers')
	//     }
	//     if (filter['chooseMinRecs']) {
	//       filterWords.push('number of recs')
	//     }

	//     return filterWords.map((filter, key) => {
	//       return (
	//         <View key={key} style={styles.filterWord}>
	//           <Text style={styles.filterText}>{filter}</Text>
	//         </View>
	//       )
	//     })
	//   }

	useEffect(() => {
		const getRecShows = async () => {
			try {
				if ((!filter && followingRecs) || (filter && advancedSearch)) {
					// let shows = filter ? props.filterRecs : followingRecs;
					let shows = followingRecs;
					let height = filter ? 150 : 55;
					setHeaderHeight(height);

					// shows.sort(function (x, y) {
					//   return new Date(y.updatedAt) - new Date(x.updatedAt)
					// })

					// if they toggled to only see shows not on their profile, remove shows that appear on their rec, watch, and seen lists

					if (filter && advancedSearch && showNum === 0) {
						console.log(
							'i got in here in useEffect and these should be 0 or null or false',
							filter,
							showNum,
							advancedSearch,
						);
						setRecShows([]);
						setMultipleRecInfo({});
						const name = `Recs(0)`;
						const filterName = `Filters(${filter['filterCount']})`;
						setFilterTabName(filterName);
						setRecsTabName(name);
					} else {
						let visibleShows = [];
						const recCounts: Record<number, RecCount> = {};
						let loaded = 0;

						for (let recShow of shows) {
							const count = recCounts[recShow.show_id];
							if (!count) {
								// if the show is on the user's profile, in recs or to watch (filter out has already been filtered out on the back end), we want to save that info and have words ready to add to the note below the show. If the show is on their profile and they've checked that they don't want to see any shows on their profile, we shouldn't add it to visible shows.
								const myProfile = userShows.find(
									(userShow) => userShow.show.id === recShow.show_id,
								)
									? 'and you'
									: toWatch.find(
												(watchShow) => watchShow.show.id === recShow.show_id,
										  )
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
							if (loaded === shows.length || showNum === 0) {
								setLoading(false);
							} else {
								console.log(
									'shows.length is ',
									shows.length,
									'and loaded is ',
									loaded,
								);
							}
						}
						setLoadedCount(loaded);
						setRecShows(visibleShows);
						setMultipleRecInfo(recCounts);
						let name = `Recs(${visibleShows.length})`;
						setRecsTabName(name);
						let filterName = filter
							? `Filters(${filter['filterCount']})`
							: 'Filters(0)';
						setFilterTabName(filterName);
					}
					if (firstRender) {
						console.log('i am in the FIRST RENDER');
						setLoading(true);
					}
					if (
						!firstRender &&
						currentUser &&
						(!following.length || (advancedSearch && filter && showNum === 0))
					) {
						console.log('i am not in the first render but i am in here');
						setLoading(false);
						setRecsTabName('Recs(0)');
					}
				}

				return () => {
					setRecShows([]);
					setMultipleRecInfo({});
					setRecsTabName(null);
					setLoadedCount(0);
				};
			} catch (e) {
				console.log(e);
			}
		};
		// console.log(
		//   'just before async and refs are',
		//   ref.current,
		//   'filter is',
		//   filter,
		//   'advancedsearch is',
		//   advancedSearch
		// )

		getRecShows();
	}, [
		isFocused,
		following,
		followingRecs,
		noUserShows,
		filter,
		advancedSearch,
		showNum,
		firstRender,
		currentUser,
		userShows,
		toWatch,
		seen,
	]);

	useScrollToTop(ref);

	// const seeOtherRecers = (recInfo) => {
	//   setModalVisible(true)
	//   setSelectedItem(recInfo)
	// }

	const toggleNoUserShows = () => {
		setNoUserShows((previousState) => !previousState);
	};

	const flatlist = useMemo(() => {
		return (
			<FlatList
				numColumns={1}
				horizontal={false}
				data={recShows}
				style={{ flex: 1 }}
				renderItem={({ item }) => (
					<View style={styles.containerImage}>
						<TouchableOpacity
							onPress={() => handleShowPress(item)}
							// style={styles.catalogContainer}
						>
							<Image
								source={{ uri: item.show.image_url ?? undefined }}
								style={styles.image}
							/>
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
												{`${followingMap[item.user_id].username}`}
												<Text style={{ color: 'black' }}>
													{filter ? ` with these filters applied` : ''}{' '}
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
										{/* <TouchableOpacity
											onPress={() =>
												seeOtherRecers(
													multipleRecInfo[item.show_id].recommenders,
												)
											}
										> */}
										<Text style={{ color: 'blue' }}>
											{`${
												multipleRecInfo[item.show_id].num
											} people you follow ${
												filter ? `with these filters applied` : ''
											}`}
											<Text style={{ color: 'black' }}>
												{multipleRecInfo[item.show_id].myProfile}
											</Text>
										</Text>
										{/* </TouchableOpacity> */}
									</View>
								</View>
							)}
						</View>
					</View>
				)}
				keyExtractor={(item, index) => index.toString()}
			/>
		);
	}, [recShows, multipleRecInfo, followingMap, filter]);

	const Header = () => {
		return (
			<View style={styles.header}>
				{!noUserShows ? (
					<Text style={{ color: 'white' }}>
						Toggle to hide shows saved to your profile
					</Text>
				) : (
					<Text style={{ color: 'white' }}>
						Toggle to see shows saved to your profile
					</Text>
				)}

				<View style={{ alignItems: 'flex-start', flex: 1 }}>
					<Switch
						style={{
							marginBottom: 5,
							marginTop: 5,
						}}
						ios_backgroundColor='#3e3e3e'
						onValueChange={toggleNoUserShows}
						value={noUserShows}
					/>
				</View>
				{filter ? (
					<View>
						<Text style={{ fontWeight: 'bold', color: 'white' }}>
							The following {noUserShows ? 'additional ' : null}filters have
							been applied to this search:
						</Text>
						{/* <View style={styles.filterDisplay}>{displayFilters()}</View> */}
						<View style={{ alignItems: 'flex-end' }}>
							<TouchableOpacity
								style={{
									...styles.button,
									backgroundColor: '#008DD5',
									marginBottom: 5,
								}}
								onPress={() => cancelFilters()}
							>
								<Text style={{ ...styles.buttonText, color: 'white' }}>
									Cancel filters
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				) : null}
			</View>
		);
	};

	if (
		loading ||
		(filter &&
			((showNum > 0 && !recShows.length) ||
				(showNum > 0 && !noUserShows && loadedCount !== showNum)))
	) {
		console.log('i got in here to loading');
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' color='#5500dc' />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Header />
			<View style={styles.tabSwitcher}>
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
			</View>
			{activeTab === 'recs' ? (
				flatlist
			) : (
				<View style={styles.container}>
					<Text style={styles.text}>Filters coming soon</Text>
				</View>
			)}
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
});

export default RecShows;
