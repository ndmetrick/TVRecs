import LoggedOutSettings from '@/components/LoggedOutSettings';
import ProfileHeader from '@/components/ProfileHeader';
import { useAppData } from '@/lib/AppContext';
import { SourcePage, UserShowType } from '@/lib/types';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ViewShows from '../viewShows';

const CurrentUser = () => {
	const [activeTab, setActiveTab] = useState<UserShowType>(UserShowType.REC);
	const { currentUser, following, userShows, toWatch, seen } = useAppData();

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
			label: `Filter Out (${seen.length})`,
			shows: seen,
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
				{tabs.map((tab) => (
					<TouchableOpacity
						key={tab.key}
						onPress={() => setActiveTab(tab.key)}
						style={[
							styles.tabButton,
							activeTab === tab.key && styles.tabButtonActive,
						]}
					>
						<Text style={styles.tabButtonText}>{tab.label}</Text>
					</TouchableOpacity>
				))}
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
	},
	tabSwitcher: {
		flexDirection: 'row',
		backgroundColor: '#340068',
	},
	tabButton: {
		flex: 1,
		padding: 10,
		alignItems: 'center',
		opacity: 0.8,
	},
	tabButtonActive: {
		borderBottomWidth: 6,
		borderBottomColor: '#36C9C6',
		opacity: 1,
	},
	tabButtonText: {
		color: 'white',
		fontWeight: '500',
		fontSize: 14,
	},
});
export default CurrentUser;
