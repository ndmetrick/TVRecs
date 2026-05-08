import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	useColorScheme,
} from 'react-native';

export default function Signup() {
	const { signUp } = useAuth();
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const isDark = useColorScheme() === 'dark';
	const styles = makeStyles(isDark);

	const handleSignUp = async () => {
		setError('');
		setLoading(true);
		try {
			await signUp(email.trim(), password, username.trim());
			router.replace('/(tabs)/recShows');
		} catch (e: any) {
			if (e?.code === 'USERNAME_TAKEN') {
				setError('That username is already taken.');
			} else if (e?.message?.includes('User already registered')) {
				setError('An account with that email already exists.');
			} else {
				setError(e?.message ?? 'Sign up failed. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	const checkUsername = () => {
		if (!username) {
			setUsername(email.split('@')[0]);
		}
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<Text style={styles.title}>Create Account</Text>
			{error ? <Text style={styles.error}>{error}</Text> : null}
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
				placeholder='Username'
				placeholderTextColor='#999'
				value={username}
				onChangeText={setUsername}
				autoCapitalize='none'
			/>
			<Text style={styles.helperText}>
				Optional — defaults to your email username if left blank.
			</Text>
			<TextInput
				style={styles.input}
				placeholder='Password'
				placeholderTextColor='#999'
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				onFocus={checkUsername}
			/>
			<TouchableOpacity
				style={styles.button}
				onPress={handleSignUp}
				disabled={loading}
			>
				<Text style={styles.buttonText}>
					{loading ? 'Creating account...' : 'Sign Up'}
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
				onPress={() => router.back()}
			>
				<Text style={styles.link}>Already have an account? Log in</Text>
			</TouchableOpacity>
		</KeyboardAvoidingView>
	);
}

const makeStyles = (isDark: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isDark ? '#5a5a5a' : '#E9ECEF',
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
			backgroundColor: isDark ? '#4a4a4a' : 'white',
			borderRadius: 8,
			padding: 14,
			fontSize: 16,
			marginBottom: 12,
			borderWidth: 1,
			borderColor: isDark ? '#aaa' : '#ddd',
			color: isDark ? '#ccc' : '',
		},
		helperText: {
			fontSize: 13,
			color: isDark ? '#aaa' : '#888',
			marginTop: -6,
			marginBottom: 12,
			marginLeft: 4,
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
			color: isDark ? '#cccccc' : 'white',
			fontSize: 16,
			fontWeight: '500',
		},
		error: {
			color: isDark ? '#ff4444' : '#c00',
			fontSize: 14,
			marginBottom: 12,
			textAlign: 'center',
		},
		link: {
			color: isDark ? '#6b9fd4' : '#4056F4',
			fontSize: 15,
			textAlign: 'center',
		},
	});
