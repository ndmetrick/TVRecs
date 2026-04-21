import { View, Text, StyleSheet } from 'react-native';

export default function AddShow() {
  return (
    <View style={styles.container}>
      <Text>AddShow</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
