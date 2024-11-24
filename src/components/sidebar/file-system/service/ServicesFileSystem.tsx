import { Box, ListDivider } from '@mui/joy';
import { ServiceFileSystem } from './ServiceFileSystem';
import { useSelector } from 'react-redux';
import { selectServices } from '../../../../state/active/selectors';
import { selectFilteredNestedIds } from '../../../../state/tabs/selectors';
import { useAppDispatch } from '../../../../state/store';
import { setSearchText } from '../../../../state/tabs/slice';
import { SearchField } from '../../../shared/SearchField';
import { FileSystemTrunk } from '../tree/FileSystemTrunk';

export function ServicesFileSystem() {
	const services = useSelector(selectServices);
	const serviceIdsUnfiltered = Object.values(services).map((srv) => srv.id);
	const serviceIds = useSelector((state) => selectFilteredNestedIds(state, serviceIdsUnfiltered));
	const dispatch = useAppDispatch();

	return (
		<FileSystemTrunk header="Services" actions={<SearchField onChange={(text) => dispatch(setSearchText(text))} />}>
			{serviceIds.map((serviceId) => (
				<Box key={serviceId}>
					<ServiceFileSystem serviceId={serviceId} />
					<ListDivider />
				</Box>
			))}
		</FileSystemTrunk>
	);
}
