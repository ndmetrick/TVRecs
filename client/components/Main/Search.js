import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Switch,
} from 'react-native'
import { TextInput } from 'react-native-paper'
import { getAllOtherUsers, getMatchingUsers } from '../../redux/actions'
import { useIsFocused } from '@react-navigation/native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import DropDownPicker from 'react-native-dropdown-picker'
import SelectShow from './SelectShow'

const Search = (props) => {
  const isFocused = useIsFocused()
  const [users, setUsers] = useState([])
  const [matchingUsers, setMatchingUsers] = useState(null)
  const [advancedSearch, setAdvancedSearch] = useState(false)
  const [tagsChecked, setTagsChecked] = useState('none')
  const [showsChecked, setShowsChecked] = useState('none')
  const [commonTagDropdownOpen, setCommonTagDropdownOpen] = useState(false)
  const [commonTagDropdownValue, setCommonTagDropdownValue] = useState(null)
  const [commonTagDropdownOptions, setCommonTagDropdownOptions] = useState(null)
  const [commonShowDropdownOpen, setCommonShowDropdownOpen] = useState(false)
  const [commonShowDropdownValue, setCommonShowDropdownValue] = useState(null)
  const [commonShowDropdownOptions, setCommonShowDropdownOptions] =
    useState(null)
  const [chosenShow, setChosenShow] = useState(null)
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false)
  const [tagsDropdownValue, setTagsDropdownValue] = useState([])
  const [tagsDropdownOptions, setTagsDropdownOptions] = useState(null)
  const [showsDropdownOpen, setShowsDropdownOpen] = useState(false)
  const [showsDropdownValue, setShowsDropdownValue] = useState([])
  const [showsDropdownOptions, setShowsDropdownOptions] = useState(null)
  const [showName, setShowName] = useState('')
  const [filterShowChosen, setFilterShowChosen] = useState(false)
  const [excludeFollowed, setExcludeFollowed] = useState(false)
  const [sameShowName, setSameShowName] = useState(false)

  useEffect(() => {
    setUsers(props.otherUsers)
    const tags = []
    props.allUserTags.forEach((tag) => {
      tags.push({ label: tag.name, value: tag })
    })

    setTagsDropdownOptions(tags)
    if (props.currentUser) {
      const numCommonUserTags = []
      const tagsLength = props.userTags.length
      for (let i = 0; i <= tagsLength; i++) {
        numCommonUserTags.push({ label: i, value: i })
      }
      setCommonTagDropdownOptions(numCommonUserTags)
      const numCommonUserShows = []
      const showsLength = props.userShows.length
      for (let i = 0; i <= showsLength; i++) {
        numCommonUserShows.push({ label: i, value: i })
      }
      setCommonShowDropdownOptions(numCommonUserShows)
      const shows = []
      const showNames = {}
      props.userShows.forEach((userShow) => {
        let showName = userShow.show.name
        if (showNames[showName]) {
          setSameShowName(true)
          showName = `${userShow.show.name} (${userShow.show.imdbId})`
        }
        shows.push({ label: showName, value: userShow.show })
        showNames[showName] = true
      })
      setShowsDropdownOptions(shows)
    }

    return () => {
      setUsers(null)
      setMatchingUsers(null)
      setAdvancedSearch(false)
      setCommonTagDropdownValue(null)
      setCommonShowDropdownValue(null)
      setChosenShow(null)
      setTagsDropdownValue([])
      setShowName('')
      setFilterShowChosen(false)
      setShowsDropdownValue([])
      setTagsChecked('none')
      setShowsChecked('none')
      setExcludeFollowed(false)
    }
  }, [isFocused, props.matchingUsers])

  const displayChosenTags = (tags) => {
    return tags.map((tag, key) => {
      return (
        <View key={key} style={styles.selectedTag}>
          <Text style={styles.tagText}>{tag.name}</Text>
        </View>
      )
    })
  }

  const chooseShowToSearch = (showName, imageUrl, imdbId, filterShowChosen) => {
    setShowName(showName)
    setChosenShow(imdbId)
    setFilterShowChosen(filterShowChosen)
  }

  const reset = () => {
    setAdvancedSearch(false)
    setCommonTagDropdownValue(null)
    setCommonShowDropdownValue(null)
    setChosenShow(null)
    setTagsDropdownValue([])
    setShowName('')
    setFilterShowChosen(false)
    setShowsDropdownValue([])
  }

  const getMatchingUsers = async (searchInput) => {
    console.log('got here', users)
    const matches = users.filter((user) => {
      return user.username.includes(searchInput.toLowerCase())
    })
    console.log('matches here', matches)
    setMatchingUsers(matches)
  }

  const filter = async () => {
    try {
      const filters = {}
      let filterCount = 0
      if (tagsChecked === 'chooseTags') {
        const chosenTags = []
        for (const tag of tagsDropdownValue) {
          chosenTags.push(tag.id)
        }
        if (chosenTags.length) {
          filterCount += 1
          filters['chooseTags'] = chosenTags
        }
      }
      if (tagsChecked === 'commonTags') {
        if (commonTagDropdownValue) {
          filters['commonTags'] = commonTagDropdownValue
          filterCount += 1
        }
      }
      if (showsChecked === 'chooseShow') {
        if (chosenShow) {
          filters['chooseShow'] = chosenShow
          filterCount += 1
        }
      }
      if (showsChecked === 'commonShows') {
        if (commonShowDropdownValue) {
          filters['commonShows'] = commonShowDropdownValue
          filterCount += 1
        }
      }
      if (showsChecked === 'chooseCommonShows') {
        const chosenShows = []
        for (const show of showsDropdownValue) {
          chosenShows.push(show.id)
        }
        if (chosenShows.length) {
          filters['chooseCommonShows'] = chosenShows
          filterCount += 1
        }
      }
      if (filterCount === 0) {
        Alert.alert('No filters to search by', 'Please add a filter', {
          text: 'OK',
        })
      } else {
        if (excludeFollowed) {
          filters['excludeFollowed'] = true
        }
        filters['filterCount'] = filterCount
        const matches = await props.getMatchingUsers(filters)
        if (props.currentUser) {
          const matchesMinusUser = matches.filter(
            (match) => match.id !== props.currentUser.id
          )

          setMatchingUsers(matchesMinusUser)
        } else {
          setMatchingUsers(matches)
        }
        setAdvancedSearch(false)
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    // <TouchableWithoutFeedback onPress={() => closeOpenDropdown()}>
    <View style={styles.container}>
      <ScrollView
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {advancedSearch ? (
          <View>
            <TouchableOpacity
              // style={styles.button}
              onPress={() => setAdvancedSearch(false)}
            >
              <Text style={{ ...styles.boldText, margin: 5 }}>
                Search for users by filter{' '}
                <MaterialCommunityIcons name="chevron-double-up" size={18} />
              </Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.filterText}>
                Click 'Filter users' to perform your search
              </Text>
              {!props.currentUser ? (
                <Text style={styles.filterText}>
                  Additional filters available when you log in
                </Text>
              ) : null}
              <Text style={styles.tagHeadingText}>User Tag Filters</Text>
              <View style={styles.choiceContainer}>
                <TouchableOpacity
                  style={
                    tagsChecked === 'none'
                      ? { ...styles.choices, backgroundColor: '#008DD5' }
                      : { ...styles.choices, backgroundColor: '#9BC1BC' }
                  }
                  onPress={() => setTagsChecked('none')}
                >
                  <Text style={styles.filterOptionsText}>no filter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    tagsChecked === 'chooseTags'
                      ? { ...styles.choices, backgroundColor: '#008DD5' }
                      : { ...styles.choices, backgroundColor: '#9BC1BC' }
                  }
                  onPress={() => setTagsChecked('chooseTags')}
                >
                  <Text style={styles.filterOptionsText}>chosen tags</Text>
                </TouchableOpacity>

                {!props.currentUser ? null : (
                  <TouchableOpacity
                    style={
                      tagsChecked === 'commonTags'
                        ? { ...styles.choices, backgroundColor: '#008DD5' }
                        : { ...styles.choices, backgroundColor: '#9BC1BC' }
                    }
                    onPress={() => setTagsChecked('commonTags')}
                  >
                    <Text style={styles.filterOptionsText}>
                      # tags in common
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {tagsChecked === 'chooseTags' ? (
                <View style={{ marginBottom: 5 }}>
                  {tagsDropdownValue.length ? (
                    <View>
                      <DropDownPicker
                        multiple={true}
                        open={tagsDropdownOpen}
                        value={tagsDropdownValue}
                        items={tagsDropdownOptions}
                        setOpen={setTagsDropdownOpen}
                        setValue={setTagsDropdownValue}
                        setItems={setTagsDropdownOptions}
                        listMode="SCROLLVIEW"
                        dropDownDirection="TOP"
                        itemKey="label"
                        placeholder="Select tags to filter by"
                      />
                      <Text style={{ fontSize: 16, marginTop: 10 }}>
                        chosen tags:
                      </Text>
                      <View style={[styles.cardContent, styles.tagsContent]}>
                        {displayChosenTags(tagsDropdownValue)}
                      </View>
                    </View>
                  ) : (
                    <View>
                      <DropDownPicker
                        multiple={true}
                        open={tagsDropdownOpen}
                        value={tagsDropdownValue}
                        items={tagsDropdownOptions}
                        setOpen={setTagsDropdownOpen}
                        setValue={setTagsDropdownValue}
                        setItems={setTagsDropdownOptions}
                        listMode="SCROLLVIEW"
                        dropDownDirection="TOP"
                        itemKey="label"
                        placeholder="Select tag(s) to filter by"
                      />
                    </View>
                  )}
                </View>
              ) : tagsChecked === 'commonTags' ? (
                <View>
                  <View>
                    <Text style={styles.filterText}>
                      You have {props.userTags.length} user tags. Search for
                      users who have this number of tags in common:
                    </Text>

                    <DropDownPicker
                      open={commonTagDropdownOpen}
                      value={commonTagDropdownValue}
                      items={commonTagDropdownOptions}
                      setOpen={setCommonTagDropdownOpen}
                      setValue={setCommonTagDropdownValue}
                      setItems={setCommonTagDropdownOptions}
                      listMode="SCROLLVIEW"
                      dropDownDirection="TOP"
                      itemKey="label"
                      placeholder="Select min # of tags in common"
                    />
                  </View>
                </View>
              ) : null}

              <Text style={styles.tagHeadingText}>
                Recommended Show Filters
              </Text>
              <View style={styles.choiceContainer}>
                <TouchableOpacity
                  style={
                    showsChecked === 'none'
                      ? { ...styles.choices, backgroundColor: '#008DD5' }
                      : { ...styles.choices, backgroundColor: '#9BC1BC' }
                  }
                  onPress={() => setShowsChecked('none')}
                >
                  <Text style={styles.filterOptionsText}>No filter</Text>
                </TouchableOpacity>

                {!props.currentUser ? null : (
                  <TouchableOpacity
                    style={
                      showsChecked === 'chooseCommonShows'
                        ? { ...styles.choices, backgroundColor: '#008DD5' }
                        : { ...styles.choices, backgroundColor: '#9BC1BC' }
                    }
                    onPress={() => setShowsChecked('chooseCommonShows')}
                  >
                    <Text style={styles.filterOptionsText}>
                      shows in common
                    </Text>
                  </TouchableOpacity>
                )}
                {!props.currentUser ? null : (
                  <TouchableOpacity
                    style={
                      showsChecked === 'commonShows'
                        ? { ...styles.choices, backgroundColor: '#008DD5' }
                        : { ...styles.choices, backgroundColor: '#9BC1BC' }
                    }
                    onPress={() => setShowsChecked('commonShows')}
                  >
                    <Text style={styles.filterText}># shows in common</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={
                    showsChecked === 'chooseShow'
                      ? { ...styles.choices, backgroundColor: '#008DD5' }
                      : { ...styles.choices, backgroundColor: '#9BC1BC' }
                  }
                  onPress={() => setShowsChecked('chooseShow')}
                >
                  <Text style={styles.filterOptionsText}>chosen show</Text>
                </TouchableOpacity>
              </View>

              {showsChecked === 'chooseShow' ? (
                <View>
                  <SelectShow
                    handleShow={chooseShowToSearch}
                    showAdded={filterShowChosen}
                    previous="Search"
                  />
                </View>
              ) : showsChecked === 'chooseCommonShows' ? (
                <View>
                  {showsDropdownValue.length ? (
                    <View>
                      <DropDownPicker
                        multiple={true}
                        open={showsDropdownOpen}
                        value={showsDropdownValue}
                        items={showsDropdownOptions}
                        setOpen={setShowsDropdownOpen}
                        setValue={setShowsDropdownValue}
                        setItems={setShowsDropdownOptions}
                        listMode="SCROLLVIEW"
                        dropDownDirection="TOP"
                        itemKey="label"
                        placeholder="Select show(s) to filter by"
                      />
                      <Text style={{ fontSize: 16, marginTop: 10 }}>
                        chosen shows:{' '}
                        {showsDropdownValue.map((show) => show.name).join(', ')}
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <DropDownPicker
                        multiple={true}
                        open={showsDropdownOpen}
                        value={showsDropdownValue}
                        items={showsDropdownOptions}
                        setOpen={setShowsDropdownOpen}
                        setValue={setShowsDropdownValue}
                        setItems={setShowsDropdownOptions}
                        listMode="SCROLLVIEW"
                        dropDownDirection="TOP"
                        itemKey="label"
                        placeholder="Select show(s) to filter by"
                      />
                      {sameShowName ? (
                        <Text
                          style={{
                            fontSize: 16,
                            marginTop: 10,
                            fontWeight: '500',
                            color: '#F46036',
                          }}
                        >
                          To distinguish between multiple shows with the same
                          name, we have added the IMDB ID to the end of any
                          duplicate names.
                        </Text>
                      ) : null}
                    </View>
                  )}
                </View>
              ) : showsChecked === 'commonShows' ? (
                <View>
                  <View>
                    <Text style={styles.filterText}>
                      You have recommended {props.userShows.length} shows.
                      Search for users who have recommended at least this many
                      of the same shows:
                    </Text>

                    <DropDownPicker
                      open={commonShowDropdownOpen}
                      value={commonShowDropdownValue}
                      items={commonShowDropdownOptions}
                      setOpen={setCommonShowDropdownOpen}
                      setValue={setCommonShowDropdownValue}
                      setItems={setCommonShowDropdownOptions}
                      listMode="SCROLLVIEW"
                      dropDownDirection="TOP"
                      itemKey="label"
                      placeholder="Select min # of shows in common"
                    />
                  </View>
                </View>
              ) : null}
              {props.currentUser ? (
                <View>
                  {!excludeFollowed ? (
                    <View>
                      <Text style={styles.tagHeadingText}>
                        Filter out users you follow
                      </Text>
                      <Text style={styles.filterText}>
                        Users you follow are set to be included in your search.
                        Toggle to only see unfollowed users.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.filterText}>
                      <Text style={styles.tagHeadingText}>
                        Add back users you follow
                      </Text>
                      <Text>
                        Users you follow are set to be excluded from your
                        search. Toggle to include them.
                      </Text>
                    </View>
                  )}
                  <Switch
                    style={{ alignItems: 'flex-end' }}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() =>
                      setExcludeFollowed((previousState) => !previousState)
                    }
                    value={excludeFollowed}
                  />
                </View>
              ) : null}
              {tagsChecked === 'none' && showsChecked === 'none' ? null : (
                <View style={styles.filterCriteriaContainer}>
                  <Text style={styles.boldText}>Filter criteria:</Text>

                  {tagsChecked === 'none' ? null : (
                    <Text style={{ ...styles.filterText, marginBottom: 0 }}>
                      {tagsChecked === 'chooseTags' && tagsDropdownValue.length
                        ? `Only display users who have tagged themselves with ${tagsDropdownValue
                            .map((tag, index) =>
                              index === tagsDropdownValue.length - 1 &&
                              tagsDropdownValue.length > 2
                                ? `and "${tag.name}"`
                                : `"${tag.name}"`
                            )
                            .join(', ')}`
                        : tagsChecked === 'commonTags' && commonTagDropdownValue
                        ? `Only display users who have at least ${commonTagDropdownValue} user tags in common with me`
                        : null}
                    </Text>
                  )}

                  {showsChecked === 'none' ? null : (
                    <Text style={{ ...styles.filterText, marginBottom: 0 }}>
                      {showsChecked === 'chooseShow' && chosenShow
                        ? `Only display users who recommend ${showName}`
                        : showsChecked === 'chooseCommonShows' &&
                          showsDropdownValue.length
                        ? `Only display users who have recommended ${showsDropdownValue
                            .map((show, index) =>
                              index === showsDropdownValue.length - 1 &&
                              showsDropdownValue.length > 2
                                ? `and ${show.name}`
                                : show.name
                            )
                            .join(', ')}`
                        : showsChecked === 'commonShows' &&
                          commonShowDropdownValue
                        ? `Only display users who have at least ${commonShowDropdownValue} recommended shows in common with me`
                        : null}
                    </Text>
                  )}
                </View>
              )}
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => reset()}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => filter()}
                  >
                    <Text style={styles.buttonText}>Filter users</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.boldText}>Search for users by username</Text>
            <TextInput
              style={styles.inputText}
              label="Enter username here"
              onChangeText={(searchInput) => getMatchingUsers(searchInput)}
              mode="outlined"
              outlineColor="#340068"
              activeOutlineColor="#340068"
            />
            <TouchableOpacity
              // style={styles.button}
              onPress={() => setAdvancedSearch(true)}
            >
              <Text style={styles.text}>
                Search for users by filter{' '}
                <MaterialCommunityIcons name="chevron-double-down" size={18} />
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {!matchingUsers ? (
          <View>
            <Text style={styles.resultsText}>
              Your matches will appear here once you search
            </Text>
          </View>
        ) : !matchingUsers.length ? (
          <Text style={styles.resultsText}>
            Unfortunately, no users matched that search.
          </Text>
        ) : (
          <View style={styles.optionContainer}>
            <Text style={styles.resultsText}>
              Users who match your search (click to navigate to their page):
            </Text>
            {matchingUsers.map((item, index) => {
              return (
                <View key={index}>
                  <TouchableOpacity
                    onPress={() =>
                      props.navigation.navigate("TV rec'er", {
                        uid: item.id,
                      })
                    }
                  >
                    <View style={styles.otherUser}>
                      <Text style={styles.optionsText}>{item.username}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
    // </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    flex: 1,
    marginHorizontal: 2,
    marginBottom: 40,
  },
  choiceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    flex: 1,
  },
  choices: {
    flexDirection: 'column',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1 / 3,
    margin: 2,
    paddingVertical: 10,
    paddingHorizontal: 3,
    alignContent: 'center',
  },
  optionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginRight: 10,
    marginLeft: 10,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    margin: 5,
    fontWeight: '500',
    color: 'white',
  },
  text: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
  },
  filterText: {
    textAlign: 'left',
    fontSize: 16,
    marginBottom: 7,
  },
  filterOptionsText: {
    textAlign: 'center',
    fontSize: 16,
    flex: 1,
  },
  filterCriteriaContainer: {
    flex: 1,
    padding: 6,
    backgroundColor: '#F4F1BB',
    marginTop: 7,
  },
  boldText: {
    margin: 5,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultsText: {
    margin: 10,
    textAlign: 'left',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tagHeadingText: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 5,
  },
  inputText: {
    margin: 10,
    textAlign: 'center',
    fontSize: 20,
  },
  optionsText: {
    marginRight: 10,
    marginLeft: 10,
    fontSize: 18,
  },
  otherUser: {
    marginBottom: 5,
    marginTop: 5,
    padding: 2,
  },
  tagText: {
    fontSize: 13.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  tagGroup: {
    marginTop: 16,
    marginBottom: 8,
  },
  tagStyle: {
    marginTop: 4,
    marginHorizontal: 8,
    backgroundColor: '#FF3F00',
    borderWidth: 0,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  textStyle: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tagsContent: {
    marginTop: 10,
    flexWrap: 'wrap',
  },
  selectedTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#36C9C6',
    marginTop: 5,
  },
  unselectedTag: {
    padding: 10,
    borderRadius: 40,
    marginHorizontal: 3,
    backgroundColor: '#9BC1BC',
    marginTop: 5,
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
  searchButton: {
    padding: 5,
    borderRadius: 15,
    marginHorizontal: 3,
    backgroundColor: '#340068',
    marginTop: 5,
  },
  cancelButton: {
    padding: 5,
    borderRadius: 15,
    marginHorizontal: 3,
    backgroundColor: '#F46036',
    marginTop: 5,
  },
})

const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  otherUsers: store.allOtherUsers.usersInfo,
  allUserTags: store.allOtherUsers.userTags,
  userTags: store.currentUser.userTags,
  userShows: store.currentUser.userShows,
})

const mapDispatch = (dispatch) => {
  return {
    getAllOtherUsers: () => dispatch(getAllOtherUsers()),
    getMatchingUsers: (filters) => dispatch(getMatchingUsers(filters)),
  }
}

export default connect(mapStateToProps, mapDispatch)(Search)
