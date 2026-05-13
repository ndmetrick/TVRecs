import { AppProvider, useAppData } from '@/lib/AppContext';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import { router, Stack } from 'expo-router';
import {
	Alert,
	Image,
	TouchableOpacity,
	useColorScheme,
	View,
} from 'react-native';
import {
	MD3DarkTheme,
	MD3LightTheme,
	Provider as PaperProvider,
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

Sentry.init({
	dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
	debug: false,
});

export const AppShell = () => {
	const scheme = useColorScheme();
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
		<View
			style={{
				flex: 1,
				backgroundColor: scheme === 'dark' ? '#3e3e3e' : '#f2f2f7',
			}}
		>
			<Stack
				screenOptions={{
					headerShown: true,
					headerBackTitle: 'Back',
					contentStyle: {
						backgroundColor: scheme === 'dark' ? '#3e3e3e' : '#f2f2f7',
					},
					animation: 'fade',
					headerStyle: {
						backgroundColor: scheme === 'dark' ? '#3e3e3e' : '#ffffff',
					},
					headerTintColor: scheme === 'dark' ? '#f0f0f0' : '#340068',
					headerTitleAlign: 'center',

					headerTitle: () => (
						<TouchableOpacity onPress={() => router.push('/(tabs)/recShows')}>
							<Image
								style={{ width: 50, height: 40, alignSelf: 'center' }}
								source={require('../assets/images/logo-transparent.png')}
							/>
						</TouchableOpacity>
					),
					headerRight: () =>
						currentUser ? (
							<TouchableOpacity
								hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
									color={scheme === 'dark' ? '#dddddd' : '#340068'}
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
		</View>
	);
};

export default function RootLayout() {
	const scheme = useColorScheme();
	const paperTheme = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
	return (
		<SafeAreaProvider>
			<PaperProvider theme={paperTheme}>
				<AuthProvider>
					<AppProvider>
						<AppShell />
					</AppProvider>
				</AuthProvider>
			</PaperProvider>
		</SafeAreaProvider>
	);
}
