import { useColorScheme } from 'react-native';

export const lightColors = {
	background: '#ffffff',
	surface: '#f0f0f0',
	surfaceElevated: '#ffffff',
	text: '#333333',
	textSecondary: '#666666',
	textMuted: 'rgba(0,0,0,0.4)',
	border: '#dddddd',
	inputBackground: '#ffffff',
};

export const darkColors = {
	background: '#121212',
	surface: '#1e1e1e',
	surfaceElevated: '#2a2a2a',
	text: '#f0f0f0',
	textSecondary: '#aaaaaa',
	textMuted: 'rgba(255,255,255,0.4)',
	border: '#444444',
	inputBackground: '#2a2a2a',
};

export type AppColors = typeof lightColors;

export const useAppColors = (): AppColors => {
	const scheme = useColorScheme();
	return scheme === 'dark' ? darkColors : lightColors;
};
