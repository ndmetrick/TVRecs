import * as Sentry from '@sentry/react-native';
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from 'react-native';

import { followUser, unfollowUser } from '@/lib/api';
import { useAppData } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { showErrorToast } from '@/lib/toast';
import { Follow, UserProfile } from '@/lib/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

function UsersFollowing() {
	const { userString, userFollowingString } = useLocalSearchParams();
	// const previous = previousString as SourcePage;
	const [isFollowing, setIsFollowing] = useState<Follow[]>([]);
	const [notFollowing, setNotFollowing] = useState<Follow[]>([]);
	const [loading, setLoading] = useState(true);
	const [followsMe, setFollowsMe] = useState(false);
	const { currentUser, followingMap, refetchFollowing, refetchFollowingRecs } =
		useAppData();
	const isDark = useColorScheme() === 'dark';
	const styles = makeStyles(isDark);

	useEffect(() => {
		if (!userFollowingString) return;
		const userFollowing: Follow[] = JSON.parse(userFollowingString as string);
		if (!currentUser) {
			setNotFollowing(userFollowing);
			setLoading(false);
		} else {
			const follows: Follow[] = [];
			const nonFollows: Follow[] = [];
			userFollowing.forEach((follow) => {
				if (currentUser?.id === follow.followedUserId) {
					setFollowsMe(true);
				} else if (followingMap[follow.followedUserId]) {
					follows.push(follow);
				} else {
					nonFollows.push(follow);
				}
			});
			setIsFollowing(follows);
			setNotFollowing(nonFollows);
			setLoading(false);
		}
	}, [currentUser, followingMap, userFollowingString]);

	const follow = async (otherUserId: string) => {
		try {
			if (currentUser) {
				await followUser(supabase, currentUser.id, otherUserId);
				await refetchFollowing();
				await refetchFollowingRecs();
			}
		} catch (err) {
			console.error(`Error following user: ${err}`);
			showErrorToast('Error trying to follow. Try again.');
			Sentry.captureException(err, {
				tags: { location: 'follow' },
			});
		}
	};
	const unfollow = async (otherUserId: string) => {
		try {
			if (currentUser) {
				await unfollowUser(supabase, currentUser.id, otherUserId);
				await refetchFollowing();
				await refetchFollowingRecs();
			}
		} catch (err) {
			console.error(`Error unfollowing user: ${err}`);
			showErrorToast('Error trying to unfollow. Try again.');
			Sentry.captureException(err, {
				tags: { location: 'unfollow' },
			});
		}
	};

	const userName = (user: UserProfile, isCurrentUser: boolean) => {
		return (
			<TouchableOpacity
				style={styles.userRow}
				onPress={
					isCurrentUser
						? () => router.push('/currentUser')
						: () =>
								router.push({
									pathname: '/otherUser',
									params: {
										uid: user.id,
										userString: JSON.stringify(user),
									},
								})
				}
			>
				<MaterialCommunityIcons
					name='account'
					size={18}
					color={isDark ? '#999999' : '#888'}
				/>
				<Text style={styles.usernameText}>{user.username}</Text>
				<MaterialCommunityIcons
					name='chevron-right'
					size={16}
					color={isDark ? '#bbbbbb' : '#888'}
				/>
			</TouchableOpacity>
		);
	};

	if (loading || !userString) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<ActivityIndicator size='large' color='#5500dc' />
			</View>
		);
	}

	const user: UserProfile = JSON.parse(userString as string);

	return (
		<View style={styles.container}>
			<View style={styles.heading}>
				<Text style={styles.headingText}>{user.username} follows:</Text>
			</View>
			<View>
				{currentUser && followsMe ? (
					<View style={styles.followedUserContainer}>
						{userName(currentUser, false)}
					</View>
				) : null}
				{isFollowing.map((followed, index) => (
					<View key={index} style={styles.followedUserContainer}>
						{userName(followed.user, false)}
						{currentUser ? (
							<TouchableOpacity
								style={styles.followed}
								onPress={() => unfollow(followed.followedUserId)}
							>
								<Text style={styles.text}>Following</Text>
							</TouchableOpacity>
						) : null}
					</View>
				))}
				{notFollowing.map((followed, index) => (
					<View key={index} style={styles.followedUserContainer}>
						{userName(followed.user, false)}
						{currentUser ? (
							<TouchableOpacity
								style={styles.unfollowed}
								onPress={() => follow(followed.followedUserId)}
							>
								<Text style={styles.text}>Follow</Text>
							</TouchableOpacity>
						) : null}
					</View>
				))}
			</View>
		</View>
	);
}

const makeStyles = (isDark: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			marginTop: 10,
			backgroundColor: isDark ? '#5a5a5a' : '#f5f5f5',
		},
		containerInfo: {
			margin: 5,
			padding: 5,
			borderStyle: 'solid',
			borderColor: 'blue',
			borderWidth: 2,
		},
		followedUserContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginBottom: 5,
		},
		followedContainer: {
			flexDirection: 'column',
		},
		text: {
			textAlign: 'center',
			fontSize: 18,
			margin: 5,
		},
		buttonText: {
			textAlign: 'center',
			fontSize: 18,
			margin: 5,
			fontWeight: '500',
			color: 'white',
		},
		buttonContainer: {
			flexDirection: 'row',
			justifyContent: 'center',
		},
		button: {
			padding: 10,
			borderRadius: 40,
			marginHorizontal: 3,
			backgroundColor: '#340068',
			marginTop: 5,
		},
		followed: {
			padding: 5,
			borderRadius: 10,
			marginHorizontal: 10,
			backgroundColor: 'lightblue',
			marginTop: 5,
			maxWidth: 200,
		},
		unfollowed: {
			padding: 5,
			borderRadius: 10,
			marginHorizontal: 3,
			backgroundColor: '#36C9C6',
			marginTop: 5,
			width: 100,
		},
		heading: {
			backgroundColor: '#340068',
			padding: 14,
			marginBottom: 10,
		},
		headingText: {
			color: isDark ? '#cccccc' : 'white',
			fontSize: 20,
			fontWeight: '600',
			textAlign: 'center',
		},
		userRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 5,
			paddingVertical: 12,
			paddingHorizontal: 8,
		},
		usernameText: {
			fontSize: 18,
			fontWeight: '500',
			color: isDark ? '#cccccc' : '#222',
		},
		userAvatar: {
			width: 40,
			height: 40,
			borderRadius: 20,
			backgroundColor: '#340068',
			alignItems: 'center',
			justifyContent: 'center',
		},
		userAvatarText: {
			color: 'white',
			fontSize: 16,
			fontWeight: '500',
		},
	});

export default UsersFollowing;
