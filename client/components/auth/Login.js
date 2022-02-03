import * as AuthSession from 'expo-auth-session'
import { connect } from 'react-redux'
import React, { useState, useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getCurrentUser, getAuthInfo } from '../../redux/actions'

WebBrowser.maybeCompleteAuthSession()

const useProxy = Platform.select({ web: false, default: true })
const redirectUri = AuthSession.makeRedirectUri({ useProxy })

let splash = '../../../assets/splash.png'

const Login = (props) => {
  const [clientId, setClientId] = useState(null)
  const authorizationEndpoint = 'https://dev--5p-bz53.us.auth0.com/authorize'
  const [loggedIn, setLoggedIn] = useState(false)

  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      redirectUri,
      clientId: clientId,
      responseType: 'id_token',
      scopes: ['openid', 'profile'],
      prompt: 'login',
      extraParams: {
        nonce: 'nonce',
      },
    },
    { authorizationEndpoint }
  )

  useEffect(() => {
    console.log('HELLOOOO')
    const getAuth = async () => {
      try {
        console.log('this is when i get here 3')
        const authInfo = await props.getAuthInfo()
        setClientId(authInfo[0])
        console.log('this is when i get here 4')
      } catch (e) {
        console.log(e)
      }
    }
    getAuth()
    const getUser = async () => {
      try {
        console.log('did i get this far 5')
        if (result) {
          if (result.error) {
            console.log(result.error)
            Alert.alert(
              'Authentication error',
              result.params.error_description || 'something went wrong'
            )
            return
          }
          if (result.type === 'success') {
            console.log('this is when i get here 1')
            const jwtToken = result.params.id_token
            await AsyncStorage.setItem('token', jwtToken)
            console.log('this is when i get here 2')
            setLoggedIn(true)
            await props.login()
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    getUser()
  }, [result, clientId])

  console.log('here in login', clientId)

  if (!clientId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  }

  return (
    <View style={styles.buttonContainer}>
      {!loggedIn ? (
        <TouchableOpacity
          disabled={!request}
          style={styles.button}
          onPress={() => promptAsync({ useProxy })}
        >
          <Text style={styles.buttonText}>Log in with Auth0</Text>
        </TouchableOpacity>
      ) : (
        <Image
          // style={{ width: 50, height: 40, margin: 20 }}
          source={require(splash)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    margin: 5,
    fontWeight: '500',
    color: 'white',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#340068',
    marginTop: 5,
    marginBottom: 10,
  },
})

const mapDispatchToProps = (dispatch) => {
  return {
    login: () => dispatch(getCurrentUser()),
    getAuthInfo: () => dispatch(getAuthInfo()),
  }
}

export default connect(null, mapDispatchToProps)(Login)
