import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, Alert } from 'react-native';

export default function CustomModal(props) {
  const { modalVisible, selectedItem, setModalVisible } = props;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {selectedItem
            ? selectedItem.map((item, index) => {
                if (index !== 0) {
                  return (
                    <View key={index}>
                      <Text style={styles.modalText}>Other recommenders:</Text>
                      <Text style={styles.modalText}>{item.name}</Text>
                    </View>
                  );
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
    </Modal>
  );
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
    margin: 3,
    textAlign: 'center',
    fontSize: 20,
  },
});
