import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';

export default function Settings() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(loggedOut)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Settings</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 18, marginBottom: 24 },
  button: {
    backgroundColor: '#340068',
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: { color: 'white', fontSize: 16 },
});
