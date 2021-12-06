import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  ScrollView,
  Dimensions,
  Button,
} from 'react-native';

// const SCREEN_WIDTH = Dimensions.get('window').width;
const ios_blue = '#007AFF';
const themeColor = '#0D1014';

import { SelectMultipleButton } from 'react-native-selectmultiple-button';
import { changeShowTags } from '../../redux/actions';

function AddShowTags(props) {
  const [televisionTags, setTelevisionTags] = useState([]);
  const [wTags, setWTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});
  // const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [userShow, setUserShow] = useState(null);
  const [selectedTagIds, setSelectedTagIds] = useState({});

  useEffect(() => {
    console.log('okay, i got this far tho');
    const { allTags } = props;
    setUserShow(props.route.params.userShow);
    console.log(userShow);

    console.log('i got this far');
    const tv = allTags.filter((tag) => {
      return tag.type === 'tv' || tag.type === 'unassigned';
    });
    const warnings = allTags.filter((tag) => {
      return tag.type === 'warning';
    });
    const selectedIds = {};
    tv.forEach((tag) => {
      selectedIds[tag.id] = false;
    });
    warnings.forEach((tag) => {
      selectedIds[tag.id] = false;
    });

    setSelectedTagIds(selectedIds);
    setWTags(warnings);
    setTelevisionTags(tv);
    return () => {
      setUserShow(null);
      setWTags([]);
      setTelevisionTags([]);
      setSelectedTags({});
      setSelectedTagIds({});
    };
  }, [userShow, selectedTagIds]);

  const select = (tag) => {
    if (selectedTagIds[tag.id]) {
      console.log('in here');
      selectedTagIds[tag.id] = false;
      setSelectedTagIds(selectedTags);
    } else {
      console.log('in there');
      selectedTagIds[tag.id] = true;
      setSelectedTagIds(selectedTags);
    }
  };

  const chooseTags = async () => {
    const chosenTags = [];
    for (const id in selectedTags) {
      if (selectedTags[id]) {
        chosenTags.push(selectedTags[id]);
      }
    }
    console.log('these are the ones I am adding', chosenTags);
    await props.changeShowTags(chosenTags, userShow.id);
    Alert.alert(
      'Show added',
      `${userShow.show.name} was added to your ${
        userShow.show.toWatch === 'false' ? "rec'd shows" : 'watch list'
      }`,
      {
        text: 'OK',
      }
    );
    return props.navigation.navigate('Profile');
  };

  if (!userShow) {
    console.log('hellooo', props.route.params.userShow);
    return (
      <View>
        <Text>still loading...</Text>
      </View>
    );
  }
  //unselectAll
  return (
    // <View>
    //   <Text>hello</Text>
    // </View>
    <ScrollView>
      <Text style={styles.welcome}>
        implement the multiple-select buttons demo by SelectMultipleButton
      </Text>
      <Text style={{ marginLeft: 10 }}>
        I would describe {userShow.show.name} as a:
        {/* {_.join(this.state.multipleSelectedData, ", ")} */}
      </Text>
      <View
        style={{
          flexWrap: 'wrap',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        {televisionTags.map((tag) => (
          <SelectMultipleButton
            key={tag.id}
            buttonViewStyle={{
              borderRadius: 10,
              height: 40,
            }}
            textStyle={{
              fontSize: 15,
            }}
            highLightStyle={{
              borderColor: 'gray',
              backgroundColor: 'transparent',
              textColor: 'gray',
              borderTintColor: ios_blue,
              backgroundTintColor: ios_blue,
              textTintColor: 'white',
            }}
            value={tag.id}
            displayValue={tag.name}
            selected={selectedTagIds[tag.id] === true ? true : false}
            singleTap={(valueTap) => select(tag)}
          />
        ))}
      </View>

      <Text style={{ color: ios_blue, marginLeft: 10 }}>
        I think you should be warned that {userShow.show.name} is/has:
        {/*
          {_.join(this.state.multipleSelectedDataLimited, ", ")} */}
      </Text>
      <View
        style={{
          flexWrap: 'wrap',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        {wTags.map((tag) => (
          <SelectMultipleButton
            key={tag.id}
            buttonViewStyle={{
              borderRadius: 10,
              height: 40,
            }}
            textStyle={{
              fontSize: 15,
            }}
            highLightStyle={{
              borderColor: 'gray',
              backgroundColor: 'transparent',
              textColor: 'gray',
              borderTintColor: ios_blue,
              backgroundTintColor: ios_blue,
              textTintColor: 'white',
            }}
            value={tag.id}
            displayValue={tag.name}
            selected={selectedTags[tag.id]}
            singleTap={(valueTap) => select(tag)}
          />
        ))}
      </View>
      <View style={styles.button}>
        <Button
          color="white"
          onPress={chooseTags}
          title="Save tags"
          backgroundColor="seagreen"
        ></Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  welcome: {
    margin: 10,
    marginTop: 30,
    color: 'gray',
  },
  button: {
    textAlign: 'center',
    backgroundColor: '#4281A4',
    marginVertical: 8,
    marginBottom: 8,
    marginRight: 10,
    marginLeft: 10,
  },
});

const mapStateToProps = (store) => ({
  allTags: store.allOtherUsers.allTags,
  currentUser: store.currentUser.userInfo,
  userShows: store.currentUser.userShows,
});

const mapDispatchToProps = (dispatch) => {
  return {
    changeShowTags: (tags, userShowId) =>
      dispatch(changeShowTags(tags, userShowId)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(AddShowTags);
