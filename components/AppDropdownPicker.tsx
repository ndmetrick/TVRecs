import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

type Props = React.ComponentProps<typeof DropDownPicker>;

const AppDropdownPicker = (props: Props) => {
	const isDark = useColorScheme() === 'dark';

	return (
		<DropDownPicker
			{...props}
			style={[
				{
					borderRadius: 15,
					backgroundColor: isDark ? '#4a4a4a' : '#ffffff',
					borderColor: isDark ? '#666666' : '#cccccc',
				},
				props.style,
			]}
			dropDownContainerStyle={[
				{
					backgroundColor: isDark ? '#4a4a4a' : '#ffffff',
					borderColor: isDark ? '#666666' : '#cccccc',
				},
				props.dropDownContainerStyle,
			]}
			textStyle={[
				{
					color: isDark ? '#f0f0f0' : '#333333',
				},
				props.textStyle,
			]}
			searchTextInputStyle={[
				{
					color: isDark ? '#f0f0f0' : '#333333',
					borderColor: isDark ? '#666666' : '#cccccc',
				},
				props.searchTextInputStyle,
			]}
			ArrowDownIconComponent={
				props.ArrowDownIconComponent ??
				(() => (
					<MaterialCommunityIcons
						name='chevron-down'
						size={20}
						color={isDark ? '#f0f0f0' : '#333333'}
					/>
				))
			}
			ArrowUpIconComponent={
				props.ArrowUpIconComponent ??
				(() => (
					<MaterialCommunityIcons
						name='chevron-up'
						size={20}
						color={isDark ? '#f0f0f0' : '#333333'}
					/>
				))
			}
		/>
	);
};

export default AppDropdownPicker;
