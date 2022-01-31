import React, { useState } from 'react'
import { connect } from 'react-redux'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { changeUsername, deleteAccount } from '../../redux/actions'
import { TextInput } from 'react-native-paper'

const UpdateAccount = (props) => {
  const [newUsername, setNewUsername] = useState('')

  const updateUsername = async (newUsername) => {
    try {
      if (!newUsername.length) {
        Alert.alert('No username entered', '', {
          text: 'OK',
        })
      } else {
        setNewUsername('')
        const username = await props.updateMe(newUsername)
        if (username) {
          if (username === 'duplicateUsername') {
            Alert.alert(
              'Unfortunately another user already has that username. Try another one.',
              '',
              {
                text: 'OK',
              }
            )
          } else {
            Alert.alert('Your username has been updated', '', {
              text: 'OK',
            })
          }
        } else {
          console.log('i got to this one')
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const deleteAccount = async () => {
    try {
      const deleted = await props.deleteMe()
      if (deleted) {
        Alert.alert('Your account has been deleted', '', {
          text: 'OK',
        })
        return props.navigation.navigate('AddShow')
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <View style={styles.container}>
      {props.updateAccount === 'username' ? (
        <View>
          <Text style={{ ...styles.text, marginBottom: 10 }}>
            Your username (visible to all users) is currently{' '}
            {props.currentUser.username}. You can change it at any time below:
          </Text>
          <TextInput
            style={styles.inputText}
            label="Enter new username"
            onChangeText={(newUsername) => setNewUsername(newUsername)}
            mode="outlined"
            outlineColor="#340068"
            activeOutlineColor="#340068"
            value={newUsername}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => updateUsername(newUsername)}
            >
              <Text style={styles.buttonText}>Update my username</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          <Text style={styles.text}>
            You can delete your account at any time. All your data will be
            permanently deleted from our servers.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                Alert.alert(
                  'Are you sure you want to delete your account?',
                  'You will not be able to get your data back',
                  [
                    { text: 'Yes', onPress: () => deleteAccount() },
                    {
                      text: 'Cancel',
                    },
                  ]
                )
              }
            >
              <Text style={styles.buttonText}>Delete my account</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginBottom: 30,
    marginRight: 10,
    marginLeft: 15,
    // marginTop: 20,
  },

  text: {
    textAlign: 'left',
    fontSize: 18,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
    margin: 5,
    fontWeight: '500',
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 10,
  },
  button: {
    padding: 5,
    borderRadius: 10,
    marginHorizontal: 3,
    backgroundColor: '#340068',
    marginTop: 2,
  },
})

const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
})

const mapDispatch = (dispatch) => {
  return {
    deleteMe: () => dispatch(deleteAccount()),
    updateMe: (newUsername) => dispatch(changeUsername(newUsername)),
  }
}
export default connect(mapStateToProps, mapDispatch)(UpdateAccount)
