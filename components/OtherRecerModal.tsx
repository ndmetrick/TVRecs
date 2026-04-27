import { useAppData } from '@/lib/AppContext';
import { Recommender, SourcePage } from '@/lib/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

interface Props {
	modalVisible: boolean;
	setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
	selectedItem: Recommender[];
	previous: SourcePage;
}

const OtherRecerModal = (props: Props) => {
	const { modalVisible, selectedItem, setModalVisible, previous } = props;
	const { followingMap } = useAppData();
	const router = useRouter();
	const otherRecerClicked = (recommender: Recommender) => {
		// const userId = previous === 'RecShows' ? recShow.userId : recShow.user.id
		// const showId = previous === 'RecShows' ? recShow.showId : recShow.show.Id
		const user = followingMap[recommender.userId];
		setModalVisible(!modalVisible);
		const userShow = recommender.recShow;

		router.push({
			pathname: '/singleShow',
			params: {
				userString: JSON.stringify(user),
				userShowString: JSON.stringify(userShow),
			},
		});
	};

	return (
		<Modal
			animationType='fade'
			transparent={true}
			visible={modalVisible}
			onRequestClose={() => setModalVisible(false)}
		>
			<View style={styles.centeredView}>
				<View style={styles.modalView}>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							marginBottom: 12,
						}}
					>
						<Text style={styles.modalHeadingText}>Other recommenders</Text>
						<Pressable
							onPress={() => setModalVisible(false)}
							style={({ pressed }) => ({
								position: 'absolute',
								right: 0,
								opacity: pressed ? 0.4 : 1,
								padding: 4,
							})}
						>
							<Text style={styles.closeButtonText}>✕</Text>
						</Pressable>
					</View>
					<ScrollView>
						{selectedItem?.map((item, index) => {
							if (previous === SourcePage.REC_SHOWS || index !== 0) {
								return (
									<TouchableOpacity
										key={index}
										style={styles.recommenderRow}
										onPress={() => otherRecerClicked(item)}
									>
										<MaterialCommunityIcons
											name='television-classic'
											size={20}
											color='#888'
										/>
										<Text style={styles.recommenderText}>
											{followingMap[item.userId].username}
										</Text>
										<MaterialCommunityIcons
											name='chevron-right'
											size={16}
											color='#888'
										/>
									</TouchableOpacity>
								);
							}
						})}
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	modalView: {
		backgroundColor: 'white',
		width: '100%',
		paddingVertical: 24,
		paddingHorizontal: 20,
		borderWidth: 3,
		borderColor: '#B2D8D8',
	},
	modalHeadingText: {
		fontSize: 18,
		fontWeight: '600',
		textAlign: 'center',
		marginBottom: 12,
	},
	closeButton: {
		position: 'absolute',
		top: 12,
		right: 12,
	},
	closeButtonText: {
		fontSize: 20,
		color: '#888',
	},
	recommenderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingVertical: 12,
	},
	recommenderText: {
		fontSize: 18,
		color: '#222',
	},
});

export default OtherRecerModal;
