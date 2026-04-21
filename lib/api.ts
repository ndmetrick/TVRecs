import { SupabaseClient } from '@supabase/supabase-js';
import {
	Follow,
	FollowingRec,
	ProfileTag,
	ProfileTagCategory,
	Show,
	Tag,
	UserProfile,
	UserShow,
	UserShowType,
} from './types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const flattenTags = (rows: { tag: Tag }[]): Tag[] => rows.map((r) => r.tag);

// ── Users ─────────────────────────────────────────────────────────────────────

export const getCurrentUser = async (
	supabase: SupabaseClient,
	uid: string,
): Promise<UserProfile | null> => {
	const { data, error } = await supabase
		.from('users')
		.select('*')
		.eq('id', uid)
		.single();
	if (error) throw error;
	return data;
};

// Structured for getMatchingUsers(supabase, tagIds) extension:
// add a second query against profile_tags to get user_ids matching tagIds,
// then append .in('id', matchingIds) before returning.
export const getAllUsers = async (
	supabase: SupabaseClient,
): Promise<UserProfile[]> => {
	const { data, error } = await supabase.from('users').select('*');
	if (error) throw error;
	return data ?? [];
};

// ── Shows ─────────────────────────────────────────────────────────────────────

export const getUserShows = async (
	supabase: SupabaseClient,
	uid: string,
	type: UserShowType,
): Promise<UserShow[]> => {
	const { data, error } = await supabase
		.from('user_shows')
		.select(
			`
      *,
      show:shows(*),
      user_show_tags(tag:tags(*))
    `,
		)
		.eq('user_id', uid)
		.eq('type', type);
	if (error) throw error;

	return (data ?? []).map((row) => ({
		...row,
		tags: flattenTags(row.user_show_tags),
	}));
};

// ── Following / Feed ──────────────────────────────────────────────────────────

export const getUserFollowing = async (
	supabase: SupabaseClient,
	uid: string,
): Promise<Follow[]> => {
	const { data, error } = await supabase
		.from('follows')
		.select(
			`
      followed,
      user:users!followed(*)
    `,
		)
		.eq('follower', uid);
	if (error) throw error;
	return (data ?? []).map((row) => ({
		followedUserId: row.followed as string,
		user: row.user as unknown as UserProfile,
	}));
};

// Feed query. To add tag filtering later (getMatchingRecs):
//   1. Query user_show_tags for user_show_ids matching tagIds
//   2. Append .in('id', matchingUserShowIds) to the main query below
export const getFollowingRecs = async (
	supabase: SupabaseClient,
	uid: string,
): Promise<FollowingRec[]> => {
	const { data: followRows, error: followError } = await supabase
		.from('follows')
		.select('followed')
		.eq('follower', uid);
	if (followError) throw followError;

	const followedIds = (followRows ?? []).map((r) => r.followed);
	if (followedIds.length === 0) return [];

	const { data, error } = await supabase
		.from('user_shows')
		.select(
			`
      *,
      show:shows(*),
      user_show_tags(tag:tags(*))
    `,
		)
		.eq('type', UserShowType.REC)
		.eq('visible', true)
		.in('user_id', followedIds);
	if (error) throw error;

	return (data ?? []).map((row) => ({
		...row,
		tags: flattenTags(row.user_show_tags),
	}));
};

export const followUser = async (
	supabase: SupabaseClient,
	followerId: string,
	followedId: string,
): Promise<void> => {
	const { error } = await supabase
		.from('follows')
		.insert({ follower: followerId, followed: followedId })
		.select()
		.single();
	if (error) {
		console.error(`Error following user: ${error}`);
		throw error;
	}
	return;
};

export const unfollowUser = async (
	supabase: SupabaseClient,
	followerId: string,
	followedId: string,
): Promise<void> => {
	const { error } = await supabase
		.from('follows')
		.delete()
		.eq('follower', followerId)
		.eq('followed', followedId);
	if (error) {
		console.error(`Error unfollowing user: ${error}`);
		throw error;
	}
};

export const deleteUserShow = async (
	supabase: SupabaseClient,
	userShowId: number,
): Promise<boolean> => {
	const { error } = await supabase
		.from('user_shows')
		.delete()
		.eq('id', userShowId);
	if (error) throw error;
	return true;
};

export const addShow = async (
	supabase: SupabaseClient,
	params: {
		tmdbId: string;
		name: string;
		imageUrl: string | null;
		type: UserShowType;
		description: string | null;
		tagIds: number[];
		userId: string;
	},
): Promise<UserShow> => {
	const { tmdbId, name, imageUrl, type, description, tagIds, userId } = params;

	// Step 1: find or create the show
	let show: Show;
	const { data: existingShow, error: findError } = await supabase
		.from('shows')
		.select('*')
		.eq('tmdb_id', tmdbId)
		.maybeSingle();
	if (findError) throw findError;

	if (existingShow) {
		show = existingShow;
	} else {
		const { data: newShow, error: insertShowError } = await supabase
			.from('shows')
			.insert({ tmdb_id: tmdbId, name, image_url: imageUrl })
			.select()
			.single();
		if (insertShowError) {
			console.error(`InsertShowError: ${JSON.stringify(insertShowError)}`);
			throw insertShowError;
		}
		show = newShow;
	}

	// Step 2: insert the user_show
	const { data: userShowRow, error: userShowError } = await supabase
		.from('user_shows')
		.insert({
			user_id: userId,
			show_id: show.id,
			type,
			description,
			visible: true,
		})
		.select()
		.single();
	if (userShowError) {
		console.error(`userShowError: ${userShowError}`);
		throw userShowError;
	}

	// Step 3: insert tags if any
	let tags: Tag[] = [];
	if (tagIds.length > 0) {
		const tagRows = tagIds.map((tag_id) => ({
			user_show_id: userShowRow.id,
			tag_id,
		}));
		const { error: tagsError } = await supabase
			.from('user_show_tags')
			.insert(tagRows);
		if (tagsError) throw tagsError;
		tags = await getUserShowTags(supabase, userShowRow.id);
	}

	return { ...userShowRow, show, tags };
};

export const editUserShow = async (
	supabase: SupabaseClient,
	params: {
		userShowId: number;
		newDescription?: string;
		newTagIds?: number[];
		newType?: UserShowType;
		newVisible?: boolean;
		oldUserShow: UserShow;
	},
): Promise<UserShow> => {
	const updates: Record<string, unknown> = {};
	const {
		userShowId,
		newDescription,
		newTagIds,
		newType,
		newVisible,
		oldUserShow,
	} = params;
	if (newType !== undefined) updates.type = newType;
	if (newDescription !== undefined) updates.description = newDescription;
	if (newVisible !== undefined) updates.visible = newVisible;

	let userShow = oldUserShow;
	let tags = oldUserShow.tags;
	if (Object.keys(updates).length > 0) {
		const { data: userShowRow, error: userShowError } = await supabase
			.from('user_shows')
			.update(updates)
			.eq('id', userShowId)
			.select('*, show:shows(*)')
			.single();
		if (userShowError) throw userShowError;
		userShow = userShowRow;
	}
	if (newTagIds) {
		const tagRows = newTagIds.map((tag_id) => ({
			user_show_id: userShow.id,
			tag_id,
		}));
		const { error: deleteError } = await supabase
			.from('user_show_tags')
			.delete()
			.eq('user_show_id', userShow.id);
		if (deleteError) throw deleteError;
		const { error: tagsError } = await supabase
			.from('user_show_tags')
			.insert(tagRows);
		if (tagsError) throw tagsError;
		tags = await getUserShowTags(supabase, userShow.id);
	}

	return { ...userShow, tags };
};

// ── Tags ──────────────────────────────────────────────────────────────────────

export const getUserTags = async (
	supabase: SupabaseClient,
	uid: string,
): Promise<ProfileTag[]> => {
	const { data, error } = await supabase
		.from('profile_tags')
		.select('category, tag:tags(*)')
		.eq('user_id', uid);
	if (error) throw error;
	return (data ?? []).map((row) => ({
		tag: row.tag as unknown as Tag,
		category: row.category as ProfileTagCategory,
	}));
};

export const getAllTags = async (supabase: SupabaseClient): Promise<Tag[]> => {
	const { data, error } = await supabase.from('tags').select('*');
	if (error) throw error;
	return data ?? [];
};

export const getUserShowTags = async (
	supabase: SupabaseClient,
	userShowId: number,
): Promise<Tag[]> => {
	const { data, error } = await supabase
		.from('user_show_tags')
		.select('tag:tags(*)')
		.eq('user_show_id', userShowId);
	if (error) throw error;
	return flattenTags((data ?? []) as unknown as { tag: Tag }[]);
};

export const setProfileTags = async (
	supabase: SupabaseClient,
	uid: string,
	profileTags: { tagId: number; category: ProfileTagCategory }[],
): Promise<void> => {
	const { error: deleteError } = await supabase
		.from('profile_tags')
		.delete()
		.eq('user_id', uid);
	if (deleteError) throw deleteError;

	if (profileTags.length > 0) {
		const rows = profileTags.map(({ tagId, category }) => ({
			user_id: uid,
			tag_id: tagId,
			category,
		}));
		const { error: insertError } = await supabase
			.from('profile_tags')
			.insert(rows);
		if (insertError) throw insertError;
	}
};
