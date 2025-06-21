import { Box } from '@mui/joy';
import { useSelector } from 'react-redux';
import { PanelProps } from '../panels.interface';
import { selectSecrets } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { EditableData } from '@/components/shared/input/monaco/EditableData';

export function SecretsPanel({ id }: PanelProps) {
	const secrets = useSelector(selectSecrets);
	const dispatch = useAppDispatch();
	return (
		<Box sx={{ height: '70vh', p: 2 }}>
			<EditableData
				initialValues={secrets}
				onChange={(values) => dispatch(activeActions.setSecrets(values))}
				fullSize
			/>
		</Box>
	);
}
