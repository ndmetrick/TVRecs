import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Image,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';

import { ShowImagePlaceholder } from '@/components/SelectShow';
import { UserProfile, UserShow, UserShowType } from '@/lib/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';

interface Props {
	userToView: UserProfile;
	shows: UserShow[];
	type?: UserShowType;
}

const ViewShows = (props: Props) => {
	const { userToView, shows, type } = props;
	const [userShows, setUserShows] = useState<UserShow[] | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

	const isFocused = useIsFocused();

	useEffect(() => {
		if (shows) {
			[...shows].sort(
				(x, y) =>
					new Date(y.updated_at).getTime() - new Date(x.updated_at).getTime(),
			);
			setUserShows(shows);
			setLoading(false);
		}

		return () => {
			setUserShows(null);
			setLoading(true);
		};
	}, [isFocused, shows]);

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
			{type && (
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
});

export default ViewShows;
