import React, { useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

import RecsHeader from '@/components/RecsHeader';
import { ShowImagePlaceholder } from '@/components/SelectShow';
import {
	AppliedShowFilters,
	SourcePage,
	UserProfile,
	UserShow,
	UserShowType,
} from '@/lib/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';

interface Props {
	userToView: UserProfile;
	shows: UserShow[];
	type?: string;
}

const ViewShows = (props: Props) => {
	const { userToView, shows, type } = props;
	const [userShows, setUserShows] = useState<UserShow[] | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
	const [appliedFilters, setAppliedFilters] = useState<AppliedShowFilters>({});
	const [filterOpen, setFilterOpen] = useState(false);
	const [showsLength, setShowsLength] = useState(0);
	const [excludedSourceTypes, setExcludedSourceTypes] = useState<
		Set<UserShowType>
	>(new Set([]));

	const cancelFilters = () => {
		setAppliedFilters({});
	};

	const isFocused = useIsFocused();

	const filteredShows = useMemo(() => {
		if (type !== 'all') return shows;
		let filtered = shows;
		if (excludedSourceTypes.size > 0) {
			filtered = filtered.filter((show) => !excludedSourceTypes.has(show.type));
		}
		if (appliedFilters.hasTags) {
			filtered = filtered.filter((show) => show.tags.length > 0);
		}
		if (appliedFilters.hasDescription) {
			filtered = filtered.filter((show) => !!show.description);
		}
		if (appliedFilters.hasTagIds?.length) {
			filtered = filtered.filter((show) =>
				appliedFilters.hasTagIds?.every((id) =>
					show.tags.some((t) => t.id === id),
				),
			);
		}
		// does not have warning tags filtered out
		if (appliedFilters.notHasTagIds?.length) {
			filtered = filtered.filter((show) =>
				appliedFilters.notHasTagIds?.every(
					(id) => !show.tags.some((t) => t.id === id),
				),
			);
		}
		// setFiltersApplied(!!Object.keys(appliedFilters).length);
		return filtered;
	}, [type, shows, excludedSourceTypes, appliedFilters.hasTags, appliedFilters.hasDescription, appliedFilters.hasTagIds, appliedFilters.notHasTagIds]);

	useEffect(() => {
		setShowsLength(filteredShows.length);
	}, [filteredShows.length]);

	useEffect(() => {
		if (filteredShows) {
			[...filteredShows].sort(
				(x, y) =>
					new Date(y.updated_at).getTime() - new Date(x.updated_at).getTime(),
			);
			setUserShows(filteredShows);
			setLoading(false);
		}

		return () => {
			setUserShows(null);
			setLoading(true);
		};
	}, [isFocused, filteredShows, type]);

	const goToUserShow = (item: UserShow) => {
		router.push({
			pathname: '/singleShow',
			params: {
				userString: JSON.stringify(userToView),
				userShowString: JSON.stringify(item),
			},
		});
	};

	if (loading || !userShows) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' color='#5500dc' />
			</View>
		);
	}

	return (
		<View style={{ flex: 1 }}>
			{type === 'all' && (
				<RecsHeader
					sourcePage={SourcePage.VIEW_SHOWS}
					cancelFilters={cancelFilters}
					appliedFilters={appliedFilters}
					setAppliedFilters={setAppliedFilters}
					filterOpen={filterOpen}
					setFilterOpen={setFilterOpen}
					showsLength={showsLength}
					excludedSourceTypes={excludedSourceTypes}
					setExcludedSourceTypes={setExcludedSourceTypes}
				/>
			)}
			{!filteredShows.length && Object.keys(appliedFilters).length > 0 && (
				<View style={styles.emptyState}>
					<MaterialCommunityIcons
						name='filter-off-outline'
						size={48}
						color='#9BC1BC'
					/>
					<Text style={styles.emptyStateText}>
						You have no shows on your profile matching those filters
					</Text>
				</View>
			)}
			<FlatList
				numColumns={2}
				horizontal={false}
				data={userShows}
				renderItem={({ item }) => (
					<View style={styles.containerImage}>
						<TouchableOpacity onPress={() => goToUserShow(item)}>
							{item.show.image_url && !imageErrors[item.show.id] ? (
								<Image
									style={styles.image}
									source={{ uri: item.show.image_url }}
									onError={() =>
										setImageErrors((prev) => ({
											...prev,
											[item.show.id]: true,
										}))
									}
								/>
							) : (
								<ShowImagePlaceholder
									name={item.show.name}
									style={styles.image}
								/>
							)}
						</TouchableOpacity>
					</View>
				)}
				keyExtractor={(_item, index) => index.toString()}
			/>
			{type && type !== 'all' && (
				<TouchableOpacity
					style={styles.fab}
					onPress={() =>
						router.push({
							pathname: '/(tabs)/addShow',
							params: { addToType: type },
						})
					}
				>
					<MaterialCommunityIcons name='plus' size={28} color='white' />
				</TouchableOpacity>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	showsList: {
		flex: 1,
	},
	text: {
		textAlign: 'left',
		fontSize: 18,
	},
	containerImage: {
		flex: 1 / 2,
	},
	image: {
		flex: 1,
		aspectRatio: 2 / 3,
		// resizeMode: 'cover',
	},
	fab: {
		position: 'absolute',
		bottom: 20,
		right: 20,
		width: 52,
		height: 52,
		borderRadius: 26,
		backgroundColor: '#340068',
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},
	emptyState: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 40,
		gap: 12,
	},
	emptyStateText: {
		fontSize: 16,
		color: '#888',
		textAlign: 'center',
		lineHeight: 24,
	},
	emptyStateLink: {
		fontSize: 16,
		color: '#4056F4',
		fontWeight: '500',
	},
});

export default ViewShows;
