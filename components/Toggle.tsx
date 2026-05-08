import { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, useColorScheme } from 'react-native';

interface ToggleProps {
	value: boolean;
	onValueChange: (val: boolean) => void;
	trackColorOn?: string;
	trackColorOff?: string;
}

const Toggle = ({
	value,
	onValueChange,
	trackColorOn = '#36C9C6',
	trackColorOff = '#3e3e3e',
}: ToggleProps) => {
	const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
	const scheme = useColorScheme();
	const isDark = scheme === 'dark';

	useEffect(() => {
		Animated.timing(anim, {
			toValue: value ? 1 : 0,
			duration: 200,
			useNativeDriver: false,
		}).start();
	}, [anim, value]);

	const translateX = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [2, 22],
	});

	const bgColor = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [trackColorOff, trackColorOn],
	});

	return (
		<TouchableOpacity onPress={() => onValueChange(!value)} activeOpacity={0.8}>
			<Animated.View
				style={{
					width: 44,
					height: 26,
					borderRadius: 13,
					backgroundColor: bgColor,
					justifyContent: 'center',
				}}
			>
				<Animated.View
					style={{
						width: 20,
						height: 20,
						borderRadius: 10,
						backgroundColor: isDark ? '#dddddd' : 'white',
						transform: [{ translateX }],
						shadowColor: '#000',
						shadowOpacity: 0.2,
						shadowRadius: 2,
						elevation: 2,
					}}
				/>
			</Animated.View>
		</TouchableOpacity>
	);
};

export default Toggle;
