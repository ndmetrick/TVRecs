import ProfileHeader from '@/components/ProfileHeader';
import UserTagsAndDescription from '@/components/UserTagsAndDescription';
import {
	followUser,
	getCurrentUser as getOtherUser,
	getProfileTags,
	getUserFollowing,
	getUserShows,
	unfollowUser,
} from '@/lib/api';
import { useAppData } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import {
	Follow,
	ProfileTag,
	SourcePage,
	UserProfile,
	UserShow,
	UserShowType,
} from '@/lib/types';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import ViewShows from './viewShows';

const OtherUser = () => {
	const { uid, userString } = useLocalSearchParams();
	const otherUserId = uid as string;

	const other: UserProfile | null = userString
		? JSON.parse(userString as string)
		: null;

	const [otherUserShows, setOtherUserShows] = useState<UserShow[]>([]);
	const [otherUser, setOtherUser] = useState<UserProfile | null>(other);
	const [isFollowing, setIsFollowing] = useState(false);
	const [loading, setLoading] = useState(true);
	const [otherUserFollowing, setOtherUserFollowing] = useState<Follow[]>([]);
	const [otherUserTags, setOtherUserTags] = useState<ProfileTag[]>([]);
	const [activeTab, setActiveTab] = useState<'recs' | 'tags'>('recs');

	const { currentUser, following, refetchFollowingRecs } = useAppData();

	useEffect(() => {
		// console.log('i got in here to this other otherUser');
		// if (currentUser) {
		// 	setHeaderHeight(150);
		// 	console.log('i got here to this thing in otherUser');
		// }

		const getAllUserInfo = async () => {
			try {
				const results = await Promise.all([
					otherUser
						? Promise.resolve(otherUser)
						: getOtherUser(supabase, otherUserId),
					getUserShows(supabase, otherUserId, UserShowType.REC),
					getUserFollowing(supabase, otherUserId),
					getProfileTags(supabase, otherUserId),
				]);
				const [fetchedUser, shows, otherFollowing, tags] = results;

				if (fetchedUser) setOtherUser(fetchedUser);
				setOtherUserShows(shows);
				setOtherUserFollowing(otherFollowing);
				setOtherUserTags(tags);
				setIsFollowing(following.some((f) => f.followedUserId === otherUserId));
				setLoading(false);
			} catch (err) {
				console.error(err);
				setLoading(false);
			}
		};
		getAllUserInfo();
		return () => {
			setOtherUserShows([]);
			setOtherUser(null);
			setIsFollowing(false);
			setOtherUserFollowing([]);
			setOtherUserTags([]);
		};
	}, [otherUser, following, otherUserId]);

	const follow = async () => {
		try {
			if (currentUser && otherUser) {
				await followUser(supabase, currentUser.id, otherUser.id);
				await refetchFollowingRecs();
				setIsFollowing(true);
			}
		} catch (err) {
			console.log(err);
		}
	};
	const unfollow = async () => {
		try {
			if (currentUser && otherUser) {
				await unfollowUser(supabase, currentUser.id, otherUser.id);
				await refetchFollowingRecs();
				setIsFollowing(false);
			}
		} catch (err) {
			console.log(err);
		}
	};

	if (loading || otherUser === null) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' color='#5500dc' />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ProfileHeader
				previous={SourcePage.OTHER_USER}
				userFollowing={otherUserFollowing}
				user={otherUser}
				followingThisUser={isFollowing}
				follow={follow}
				unfollow={unfollow}
			/>
			<View style={styles.tabSwitcher}>
				<TouchableOpacity
					onPress={() => setActiveTab('recs')}
					style={[
						styles.tabButton,
						activeTab === 'recs' && styles.tabButtonActive,
					]}
				>
					<Text style={styles.tabButtonText}>
						Recs ({otherUserShows.length})
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setActiveTab('tags')}
					style={[
						styles.tabButton,
						activeTab === 'tags' && styles.tabButtonActive,
					]}
				>
					<Text style={styles.tabButtonText}>Tags/Bio</Text>
				</TouchableOpacity>
			</View>
			{activeTab === 'recs' ? (
				<ViewShows userToView={otherUser} shows={otherUserShows} />
			) : (
				<UserTagsAndDescription
					user={otherUser}
					userTags={otherUserTags}
					isCurrentUser={false}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	tabSwitcher: {
		flexDirection: 'row',
		backgroundColor: '#340068',
	},
	tabButton: {
		flex: 1,
		padding: 10,
		alignItems: 'center',
		opacity: 0.8,
	},
	tabButtonActive: {
		borderBottomWidth: 6,
		borderBottomColor: '#36C9C6',
		opacity: 1,
	},
	tabButtonText: {
		color: 'white',
		fontWeight: '500',
		fontSize: 14,
	},
});

export default OtherUser;
