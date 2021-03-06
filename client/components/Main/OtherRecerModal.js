import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native'

export default function CustomModal(props) {
  const {
    modalVisible,
    selectedItem,
    setModalVisible,
    previous,
    getSingleUserShow,
  } = props

  const otherRecerClicked = async (recShow) => {
    try {
      // const userId = previous === 'RecShows' ? recShow.userId : recShow.user.id
      // const showId = previous === 'RecShows' ? recShow.showId : recShow.show.Id
      const userInfo = { id: recShow.userId, username: recShow.username }
      setModalVisible(!modalVisible)
      const userShow = await getSingleUserShow(recShow.userId, recShow.showId)
      if (userShow) {
        return props.navigation.navigate('Show', {
          userInfo,
          singleShow: userShow,
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.')
      }}
    >
      <ScrollView>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ ...styles.text, fontWeight: 'bold' }}>
              Other recommenders:
            </Text>
            {selectedItem
              ? selectedItem.map((item, index) => {
                  if (previous === 'RecShows' || index !== 0) {
                    return (
                      <View key={index}>
                        <TouchableOpacity
                          onPress={() => otherRecerClicked(item.recShow)}
                        >
                          <Text style={styles.text}>{item.name}</Text>
                        </TouchableOpacity>
                      </View>
                    )
                  }
                })
              : null}
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.text}>x</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    borderWidth: 2,
    alignSelf: 'flex-end',
    position: 'absolute',
  },
  text: {
    margin: 8,
    textAlign: 'center',
    fontSize: 20,
  },
})
