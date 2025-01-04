import { AreYouSureModal } from '@/components/shared/modals/AreYouSureModal';
import { selectAllItems } from '@/state/active/selectors';
import { getDefinedItemActions } from '@/state/global/util';
import { useAppDispatch } from '@/state/store';
import { selectNextForDeletion } from '@/state/ui/selectors';
import { uiActions } from '@/state/ui/slice';
import { useSelector } from 'react-redux';

export function DeleteQueueModals() {
	const data = useSelector(selectAllItems);
	const nextForDeletion = useSelector(selectNextForDeletion);
	const dispatch = useAppDispatch();
	const removeDeleteQueueEntry = () => dispatch(uiActions.removeFromDeleteQueue(nextForDeletion));
	const actions = nextForDeletion == null ? null : getDefinedItemActions(data, nextForDeletion);

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
