import { AreYouSureModal } from '@/components/shared/modals/AreYouSureModal';
import { selectAllItems } from '@/state/active/selectors';
import { deleteEndpoint } from '@/state/active/thunks/endpoints';
import { deleteEnvironmentById } from '@/state/active/thunks/environments';
import { deleteRequest } from '@/state/active/thunks/requests';
import { deleteScriptById } from '@/state/active/thunks/scripts';
import { deleteService } from '@/state/active/thunks/services';
import { useAppDispatch } from '@/state/store';
import { selectNextForDeletion } from '@/state/tabs/selectors';
import { tabsActions } from '@/state/tabs/slice';
import { WorkspaceData } from '@/types/data/workspace';
import { TabTypeWithData } from '@/types/state/state';
import { useSelector } from 'react-redux';

const itemTypes = [
	{ key: 'endpoints', func: deleteEndpoint },
	{ key: 'services', func: deleteService },
	{ key: 'requests', func: deleteRequest },
	{ key: 'scripts', func: deleteScriptById },
	{ key: 'environments', func: deleteEnvironmentById },
] as const;

function getAttributesAndSelectorsForId(id: string, state: Pick<WorkspaceData, `${TabTypeWithData}s`>) {
	const item = itemTypes.find(({ key }) => state[key][id] != null);
	if (item == null) throw new Error('an orphan id got into the delete queue');
	return { name: state[item.key][id].name, func: item.func };
}

export function DeleteQueueModals() {
	const nextForDeletion = useSelector(selectNextForDeletion);
	const dispatch = useAppDispatch();
	const state = useSelector(selectAllItems);
	const { func, name } = nextForDeletion == null ? ({} as any) : getAttributesAndSelectorsForId(nextForDeletion, state);

	const removeDeleteQueueEntry = () => dispatch(tabsActions.removeFromDeleteQueue(nextForDeletion));

	return (
		<AreYouSureModal
			action={`delete '${name}' and all its data`}
			open={nextForDeletion != null}
			closeFunc={removeDeleteQueueEntry}
			actionFunc={() => {
				removeDeleteQueueEntry();
				dispatch(func);
			}}
		/>
	);
}
