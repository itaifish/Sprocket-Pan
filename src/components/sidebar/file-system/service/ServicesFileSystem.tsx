import { Box, ListDivider } from '@mui/joy';
import { ServiceFileSystem } from './ServiceFileSystem';
import { useSelector } from 'react-redux';
import { FileSystemTrunk } from '../tree/FileSystemTrunk';
import { SearchField } from '@/components/shared/SearchField';
import { ELEMENT_ID } from '@/constants/uiElementIds';
import { selectServices } from '@/state/active/selectors';
import { useAppDispatch } from '@/state/store';
import { selectFilteredNestedIds } from '@/state/tabs/selectors';
import { tabsActions } from '@/state/tabs/slice';

export function ServicesFileSystem() {
	const services = useSelector(selectServices);
	const serviceIdsUnfiltered = Object.values(services).map((srv) => srv.id);
	const serviceIds = useSelector((state) => selectFilteredNestedIds(state, serviceIdsUnfiltered));
	const dispatch = useAppDispatch();

	return (
		<FileSystemTrunk
			id={ELEMENT_ID.sidebar.services}
			header="Services"
			actions={<SearchField onChange={(text) => dispatch(tabsActions.setSearchText(text))} />}
		>
			{serviceIds.map((serviceId) => (
				<Box key={serviceId}>
					<ServiceFileSystem serviceId={serviceId} />
					<ListDivider />
				</Box>
			))}
		</FileSystemTrunk>
	);
}
