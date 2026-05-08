import LoggedOutSettings from '@/components/LoggedOutSettings';
import ProfileHeader from '@/components/ProfileHeader';
import { useAppData } from '@/lib/AppContext';
import { SourcePage, UserShowType } from '@/lib/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
	Animated,
	Easing,
	StyleSheet,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from 'react-native';
import ViewShows from '../viewShows';

const CurrentUser = () => {
	const [activeTab, setActiveTab] = useState<string>(UserShowType.REC);
	const { currentUser, following, userShows, toWatch, seen, allProfileShows } =
		useAppData();
	const isDark = useColorScheme() === 'dark';
	const styles = makeStyles(isDark);

	const headerHeight = useRef(new Animated.Value(1)).current;
	const [headerNaturalHeight, setHeaderNaturalHeight] = useState(0);
	const [measured, setMeasured] = useState(false);

	useEffect(() => {
		if (!measured) return;
		Animated.timing(headerHeight, {
			toValue: activeTab === 'all' ? 0 : 1,
			duration: 250,
			easing: Easing.inOut(Easing.ease),
			useNativeDriver: false,
		}).start();
	}, [activeTab, headerHeight, measured]);

	if (!currentUser) return <LoggedOutSettings />;

	const tabs = [
		{
			key: UserShowType.REC,
			label: `Recs (66)`,
			shows: userShows,
		},
		{
			key: UserShowType.WATCH,
			label: `To Watch (66)`,
			shows: toWatch,
		},
		{
			key: UserShowType.SEEN,
			label: `Hidden (66)`,
			shows: seen,
		},
		{
			key: 'all',
			label: 'Filter',
			shows: allProfileShows,
		},
	] as const;

	const activeShows = tabs.find((t) => t.key === activeTab)?.shows ?? [];

	return (
		<View style={styles.container}>
			<Animated.View
				style={{
					height: measured
						? headerHeight.interpolate({
								inputRange: [0, 1],
								outputRange: [0, headerNaturalHeight],
							})
						: undefined, // let it size naturally until measured
					overflow: 'hidden',
				}}
				onLayout={(e) => {
					const h = e.nativeEvent.layout.height;
					if (h > 0 && !measured) {
						setHeaderNaturalHeight(h);
						setMeasured(true);
					}
				}}
			>
				<ProfileHeader
					previous={SourcePage.CURRENT_USER}
					user={currentUser}
					userFollowing={following}
				/>
			</Animated.View>

			<View style={styles.tabSwitcher}>
				{tabs.map((tab) => {
					const isIcon = tab.key === 'all';
					const isActive = activeTab === tab.key;
					return (
						<TouchableOpacity
							key={tab.key}
							onPress={() => setActiveTab(tab.key)}
							style={[
								isIcon ? styles.tabButtonIcon : styles.tabButton,
								isActive && styles.tabButtonActive,
								!isActive && activeTab === 'all' && styles.tabButtonInactive,
								!isIcon && {
									flexGrow:
										tab.key === UserShowType.REC
											? 1.1
											: tab.key === UserShowType.WATCH
												? 1.6
												: 1.3,
								},
							]}
						>
							{isIcon ? (
								<Text
									style={[
										styles.tabButtonText,
										isActive && isDark
											? { color: '#dddddd' }
											: isActive
												? { color: 'white' }
												: { color: 'rgba(255,255,255,0.8)' },
									]}
								>
									{tab.label}{' '}
									<MaterialCommunityIcons
										name='filter'
										size={14}
										color={
											isActive && !isDark
												? 'white'
												: isActive
													? '#dddddd'
													: 'rgba(255,255,255,0.8)'
										}
									/>
								</Text>
							) : (
								<Text style={styles.tabButtonText}>{tab.label}</Text>
							)}
						</TouchableOpacity>
					);
				})}
			</View>
			<ViewShows
				userToView={currentUser}
				shows={activeShows}
				type={activeTab}
			/>
		</View>
	);
};

const makeStyles = (isDark: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
		},
		tabSwitcher: {
			flexDirection: 'row',
			backgroundColor: '#340068',
			paddingHorizontal: 2,
		},
		tabButton: {
			flex: 1,
			flexShrink: 1,
			paddingVertical: 10,
			paddingHorizontal: 6,
			alignItems: 'center',
			opacity: 0.8,
		},
		tabButtonActive: {
			borderBottomWidth: 6,
			borderBottomColor: '#36C9C6',
			opacity: 1,
		},
		tabButtonInactive: {
			opacity: 0.5,
		},
		tabButtonText: {
			color: 'white',
			fontWeight: '500',
			fontSize: 14,
		},
		tabButtonIcon: {
			paddingVertical: 10,
			paddingHorizontal: 6,
			alignItems: 'center',
		},
	});
export default CurrentUser;
