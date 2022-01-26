import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

function FAQ(props) {
  return (
    <ScrollView style={styles.container}>
      <Text style={{ ...styles.text, fontWeight: 'bold', textAlign: 'center' }}>
        User Guide:
      </Text>

      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate('RecShows')
        }}
      >
        <Text style={styles.headingText}>
          <MaterialCommunityIcons name="home" size={20} /> Home:
        </Text>
      </TouchableOpacity>
      <Text style={styles.text}>
        This is the first page you will be taken to when you log in. It will
        have all the tv recommendations made by users whose recommendations you
        receive (who you follow), with the most recent recommendations first. If
        multiple users recommend the same show, rather than saying the name of
        the recommender below the show, it will say how many people you follow
        recommended it. If you click on the show, you will find the most recent
        recommendation. If you click on the number of recommenders, it will give
        you a list of all the users you follow who are recommending it, and if
        you click on their name, it will take you to their recommendation of
        that show. If you then click on their name in the recommendation, you
        will be taken to their profile and all their recommendations. On the
        home screen, you can also choose to only see shows which you have not
        saved to your own profile yet (via the toggle at the top of the page).
        {'\n'}
      </Text>

      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate('AddShow')
        }}
      >
        <Text style={styles.headingText}>
          <MaterialCommunityIcons name="television-classic" size={20} />{' '}
          Search/Add Show:
        </Text>
      </TouchableOpacity>
      <Text style={styles.text}>
        This is the page to go to when you want to search for a show to
        potentially add to your profile. You can enter the show title and then
        press "Find show." The app will search The Movie Database's list of
        television shows, and if it finds more than one show title matching that
        name, it will give you a list of those shows, their titles, the year
        they started airing, and their overview. You can also optionally view
        show posters. When you click on the box with the show info describing
        the show you're looking for (or if there's only one title matching what
        you entered), you will be taken to a page where you can add the show to
        your profile. You can also search for where to stream or purchase the
        show online.
        {'\n'}
        {'\n'}
        There are three lists to save shows to on your profile in TV Recs. You
        can save shows to your RECS/RECOMMENDATIONS list, to your WATCH list, or
        to your FILTER OUT list. Your RECS list is for shows you want to
        recommend to other users, and is the only list that other users will be
        able to see. Your WATCH list is for shows you haven't seen yet and want
        to remember to watch later (if you see a friend recommending a show and
        want to check it out, add it to your Watch list so you won't forget what
        it's called). Your FILTER OUT list is for shows you don't want to see
        recommended to you anymore for whatever reason. You can easily
        temporarily filter out shows on your Recs/Watch lists but this list is
        for shows you wouldn't want to put on either of those lists (you already
        saw the show and didn't like it enough to recommend it, or you just know
        you wouldn't want to see it). Shows on your Filter Out will not show up
        on your main feed page (with all the recommendations made by people you
        follow). However, you will still see them if you go directly to a user's
        profile. If you change your mind, you can always delete a show from your
        FILTER OUT list, and it will show up in your main feed again.
        {'\n'}
        {'\n'}
        You can add a description and tags (or not) to shows in any list. You
        can also easily transfer shows from your Watch list to your Seen list or
        your Recs list. You can always change the tags and description later.
        {'\n'}
      </Text>

      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate('Search')
        }}
      >
        <Text style={styles.headingText}>
          <MaterialIcons name="person-add" size={20} /> Search/Follow Users:
        </Text>
      </TouchableOpacity>
      <Text style={styles.text}>
        This is the page to go to when you want to search for another user to
        potentially receive recommendations from. You should search by their
        username. You will also soon be able to search by what someone tagged
        their account with. Click on the username you want to choose, and it
        will take you to their page. On their page, you will be able to click on
        their followers list and see who they follow and easily follow those
        people if you want. You can see all the shows they recommend, and then
        swipe over or click on the righthand tab to see their bio and user tags.
        {'\n'}
      </Text>

      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate('CurrentUser')
        }}
      >
        <Text style={styles.headingText}>
          <MaterialCommunityIcons name="account-circle" size={20} /> Profile:
        </Text>
      </TouchableOpacity>
      <Text style={styles.text}>
        This is the page to go to to see the list of who you follow and to see
        all your lists. You can swipe or click on the tabs to switch between
        lists. You can also click on any of the shows and update
        tags/descriptions.
        {'\n'}
      </Text>

      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate('Settings')
        }}
      >
        <Text style={styles.headingText}>
          <MaterialIcons name="settings" size={20} /> Settings:
        </Text>
      </TouchableOpacity>
      <Text style={styles.text}>
        This is the page to go to to see these instructions again, to add/change
        your tags/bio, or to change your country (and other settings to come).
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    marginBottom: 50,
  },
  text: {
    textAlign: 'left',
    fontSize: 16,
    marginRight: 10,
    marginLeft: 10,
  },
  headingText: {
    fontWeight: 'bold',
    fontSize: 16,
    margin: 5,
    marginLeft: 7,
  },
})

export default FAQ
