import { Box } from '@mui/joy';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../state/store';
import { selectSecrets } from '../../../state/active/selectors';
import { updateSecrets } from '../../../state/active/slice';
import { PanelProps } from '../panels.interface';
import { OrderedKeyValueEditableTable } from '../shared/OrderedKeyValueEditableTable';

export function SecretsPanel({ id }: PanelProps) {
	const secrets = useSelector(selectSecrets);
	const dispatch = useAppDispatch();
	return (
		<Box sx={{ height: '70vh', pb: '5vh' }}>
			<OrderedKeyValueEditableTable values={secrets} onChange={(values) => dispatch(updateSecrets(values))} fullSize />
		</Box>
	);
}
