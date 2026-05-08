import { getData } from 'country-list';
import { useState } from 'react';
import { View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const countryItems = getData()
	.map(({ code, name }) => ({ label: name, value: code }))
	.sort((a, b) => a.label.localeCompare(b.label));

interface Props {
	onValueChange: (countryCode: any) => void;
	initialCode?: string;
}

const PickCountry = ({ onValueChange, initialCode = 'US' }: Props) => {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState<string>(initialCode);
	const [items, setItems] = useState(countryItems);

	return (
		<View style={{ zIndex: 1000 }}>
			<DropDownPicker
				open={open}
				value={value}
				items={items}
				setOpen={setOpen}
				setValue={setValue}
				setItems={setItems}
				searchable={true}
				searchPlaceholder='Search countries...'
				listMode='MODAL'
				modalProps={{ animationType: 'slide' }}
				placeholder='Select a country'
				onChangeValue={(val) => {
					if (val) onValueChange(val);
				}}
			/>
		</View>
	);
};

export default PickCountry;
