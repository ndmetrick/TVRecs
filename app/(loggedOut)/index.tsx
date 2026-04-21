import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoggedOutHome() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.buttonText}>Log in / Sign up</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.text}>
        This app is a lot more fun if you sign up for an account. If you have an
        account, you can follow other users to receive their recommendations,
        recommend TV shows (and tag them with descriptions), and save TV shows
        you want to remember to watch to your private watch list (and more, as
        development continues).{'\n'}
        {'\n'}
        If you would prefer to play around with the app without making an
        account but would like to see the logged-in user experience, feel free
        to use the following guest account:{'\n'}
        {'\n'}username: tvRecsApp@gmail.com{'\n'}password: iloveTV!{'\n'}
        {'\n'}Just know that anything you save may be overwritten by another
        guest in the future.{'\n'}
        {'\n'}
        Do note that this app is currently in development and a temporary
        version of it is being deployed so that users can test and interact with
        it. But there are lots of known bugs, so just beware of that.{'\n'}
        {'\n'}
        If you've got ideas for tags I'm missing that I should add, or have
        other ideas, feel free to email me at ndmetrick@gmail.com.
      </Text>
      <View style={{ alignItems: 'flex-start' }}>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              'https://www.termsfeed.com/live/3d7fd044-566e-4e51-9fd7-aa561f45932a'
            )
          }
        >
          <Text style={styles.privacyLink}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9ECEF',
  },
  content: {
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#340068',
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 16,
  },
  privacyLink: {
    color: 'blue',
    fontSize: 16,
    fontWeight: '500',
  },
});
