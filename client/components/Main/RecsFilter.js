import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Switch,
} from 'react-native'
import { TextInput } from 'react-native-paper'
import {
  getAllOtherUsers,
  getMatchingUsers,
  getMatchingRecs,
} from '../../redux/actions'
import { useIsFocused } from '@react-navigation/native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import DropDownPicker from 'react-native-dropdown-picker'

import {
  Tabs,
  jumpToTab,
  setIndex,
  getFocusedTab,
  getCurrentIndex,
} from 'react-native-collapsible-tab-view'

const RecsFilter = (props) => {
  const isFocused = useIsFocused()
  const [TVTags, setTVTags] = useState(null)
  const [tagsDescriptionChecked, setTagsDescriptionChecked] = useState('none')
  const [streamersChecked, setStreamersChecked] = useState('none')
  const [minRecs, setMinRecs] = useState('none')
  const [minRecsDropdownOpen, setMinRecsDropdownOpen] = useState(false)
  const [minRecsDropdownValue, setMinRecsDropdownValue] = useState(null)
  const [minRecsDropdownOptions, setMinRecsDropdownOptions] = useState(null)
  const [descriptionInput, setDescriptionInput] = useState('')
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false)
  const [tagsDropdownValue, setTagsDropdownValue] = useState([])
  const [tagsDropdownOptions, setTagsDropdownOptions] = useState(null)
  const [streamersDropdownOpen, setStreamersDropdownOpen] = useState(false)
  const [streamersDropdownValue, setStreamersDropdownValue] = useState([])
  const [streamersDropdownOptions, setStreamersDropdownOptions] = useState(null)
  const [descriptionValue, setDescriptionValue] = useState([])
  const [filterAnyTags, setFilterAnyTags] = useState(false)
  // const ref = useRef()

  const streamingOptions = [
    {
      label: 'Amazon Prime Video',
      value: { name: 'Amazon Prime Video' },
    },
    { label: 'AMC Plus', value: { name: 'AMC Plus' } },
    { label: 'Apple TV Plus', value: { name: 'Apple TV Plus' } },
    { label: 'BBC America', value: { name: 'BBC America' } },
    { label: 'BritBox', value: { name: 'BritBox' } },
    { label: 'Comedy Central', value: { name: 'Comedy Central' } },
    { label: 'Crave', value: { name: 'Crave' } },
    { label: 'DIRECTV', value: { name: 'DIRECTV' } },
    { label: 'Disney Plus', value: { name: 'Disney Plus' } },

    { label: 'fuboTV', value: { name: 'fuboTV' } },
    { label: 'HBO Max', value: { name: 'HBO Max' } },
    { label: 'Hoopla', value: { name: 'Hoopla' } },
    { label: 'Hulu', value: { name: 'Hulu' } },
    {
      label: 'Netflix',
      value: { name: 'Netflix' },
    },
    { label: 'Paramount Plus', value: { name: 'Paramount Plus' } },
    { label: 'Peacock Premium', value: { name: 'Peacock Premium' } },
    { label: 'Showtime', value: { name: 'Showtime' } },
    { label: 'Spectrum On Demand', value: { name: 'Spectrum On Demand' } },

    { label: 'Starz', value: { name: 'Starz' } },

    { label: 'Sling TV', value: { name: 'Sling TV' } },
  ]

  useEffect(() => {
    console.log('am I back in here?')
    if (props.filter) {
      if (props.filter['chooseTags']) {
        setTagsDescriptionChecked('chooseTags')
        setTagsDropdownValue(props.filter['chooseTags'])
      }

      if (props.filter['chooseAnyTags']) {
        setTagsDescriptionChecked('chooseAnyTags')
        setTagsDropdownValue(props.filter['chooseAnyTags'])
        setFilterAnyTags(true)
      }

      if (props.filter['nonZeroTags']) {
        setTagsDescriptionChecked('nonZeroTags')
      }

      if (props.filter['descriptionValue']) {
        setTagsDescriptionChecked('descriptionWord')
        setDescriptionValue(props.filter['descriptionValue'])
      }
      if (props.filter['nonZeroDescription']) {
        setTagsDescriptionChecked('nonZeroDescription')
      }

      if (props.filter['tagsOrDescription']) {
        setTagsDescriptionChecked('tagsOrDescription')
      }

      if (props.filter['chooseStreamers']) {
        setStreamersChecked('chooseStreamers')
        setStreamersDropdownValue(props.filter['chooseStreamers'].streamers)
      }

      if (props.filter['chooseMinRecs']) {
        setMinRecs('chooseMinRecs')
        setMinRecsDropdownValue(props.filter['chooseMinRecs'])
      }
    }

    setTVTags(props.tvTags)
    // const tags = []
    // props.tvTags.forEach((tag) => {
    //   tags.push({ label: tag.name, value: tag })
    // })

    setStreamersDropdownOptions(streamingOptions)

    setTagsDropdownOptions(tags)

    const following = []
    const followingLength = props.following.length
    for (let i = 1; i <= followingLength; i++) {
      following.push({ label: i, value: i })
    }
    setMinRecsDropdownOptions(following)

    return () => {
      // setMatchingRecs(null)
      // setAdvancedSearch(false)
      // setTagsDropdownValue([])
      // setStreamersDropdownValue([])
      // setTagsDescriptionChecked('none')
      // setStreamersChecked('none')
      // setMinRecsDropdownOptions(null)
    }
  }, [isFocused])

  const displayChosen = (chosenValues) => {
    return chosenValues.map((chosenValue, key) => {
      return (
        <View key={key} style={styles.selectedTag}>
          <Text style={styles.tagText}>{chosenValue.name}</Text>
        </View>
      )
    })
  }

  const reset = () => {
    console.log('i am in here')
    props.setAdvancedSearch(false)
    setMinRecsDropdownValue(null)
    setStreamersDropdownValue([])
    setDescriptionInput('')
    setTagsDropdownValue([])
    setTagsDescriptionChecked('none')
    setStreamersChecked('none')
    setMinRecs('none')
    setDescriptionValue([])
    setFilterAnyTags(false)
    props.setFilterTabName('Filters(0)')
    props.setFilter(null)
  }

  const addWordToDescriptionFilter = () => {
    const descriptionList = [...descriptionValue, descriptionInput]
    setDescriptionValue(descriptionList)
    setDescriptionInput('')
  }

  const filter = async () => {
    try {
      console.log('i got into filter')
      const filters = {}
      let filterCount = 0
      if (tagsDescriptionChecked === 'chooseTags') {
        const chosenTags = []
        for (const tag of tagsDropdownValue) {
          chosenTags.push(tag.id)
        }
        if (chosenTags.length) {
          filterCount += 1
          if (filterAnyTags) {
            filters['chooseAnyTags'] = chosenTags
          } else {
            filters['chooseTags'] = chosenTags
          }
        }
      }
      if (tagsDescriptionChecked === 'nonZeroTags') {
        filters['nonZeroTags'] = true
        filterCount += 1
      }
      if (tagsDescriptionChecked === 'descriptionWord') {
        if (descriptionValue.length) {
          filters['descriptionValue'] = descriptionValue
          filterCount += 1
        }
      }
      if (tagsDescriptionChecked === 'nonZeroDescription') {
        filters['nonZeroDescription'] = true
        filterCount += 1
      }

      if (tagsDescriptionChecked === 'tagsOrDescription') {
        filters['tagsOrDescription'] = true
        filterCount += 1
      }

      if (streamersChecked === 'chooseStreamers') {
        if (streamersDropdownValue.length) {
          filters['chooseStreamers'] = {
            streamers: streamersDropdownValue,
            watchProviders: props.watchProviders,
          }
          filterCount += 1
        }
      }

      if (minRecs === 'chooseMinRecs') {
        console.log('i gotin here and minrecsdrop is ', minRecsDropdownValue)
        if (minRecsDropdownValue > 1) {
          filters['chooseMinRecs'] = minRecsDropdownValue
          filterCount += 1
        }
      }

      if (filterCount === 0) {
        Alert.alert('No filters to search by', 'Please add a filter', {
          text: 'OK',
        })
      } else {
        console.log(filters, 'filters at this point')
        const matches = await props.getMatchingRecs(filters)
        if (matches) {
          console.log('ADVANCED SEARCH WAS FALSE AND I SET IT TRUE')
          props.setAdvancedSearch(true)
          console.log('I JUST SET ADVANCED SEARCH TRUE')
          props.setShowNum(matches.length)
          filters['filterCount'] = filterCount
          if (tagsDescriptionChecked === 'chooseTags') {
            filters['chooseTags'] = tagsDropdownValue
          }
          console.log('matches in filterrecs', matches)
          console.log('matches length', matches.length)
          // props.setMatchingRecs(matches)

          console.log('filterCOunt', filterCount)
          props.setFilter(filters)
          // props.setFilterTabName(`Filters(${filterCount})`)
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <Tabs.ScrollView
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.filterText}>
          Click 'Filter recommendations' to perform your search
        </Text>
        <Text style={styles.tagHeadingText}>Tags / Description</Text>
        <View style={styles.choiceContainer}>
          <TouchableOpacity
            style={
              tagsDescriptionChecked === 'none'
                ? { ...styles.choices, backgroundColor: '#36C9C6' }
                : { ...styles.choices, backgroundColor: '#9BC1BC' }
            }
            onPress={() => setTagsDescriptionChecked('none')}
          >
            <Text style={styles.filterOptionsText}>no filter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              tagsDescriptionChecked === 'tagsOrDescription'
                ? { ...styles.choices, backgroundColor: '#36C9C6' }
                : { ...styles.choices, backgroundColor: '#9BC1BC' }
            }
            onPress={() => setTagsDescriptionChecked('tagsOrDescription')}
          >
            <Text style={styles.filterOptionsText}>
              only shows with description or tags
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              tagsDescriptionChecked === 'nonZeroTags'
                ? { ...styles.choices, backgroundColor: '#36C9C6' }
                : { ...styles.choices, backgroundColor: '#9BC1BC' }
            }
            onPress={() => setTagsDescriptionChecked('nonZeroTags')}
          >
            <Text style={styles.filterOptionsText}>only shows with tags</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.choiceContainer}>
          <TouchableOpacity
            style={
              tagsDescriptionChecked === 'chooseTags'
                ? { ...styles.choices, backgroundColor: '#36C9C6' }
                : { ...styles.choices, backgroundColor: '#9BC1BC' }
            }
            onPress={() => setTagsDescriptionChecked('chooseTags')}
          >
            <Text style={styles.filterOptionsText}>
              only shows with these tags
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              tagsDescriptionChecked === 'nonZeroDescription'
                ? { ...styles.choices, backgroundColor: '#36C9C6' }
                : { ...styles.choices, backgroundColor: '#9BC1BC' }
            }
            onPress={() => setTagsDescriptionChecked('nonZeroDescription')}
          >
            <Text style={styles.filterOptionsText}>
              only shows with a description
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              tagsDescriptionChecked === 'descriptionWord'
                ? { ...styles.choices, backgroundColor: '#36C9C6' }
                : { ...styles.choices, backgroundColor: '#9BC1BC' }
            }
            onPress={() => setTagsDescriptionChecked('descriptionWord')}
          >
            <Text style={styles.filterOptionsText}>
              only shows with this description
            </Text>
          </TouchableOpacity>
        </View>

        {tagsDescriptionChecked === 'descriptionWord' ? (
          <View style={{ marginTop: 5 }}>
            <View>
              <Text style={styles.filterText}>
                Enter the word (not case-sensitive) you want to see present in
                the show description (if you choose multiple words, the search
                will return shows containing any one of those words).
              </Text>
              <TextInput
                style={styles.inputText}
                label="Enter word"
                onChangeText={(descriptionInput) =>
                  setDescriptionInput(descriptionInput)
                }
                mode="outlined"
                outlineColor="#340068"
                activeOutlineColor="#340068"
                value={descriptionInput}
                // onFocus={() => setNotFound(false)}
              />
              <View
                style={{
                  flex: 1,
                  alignItems: 'flex-end',
                  marginBottom: 5,
                }}
              >
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={addWordToDescriptionFilter}
                >
                  <Text style={styles.buttonText}>Add word to filter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}
        {tagsDescriptionChecked === 'descriptionWord' &&
        descriptionValue.length ? (
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.filterText}>
              Filer description words added: "
              {descriptionValue.join('", "').toLowerCase()}"
            </Text>
          </View>
        ) : null}

        {tagsDescriptionChecked === 'chooseTags' ? (
          <View style={{ marginBottom: 5, marginTop: 7 }}>
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
                  {displayChosen(tagsDropdownValue)}
                </View>

                {tagsDropdownValue.length > 1 ? (
                  <View>
                    {!filterAnyTags ? (
                      <View>
                        <Text style={styles.tagHeadingText}>
                          Include shows that have any of these tags
                        </Text>
                        <Text style={styles.filterText}>
                          Filter is currently set to include only shows which
                          have all selected tags applied
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.filterText}>
                        <Text style={styles.tagHeadingText}>
                          Include only shows that have ALL of these tags
                        </Text>
                        <Text>
                          Filter is currently set to include shows which have
                          ANY selected tags applied
                        </Text>
                      </View>
                    )}
                    <Switch
                      style={{ alignItems: 'flex-end' }}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() =>
                        setFilterAnyTags((previousState) => !previousState)
                      }
                      value={filterAnyTags}
                    />
                  </View>
                ) : null}
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
        ) : null}

        {/* add choice for all or any */}

        <View style={{ marginTop: 5 }}>
          <Text style={styles.tagHeadingText}>Streamers</Text>

          <View style={styles.choiceContainer}>
            <TouchableOpacity
              style={
                streamersChecked === 'none'
                  ? {
                      ...styles.choices,
                      backgroundColor: '#36C9C6',
                      flex: 1 / 2,
                    }
                  : {
                      ...styles.choices,
                      backgroundColor: '#9BC1BC',
                      flex: 1 / 2,
                    }
              }
              onPress={() => setStreamersChecked('none')}
            >
              <Text style={styles.filterOptionsText}>no filter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                streamersChecked === 'chooseStreamers'
                  ? {
                      ...styles.choices,
                      backgroundColor: '#36C9C6',
                      flex: 1 / 2,
                    }
                  : {
                      ...styles.choices,
                      backgroundColor: '#9BC1BC',
                      flex: 1 / 2,
                    }
              }
              onPress={() => setStreamersChecked('chooseStreamers')}
            >
              <Text style={styles.filterText}>
                only shows available on the following streamers:
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {streamersChecked === 'chooseStreamers' ? (
          <View>
            {streamersDropdownValue.length ? (
              <View>
                <DropDownPicker
                  multiple={true}
                  open={streamersDropdownOpen}
                  value={streamersDropdownValue}
                  items={streamersDropdownOptions}
                  setOpen={setStreamersDropdownOpen}
                  setValue={setStreamersDropdownValue}
                  setItems={setStreamersDropdownOptions}
                  listMode="SCROLLVIEW"
                  dropDownDirection="TOP"
                  itemKey="label"
                  placeholder="Select streamers to filter by"
                />
                <Text style={{ fontSize: 16, marginTop: 10 }}>
                  chosen streamers:
                </Text>
                <View style={[styles.cardContent, styles.tagsContent]}>
                  {displayChosen(streamersDropdownValue)}
                </View>
              </View>
            ) : (
              <View>
                <DropDownPicker
                  multiple={true}
                  open={streamersDropdownOpen}
                  value={streamersDropdownValue}
                  items={streamersDropdownOptions}
                  setOpen={setStreamersDropdownOpen}
                  setValue={setStreamersDropdownValue}
                  setItems={setStreamersDropdownOptions}
                  listMode="SCROLLVIEW"
                  dropDownDirection="TOP"
                  itemKey="label"
                  placeholder="Select streamers to filter by"
                />
              </View>
            )}
          </View>
        ) : null}

        {props.following.length > 1 ? (
          <View>
            <Text style={styles.tagHeadingText}>
              People I follow who recommend this show
            </Text>
            <View style={styles.choiceContainer}>
              <TouchableOpacity
                style={
                  minRecs === 'none'
                    ? {
                        ...styles.choices,
                        backgroundColor: '#36C9C6',
                        flex: 1 / 2,
                      }
                    : {
                        ...styles.choices,
                        backgroundColor: '#9BC1BC',
                        flex: 1 / 2,
                      }
                }
                onPress={() => setMinRecs('none')}
              >
                <Text style={styles.filterOptionsText}>no filter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  minRecs === 'chooseMinRecs'
                    ? {
                        ...styles.choices,
                        backgroundColor: '#36C9C6',
                        flex: 1 / 2,
                      }
                    : {
                        ...styles.choices,
                        backgroundColor: '#9BC1BC',
                        flex: 1 / 2,
                      }
                }
                onPress={() => setMinRecs('chooseMinRecs')}
              >
                <Text style={styles.filterOptionsText}>
                  only shows rec'd by at least this many
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {minRecs === 'chooseMinRecs' ? (
          <View>
            <View>
              <Text style={styles.filterText}>
                You follow {props.following.length} users. Search for shows
                recommended by at least this many people you follow:
              </Text>

              <DropDownPicker
                open={minRecsDropdownOpen}
                value={minRecsDropdownValue}
                items={minRecsDropdownOptions}
                setOpen={setMinRecsDropdownOpen}
                setValue={setMinRecsDropdownValue}
                setItems={setMinRecsDropdownOptions}
                listMode="SCROLLVIEW"
                dropDownDirection="TOP"
                itemKey="label"
                placeholder="Select min # of recommenders"
              />
            </View>
          </View>
        ) : null}

        {tagsDescriptionChecked === 'none' &&
        streamersChecked === 'none' &&
        minRecs === 'none' ? null : (
          <View style={styles.filterCriteriaContainer}>
            <Text style={styles.boldText}>Filter criteria</Text>
            {tagsDescriptionChecked === 'None' ? null : (
              <Text style={{ ...styles.filterText, marginBottom: 0 }}>
                {tagsDescriptionChecked === 'chooseTags' &&
                tagsDropdownValue.length
                  ? `Only display shows tagged as ${tagsDropdownValue
                      .map((tag, index) =>
                        index === tagsDropdownValue.length - 1 &&
                        tagsDropdownValue.length > 2 &&
                        !filterAnyTags
                          ? `and "${tag.name}"`
                          : index === tagsDropdownValue.length - 1 &&
                            tagsDropdownValue.length > 2 &&
                            filterAnyTags
                          ? `or "${tag.name}"`
                          : `"${tag.name}"`
                      )
                      .join(', ')}`
                  : tagsDescriptionChecked === 'nonZeroTags'
                  ? `Only display shows with at least 1 tag`
                  : tagsDescriptionChecked === 'tagsOrDescription'
                  ? `Only display shows with at least 1 tag or a description`
                  : tagsDescriptionChecked === 'descriptionWord' &&
                    descriptionValue.length
                  ? `Only display shows with "${descriptionValue
                      .join('" or "')
                      .toLowerCase()}" in their description`
                  : tagsDescriptionChecked === 'nonZeroDescription'
                  ? `Only display shows with a description`
                  : null}
              </Text>
            )}

            {streamersChecked === 'chooseStreamers' &&
            streamersDropdownValue.length ? (
              <Text style={{ ...styles.filterText, marginBottom: 0 }}>
                Only display shows available on{' '}
                {streamersDropdownValue
                  .map((streamer, index) =>
                    index === streamersDropdownValue.length - 1 &&
                    tagsDropdownValue.length > 2
                      ? ` or ${streamer.name}`
                      : streamer.name
                  )
                  .join(', ')}
              </Text>
            ) : null}

            {minRecs === 'chooseMinRecs' && minRecsDropdownValue > 1 ? (
              <Text style={{ ...styles.filterText, marginBottom: 0 }}>
                Only display shows recommended by at least{' '}
                {minRecsDropdownValue} users I follow
              </Text>
            ) : null}
          </View>
        )}
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity style={styles.cancelButton} onPress={() => reset()}>
            <Text style={styles.buttonText}>Clear filters</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => props.setAdvancedSearch(false)}
              >
                <Text style={styles.buttonText}>Close filter</Text>
              </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => filter()}
          >
            <Text style={styles.buttonText}>Filter Recommendations</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Tabs.ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    flex: 1,
    marginHorizontal: 2,
    marginBottom: 40,
    backgroundColor: '#D3D3D3',
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

  // optionContainer: {
  //   flex: 1,
  //   justifyContent: 'space-between',
  //   marginRight: 10,
  //   marginLeft: 10,
  // },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    margin: 5,
    fontWeight: '500',
    color: 'white',
  },
  text: {
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
    padding: 3,
    backgroundColor: '#F4F1BB',
    marginTop: 7,
  },
  // filterCriteriaRow: {
  //   flex: 1,
  //   paddingTop: 3,
  // },
  boldText: {
    margin: 3,
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
    marginBottom: 5,
  },
  cancelButton: {
    padding: 5,
    borderRadius: 15,
    marginHorizontal: 3,
    backgroundColor: '#F46036',
    marginTop: 5,
    marginBottom: 5,
  },
  filterButton: {
    padding: 5,
    borderRadius: 15,
    marginHorizontal: 3,
    backgroundColor: '#5B85AA',
    marginRight: 10,
  },
})

const mapStateToProps = (store) => ({
  currentUser: store.currentUser.userInfo,
  following: store.currentUser.following,
  tvTags: store.allOtherUsers.tvTags,
  watchProviders: store.currentUser.watchProviders,
})

const mapDispatch = (dispatch) => {
  return {
    getAllOtherUsers: () => dispatch(getAllOtherUsers()),
    getMatchingUsers: (filters) => dispatch(getMatchingUsers(filters)),
    getMatchingRecs: (filters) => dispatch(getMatchingRecs(filters)),
  }
}

export default connect(mapStateToProps, mapDispatch)(RecsFilter)
