import { useAppData } from '@/lib/AppContext';
import { UserProfile } from '@/lib/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { TextInput } from 'react-native-paper';

const Search = () => {
	// const isFocused = useIsFocused();
	// const [users, setUsers] = useState([]);
	const [matchingUsers, setMatchingUsers] = useState<UserProfile[] | null>(
		null,
	);
	const router = useRouter();
	const [advancedSearch, setAdvancedSearch] = useState(false);
	// const [tagsChecked, setTagsChecked] = useState('none');
	// const [showsChecked, setShowsChecked] = useState('none');
	// const [commonTagDropdownOpen, setCommonTagDropdownOpen] = useState(false);
	// const [commonTagDropdownValue, setCommonTagDropdownValue] = useState(null);
	// const [commonTagDropdownOptions, setCommonTagDropdownOptions] =
	// 	useState(null);
	// const [commonShowDropdownOpen, setCommonShowDropdownOpen] = useState(false);
	// const [commonShowDropdownValue, setCommonShowDropdownValue] = useState(null);
	// const [commonShowDropdownOptions, setCommonShowDropdownOptions] =
	// 	useState(null);
	// const [chosenShow, setChosenShow] = useState(null);
	// const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false)
	// const [tagsDropdownValue, setTagsDropdownValue] = useState([])
	// const [tagsDropdownOptions, setTagsDropdownOptions] = useState(null)
	// const [showsDropdownOpen, setShowsDropdownOpen] = useState(false);
	// const [showsDropdownValue, setShowsDropdownValue] = useState([]);
	// const [showsDropdownOptions, setShowsDropdownOptions] = useState(null);
	// const [showName, setShowName] = useState('');
	// const [filterShowChosen, setFilterShowChosen] = useState(false);
	// const [excludeFollowed, setExcludeFollowed] = useState(false);
	// const [sameShowName, setSameShowName] = useState(false);
	// const [searchTags, setSearchTags] = useState([]);
	const { allOtherUsers } = useAppData();
	// const [searchInput, setSearchInput] = useState('');

	// const [allTags, setAllTags] = useState([]);
	// const [dislikeTags, setDislikeTags] = useState([])
	// const [describeTags, setDescribeTags] = useState([])
	// const [selectedTags, setSelectedTags] = useState({});
	// const [showTags, setShowTags] = useState(false);

	// const reset = () => {
	// 	// setAdvancedSearch(false)
	// 	setCommonTagDropdownValue(null);
	// 	setCommonShowDropdownValue(null);
	// 	setChosenShow(null);
	// 	// setTagsDropdownValue([])
	// 	setShowName('');
	// 	setFilterShowChosen(false);
	// 	setShowsDropdownValue([]);
	// 	setSelectedTags({});
	// 	setShowTags(false);
	// 	setSearchTags([]);
	// };

	const getMatchingUsers = async (input: string) => {
		console.log('input', input);
		// setSearchInput(input);
		if (!input) {
			setMatchingUsers(null);
			return;
		}
		const matches =
			allOtherUsers?.filter((user) => {
				console.log('user', user, 'input', input);
				return user.username.toLowerCase().includes(input.toLowerCase());
			}) ?? [];
		console.log('matches', matches, input);
		setMatchingUsers(matches);
	};

	// const pickTags = () => {
	// 	const chosenTags = [];
	// 	for (const tagId in selectedTags) {
	// 		if (selectedTags[tagId]) {
	// 			chosenTags.push(selectedTags[tagId]);
	// 		}
	// 	}
	// 	setSearchTags(chosenTags);
	// 	setShowTags(false);
	// };

	// const filter = async () => {
	// 	try {
	// 		const filters = {};
	// 		let filterCount = 0;
	// 		if (tagsChecked === 'chooseTags') {
	// 			const chosenTags = [];
	// 			for (const tag of searchTags) {
	// 				chosenTags.push(tag.id);
	// 			}
	// 			if (chosenTags.length) {
	// 				filterCount += 1;
	// 				filters['chooseTags'] = chosenTags;
	// 			}
	// 		}
	// 		if (tagsChecked === 'commonTags') {
	// 			if (commonTagDropdownValue) {
	// 				filters['commonTags'] = commonTagDropdownValue;
	// 				filterCount += 1;
	// 			}
	// 		}
	// 		if (showsChecked === 'chooseShow') {
	// 			if (chosenShow) {
	// 				filters['chooseShow'] = chosenShow;
	// 				filterCount += 1;
	// 			}
	// 		}
	// 		if (showsChecked === 'commonShows') {
	// 			if (commonShowDropdownValue) {
	// 				filters['commonShows'] = commonShowDropdownValue;
	// 				filterCount += 1;
	// 			}
	// 		}
	// 		if (showsChecked === 'chooseCommonShows') {
	// 			const chosenShows = [];
	// 			for (const show of showsDropdownValue) {
	// 				chosenShows.push(show.id);
	// 			}
	// 			if (chosenShows.length) {
	// 				filters['chooseCommonShows'] = chosenShows;
	// 				filterCount += 1;
	// 			}
	// 		}
	// 		if (filterCount === 0) {
	// 			Alert.alert('No filters to search by', 'Please add a filter', {
	// 				text: 'OK',
	// 			});
	// 		} else {
	// 			if (excludeFollowed) {
	// 				filters['excludeFollowed'] = true;
	// 			}
	// 			filters['filterCount'] = filterCount;
	// 			const matches = await props.getMatchingUsers(filters);
	// 			if (props.currentUser) {
	// 				const matchesMinusUser = matches.filter(
	// 					(match) => match.id !== props.currentUser.id,
	// 				);

	// 				setMatchingUsers(matchesMinusUser);
	// 			} else {
	// 				setMatchingUsers(matches);
	// 			}
	// 			setAdvancedSearch(false);
	// 		}
	// 	} catch (err) {
	// 		console.log(err);
	// 	}
	// };

	return (
		// <TouchableWithoutFeedback onPress={() => closeOpenDropdown()}>
		<View style={styles.container}>
			<ScrollView
				nestedScrollEnabled={true}
				keyboardShouldPersistTaps='handled'
			>
				{advancedSearch ? (
					<View>
						<Text>Coming soon...</Text>
					</View>
				) : (
					<View>
						<Text style={styles.boldText}>Search for users by username</Text>
						<TextInput
							style={styles.inputText}
							label='Enter username here'
							onChangeText={(searchInput) => getMatchingUsers(searchInput)}
							mode='outlined'
							outlineColor='#340068'
							activeOutlineColor='#340068'
						/>
						<TouchableOpacity
							// style={styles.button}
							onPress={() => setAdvancedSearch(true)}
						>
							{/* <Text style={styles.text}>
								Search for users by filter{' '}
								<MaterialCommunityIcons name='chevron-double-down' size={18} />
							</Text> */}
						</TouchableOpacity>
					</View>
				)}
				{!matchingUsers ? (
					<View>
						<Text style={styles.resultsText}>
							Your matches will appear here once you search
						</Text>
					</View>
				) : !matchingUsers.length ? (
					<Text style={styles.resultsText}>
						Unfortunately, no users matched that search.
					</Text>
				) : (
					<View style={styles.optionContainer}>
						<Text style={styles.resultsText}>
							Users who match your search (click to navigate to their page):
						</Text>
						{matchingUsers.map((item, index) => {
							return (
								<View key={index}>
									<TouchableOpacity
										onPress={() =>
											router.push({
												pathname: '/otherUser',
												params: {
													uid: item.id,
													userString: JSON.stringify(item),
												},
											})
										}
									>
										<View style={styles.otherUser}>
											<Text style={styles.optionsText}>{item.username}</Text>
										</View>
									</TouchableOpacity>
								</View>
							);
						})}
					</View>
				)}
			</ScrollView>
		</View>
		// </TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	container: {
		marginTop: 15,
		flex: 1,
		marginHorizontal: 2,
		marginBottom: 40,
	},
	choiceContainer: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		flexWrap: 'wrap',
		flex: 1,
	},
	choices: {
		flexDirection: 'column',
		alignItems: 'center',
		flexWrap: 'wrap',
		flex: 1 / 3,
		margin: 2,
		paddingVertical: 10,
		paddingHorizontal: 3,
		alignContent: 'center',
	},
	optionContainer: {
		flex: 1,
		justifyContent: 'space-between',
		marginRight: 10,
		marginLeft: 10,
	},
	buttonText: {
		textAlign: 'center',
		fontSize: 16,
		margin: 5,
		fontWeight: '500',
		color: 'white',
	},
	text: {
		margin: 5,
		textAlign: 'center',
		fontSize: 20,
	},
	filterText: {
		textAlign: 'left',
		fontSize: 16,
		marginBottom: 7,
	},
	filterOptionsText: {
		textAlign: 'center',
		fontSize: 16,
		flex: 1,
	},
	filterCriteriaContainer: {
		flex: 1,
		padding: 6,
		backgroundColor: '#F4F1BB',
		marginTop: 7,
	},
	boldText: {
		margin: 5,
		textAlign: 'center',
		fontSize: 20,
		fontWeight: 'bold',
	},
	resultsText: {
		margin: 10,
		textAlign: 'left',
		fontSize: 18,
		fontWeight: 'bold',
	},
	tagHeadingText: {
		textAlign: 'left',
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 5,
		marginTop: 5,
	},
	inputText: {
		margin: 10,
		textAlign: 'center',
		fontSize: 20,
	},
	optionsText: {
		marginRight: 10,
		marginLeft: 10,
		fontSize: 18,
	},
	otherUser: {
		marginBottom: 5,
		marginTop: 5,
		padding: 2,
	},
	tagText: {
		fontSize: 13.5,
		fontWeight: '500',
		textAlign: 'center',
	},
	tagStyle: {
		marginTop: 4,
		marginHorizontal: 8,
		backgroundColor: '#FF3F00',
		borderWidth: 0,
		paddingHorizontal: 24,
		paddingVertical: 8,
	},
	textStyle: {
		color: 'black',
		fontSize: 14,
		fontWeight: 'bold',
	},
	cardContent: {
		flexDirection: 'row',
		marginBottom: 5,
	},
	tagsContent: {
		marginTop: 5,
		flexWrap: 'wrap',
	},
	selectedTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#008DD5',
		marginTop: 5,
	},
	highlightLikeTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#008DD5',
		marginTop: 5,
	},
	likeTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#9BC1BC',
		marginTop: 5,
	},
	highlightDislikeTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#E24E1B',
		marginTop: 5,
	},
	dislikeTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#F2A541',
		marginTop: 5,
	},
	highlightDescribeTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#7B5D96',
		marginTop: 5,
	},
	describeTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#B3A7BB',
		marginTop: 5,
	},
	buttonContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	button: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#340068',
		marginTop: 5,
		marginBottom: 10,
	},
	searchButton: {
		padding: 5,
		borderRadius: 15,
		marginHorizontal: 3,
		backgroundColor: '#340068',
		marginTop: 5,
	},
	cancelButton: {
		padding: 5,
		borderRadius: 15,
		marginHorizontal: 3,
		backgroundColor: '#F46036',
		marginTop: 5,
	},
	displayTagsContainer: {
		flexDirection: 'column',
		alignItems: 'flex-start',
		margin: 5,
	},
	displayTagsText: {
		textAlign: 'left',
		fontSize: 16,
		marginRight: 5,
		marginLeft: 5,
		fontWeight: '500',
	},
});

export default Search;
