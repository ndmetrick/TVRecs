import { AppProvider, useAppData } from '@/lib/AppContext';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import { router, Stack } from 'expo-router';
import { Alert, Image, TouchableOpacity } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';

Sentry.init({
	dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
	debug: false,
});

export const AppShell = () => {
	const { signOut } = useAuth();
	const { currentUser } = useAppData();
	const logout = async () => {
		try {
			await signOut();
			router.replace('/login');
		} catch (e) {
			console.log(e);
		}
	};

	return (
		<>
			<Stack
				screenOptions={{
					headerShown: true,
					headerBackTitle: 'Back',
					headerTintColor: '#340068',
					headerTitle: () => (
						<TouchableOpacity onPress={() => router.push('/(tabs)/recShows')}>
							<Image
								style={{ width: 50, height: 40, alignSelf: 'center' }}
								source={require('../assets/images/tempTVRecsLogo.png')}
							/>
						</TouchableOpacity>
					),
					headerRight: () =>
						currentUser ? (
							<TouchableOpacity
								style={{ marginRight: 12 }}
								onPress={() =>
									Alert.alert('Sign out?', '', [
										{ text: 'Yes', onPress: logout },
										{
											text: 'Cancel',
										},
									])
								}
							>
								<MaterialCommunityIcons
									name='logout'
									size={26}
									color='#340068'
								/>
							</TouchableOpacity>
						) : null,
				}}
			>
				<Stack.Screen name='index' options={{ headerBackVisible: false }} />
				<Stack.Screen name='(tabs)' options={{ headerBackVisible: false }} />
				<Stack.Screen name='(auth)' options={{ headerBackVisible: false }} />
				<Stack.Screen
					name='(loggedOut)'
					options={{ headerBackVisible: false }}
				/>
			</Stack>
			<Toast bottomOffset={60} />
		</>
	);
};

export default function RootLayout() {
	return (
		<PaperProvider>
			<AuthProvider>
				<AppProvider>
					<AppShell />
				</AppProvider>
			</AuthProvider>
		</PaperProvider>
	);
}
