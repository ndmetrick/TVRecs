import ShowTagPicker from '@/components/ShowTagPicker';
import { addShow, editUserShow } from '@/lib/api';
import { useAppData } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { showErrorToast } from '@/lib/toast';
import {
	EditUserShowParams,
	SourcePage,
	UserShow,
	UserShowToSave,
} from '@/lib/types';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { TextInput } from 'react-native-paper';

const generalTagsText = 'Pick some tags that you think describe the show:';
const warningTagsText = 'Pick some warning tags:';

const AddShowTags = () => {
	const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>({});
	const [loaded, setLoaded] = useState(false);
	// const [multilineChecked, setMultilineChecked] = useState(false);
	const [description, setDescription] = useState('');
	const {
		currentUser,
		refetchFollowingRecs,
		refetchUserShows,
		// tvTags,
		// warningTags,
	} = useAppData();

	const { showToSaveString, previousString, currentShowString } =
		useLocalSearchParams();

	const previous = previousString as SourcePage;

	useEffect(() => {
		if (!showToSaveString) return;
		const show: UserShowToSave = JSON.parse(showToSaveString as string);
		// setAllTags(props.allTags);
		setShowToSave(show);
		const tags = show.tags ?? [];
		const selected: Record<string, boolean> = {};
		tags.forEach((tag) => {
			selected[tag.id] = true;
		});
		setSelectedTags(selected);
		const prevDescription = show.description ?? '';
		setDescription(prevDescription);
		// const tv = [];
		// const warnings = [];
		// for (let i = 0; i < allTags.length; i++) {
		//   const tag = allTags[i];
		//   if (tag.type === 'tv' || tag.type === 'unassigned') {
		//     tv.push(tag);
		//   }
		//   if (tag.type === 'warning') {
		//     warnings.push(tag);
		//   }
		// }

		// setWarningTags(warnings);
		// setTVTags(tv);
		setLoaded(true);
		return () => {
			// setWarningTags([]);
			// setTVTags([]);
			setLoaded(false);
			setSelectedTags({});
			setDescription('');
			// setMultilineChecked(false);
		};
	}, [previous, showToSaveString]);

	// const unselectAll = () => {
	//   if (TagGroup.getSelectedIndex() !== -1) {
	//     for (let i = 0; i < tvTagNames.length; i++) {
	//       tagGroup.unselect(i);
	//     }
	//   }
	// };

	// const selectTag = (tag: Tag) => {
	// 	if (selectedTags[tag.id] === true) {
	// 		const swap = { ...selectedTags, [tag.id]: false };
	// 		setSelectedTags(swap);
	// 	} else {
	// 		const swap = { ...selectedTags, [tag.id]: true };
	// 		setSelectedTags(swap);
	// 	}
	// };

	const [showToSave, setShowToSave] = useState<UserShowToSave | null>(null);

	const currentUserShow: UserShow | null = currentShowString
		? JSON.parse(currentShowString as string)
		: null;

	const chooseTags = async () => {
		if (!showToSave) return;
		if (!currentUser) {
			return router.push({ pathname: '/login' });
		}
		const chosenTags = [];
		for (const tagId in selectedTags) {
			if (selectedTags[tagId] === true) {
				chosenTags.push(Number(tagId));
			}
		}
		if (currentUserShow) {
			const updates: EditUserShowParams = {
				userShowId: currentUserShow.id,
				oldUserShow: currentUserShow,
				newTagIds: chosenTags,
			};
			if (description !== currentUserShow.description)
				updates.newDescription = description;
			if (showToSave.type !== currentUserShow.type)
				updates.newType = showToSave.type;
			try {
				await editUserShow(supabase, updates);
				await refetchUserShows();
				await refetchFollowingRecs();
				router.push({ pathname: '/currentUser' });
			} catch (err) {
				console.error(`Error editing user show: ${JSON.stringify(err)}`);
				showErrorToast('Could not save your changes. Try again.');
			}
		} else {
			const updatedShow = {
				tmdbId: showToSave.tmdb_id ?? 'NONE',
				name: showToSave.name,
				type: showToSave.type,
				imageUrl: showToSave.image_url,
				description,
				tagIds: chosenTags,
				userId: currentUser.id,
			};
			try {
				await addShow(supabase, updatedShow);
				await refetchUserShows();
				router.push({ pathname: '/currentUser' });
			} catch (err) {
				console.error(`Error adding user show: ${JSON.stringify(err)}`);
				showErrorToast('Could not save this show to your profile. Try again.');
			}
		}
	};

	if (!loaded) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' color='#5500dc' />
			</View>
		);
	} else if (!selectedTags) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' color='#5500dc' />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps='handled'
			>
				<Text style={styles.text}>
					Describe anything about the show you would like potential viewers to
					know in addition to the tag options below
				</Text>
				<TextInput
					style={styles.inputText}
					label='description (optional)'
					// placeholder='Write a description of the show. . .'
					onChangeText={(description) => setDescription(description)}
					mode='outlined'
					outlineColor='#340068'
					activeOutlineColor='#340068'
					multiline={true}
					value={description}
				/>
				<ShowTagPicker
					selectedTags={selectedTags}
					setSelectedTags={setSelectedTags}
					warningTagsText={warningTagsText}
					generalTagsText={generalTagsText}
				/>
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.button} onPress={chooseTags}>
						<Text style={styles.buttonText}>
							{currentUser ? 'Save description and tags' : 'Log in / Sign up'}
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginTop: 15,
		flex: 1,
		// justifyContent: 'center',
		marginHorizontal: 2,
		marginBottom: 20,
	},
	text: {
		fontSize: 16,
		margin: 10,
	},
	tagText: {
		fontSize: 13.5,
		fontWeight: '500',
		textAlign: 'center',
	},
	title: {
		color: '#FF3F00',
		fontSize: 20,
		textAlign: 'center',
	},
	button: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#340068',
		marginTop: 5,
		marginBottom: 20,
	},
	tagGroup: {
		marginTop: 16,
		marginHorizontal: 10,
		marginBottom: 8,
	},
	tagStyle: {
		marginTop: 4,
		marginHorizontal: 8,
		backgroundColor: '#FF3F00',
		borderWidth: 0,
		marginRight: 12,
		paddingHorizontal: 24,
		paddingVertical: 8,
	},
	textStyle: {
		color: 'black',
		fontSize: 14,
		fontWeight: 'bold',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		margin: 10,
	},
	buttonText: {
		textAlign: 'center',
		fontSize: 18,
		margin: 5,
		fontWeight: '500',
		color: 'white',
	},
	cardContent: {
		flexDirection: 'row',
		marginLeft: 10,
	},

	tagsContent: {
		flexWrap: 'wrap',
	},
	tvTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#9BC1BC',
		marginTop: 5,
	},
	warningTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#F2A541',
		marginTop: 5,
	},
	highlightTvTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#36C9C6',
		marginTop: 5,
	},
	highlightWarningTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#E24E1B',
		marginTop: 5,
	},
	inputText: {
		margin: 10,
		textAlign: 'left',
		fontSize: 16,
	},
});

export default AddShowTags;
