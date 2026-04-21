import { AppProvider } from '@/lib/AppContext';
import { AuthProvider } from '@/lib/AuthContext';
import { router, Stack } from 'expo-router';
import { Image, TouchableOpacity } from 'react-native';

export default function RootLayout() {
	return (
		<AuthProvider>
			<AppProvider>
				<Stack
					screenOptions={{
						headerShown: true,
						headerBackTitle: 'Back',
						headerTintColor: '#340068',
						headerTitle: () => (
							<TouchableOpacity onPress={() => router.push('/(tabs)/recShows')}>
								<Image
									style={{ width: 50, height: 40 }}
									source={require('../assets/images/tempTVRecsLogo.png')}
								/>
							</TouchableOpacity>
						),
					}}
				>
					<Stack.Screen name='index' />
					<Stack.Screen name='(tabs)' />
					<Stack.Screen name='(auth)' />
					<Stack.Screen name='(loggedOut)' />
				</Stack>
			</AppProvider>
		</AuthProvider>
	);
}
