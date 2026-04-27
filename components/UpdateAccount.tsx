import { deleteUserAccount, updateUser } from '@/lib/api';
import { useAppData } from '@/lib/AppContext';
import { useAuth } from '@/lib/AuthContext';
import { isUniqueViolation } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import { showErrorToast } from '@/lib/toast';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-paper';

interface Props {
	updateType: 'username' | 'delete';
}

const UpdateAccount = (props: Props) => {
	const { updateType } = props;
	const [newUsername, setNewUsername] = useState('');
	const { currentUser, refetchCurrentUser } = useAppData();
	const [error, setError] = useState<string | null>(null);
	const { signOut } = useAuth();
	const router = useRouter();

	if (!currentUser) return;

	const updateUsername = async (newUsername: string) => {
		try {
			if (!newUsername.length) {
				Alert.alert('No username entered', '', [{ text: 'OK' }]);
			} else {
				setNewUsername('');
				try {
					await updateUser(supabase, currentUser.id, { username: newUsername });
				} catch (error) {
					if (isUniqueViolation(error, 'users_username_key')) {
						setError('That username is already taken.');
					} else {
						setError('Something went wrong. Please try again.');
					}
				}
				if (error) {
					Alert.alert(error, '', [
						{
							text: 'OK',
						},
					]);
				} else {
					{
						Alert.alert('Your username has been updated', '', [
							{
								text: 'OK',
							},
						]);
					}
					await refetchCurrentUser();
				}
			}
		} catch (err) {
			console.log(`Error updating username: ${err}`);
		}
	};

	const deleteAccount = async () => {
		try {
			await deleteUserAccount(supabase);
			Alert.alert('Your account has been deleted', '', [
				{
					text: 'OK',
				},
			]);
			await signOut();
			router.replace('/login');
		} catch (err) {
			console.log(err);
			showErrorToast('Could not delete your account');
		}
	};

	return (
		<View style={styles.container}>
			{updateType === 'username' ? (
				<View>
					<Text style={{ ...styles.text, marginBottom: 10 }}>
						Your username (visible to all users) is currently{' '}
						{currentUser.username}. You can change it at any time below:
					</Text>
					<TextInput
						style={styles.inputText}
						label='Enter new username'
						onChangeText={(newUsername) => setNewUsername(newUsername)}
						mode='outlined'
						outlineColor='#340068'
						activeOutlineColor='#340068'
						value={newUsername}
					/>
					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={styles.button}
							onPress={() => updateUsername(newUsername)}
						>
							<Text style={styles.buttonText}>Update my username</Text>
						</TouchableOpacity>
					</View>
				</View>
			) : (
				<View>
					<Text style={styles.text}>
						You can delete your account at any time. All your data will be
						permanently deleted from our servers.
					</Text>
					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={styles.button}
							onPress={() =>
								Alert.alert(
									'Are you sure you want to delete your account?',
									'You will not be able to get your data back',
									[
										{ text: 'Yes', onPress: () => deleteAccount() },
										{
											text: 'Cancel',
										},
									],
								)
							}
						>
							<Text style={styles.buttonText}>Delete my account</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		// marginBottom: 30,
		marginRight: 10,
		marginLeft: 15,
		// marginTop: 20,
	},
	inputText: {
		margin: 10,
		textAlign: 'center',
		fontSize: 20,
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
		color: 'white',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		margin: 10,
	},
	button: {
		padding: 5,
		borderRadius: 10,
		marginHorizontal: 3,
		backgroundColor: '#340068',
		marginTop: 2,
	},
});

export default UpdateAccount;
