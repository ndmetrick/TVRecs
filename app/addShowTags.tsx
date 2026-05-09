import AppTextInput from '@/components/AppTextInput';
import ShowTagPicker from '@/components/ShowTagPicker';
import Toggle from '@/components/Toggle';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from 'react-native';

const AddShowTags = () => {
	const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>({});
	const [loaded, setLoaded] = useState(false);
	// const [multilineChecked, setMultilineChecked] = useState(false);
	const [description, setDescription] = useState('');
	const { currentUser, refetchUserShows } = useAppData();
	const [saving, setSaving] = useState(false);
	const [collapsed, setCollapsed] = useState<'collapse' | 'open'>('collapse');
	const [currentlyWatching, setCurrentlyWatching] = useState(false);
	const isDark = useColorScheme() === 'dark';
	const styles = makeStyles(isDark);

	const { showToSaveString, previousString, currentShowString } =
		useLocalSearchParams();
	const isFocused = useIsFocused();

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
		setSaving(true);
		for (const tagId in selectedTags) {
			if (selectedTags[tagId] === true) {
				chosenTags.push(Number(tagId));
			}
		}
		if (currentUserShow) {
			console.log(
				'showTosave',
				showToSave.type,
				'current',
				currentUserShow.type,
			);
			const updates: EditUserShowParams = {
				userShowId: currentUserShow.id,
				oldUserShow: currentUserShow,
				newTagIds: chosenTags,
			};
			if (description !== currentUserShow.description)
				updates.newDescription = description;
			if (showToSave.type !== currentUserShow.type)
				updates.newType = showToSave.type;
			if (currentlyWatching !== currentUserShow.currently_watching)
				updates.newWatching = currentlyWatching;

			try {
				await editUserShow(supabase, updates);
				await refetchUserShows();
				router.push({ pathname: '/currentUser' });
			} catch (err) {
				console.error(`Error editing user show: ${JSON.stringify(err)}`);
				showErrorToast('Could not save your changes. Try again.');
				Sentry.captureException(err, { tags: { location: 'editUserShow' } });
			} finally {
				setSaving(false);
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
				currentlyWatching: currentlyWatching,
			};
			try {
				await addShow(supabase, updatedShow);
				await refetchUserShows();
				router.push({ pathname: '/currentUser' });
			} catch (err) {
				console.error(`Error adding user show: ${JSON.stringify(err)}`);
				showErrorToast('Could not save this show to your profile. Try again.');
				Sentry.captureException(err, { tags: { location: 'addUserShow' } });
			} finally {
				setSaving(false);
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
			{saving && (
				<Modal transparent animationType='none' statusBarTranslucent>
					<View style={styles.savingOverlay}>
						<ActivityIndicator size='large' color='white' />
					</View>
				</Modal>
			)}
			<ScrollView
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps='handled'
				keyboardDismissMode='on-drag'
				// contentContainerStyle={{ paddingBottom: 120 }}
			>
				<Text style={styles.text}>
					Describe anything about the show you would like potential viewers to
					know in addition to the tag options below
				</Text>
				<AppTextInput
					style={styles.inputText}
					label='description (optional)'
					// placeholder='Write a description of the show. . .'
					onChangeText={(description) => setDescription(description)}
					mode='outlined'
					// outlineColor='#340068'
					// activeOutlineColor='#340068'
					multiline={true}
					value={description}
				/>
				<View style={styles.currentlyWatchingRow}>
					<Text
						style={{ fontSize: 16, color: isDark ? '#cccccc' : '#222' }}
					>{`I'm currently watching this show`}</Text>
					<Toggle
						value={currentlyWatching}
						onValueChange={setCurrentlyWatching}
						trackColorOn='#0E8C8C'
						trackColorOff='#3e3e3e'
					/>
				</View>
				<ShowTagPicker
					selectedTags={selectedTags}
					setSelectedTags={setSelectedTags}
					collapsed={collapsed}
					setCollapsed={setCollapsed}
				/>
				{/* {isFocused && (
					<Portal> */}

				{/* </Portal>
				)} */}
				{/* <View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.button} onPress={chooseTags}>
						<Text style={styles.buttonText}>
							{currentUser ? 'Save description and tags' : 'Log in / Sign up'}
						</Text>
					</TouchableOpacity>
				</View> */}
			</ScrollView>
			<View style={styles.panelActionRow}>
				<View style={{ marginBottom: 15, marginTop: 5, alignItems: 'center' }}>
					<TouchableOpacity style={styles.panelSaveButton} onPress={chooseTags}>
						<Text style={styles.panelSaveText}>
							{currentUser ? 'Save description and tags' : 'Log in / Sign up'}
						</Text>
					</TouchableOpacity>
				</View>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						width: '100%',
					}}
				>
					<TouchableOpacity
						onPress={() =>
							setCollapsed((prev) => (prev === 'open' ? 'collapse' : 'open'))
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
								name={collapsed === 'collapse' ? 'chevron-up' : 'chevron-down'}
								size={13}
								color='white'
							/>
						</View>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.panelClearButton}
						onPress={() => {
							setSelectedTags({});
						}}
					>
						<Text style={styles.panelClearText}>clear all</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

const makeStyles = (isDark: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isDark ? '#5a5a5a' : '',
		},
		text: {
			fontSize: 16,
			margin: 10,
			color: isDark ? '#cccccc' : '#222',
		},
		currentlyWatchingRow: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			marginHorizontal: 12,
			marginTop: 8,
			marginBottom: 4,
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
		savingOverlay: {
			...StyleSheet.absoluteFillObject,
			backgroundColor: 'rgba(0,0,0,0.4)',
			justifyContent: 'center',
			alignItems: 'center',
			zIndex: 999,
		},
		panelClearButton: {
			paddingVertical: 6,
			paddingHorizontal: 14,
			borderRadius: 999,
			borderWidth: 1,
			borderColor: 'white',
		},
		panelClearText: {
			fontSize: 13.5,
			color: 'white',
			fontWeight: '500',
		},
		panelSaveButton: {
			paddingVertical: 6,
			paddingHorizontal: 14,
			borderRadius: 999,
			// borderWidth: 2,
			// borderColor: 'white',
			backgroundColor: '#340068',
		},
		panelSaveText: {
			fontSize: 16,
			color: 'white',
			fontWeight: '500',
		},
		collapseAllButton: {
			alignSelf: 'center',
			paddingHorizontal: 12,
			paddingVertical: 4,
			marginBottom: 4,
		},
		collapseAllText: {
			fontSize: 14,
			color: 'white',
			fontWeight: '500',
		},
		// panelActionRow: {
		// 	flexDirection: 'column',
		// 	// justifyContent: 'space-between',
		// 	alignItems: 'center',
		// 	paddingVertical: 10,
		// 	paddingBottom: 65,
		// 	backgroundColor: '#9BA8CE',
		// 	// backgroundColor: '#8E97CC',
		// 	borderTopWidth: 3,
		// 	borderTopColor: '#340068',
		// 	// shadowColor: '#340068',
		// 	// borderBottomWidth: 2,
		// 	// borderBottomColor: '#340068',
		// 	// shadowOpacity: 0.1,
		// 	// shadowRadius: 4,
		// 	// elevation: 4,
		// },
		panelActionRow: {
			backgroundColor: '#9BA8CE',
			borderTopWidth: 3,
			borderTopColor: '#340068',
			paddingVertical: 10,
			paddingBottom: 30, // safe area
			paddingHorizontal: 14,
		},
	});

export default AddShowTags;
