import { Stack } from 'expo-router';

export default function LoggedOutLayout() {
	return <Stack screenOptions={{ headerShown: false }} />;
}
