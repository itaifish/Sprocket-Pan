import Checkbox from '@mui/joy/Checkbox';
import { selectEnvironments, selectSecrets, selectSelectedEnvironment } from '../../../state/active/selectors';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../state/store';
import { selectEnvironment, updateEnvironment } from '../../../state/active/slice';
import { Stack, Typography } from '@mui/joy';
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
		<Stack gap={2}>
			<EditableText
				sx={{ margin: 'auto' }}
				text={environment.name}
				setText={(newText: string) => dispatch(updateEnvironment({ name: newText, id }))}
				isValidFunc={(text: string) =>
					text.length >= 1 &&
					Object.values(environments)
						.filter((env) => env.id != id)
						.filter((env) => env.name === text).length === 0
				}
				level="h2"
			/>
			<Box sx={{ height: '70vh', pb: '5vh' }}>
				<EditableData
					actions={{
						start: (
							<Checkbox
								sx={{ my: 1 }}
								label="Selected"
								checked={selectedEnvironment === id}
								onChange={() => dispatch(selectEnvironment(selectedEnvironment === id ? undefined : id))}
							/>
						),
					}}
					values={environment.pairs}
					onChange={(pairs) => dispatch(updateEnvironment({ pairs, id }))}
					fullSize
					envPairs={secrets}
				/>
			</Box>
		</Stack>
	);
}
