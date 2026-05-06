import { useAppData } from '@/lib/AppContext';
import { Tag, TagType } from '@/lib/types';
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

interface PickUserTagsContentProps {
	selectedPreference: Record<number, 'like' | 'dislike'>;
	setSelectedPreference: React.Dispatch<
		React.SetStateAction<Record<number, 'like' | 'dislike'>>
	>;
	selectedWarning: Record<number, boolean>;
	setSelectedWarning: React.Dispatch<
		React.SetStateAction<Record<number, boolean>>
	>;
	selectedDesc: Record<number, boolean>;
	setSelectedDesc: React.Dispatch<
		React.SetStateAction<Record<number, boolean>>
	>;
	preferenceTagsText: string;
	warningTagsText: string;
	descTagsText: string;
}

const PickUserTagsContent = ({
	selectedPreference,
	setSelectedPreference,
	selectedWarning,
	setSelectedWarning,
	selectedDesc,
	setSelectedDesc,
	preferenceTagsText,
	warningTagsText,
	descTagsText,
}: PickUserTagsContentProps) => {
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

	const { warningTags, preferenceTags, describeTags } = useAppData();

	const selectWarningTag = (tag: Tag) => {
		setSelectedWarning((prev) => {
			const selected = { ...prev };
			if (selected[tag.id]) {
				delete selected[tag.id];
			} else {
				selected[tag.id] = true;
			}
			return selected;
		});
	};
	const selectDescTag = (tag: Tag) => {
		setSelectedDesc((prev) => {
			const selected = { ...prev };
			if (selected[tag.id]) {
				delete selected[tag.id];
			} else {
				selected[tag.id] = true;
			}
			return selected;
		});
	};

	const selectPreferenceTag = (tag: Tag) => {
		setSelectedPreference((prev) => {
			const selected = { ...prev };
			if (selected[tag.id] === 'like') {
				selected[tag.id] = 'dislike';
			} else if (selected[tag.id] === 'dislike') {
				delete selected[tag.id];
			} else {
				selected[tag.id] = 'like';
			}
			return selected;
		});
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

	return (
		<ScrollView>
			<Text style={styles.text}>{preferenceTagsText}</Text>
			<View style={[styles.cardContent, styles.tagsContent]}>
				{displayTags(preferenceTags)}
			</View>
			<Text style={styles.text}>{warningTagsText}</Text>
			<View style={[styles.cardContent, styles.tagsContent]}>
				{displayTags(warningTags)}
			</View>
			<Text style={styles.text}>{descTagsText}</Text>
			<View style={[styles.cardContent, styles.tagsContent]}>
				{displayTags(describeTags)}
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		marginTop: 15,
		flex: 1,
		marginBottom: 40,
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

export default PickUserTagsContent;
