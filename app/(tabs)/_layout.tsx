import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const BoldMagnify = ({ size = 14, color = 'black' }) => (
	<Svg viewBox='0 0 512 512' width={size} height={size}>
		<Path
			d='M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z'
			fill={color}
		/>
	</Svg>
);

interface Props {
	baseIcon: any;
	size: number;
	color: string;
	backgroundColor: string;
}

export const ComposedSearchIcon = ({
	baseIcon,
	size = 24,
	color,
	backgroundColor,
}: Props) => (
	<View>
		<MaterialCommunityIcons name={baseIcon} size={size} color={color} />
		<View
			style={{
				position: 'absolute',
				bottom: -2,
				right: -2,
				width: size * 0.65,
				height: size * 0.6,
				borderRadius: 50,
				backgroundColor: backgroundColor,
			}}
		/>
		<View style={{ position: 'absolute', bottom: -2, right: -2 }}>
			<BoldMagnify size={size * 0.58} color={color} />
		</View>
	</View>
);

export const ComposedHeartIcon = ({
	baseIcon,
	size = 24,
	color,
	backgroundColor,
}: Props) => (
	<View>
		<MaterialCommunityIcons name={baseIcon} size={size} color={color} />
		<MaterialCommunityIcons
			name='heart'
			size={21}
			color={backgroundColor}
			style={{ position: 'absolute', bottom: -4.5, right: -4.5 }}
		/>
		<MaterialCommunityIcons
			name='heart'
			size={16}
			color={color}
			style={{ position: 'absolute', bottom: -2, right: -2 }}
		/>
	</View>
);

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarStyle: { backgroundColor: '#340068' },
				tabBarActiveTintColor: '#36C9C6',
				tabBarInactiveTintColor: 'white',
			}}
		>
			<Tabs.Screen
				name='recShows'
				options={{
					tabBarIcon: ({ color }) => (
						<MaterialCommunityIcons name='home' color={color} size={26} />
					),
				}}
			/>
			<Tabs.Screen
				name='searchUsers'
				options={{
					tabBarIcon: ({ color }) => (
						<ComposedSearchIcon
							size={26}
							color={color}
							backgroundColor='#340068'
							baseIcon='account'
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='addShow'
				options={{
					tabBarLabel: 'Add shows',
					tabBarIcon: ({ color }) => (
						<ComposedSearchIcon
							size={26}
							color={color}
							backgroundColor='#340068'
							baseIcon='television-classic'
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='currentUser'
				options={{
					tabBarIcon: ({ color }) => (
						<ComposedHeartIcon
							size={26}
							color={color}
							backgroundColor='#340068'
							baseIcon='television-classic'
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='settings'
				options={{
					tabBarIcon: ({ color }) => (
						<MaterialCommunityIcons
							name='account-circle'
							color={color}
							size={26}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
