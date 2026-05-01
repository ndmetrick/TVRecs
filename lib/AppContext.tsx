import * as Sentry from '@sentry/react-native';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {
	getAllTags,
	getAllUsers,
	getCurrentUser,
	getFollowingRecs,
	getUserFollowing,
	getUserShows,
} from './api';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';
import { showErrorToast } from './toast';
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
	filteredFollowingRecs: FollowingRec[];
	userShows: UserShow[];
	toWatch: UserShow[];
	seen: UserShow[];
	allProfileShows: UserShow[];
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
	tvTags: TvTags;
	warningTags: Tag[];
	preferenceTags: Tag[];
	describeTags: Tag[];
};

const AppContext = createContext<AppData | undefined>(undefined);

type TvTags = {
	mood: Tag[];
	representation: Tag[];
	genre: Tag[];
	themes: Tag[];
	experience: Tag[];
	audience: Tag[];
	misc: Tag[];
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const { user } = useAuth();

	const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
	const [following, setFollowing] = useState<Follow[]>([]);
	const [followingRecs, setFollowingRecs] = useState<FollowingRec[]>([]);
	const [userShows, setUserShows] = useState<UserShow[]>([]);
	const [toWatch, setToWatch] = useState<UserShow[]>([]);
	const [allProfileShows, setAllProfileShows] = useState<UserShow[]>([]);
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
	const [tvTags, setTvTags] = useState<TvTags>({
		mood: [],
		audience: [],
		genre: [],
		experience: [],
		themes: [],
		misc: [],
		representation: [],
	});
	const [warningTags, setWarningTags] = useState<Tag[]>([]);
	const [preferenceTags, setPreferenceTags] = useState<Tag[]>([]);
	const [describeTags, setDescribeTags] = useState<Tag[]>([]);

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
		setAllProfileShows([]);
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
		try {
			const data = await getCurrentUser(supabase, user.id);
			setCurrentUser(data);
		} catch (err) {
			console.log(`Error getting user: ${err}`);
			showErrorToast('Could not load your profile');
			Sentry.captureException(err, {
				tags: { location: 'getUserAppContext' },
			});
		}
	}, [user]);

	const refetchFollowing = useCallback(async () => {
		if (!user) return;
		try {
			const data = await getUserFollowing(supabase, user.id);
			setFollowing(data);
		} catch (err) {
			console.log(`Error fetching following: ${err}`);
			showErrorToast('Could not load the users you follow');
			Sentry.captureException(err, {
				tags: { location: 'getFollowingAppContext' },
			});
		}
	}, [user]);

	const refetchFollowingRecs = useCallback(async () => {
		if (!user) return;
		try {
			console.log('REFETCH');
			const data = await getFollowingRecs(supabase, user.id);
			setFollowingRecs(data);
		} catch (err) {
			console.log(`Error fetching following recs: ${err}`);
			showErrorToast(
				'Could not load the recommendations of the people you follow',
			);
			Sentry.captureException(err, {
				tags: { location: 'getFollowingRecs' },
			});
		}
	}, [user]);

	const filteredFollowingRecs = useMemo(() => {
		const seenShowIds = new Set(seen.map((userShow) => userShow.show_id));
		return followingRecs.filter((rec) => !seenShowIds.has(rec.show_id));
	}, [seen, followingRecs]);

	const refetchUserShows = useCallback(async () => {
		if (!user) return;
		try {
			const [recs, watch, seenShows] = await Promise.all([
				getUserShows(supabase, user.id, UserShowType.REC),
				getUserShows(supabase, user.id, UserShowType.WATCH),
				getUserShows(supabase, user.id, UserShowType.SEEN),
			]);
			setUserShows(recs);
			setToWatch(watch);
			setSeen(seenShows);
			setAllProfileShows([...watch, ...recs, ...seenShows]);
		} catch (err) {
			console.error(`Error loading recs, watch, seenShows: ${err}`);
			showErrorToast('There was an error loading the shows on your profile');
			Sentry.captureException(err, {
				tags: { location: 'loadingProfileShows' },
			});
		}
	}, [user]);

	const refetchAllTags = useCallback(async () => {
		try {
			const data = await getAllTags(supabase);
			setAllTags(data);
			const mood: Tag[] = [];
			const representation: Tag[] = [];
			const genre: Tag[] = [];
			const themes: Tag[] = [];
			const experience: Tag[] = [];
			const misc: Tag[] = [];
			const audience: Tag[] = [];
			const warning: Tag[] = [];
			const uTags: Tag[] = [];
			const describe: Tag[] = [];

			data.forEach((tag) => {
				if (tag.type === TagType.UNASSIGNED || tag.type === TagType.TV) {
					if (tag.type === TagType.UNASSIGNED) uTags.push(tag);
					switch (tag.section_id) {
						case 1:
							mood.push(tag);
							break;
						case 2:
							genre.push(tag);
							break;
						case 3:
							representation.push(tag);
							break;
						case 4:
							themes.push(tag);
							break;
						case 5:
							experience.push(tag);
							break;
						case 7:
							audience.push(tag);
							break;
						default:
							misc.push(tag);
					}
				}
				if (tag.type === TagType.PROFILE) {
					uTags.push(tag);
				}
				if (tag.type === TagType.WARNING) {
					warning.push(tag);
				}
				if (tag.type === TagType.PROFILE_DESCRIBE) {
					describe.push(tag);
				}
				setPreferenceTags(uTags.sort((a, b) => a!.name.localeCompare(b!.name)));
				const tv: TvTags = {
					mood: mood.sort((a, b) => a!.name.localeCompare(b!.name)),
					genre: genre.sort((a, b) => a!.name.localeCompare(b!.name)),
					representation: representation.sort((a, b) =>
						a!.name.localeCompare(b!.name),
					),
					audience: audience.sort((a, b) => a!.name.localeCompare(b!.name)),
					misc: misc.sort((a, b) => a!.name.localeCompare(b!.name)),
					experience: experience.sort((a, b) => a!.name.localeCompare(b!.name)),
					themes: themes.sort((a, b) => a!.name.localeCompare(b!.name)),
				};
				setTvTags(tv);
				setWarningTags(warning.sort((a, b) => a!.name.localeCompare(b!.name)));
				setDescribeTags(
					describe.sort((a, b) => a!.name.localeCompare(b!.name)),
				);
			});
		} catch (err) {
			console.error(`Error fetching all tags: ${err}`);
			showErrorToast('Could not load tags');
			Sentry.captureException(err, {
				tags: { location: 'loadingTags' },
			});
		}
	}, []);

	const refetchAllUsers = useCallback(async () => {
		try {
			const data = await getAllUsers(supabase);
			const others = user ? data.filter((u) => u.id !== user.id) : data;
			setAllOtherUsers(others);
		} catch (err) {
			console.error(`Error fetching users: ${err}`);
			showErrorToast('Could not load app users');
			Sentry.captureException(err, {
				tags: { location: 'getAllUsers' },
			});
		}
	}, [user]);

	const refetchAll = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		setError(null);
		try {
			const results = await Promise.allSettled([
				refetchCurrentUser(),
				refetchFollowing(),
				refetchFollowingRecs(),
				refetchUserShows(),
				refetchAllTags(),
				refetchAllUsers(),
			]);

			const failed = results.filter((r) => r.status === 'rejected');
			if (failed.length > 0) {
				showErrorToast('Some data could not be loaded');
			}
		} catch (e) {
			setError(e as Error);
			showErrorToast('Could not load app data');
			Sentry.captureException(e, {
				tags: { location: 'loadAppData' },
			});
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
			refetchAllTags();
			refetchAllUsers();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.id]);

	return (
		<AppContext.Provider
			value={{
				currentUser,
				following,
				followingRecs,
				userShows,
				toWatch,
				seen,
				allProfileShows,
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
				preferenceTags,
				describeTags,
				filteredFollowingRecs,
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
