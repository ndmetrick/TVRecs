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
import {
  getAllOtherUsers,
  getMatchingUsers,
  getMatchingRecs,
} from '../../redux/actions'
import { useIsFocused } from '@react-navigation/native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import DropDownPicker from 'react-native-dropdown-picker'

const RecsFilter = (props) => {
  const isFocused = useIsFocused()
  // const [matchingRecs, setMatchingRecs] = useState(null)
  const [TVTags, setTVTags] = useState(null)
  // const [advancedSearch, setAdvancedSearch] = useState(false)
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

  const streamingOptions = [
    { name: 'Netflix' },
    { name: 'Amazon Prime Video' },
    { name: 'Hulu' },
    { name: 'Disney+' },
    { name: 'HBO Max' },
    { name: '[Peacock' },
    { name: 'Paramount+' },
    { name: 'Starz' },
    { name: 'Showtime' },
    { name: 'Apple TV+' },
    { name: 'Mubi' },
    { name: 'Stan' },
    { name: 'Now' },
    { name: 'Crave' },
    { name: 'All 4' },
    { name: 'BBC iPlayer' },
    { name: 'BritBox' },
    { name: 'Hotstar' },
    { name: 'Zee5' },
    { name: 'Curiosity Stream' },
  ]

  useEffect(() => {
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

      if (props.filter['descriptionWord']) {
        setTagsDescriptionChecked('descriptionWord')
        setDescriptionValue(props.filter['descriptionWord'])
      }
      if (props.filter['nonZeroDescription']) {
        setTagsDescriptionChecked('nonZeroDescription')
      }

      if (props.filter['tagsOrDescription']) {
        setTagsDescriptionChecked('tagsOrDescription')
      }

      if (props.filter['chooseStreamers']) {
        setStreamersChecked('chooseStreamers')
        setStreamersDropdownValue(props.filter['chooseStreamers'])
      }

      if (props.filter['chooseMinRecs']) {
        setMinRecs('chooseMinRecs')
        setMinRecsDropdownValue(props.filter['chooseMinRecs'])
      }
    }

    setTVTags(props.tvTags)
    const tags = []
    props.tvTags.forEach((tag) => {
      tags.push({ label: tag.name, value: tag })
    })

    const streamers = []

    streamingOptions.forEach((streamer) => {
      streamers.push({ label: streamer.name, value: streamer })
    })
    setStreamersDropdownOptions(streamers)

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

  console.log(
    'i am out of useEffect in filters and this is tagsDescriptionChecked',
    tagsDescriptionChecked
  )

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
    // props.setAdvancedSearch(false)
    setMinRecsDropdownValue(null)
    setStreamersDropdownValue([])
    setDescriptionInput('')
    setTagsDropdownValue([])
    setDescriptionValue([])
    setFilterAnyTags(false)
    setFilter(null)
  }

  const addWordToDescriptionFilter = () => {
    const descriptionList = [...descriptionValue, descriptionInput]
    setDescriptionValue(descriptionList)
    setDescriptionInput('')
  }

  const filter = async () => {
    try {
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
          filters['descriptionContent'] = descriptionValue
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
          filters['chooseStreamers'] = streamersDropdownValue
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
        const matches = await props.getMatchingRecs(filters)
        if (matches) {
          filters['chooseTags'] = tagsDropdownValue
          props.setMatchingRecs(matches)
          props.setFilter(filters)
          props.setAdvancedSearch(false)
          // props.setLoading(true)
        }
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
        <View>
          <TouchableOpacity
            // style={styles.button}
            onPress={() => props.setAdvancedSearch(false)}
          >
            <Text style={{ ...styles.boldText, margin: 5 }}>
              Filter recommendations you see{' '}
              <MaterialCommunityIcons name="chevron-double-up" size={18} />
            </Text>
          </TouchableOpacity>

          <View style={{ margin: 10, flex: 1, borderWidth: 1, padding: 10 }}>
            <Text style={styles.filterText}>
              Click 'Filter recommendations' to perform your search
            </Text>
            <Text style={styles.tagHeadingText}>
              Filter by tags and/or description
            </Text>
            <View style={styles.choiceContainer}>
              <View style={styles.choices}>
                <TouchableOpacity
                  onPress={() => setTagsDescriptionChecked('none')}
                >
                  {tagsDescriptionChecked === 'none' ? (
                    <MaterialIcons
                      name="radio-button-on"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  ) : (
                    <MaterialIcons
                      name="radio-button-off"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  )}

                  <Text style={styles.filterText}>
                    No tag/description filter
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.choices}>
                <TouchableOpacity
                  onPress={() => setTagsDescriptionChecked('tagsOrDescription')}
                >
                  {tagsDescriptionChecked === 'tagsOrDescription' ? (
                    <MaterialIcons
                      name="radio-button-on"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  ) : (
                    <MaterialIcons
                      name="radio-button-off"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  )}
                  <Text style={styles.filterText}>
                    only shows with description OR tags
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.choices}>
                <TouchableOpacity
                  onPress={() => setTagsDescriptionChecked('nonZeroTags')}
                >
                  {tagsDescriptionChecked === 'nonZeroTags' ? (
                    <MaterialIcons
                      name="radio-button-on"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  ) : (
                    <MaterialIcons
                      name="radio-button-off"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  )}
                  <Text style={styles.filterText}>only tagged shows</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.choices}>
                <TouchableOpacity
                  onPress={() => setTagsDescriptionChecked('chooseTags')}
                >
                  {tagsDescriptionChecked === 'chooseTags' ? (
                    <MaterialIcons
                      name="radio-button-on"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  ) : (
                    <MaterialIcons
                      name="radio-button-off"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  )}

                  <Text style={styles.filterText}>
                    only shows with these tags
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.choices}>
                <TouchableOpacity
                  onPress={() =>
                    setTagsDescriptionChecked('nonZeroDescription')
                  }
                >
                  {tagsDescriptionChecked === 'nonZeroDescription' ? (
                    <MaterialIcons
                      name="radio-button-on"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  ) : (
                    <MaterialIcons
                      name="radio-button-off"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  )}
                  <Text style={styles.filterText}>
                    only shows with a description
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.choices}>
                <TouchableOpacity
                  onPress={() => setTagsDescriptionChecked('descriptionWord')}
                >
                  {tagsDescriptionChecked === 'descriptionWord' ? (
                    <MaterialIcons
                      name="radio-button-on"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  ) : (
                    <MaterialIcons
                      name="radio-button-off"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  )}
                  <Text style={styles.filterText}>
                    only shows containing a particular word
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {tagsDescriptionChecked === 'descriptionWord' ? (
              <View>
                <View>
                  <Text style={styles.filterText}>
                    Enter the word you want to see present in the show
                    description (if you choose multiple words, the search will
                    return shows containing any one of those words)
                  </Text>
                  <TextInput
                    style={styles.inputText}
                    label="Enter word"
                    onChangeText={(descriptionInput) =>
                      setDescriptionInput(descriptionInput)
                    }
                    mode="outlined"
                    outlineColor="#586BA4"
                    activeOutlineColor="#586BA4"
                    value={descriptionInput}
                    // onFocus={() => setNotFound(false)}
                  />
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
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

            {tagsDescriptionChecked === 'chooseTags' ? (
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
                              Filter is currently set to include only shows
                              which have all selected tags applied
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.filterText}>
                            <Text style={styles.tagHeadingText}>
                              Include only shows that have ALL of these tags
                            </Text>
                            <Text>
                              Filter is currently set to include shows which
                              have ANY selected tags applied
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

            <Text style={styles.tagHeadingText}>
              Filter by where you can stream the show
            </Text>
            <View style={styles.choiceContainer}>
              <View style={styles.choices}>
                <TouchableOpacity onPress={() => setStreamersChecked('none')}>
                  {streamersChecked === 'none' ? (
                    <MaterialIcons
                      name="radio-button-on"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  ) : (
                    <MaterialIcons
                      name="radio-button-off"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  )}

                  <Text style={styles.filterText}>no streaming filter</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.choices}>
                <TouchableOpacity
                  onPress={() => setStreamersChecked('chooseStreamers')}
                >
                  {streamersChecked === 'chooseStreamers' ? (
                    <MaterialIcons
                      name="radio-button-on"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  ) : (
                    <MaterialIcons
                      name="radio-button-off"
                      size={20}
                      style={{ textAlign: 'center' }}
                    />
                  )}

                  <Text style={styles.filterText}>
                    only shows available on:
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
                  Filter by how many people I follow recomended the show
                </Text>
                <View style={styles.choiceContainer}>
                  <View style={styles.choices}>
                    <TouchableOpacity onPress={() => setMinRecs('none')}>
                      {minRecs === 'none' ? (
                        <MaterialIcons
                          name="radio-button-on"
                          size={20}
                          style={{ textAlign: 'center' }}
                        />
                      ) : (
                        <MaterialIcons
                          name="radio-button-off"
                          size={20}
                          style={{ textAlign: 'center' }}
                        />
                      )}

                      <Text style={styles.filterText}>
                        no minimum rec filter
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.choices}>
                    <TouchableOpacity
                      onPress={() => setMinRecs('chooseMinRecs')}
                    >
                      {minRecs === 'chooseMinRecs' ? (
                        <MaterialIcons
                          name="radio-button-on"
                          size={20}
                          style={{ textAlign: 'center' }}
                        />
                      ) : (
                        <MaterialIcons
                          name="radio-button-off"
                          size={20}
                          style={{ textAlign: 'center' }}
                        />
                      )}
                      <Text style={styles.filterText}>
                        only shows rec'd by at least
                      </Text>
                    </TouchableOpacity>
                  </View>
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

            <View style={styles.filterCriteriaContainer}>
              <Text style={styles.text}>Filter criteria:</Text>
              <View style={styles.filterCriteriaRow}>
                <Text style={styles.filterText}>
                  Tags / description filter:{' '}
                  {tagsDescriptionChecked === 'chooseTags' &&
                  tagsDropdownValue.length
                    ? `Shows tagged with ${tagsDropdownValue
                        .map((tag, index) =>
                          index === tagsDropdownValue.length - 1 &&
                          tagsDropdownValue.length > 2 &&
                          !filterAnyTags
                            ? `and ${tag.name}`
                            : index === tagsDropdownValue.length - 1 &&
                              tagsDropdownValue.length > 2 &&
                              filterAnyTags
                            ? `or ${tag.name}`
                            : tag.name
                        )
                        .join(', ')}`
                    : tagsDescriptionChecked === 'nonZeroTags'
                    ? `Shows with at least 1 tag`
                    : tagsDescriptionChecked === 'tagsOrDescription'
                    ? `Shows with at least 1 tag or a description`
                    : tagsDescriptionChecked === 'descriptionWord' &&
                      descriptionValue.length
                    ? `Shows with ${descriptionValue.join(
                        ' or '
                      )} in their description`
                    : tagsDescriptionChecked === 'nonZeroDescription'
                    ? `Shows with a description`
                    : 'None yet'}
                </Text>
              </View>

              <View style={styles.filterCriteriaRow}>
                <Text style={styles.filterText}>
                  Streamer filter:{' '}
                  {streamersChecked === 'chooseStreamers' &&
                  streamersDropdownValue.length
                    ? `Shows available on ${streamersDropdownValue
                        .map((streamer, index) =>
                          index === streamersDropdownValue.length - 1 &&
                          tagsDropdownValue.length > 2
                            ? `, or ${streamer.name}`
                            : streamer.name
                        )
                        .join(', ')}`
                    : 'None yet'}
                </Text>
              </View>

              <View style={styles.filterCriteriaRow}>
                <Text style={styles.filterText}>
                  Recommenders filter:{' '}
                  {minRecs === 'chooseMinRecs' && minRecsDropdownValue > 1
                    ? `Shows recommended by at least ${minRecsDropdownValue} users I follow`
                    : props.following < 2
                    ? 'This filter will become available when you follow more users'
                    : 'None yet'}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <View style={{ flex: 1, alignItems: 'flex-start' }}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => reset()}
                >
                  <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => filter()}
                >
                  <Text style={styles.buttonText}>Filter Recommendations</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
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
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  choices: {
    flexDirection: 'column',
    alignItems: 'center',
    margin: 3,
    flexWrap: 'wrap',
    width: 100,
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
  filterCriteriaContainer: {
    flex: 1,
    borderWidth: 1,
    padding: 3,
    backgroundColor: '#FAFAC6',
    marginTop: 7,
  },
  filterCriteriaRow: {
    flex: 1,
    borderTopWidth: 1,
    paddingTop: 3,
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
    backgroundColor: '#586BA4',
    marginTop: 5,
    marginBottom: 10,
  },
  searchButton: {
    padding: 5,
    borderRadius: 15,
    marginHorizontal: 3,
    backgroundColor: 'orange',
    marginTop: 5,
  },
  cancelButton: {
    padding: 5,
    borderRadius: 15,
    marginHorizontal: 3,
    backgroundColor: '#F46036',
    marginTop: 5,
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
})

const mapDispatch = (dispatch) => {
  return {
    getAllOtherUsers: () => dispatch(getAllOtherUsers()),
    getMatchingUsers: (filters) => dispatch(getMatchingUsers(filters)),
    getMatchingRecs: (filters) => dispatch(getMatchingRecs(filters)),
  }
}

export default connect(mapStateToProps, mapDispatch)(RecsFilter)
