import { Box } from '@mui/joy';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../state/store';
import { selectSecrets } from '../../../state/active/selectors';
import { KeyValueEditableTable } from '../shared/KeyValueEditableTable';
import { updateSecrets } from '../../../state/active/slice';
import { PanelProps } from '../panels.interface';

export function SecretsPanel({ id }: PanelProps) {
	const secrets = useSelector(selectSecrets);
	const dispatch = useAppDispatch();
	return (
		<Box sx={{ height: '70vh', pb: '5vh' }}>
			<KeyValueEditableTable values={secrets} onChange={(values) => dispatch(updateSecrets(values))} fullSize />
		</Box>
	);
}
