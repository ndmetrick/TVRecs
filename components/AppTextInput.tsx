import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, TextInput } from 'react-native-paper';

type Props = React.ComponentProps<typeof TextInput>;

const AppTextInput = (props: Props) => {
	const scheme = useColorScheme();
	const isDark = scheme === 'dark';
	console.log('isDark', isDark);

	const theme =
		scheme === 'dark'
			? {
					...MD3DarkTheme,
					colors: {
						...MD3DarkTheme.colors,
						background: '#4a4a4a',
						onSurface: '#dddddd',
						onSurfaceVariant: '#aaaaaa',
						primary: '#36C9C6',
					},
				}
			: {
					...MD3LightTheme,
					colors: {
						...MD3LightTheme.colors,
						primary: '#340068',
					},
				};

	return (
		<TextInput
			{...props}
			theme={theme}
			outlineColor={props.outlineColor ?? (isDark ? '#888888' : '#340068')}
			activeOutlineColor={
				props.activeOutlineColor ?? (isDark ? '#36C9C6' : '#340068')
			}
		/>
	);
};

export default AppTextInput;
