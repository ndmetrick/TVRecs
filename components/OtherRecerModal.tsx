import { useAppData } from '@/lib/AppContext';
import { Recommender, SourcePage } from '@/lib/types';
import { router } from 'expo-router';
import React from 'react';
import {
	Alert,
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
			onRequestClose={() => {
				Alert.alert('Modal has been closed.');
			}}
		>
			<ScrollView>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<Text style={{ ...styles.text, fontWeight: 'bold' }}>
							Other recommenders:
						</Text>
						{selectedItem
							? selectedItem.map((item, index) => {
									if (previous === SourcePage.REC_SHOWS || index !== 0) {
										return (
											<View key={index}>
												<TouchableOpacity
													onPress={() => otherRecerClicked(item)}
												>
													<Text style={styles.text}>
														{followingMap[item.userId].username}
													</Text>
												</TouchableOpacity>
											</View>
										);
									}
								})
							: null}
						<Pressable
							style={styles.closeButton}
							onPress={() => setModalVisible(!modalVisible)}
						>
							<Text style={styles.text}>x</Text>
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 22,
	},
	modalView: {
		margin: 20,
		backgroundColor: 'white',
		padding: 35,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	closeButton: {
		borderWidth: 2,
		alignSelf: 'flex-end',
		position: 'absolute',
	},
	text: {
		margin: 8,
		textAlign: 'center',
		fontSize: 20,
	},
});

export default OtherRecerModal;
