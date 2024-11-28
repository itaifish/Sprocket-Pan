import { Box } from '@mui/joy';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../state/store';
import { selectSecrets } from '../../../state/active/selectors';
import { updateSecrets } from '../../../state/active/slice';
import { PanelProps } from '../panels.interface';
import { EditableData } from '../../shared/input/EditableData';

export function SecretsPanel({ id }: PanelProps) {
	const secrets = useSelector(selectSecrets);
	const dispatch = useAppDispatch();
	return (
		<Box sx={{ height: '70vh', pb: '5vh' }}>
			<EditableData values={secrets} onChange={(values) => dispatch(updateSecrets(values))} fullSize />
		</Box>
	);
}
