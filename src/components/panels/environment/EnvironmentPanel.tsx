import Checkbox from '@mui/joy/Checkbox';
import { Environment } from '../../../types/application-data/application-data';
import { selectEnvironments, selectSelectedEnvironment } from '../../../state/active/selectors';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../state/store';
import { selectEnvironment, updateEnvironment } from '../../../state/active/slice';
import { Typography } from '@mui/joy';
import { Box } from '@mui/joy';
import { EditableText } from '../../shared/input/EditableText';
import { PanelProps } from '../panels.interface';
import { EnvironmentEditableTable } from '../shared/EnvironmentEditableTable';

export function EnvironmentPanel({ id }: PanelProps) {
	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const environments = useSelector(selectEnvironments);
	const environment = environments[id];
	const dispatch = useAppDispatch();

	function update(values: Partial<Environment>) {
		dispatch(updateEnvironment({ ...values, id: id }));
	}

	if (environment == null) {
		return <Typography>No Environment Found</Typography>;
	}

	return (
		<>
			<EditableText
				text={environment.name}
				setText={(newText: string) => update({ name: newText })}
				isValidFunc={(text: string) =>
					text.length >= 1 &&
					Object.values(environments)
						.filter((env) => env.id != id)
						.filter((env) => env.name === text).length === 0
				}
				isTitle
			/>
			<Checkbox
				label="Selected"
				checked={selectedEnvironment === id}
				onChange={() => dispatch(selectEnvironment(selectedEnvironment === id ? undefined : id))}
			/>
			<Box sx={{ height: '70vh', pb: '5vh' }}>
				<EnvironmentEditableTable environment={environment} setNewEnvironment={update} fullSize={true} />
			</Box>
		</>
	);
}
