import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Image,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';

import { UserProfile, UserShow } from '@/lib/types';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';

interface Props {
	userToView: UserProfile;
	shows: UserShow[];
}

const ViewShows = (props: Props) => {
	const { userToView, shows } = props;
	const [userShows, setUserShows] = useState<UserShow[] | null>(null);
	const [loading, setLoading] = useState(true);

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
		<FlatList
			numColumns={2}
			horizontal={false}
			data={userShows}
			renderItem={({ item }) => (
				<View style={styles.containerImage}>
					<TouchableOpacity onPress={() => goToUserShow(item)}>
						<Image style={styles.image} source={{ uri: item.show.image_url }} />
					</TouchableOpacity>
				</View>
			)}
			keyExtractor={(item, index) => index.toString()}
		/>
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
});

export default ViewShows;
