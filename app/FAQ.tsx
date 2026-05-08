import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from 'react-native';
import { ComposedHeartIcon, ComposedSearchIcon } from './(tabs)/_layout';

const FAQ = () => {
	const router = useRouter();
	const isDark = useColorScheme() === 'dark';
	const styles = makeStyles(isDark);
	return (
		<ScrollView style={styles.container}>
			<Text style={{ ...styles.text, fontWeight: 'bold', textAlign: 'center' }}>
				User Guide:
			</Text>

			<TouchableOpacity
				onPress={() => {
					router.push({ pathname: '/recShows' });
				}}
			>
				<Text style={styles.headingText}>
					<MaterialCommunityIcons name='home' size={20} /> Home / Recs:
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
				You can also add all sorts of filters to see shows with tags /
				description, with particular tags (or without particular warning tags),
				or recommended by a minimum number of people you follow.
				{'\n'}
			</Text>

			<TouchableOpacity
				onPress={() => {
					router.push({ pathname: '/searchUsers' });
				}}
			>
				<Text style={styles.headingText}>
					<MaterialCommunityIcons name='account-search' size={20} />{' '}
					Search/Follow Users:
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
					router.push({ pathname: '/addShow' });
				}}
			>
				<Text style={styles.headingText}>
					<View style={{ width: 26, height: 26 }}>
						<ComposedSearchIcon
							size={26}
							color={isDark ? '#dddddd' : 'black'}
							backgroundColor={isDark ? '3e3e3e' : 'white'}
							baseIcon='television-classic'
						/>
					</View>{' '}
					Search/Add Show:
				</Text>
			</TouchableOpacity>
			<Text style={styles.text}>
				{`This is the page to go to when you want to search for a show to potentially add to your profile. You can enter the show title and then press "Find show." The app will search The Movie Database's list of television shows, and if it finds more than one show title matching that name, it will give you a list of those shows, their titles, the year they started airing, and their overview. You can also optionally view show posters. When you click on the box with the show info describing the show you're looking for (or if there's only one title matching what you entered), you will be taken to a page where you can add the show to your profile. You can also search for where to stream or purchase the show online.`}
				{'\n'}
				{'\n'}
				{`There are three lists to save shows to on your profile in TV Recs. You can save shows to your RECS/RECOMMENDATIONS list, to your WATCH list, or to your FILTER OUT list. Your RECS list is for shows you want to recommend to other users, and is the only list that other users will be able to see. Your WATCH list is for shows you haven't seen yet and want to remember to watch later (if you see a friend recommending a show and want to check it out, add it to your Watch list so you won't forget what it's called). Your FILTER OUT list is for shows you don't want to see recommended to you anymore for whatever reason. You can easily temporarily filter out shows on your Recs/Watch lists but this list is for shows you wouldn't want to put on either of those lists (you already saw the show and didn't like it enough to recommend it, or you just know you wouldn't want to see it). Shows on your Filter Out will not show up on your main feed page (with all the recommendations made by people you follow). However, you will still see them if you go directly to a user's profile. If you change your mind, you can always delete a show from your FILTER OUT list, and it will show up in your main feed again.`}
				{'\n'}
				{'\n'}
				You can add a description and tags (or not) to shows in any list. You
				can also easily transfer shows from your Watch list to your Seen list or
				your Recs list. You can always change the tags and description later.
				{'\n'}
			</Text>

			<TouchableOpacity
				onPress={() => {
					router.push({ pathname: '/currentUser' });
				}}
			>
				<Text style={styles.headingText}>
					<ComposedHeartIcon
						size={26}
						color={isDark ? '#dddddd' : 'black'}
						backgroundColor='#white'
						baseIcon='television-classic'
					/>{' '}
					Your shows:
				</Text>
			</TouchableOpacity>
			<Text style={styles.text}>
				{`This is the page to go to to see the shows you recommend, the ones you want to watch, and the ones you want to filter out of recommendations. You can also go to the filter tab and see all the shows you've saved in one place, and filter for different tags, etc. For example, you could tag shows with 'curently watching', and then filter for that and see a list of your current shows. You can swipe or click on the tabs to switch between lists. You can also click on any of the shows and update tags/descriptions.`}
				{'\n'}
			</Text>

			<TouchableOpacity
				onPress={() => {
					router.push({ pathname: '/settings' });
				}}
			>
				<Text style={styles.headingText}>
					<MaterialIcons name='account-circle' size={20} /> User Profile:
				</Text>
			</TouchableOpacity>
			<Text style={styles.text}>
				This is the page to go to to see these instructions again, to add/change
				your tags/bio, or to change your country (and other settings to come).
			</Text>
		</ScrollView>
	);
};

const makeStyles = (isDark: boolean) =>
	StyleSheet.create({
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
			color: isDark ? '#cccccc' : 'black',
		},
		headingText: {
			fontWeight: 'bold',
			fontSize: 16,
			margin: 5,
			marginLeft: 7,
			color: isDark ? '#dddddd' : 'black',
		},
	});

export default FAQ;
