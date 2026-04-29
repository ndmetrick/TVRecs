import { AppliedShowFilters, ShowFilterType, Tag } from '@/lib/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import ShowTagPicker from './ShowTagPicker';

type PillState = 'inactive' | 'pending' | 'applied';
const generalTagsText = 'Pick tags to include in filter:';
const warningTagsText = 'Pick warning tags to filter out:';

// interface ChooseDescriptionPanelProps {
// 	pendingDescription: string | null;
// 	setPendingDescription: React.Dispatch<React.SetStateAction<string | null>>;
// 	onApply: () => void;
// 	onClear: () => void;
// }

// const ChooseDescriptionPanel = ({
// 	pendingDescription,
// 	setPendingDescription,
// 	onApply,
// 	onClear,
// }: ChooseDescriptionPanelProps) => {
// 	return (
// 		<View style={styles.panelContainer}>
// 			<Text style={{ marginBottom: 5 }}>
// 				Enter a word to search the description for:
// 			</Text>
// 			<View style={styles.numberPillRow}></View>
// 			<Text style={{ marginTop: 5 }}>people you follow</Text>
// 			<View style={styles.panelActionRow}>
// 				<TouchableOpacity style={styles.panelClearButton} onPress={onClear}>
// 					<Text style={styles.panelClearText}>clear</Text>
// 				</TouchableOpacity>
// 				<TouchableOpacity style={styles.panelApplyButton} onPress={onApply}>
// 					<Text style={styles.panelApplyText}>apply</Text>
// 				</TouchableOpacity>
// 			</View>
// 		</View>
// 	);
// };

interface MinRecsProps {
	pendingMinRecs: number | null;
	setPendingMinRecs: React.Dispatch<React.SetStateAction<number | null>>;
	onApply: () => void;
	onClear: () => void;
}

const minRecsArray = ['1', '2', '3', '4', '5+'];

const MinRecsPanel = ({
	pendingMinRecs,
	setPendingMinRecs,
	onApply,
	onClear,
}: MinRecsProps) => {
	return (
		<View style={styles.panelContainer}>
			<Text style={{ marginBottom: 5 }}>
				Only show recs recommended by at least:
			</Text>
			<View style={styles.numberPillRow}>
				{minRecsArray.map((num, index) => {
					console.log('index', index === pendingMinRecs);
					return (
						<TouchableOpacity
							onPress={() => setPendingMinRecs(index)}
							key={index}
							style={
								pendingMinRecs === index
									? styles.numberPillSelected
									: styles.numberPill
							}
						>
							<Text
								style={
									pendingMinRecs === index
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
			<Text style={{ marginTop: 5 }}>people I follow</Text>
			<View style={styles.panelActionRow}>
				<TouchableOpacity style={styles.panelClearButton} onPress={onClear}>
					<Text style={styles.panelClearText}>clear</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.panelApplyButton} onPress={onApply}>
					<Text style={styles.panelApplyText}>apply</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

interface PillProps {
	label: string;
	pillState: PillState;
	onPress: any;
}

const Pill = (props: PillProps) => {
	const { label, pillState, onPress } = props;

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
			onPress={onPress}
			style={[styles.pill, getPillStyle(pillState)]}
		>
			<Text style={[styles.pillText, { color: getTextColor(pillState) }]}>
				{label} {pillState === 'applied' ? '✓' : ''}
			</Text>
		</TouchableOpacity>
	);
};

interface RecsHeaderProps {
	noUserShows: boolean;
	toggleNoUserShows: () => void;
	cancelFilters: () => void;
	allShowTags: Tag[];
	appliedFilters: AppliedShowFilters;
	setAppliedFilters: React.Dispatch<React.SetStateAction<AppliedShowFilters>>;
	filterOpen: boolean;
	setFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
	showsLength: number;
}

const RecsHeader = ({
	noUserShows,
	toggleNoUserShows,
	cancelFilters,
	allShowTags,
	appliedFilters,
	setAppliedFilters,
	filterOpen,
	setFilterOpen,
	showsLength,
}: RecsHeaderProps) => {
	const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>({});
	const [selectedWarningTags, setSelectedWarningTags] = useState<
		Record<string, boolean>
	>({});
	const [activeFilterType, setActiveFilterType] =
		useState<ShowFilterType | null>(null);
	// const [loaded, setLoaded] = useState(false);
	const [pendingMinRecs, setPendingMinRecs] = useState<number | null>(null);
	// const [pendingDescription, setPendingDescription] = useState<string | null>(
	// 	null,
	// );

	const clearAllFilters = () => {
		setSelectedTags({});
		setSelectedWarningTags({});
		setPendingMinRecs(null);
		cancelFilters();
	};

	const filterLength = Object.keys(appliedFilters).length;
	const tagIdsFilterLength =
		(appliedFilters.hasTagIds?.length ?? 0) +
		(appliedFilters.notHasTagIds?.length ?? 0);

	const getPillState = (pillType: ShowFilterType): PillState => {
		if (appliedFilters[pillType]) return 'applied';
		if (activeFilterType === pillType) return 'pending';
		else return 'inactive';
	};

	useEffect(() => {
		console.log('filterLEngth', filterLength);
		Object.keys(appliedFilters).forEach((filter) =>
			console.log('applied filter', filter),
		);
	}, [appliedFilters, filterLength]);

	return (
		<View style={styles.header}>
			<View style={styles.toggleContainer}>
				<Text style={{ color: 'white' }}>
					{noUserShows
						? 'Toggle to see shows saved to your profile'
						: 'Toggle to hide shows saved to your profile'}
				</Text>

				<Switch
					style={{
						marginBottom: 5,
						marginTop: 5,
					}}
					ios_backgroundColor='#3e3e3e'
					onValueChange={toggleNoUserShows}
					value={noUserShows}
					trackColor={{ false: '#3e3e3e', true: '#36C9C6' }}
					thumbColor='white'
				/>
			</View>

			{filterOpen ? (
				<View style={styles.filterHeader}>
					<TouchableOpacity
						onPress={() => {
							console.log(Object.keys(appliedFilters)); // see what keys exist
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
							onPress={() =>
								setActiveFilterType((prev) =>
									prev === ShowFilterType.HAS_TAG_IDS
										? null
										: ShowFilterType.HAS_TAG_IDS,
								)
							}
						/>
						{/* <Pill
							label='words in description'
							pillState={getPillState(ShowFilterType.DESCRIPTION_STRING)}
							onPress={() =>
								setActiveFilterType(ShowFilterType.DESCRIPTION_STRING)
							}
						/> */}
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
					</ScrollView>

					{activeFilterType === 'hasTagIds' && (
						<View style={styles.panelContainer}>
							<ScrollView
								showsVerticalScrollIndicator={false}
								keyboardShouldPersistTaps='handled'
								style={styles.tagPanelScroll}
							>
								<ShowTagPicker
									selectedTags={selectedTags}
									setSelectedTags={setSelectedTags}
									selectedWarningTags={selectedWarningTags}
									setSelectedWarningTags={setSelectedWarningTags}
									warningTagsText={warningTagsText}
									generalTagsText={generalTagsText}
								/>
							</ScrollView>
							<View style={styles.panelActionRow}>
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
									<Text style={styles.panelClearText}>clear</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.panelApplyButton}
									onPress={() => {
										const chosenTags: number[] = [];
										const chosenWarningTags: number[] = [];
										for (const tagId in selectedTags) {
											if (selectedTags[tagId] === true) {
												chosenTags.push(Number(tagId));
											}
										}
										for (const tagId in selectedWarningTags) {
											if (selectedWarningTags[tagId] === true) {
												chosenWarningTags.push(Number(tagId));
											}
										}
										setAppliedFilters((prev) => {
											const next = { ...prev };
											if (chosenTags.length) next.hasTagIds = chosenTags;
											else delete next.hasTagIds;
											if (chosenWarningTags.length)
												next.notHasTagIds = chosenWarningTags;
											else delete next.notHasTagIds;
											return next;
										});
										setActiveFilterType(null);
									}}
								>
									<Text style={styles.panelApplyText}>apply</Text>
								</TouchableOpacity>
							</View>
						</View>
					)}
					{activeFilterType === 'minRecs' && (
						<MinRecsPanel
							pendingMinRecs={pendingMinRecs}
							setPendingMinRecs={setPendingMinRecs}
							onApply={() => {
								setAppliedFilters((prev) => {
									if (pendingMinRecs === null) {
										const { minRecs, ...rest } = prev;
										return rest;
									} else {
										return { ...prev, minRecs: pendingMinRecs };
									}
								});
								setActiveFilterType(null);
							}}
							onClear={() => {
								setPendingMinRecs(null);
								setAppliedFilters((prev) => {
									const { minRecs, ...rest } = prev;
									return rest;
								});
							}}
						/>
					)}
					{/* {activeFilterType === 'descriptionString' && (
						<ChooseDescriptionPanel
							pendingDescription={pendingDescription}
							setPendingDescription={setPendingDescription}
							onApply={() => {
								setAppliedFilters((f) => ({
									...f,
									descriptionString: pendingDescription ?? undefined,
								}));
								setActiveFilterType(null);
							}}
							onClear={() => {
								setPendingDescription(null);
								setAppliedFilters((f) => ({
									...f,
									pendingDescription: undefined,
								}));
							}}
						/>
					)} */}
				</View>
			) : (
				<View style={styles.filterHiddenHeader}>
					<TouchableOpacity onPress={() => setFilterOpen(true)}>
						<View style={styles.filterHiddenTopRow}>
							<Text style={styles.filterHiddenTitle}>
								Recs ({showsLength})
								{Object.keys(appliedFilters).length > 0 || noUserShows
									? ` · Filters (${Object.keys(appliedFilters).length + Number(`${noUserShows ? 1 : 0}`)} active)`
									: ''}
							</Text>

							<Text style={styles.filterExpandText}>edit ›</Text>
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

						{appliedFilters.minRecs ? (
							<View style={styles.activeFilterChip}>
								<Text style={styles.activeFilterChipText}>
									min {appliedFilters.minRecs} recs
								</Text>
							</View>
						) : null}
						{!noUserShows && Object.keys(appliedFilters).length === 0 && (
							<Text style={styles.filterHiddenLabel}>no filters active</Text>
						)}
						{(Object.keys(appliedFilters).length > 0 || noUserShows) && (
							<TouchableOpacity
								style={styles.clearAllChip}
								onPress={() => {
									clearAllFilters();
									if (noUserShows) toggleNoUserShows();
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
		fontSize: 14,
	},
	button: {
		padding: 5,
		borderRadius: 15,
		marginHorizontal: 3,
		backgroundColor: '#340068',
		marginTop: 5,
	},
	toggleContainer: {
		paddingLeft: 10,
		paddingTop: 5,
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
		backgroundColor: '#F0F0F0',
		padding: 14,
	},
	panelActionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 14,
		backgroundColor: '#E8EAF0',
		borderTopWidth: 0.5,
		borderTopColor: '#ddd',
		marginHorizontal: -14,
		marginBottom: -14,
	},
	panelClearButton: {
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: '#888',
	},
	panelClearText: {
		fontSize: 13,
		color: '#555',
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
		fontWeight: '500',
	},
	panelLabel: {
		fontSize: 13,
		color: '#666',
		marginBottom: 10,
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
	tagPanelScroll: {
		maxHeight: 350,
		marginBottom: 8,
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
		paddingTop: 8,
		paddingBottom: 10,
	},
	filterHiddenTopRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 6,
	},
	filterHiddenTitle: {
		color: 'white',
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
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 999,
		backgroundColor: '#9BC1BC',
	},
	numberPillSelected: {
		paddingVertical: 6,
		paddingHorizontal: 14,
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
});

export default RecsHeader;
