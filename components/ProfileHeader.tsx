import { useAppData } from '@/lib/AppContext';
import { Follow, SourcePage, UserProfile } from '@/lib/types';
import { useRouter } from 'expo-router';
import React from 'react';
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

interface Props {
	previous: SourcePage;
	user: UserProfile | null;
	userFollowing: Follow[] | null;
	followingThisUser?: boolean;
	follow?: () => Promise<void>;
	unfollow?: () => Promise<void>;
}

const ProfileHeader = (props: Props) => {
	const { previous, user, userFollowing, followingThisUser, follow, unfollow } =
		props;
	const { currentUser } = useAppData();
	const router = useRouter();

	if (userFollowing === null || user === null) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' color='#5500dc' />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.topContainerInfo}>
				{previous === SourcePage.CURRENT_USER ? (
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: 10 }}>
						<View style={styles.usernameButton}>
							<Text style={styles.usernameText}>Your</Text>
						</View>
						<View style={styles.recButton}>
							<Text style={styles.recText}> shows</Text>
						</View>
					</View>
				) : (
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: 10 }}>
						<View style={styles.usernameButton}>
							<Text style={styles.usernameText}>{user.username}</Text>
						</View>
						<View style={styles.recButton}>
							<Text style={styles.recText}>{"'s profile"}</Text>
						</View>
					</View>
				)}
			</View>

			<View style={styles.bottomContainerInfo}>
				{userFollowing.length > 0 ? (
					<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
						<View style={styles.invisibleButton}>
							<Text
								style={{
									...styles.recText,
									marginLeft: 4,
									marginRight: 0,
									color: 'black',
								}}
							>
								{previous === SourcePage.OTHER_USER
									? `${user.username} follows`
									: 'You follow'}
							</Text>
						</View>
						<TouchableOpacity
							onPress={() =>
								// props.navigation.navigate('UsersFollowing', {
								// 	previous,
								// 	userInfo: user,
								// 	userFollowing: userFollowing,
								// })
								// console.log('going to UsersFollowing when ready')
								router.push({
									pathname: '/usersFollowing',
									params: {
										userString: JSON.stringify(user),
										userFollowingString: JSON.stringify(userFollowing),
									},
								})
							}
							style={styles.followNumButton}
						>
							<Text style={styles.followNumText}> {userFollowing.length} </Text>
						</TouchableOpacity>
						<View style={styles.invisibleButton}>
							<Text style={{ ...styles.recText, color: 'black' }}>
								{userFollowing.length === 1 ? 'person' : 'people'}
							</Text>
						</View>
					</View>
				) : (
					<View>
						<Text style={{ ...styles.text, textAlign: 'left' }}>
							{previous === SourcePage.OTHER_USER
								? `${user.username} doesn't `
								: `You don't `}
							follow anyone
						</Text>
					</View>
				)}
				{previous === SourcePage.CURRENT_USER || !currentUser ? null : (
					<View>
						{followingThisUser && unfollow ? (
							<View style={styles.buttonContainer}>
								<TouchableOpacity
									style={styles.button}
									onPress={() => unfollow()}
								>
									<Text style={styles.buttonText}>stop following</Text>
								</TouchableOpacity>
							</View>
						) : follow ? (
							<View style={styles.buttonContainer}>
								<TouchableOpacity
									style={styles.button}
									onPress={() => follow()}
								>
									<Text style={styles.buttonText}>follow {user.username}</Text>
								</TouchableOpacity>
							</View>
						) : null}
					</View>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		// flex: 1,
	},
	topContainerInfo: {
		padding: 5,
		backgroundColor: '#340068',
		alignItems: 'center',
	},
	bottomContainerInfo: {
		// flexDirection: 'row',
		// flexWrap: 'wrap',
		backgroundColor: '#E9ECEF',
		// justifyContent: 'space-between',
	},
	headingText: {
		fontWeight: '500',
		fontSize: 20,
		margin: 10,
	},
	text: {
		textAlign: 'left',
		fontSize: 18,
		marginLeft: 5,
		fontWeight: '500',
	},
	buttonText: {
		textAlign: 'center',
		fontSize: 18,
		margin: 2,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
	},
	button: {
		padding: 3,
		borderRadius: 10,
		borderWidth: 1,
		marginHorizontal: 3,
		// backgroundColor: '#36C9C6',
		marginBottom: 5,
		marginLeft: 8,
	},
	usernameButton: {
		borderRadius: 25,
		elevation: 3,
		backgroundColor: '#4056F4',
	},
	followNumButton: {
		marginTop: 5,
		borderRadius: 50,
		elevation: 3,
		backgroundColor: '#4056F4',
		marginBottom: 5,
	},
	recButton: {
		borderRadius: 25,
		backgroundColor: '#340068',
	},
	invisibleButton: {
		margin: 5,
		borderRadius: 25,
		backgroundColor: '#E9ECEF',
	},
	usernameText: {
		fontWeight: '500',
		fontSize: 20,
		letterSpacing: 0.25,
		margin: 4,
		color: 'white',
	},
	followNumText: {
		fontWeight: '500',
		fontSize: 20,
		margin: 4,
		color: 'white',
	},
	recText: {
		fontWeight: '500',
		fontSize: 20,
		letterSpacing: 0.25,
		marginBottom: 4,
		marginTop: 4,
		marginRight: 4,
		color: 'white',
	},
});

export default ProfileHeader;
