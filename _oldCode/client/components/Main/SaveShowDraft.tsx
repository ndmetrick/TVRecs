import { addShow, editUserShow } from '@/lib/api';
import { useAppData } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import {
	SourcePage,
	UserShow,
	UserShowToSave,
	UserShowType,
} from '@/lib/types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
	ActivityIndicator,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

interface Props {
	showData: UserShowToSave;
	previous: SourcePage;
	currentUserShow?: UserShow;
}

function SaveShow(props: Props) {
	const [userShow, setUserShow] = useState<UserShow | null>(null);
	const [loading, setLoading] = useState(true);
	const [previousPage, setPreviousPage] = useState<SourcePage | null>(null);
	// const [showInfo, setShowInfo] = useState<UserShowToSave | null>(null);
	const { showData, previous, currentUserShow } = props;
	const { refetchFollowingRecs, refetchUserShows, currentUser } = useAppData();

	const saveShowData = async () => {
		try {
			if (currentUserShow) {
				const updates: any = {
					userShowId: currentUserShow.id,
					newType: showData.type,
					oldUserShow: currentUserShow,
				};
				if (!showData.keep) {
					updates.newTagIds = [];
					updates.newDescription = '';
				}
				const updatedUserShow = await editUserShow(supabase, updates);
				await refetchUserShows();
				// because seen/to-filter shows are automatically removed from shows recommended to the user, we need to get recShows again if we succeed in switching a show from seen to something else
				if (updatedUserShow && currentUserShow.type === UserShowType.SEEN) {
					await refetchFollowingRecs();
				}
				setUserShow(updatedUserShow);
				router.push({
					pathname: '/currentUser',
				});
			} else {
				const description =
					previous === SourcePage.ADD_SHOW ||
					!showData.keep ||
					!showData.description
						? null
						: showData.description;
				const tagIds =
					previous === SourcePage.ADD_SHOW || !showData.keep || !showData.tags
						? []
						: showData.tags?.map((tag) => tag.id);
				const showToAdd = {
					tmdbId: showData.tmdb_id ?? 'NONE',
					name: showData.name,
					type: showData.type,
					description,
					tagIds,
					userId: currentUser!.id,
				};
				const show = await addShow(supabase, showToAdd);
				setUserShow(show);
				if (previous === SourcePage.ADD_SHOW) {
					router.push({
						pathname: '/currentUser',
					});
        } else {
          props.navigation.pop();
        }
			}
		} catch (err) {
			console.log(err);
		}
	};


	const displayUserShowInfo = () => {
		console.log('i am here and type is', showData.type);
		const addedOrSwitched = currentUserShow || previous === SourcePage.ADD_SHOW ? 'moved' : 'added';
		return (
			<Text style={styles.text}>
				<Text style={{ fontWeight: 'bold' }}>{userShow.show.name}</Text> has
				been {addedOrSwitched} to your{' '}
				{userShow.type === 'watch'
					? 'Watch'
					: userShow.type === 'seen'
						? 'Filter Out'
						: 'Recs'}{' '}
				list{' '}
			</Text>
		);
	};

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' color='#5500dc' />
			</View>
		);
	}

	const image = { uri: userShow.show.imageUrl };
	return (
		<View>
			<ScrollView showsVerticalScrollIndicator={false}>
				{displayUserShowInfo()}
				<Image
					source={image}
					style={{ height: 300, resizeMode: 'contain', margin: 5 }}
				/>
				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={styles.button}
						onPress={() =>
							props.navigation.navigate('Add/Change Tags', {
								userShow,
								tags,
								description,
								previous: 'SaveShow',
							})
						}
					>
						<Text style={styles.buttonText}>
							Next: add description and tags
						</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.button} onPress={saveShowData}>
						<Text style={styles.buttonText}>Skip description/tags</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		// justifyContent: 'center',
		marginHorizontal: 2,
	},
	text: {
		margin: 5,
		textAlign: 'center',
		fontSize: 20,
	},
	inputText: {
		margin: 5,
		textAlign: 'center',
		fontSize: 20,
	},
	buttonText: {
		textAlign: 'center',
		fontSize: 18,
		margin: 5,
		fontWeight: '500',
		color: 'white',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	button: {
		padding: 10,
		borderRadius: 40,
		marginHorizontal: 3,
		backgroundColor: '#340068',
		marginTop: 5,
	},
});

export default SaveShow;
