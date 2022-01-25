import React, { useState, useEffect, useRef } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Switch,
  Dimensions,
  Animated,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import { useFirstRender } from './helpers.js'
import RecsFilter from './RecsFilter'
import * as Tabs from 'react-native-collapsible-tab-view'
import {
  jumpToTab,
  setIndex,
  getFocusedTab,
  getCurrentIndex,
} from 'react-native-collapsible-tab-view'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import {
  getUserFollowing,
  getUsersFollowingRecs,
  getSingleUserShow,
} from '../../redux/actions'
import OtherRecerModal from './OtherRecerModal'

import { connect } from 'react-redux'
import { useIsFocused } from '@react-navigation/native'

const RecShows = (props) => {
  const [selectedItem, setSelectedItem] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [recShows, setRecShows] = useState([])
  const [filter, setFilter] = useState(null)
  const [multipleRecInfo, setMultipleRecInfo] = useState({})
  const [noUserShows, setNoUserShows] = useState(false)
  // const [matchingRecs, setMatchingRecs] = useState(null)
  const [advancedSearch, setAdvancedSearch] = useState(false)
  const [loading, setLoading] = useState(true)
  const [headerHeight, setHeaderHeight] = useState(80)
  const [filterTabName, setFilterTabName] = useState('Filters(0)')
  const [showNum, setShowNum] = useState(0)
  const [recsTabName, setRecsTabName] = useState(null)

  const isFocused = useIsFocused()
  const firstRender = useFirstRender()
  const ref = useRef()

  useEffect(() => {
    setLoading(true)
    const getRecShows = async () => {
      try {
        if (props.allRecShows || filter) {
          console.log('i am up here above first time and filterREcs', showNum)
          let shows = filter ? props.filterRecs : props.allRecShows
          let height = filter ? 150 : 55
          setHeaderHeight(height)

          // shows.sort(function (x, y) {
          //   return new Date(y.updatedAt) - new Date(x.updatedAt)
          // })

          // if they toggled to only see shows not on their profile, remove shows that appear on their rec, watch, and seen lists

          if (filter && showNum === 0) {
            console.log('i got in here in useEffect', filter)
            setRecShows([])
            setMultipleRecInfo({})
            let name = `Recs(0)`
            setRecsTabName(name)
            if (advancedSearch) {
              ref.current.jumpToTab(name)
              setAdvancedSearch(false)
            }
            setLoading(false)
          } else {
            if (noUserShows) {
              shows = shows.filter((recShow) => {
                return (
                  !props.userShows.find(
                    (userShow) => userShow.show.id === recShow.showId
                  ) &&
                  !props.toWatch.find(
                    (watchShow) => watchShow.show.id === recShow.showId
                  ) &&
                  !props.seen.find(
                    (seenShow) => seenShow.show.id === recShow.showId
                  )
                )
              })
              // if (!shows.length) {
              //   setShowNum(0)
              //   // setRecShows([])
              //   // setMultipleRecInfo({})
              // }
            }
            // we only want to see a show recommended once on the timeline, but we want to be able to see how many times it was recommended and by which other users

            let visibleShows = []
            let recCounts = {}
            recCounts['loaded'] = 0
            for (let recShow of shows) {
              const count = recCounts[recShow.showId]
              if (!count) {
                visibleShows.push(recShow)
                recCounts[recShow.showId] = {
                  num: 1,
                  recommenders: [{ name: recShow.username, recShow }],
                }
                recCounts['loaded'] += 1
              } else {
                recCounts[recShow.showId].num++
                recCounts[recShow.showId].recommenders.push({
                  name: recShow.username,
                  recShow,
                })
                recCounts['loaded'] += 1
              }
              if (recCounts['loaded'] === shows.length || showNum === 0) {
                setLoading(false)
              } else {
                console.log(
                  'shows.length is ',
                  shows.length,
                  'and loaded is ',
                  recCounts['loaded']
                )
              }
            }
            setRecShows(visibleShows)
            setMultipleRecInfo(recCounts)
            let name = `Recs(${visibleShows.length})`
            setRecsTabName(name)
            if (advancedSearch) {
              ref.current.jumpToTab(name)
              setAdvancedSearch(false)
            }
            if (firstRender) {
              console.log('i am in the first render')
            }
            if (
              !firstRender &&
              props.currentUser &&
              (!props.following.length || (filter && showNum === 0))
            ) {
              console.log(
                'i am not in the first render but there is no following',
                props.following.length
              )
              setLoading(false)
              setRecsTabName('Recs(0)')
            }
          }

          return () => {
            setRecShows([])
            setMultipleRecInfo({})
            setRecsTabName(null)
          }
        }
      } catch (e) {
        console.log(e)
      }
    }
    getRecShows()
  }, [
    isFocused,
    props.following,
    props.allRecShows,
    noUserShows,
    filter,
    props.filterRecs,
    firstRender,
  ])

  console.log('loading', loading)

  const displayRecShows = () => {
    return (
      <Tabs.FlatList
        numColumns={1}
        horizontal={false}
        data={recShows}
        renderItem={({ item }) => (
          <View style={styles.containerImage}>
            <TouchableOpacity
              onPress={() => getUserShow(item)}
              style={styles.catalogContainer}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            </TouchableOpacity>
            <View>
              {multipleRecInfo[item.showId].num < 2 ? (
                <View>
                  <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                  <View style={styles.rowContainer}>
                    <Text>Recommended by: </Text>
                    <TouchableOpacity
                      onPress={() =>
                        props.navigation.navigate("TV rec'er", {
                          uid: item.userId,
                        })
                      }
                    >
                      <Text style={{ color: 'blue' }}>
                        {`${item.username}`}
                        <Text style={{ color: 'black' }}>
                          {filter ? ` with these filters applied` : ''}
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  <Text>Recommended by:</Text>
                  <TouchableOpacity
                    onPress={() =>
                      seeOtherRecers(multipleRecInfo[item.showId].recommenders)
                    }
                  >
                    <Text style={{ color: 'blue' }}>
                      {`${multipleRecInfo[item.showId].num} people you follow ${
                        filter ? `with these filters applied` : ''
                      }`}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    )
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

  const cancelFilters = () => {
    setFilter(null)
    setFilterTabName('Filters(0)')
  }

  const displayFilters = () => {
    const filterWords = []
    const tagFilter =
      filter['chooseTags'] || filter['chooseAnyTags']
        ? 'chosen tags'
        : filter['nonZeroTags']
        ? 'has tags'
        : filter['nonZeroDescription']
        ? 'has description'
        : filter['tagsOrDescription']
        ? 'tags or description'
        : filter['descriptionValue']
        ? 'word in description'
        : null
    if (tagFilter) {
      filterWords.push(tagFilter)
    }
    if (filter['chooseStreamers']) {
      filterWords.push('chosen streamers')
    }
    if (filter['minRecs']) {
      filterWords.push('number of recs')
    }

    return filterWords.map((filter, key) => {
      return (
        <View key={key} style={styles.filterWord}>
          <Text style={styles.filterText}>{filter}</Text>
        </View>
      )
    })
  }

  if (
    loading ||
    (filter &&
      ((showNum > 0 && !recShows.length) ||
        (showNum > 0 && multipleRecInfo['loaded'] !== showNum)))
  ) {
    console.log(
      'i got in here to loading',
      multipleRecInfo['loaded'],
      showNum,
      recShows.length
    )
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )
  }

  const Header = () => {
    return (
      <View style={styles.header}>
        {!noUserShows ? (
          <Text style={{ color: 'white' }}>
            Toggle to hide shows saved to your profile
          </Text>
        ) : (
          <Text style={{ color: 'white' }}>
            Toggle to see shows saved to your profile
          </Text>
        )}

        <View style={{ alignItems: 'flex-start', flex: 1 }}>
          <Switch
            style={{
              marginBottom: 5,
              marginTop: 5,
            }}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleNoUserShows}
            value={noUserShows}
          />
        </View>
        {filter ? (
          <View>
            <Text style={{ fontWeight: 'bold', color: 'white' }}>
              The following {noUserShows ? 'additional ' : null}filters have
              been applied to this search:
            </Text>
            <View style={styles.filterDisplay}>{displayFilters()}</View>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity
                style={{
                  ...styles.button,
                  backgroundColor: '#008DD5',
                  marginBottom: 5,
                }}
                onPress={() => cancelFilters()}
              >
                <Text style={{ ...styles.buttonText, color: 'white' }}>
                  Cancel filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    )
  }

  function TabBar({ name, ref, ...props }) {
    console.log('name', name)
    console.log('ref', ref)
    return (
      <Tabs.MaterialTabBar
        {...props}
        activeColor="white"
        inactiveColor="white"
        backgroundColor="#340068"
        inactiveOpacity={0.8}
        style={{ backgroundColor: '#340068' }}
        indicatorStyle={{ height: 6, backgroundColor: '#36C9C6' }}
      />
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

  console.log('filtername', filterTabName)

  return (
    <Tabs.Container
      renderHeader={Header}
      renderTabBar={TabBar}
      headerHeight={headerHeight}
      revealHeaderOnScroll={true}
      ref={ref}
    >
      <Tabs.Tab name={recsTabName}>
        <View style={styles.container}>
          {!recShows.length ? (
            <View>
              <Text style={styles.text}>
                Unfortunately you have no recommended shows matching those
                filters.
              </Text>
            </View>
          ) : (
            <View style={styles.containerGallery}>
              {displayRecShows()}
              <OtherRecerModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                selectedItem={selectedItem}
                navigation={props.navigation}
                previous="RecShows"
                getSingleUserShow={props.getSingleUserShow}
              />
            </View>
          )}
        </View>
      </Tabs.Tab>
      <Tabs.Tab name={filterTabName}>
        <RecsFilter
          {...props}
          setFilter={setFilter}
          setFilterTabName={setFilterTabName}
          setLoading={setLoading}
          filter={filter}
          setShowNum={setShowNum}
          setAdvancedSearch={setAdvancedSearch}
        />
      </Tabs.Tab>
    </Tabs.Container>
  )
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
    backgroundColor: '#340068',
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
  filterWord: {
    padding: 3,
    borderRadius: 25,
    marginHorizontal: 3,
    backgroundColor: '#36C9C6',
    marginTop: 3,
  },
  filterText: { fontSize: 13.5, fontWeight: '400', textAlign: 'center' },
  filterDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  header: {
    backgroundColor: '#340068',
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
