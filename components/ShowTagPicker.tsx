import { useAppData } from '@/lib/AppContext';
import { Tag } from '@/lib/types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
	selectedTags: Record<string, boolean>;
	setSelectedTags: React.Dispatch<
		React.SetStateAction<Record<string, boolean>>
	>;
	warningTagsText: string;
	generalTagsText: string;
}

const ShowTagPicker = (props: Props) => {
	const { selectedTags, setSelectedTags, warningTagsText, generalTagsText } =
		props; // does this come from the parent? does the SAVE go in here and it's just what gets set to save? no, bc the other one is description...	const [loaded, setLoaded] = useState(false);
	const { tvTags, warningTags } = useAppData();

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

	return (
		<View>
			<Text style={styles.text}>{generalTagsText}</Text>
			<View style={[styles.cardContent, styles.tagsContent]}>
				{displayTags(tvTags)}
			</View>

			<Text style={styles.text}>{warningTagsText}</Text>
			<View style={[styles.cardContent, styles.tagsContent]}>
				{displayTags(warningTags)}
			</View>
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
		marginRight: 5,
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

export default ShowTagPicker;
