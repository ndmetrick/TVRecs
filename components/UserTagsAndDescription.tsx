import { useAppData } from '@/lib/AppContext';
import { ProfileTag, ProfileTagCategory, UserProfile } from '@/lib/types';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	useColorScheme,
	View,
} from 'react-native';

interface Props {
	user: UserProfile;
	userTags: ProfileTag[];
	isCurrentUser: boolean;
}

type SortedProfileTags = {
	like: ProfileTag[];
	dislike: ProfileTag[];
	describe: ProfileTag[];
};

const UserTagsAndDescription = (props: Props) => {
	const { currentUser } = useAppData();
	const isFocused = useIsFocused();
	const { user, userTags, isCurrentUser } = props;
	const [sortedProfileTags, setSortedProfileTags] =
		useState<SortedProfileTags | null>(null);
	const isDark = useColorScheme() === 'dark';
	const styles = makeStyles(isDark);

	useEffect(() => {
		const like: ProfileTag[] = [];
		const dislike: ProfileTag[] = [];
		const describe: ProfileTag[] = [];
		userTags.forEach((tag) => {
			if (tag.category === ProfileTagCategory.DESCRIBE) {
				describe.push(tag);
			} else if (tag.category === ProfileTagCategory.DISLIKE) {
				dislike.push(tag);
			} else {
				like.push(tag);
			}
		});
		const tags: SortedProfileTags = { like, describe, dislike };

		setSortedProfileTags(tags);

		return () => {
			setSortedProfileTags(null);
		};
	}, [isFocused, userTags]);

	if (user === null || !userTags || !sortedProfileTags) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' color='#5500dc' />
			</View>
		);
	}

	const displayTags = (tags: ProfileTag[], type: ProfileTagCategory) => {
		const tagStyle =
			type === ProfileTagCategory.LIKE
				? styles.highlightLikeTag
				: type === ProfileTagCategory.DISLIKE
					? styles.highlightDislikeTag
					: styles.highlightDescribeTag;

		return tags.map((profileTag, key) => {
			return (
				<View key={key} style={tagStyle}>
					<Text style={styles.tagText}>{profileTag.tag.name}</Text>
				</View>
			);
		});
	};

	return (
		<>
			{!isCurrentUser ? (
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.container}
				>
					<View>
						{!user.description ? (
							<View style={styles.otherUser}>
								<Text style={styles.text}>
									<Text style={{ fontWeight: 'bold' }}>TV Bio: </Text>None yet
								</Text>
							</View>
						) : (
							<View style={styles.otherUser}>
								<Text style={styles.text}>
									<Text style={{ fontWeight: 'bold' }}>TV Bio: </Text>
									{user.description}
								</Text>
							</View>
						)}
						{!sortedProfileTags.like.length &&
						!sortedProfileTags.dislike.length &&
						!sortedProfileTags.describe.length ? (
							<View style={styles.otherUser}>
								<Text style={styles.text}>
									<Text style={{ fontWeight: 'bold' }}>User Tags:</Text> None
									yet.
								</Text>
							</View>
						) : (
							<View style={styles.otherUser}>
								<View>
									{sortedProfileTags.like.length ? (
										<View>
											<Text style={{ ...styles.text, fontWeight: 'bold' }}>
												These tags describe the kinds of shows {user.username}{' '}
												likes best:
											</Text>
											<View style={[styles.cardContent, styles.tagsContent]}>
												{displayTags(
													sortedProfileTags.like,
													ProfileTagCategory.LIKE,
												)}
											</View>
										</View>
									) : null}

									{sortedProfileTags.dislike.length ? (
										<View>
											<Text style={{ ...styles.text, fontWeight: 'bold' }}>
												These tags describe things {user.username} tries to
												avoid seeing:
											</Text>
											<View style={[styles.cardContent, styles.tagsContent]}>
												{displayTags(
													sortedProfileTags.dislike,
													ProfileTagCategory.DISLIKE,
												)}
											</View>
										</View>
									) : null}

									{sortedProfileTags.describe.length ? (
										<View>
											<Text style={{ ...styles.text, fontWeight: 'bold' }}>
												These tags describe the kind of television watcher{' '}
												{user.username} is:
											</Text>
											<View style={[styles.cardContent, styles.tagsContent]}>
												{displayTags(
													sortedProfileTags.describe,
													ProfileTagCategory.DESCRIBE,
												)}
											</View>
										</View>
									) : null}
								</View>
							</View>
						)}
					</View>
				</ScrollView>
			) : (
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.container}
				>
					<View>
						<Text style={{ ...styles.text, marginBottom: 5, marginTop: 8 }}>
							<Text style={{ fontWeight: 'bold' }}>TV Bio: </Text>
							{!currentUser?.description
								? 'Currently you have no tv bio on your profile. Click the button below if you would like to add one.'
								: currentUser.description}
						</Text>
						{!sortedProfileTags.like.length &&
						!sortedProfileTags.dislike.length &&
						!sortedProfileTags.describe.length ? (
							<Text style={styles.text}>
								<Text style={{ fontWeight: 'bold' }}>User Tags:</Text> Currently
								you have no user tags. Click the button below if you would like
								to add some.
							</Text>
						) : (
							<View>
								{sortedProfileTags.like.length ? (
									<View>
										<Text style={{ ...styles.text, fontWeight: 'bold' }}>
											These tags describe the kinds of shows you like best:
										</Text>
										<View style={[styles.cardContent, styles.tagsContent]}>
											{displayTags(
												sortedProfileTags.like,
												ProfileTagCategory.LIKE,
											)}
										</View>
									</View>
								) : null}

								{sortedProfileTags.dislike.length ? (
									<View>
										<Text style={{ ...styles.text, fontWeight: 'bold' }}>
											These tags describe things you try to avoid seeing:
										</Text>
										<View style={[styles.cardContent, styles.tagsContent]}>
											{displayTags(
												sortedProfileTags.dislike,
												ProfileTagCategory.DISLIKE,
											)}
										</View>
									</View>
								) : null}

								{sortedProfileTags.describe.length ? (
									<View>
										<Text style={{ ...styles.text, fontWeight: 'bold' }}>
											These tags describe the kind of television watcher you
											are:
										</Text>
										<View style={[styles.cardContent, styles.tagsContent]}>
											{displayTags(
												sortedProfileTags.describe,
												ProfileTagCategory.DESCRIBE,
											)}
										</View>
									</View>
								) : null}
							</View>
						)}
					</View>
				</ScrollView>
			)}
		</>
	);
};

const makeStyles = (isDark: boolean) =>
	StyleSheet.create({
		container: {
			marginTop: 10,
			marginBottom: 30,
		},
		containerInfo: {
			margin: 5,
			padding: 5,
		},
		text: {
			textAlign: 'left',
			fontSize: 18,
			color: isDark ? '#cccccc' : '#222',
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
		cardContent: {
			flexDirection: 'row',
			marginLeft: 10,
		},
		tagsContent: {
			marginTop: 10,
			flexWrap: 'wrap',
			marginBottom: 10,
		},
		highlightLikeTag: {
			padding: 10,
			borderRadius: 40,
			marginHorizontal: 3,
			backgroundColor: '#008DD5',
			marginTop: 5,
		},
		highlightDislikeTag: {
			padding: 10,
			borderRadius: 40,
			marginHorizontal: 3,
			backgroundColor: '#E24E1B',
			marginTop: 5,
		},
		highlightDescribeTag: {
			padding: 10,
			borderRadius: 40,
			marginHorizontal: 3,
			backgroundColor: '#7B5D96',
			marginTop: 5,
		},

		tagText: {
			fontSize: 14,
			fontWeight: '500',
			textAlign: 'center',
		},
		otherUser: {
			margin: 10,
		},
	});

export default UserTagsAndDescription;
