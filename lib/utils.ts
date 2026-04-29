import { addShow, editUserShow } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import {
	EditUserShowParams,
	SourcePage,
	UserShow,
	UserShowToSave,
} from '@/lib/types';
import * as Sentry from '@sentry/react-native';
import { router } from 'expo-router';
import { showErrorToast } from './toast';

export const skipTagsAndSaveShowData = async (
	showData: UserShowToSave,
	previous: SourcePage,
	userId: string,
	refetchUserShows: () => Promise<void>,
	currentUserShow: UserShow | null,
	keepTagsAndDescription?: boolean, // keep previous tags and description when switching type on own show / keep other user's tags and description when saving their show
	refetchFollowingRecs?: () => Promise<void>,
) => {
	try {
		if (currentUserShow) {
			const updates: EditUserShowParams = {
				userShowId: currentUserShow.id,
				newType: showData.type,
				oldUserShow: currentUserShow,
			};
			if (!keepTagsAndDescription) {
				updates.newTagIds = [];
				updates.newDescription = '';
			}
			await editUserShow(supabase, updates);
			await refetchUserShows();
			// because seen/to-filter shows are automatically removed from shows recommended to the user, we need to get recShows again if we succeed in switching a show from seen to something else
			if (refetchFollowingRecs) {
				await refetchFollowingRecs();
			}
			router.push({
				pathname: '/currentUser',
			});
		} else {
			const description =
				previous === SourcePage.ADD_SHOW ||
				!keepTagsAndDescription ||
				!showData.description
					? null
					: showData.description;
			const tagIds =
				previous === SourcePage.ADD_SHOW ||
				!keepTagsAndDescription ||
				!showData.tags
					? []
					: showData.tags?.map((tag) => tag.id);
			const showToAdd = {
				tmdbId: showData.tmdb_id ?? 'NONE',
				name: showData.name,
				type: showData.type,
				imageUrl: showData.image_url,
				description,
				tagIds,
				userId,
			};
			await addShow(supabase, showToAdd);
			await refetchUserShows();
			router.push({
				pathname: '/currentUser',
			});
		}
	} catch (err) {
		console.log(`Error skipping tags and saving show data: ${err}`);
		showErrorToast('Error saving the show do your profile');
		Sentry.captureException(err, {
			tags: { location: 'skipAndSave' },
		});
	}
};
