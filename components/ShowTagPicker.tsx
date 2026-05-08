import { useAppData } from '@/lib/AppContext';
import { Tag } from '@/lib/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from 'react-native';

interface SectionProps {
	label: string;
	tags: Tag[];
	selectedTags: Record<string, boolean>;
	onSelectTag: (tag: Tag) => void;
	isWarning?: boolean;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TagSection = ({
	label,
	tags,
	selectedTags,
	onSelectTag,
	isWarning = false,
	open,
	setOpen,
}: SectionProps) => {
	const isDark = useColorScheme() === 'dark';
	const styles = makeStyles(isDark);
	const selectedTagsArray = tags.filter((t) => selectedTags[t.id] === true);

	return (
		<View>
			<TouchableOpacity
				style={styles.sectionHeader}
				onPress={() => setOpen((prev) => !prev)}
			>
				<View style={styles.sectionHeaderLeft}>
					<Text style={styles.sectionLabel}>{label}</Text>
					{!open && (
						<View style={styles.selectedPillsRow}>
							{selectedTagsArray.map((tag, index) => (
								<TouchableOpacity
									key={index}
									style={[
										styles.badge,
										isWarning ? styles.warningBadge : styles.tvBadge,
									]}
									onPress={() => onSelectTag(tag)}
								>
									<Text style={styles.badgeText}>
										{tag.name}
										<Text
											style={{ fontSize: 12, color: '#333', fontWeight: 400 }}
										>
											{' '}
											✕
										</Text>
									</Text>
								</TouchableOpacity>
							))}
						</View>
					)}
				</View>
				<View style={styles.chevronContainer}>
					<MaterialCommunityIcons
						name={open ? 'chevron-up' : 'chevron-down'}
						size={20}
						color={isDark ? '#cccccc' : '#777'}
					/>
				</View>
			</TouchableOpacity>
			<View
				style={[styles.divider, !open && isWarning && { marginBottom: 20 }]}
			/>
			{open && (
				<View style={[styles.cardContent, styles.tagsContent]}>
					{tags.map((tag) => {
						const selected = selectedTags[tag.id] === true;
						const tagStyle = isWarning
							? selected
								? styles.highlightWarningTag
								: styles.warningTag
							: selected
								? styles.highlightTvTag
								: styles.tvTag;
						return (
							<TouchableOpacity
								key={tag.id}
								style={tagStyle}
								onPress={() => onSelectTag(tag)}
							>
								<Text style={styles.tagText}>{tag.name}</Text>
							</TouchableOpacity>
						);
					})}
				</View>
			)}
		</View>
	);
};

interface Props {
	selectedTags: Record<string, boolean>;
	setSelectedTags: React.Dispatch<
		React.SetStateAction<Record<string, boolean>>
	>;
	selectedWarningTags?: Record<string, boolean>;
	setSelectedWarningTags?: React.Dispatch<
		React.SetStateAction<Record<string, boolean>>
	>;
	warningTagsText?: string;
	generalTagsText?: string;
	skipWarning?: boolean;
	collapsed?: 'collapse' | 'open';
	setCollapsed?: React.Dispatch<React.SetStateAction<'collapse' | 'open'>>;
}

const ShowTagPicker = (props: Props) => {
	const {
		selectedTags,
		setSelectedTags,
		warningTagsText,
		generalTagsText,
		selectedWarningTags,
		setSelectedWarningTags,
		skipWarning,
		collapsed,
	} = props;
	const { tvTags, warningTags } = useAppData();
	const tagSections: { label: string; tags: Tag[] }[] = useMemo(() => {
		return [
			{ label: 'Mood', tags: tvTags.mood },
			{ label: 'Genre', tags: tvTags.genre },
			{ label: 'Representation', tags: tvTags.representation },
			{ label: 'Themes', tags: tvTags.themes },
			{
				label: 'Viewing experience',
				tags: tvTags.experience,
			},
			{ label: 'Audience', tags: tvTags.audience },
			{ label: 'Misc', tags: tvTags.misc },
		];
	}, [
		tvTags.audience,
		tvTags.experience,
		tvTags.genre,
		tvTags.misc,
		tvTags.mood,
		tvTags.representation,
		tvTags.themes,
	]);

	const warningSection = useMemo(() => {
		return { label: 'Content Warnings', tags: warningTags };
	}, [warningTags]);

	const [openSections, setOpenSections] = useState<Record<string, boolean>>(
		Object.fromEntries(tagSections.map((section) => [section.label, true])),
	);

	const selectTag = (tag: Tag) => {
		if (selectedTags[tag.id] === true) {
			const swap = { ...selectedTags, [tag.id]: false };
			setSelectedTags(swap);
		} else {
			const swap = { ...selectedTags, [tag.id]: true };
			setSelectedTags(swap);
		}
	};

	const selectWarningTag =
		selectedWarningTags && setSelectedWarningTags
			? (tag: Tag) => {
					if (selectedWarningTags[tag.id] === true) {
						const swap = { ...selectedWarningTags, [tag.id]: false };
						setSelectedWarningTags(swap);
					} else {
						const swap = { ...selectedWarningTags, [tag.id]: true };
						setSelectedWarningTags(swap);
					}
				}
			: null;

	const toggleSection = (label: string) => {
		setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
	};
	const isDark = useColorScheme() === 'dark';
	const styles = makeStyles(isDark);

	const collapseAll = useCallback(() => {
		setOpenSections(
			Object.fromEntries(
				[...tagSections, warningSection].map((section) => [
					section.label,
					false,
				]),
			),
		);
	}, [tagSections, warningSection]);

	const openAll = useCallback(() => {
		setOpenSections(
			Object.fromEntries(
				[...tagSections, warningSection].map((section) => [
					section.label,
					true,
				]),
			),
		);
	}, [tagSections, warningSection]);

	useEffect(() => {
		if (collapsed === 'collapse') {
			openAll();
		} else {
			collapseAll();
		}
	}, [collapseAll, collapsed, openAll, tagSections, warningSection]);

	return (
		<View style={styles.container}>
			{generalTagsText && (
				<View>
					<Text style={styles.text}>{generalTagsText}</Text>
				</View>
			)}
			{tagSections.map((section) => (
				<TagSection
					key={section.label}
					label={section.label}
					tags={section.tags}
					selectedTags={selectedTags}
					onSelectTag={selectTag}
					open={openSections[section.label]}
					setOpen={() => toggleSection(section.label)}
				/>
			))}

			{warningTagsText && (
				<View style={{ paddingVertical: 8, paddingTop: 15 }}>
					<Text style={{ ...styles.text }}>{warningTagsText}</Text>
				</View>
			)}
			{!skipWarning ? (
				<TagSection
					key={warningSection.label}
					label={warningSection.label}
					tags={warningSection.tags}
					selectedTags={
						selectedWarningTags ? selectedWarningTags : selectedTags
					}
					onSelectTag={selectWarningTag ? selectWarningTag : selectTag}
					open={openSections[warningSection.label]}
					setOpen={() => toggleSection(warningSection.label)}
					isWarning={true}
				/>
			) : (
				<View style={{ paddingBottom: 35 }}></View>
			)}
		</View>
	);
};

const makeStyles = (isDark: boolean) =>
	StyleSheet.create({
		container: {
			marginTop: 15,
			flex: 1,
			marginHorizontal: 2,
			marginBottom: 20,
		},
		badge: {
			borderRadius: 40,
			paddingHorizontal: 8,
			paddingVertical: 4,
			minWidth: 20,
			maxWidth: 250,
			alignItems: 'center',
			flexShrink: 1,
			alignSelf: 'flex-start',
			fontSize: 12,
			fontWeight: '500',
		},
		badgeText: {
			fontSize: 13.5,
			fontWeight: '500',
			color: 'black',
			flexShrink: 1,
			textAlign: 'center',
		},
		tvBadge: {
			backgroundColor: '#36C9C6',
		},
		warningBadge: {
			backgroundColor: '#E24E1B',
		},
		tagText: {
			fontSize: 13.5,
			fontWeight: '500',
			textAlign: 'center',
		},
		highlightTvTag: {
			paddingVertical: 6,
			paddingHorizontal: 10,
			borderRadius: 40,
			marginHorizontal: 3,
			backgroundColor: '#36C9C6',
			marginTop: 5,
		},
		sectionHeader: {
			flexDirection: 'row',
			paddingHorizontal: 12,
			paddingVertical: 10,
			position: 'relative',
			paddingRight: 36,
		},
		sectionHeaderLeft: {
			flex: 1,
			flexDirection: 'column',
			marginRight: 8,
		},
		chevronContainer: {
			position: 'absolute',
			right: 12,
			top: 8,
		},
		selectedPillsRow: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: 4,
			marginTop: 4,
		},
		sectionLabel: {
			fontSize: 16,
			fontWeight: '600',
			color: isDark ? '#cccccc' : '#444',
			marginRight: 4,
		},
		chevron: {
			fontSize: 13,
			color: isDark ? '#dddddd' : '#888',
		},
		divider: {
			height: 1,
			backgroundColor: '#888',
			marginHorizontal: 10,
		},
		tvTag: {
			paddingVertical: 6,
			paddingHorizontal: 10,
			borderRadius: 40,
			marginHorizontal: 3,
			backgroundColor: '#9BC1BC',
			marginTop: 5,
		},
		warningTag: {
			paddingVertical: 6,
			paddingHorizontal: 10,
			borderRadius: 40,
			marginHorizontal: 3,
			backgroundColor: '#F2A541',
			marginTop: 5,
		},

		highlightWarningTag: {
			paddingVertical: 6,
			paddingHorizontal: 10,
			borderRadius: 40,
			marginHorizontal: 3,
			backgroundColor: '#E24E1B',
			marginTop: 5,
		},
		text: {
			fontSize: 16,
			marginRight: 5,
			margin: 10,
			textAlign: 'center',
			color: isDark ? '#cccccc' : '',
		},
		cardContent: {
			flexDirection: 'row',
			marginLeft: 10,
		},
		tagsContent: {
			flexWrap: 'wrap',
			marginBottom: 8,
		},
	});

export default ShowTagPicker;
