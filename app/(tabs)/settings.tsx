import * as Sentry from '@sentry/react-native';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Linking,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

import ChangeCountry from '@/components/ChangeCountry';
import UpdateAccount from '@/components/UpdateAccount';
import { useAppData } from '@/lib/AppContext';
import { useAuth } from '@/lib/AuthContext';
import { getProfileTags, updateUser } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { showErrorToast } from '@/lib/toast';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Settings = () => {
	const { currentUser } = useAppData();
	const [countryCode, setCountryCode] = useState(currentUser?.country ?? 'US');
	const [saveCountry, setSaveCountry] = useState(false);
	const [countryOpen, setCountryOpen] = useState(false);
	const [tagsOpen, setTagsOpen] = useState(false);
	const [usernameOpen, setUsernameOpen] = useState(false);
	const [deleteUserOpen, setDeleteUserOpen] = useState(false);
	const { signOut } = useAuth();
	const [saving, setSaving] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (tagsOpen) setSaving(false);
	}, [tagsOpen]);

	const goToUserTags = async () => {
		try {
			setSaving(true);
			const profileTags = currentUser
				? await getProfileTags(supabase, currentUser.id)
				: [];
			router.push({
				pathname: '/pickUserTags',
				params: {
					profileTagsString: JSON.stringify(profileTags),
				},
			});
		} catch (err) {
			console.error(`Error getting profile tags: ${err}`);
			showErrorToast('Could not load your profile tags');
			Sentry.captureException(err, {
				tags: { location: 'getProfileTags' },
			});
		} finally {
			setSaving(false);
		}
	};

	const logout = async () => {
		try {
			await signOut();
			router.replace('/login');
		} catch (e) {
			console.log(`Error signing out: ${e}`);
			showErrorToast('There was an error signing out');
			Sentry.captureException(e, {
				tags: { location: 'settingsLogout' },
			});
		}
	};

	const saveNewCountry = async () => {
		if (currentUser) {
			try {
				await updateUser(supabase, currentUser.id, { country: countryCode });
				setSaveCountry(false);
			} catch (err) {
				console.log(`Error saving new country: ${err}`);
				showErrorToast('There was an error changing your country');
				Sentry.captureException(err, {
					tags: { location: 'saveNewCountry' },
				});
			}
		}
	};

	return (
		<View style={styles.container}>
			{currentUser && (
				<View style={styles.userCard}>
					<View style={styles.userAvatar}>
						<Text style={styles.userAvatarText}>
							{currentUser.username[0].toUpperCase()}
						</Text>
					</View>
					<View>
						<Text style={styles.userCardLabel}>signed in as</Text>
						<Text style={styles.userCardName}>{currentUser.username}</Text>
					</View>
				</View>
			)}
			<ScrollView keyboardShouldPersistTaps='handled'>
				<TouchableOpacity
					style={styles.row}
					onPress={() => router.push({ pathname: '../FAQ' })}
				>
					<Text style={styles.rowText}>User guide</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={countryOpen ? styles.openRow : styles.row}
					onPress={() => setCountryOpen(!countryOpen)}
				>
					<Text style={styles.rowText}>Change country </Text>
					<MaterialCommunityIcons
						name={countryOpen ? 'chevron-down' : 'chevron-right'}
						size={18}
						color='#777'
					/>
				</TouchableOpacity>
				{countryOpen ? (
					<View style={styles.expandedContent}>
						<ChangeCountry
							setCountryCode={setCountryCode}
							saveCountry={saveCountry}
							setSaveCountry={setSaveCountry}
							countryCode={countryCode}
							saveNewCountry={saveNewCountry}
						/>
					</View>
				) : null}

				<TouchableOpacity
					style={tagsOpen ? styles.openRow : styles.row}
					onPress={() => setTagsOpen(!tagsOpen)}
				>
					<Text style={styles.rowText}>User tags and TV bio </Text>
					<MaterialCommunityIcons
						name={tagsOpen ? 'chevron-down' : 'chevron-right'}
						size={18}
						color='#777'
					/>
				</TouchableOpacity>
				{tagsOpen ? (
					<View style={styles.expandedContent}>
						<Text style={styles.text}>
							{`Just as you can add tags and descriptions to a TV show, you can add them to your own profile. Other users looking at your profile will see these tags and description along with all the shows you're recommending. These will give others a view into what kinds of shows you like and why, and will help them decide if your recommendations might be a good match for them. People you don't know will also be able to search for you based on these tags (for instance if they want to receive recommendations from others who also like TV shows with the 'town comes together' theme or they also like really silly shows.`}
						</Text>
						<View
							style={{
								...styles.buttonContainer,
								alignItems: 'center',
								marginTop: 5,
							}}
						>
							<TouchableOpacity
								style={[styles.centerButton, saving && styles.buttonDisabled]}
								onPress={goToUserTags}
								disabled={saving}
							>
								<Text style={{ ...styles.buttonText, color: 'white' }}>
									Create/update user tags and tv bio
								</Text>
								{saving && (
									<ActivityIndicator
										size='small'
										color='white'
										style={{
											position: 'absolute',
											top: 0,
											bottom: 0,
											left: 0,
											right: 0,
										}}
									/>
								)}
							</TouchableOpacity>
						</View>
					</View>
				) : null}

				<TouchableOpacity
					disabled={!currentUser}
					style={usernameOpen ? styles.openRow : styles.row}
					onPress={() => setUsernameOpen(!usernameOpen)}
				>
					<Text style={currentUser ? styles.rowText : styles.disabledRowText}>
						Change username{' '}
					</Text>
					<MaterialCommunityIcons
						name={usernameOpen ? 'chevron-down' : 'chevron-right'}
						size={18}
						color='#777'
					/>
				</TouchableOpacity>
				{usernameOpen ? (
					<View style={styles.expandedContent}>
						<UpdateAccount
							updateType='username'
							setUsernameOpen={setUsernameOpen}
						/>
					</View>
				) : null}

				<TouchableOpacity
					disabled={!currentUser}
					style={deleteUserOpen ? styles.openRow : styles.row}
					onPress={() => setDeleteUserOpen(!deleteUserOpen)}
				>
					<Text style={currentUser ? styles.rowText : styles.disabledRowText}>
						Delete Account{' '}
					</Text>
					<MaterialCommunityIcons
						name={deleteUserOpen ? 'chevron-down' : 'chevron-right'}
						size={18}
						color='#777'
					/>
				</TouchableOpacity>
				{deleteUserOpen ? (
					<View style={styles.expandedContent}>
						<UpdateAccount updateType='delete' />
					</View>
				) : null}

				<TouchableOpacity
					disabled={!currentUser}
					style={styles.row}
					onPress={logout}
				>
					<Text
						style={currentUser ? styles.rowTextDanger : styles.disabledRowText}
					>
						Sign out
					</Text>
				</TouchableOpacity>

				<View
					style={{
						...styles.buttonContainer,
						marginTop: 20,
					}}
				>
					<TouchableOpacity
						onPress={() =>
							Linking.openURL(
								'https://www.termsfeed.com/live/3d7fd044-566e-4e51-9fd7-aa561f45932a',
							)
						}
					>
						<Text
							style={{
								...styles.text,
								marginLeft: 15,
								margin: 5,
								color: 'blue',
							}}
						>
							Privacy Policy
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginBottom: 30,
		flexDirection: 'column',
	},
	containerInfo: {
		margin: 5,
		padding: 5,
	},
	text: {
		textAlign: 'left',
		fontSize: 18,
	},
	buttonText: {
		textAlign: 'center',
		fontSize: 18,
		margin: 5,
		fontWeight: '500',
	},
	buttonContainer: {
		flexDirection: 'column',
		alignItems: 'flex-start',
		// marginHorizontal: 15,
		marginVertical: 5,
	},
	centerButton: {
		padding: 5,
		borderRadius: 10,
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
	userTags: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#008DD5',
		marginTop: 5,
	},
	buttonDisabled: {
		backgroundColor: '#777',
		opacity: 0.7,
	},
	tagText: {
		fontSize: 13.5,
		fontWeight: '500',
	},
	userCard: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		backgroundColor: 'white',
		padding: 16,
		marginBottom: 4,
		borderBottomWidth: 0.5,
		borderColor: '#ddd',
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
	userCardLabel: {
		fontSize: 13,
		color: '#888',
	},
	userCardName: {
		fontSize: 16,
		fontWeight: '500',
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 15,
		borderBottomWidth: 0.5,
		borderColor: '#ddd',
	},
	openRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 15,
	},
	rowText: {
		fontSize: 18,
		fontWeight: '500',
	},
	disabledRowText: {
		fontSize: 18,
		fontWeight: '400',
		color: '#777',
	},
	rowTextDanger: {
		fontSize: 18,
		fontWeight: '500',
		color: '#c00',
	},
	expandedContent: {
		paddingHorizontal: 15,
		paddingBottom: 10,
		paddingLeft: 20,
		borderBottomWidth: 0.5,
		borderColor: '#ddd',
	},
});

export default Settings;
