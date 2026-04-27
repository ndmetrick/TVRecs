import { useAuth } from '@/lib/AuthContext';
import { showErrorToast } from '@/lib/toast';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

export default function Login() {
	const { signIn } = useAuth();
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSignIn = async () => {
		setLoading(true);
		try {
			await signIn(email.trim(), password);
			router.replace('/(tabs)/recShows');
		} catch (e: any) {
			showErrorToast('Could not sign in. Try again.');
			console.log('Error signing in:', e);
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<Text style={styles.title}>Log In</Text>
			<TextInput
				style={styles.input}
				placeholder='Email'
				placeholderTextColor='#999'
				value={email}
				onChangeText={setEmail}
				autoCapitalize='none'
				keyboardType='email-address'
			/>
			<TextInput
				style={styles.input}
				placeholder='Password'
				placeholderTextColor='#999'
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>
			<TouchableOpacity
				style={styles.button}
				onPress={handleSignIn}
				disabled={loading}
			>
				<Text style={styles.buttonText}>
					{loading ? 'Logging in...' : 'Log In'}
				</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
				<Text style={styles.link}>{"Don't have an account? Sign up"}</Text>
			</TouchableOpacity>
			<View style={styles.dividerRow}>
				<View style={styles.dividerLine} />
				<Text style={styles.orText}>or</Text>
				<View style={styles.dividerLine} />
			</View>
			<TouchableOpacity
				style={{ marginTop: 5 }}
				onPress={() => router.replace('/(tabs)/recShows')}
			>
				<Text style={{ ...styles.link, color: '#340068' }}>
					Continue without account
				</Text>
			</TouchableOpacity>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#E9ECEF',
		justifyContent: 'center',
		paddingHorizontal: 24,
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		color: '#340068',
		textAlign: 'center',
		marginBottom: 24,
	},
	input: {
		backgroundColor: 'white',
		borderRadius: 8,
		padding: 14,
		fontSize: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	button: {
		backgroundColor: '#340068',
		borderRadius: 40,
		padding: 14,
		alignItems: 'center',
		marginTop: 8,
		marginBottom: 16,
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '500',
	},
	error: {
		color: '#c00',
		fontSize: 14,
		marginBottom: 12,
		textAlign: 'center',
	},
	link: {
		color: '#4056F4',
		fontSize: 15,
		textAlign: 'center',
	},
	dividerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 12,
	},
	dividerLine: {
		flex: 1,
		height: 0.5,
		backgroundColor: '#ccc',
	},
	orText: {
		marginHorizontal: 10,
		color: '#888',
		fontSize: 14,
	},
});
