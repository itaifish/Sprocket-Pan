import { InlineItemName } from '@/components/shared/InlineItemName';
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
	const item = useSelector((state) => actions?.select(state, nextForDeletion));

	return (
		<AreYouSureModal
			action={
				<>
					delete <InlineItemName item={item} /> and all its data
				</>
			}
			open={nextForDeletion != null}
			closeFunc={removeDeleteQueueEntry}
			actionFunc={() => {
				if (actions == null) {
					throw new Error(`delete queue deletion called on id ${nextForDeletion} but a delete action was not present!`);
				}
				dispatch(actions.delete(nextForDeletion));
				removeDeleteQueueEntry();
			}}
		/>
	);
}
