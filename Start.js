import * as AuthSession from 'expo-auth-session'
import { connect } from 'react-redux'
import jwtDecode from 'jwt-decode'
import React, { useState, useEffect } from 'react'
import 'react-native-gesture-handler'
import {
  Alert,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import Main from './client/components/Main'
import AddShowTags from './client/components/Main/AddShowTags'
import SaveShow from './client/components/Main/SaveShow'
import AddShow from './client/components/Main/AddShow'
import OtherUser from './client/components/Main/OtherUser'
import SingleShow from './client/components/Main/SingleShow'
import MainLoggedOut from './client/components/MainLoggedOut'
import Login from './client/components/auth/Login'
import UsersFollowing from './client/components/Main/UsersFollowing/'
import PickUserTags from './client/components/Main/PickUserTags/'
import { clearData } from './client/redux/actions'
import FAQ from './client/components/Main/FAQ'
import 'react-native-gesture-handler'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const Start = (props) => {
  const Stack = createStackNavigator()

  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      if (props.currentUser) {
        setUser(props.currentUser)
      } else {
        if (props.loggingOut) {
          setUser(null)
          await props.clearData()
        }
      }
    }
    getUser()
  }, [props.currentUser, props.loggingOut])

  // const { isLoggedIn } = props;

  return (
    <>
      {user ? (
        // <GestureHandlerRootView>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Main">
            <Stack.Screen
              name="Main"
              component={Main}
              options={({ navigation }) => ({
                headerTitle: () => (
                  <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                    <Image
                      style={{ width: 50, height: 40, margin: 20 }}
                      source={require('./tempTVRecsLogo.jpeg')}
                    />
                  </TouchableOpacity>
                ),
              })}
              // options={{
              //   title: 'TV Recs',
              //   headerTitleStyle: {
              //     fontWeight: 'bold',
              //   },
              //   headerBackground: () => (
              //     <Image
              //       style={StyleSheet.absoluteFill}
              //       source={{
              //         uri: 'https://i.postimg.cc/rsVXTRfz/temp-TVRecs-Logo.png',
              //       }}
              //     />
              //   ),
              // }}
            />
            <Stack.Screen
              name="Add/Change Tags"
              component={AddShowTags}
              navigation={props.navigation}
              options={({ navigation }) => ({
                headerTitle: () => (
                  <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                    <Image
                      style={{ width: 40, height: 40, margin: 20 }}
                      source={require('./tempTVRecsLogo.jpeg')}
                    />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen
              name="Save show"
              component={SaveShow}
              navigation={props.navigation}
              options={({ navigation }) => ({
                headerTitle: () => (
                  <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                    <Image
                      style={{ width: 50, height: 40, margin: 20 }}
                      source={require('./tempTVRecsLogo.jpeg')}
                    />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen
              name="Show"
              component={SingleShow}
              navigation={props.navigation}
              options={({ navigation }) => ({
                headerTitle: () => (
                  <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                    <Image
                      style={{ width: 50, height: 40, margin: 20 }}
                      source={require('./tempTVRecsLogo.jpeg')}
                    />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen
              name="TV rec'er"
              component={OtherUser}
              navigation={props.navigation}
              options={({ navigation }) => ({
                headerTitle: () => (
                  <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                    <Image
                      style={{ width: 50, height: 40, margin: 20 }}
                      source={require('./tempTVRecsLogo.jpeg')}
                    />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen
              name="UsersFollowing"
              component={UsersFollowing}
              navigation={props.navigation}
              options={({ navigation }) => ({
                headerTitle: () => (
                  <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                    <Image
                      style={{ width: 50, height: 40, margin: 20 }}
                      source={require('./tempTVRecsLogo.jpeg')}
                    />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen
              name="User Tags"
              component={PickUserTags}
              navigation={props.navigation}
              options={({ navigation }) => ({
                headerTitle: () => (
                  <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                    <Image
                      style={{ width: 50, height: 40, margin: 20 }}
                      source={require('./tempTVRecsLogo.jpeg')}
                    />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen
              name="FAQ"
              component={FAQ}
              navigation={props.navigation}
              options={({ navigation }) => ({
                headerTitle: () => (
                  <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                    <Image
                      style={{ width: 50, height: 40, margin: 20 }}
                      source={require('./tempTVRecsLogo.jpeg')}
                    />
                  </TouchableOpacity>
                ),
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        // </GestureHandlerRootView>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="MainLoggedOut">
            <Stack.Screen
              name="MainLoggedOut"
              component={MainLoggedOut}
              options={{
                headerTitle: () => (
                  <Image
                    style={{ width: 50, height: 40, margin: 20 }}
                    source={require('./tempTVRecsLogo.jpeg')}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="Show"
              component={SingleShow}
              navigation={props.navigation}
              options={{
                headerTitle: () => (
                  <Image
                    style={{ width: 50, height: 40, margin: 20 }}
                    source={require('./tempTVRecsLogo.jpeg')}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="TV rec'er"
              component={OtherUser}
              navigation={props.navigation}
              options={{
                headerTitle: () => (
                  <Image
                    style={{ width: 50, height: 40, margin: 20 }}
                    source={require('./tempTVRecsLogo.jpeg')}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="Login"
              component={Login}
              navigation={props.navigation}
              options={{
                headerTitle: () => (
                  <Image
                    style={{ width: 50, height: 40, margin: 20 }}
                    source={require('./tempTVRecsLogo.jpeg')}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="UsersFollowing"
              component={UsersFollowing}
              navigation={props.navigation}
              options={{
                headerTitle: () => (
                  <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                    <Image
                      style={{ width: 50, height: 40, margin: 20 }}
                      source={require('./tempTVRecsLogo.jpeg')}
                    />
                  </TouchableOpacity>
                ),
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
})

const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  loggingOut: store.currentUser.loggingOut,
})

const mapDispatchToProps = (dispatch) => {
  return {
    clearData: () => dispatch(clearData()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Start)
