import LoggedOutSettings from '@/components/LoggedOutSettings';
import ProfileHeader from '@/components/ProfileHeader';
import { useAppData } from '@/lib/AppContext';
import { SourcePage, UserShowType } from '@/lib/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ViewShows from '../viewShows';

const CurrentUser = () => {
	const [activeTab, setActiveTab] = useState<string>(UserShowType.REC);
	const { currentUser, following, userShows, toWatch, seen, allProfileShows } =
		useAppData();

	if (!currentUser) return <LoggedOutSettings />;

	const tabs = [
		{
			key: UserShowType.REC,
			label: `Recs (${userShows.length})`,
			shows: userShows,
		},
		{
			key: UserShowType.WATCH,
			label: `To Watch (${toWatch.length})`,
			shows: toWatch,
		},
		{
			key: UserShowType.SEEN,
			label: `Hidden (${seen.length})`,
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
			<ProfileHeader
				previous={SourcePage.CURRENT_USER}
				user={currentUser}
				userFollowing={following}
			/>
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
							]}
						>
							{isIcon ? (
								<Text style={styles.tabButtonText}>
									{tab.label}{' '}
									<MaterialCommunityIcons
										name='filter'
										size={14}
										color={isActive ? 'white' : 'rgba(255,255,255,0.8)'}
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingBottom: 20,
	},
	tabSwitcher: {
		flexDirection: 'row',
		backgroundColor: '#340068',
	},
	tabButton: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 4,
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
		paddingHorizontal: 8,
		alignItems: 'center',
	},
});
export default CurrentUser;
