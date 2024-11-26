import { useSelector } from 'react-redux';
import { selectNextForCreation } from '../../../state/tabs/selectors';
import { useAppDispatch } from '../../../state/store';
import { TabType } from '../../../types/state/state';
import { CreateModalsProps } from './createModals/createModalsProps';
import { CreateServiceModal } from './createModals/CreateServiceModal';
import { CreateEnvironmentModal } from './createModals/CreateEnvironmentModal';
import { CreateScriptModal } from './createModals/CreateScriptModal';
import { tabsActions } from '../../../state/tabs/slice';

const modalFromType: Partial<Record<TabType, (props: CreateModalsProps) => JSX.Element>> = {
	service: CreateServiceModal,
	environment: CreateEnvironmentModal,
	script: CreateScriptModal,
};

export function CreateQueueModals() {
	const nextForCreation = useSelector(selectNextForCreation);
	const dispatch = useAppDispatch();
	const defaultFunc = (_props: CreateModalsProps) => <></>;
	const CreateModal = modalFromType[nextForCreation] ?? defaultFunc;
	return (
		<CreateModal
			open={!!nextForCreation}
			closeFunc={() => {
				dispatch(tabsActions.removeFromCreateQueue(nextForCreation));
			}}
		/>
	);
}
