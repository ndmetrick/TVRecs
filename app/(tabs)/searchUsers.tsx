import PickUserTagsContent from '@/components/PickUserTagsContent';
import SelectShow from '@/components/SelectShow';
import ShowTagPicker from '@/components/ShowTagPicker';
import { findShowWithTmdbId, getMatchingUsers } from '@/lib/api';
import { useAppData } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { showErrorToast } from '@/lib/toast';
import {
	ProfileTagCategory,
	ProfileTagFilter,
	Show,
	Tag,
	TagType,
	UserProfile,
	UserSearchFilterResults,
	UserSearchFilters,
	UserSearchResultsWithDetails,
} from '@/lib/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

enum PanelType {
	profileTags = 'profileTags',
	shows = 'shows',
	showTags = 'showTags',
}

type SearchMode = 'username' | 'filters';
type FilterPanel = 'summary' | 'profileTags' | 'shows' | 'showTags';
type SearchState = 'pre' | 'post';

const preferenceTagsText = `Find users by the tags they've picked to describe what kind of shows they like. Tap once to find users who like this, tap again to find users who avoid it, tap a third time to clear:`;
const warningTagsText =
	'Find users who have marked these as deal breakers or triggers:';
const descTagsText =
	'Find users who describe themselves as this kind of TV watcher:';

const generalShowTagsText = 'Pick tags to include in filter:';
// const warningShowTagsText = 'Pick warning tags to filter out:';

const SearchUsers = () => {
	const [excludeFollowed, setExcludeFollowed] = useState(false);
	const [searchMode, setSearchMode] = useState<SearchMode>('username');
	const [activePanel, setActivePanel] = useState<FilterPanel>('summary');
	const [searchState, setSearchState] = useState<SearchState>('pre');
	const [selectedWarning, setSelectedWarning] = useState<
		Record<number, boolean>
	>({});
	const [selectedDesc, setSelectedDesc] = useState<Record<number, boolean>>({});
	const [selectedPreference, setSelectedPreference] = useState<
		Record<number, 'like' | 'dislike'>
	>({});

	const [profileTagMatch, setProfileTagMatch] = useState<'any' | 'all'>('all');
	const [showMatch, setShowMatch] = useState<'any' | 'all'>('all');

	const [showTagMatch, setShowTagMatch] = useState<'any' | 'all'>('all');

	const matchStateMap = {
		profileTags: profileTagMatch,
		shows: showMatch,
		showTags: showTagMatch,
	};

	const setMatchMap: {
		[key: string]: React.Dispatch<React.SetStateAction<'any' | 'all'>>;
	} = {
		profileTags: setProfileTagMatch,
		shows: setShowMatch,
		showTags: setShowTagMatch,
	};

	const [profileTagFilters, setProfileTagFilters] = useState<ProfileTagFilter>(
		{},
	);
	const [selectedShowTags, setSelectedShowTags] = useState<
		Record<string, boolean>
	>({});

	const [selectedShows, setSelectedShows] = useState<Show[]>([]);

	const [results, setResults] = useState<UserSearchFilterResults | null>(null);
	const [loading, setLoading] = useState(false);

	const { followingMap, tagMap } = useAppData();

	const chosenShowTagIds = useMemo(() => {
		const chosen: number[] = [];
		for (const tagId in selectedShowTags) {
			if (selectedShowTags[tagId] === true) {
				chosen.push(Number(tagId));
			}
		}
		return chosen;
	}, [selectedShowTags]);

	const chosenWarningTags = useMemo(() => {
		return Object.keys(selectedWarning).map((tagId) => tagMap[tagId]);
	}, [selectedWarning, tagMap]);

	const chosenPreferenceTags = useMemo(() => {
		return Object.keys(selectedPreference).map((tagId) => tagMap[tagId]);
	}, [selectedPreference, tagMap]);

	const chosenDescTags = useMemo(() => {
		return Object.keys(selectedDesc).map((tagId) => tagMap[tagId]);
	}, [selectedDesc, tagMap]);

	const clearSection = (type: PanelType) => {
		if (type === 'profileTags') {
			setSelectedWarning({});
			setSelectedPreference({});
			setSelectedDesc({});
			setProfileTagMatch('all');
			setProfileTagFilters({});
		} else if (type === 'shows') {
			setSelectedShows([]);
			setShowMatch('all');
		} else {
			setSelectedShowTags({});
			setShowTagMatch('all');
		}
	};

	const getPillColor = (tag: Tag) => {
		switch (tag.type) {
			case TagType.WARNING:
				return '#E24E1B';
			case TagType.PROFILE_DESCRIBE:
				return '#6B7FD4';
			case TagType.PROFILE:
			case TagType.UNASSIGNED:
				return selectedPreference[tag.id] === 'dislike' ? '#B05080' : '#008DD5';
		}
	};

	const getResultLabelColor = (
		type: 'like' | 'dislike' | 'warning' | 'rec' | 'desc' | 'showTag',
	) => {
		switch (type) {
			case 'like':
				return '#008DD5';
			case 'dislike':
				return '#B05080';
			case 'warning':
				return '#E24E1B';
			case 'desc':
				return '#6B7FD4';
			case 'rec':
				return '#340068';
			case 'showTag':
				return '#36C9C6';
		}
	};

	const displayedUsers = useMemo(() => {
		console.log('got back into this useMemo');
		if (!results) return null;

		const usersArray: UserProfile[] = Object.values(results.users);
		const profileTagMatchIds: string[] = Object.keys(results.profileTagMatches);
		const showMatchIds: string[] = Object.keys(results.showMatches);
		const showTagMatchIds: string[] = Object.keys(results.showTagMatches);

		console.log('usersArraylength', usersArray.length);

		if (usersArray.length === 0) {
			return null;
		}

		const profileTagsInFilter = Object.keys(profileTagFilters).length;
		const showsInFilter = selectedShows.length;
		const showTagsInFilter = chosenShowTagIds.length;

		if (!profileTagsInFilter && !showsInFilter && !showTagsInFilter) {
			setSearchState('pre');
		}

		console.log(
			'profileTagsInFilter',
			profileTagsInFilter,
			'shows',
			showsInFilter,
			'showTags',
			showTagsInFilter,
		);

		let filteredProfileTagsMatchUserIds =
			!profileTagsInFilter || !profileTagMatchIds.length
				? []
				: profileTagMatchIds;

		if (filteredProfileTagsMatchUserIds && profileTagMatch === 'all') {
			filteredProfileTagsMatchUserIds = Object.entries(
				results.profileTagMatches,
			)
				.filter((match) => match[1].length === profileTagsInFilter)
				.map((match) => match[0]);
		}

		let filteredShowMatchUserIds =
			!showsInFilter || !showMatchIds ? [] : showMatchIds;

		if (filteredShowMatchUserIds && showMatch === 'all') {
			filteredShowMatchUserIds = Object.entries(results.showMatches)
				.filter((match) => match[1].length === showsInFilter)
				.map((match) => match[0]);
		}

		let filteredShowTagMatchUserIds =
			!showTagsInFilter || !showTagMatchIds ? [] : showTagMatchIds;

		if (filteredShowTagMatchUserIds && showTagMatch === 'all') {
			filteredShowTagMatchUserIds = Object.entries(results.showTagMatches)
				.filter((match) => match[1].length === showTagsInFilter)
				.map((match) => match[0]);
		}

		console.log(
			'filteredProfileTagsMatchUserIds',
			filteredProfileTagsMatchUserIds.length,
		);

		console.log('filteredShowMatchUserIds', filteredShowMatchUserIds.length);

		const activeSets = [
			profileTagsInFilter ? new Set(filteredProfileTagsMatchUserIds) : null,
			showsInFilter ? new Set(filteredShowMatchUserIds) : null,
			showTagsInFilter ? new Set(filteredShowTagMatchUserIds) : null,
		].filter(Boolean) as Set<string>[];

		console.log('activesets', activeSets.length);

		if (activeSets.length === 0) return null;
		const intersected = activeSets.reduce(
			(a, b) => new Set([...a].filter((id) => b.has(id))),
		);

		const finalUserIds = Array.from(intersected).filter((userId) =>
			excludeFollowed ? !followingMap[userId] : true,
		);

		// link users with strings detailing how they fulfil search requests
		let resultsWithDetails: Record<string, UserSearchResultsWithDetails> = {};
		finalUserIds.forEach((userId) => {
			let likeTags: string[] = [];
			let warningTags: string[] = [];
			let dislikeTags: string[] = [];
			let describeTags: string[] = [];
			if (profileTagsInFilter) {
				results.profileTagMatches[userId].forEach((tag) => {
					if (tag.category === ProfileTagCategory.LIKE)
						likeTags.push(tagMap[tag.tag_id].name);
					else if (tag.category === ProfileTagCategory.DESCRIBE)
						describeTags.push(tagMap[tag.tag_id].name);
					else {
						const t = tagMap[tag.tag_id];
						if (t.type === TagType.WARNING) warningTags.push(t.name);
						else dislikeTags.push(t.name);
					}
				});
			}

			resultsWithDetails[userId] = {
				user: results.users[userId],
				showTagsString: showTagsInFilter
					? results.showTagMatches[userId]
							.map((tag) => tagMap[tag.tag_id].name)
							.join(', ')
					: undefined,
				showNamesString: showsInFilter
					? results.showMatches[userId].map((show) => show.name).join(', ')
					: undefined,
				profileTagsLikeString: likeTags.length
					? likeTags.join(', ')
					: undefined,
				profileTagsWarningString: warningTags.length
					? warningTags.join(', ')
					: undefined,
				profileTagsDislikeString: dislikeTags.length
					? dislikeTags.join(', ')
					: undefined,
				profileTagsDescribeString: describeTags.length
					? describeTags.join(', ')
					: undefined,
			};
		});
		console.log(
			'resultsWithDetails',
			JSON.stringify(Object.values(resultsWithDetails)),
		);
		return resultsWithDetails;
	}, [
		results,
		profileTagFilters,
		selectedShows,
		chosenShowTagIds,
		profileTagMatch,
		showMatch,
		showTagMatch,
		excludeFollowed,
		followingMap,
		tagMap,
	]);

	const handleShow = async (
		name: string,
		_url: string,
		id: string | number,
		_added: boolean,
	) => {
		if (name.length) {
			try {
				const newShow = await findShowWithTmdbId(supabase, String(id));
				if (newShow) {
					setSelectedShows((prev) => {
						if (prev.find((show) => show.tmdb_id === newShow.tmdb_id))
							return prev;
						return [...prev, newShow];
					});
				} else {
					Alert.alert('No users have added that show yet', '', [
						{ text: 'OK' },
					]);
				}
			} catch (err) {
				console.log(`Error handling show added to search: ${err}`);
				Sentry.captureException(err, {
					tags: { location: 'adding show in search' },
				});
			}
		}
	};

	const handleSearch = async () => {
		setLoading(true);
		try {
			const showTmdb = selectedShows.length
				? selectedShows.map((show) => show.tmdb_id ?? '')
				: undefined;

			const pfTagFilters: ProfileTagFilter = [
				...chosenWarningTags,
				...chosenPreferenceTags,
				...chosenDescTags,
			].reduce((accum: ProfileTagFilter, curr: Tag) => {
				accum[curr.id] =
					curr.type === TagType.WARNING
						? ProfileTagCategory.DISLIKE
						: curr.type === TagType.PROFILE_DESCRIBE
							? ProfileTagCategory.DESCRIBE
							: (selectedPreference[curr.id] as ProfileTagCategory);
				return accum;
			}, {});

			setProfileTagFilters(pfTagFilters);

			const filters: UserSearchFilters = {
				profileTagFilters: pfTagFilters,
				showTmdb,
				showTagIds: chosenShowTagIds,
			};
			const data = await getMatchingUsers(supabase, filters);
			setResults(data);
		} catch (err) {
			console.error(`Error searching for users: ${JSON.stringify(err)}`);
			showErrorToast('There was an error searching for users');
			Sentry.captureException(err, {
				tags: { location: 'searchUsers handleSearch' },
			});
		} finally {
			setLoading(false);
		}
	};

	// const getProfileTagGroups = ()

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				{/* Exclude toggle row */}
				<View style={styles.headerTop}>
					<Switch
						value={excludeFollowed}
						onValueChange={setExcludeFollowed}
						trackColor={{ false: '#3e3e3e', true: '#36C9C6' }}
						thumbColor='white'
						ios_backgroundColor='#3e3e3e'
					/>
					<View>
						<Text style={styles.excludeLabel}>Exclude users I follow</Text>
						<Text style={styles.excludeSub}>Only show unfollowed users</Text>
					</View>
				</View>

				{/* Mode tabs */}
				<View style={styles.modeTabs}>
					{(['username', 'filters'] as SearchMode[]).map((mode) => (
						<TouchableOpacity
							key={mode}
							style={[
								styles.modeTab,
								searchMode === mode && styles.modeTabActive,
							]}
							onPress={() => setSearchMode(mode)}
						>
							<Text
								style={[
									styles.modeTabText,
									searchMode === mode && styles.modeTabTextActive,
								]}
							>
								{mode}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Filter pill row — only in filters mode */}
				{searchMode === 'filters' && searchState === 'pre' && (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.pillRow}
						contentContainerStyle={styles.pillRowContent}
					>
						{(
							['summary', 'profileTags', 'shows', 'showTags'] as FilterPanel[]
						).map((panel) => (
							<TouchableOpacity
								key={panel}
								style={[
									styles.filterPill,
									activePanel === panel &&
										panel === 'summary' &&
										styles.filterPillActive,
									activePanel === panel &&
										panel !== 'summary' &&
										styles.filterPillOpen,
								]}
								onPress={() => setActivePanel(panel)}
							>
								<Text
									style={[
										styles.filterPillText,
										activePanel === panel &&
											panel !== 'summary' &&
											styles.filterPillOpenText,
										activePanel === panel &&
											panel === 'summary' &&
											styles.filterPillActiveText,
									]}
								>
									{panel === 'profileTags'
										? 'profile tags'
										: panel === 'showTags'
											? 'show tags'
											: panel}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				)}

				{/* Any/all */}
				{searchMode === 'filters' &&
					searchState === 'pre' &&
					activePanel !== 'summary' && (
						<View style={styles.anyAllRow}>
							<TouchableOpacity
								onPress={() => setMatchMap[activePanel]('all')}
								style={[
									styles.anyAllBtn,
									matchStateMap[activePanel] === 'all' && styles.anyAllBtnOn,
								]}
							>
								<Text
									style={
										matchStateMap[activePanel] === 'all'
											? styles.anyAllBtnOnText
											: styles.anyAllBtnText
									}
								>
									all of
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.anyAllBtn,
									matchStateMap[activePanel] === 'any' && styles.anyAllBtnOn,
								]}
								onPress={() => setMatchMap[activePanel]('any')}
							>
								<Text
									style={
										matchStateMap[activePanel] === 'any'
											? styles.anyAllBtnOnText
											: styles.anyAllBtnText
									}
								>
									any of
								</Text>
							</TouchableOpacity>
						</View>
					)}

				{/* Post-search compact bar */}
				{searchMode === 'filters' && searchState === 'post' && (
					<View style={styles.compactBar}>
						<View style={styles.compactRows}>
							{/* profile tags row */}
							{[
								...chosenDescTags,
								...chosenPreferenceTags,
								...chosenWarningTags,
							].length > 0 && (
								<View style={styles.compactRow}>
									<View style={styles.compactRowInner}>
										<View style={styles.aaSection}>
											{[
												...chosenDescTags,
												...chosenPreferenceTags,
												...chosenWarningTags,
											].length > 1 ? (
												<TouchableOpacity
													style={styles.aaSegment}
													onPress={() =>
														setProfileTagMatch((prev) =>
															prev === 'all' ? 'any' : 'all',
														)
													}
												>
													<View
														style={[
															styles.aaOptWrap,
															profileTagMatch === 'all' && styles.aaOptWrapOn,
														]}
													>
														<Text
															style={[
																styles.aaOpt,
																profileTagMatch === 'all' && styles.aaOptOn,
															]}
														>
															all
														</Text>
													</View>
													<View style={styles.aaDivider} />
													<View
														style={[
															styles.aaOptWrap,
															profileTagMatch === 'any' && styles.aaOptWrapOn,
														]}
													>
														<Text
															style={[
																styles.aaOpt,
																profileTagMatch === 'any' && styles.aaOptOn,
															]}
														>
															any
														</Text>
													</View>
												</TouchableOpacity>
											) : (
												<View style={styles.aaPlaceholder} />
											)}
										</View>

										<View style={styles.aaSectionDivider} />
										<View style={styles.labelSegment}>
											<Text style={styles.compactRowLabel}>
												profile tags (
												<Text style={styles.compactRowCount}>
													{
														[
															...chosenDescTags,
															...chosenPreferenceTags,
															...chosenWarningTags,
														].length
													}
												</Text>
												)
											</Text>
											<TouchableOpacity
												onPress={() => clearSection(PanelType.profileTags)}
											>
												<Text style={styles.compactRowX}>✕</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							)}
							{/* shows row */}
							{selectedShows.length > 0 && (
								<View style={styles.compactRow}>
									<View style={styles.compactRowInner}>
										<View style={styles.aaSection}>
											{selectedShows.length > 1 ? (
												<TouchableOpacity
													style={styles.aaSegment}
													onPress={() =>
														setShowMatch((prev) =>
															prev === 'all' ? 'any' : 'all',
														)
													}
												>
													<View
														style={[
															styles.aaOptWrap,
															showMatch === 'all' && styles.aaOptWrapOn,
														]}
													>
														<Text
															style={[
																styles.aaOpt,
																showMatch === 'all' && styles.aaOptOn,
															]}
														>
															all
														</Text>
													</View>
													<View style={styles.aaDivider} />
													<View
														style={[
															styles.aaOptWrap,
															showMatch === 'any' && styles.aaOptWrapOn,
														]}
													>
														<Text
															style={[
																styles.aaOpt,
																showMatch === 'any' && styles.aaOptOn,
															]}
														>
															any
														</Text>
													</View>
												</TouchableOpacity>
											) : (
												<View style={styles.aaPlaceholder} />
											)}
										</View>

										<View style={styles.aaSectionDivider} />
										<View style={styles.labelSegment}>
											<Text style={styles.compactRowLabel}>
												recs (
												<Text style={styles.compactRowCount}>
													{selectedShows.length}
												</Text>
												)
											</Text>
											<TouchableOpacity
												onPress={() => clearSection(PanelType.shows)}
											>
												<Text style={styles.compactRowX}>✕</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							)}
							{/* show tags row */}
							{chosenShowTagIds.length > 0 && (
								<View style={styles.compactRow}>
									<View style={styles.compactRowInner}>
										<View style={styles.aaSection}>
											{chosenShowTagIds.length > 1 ? (
												<TouchableOpacity
													style={styles.aaSegment}
													onPress={() =>
														setShowTagMatch((prev) =>
															prev === 'all' ? 'any' : 'all',
														)
													}
												>
													<View
														style={[
															styles.aaOptWrap,
															showTagMatch === 'all' && styles.aaOptWrapOn,
														]}
													>
														<Text
															style={[
																styles.aaOpt,
																showTagMatch === 'all' && styles.aaOptOn,
															]}
														>
															all
														</Text>
													</View>
													<View style={styles.aaDivider} />
													<View
														style={[
															styles.aaOptWrap,
															showTagMatch === 'any' && styles.aaOptWrapOn,
														]}
													>
														<Text
															style={[
																styles.aaOpt,
																showTagMatch === 'any' && styles.aaOptOn,
															]}
														>
															any
														</Text>
													</View>
												</TouchableOpacity>
											) : (
												<View style={styles.aaPlaceholder} />
											)}
										</View>
										<View style={styles.aaSectionDivider} />
										<View style={styles.labelSegment}>
											<Text style={styles.compactRowLabel}>
												show tags (
												<Text style={styles.compactRowCount}>
													{chosenShowTagIds.length}
												</Text>
												)
											</Text>
											<TouchableOpacity
												onPress={() => clearSection(PanelType.showTags)}
											>
												<Text style={styles.compactRowX}>✕</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							)}
						</View>
						<View style={styles.adjustCol}>
							<TouchableOpacity
								style={styles.adjustBtn}
								onPress={() => setSearchState('pre')}
							>
								<Text style={styles.adjustBtnText}>adjust filters ↑</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}
			</View>

			<ScrollView
				style={styles.body}
				keyboardShouldPersistTaps='handled'
				showsVerticalScrollIndicator={false}
			>
				{/* Username mode */}
				{searchMode === 'username' && <View>{/* TextInput + results  */}</View>}

				{/* Filters mode — summary panel */}
				{searchMode === 'filters' &&
					activePanel === 'summary' &&
					searchState === 'pre' && (
						<View>
							{/* empty state */}
							{[
								...chosenDescTags,
								...chosenPreferenceTags,
								...chosenWarningTags,
								...selectedShows,
								...chosenShowTagIds,
							].length < 1 && (
								<Text style={styles.emptyMsg}>
									{`Tap a filter above to add specific tags or shows to filter users by (i.e. you can search for someone who recommended a particular show or shows, or has particular tags on their profiles or on shows they recommend. Selections save as you pick — return to summary when ready to search.`}
								</Text>
							)}

							{/* Profile Tags: */}
							{[
								...chosenDescTags,
								...chosenPreferenceTags,
								...chosenWarningTags,
							].length > 0 && (
								<View style={styles.summarySection}>
									<View style={styles.summarySectionHeader}>
										<Text style={styles.summarySectionLabel}>PROFILE TAGS</Text>
										<TouchableOpacity
											onPress={() => clearSection(PanelType.profileTags)}
										>
											<Text style={styles.summaryClearSection}>x</Text>
										</TouchableOpacity>
									</View>
									{[
										...chosenDescTags,
										...chosenPreferenceTags,
										...chosenWarningTags,
									].length > 1 && (
										<View style={styles.summaryAnyAllRow}>
											<TouchableOpacity
												style={[
													styles.summaryAnyAllBtn,
													profileTagMatch === 'all' &&
														styles.summaryAnyAllBtnOn,
												]}
												onPress={() => setProfileTagMatch('all')}
											>
												<Text
													style={
														profileTagMatch === 'all'
															? styles.summaryAnyAllBtnOnText
															: styles.summaryAnyAllBtnText
													}
												>
													all of
												</Text>
											</TouchableOpacity>
											<TouchableOpacity
												style={[
													styles.summaryAnyAllBtn,
													profileTagMatch === 'any' &&
														styles.summaryAnyAllBtnOn,
												]}
												onPress={() => setProfileTagMatch('any')}
											>
												<Text
													style={
														profileTagMatch === 'any'
															? styles.summaryAnyAllBtnOnText
															: styles.summaryAnyAllBtnText
													}
												>
													any of
												</Text>
											</TouchableOpacity>
										</View>
									)}
									<View style={styles.summaryPillRow}>
										{[
											...chosenDescTags,
											...chosenPreferenceTags,
											...chosenWarningTags,
										].map((tag) => (
											<TouchableOpacity
												key={tag.id}
												style={[
													styles.summaryTagPill,
													{ backgroundColor: getPillColor(tag) },
												]}
												onPress={() => {
													if (tag.type === 'warning') {
														setSelectedWarning((prev) => {
															const selected = { ...prev };
															delete selected[tag.id];
															return selected;
														});
													} else if (tag.type === TagType.PROFILE_DESCRIBE) {
														setSelectedDesc((prev) => {
															const selected = { ...prev };
															delete selected[tag.id];
															return selected;
														});
													} else {
														setSelectedPreference((prev) => {
															const selected = { ...prev };
															delete selected[tag.id];
															return selected;
														});
													}
												}}
											>
												<Text
													style={[
														styles.summaryTagPillText,
														{ color: 'white' },
													]}
												>
													{tag.name} ✕
												</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>
							)}

							{/* Recommended shows: */}
							{selectedShows.length > 0 && (
								<View style={styles.summarySection}>
									<View style={styles.summarySectionHeader}>
										<Text style={styles.summarySectionLabel}>RECOMMENDS</Text>
										<TouchableOpacity
											onPress={() => clearSection(PanelType.shows)}
										>
											<Text style={styles.summaryClearSection}>x</Text>
										</TouchableOpacity>
									</View>
									{selectedShows.length > 1 && (
										<View style={styles.summaryAnyAllRow}>
											<TouchableOpacity
												style={[
													styles.summaryAnyAllBtn,
													showMatch === 'all' && styles.summaryAnyAllBtnOn,
												]}
												onPress={() => setShowMatch('all')}
											>
												<Text
													style={
														showMatch === 'all'
															? styles.summaryAnyAllBtnOnText
															: styles.summaryAnyAllBtnText
													}
												>
													all of
												</Text>
											</TouchableOpacity>
											<TouchableOpacity
												style={[
													styles.summaryAnyAllBtn,
													showMatch === 'any' && styles.summaryAnyAllBtnOn,
												]}
												onPress={() => setShowMatch('any')}
											>
												<Text
													style={
														showMatch === 'any'
															? styles.summaryAnyAllBtnOnText
															: styles.summaryAnyAllBtnText
													}
												>
													any of
												</Text>
											</TouchableOpacity>
										</View>
									)}
									{selectedShows.length > 1 && (
										<Text style={styles.allOfExplainer}>
											All of: user recommends every selected show · Any of: user
											recommends at least one
										</Text>
									)}
									<View style={styles.summaryPillRow}>
										{selectedShows.map((show) => (
											<TouchableOpacity
												key={show.id}
												style={styles.summaryShowPill}
												onPress={() =>
													setSelectedShows((prev) =>
														prev.filter((s) => s.id !== show.id),
													)
												}
											>
												<Text style={styles.summaryShowPillText}>
													{show.name} ✕
												</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>
							)}

							{/* Show Tags: */}
							{chosenShowTagIds.length > 0 && (
								<View style={styles.summarySection}>
									<View style={styles.summarySectionHeader}>
										<Text style={styles.summarySectionLabel}>SHOW TAGS</Text>
										<TouchableOpacity
											onPress={() => clearSection(PanelType.showTags)}
										>
											<Text style={styles.summaryClearSection}>x</Text>
										</TouchableOpacity>
									</View>
									{chosenShowTagIds.length > 1 && (
										<View style={styles.summaryAnyAllRow}>
											<TouchableOpacity
												style={[
													styles.summaryAnyAllBtn,
													showTagMatch === 'all' && styles.summaryAnyAllBtnOn,
												]}
												onPress={() => setShowTagMatch('all')}
											>
												<Text
													style={
														showTagMatch === 'all'
															? styles.summaryAnyAllBtnOnText
															: styles.summaryAnyAllBtnText
													}
												>
													all of
												</Text>
											</TouchableOpacity>
											<TouchableOpacity
												style={[
													styles.summaryAnyAllBtn,
													showTagMatch === 'any' && styles.summaryAnyAllBtnOn,
												]}
												onPress={() => setShowTagMatch('any')}
											>
												<Text
													style={
														showTagMatch === 'any'
															? styles.summaryAnyAllBtnOnText
															: styles.summaryAnyAllBtnText
													}
												>
													any of
												</Text>
											</TouchableOpacity>
										</View>
									)}
									{chosenShowTagIds.length > 1 && (
										<Text style={styles.allOfExplainer}>
											All of: every tag appears on at least one of their recs
										</Text>
									)}
									<View style={styles.summaryPillRow}>
										{chosenShowTagIds.map((tagId) => {
											const tag = tagMap[tagId];
											return (
												<TouchableOpacity
													key={tag.id}
													style={[
														styles.summaryTagPill,
														{ backgroundColor: '#36C9C6' },
													]}
													onPress={() => {
														setSelectedShowTags((prev) => {
															const selected = { ...prev };
															delete selected[tag.id];
															return selected;
														});
													}}
												>
													<Text
														style={[
															styles.summaryTagPillText,
															{ color: 'white' },
														]}
													>
														{tag.name} ✕
													</Text>
												</TouchableOpacity>
											);
										})}
									</View>
								</View>
							)}

							{/* Search button */}
							<TouchableOpacity
								style={styles.searchBtn}
								onPress={() => {
									handleSearch();
									setSearchState('post');
								}}
							>
								<Text style={styles.searchBtnText}>Search</Text>
							</TouchableOpacity>
						</View>
					)}

				{/* Filters mode — profile tags panel */}
				{searchMode === 'filters' && activePanel === 'profileTags' && (
					<View style={{ ...styles.panelBg, padding: 10 }}>
						<PickUserTagsContent
							selectedPreference={selectedPreference}
							setSelectedPreference={setSelectedPreference}
							selectedWarning={selectedWarning}
							setSelectedWarning={setSelectedWarning}
							selectedDesc={selectedDesc}
							setSelectedDesc={setSelectedDesc}
							preferenceTagsText={preferenceTagsText}
							warningTagsText={warningTagsText}
							descTagsText={descTagsText}
						/>
					</View>
				)}

				{/* Filters mode — shows panel */}
				{searchMode === 'filters' && activePanel === 'shows' && (
					<View style={styles.panelBg}>
						<ScrollView
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps='handled'
						>
							<SelectShow
								handleShow={handleShow}
								showAdded={false}
								previous='UserSearch'
								// onShowSelected={(newShow: Show) =>
								// 	setSelectedShows((prev) => {
								// 		if (prev.find((show) => show.tmdb_id === newShow.tmdb_id))
								// 			return prev;
								// 		return [...prev, newShow];
								// 	})
								// }
							/>
						</ScrollView>

						{selectedShows.length > 0 && (
							<View style={{ marginHorizontal: 12, marginBottom: 8 }}>
								<Text
									style={{
										fontSize: 12,
										color: '#666',
										textTransform: 'uppercase',
										letterSpacing: 0.6,
										marginBottom: 8,
										marginTop: 10,
									}}
								>
									selected
								</Text>
								<View
									style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}
								>
									{selectedShows.map((show) => (
										<TouchableOpacity
											key={show.id}
											style={styles.summaryShowPill}
											onPress={() =>
												setSelectedShows((prev) =>
													prev.filter((s) => s.id !== show.id),
												)
											}
										>
											<Text style={styles.summaryShowPillText}>
												{show.name} ✕
											</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>
						)}
					</View>
				)}

				{/* Filters mode — show tags panel */}
				{searchMode === 'filters' && activePanel === 'showTags' && (
					<View style={styles.panelBg}>
						<ShowTagPicker
							selectedTags={selectedShowTags}
							setSelectedTags={setSelectedShowTags}
							// selectedWarningTags={selectedWarningShowTags}
							// setSelectedWarningTags={setSelectedWarningShowTags}
							// warningTagsText={warningShowTagsText}
							generalTagsText={generalShowTagsText}
						/>
					</View>
				)}

				{/* Post-search results */}
				{searchMode === 'filters' && searchState === 'post' && loading && (
					<ActivityIndicator color='white' />
				)}

				{searchMode === 'filters' && searchState === 'post' && !loading && (
					<View style={styles.resultsSection}>
						{!displayedUsers || Object.keys(displayedUsers).length === 0 ? (
							<Text style={styles.noResults}>
								Unfortunately no users matched that search.
							</Text>
						) : (
							Object.keys(displayedUsers).map((userId) => {
								const userDetails = displayedUsers[userId];
								const user = userDetails.user;
								return (
									<TouchableOpacity
										key={userId}
										style={styles.resultCard}
										onPress={() =>
											router.push({
												pathname: '/otherUser',
												params: {
													uid: userId,
													userString: JSON.stringify(user),
												},
											})
										}
									>
										<View
											style={{ flexDirection: 'row', alignItems: 'center' }}
										>
											<View style={styles.avatar}>
												<Text style={styles.avatarText}>
													{user.username.slice(0, 2).toUpperCase()}
												</Text>
											</View>
											<View
												style={{
													flexDirection: 'column',
													flex: 1,
													flexShrink: 1,
												}}
											>
												<Text style={styles.resultName}>{user.username}</Text>

												<Text>
													{userDetails.showNamesString && (
														<Text
															style={[
																styles.resultMatchLabel,
																{ color: getResultLabelColor('rec') },
															]}
														>
															recs:{' '}
															<Text style={styles.resultMatch}>
																{userDetails.showNamesString}{' '}
															</Text>
														</Text>
													)}
													{userDetails.profileTagsDescribeString && (
														<Text
															style={[
																styles.resultMatchLabel,
																{ color: getResultLabelColor('desc') },
															]}
														>
															how they watch TV:{' '}
															<Text style={styles.resultMatch}>
																{userDetails.profileTagsDescribeString}{' '}
															</Text>
														</Text>
													)}
													{userDetails.profileTagsLikeString && (
														<Text
															style={[
																styles.resultMatchLabel,
																{ color: getResultLabelColor('like') },
															]}
														>
															likes:{' '}
															<Text style={styles.resultMatch}>
																{userDetails.profileTagsLikeString}{' '}
															</Text>
														</Text>
													)}
													{userDetails.profileTagsDislikeString && (
														<Text
															style={[
																styles.resultMatchLabel,
																{ color: getResultLabelColor('dislike') },
															]}
														>
															dislikes:{' '}
															<Text style={styles.resultMatch}>
																{userDetails.profileTagsDislikeString}{' '}
															</Text>
														</Text>
													)}
													{userDetails.profileTagsWarningString && (
														<Text
															style={[
																styles.resultMatchLabel,
																{ color: getResultLabelColor('warning') },
															]}
														>
															avoids:{' '}
															<Text style={styles.resultMatch}>
																{userDetails.profileTagsWarningString}{' '}
															</Text>
														</Text>
													)}
													{userDetails.showTagsString && (
														<Text
															style={[
																styles.resultMatchLabel,
																{ color: getResultLabelColor('showTag') },
															]}
														>
															tagged shows with:{' '}
															<Text style={styles.resultMatch}>
																{userDetails.showTagsString}
															</Text>
														</Text>
													)}
												</Text>
											</View>
											<MaterialCommunityIcons
												name='chevron-right'
												size={20}
												color='#aaa'
												style={{ marginLeft: 'auto' }}
											/>
										</View>
									</TouchableOpacity>
								);
							})
						)}
					</View>
				)}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		backgroundColor: '#340068',
	},
	headerTop: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingHorizontal: 12,
		paddingTop: 10,
		paddingBottom: 8,
		borderBottomWidth: 0.5,
		borderBottomColor: 'rgba(255,255,255,0.15)',
	},
	excludeLabel: {
		fontSize: 13,
		color: 'white',
		fontWeight: '500',
	},
	excludeSub: {
		fontSize: 11,
		color: 'rgba(255,255,255,0.55)',
		marginTop: 1,
	},
	modeTabs: {
		flexDirection: 'row',
	},
	modeTab: {
		flex: 1,
		paddingVertical: 8,
		alignItems: 'center',
		borderBottomWidth: 3,
		borderBottomColor: 'transparent',
	},
	modeTabActive: {
		borderBottomColor: '#36C9C6',
	},
	modeTabText: {
		fontSize: 13,
		fontWeight: '500',
		color: 'rgba(255,255,255,0.55)',
	},
	modeTabTextActive: {
		color: 'white',
	},
	pillRow: {
		paddingTop: 10,
	},
	pillRowContent: {
		paddingHorizontal: 12,
		gap: 8,
		paddingBottom: 10,
	},
	filterPill: {
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 999,
		backgroundColor: 'rgba(255,255,255,0.1)',
	},
	filterPillActive: {
		backgroundColor: '#7B5DB5',
	},
	filterPillOpen: {
		backgroundColor: '#36C9C6',
	},
	filterPillText: {
		fontSize: 13,
		fontWeight: '500',
		color: 'rgba(255,255,255,0.7)',
	},
	filterPillActiveText: {
		color: 'white',
	},
	filterPillOpenText: {
		color: '#043028',
	},
	anyAllRow: {
		flexDirection: 'row',
		gap: 8,
		paddingHorizontal: 12,
		paddingBottom: 10,
		justifyContent: 'center',
	},
	anyAllBtn: {
		paddingVertical: 4,
		paddingHorizontal: 14,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.3)',
	},
	anyAllBtnOn: {
		backgroundColor: '#36C9C6',
		borderColor: '#36C9C6',
	},
	anyAllBtnText: {
		fontSize: 12,
		color: 'rgba(255,255,255,0.6)',
	},
	anyAllBtnOnText: {
		fontSize: 12,
		color: '#043028',
		fontWeight: '500',
	},
	body: {
		flex: 1,
	},
	emptyMsg: {
		fontSize: 14,
		color: '#666',
		textAlign: 'left',
		padding: 20,
		lineHeight: 20,
	},
	searchBtn: {
		margin: 12,
		backgroundColor: '#340068',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	searchBtnText: {
		color: 'white',
		fontSize: 15,
		fontWeight: '500',
	},
	panelBg: {
		flex: 1,
		backgroundColor: '#F0F0F0',
	},
	resultsSection: {
		padding: 12,
	},
	noResults: { fontSize: 15, color: '#666', marginTop: 8 },
	resultCard: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
		backgroundColor: 'white',
		borderRadius: 8,
		padding: 10,
		marginBottom: 6,
	},
	avatar: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: '#EEEDFE',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	avatarText: { fontSize: 13, fontWeight: '500', color: '#3C3489' },
	resultName: {
		fontSize: 14,
		color: '#222',
		fontWeight: '500',
	},
	summarySection: {
		paddingHorizontal: 12,
		paddingTop: 12,
		paddingBottom: 6,
	},
	summarySectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 6,
	},
	summarySectionLabel: {
		fontSize: 11,
		fontWeight: '500',
		color: '#888',
		textTransform: 'uppercase',
		letterSpacing: 0.6,
	},
	summaryClearSection: {
		fontSize: 12,
		color: '#aaa',
		paddingVertical: 2,
		paddingHorizontal: 6,
		borderWidth: 0.5,
		borderColor: '#ccc',
		borderRadius: 4,
	},
	summaryAnyAllRow: {
		flexDirection: 'row',
		gap: 6,
		marginBottom: 8,
	},
	summaryAnyAllBtn: {
		paddingVertical: 3,
		paddingHorizontal: 10,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: '#ccc',
		backgroundColor: 'white',
	},
	summaryAnyAllBtnOn: {
		backgroundColor: '#340068',
		borderColor: '#340068',
	},
	summaryAnyAllBtnText: {
		fontSize: 12,
		color: '#666',
	},
	summaryAnyAllBtnOnText: {
		fontSize: 12,
		color: 'white',
		fontWeight: '500',
	},
	summaryTagPill: {
		paddingVertical: 4,
		paddingHorizontal: 10,
		borderRadius: 999,
		alignSelf: 'flex-start',
	},
	summaryTagPillText: {
		fontSize: 13,
		fontWeight: '500',
	},
	allOfExplainer: {
		fontSize: 12,
		color: '#777',
		marginBottom: 10,
	},
	summaryPillRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
	},
	summaryShowPill: {
		paddingVertical: 4,
		paddingHorizontal: 10,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: '#340068',
		alignSelf: 'flex-start',
	},
	summaryShowPillText: {
		fontSize: 13,
		fontWeight: '500',
		color: '#340068',
	},
	resultMatch: {
		fontSize: 12,
		color: '#777',
		marginTop: 3,
		lineHeight: 18,
	},
	resultMatchLabel: {
		fontSize: 12,
	},
	resultArrow: {
		fontSize: 16,
		color: '#ccc',
		alignSelf: 'center',
		marginLeft: 'auto',
	},
	compactBar: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderTopWidth: 0.5,
		borderTopColor: 'rgba(255,255,255,0.15)',
		gap: 10,
	},
	compactRows: {
		flex: 1,
		flexDirection: 'column',
		gap: 8,
	},
	compactRow: {
		flexDirection: 'row',
		alignItems: 'stretch',
	},
	aaSegment: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'stretch',
		borderWidth: 0.5,
		borderColor: 'rgba(255,255,255,0.3)',
		// // remove borderRightWidth: 0 -- keep all borders
		// borderTopLeftRadius: 6,
		// borderBottomLeftRadius: 6,
		// width: 60,
		// flexShrink: 0,
		// overflow: 'hidden',
	},
	labelSegment: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 0.5,
		borderColor: 'rgba(255,255,255,0.3)',
		borderLeftWidth: 0, // remove left border since aaSegment right border handles it
		borderTopRightRadius: 6,
		borderBottomRightRadius: 6,
		paddingVertical: 5,
		paddingHorizontal: 8,
		gap: 6,
	},

	aaPlaceholder: {
		// width: 66,
		flex: 1,
		borderWidth: 0.5,
		borderColor: 'rgba(255,255,255,0.3)',
	},
	aaOptWrap: {
		paddingVertical: 3,
		paddingHorizontal: 3,
		alignItems: 'center',
		justifyContent: 'center',
	},
	aaOptWrapOn: {
		backgroundColor: 'rgba(255,255,255,0.15)',
	},
	aaOpt: {
		paddingVertical: 3,
		paddingHorizontal: 3,
		minWidth: 28,
		textAlign: 'center',
		fontSize: 11,
		color: 'rgba(255,255,255,0.35)',
	},
	aaOptOn: {
		color: 'rgba(255,255,255,0.9)',
		fontWeight: '600',
	},
	aaDivider: {
		width: 0.5,
		alignSelf: 'stretch',
		backgroundColor: 'rgba(255,255,255,0.2)',
	},

	compactRowLabel: {
		flex: 1,
		fontSize: 12,
		color: 'rgba(255,255,255,0.85)',
	},
	compactRowCount: {
		fontSize: 12,
		color: 'rgba(255,255,255,0.5)',
	},
	compactRowX: {
		fontSize: 13,
		color: '#36C9C6',
		fontWeight: '700',
	},
	adjustRow: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		paddingTop: 4,
	},
	adjustBtn: {
		paddingLeft: 10,
	},
	adjustBtnText: {
		fontSize: 12,
		color: '#36C9C6',
		fontWeight: '500',
	},
	compactOpt: {
		fontSize: 10,
		paddingVertical: 2,
		paddingHorizontal: 5,
		color: 'rgba(255,255,255,0.4)',
	},
	compactOptOn: {
		backgroundColor: 'rgba(255,255,255,0.15)',
		color: 'rgba(255,255,255,0.9)',
		fontWeight: '600',
	},
	adjustCol: {
		justifyContent: 'flex-end',
		alignItems: 'flex-end',
	},
	compactRowInner: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'stretch',
		borderWidth: 0.5,
		borderColor: 'rgba(255,255,255,0.3)',
		borderRadius: 6,
	},
	aaSection: {
		width: '27%',
		minWidth: 60,
		flexDirection: 'row',
		alignItems: 'stretch',
		alignSelf: 'stretch',
	},
	aaSectionDivider: {
		width: 0.5,
		backgroundColor: 'rgba(255,255,255,0.3)',
		alignSelf: 'stretch',
	},
});

{
}

export default SearchUsers;
