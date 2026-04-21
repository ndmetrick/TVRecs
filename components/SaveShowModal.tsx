import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type KeepChoice = 'keep' | 'clear' | null;

interface Props {
	modalVisible: boolean;
	setModalVisible: (visible: boolean) => void;
	isOwnShow: boolean;
	onSaveAsIs: (keep: boolean) => void;
	onGoToEdit: (keep: boolean) => void;
	username: string | null;
}

const SaveShowModal = ({
	modalVisible,
	setModalVisible,
	isOwnShow,
	onSaveAsIs,
	onGoToEdit,
	username,
}: Props) => {
	const [keepChoice, setKeepChoice] = useState<KeepChoice>(null);

	const handleSaveAsIs = () => {
		if (!keepChoice) return;
		onSaveAsIs(keepChoice === 'keep');
		setModalVisible(false);
		setKeepChoice(null);
	};

	const handleGoToEdit = () => {
		if (!keepChoice) return;
		onGoToEdit(keepChoice === 'keep');
		setModalVisible(false);
		setKeepChoice(null);
	};

	const actionButtonStyle = (active: boolean) => ({
		...styles.actionButton,
		backgroundColor: active ? '#4056F4' : '#9E9E9E',
	});

	return (
		<Modal
			animationType='slide'
			transparent={true}
			visible={modalVisible}
			onRequestClose={() => setModalVisible(false)}
		>
			<View style={styles.overlay}>
				<View style={styles.modalView}>
					<Text style={styles.question}>
						{isOwnShow
							? 'Keep your existing description and tags?'
							: `Save ${username ? username : "this user's"} description and tags?`}
					</Text>

					{/* Toggle row */}
					<View style={styles.toggleRow}>
						<TouchableOpacity
							style={[
								styles.toggleButton,
								keepChoice === 'keep' && styles.toggleButtonKeep,
							]}
							onPress={() => setKeepChoice('keep')}
						>
							<Text
								style={[
									styles.toggleText,
									keepChoice === 'keep' && styles.toggleTextSelected,
								]}
							>
								{isOwnShow ? 'Keep' : 'Save'}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.toggleButton,
								keepChoice === 'clear' && styles.toggleButtonClear,
							]}
							onPress={() => setKeepChoice('clear')}
						>
							<Text
								style={[
									styles.toggleText,
									keepChoice === 'clear' && styles.toggleTextSelected,
								]}
							>
								Clear
							</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.divider} />

					{/* Action buttons */}
					<TouchableOpacity
						style={actionButtonStyle(!!keepChoice)}
						onPress={handleGoToEdit}
						disabled={!keepChoice}
					>
						<Text style={styles.actionButtonText}>
							Yes, take me to add/edit tags and description
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							actionButtonStyle(!!keepChoice),
							{ backgroundColor: keepChoice ? '#6B5E8C' : '#9E9E9E' },
						]}
						onPress={handleSaveAsIs}
						disabled={!keepChoice}
					>
						<Text style={styles.actionButtonText}>No, just save as-is</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.cancelButton}
						onPress={() => {
							setModalVisible(false);
							setKeepChoice(null);
						}}
					>
						<Text style={styles.cancelText}>Cancel</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	modalView: {
		backgroundColor: 'white',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 24,
		paddingBottom: 40,
	},
	question: {
		fontSize: 18,
		fontWeight: '600',
		textAlign: 'center',
		marginBottom: 16,
		color: '#1a1a1a',
	},
	toggleRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 12,
		marginBottom: 16,
	},
	toggleButton: {
		paddingVertical: 10,
		paddingHorizontal: 28,
		borderRadius: 40,
		borderWidth: 2,
		borderColor: '#ddd',
	},
	toggleButtonKeep: {
		backgroundColor: '#2D9B6F',
		borderColor: '#2D9B6F',
	},
	toggleButtonClear: {
		backgroundColor: '#C45C3A',
		borderColor: '#C45C3A',
	},
	toggleText: {
		fontSize: 16,
		color: '#333',
		fontWeight: '500',
	},
	toggleTextSelected: {
		color: 'white',
	},
	divider: {
		height: 1,
		backgroundColor: '#eee',
		marginBottom: 16,
	},
	actionButton: {
		padding: 12,
		borderRadius: 40,
		marginBottom: 10,
		alignItems: 'center',
	},
	actionButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '500',
	},
	cancelButton: {
		alignItems: 'center',
		marginTop: 8,
	},
	cancelText: {
		color: '#888',
		fontSize: 16,
	},
});

export default SaveShowModal;
