import { useSelector } from 'react-redux';
import { selectNextForDeletion } from '../../state/tabs/selectors';
import { deleteEnvironmentById } from '../../state/active/thunks/environments';
import { useAppDispatch } from '../../state/store';
import { removeFromDeleteQueue } from '../../state/tabs/slice';
import { selectAllItems } from '../../state/active/selectors';
import { ApplicationData } from '../../types/application-data/application-data';
import { deleteEndpoint } from '../../state/active/thunks/endpoints';
import { deleteService } from '../../state/active/thunks/services';
import { deleteRequest } from '../../state/active/thunks/requests';
import { deleteScriptById } from '../../state/active/thunks/scripts';
import { AreYouSureModal } from '../shared/modals/AreYouSureModal';

function getAttributesAndSelectorsForId(
	id: string,
	state: Pick<ApplicationData, 'endpoints' | 'environments' | 'requests' | 'services' | 'scripts'>,
) {
	// this is messy, there's better ways to do this but I'd like to bring env in alignment with the others first
	if (state.endpoints[id]) {
		return {
			name: state.endpoints[id].name,
			func: deleteEndpoint(id),
		};
	}

	if (state.services[id]) {
		return {
			name: state.services[id].name,
			func: deleteService(id),
		};
	}

	if (state.requests[id]) {
		return {
			name: state.requests[id].name,
			func: deleteRequest(id),
		};
	}

	if (state.scripts[id]) {
		return {
			name: state.scripts[id].name,
			func: deleteScriptById(id),
		};
	}

	if (state.environments[id]) {
		return {
			name: state.environments[id].__name,
			func: deleteEnvironmentById(id),
		};
	}

	throw new Error('an orphan id got into the delete queue');
}

export function QueueModals() {
	const nextForDeletion = useSelector(selectNextForDeletion);
	const dispatch = useAppDispatch();
	const state = useSelector(selectAllItems);
	const { func, name } = nextForDeletion == null ? ({} as any) : getAttributesAndSelectorsForId(nextForDeletion, state);

	const removeDeleteQueueEntry = () => dispatch(removeFromDeleteQueue(nextForDeletion));

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
