import { Box } from '@mui/joy';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../state/store';
import { selectSecrets } from '../../../state/active/selectors';
import { PanelProps } from '../panels.interface';
import { EditableData } from '../../shared/input/EditableData';
import { activeActions } from '../../../state/active/slice';

export function SecretsPanel({ id }: PanelProps) {
	const secrets = useSelector(selectSecrets);
	const dispatch = useAppDispatch();
	return (
		<Box sx={{ height: '70vh', pb: '5vh' }}>
			<EditableData
				initialValues={secrets}
				onChange={(values) => dispatch(activeActions.updateSecrets(values))}
				fullSize
			/>
		</Box>
	);
}
