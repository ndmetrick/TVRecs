import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#340068" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/recShows" />;
  }

  return <Redirect href="/(loggedOut)" />;
}
