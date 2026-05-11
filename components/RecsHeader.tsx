import {
	AppliedShowFilters,
	ShowFilterType,
	SourcePage,
	UserShowType,
} from '@/lib/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
	Dimensions,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from 'react-native';
import { Portal } from 'react-native-paper';
import ShowTagPicker from './ShowTagPicker';
import Toggle from './Toggle';

type PillState = 'inactive' | 'pending' | 'applied';
const generalTagsText = 'Pick tags to include in the filter:';
const warningTagsText = 'Pick warning tags to filter out:';

interface MinRecsProps {
	setMinRecs: (val: number | undefined) => void;
	minRecs: number | undefined;
}

const minRecsArray = ['2', '3', '4', '5', '6+'];

const MinRecsPanel = ({ setMinRecs, minRecs }: MinRecsProps) => {
	const isDark = useColorScheme() === 'dark';
	const styles = makeStyles(isDark);
	return (
		<View
			style={{
				...styles.panelContainer,
				borderBottomColor: '#340068',
				borderBottomWidth: 3,
				padding: 14,
				shadowColor: '#000',
				shadowOpacity: 0.1,
				shadowRadius: 4,
				elevation: 4,
			}}
		>
			<Text style={{ marginBottom: 10, color: isDark ? '#cccccc' : '' }}>
				Only show recs recommended by at least:
			</Text>
			<View style={styles.numberPillRow}>
				{minRecsArray.map((num, index) => {
					return (
						<TouchableOpacity
							onPress={() => setMinRecs(index + 1)}
							key={index}
							style={
								minRecs === index + 1
									? styles.numberPillSelected
									: styles.numberPill
							}
						>
							<Text
								style={
									minRecs === index + 1
										? styles.numberPillSelectedText
										: styles.numberPillText
								}
							>
								{num}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>
			<Text style={{ marginTop: 10, color: isDark ? '#cccccc' : '' }}>
				people I follow
			</Text>
		</View>
	);
};

interface PillProps {
	label: string;
	pillState: PillState;
	onPress: any;
	numApplied?: number | undefined;
}

const Pill = (props: PillProps) => {
	const { label, pillState, onPress, numApplied } = props;
	const isDark = useColorScheme() === 'dark';
	const styles = makeStyles(isDark);

	const getPillStyle = (state: PillState) =>
		({
			inactive: { backgroundColor: 'rgba(255,255,255,0.1)' },
			pending: { backgroundColor: '#7B5DB5' },
			applied: { backgroundColor: '#36C9C6' },
		})[state];

	const getTextColor = (state: PillState) =>
		({
			inactive: 'rgba(255,255,255,0.7)',
			pending: 'white',
			applied: '#043028',
		})[state];

	return (
		<TouchableOpacity
			hitSlop={{ top: 6, bottom: 6, left: 0, right: 0 }}
			onPress={onPress}
			style={[styles.pill, getPillStyle(pillState)]}
		>
			<Text style={[styles.pillText, { color: getTextColor(pillState) }]}>
				{label}{' '}
				{pillState !== 'applied' ? '' : numApplied ? `(${numApplied})✓` : '✓'}
			</Text>
		</TouchableOpacity>
	);
};

interface RecsHeaderProps {
	noUserShows?: boolean;
	toggleNoUserShows?: () => void;
	cancelFilters: () => void;
	appliedFilters: AppliedShowFilters;
	setAppliedFilters: React.Dispatch<React.SetStateAction<AppliedShowFilters>>;
	filterOpen: boolean;
	setFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
	showsLength: number;
	sourcePage: SourcePage;
	excludedSourceTypes?: Set<UserShowType>;
	setExcludedSourceTypes?: React.Dispatch<
		React.SetStateAction<Set<UserShowType>>
	>;
	displayedFilterLength: number;
	containerHeight: number;
}

const RecsHeader = ({
	noUserShows,
	toggleNoUserShows,
	cancelFilters,
	appliedFilters,
	setAppliedFilters,
	filterOpen,
	setFilterOpen,
	showsLength,
	sourcePage,
	excludedSourceTypes,
	setExcludedSourceTypes,
	displayedFilterLength,
}: RecsHeaderProps) => {
	const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>({});
	const [selectedWarningTags, setSelectedWarningTags] = useState<
		Record<string, boolean>
	>({});
	const [activeFilterType, setActiveFilterType] =
		useState<ShowFilterType | null>(null);
	const isFocused = useIsFocused();
	const [actionBarHeight, setActionBarHeight] = useState(50);
	const isDark = useColorScheme() === 'dark';
	const styles = makeStyles(isDark);

	const [collapsed, setCollapsed] = useState<'collapse' | 'open'>('collapse');
	const clearAllFilters = () => {
		setSelectedTags({});
		setSelectedWarningTags({});
		setAppliedFilters((prev) => {
			const { minRecs, ...rest } = prev;
			return rest;
		});
		cancelFilters();
	};
	const tagIdsFilterLength =
		(appliedFilters.hasTagIds?.length ?? 0) +
		(appliedFilters.notHasTagIds?.length ?? 0);
	const tabBarHeight = useBottomTabBarHeight();
	const screenHeight = Dimensions.get('window').height;
	const [panelY, setPanelY] = useState(254);
	const availableHeight = screenHeight - panelY - actionBarHeight;

	const getPillState = (pillType: ShowFilterType): PillState => {
		if (appliedFilters[pillType]) return 'applied';
		if (activeFilterType === pillType) return 'pending';
		else return 'inactive';
	};

	const toggleType = (type: UserShowType) => {
		if (setExcludedSourceTypes)
			setExcludedSourceTypes((prev) => {
				const newSet = new Set(prev);
				if (newSet.has(type)) newSet.delete(type);
				else newSet.add(type);
				return newSet;
			});
	};

	useEffect(() => {
		const chosenTags: number[] = [];
		for (const tagId in selectedTags) {
			if (selectedTags[tagId] === true) {
				chosenTags.push(Number(tagId));
			}
		}
		setAppliedFilters((prev) => {
			const next = { ...prev };
			if (chosenTags.length) next.hasTagIds = chosenTags;
			else delete next.hasTagIds;
			return next;
		});
	}, [selectedTags, setAppliedFilters]);

	useEffect(() => {
		const chosenWarningTags: number[] = [];

		for (const tagId in selectedWarningTags) {
			if (selectedWarningTags[tagId] === true) {
				chosenWarningTags.push(Number(tagId));
			}
		}
		setAppliedFilters((prev) => {
			const next = { ...prev };
			if (chosenWarningTags.length) next.notHasTagIds = chosenWarningTags;
			else delete next.notHasTagIds;
			return next;
		});
	}, [selectedWarningTags, setAppliedFilters]);

	return (
		<View style={styles.header}>
			{sourcePage === SourcePage.REC_SHOWS && toggleNoUserShows ? (
				<View style={styles.toggleContainer}>
					<Text style={{ color: isDark ? '#dddddd' : 'white' }}>
						{noUserShows
							? 'Toggle to see shows saved to your profile'
							: 'Toggle to hide shows saved to your profile'}
					</Text>
					<View
						style={{
							paddingTop: 8,
						}}
					>
						<Toggle
							onValueChange={toggleNoUserShows}
							value={!!noUserShows}
							trackColorOn='#36C9C6'
							trackColorOff='#3e3e3e'
						/>
					</View>
				</View>
			) : excludedSourceTypes ? (
				<View style={styles.sourcesRow}>
					<Text style={styles.sourceLabel}>Include:</Text>
					{(
						[
							{ key: UserShowType.REC, label: 'Recs' },
							{ key: UserShowType.WATCH, label: 'To Watch' },
							{ key: UserShowType.SEEN, label: 'Hidden' },
						] as const
					).map(({ key, label }) => {
						const checked = !excludedSourceTypes.has(key);
						return (
							<View style={styles.checkboxItem} key={key}>
								<TouchableOpacity onPress={() => toggleType(key)}>
									<View
										style={[
											styles.checkboxBox,
											checked && styles.checkboxBoxChecked,
										]}
									>
										{checked && (
											<MaterialCommunityIcons
												name='check-bold'
												size={12}
												color='#043028'
											/>
										)}
									</View>
								</TouchableOpacity>
								<Text style={styles.checkboxLabel}>{label}</Text>
							</View>
						);
					})}
				</View>
			) : null}

			{filterOpen ? (
				<View style={styles.filterHeader}>
					<TouchableOpacity
						onPress={() => {
							console.log(Object.keys(appliedFilters));
							console.log(Object.entries(appliedFilters));
							setFilterOpen(false);
						}}
					>
						<View style={styles.filterOpenHeader}>
							<Text style={styles.filterHeaderLabel}>Filters</Text>

							<MaterialCommunityIcons
								name='chevron-up'
								size={20}
								color='#36C9C6'
							/>
						</View>
					</TouchableOpacity>

					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.pillRow}
					>
						<Pill
							label='no filter'
							pillState={getPillState(ShowFilterType.NONE)}
							onPress={clearAllFilters}
						/>
						<Pill
							label='has tags'
							pillState={getPillState(ShowFilterType.HAS_TAGS)}
							onPress={() => {
								setAppliedFilters((prev) => {
									if (prev.hasTags) {
										const { hasTags, ...rest } = prev;
										return rest;
									} else {
										return { ...prev, hasTags: true };
									}
								});
							}}
						/>
						<Pill
							label='choose tags'
							pillState={
								appliedFilters.hasTagIds?.length ||
								appliedFilters.notHasTagIds?.length
									? 'applied'
									: activeFilterType === ShowFilterType.HAS_TAG_IDS
										? 'pending'
										: 'inactive'
							}
							numApplied={
								appliedFilters.notHasTagIds?.length ||
								appliedFilters.hasTagIds?.length
									? (appliedFilters.notHasTagIds?.length ?? 0) +
										(appliedFilters?.hasTagIds?.length ?? 0)
									: undefined
							}
							onPress={() =>
								setActiveFilterType((prev) =>
									prev === ShowFilterType.HAS_TAG_IDS
										? null
										: ShowFilterType.HAS_TAG_IDS,
								)
							}
						/>
						{sourcePage === SourcePage.VIEW_SHOWS && (
							<Pill
								label='currently watching'
								pillState={getPillState(ShowFilterType.CURRENTLY_WATCHING)}
								onPress={() => {
									setAppliedFilters((prev) => {
										if (prev.currentlyWatching) {
											const { currentlyWatching, ...rest } = prev;
											return rest;
										} else {
											return { ...prev, currentlyWatching: true };
										}
									});
								}}
							/>
						)}
						<Pill
							label='has description'
							pillState={getPillState(ShowFilterType.HAS_DESCRIPTION)}
							onPress={() => {
								setAppliedFilters((prev) => {
									if (prev.hasDescription) {
										const { hasDescription, ...rest } = prev;
										return rest;
									} else {
										return { ...prev, hasDescription: true };
									}
								});
							}}
						/>
						{sourcePage === SourcePage.REC_SHOWS && (
							<Pill
								label='currently watching'
								pillState={getPillState(ShowFilterType.CURRENTLY_WATCHING)}
								onPress={() => {
									setAppliedFilters((prev) => {
										if (prev.currentlyWatching) {
											const { currentlyWatching, ...rest } = prev;
											return rest;
										} else {
											return { ...prev, currentlyWatching: true };
										}
									});
								}}
							/>
						)}
						{sourcePage === SourcePage.REC_SHOWS && (
							<Pill
								label='min recs'
								pillState={getPillState(ShowFilterType.MIN_RECS)}
								onPress={() =>
									setActiveFilterType((prev) =>
										prev === ShowFilterType.MIN_RECS
											? null
											: ShowFilterType.MIN_RECS,
									)
								}
							/>
						)}
					</ScrollView>

					{activeFilterType === 'hasTagIds' && isFocused && (
						<>
							<View
								style={styles.panelContainer}
								onLayout={(e) => {
									e.target.measure((x, y, width, height, pageX, pageY) => {
										console.log('panelY pageY:', pageY);
										console.log('screenHeight:', screenHeight);
										console.log('tabBarHeight:', tabBarHeight);
										console.log(
											'availableHeight:',
											screenHeight - pageY - tabBarHeight - 50,
										);
										setPanelY(pageY);
									});
								}}
							>
								<ScrollView
									showsVerticalScrollIndicator={false}
									keyboardShouldPersistTaps='handled'
									style={{ maxHeight: availableHeight }}
								>
									<ShowTagPicker
										selectedTags={selectedTags}
										setSelectedTags={setSelectedTags}
										selectedWarningTags={selectedWarningTags}
										setSelectedWarningTags={setSelectedWarningTags}
										warningTagsText={warningTagsText}
										generalTagsText={generalTagsText}
										collapsed={collapsed}
										setCollapsed={setCollapsed}
									/>
								</ScrollView>
							</View>
							<Portal>
								<View
									style={[
										styles.panelActionRow,
										{
											position: 'absolute',
											bottom: tabBarHeight,
											left: 0,
											right: 0,
										},
									]}
									onLayout={(e) =>
										setActionBarHeight(e.nativeEvent.layout.height)
									}
								>
									<TouchableOpacity
										onPress={() =>
											setCollapsed((prev) =>
												prev === 'open' ? 'collapse' : 'open',
											)
										}
										style={styles.collapseAllButton}
										hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
									>
										<View style={{ flexDirection: 'row' }}>
											<Text style={styles.collapseAllText}>
												{collapsed === 'collapse'
													? 'collapse all tags '
													: 'open all tags '}
											</Text>
											<MaterialCommunityIcons
												name={
													collapsed === 'collapse'
														? 'chevron-up'
														: 'chevron-down'
												}
												size={13}
												color='white'
											/>
										</View>
									</TouchableOpacity>

									<TouchableOpacity
										style={styles.panelClearButton}
										onPress={() => {
											setSelectedTags({});
											setSelectedWarningTags({});
											setAppliedFilters((prev) => {
												const { hasTagIds, notHasTagIds, ...rest } = prev;
												return rest;
											});
										}}
									>
										<Text style={styles.panelClearText}>clear all</Text>
									</TouchableOpacity>
								</View>
							</Portal>
						</>
					)}
					{sourcePage === SourcePage.REC_SHOWS &&
						activeFilterType === 'minRecs' && (
							<MinRecsPanel
								setMinRecs={(val) => {
									setAppliedFilters((prev) => {
										console.log('valu', val, prev);
										if (val === undefined || val === prev.minRecs) {
											const { minRecs, ...rest } = prev;
											return rest;
										} else {
											return { ...prev, minRecs: val };
										}
									});
								}}
								minRecs={appliedFilters.minRecs}
							/>
						)}
				</View>
			) : (
				<View style={styles.filterHiddenHeader}>
					<TouchableOpacity onPress={() => setFilterOpen(true)}>
						<View style={styles.filterHiddenTopRow}>
							<Text style={styles.filterHiddenTitle}>
								{sourcePage === SourcePage.REC_SHOWS ? 'Recs' : 'Shows'} (
								{showsLength})
								{displayedFilterLength > 0 || noUserShows
									? ` · Filters (${displayedFilterLength + Number(`${noUserShows ? 1 : 0}`)} active)`
									: ''}
							</Text>

							<Text style={styles.filterExpandText}>
								{displayedFilterLength > 0 ? 'edit' : 'filters'} ›
							</Text>
						</View>
					</TouchableOpacity>
					<View style={styles.filterHiddenLeft}>
						{noUserShows && (
							<View style={styles.activeFilterChip}>
								<Text style={styles.activeFilterChipText}>hiding saved</Text>
							</View>
						)}
						{appliedFilters.hasTags && (
							<View style={styles.activeFilterChip}>
								<Text style={styles.activeFilterChipText}>has tags</Text>
							</View>
						)}
						{tagIdsFilterLength || appliedFilters.notHasTagIds?.length ? (
							<View style={styles.activeFilterChip}>
								<Text style={styles.activeFilterChipText}>
									{tagIdsFilterLength} specific{' '}
									{tagIdsFilterLength > 1 ? 'tags' : 'tag'}
								</Text>
							</View>
						) : null}
						{appliedFilters.hasDescription && (
							<View style={styles.activeFilterChip}>
								<Text style={styles.activeFilterChipText}>has description</Text>
							</View>
						)}

						{sourcePage === SourcePage.REC_SHOWS && appliedFilters.minRecs ? (
							<View style={styles.activeFilterChip}>
								<Text style={styles.activeFilterChipText}>
									min {appliedFilters.minRecs} recs
								</Text>
							</View>
						) : null}
						{!noUserShows && displayedFilterLength === 0 && (
							<Text style={styles.filterHiddenLabel}>no filters active</Text>
						)}
						{(displayedFilterLength > 0 || noUserShows) && (
							<TouchableOpacity
								style={styles.clearAllChip}
								onPress={() => {
									clearAllFilters();
									if (noUserShows && toggleNoUserShows) toggleNoUserShows();
								}}
							>
								<Text style={styles.clearAllChipText}>clear all</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
			)}
		</View>
	);
};

const makeStyles = (isDark: boolean) =>
	StyleSheet.create({
		toggleContainer: {
			paddingLeft: 10,
			paddingTop: 3,
		},
		header: {
			paddingTop: 7,
			backgroundColor: '#340068',
		},
		panelContainer: {
			backgroundColor: isDark ? '#5a5a5a' : '#F0F0F0',
		},
		panelActionRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingVertical: 10,
			paddingHorizontal: 14,
			backgroundColor: '#9BA8CE',
			borderTopWidth: 3,
			borderTopColor: '#340068',
		},
		collapseAllButton: {
			alignSelf: 'flex-end',
			paddingHorizontal: 12,
			paddingVertical: 4,
			marginBottom: 4,
		},
		collapseAllText: {
			fontSize: 13,
			color: 'white',
			fontWeight: '500',
		},
		panelClearButton: {
			paddingVertical: 6,
			paddingHorizontal: 14,
			borderRadius: 999,
			borderWidth: 1,
			borderColor: 'white',
		},
		panelClearText: {
			fontSize: 13,
			color: 'white',
			fontWeight: '500',
		},
		filterHiddenLabel: {
			color: 'rgba(255,255,255,0.6)',
			fontSize: 13,
		},
		activeFilterChip: {
			paddingVertical: 4,
			paddingHorizontal: 10,
			borderRadius: 999,
			backgroundColor: '#36C9C6',
		},
		activeFilterChipText: {
			fontSize: 12,
			color: '#043028',
			fontWeight: '500',
		},
		filterExpandText: {
			color: '#36C9C6',
			fontSize: 13,
		},
		filterHeader: {
			backgroundColor: '#340068',
		},
		pillRow: {
			paddingHorizontal: 12,
			paddingVertical: 10,
		},
		pill: {
			paddingVertical: 6,
			paddingHorizontal: 14,
			borderRadius: 999,
			marginRight: 8,
		},
		pillText: {
			fontSize: 13,
			fontWeight: '500',
		},
		filterOpenHeader: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingHorizontal: 12,
			paddingTop: 8,
		},
		filterHeaderLabel: {
			color: 'rgba(255,255,255,0.6)',
			fontSize: 13,
		},
		filterHiddenHeader: {
			backgroundColor: '#340068',
			paddingHorizontal: 12,
			paddingTop: 10,
			paddingBottom: 10,
		},
		filterHiddenTopRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 6,
		},
		filterHiddenTitle: {
			color: isDark ? '#dddddd' : 'white',
			fontSize: 15,
			fontWeight: '500',
		},
		filterHiddenLeft: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
			flexWrap: 'wrap',
		},
		clearAllChip: {
			paddingVertical: 4,
			paddingHorizontal: 10,
			borderRadius: 999,
			backgroundColor: 'rgba(255,255,255,0.15)',
		},
		clearAllChipText: {
			fontSize: 12,
			color: 'rgba(255,255,255,0.7)',
			fontWeight: '500',
		},
		// Min recs:
		numberPillRow: {
			flexDirection: 'row',
			gap: 8,
			flexWrap: 'wrap',
		},
		numberPill: {
			paddingVertical: 8,
			paddingHorizontal: 16,
			borderRadius: 999,
			backgroundColor: '#9BC1BC',
		},
		numberPillSelected: {
			paddingVertical: 8,
			paddingHorizontal: 16,
			borderRadius: 999,
			backgroundColor: '#36C9C6',
		},
		numberPillText: {
			fontSize: 14,
			color: '#444',
		},
		numberPillSelectedText: {
			fontSize: 14,
			fontWeight: '500',
			color: 'white',
		},
		sourcesRow: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingHorizontal: 12,
			paddingVertical: 4,
			gap: 10,
			borderTopWidth: 0.5,
			borderBottomWidth: 0.5,
			borderTopColor: 'rgba(255,255,255,0.2)',
			borderBottomColor: 'rgba(255,255,255,0.2)',
		},
		sourceLabel: {
			fontSize: 12,
			color: 'rgba(255,255,255,0.75)',
		},
		checkboxItem: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
		},
		checkboxBox: {
			width: 16,
			height: 16,
			borderRadius: 3,
			borderWidth: 1.5,
			borderColor: 'rgba(255,255,255,0.5)',
			alignItems: 'center',
			justifyContent: 'center',
		},
		checkboxBoxChecked: {
			backgroundColor: '#36C9C6',
			borderColor: '#36C9C6',
		},
		checkboxLabel: {
			fontSize: 13,
			color: 'rgba(255,255,255,0.85)',
			fontWeight: '500',
		},
		currentlyWatchingLabel: {
			fontSize: 13,
			color: 'white',
			fontWeight: '500',
		},
		currentlyWatchingSub: {
			fontSize: 11,
			color: 'rgba(255,255,255,0.55)',
			marginTop: 1,
		},
	});

export default RecsHeader;
