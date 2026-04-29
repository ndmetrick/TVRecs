export type UserProfile = {
	id: string;
	email: string;
	username: string;
	country: string | null;
	filter: boolean | null;
	description: string | null;
	image: string | null;
};

export type Show = {
	id: number;
	name: string;
	tmdb_id: string | null;
	image_url: string;
};
export enum ShowFilterType {
	HAS_TAGS = 'hasTags',
	HAS_DESCRIPTION = 'hasDescription',
	HAS_TAG_IDS = 'hasTagIds',
	NOT_HAS_TAG_IDS = 'notHasTagIds',
	MIN_RECS = 'minRecs',
	DESCRIPTION_STRING = 'descriptionString',
	NONE = 'none',
}

export type AppliedShowFilters = {
	hasTags?: boolean;
	hasDescription?: boolean;
	hasTagIds?: number[];
	notHasTagIds?: number[];
	minRecs?: number;
	descriptionString?: string;
	none?: boolean;
};

export type EditUserShowParams = {
	userShowId: number;
	newDescription?: string;
	newTagIds?: number[];
	newType?: UserShowType;
	newVisible?: boolean;
	oldUserShow: UserShow;
};

export enum ProfileTagCategory {
	LIKE = 'like',
	DISLIKE = 'dislike',
	DESCRIBE = 'describe',
}

export enum TagType {
	WARNING = 'warning',
	PROFILE = 'profile',
	PROFILE_DESCRIBE = 'profile-describe',
	UNASSIGNED = 'unassigned',
	TV = 'tv',
}

export type ProfileTag = {
	tag: Tag;
	category: ProfileTagCategory;
};

export type Tag = {
	id: number;
	name: string;
	type: string | null;
	section_id: number | null;
};

export type UserShow = {
	id: number;
	user_id: string;
	show_id: number;
	type: UserShowType;
	description: string | null;
	visible: boolean;
	show: Show;
	tags: Tag[];
	updated_at: string;
};

export type UserShowToSave = {
	name: string;
	tmdb_id: string | null;
	image_url: string | null;
	type: UserShowType;
	tags?: Tag[];
	description?: string | null;
};

export type StreamingInfo = {
	string: string;
	options: Record<string, boolean>;
};

export type WatchProviderInfo = {
	overview: string;
	streaming: StreamingInfo;
	purchase: string;
	date: Date;
};

export type TMDBWatchProvider = {
	provider_name: string;
	provider_id: number;
	display_priority: number;
	logo_path: string;
};

export type TMDBWatchProviderResults = {
	flatrate?: TMDBWatchProvider[];
	buy?: TMDBWatchProvider[];
	rent?: TMDBWatchProvider[];
	link?: string;
} | null;

export enum SourcePage {
	SINGLE_SHOW = 'SINGLE_SHOW',
	ADD_SHOW = 'ADD_SHOW',
	SEARCH = 'SEARCH',
	REC_SHOWS = 'REC_SHOWS',
	CURRENT_USER = 'CURRENT_USER',
	OTHER_USER = 'OTHER_USER',
}

export enum UserShowType {
	WATCH = 'watch',
	REC = 'rec',
	SEEN = 'seen',
}

// A rec from someone the current user follows — user_id is the recommender
export type FollowingRec = UserShow;

// A row from the follows table, with the followed user's profile joined in
export type Follow = {
	followedUserId: string;
	user: UserProfile;
};

export type Recommender = {
	userId: string;
	recShow: FollowingRec;
};

export type RecCount = {
	num: number;
	recommenders: Recommender[];
	myProfile: string | null;
};

export type UserInfo = {
	id: string;
	username: string;
};
