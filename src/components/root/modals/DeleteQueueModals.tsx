import { AreYouSureModal } from '@/components/shared/modals/AreYouSureModal';
import { useAppDispatch } from '@/state/store';
import { selectNextForDeletion } from '@/state/ui/selectors';
import { uiActions } from '@/state/ui/slice';
import { extractActions } from '@/state/util';
import { useSelector } from 'react-redux';

export function DeleteQueueModals() {
	const nextForDeletion = useSelector(selectNextForDeletion);
	const dispatch = useAppDispatch();
	const removeDeleteQueueEntry = () => dispatch(uiActions.removeFromDeleteQueue(nextForDeletion));
	const actions = nextForDeletion == null ? null : extractActions(nextForDeletion);

	return (
		<AreYouSureModal
			action={`delete '${actions?.item?.name}' and all its data`}
			open={nextForDeletion != null}
			closeFunc={removeDeleteQueueEntry}
			actionFunc={() => {
				if (actions == null) return;
				dispatch(actions.delete(nextForDeletion));
				removeDeleteQueueEntry();
			}}
		/>
	);
}
