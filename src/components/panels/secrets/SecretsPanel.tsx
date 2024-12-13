import { Box } from '@mui/joy';
import { useSelector } from 'react-redux';
import { PanelProps } from '../panels.interface';
import { EditableData } from '@/components/shared/input/EditableData';
import { selectSecrets } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';

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
