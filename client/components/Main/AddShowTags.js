import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Switch,
  SafeAreaView,
} from 'react-native';
import { setTags } from '../../redux/actions';

import firebase from 'firebase/app';
require('firebase/firestore');

import TagGroup, { Tag } from 'react-native-tag-group';

class AddShowTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: [],
      selected: [],
    };
    // this.getSelectedTags = this.getSelectedTags.bind(this);
    this.unselectAll = this.unselectAll.bind(this);
    this.setTags = this.setTags.bind(this);
  }

  // onTagPress() {
  //   let selectedIndex = this.tagGroup.getSelectedIndex();
  //   if (selectedIndex !== -1) {
  //     this.setState({ selectedTags: selectedIndex });
  //   }
  // }
  componentDidMount() {
    const tags = this.props.tags.map((tag) => tag.name);
    this.setState({ tags });
  }

  unselectAll() {
    if (this.tagGroup.getSelectedIndex() !== -1) {
      for (let i = 0; i < this.state.tags.length; i++) {
        this.tagGroup.unselect(i);
      }
    }
  }

  async setTags() {
    // const tagList = [];
    // this.state.selected.map((tagIndex) => {
    //   const tagId = tagKey[tagIndex];
    //   tagList.push(tagId);
    // });
    await this.props.setTags(
      this.state.selected,
      this.props.route.params.showName
    );
    this.props.navigation.navigate('Profile', {
      uid: firebase.auth().currentUser.uid,
    });
  }

  render() {
    // const tags = this.props.tags.map((tag) => tag.name);
    // const tagKey = this.props.tags.map((tag, index) => {
    //   index: tag.id;
    // });

    return (
      <SafeAreaView style={styles.container}>
        <TagGroup
          ref={(ref) => (this.tagGroup = ref)}
          style={styles.tagGroup}
          source={this.state.tags}
          onSelectedTagChange={(selected) => this.setState({ selected })}
        />

        <View style={styles.controller}></View>

        <Tag
          onPress={this.unselectAll}
          text={'Unselect All'}
          touchableOpacity
          tagStyle={styles.buttonContainer}
          textStyle={styles.buttonText}
        />

        <Tag
          onPress={this.setTags}
          text={'Save tags'}
          touchableOpacity
          tagStyle={styles.buttonContainer}
          textStyle={styles.buttonText}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {},

  title: {
    color: '#FF3F00',
    fontSize: 20,
    textAlign: 'center',
  },

  tagGroup: {
    marginTop: 16,
    marginHorizontal: 10,
    marginBottom: 8,
  },

  controller: {
    borderTopColor: '#ddd',
    borderTopWidth: 0.8,
    paddingTop: 10,
    marginHorizontal: 12,
  },
  modeSwitcher: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeText: {
    color: '#333',
    fontSize: 18,
  },

  tagStyle: {
    marginTop: 4,
    marginHorizontal: 8,
    backgroundColor: '#FF3F00',
    borderWidth: 0,
    marginRight: 12,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  textStyle: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    height: 30,
    alignSelf: 'center',
    marginRight: 8,
  },
  buttonText: {
    color: '#FF7F11',
    fontSize: 16,
  },
});

const mapStateToProps = (store) => ({
  tags: store.userState.tags,
});

const mapDispatchToProps = (dispatch) => {
  return {
    setTags: (tags, showName) => dispatch(setTags(tags, showName)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(AddShowTags);
