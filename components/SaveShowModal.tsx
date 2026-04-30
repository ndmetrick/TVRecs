import { useState } from 'react';
import {
	Alert,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

type KeepChoice = 'keep' | 'clear' | null;

interface Props {
	modalVisible: boolean;
	setModalVisible: (visible: boolean) => void;
	isOwnShow: boolean;
	onSaveAsIs: (keep: boolean) => void;
	onGoToEdit: (keep: boolean) => void;
	username: string | null;
	showHasTagsOrDescription: boolean;
	cancelSave: () => void;
}

const SaveShowModal = ({
	modalVisible,
	setModalVisible,
	isOwnShow,
	onSaveAsIs,
	onGoToEdit,
	username,
	showHasTagsOrDescription,
	cancelSave,
}: Props) => {
	const [keepChoice, setKeepChoice] = useState<KeepChoice>(
		showHasTagsOrDescription ? null : 'clear',
	);
	const keep = keepChoice === 'keep';
	const clear = keepChoice === 'clear';

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

	console.log('modal visible...', modalVisible);

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
					{showHasTagsOrDescription && (
						<>
							<Text style={styles.question}>
								{isOwnShow
									? 'Keep your existing description/tags?'
									: `Keep ${username ? username : 'this user'}'s description/tags?`}
							</Text>
							{/* Toggle row */}
							<View style={styles.toggleRow}>
								<TouchableOpacity
									style={[styles.toggleButton, keep && styles.toggleButtonKeep]}
									onPress={() => setKeepChoice('keep')}
								>
									<Text
										style={[
											styles.toggleText,
											keep && styles.toggleTextSelected,
										]}
									>
										Keep them
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										styles.toggleButton,
										clear && styles.toggleButtonClear,
									]}
									onPress={() => setKeepChoice('clear')}
								>
									<Text
										style={[
											styles.toggleText,
											clear && styles.toggleTextSelected,
										]}
									>
										Clear them
									</Text>
								</TouchableOpacity>
							</View>
							<View style={styles.divider} />
						</>
					)}

					{/* Action buttons */}
					<TouchableOpacity
						style={actionButtonStyle(!!keepChoice)}
						onPress={
							keepChoice
								? () => handleGoToEdit()
								: () =>
										Alert.alert('Choose to keep or clear first', '', [
											{ text: 'OK' },
										])
						}
					>
						<Text style={styles.actionButtonText}>
							Take me to tags and description
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							actionButtonStyle(!!keepChoice),
							{ backgroundColor: keepChoice ? '#6B5E8C' : '#9E9E9E' },
						]}
						onPress={
							keepChoice
								? () => handleSaveAsIs()
								: () =>
										Alert.alert('Choose to keep or clear first', '', [
											{ text: 'OK' },
										])
						}
					>
						<Text style={styles.actionButtonText}>
							{showHasTagsOrDescription ? 'Save as-is' : 'Skip tags and save'}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.cancelButton}
						onPress={() => {
							setKeepChoice(showHasTagsOrDescription ? null : 'clear');
							cancelSave();
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
		backgroundColor: '#36C9C6',
		borderColor: '#2D9B6F',
	},
	toggleButtonClear: {
		backgroundColor: '#777',
		borderColor: '#ddd',
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
		borderRadius: 10,
		marginBottom: 10,
		alignItems: 'center',
		marginRight: 20,
		marginLeft: 20,
	},
	actionButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '500',
		flexWrap: 'wrap',
		textAlign: 'center',
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
