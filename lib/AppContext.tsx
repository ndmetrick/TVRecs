import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useAuth } from './AuthContext';
import {
	getAllTags,
	getAllUsers,
	getCurrentUser,
	getFollowingRecs,
	getUserFollowing,
	getUserShows,
} from './api';
import { supabase } from './supabase';
import {
	Follow,
	FollowingRec,
	Tag,
	TagType,
	UserProfile,
	UserShow,
	UserShowType,
	WatchProviderInfo,
} from './types';

type AppData = {
	currentUser: UserProfile | null;
	following: Follow[];
	followingRecs: FollowingRec[];
	userShows: UserShow[];
	toWatch: UserShow[];
	seen: UserShow[];
	allTags: Tag[];
	loading: boolean;
	error: Error | null;
	refetchCurrentUser: () => Promise<void>;
	refetchFollowing: () => Promise<void>;
	refetchFollowingRecs: () => Promise<void>;
	refetchUserShows: () => Promise<void>;
	refetchAll: () => Promise<void>;
	watchProviders: Record<string, WatchProviderInfo>;
	addToWatchProviders: (
		tmdbId: string,
		watchProviderInfo: WatchProviderInfo,
	) => void;
	followingMap: Record<string, UserProfile>;
	allOtherUsers: UserProfile[] | null;
	tvTags: Tag[];
	warningTags: Tag[];
	userTags: Tag[];
};

const AppContext = createContext<AppData | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const { user } = useAuth();

	const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
	const [following, setFollowing] = useState<Follow[]>([]);
	const [followingRecs, setFollowingRecs] = useState<FollowingRec[]>([]);
	const [userShows, setUserShows] = useState<UserShow[]>([]);
	const [toWatch, setToWatch] = useState<UserShow[]>([]);
	const [seen, setSeen] = useState<UserShow[]>([]);
	const [allTags, setAllTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [watchProviders, setWatchProviders] = useState<
		Record<string, WatchProviderInfo>
	>({});
	const [allOtherUsers, setAllOtherUsers] = useState<UserProfile[] | null>(
		null,
	);
	const [tvTags, setTvTags] = useState<Tag[]>([]);
	const [warningTags, setWarningTags] = useState<Tag[]>([]);
	const [userTags, setUserTags] = useState<Tag[]>([]);

	const followingMap = useMemo(
		() =>
			following.reduce(
				(accum: Record<string, UserProfile>, follow: Follow) => {
					accum[follow.followedUserId] = follow.user;
					return accum;
				},
				{} as Record<string, UserProfile>,
			),
		[following],
	);

	const clearAll = () => {
		setCurrentUser(null);
		setFollowing([]);
		setFollowingRecs([]);
		setUserShows([]);
		setToWatch([]);
		setSeen([]);
		setAllTags([]);
		setError(null);
		setWatchProviders({});
	};

	const addToWatchProviders = (
		tmdbId: string,
		watchProviderInfo: WatchProviderInfo,
	) => {
		setWatchProviders((prev) => ({
			...prev,
			[tmdbId]: watchProviderInfo,
		}));
	};
	const refetchCurrentUser = useCallback(async () => {
		if (!user) return;
		const data = await getCurrentUser(supabase, user.id);
		setCurrentUser(data);
	}, [user]);

	const refetchFollowing = useCallback(async () => {
		if (!user) return;
		const data = await getUserFollowing(supabase, user.id);
		setFollowing(data);
	}, [user]);

	const refetchFollowingRecs = useCallback(async () => {
		if (!user) return;
		const data = await getFollowingRecs(supabase, user.id);
		setFollowingRecs(data);
	}, [user]);

	const refetchUserShows = useCallback(async () => {
		if (!user) return;
		const [recs, watch, seenShows] = await Promise.all([
			getUserShows(supabase, user.id, UserShowType.REC),
			getUserShows(supabase, user.id, UserShowType.WATCH),
			getUserShows(supabase, user.id, UserShowType.SEEN),
		]);
		setUserShows(recs);
		setToWatch(watch);
		setSeen(seenShows);
	}, [user]);

	const refetchAllTags = useCallback(async () => {
		const data = await getAllTags(supabase);
		setAllTags(data);

		const tv: Tag[] = [];
		const warning: Tag[] = [];
		const uTags: Tag[] = [];

		data.forEach((tag) => {
			if (tag.type === TagType.UNASSIGNED) {
				uTags.push(tag);
				tv.push(tag);
			}
			if (tag.type === TagType.TV) {
				tv.push(tag);
			}
			if (tag.type === TagType.PROFILE) {
				uTags.push(tag);
			}
			if (tag.type === TagType.WARNING) {
				warning.push(tag);
				uTags.push(tag);
			}
			if (tag.type === TagType.PROFILE_DESCRIBE) {
				uTags.push(tag);
			}
			setUserTags(uTags);
			setTvTags(tv);
			setWarningTags(warning);
		});
	}, []);

	const refetchAllUsers = useCallback(async () => {
		const data = await getAllUsers(supabase);
		const others = user ? data.filter((u) => u.id !== user.id) : data;
		setAllOtherUsers(others);
	}, [user]);

	const refetchAll = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		setError(null);
		try {
			await Promise.all([
				refetchCurrentUser(),
				refetchFollowing(),
				refetchFollowingRecs(),
				refetchUserShows(),
				refetchAllTags(),
				refetchAllUsers(),
			]);
		} catch (e) {
			setError(e as Error);
		} finally {
			setLoading(false);
		}
	}, [
		user,
		refetchCurrentUser,
		refetchFollowing,
		refetchFollowingRecs,
		refetchUserShows,
		refetchAllTags,
		refetchAllUsers,
	]);

	useEffect(() => {
		if (user) {
			refetchAll();
		} else {
			clearAll();
		}
	}, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<AppContext.Provider
			value={{
				currentUser,
				following,
				followingRecs,
				userShows,
				toWatch,
				seen,
				allTags,
				loading,
				error,
				refetchCurrentUser,
				refetchFollowing,
				refetchFollowingRecs,
				refetchUserShows,
				refetchAll,
				addToWatchProviders,
				watchProviders,
				followingMap,
				allOtherUsers,
				tvTags,
				warningTags,
				userTags,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};

export const useAppData = () => {
	const context = useContext(AppContext);
	if (!context)
		throw new Error('useAppData must be used within an AppProvider');
	return context;
};
