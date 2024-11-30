import Checkbox from '@mui/joy/Checkbox';
import { selectEnvironments, selectSecrets, selectSelectedEnvironment } from '../../../state/active/selectors';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../state/store';
import { selectEnvironment, updateEnvironment } from '../../../state/active/slice';
import { Typography } from '@mui/joy';
import { Box } from '@mui/joy';
import { EditableText } from '../../shared/input/EditableText';
import { PanelProps } from '../panels.interface';
import { EditableData } from '../../shared/input/EditableData';

export function EnvironmentPanel({ id }: PanelProps) {
	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const environments = useSelector(selectEnvironments);
	const environment = environments[id];
	const secrets = useSelector(selectSecrets);
	const dispatch = useAppDispatch();

	if (environment == null) {
		return <Typography>No Environment Found</Typography>;
	}

	return (
		<>
			<EditableText
				text={environment.name}
				setText={(newText: string) => dispatch(updateEnvironment({ name: newText, id }))}
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
			<Typography>{environment.linked?.toString()}</Typography>
			<Box sx={{ height: '70vh', pb: '5vh' }}>
				<EditableData
					values={environment.pairs}
					onChange={(pairs) => dispatch(updateEnvironment({ pairs, id }))}
					fullSize={true}
					envPairs={secrets}
				/>
			</Box>
		</>
	);
}
