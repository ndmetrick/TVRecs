import React, { useState, useEffect, useMemo } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Switch,
  Dimensions,
  ActivityIndicator,
} from 'react-native'

import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from 'recyclerlistview'

import RecsFilter from './RecsFilter'

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import {
  getUserFollowing,
  getUsersFollowingRecs,
  getSingleUserShow,
} from '../../redux/actions'
import OtherRecerModal from './OtherRecerModal'

import { connect } from 'react-redux'
import { useIsFocused } from '@react-navigation/native'

let containerCount = 0

let { width } = Dimensions.get('window')

const RecShows = (props) => {
  const [selectedItem, setSelectedItem] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [recShows, setRecShows] = useState([])
  const [filter, setFilter] = useState(null)
  const [multipleRecInfo, setMultipleRecInfo] = useState({})
  const [noUserShows, setNoUserShows] = useState(false)
  const [matchingRecs, setMatchingRecs] = useState(null)
  const [advancedSearch, setAdvancedSearch] = useState(false)
  const [loading, setLoading] = useState(true)
  const isFocused = useIsFocused()

  useEffect(() => {
    // const getRecShows = async () => {
    //   try {
    if (props.allRecShows || props.filterRecs) {
      setLoading(true)
      let shows = filter ? props.filterRecs : props.allRecShows
      // shows.sort(function (x, y) {
      //   return new Date(y.updatedAt) - new Date(x.updatedAt)
      // })

      // if they toggled to only see shows not on their profile, remove shows that appear on their rec, watch, and seen lists

      if (noUserShows) {
        shows = shows.filter((recShow) => {
          return (
            !props.userShows.find(
              (userShow) => userShow.show.id === recShow.showId
            ) &&
            !props.toWatch.find(
              (watchShow) => watchShow.show.id === recShow.showId
            ) &&
            !props.seen.find((seenShow) => seenShow.show.id === recShow.showId)
          )
        })
      }
      // we only want to see a show recommended once on the timeline, but we want to be able to see how many times it was recommended and by which other users
      let visibleShows = []
      let recCounts = {}
      let loaded = 0
      for (let recShow of shows) {
        const count = recCounts[recShow.showId]
        if (!count) {
          visibleShows.push(recShow)
          recCounts[recShow.showId] = {
            num: 1,
            recommenders: [{ name: recShow.username, recShow }],
          }
          loaded += 1
        } else {
          recCounts[recShow.showId].num++
          recCounts[recShow.showId].recommenders.push({
            name: recShow.username,
            recShow,
          })
          loaded += 1
        }
        if (loaded === shows.length) {
          setLoading(false)
        } else {
          console.log(
            'shows.length is ',
            shows.length,
            'and loaded is ',
            loaded
          )
        }
      }
      setRecShows(visibleShows)
      setMultipleRecInfo(recCounts)
      if (
        (props.currentUser && props.following.length === 0) ||
        (props.currentUser && props.filterRecs.length === 0)
      ) {
        console.log('i got into this one down here')
        setLoading(false)
      }

      return () => {
        setRecShows([])
      }
    }
  }, [
    isFocused,
    props.following,
    props.allRecShows,
    noUserShows,
    filter,
    props.filterRecs,
  ])

  console.log('loading', loading)
  const _dataProvider = useMemo(() => {
    return new DataProvider((r1, r2) => {
      return r1.id !== r2.id
    })
  }, [])

  const newDataProvider = useMemo(() => {
    return _dataProvider.cloneWithRows(recShows)
  }, [recShows])

  const _layoutProvider = useMemo(() => {
    return new LayoutProvider(
      (index) => {
        // console.log(newDataProvider.getDataForIndex(index)) //This will work.
        return 1
      },
      (type, dim) => {
        switch (type) {
          case 1:
            dim.width = width
            dim.height = (width / 2) * 3 + 40
            break
          default:
            dim.width = 0
            dim.height = 0
        }
      }
    )
  }, [newDataProvider])

  const _rowRenderer = (type, data) => {
    switch (type) {
      case 1:
        return (
          <CellContainer style={styles.containerImage}>
            <TouchableOpacity
              onPress={() => getUserShow(data)}
              style={styles.catalogContainer}
            >
              <Image source={{ uri: data.imageUrl }} style={styles.image} />
            </TouchableOpacity>
            <View>
              {multipleRecInfo[data.showId].num < 2 ? (
                <View>
                  <Text style={{ fontWeight: 'bold' }}>{data.name}</Text>
                  <View style={styles.rowContainer}>
                    <Text>Recommended by: </Text>
                    <TouchableOpacity
                      onPress={() =>
                        props.navigation.navigate("TV rec'er", {
                          uid: data.userId,
                        })
                      }
                    >
                      <Text
                        style={{ color: 'blue' }}
                      >{`${data.username}`}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  <Text>Recommended by:</Text>
                  <TouchableOpacity
                    onPress={() =>
                      seeOtherRecers(multipleRecInfo[data.showId].recommenders)
                    }
                  >
                    <Text style={{ color: 'blue' }}>
                      {`${multipleRecInfo[data.showId].num} people you follow ${
                        filter ? `with these filters applied` : ''
                      }`}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </CellContainer>
        )
      default:
        return null
    }
  }

  const seeOtherRecers = (recInfo) => {
    setModalVisible(true)
    setSelectedItem(recInfo)
  }

  const toggleNoUserShows = () => {
    setNoUserShows((previousState) => !previousState)
  }

  const getUserShow = async (recShow) => {
    try {
      const userShow = await props.getSingleUserShow(
        recShow.userId,
        recShow.showId
      )
      if (userShow) {
        console.log('userShowbackhere', userShow)
        const userInfo = { id: recShow.userId, username: recShow.username }
        return props.navigation.navigate('Show', {
          userInfo,
          singleShow: userShow,
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  const displayFilters = () => {
    console.log('i got here at least')
    console.log('filter', filter)
    return (
      <View>
        <Text>
          {filter['chooseTags']
            ? `Only display shows tagged as ${filter['chooseTags']
                .map((tag, index) =>
                  index === filter['chooseTags'] - 1 && filter['chooseTags'] > 2
                    ? `and ${tag.name}`
                    : tag.name
                )
                .join(', ')}`
            : filter['chooseAnyTags']
            ? `Only display shows tagged as ${filter['chooseAnyTags']
                .map((tag, index) =>
                  index === filter['chooseAnyTags'] - 1 &&
                  filter['chooseAnyTags'] > 2
                    ? `or ${tag.name}`
                    : tag.name
                )
                .join(', ')}`
            : filter['nonZeroTags']
            ? `Only display shows with at least 1 tag`
            : filter['tagsOrDescription']
            ? `Only display shows with at least 1 tag or a description`
            : filter['descriptionValue']
            ? `Only display shows with ${filter['descriptionValue'].join(
                ' or '
              )} in their description`
            : filter['nonZeroDescription']
            ? `Only display shows with a description`
            : null}
        </Text>
        <Text>
          {filter['chooseStreamers']
            ? `Only display shows available on ${filter['chooseStreamers']
                .map((streamer, index) =>
                  index === filter['chooseStreamers'].length - 1 &&
                  filter['chooseStreamers'].length > 2
                    ? `, or ${streamer.name}`
                    : streamer.name
                )
                .join(', ')}`
            : null}
        </Text>
        <Text>
          {filter['chooseMinRecs']
            ? `Only shows recommended by at least ${filter['chooseMinRecs']} users you follow`
            : null}
        </Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  }

  if (props.following.length === 0) {
    console.log('i got into this one up here 1')
    return (
      <View>
        <Text style={styles.text}>
          Recommendations will come your way as soon as you follow some other
          users!
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        {!noUserShows ? (
          <Text>Toggle to hide shows you've already saved to your profile</Text>
        ) : (
          <Text>Toggle to see shows you've alreeady saved to your profile</Text>
        )}
        <Switch
          style={{ marginBottom: 5, marginTop: 5 }}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleNoUserShows}
          value={noUserShows}
        />
        {!advancedSearch && filter ? (
          <View>
            <Text style={{ fontWeight: 'bold' }}>
              The following {noUserShows ? 'additional ' : null}filters have
              been applied to this search:
            </Text>
            <View>{displayFilters()}</View>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setFilter(null)}
              >
                <Text style={styles.buttonText}>Cancel filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        {!advancedSearch || (filter && !recShows.length) ? (
          <TouchableOpacity
            // style={styles.button}
            onPress={() => setAdvancedSearch(true)}
          >
            <Text style={{ ...styles.boldText, margin: 5 }}>
              Filter recommendations you see{' '}
              <MaterialCommunityIcons name="chevron-double-down" size={18} />
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {!advancedSearch && !recShows.length ? (
        <View>
          <Text style={styles.text}>
            Unfortunately you have no recommended shows matching those filters.
          </Text>
        </View>
      ) : !advancedSearch &&
        newDataProvider &&
        newDataProvider.getSize() > 0 ? (
        <View style={styles.containerGallery}>
          <RecyclerListView
            layoutProvider={_layoutProvider}
            dataProvider={newDataProvider}
            rowRenderer={_rowRenderer}
          />
          <OtherRecerModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            selectedItem={selectedItem}
            navigation={props.navigation}
            previous="RecShows"
            getSingleUserShow={props.getSingleUserShow}
          />
        </View>
      ) : (
        <RecsFilter
          setAdvancedSearch={setAdvancedSearch}
          setMatchingRecs={setMatchingRecs}
          setFilter={setFilter}
          setLoading={setLoading}
          filter={filter}
        />
      )}
    </View>
  )
}
class CellContainer extends React.Component {
  constructor(args) {
    super(args)
    this._containerId = containerCount++
  }
  render() {
    return <View {...this.props}>{this.props.children}</View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
  },
  containerInfo: {
    margin: 20,
  },
  containerGallery: {
    flex: 1,
  },
  containerImage: {
    flex: 1 / 3,
    marginBottom: 5,
  },
  image: {
    // flex: 1,
    aspectRatio: 2 / 3,
  },
  text: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
  },
  button: {
    padding: 5,
    borderRadius: 15,
    marginHorizontal: 3,
    backgroundColor: '#586BA4',
    marginTop: 5,
  },
  toggleContainer: {
    padding: 10,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    margin: 5,
    fontWeight: '500',
    color: 'white',
  },
})
const mapStateToProps = (store) => ({
  following: store.currentUser.following,
  currentUser: store.currentUser.userInfo,
  allRecShows: store.currentUser.recShows,
  userShows: store.currentUser.userShows,
  toWatch: store.currentUser.toWatch,
  seen: store.currentUser.seen,
  filterRecs: store.currentUser.filterRecs,
})

const mapDispatchToProps = (dispatch) => {
  return {
    getUserFollowing: () => dispatch(getUserFollowing()),
    getUsersFollowingRecs: () => dispatch(getUsersFollowingRecs()),
    getSingleUserShow: (uid, showId) =>
      dispatch(getSingleUserShow(uid, showId)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RecShows)
