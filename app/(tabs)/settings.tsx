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
	const [passwordOpen, setPasswordOpen] = useState(false);
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
				<View style={styles.tagsCard}>
					<TouchableOpacity
						style={styles.tagsCardHeader}
						onPress={() => setTagsOpen(!tagsOpen)}
					>
						<View>
							<Text style={styles.tagsCardLabel}>your tv identity</Text>
							<Text style={styles.tagsCardTitle}>User tags and TV bio</Text>
						</View>
						<MaterialCommunityIcons
							name={tagsOpen ? 'chevron-down' : 'chevron-right'}
							size={18}
							color='#340068'
						/>
					</TouchableOpacity>
					{tagsOpen && (
						<View style={styles.tagsCardExpanded}>
							<Text style={styles.tagsText}>
								{`Just as you can add tags and descriptions to a TV show, you can add them to your own profile...`}
							</Text>
							<View style={{ alignItems: 'center', marginTop: 5 }}>
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
					)}
				</View>

				<Text style={styles.sectionLabel}>Account</Text>

				<View style={styles.accountCard}>
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
						<Text style={styles.rowText}>Change country</Text>
						<MaterialCommunityIcons
							name={countryOpen ? 'chevron-down' : 'chevron-right'}
							size={18}
							color='#777'
						/>
					</TouchableOpacity>
					{countryOpen && (
						<View style={styles.expandedContent}>
							<ChangeCountry
								setCountryCode={setCountryCode}
								saveCountry={saveCountry}
								setSaveCountry={setSaveCountry}
								countryCode={countryCode}
								saveNewCountry={saveNewCountry}
							/>
						</View>
					)}

					<TouchableOpacity
						disabled={!currentUser}
						style={usernameOpen ? styles.openRow : styles.row}
						onPress={() => setUsernameOpen(!usernameOpen)}
					>
						<Text style={currentUser ? styles.rowText : styles.disabledRowText}>
							Change username
						</Text>
						<MaterialCommunityIcons
							name={usernameOpen ? 'chevron-down' : 'chevron-right'}
							size={18}
							color='#777'
						/>
					</TouchableOpacity>
					{usernameOpen && (
						<View style={styles.expandedContent}>
							<UpdateAccount
								updateType='username'
								setUsernameOpen={setUsernameOpen}
							/>
						</View>
					)}
					<TouchableOpacity
						disabled={!currentUser}
						style={passwordOpen ? styles.openRow : styles.row}
						onPress={() => setPasswordOpen(!passwordOpen)}
					>
						<Text style={currentUser ? styles.rowText : styles.disabledRowText}>
							Change password
						</Text>
						<MaterialCommunityIcons
							name={passwordOpen ? 'chevron-down' : 'chevron-right'}
							size={18}
							color='#777'
						/>
					</TouchableOpacity>
					{passwordOpen && (
						<View style={styles.expandedContent}>
							<UpdateAccount
								updateType='password'
								setPasswordOpen={setPasswordOpen}
							/>
						</View>
					)}

					<TouchableOpacity
						disabled={!currentUser}
						style={[
							deleteUserOpen ? styles.openRow : styles.row,
							styles.lastRow,
						]}
						onPress={() => setDeleteUserOpen(!deleteUserOpen)}
					>
						<Text style={currentUser ? styles.rowText : styles.disabledRowText}>
							Delete Account
						</Text>
						<MaterialCommunityIcons
							name={deleteUserOpen ? 'chevron-down' : 'chevron-right'}
							size={18}
							color='#777'
						/>
					</TouchableOpacity>
					{deleteUserOpen && (
						<View style={[styles.expandedContent, styles.lastExpandedContent]}>
							<UpdateAccount updateType='delete' />
						</View>
					)}
				</View>

				<View style={styles.accountCard}>
					<TouchableOpacity
						disabled={!currentUser}
						style={[styles.row, styles.lastRow]}
						onPress={logout}
					>
						<Text
							style={
								currentUser ? styles.rowTextDanger : styles.disabledRowText
							}
						>
							Sign out
						</Text>
					</TouchableOpacity>
				</View>

				<View style={{ marginTop: 8, marginLeft: 20 }}>
					<TouchableOpacity
						onPress={() =>
							Linking.openURL(
								'https://www.termsfeed.com/live/3d7fd044-566e-4e51-9fd7-aa561f45932a',
							)
						}
					>
						<Text style={{ ...styles.text, color: 'blue' }}>
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
		backgroundColor: '#eef1f8',
	},
	containerInfo: {
		margin: 5,
		padding: 5,
	},
	text: {
		textAlign: 'left',
		fontSize: 18,
	},
	tagsText: {
		textAlign: 'left',
		fontSize: 18,
		color: 'rgba(255,255,255,0.75)',
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
		marginTop: 6,
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
		justifyContent: 'space-between',
	},
	openRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
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
	sectionLabel: {
		fontSize: 11,
		color: '#888',
		textTransform: 'uppercase',
		letterSpacing: 0.6,
		paddingHorizontal: 15,
		paddingTop: 16,
		paddingBottom: 6,
	},
	tagsCard: {
		marginHorizontal: 15,
		marginVertical: 10,
		borderRadius: 10,
		borderWidth: 1.5,
		borderColor: '#340068',
		overflow: 'hidden',
		backgroundColor: '#4056F4',
	},
	accountCard: {
		marginHorizontal: 15,
		marginVertical: 4,
		borderRadius: 10,
		backgroundColor: 'white',
		overflow: 'hidden',
	},
	tagsCardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 14,
		paddingHorizontal: 15,
	},
	tagsCardLabel: {
		fontSize: 11,
		color: 'white',
		marginBottom: 2,
	},
	tagsCardTitle: {
		fontSize: 18,
		fontWeight: '500',
		color: 'white',
	},
	tagsCardExpanded: {
		borderTopWidth: 1,
		borderTopColor: '#36C9C6',
		paddingHorizontal: 15,
		paddingVertical: 10,
	},

	lastRow: {
		borderBottomWidth: 0,
	},
	lastExpandedContent: {
		borderBottomWidth: 0,
	},
});

export default Settings;
