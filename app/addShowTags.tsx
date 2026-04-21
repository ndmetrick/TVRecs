import { addShow, editUserShow } from '@/lib/api';
import { useAppData } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import {
	EditUserShowParams,
	SourcePage,
	Tag,
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

const AddShowTags = () => {
	const { showToSaveString, previousPage, currentShowString } =
		useLocalSearchParams();
	const showToSave: UserShowToSave = JSON.parse(showToSaveString as string);
	const previous = previousPage as SourcePage;
	const currentUserShow: UserShow | null = currentShowString
		? JSON.parse(currentShowString as string)
		: null;

	const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>({});
	const [loaded, setLoaded] = useState(false);
	// const [multilineChecked, setMultilineChecked] = useState(false);
	const [description, setDescription] = useState('');
	const {
		currentUser,
		refetchFollowingRecs,
		refetchUserShows,
		tvTags,
		warningTags,
	} = useAppData();

	useEffect(() => {
		// setAllTags(props.allTags);
		const tags = showToSave.tags ?? [];
		const selected: Record<string, boolean> = {};
		tags.forEach((tag) => {
			selected[tag.id] = true;
		});
		setSelectedTags(selected);
		const prevDescription = showToSave.description ?? '';
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
	}, [previous, showToSave.description, showToSave.tags]);

	// const unselectAll = () => {
	//   if (TagGroup.getSelectedIndex() !== -1) {
	//     for (let i = 0; i < tvTagNames.length; i++) {
	//       tagGroup.unselect(i);
	//     }
	//   }
	// };

	const selectTag = (tag: Tag) => {
		if (selectedTags[tag.id] === true) {
			const swap = { ...selectedTags, [tag.id]: false };
			setSelectedTags(swap);
		} else {
			const swap = { ...selectedTags, [tag.id]: true };
			setSelectedTags(swap);
		}
	};

	const displayTags = (tags: Tag[]) => {
		return tags.map((tag, key) => {
			const tagStyle =
				selectedTags[tag.id] !== true &&
				(tag.type === 'tv' || tag.type === 'unassigned')
					? styles.tvTag
					: selectedTags[tag.id] === true &&
						  (tag.type === 'tv' || tag.type === 'unassigned')
						? styles.highlightTvTag
						: selectedTags[tag.id] !== true && tag.type === 'warning'
							? styles.warningTag
							: styles.highlightWarningTag;

			return (
				<TouchableOpacity
					key={key}
					style={tagStyle}
					onPress={() => selectTag(tag)}
				>
					<Text style={styles.tagText}>{tag.name}</Text>
				</TouchableOpacity>
			);
		});
	};

	const chooseTags = async () => {
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
				console.error(`Error editing user show: ${err}`);
			}
		} else {
			if (!currentUser) {
				router.push({ pathname: '/login' });
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
				await addShow(supabase, updatedShow);
				await refetchUserShows();
				router.push({ pathname: '/currentUser' });
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
					placeholder='Write a description of the show. . .'
					onChangeText={(description) => setDescription(description)}
					mode='outlined'
					outlineColor='#340068'
					activeOutlineColor='#340068'
					multiline={true}
					value={description}
				/>
				<Text style={styles.text}>
					Pick some tags that you feel describe the show how you experience it:
				</Text>
				<View style={[styles.cardContent, styles.tagsContent]}>
					{displayTags(tvTags)}
				</View>

				<Text style={styles.text}>Pick some warning tags:</Text>
				<View style={[styles.cardContent, styles.tagsContent]}>
					{displayTags(warningTags)}
				</View>
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.button} onPress={chooseTags}>
						<Text style={styles.buttonText}>Save description and tags</Text>
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
		fontSize: 20,
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
		textAlign: 'center',
		fontSize: 20,
	},
});

export default AddShowTags;
