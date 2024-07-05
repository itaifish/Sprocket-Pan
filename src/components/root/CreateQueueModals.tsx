import { useSelector } from 'react-redux';
import { selectNextForCreation } from '../../state/tabs/selectors';
import { useAppDispatch } from '../../state/store';

export function CreateQueueModals() {
	const nextForCreation = useSelector(selectNextForCreation);
	const dispatch = useAppDispatch();

	return <></>;
}
