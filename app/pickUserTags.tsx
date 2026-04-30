import { setProfileTags, updateUser } from '@/lib/api';
import { useAppData } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { showErrorToast } from '@/lib/toast';
import { ProfileTag, ProfileTagCategory, Tag, TagType } from '@/lib/types';
import * as Sentry from '@sentry/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { TextInput } from 'react-native-paper';

const PickUserTags = () => {
	const { profileTagsString } = useLocalSearchParams();
	const [selectedWarning, setSelectedWarning] = useState<
		Record<number, boolean>
	>({});
	const [selectedDesc, setSelectedDesc] = useState<Record<number, boolean>>({});
	const [selectedPreference, setSelectedPreference] = useState<
		Record<number, 'like' | 'dislike' | 'none'>
	>({});
	const [loaded, setLoaded] = useState(false);
	const [description, setDescription] = useState('');
	const [saving, setSaving] = useState(false);

	const {
		currentUser,
		warningTags,
		preferenceTags,
		describeTags,
		refetchCurrentUser,
	} = useAppData();

	useEffect(() => {
		const desc: Record<number, boolean> = {};
		const warning: Record<number, boolean> = {};
		if (!profileTagsString) return;
		const savedProfileTags: ProfileTag[] = JSON.parse(
			profileTagsString as string,
		);
		const preference: Record<number, 'like' | 'dislike'> = {};
		savedProfileTags.forEach((profileTag) => {
			if (profileTag.category === ProfileTagCategory.LIKE) {
				preference[profileTag.tag.id] = ProfileTagCategory.LIKE;
			} else if (
				profileTag.category === ProfileTagCategory.DISLIKE &&
				profileTag.tag.type !== TagType.WARNING
			) {
				preference[profileTag.tag.id] = ProfileTagCategory.DISLIKE;
			} else if (profileTag.category === ProfileTagCategory.DISLIKE) {
				warning[profileTag.tag.id] = true;
			} else {
				desc[profileTag.tag.id] = true;
			}
		});
		setSelectedPreference(preference);
		setSelectedWarning(warning);
		setSelectedDesc(desc);

		if (currentUser?.description) {
			setDescription(currentUser.description);
		}
		setLoaded(true);

		return () => {
			setLoaded(false);
			setSelectedPreference({});
			setSelectedWarning({});
			setSelectedDesc({});
			setDescription('');
		};
	}, [currentUser, profileTagsString]);

	const selectDescTag = (tag: Tag) => {
		const current = !!selectedDesc[tag.id];
		setSelectedDesc((prev) => ({
			...prev,
			[tag.id]: !current,
		}));
	};

	const selectWarningTag = (tag: Tag) => {
		const current = !!selectedWarning[tag.id];
		setSelectedWarning((prev) => ({
			...prev,
			[tag.id]: !current,
		}));
	};

	const selectPreferenceTag = (tag: Tag) => {
		const current = selectedPreference[tag.id];
		let next: 'none' | 'like' | 'dislike' = 'like';
		if (current === 'dislike') {
			next = 'none';
		} else if (current === ProfileTagCategory.LIKE) {
			next = ProfileTagCategory.DISLIKE;
		}
		setSelectedPreference((prev) => ({
			...prev,
			[tag.id]: next,
		}));
	};

	const getDisplayTagStyle = (tag: Tag) => {
		switch (tag.type) {
			case TagType.WARNING:
				return selectedWarning[tag.id]
					? styles.highlightWarningTag
					: styles.warningTag;
			case TagType.PROFILE_DESCRIBE:
				return selectedDesc[tag.id]
					? styles.highlightDescribeTag
					: styles.describeTag;
			case TagType.PROFILE:
			case TagType.UNASSIGNED:
				return selectedPreference[tag.id] === 'dislike'
					? styles.dislikePreferenceTag
					: selectedPreference[tag.id] === 'like'
						? styles.likePreferenceTag
						: styles.preferenceTag;
		}
	};

	const displayTags = (tags: Tag[]) => {
		return tags.map((tag, key) => {
			const isWarning = tag.type === TagType.WARNING;
			const isDesc = tag.type === TagType.PROFILE_DESCRIBE;
			const tagStyle = getDisplayTagStyle(tag);

			if (tagStyle)
				return (
					<TouchableOpacity
						key={key}
						style={tagStyle}
						onPress={
							isWarning
								? () => selectWarningTag(tag)
								: isDesc
									? () => selectDescTag(tag)
									: () => selectPreferenceTag(tag)
						}
					>
						<Text style={styles.tagText}>{tag.name}</Text>
					</TouchableOpacity>
				);
		});
	};

	const handlePress = async () => {
		if (!currentUser) {
			router.push({ pathname: '/login' });
		} else {
			setSaving(true);
			try {
				const chosenTags: { tagId: number; category: ProfileTagCategory }[] =
					[];
				for (const tagId in selectedWarning) {
					if (selectedWarning[tagId]) {
						chosenTags.push({
							tagId: Number(tagId),
							category: ProfileTagCategory.DISLIKE,
						});
					}
				}
				for (const tagId in selectedDesc) {
					if (selectedDesc[tagId]) {
						chosenTags.push({
							tagId: Number(tagId),
							category: ProfileTagCategory.DESCRIBE,
						});
					}
				}
				for (const tagId in selectedPreference) {
					if (selectedPreference[tagId] === ProfileTagCategory.LIKE) {
						chosenTags.push({
							tagId: Number(tagId),
							category: ProfileTagCategory.LIKE,
						});
					} else if (selectedPreference[tagId] === ProfileTagCategory.DISLIKE) {
						chosenTags.push({
							tagId: Number(tagId),
							category: ProfileTagCategory.DISLIKE,
						});
					}
				}
				await setProfileTags(supabase, currentUser.id, chosenTags);
				if (description !== currentUser?.description) {
					const updates = { description };
					await updateUser(supabase, currentUser.id, updates);
					await refetchCurrentUser();
				}

				router.push({ pathname: '/settings' });
			} catch (err) {
				console.error(`Error saving profile tags and description: ${err}`);
				showErrorToast('There was an error updating your profile');
				router.push({ pathname: '/currentUser' });
				Sentry.captureException(err, {
					tags: { location: 'profileTags' },
				});
			} finally {
				setSaving(false);
			}
		}
	};

	if (!loaded) {
		console.log('this one is where i am');
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
			<ScrollView showsVerticalScrollIndicator={false}>
				<Text style={styles.text}>
					{`If you'd like, add a tv bio with anything you aren't able to represent with tags -- things about the shows you like and/or the kind of television watcher you are and/or the role TV plays in your life:`}
				</Text>
				<TextInput
					style={styles.inputText}
					label='tv bio (optional)'
					placeholder='Write a tv bio. . .'
					onChangeText={(description) => setDescription(description)}
					mode='outlined'
					outlineColor='#340068'
					activeOutlineColor='#340068'
					multiline={true}
					value={description}
				/>
				<Text style={styles.text}>
					Pick some tags that describe genres/attributes of the kinds of shows
					you like best. Tap once to mark as a favorite, tap again to mark as
					something you actively avoid, tap a third time to clear:
				</Text>
				<View style={[styles.cardContent, styles.tagsContent]}>
					{displayTags(preferenceTags)}
				</View>
				<Text style={styles.text}>
					Pick some tags that describe any deal breakers or triggers (i.e., the
					kinds of things that, if shows contain them, you end up choosing not
					to watch them / you find yourself needing to be very careful with
					watching them):
				</Text>
				<View style={[styles.cardContent, styles.tagsContent]}>
					{displayTags(warningTags)}
				</View>
				<Text style={styles.text}>
					Pick some tags that describe the kind of television watcher you are:
				</Text>
				<View style={[styles.cardContent, styles.tagsContent]}>
					{displayTags(describeTags)}
				</View>
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.button} onPress={handlePress}>
						<Text style={styles.buttonText}>
							{currentUser ? `Save tv bio and tags` : 'Log in / Sign up'}
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
		marginBottom: 30,
		marginRight: 10,
		marginLeft: 10,
	},
	text: { textAlign: 'left', fontSize: 18 },
	tagText: {
		fontSize: 14,
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
		marginBottom: 8,
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
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
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
		marginBottom: 10,
	},
	inputText: {
		margin: 10,
		textAlign: 'left',
		fontSize: 20,
	},
	tagsContent: {
		marginTop: 10,
		flexWrap: 'wrap',
	},
	likePreferenceTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#008DD5',
		marginTop: 5,
	},
	dislikePreferenceTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#B05080',
		marginTop: 5,
	},
	preferenceTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#9BC1BC',
		marginTop: 5,
	},
	highlightWarningTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#E24E1B',
		marginTop: 5,
	},
	warningTag: {
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
		backgroundColor: '#6B7FD4',
		marginTop: 5,
	},
	describeTag: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#B3A7BB',
		marginTop: 5,
	},
	savingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.4)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 999,
	},
});

export default PickUserTags;
