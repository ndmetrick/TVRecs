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

import TagGroup, { Tag } from 'react-native-tag-group';

class AddShowTags extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const tags = this.props.tags.map((tag) => tag.name);
    const languages = [
      'Kotlin',
      'Java',
      'JavaScript',
      'Python',
      'Dart',
      'Golang',
      'Rust',
      'Ruby',
      'C',
    ];
    return (
      <SafeAreaView style={styles.container}>
        <TagGroup
          ref={(ref) => (this.tagGroup = ref)}
          style={styles.tagGroup}
          source={tags}
          onSelectedTagChange={this.onTagPress}
        />

        <View style={styles.controller}>
          {/* Using <Tag/> as a button */}
          {/* <View style={styles.btnConstroller}>
            <Tag
              onPress={this.getSelectedTags}
              text={'Get Selected Tag(s)'}
              touchableOpacity
              tagStyle={styles.buttonContainer}
              textStyle={styles.buttonText}
            />


          </View> */}
        </View>
      </SafeAreaView>
    );
  }

  onSwitchChange = (value) => {
    if (value) {
      for (let i = 0; i < tags.length; i++) {
        this.tagGroup.unselect(i);
      }
    }

    getSelectedTags = () => {
      let selectedIndex = this.tagGroup.getSelectedIndex();
      if (selectedIndex != -1) {
      }
    };
  };
}
const styles = StyleSheet.create({
  container: {},

  title: {
    color: '#333',
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
  switcher: {
    marginHorizontal: 8,
  },
  buttonContainer: {
    height: 30,
    alignSelf: 'center',
    marginRight: 8,
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
  },
  btnConstroller: {
    flexDirection: 'row',
  },

  console: {
    flex: 1,
    backgroundColor: '#ddd',
    minHeight: 250,
    marginHorizontal: 10,
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  consoleText: {
    color: '#333',
    fontSize: 16,
  },

  customTags: {
    borderTopColor: '#ddd',
    borderTopWidth: 0.8,
    paddingTop: 10,
  },
  tagStyle: {
    marginTop: 4,
    marginHorizontal: 8,
    backgroundColor: '#eee',
    borderWidth: 0,
    marginRight: 12,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  textStyle: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

const mapStateToProps = (store) => ({
  tags: store.userState.tags,
});

export default connect(mapStateToProps)(AddShowTags);
